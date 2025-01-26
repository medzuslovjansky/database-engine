export class RPMThrottler {
  #capacity: number;       // The bucket capacity: max tokens we can hold
  #refillRate: number;     // Tokens to add per millisecond
  #maxConcurrency: number; // Optional concurrency limit

  //==== Bucket State ====
  #tokens: number;         // Current number of tokens in the bucket
  #lastRefill: number;     // Timestamp (ms) of last refill

  //==== Concurrency State ====
  #activeCount = 0;        // How many tasks are currently running

  //==== Task Queue ====
  #queue: Array<{
    run: () => void;
    reject: (reason?: any) => void;
  }> = [];

  /**
   * @param maxRequestsPerMinute  e.g. 60 means 1 request per second on average
   * @param maxConcurrency        e.g. 5 means up to 5 tasks in parallel
   */
  constructor(maxRequestsPerMinute: number, maxConcurrency: number = Infinity) {
    if (maxRequestsPerMinute <= 0) {
      throw new Error("maxRequestsPerMinute must be > 0");
    }
    if (maxConcurrency <= 0) {
      throw new Error("maxConcurrency must be > 0");
    }

    this.#maxConcurrency = maxConcurrency;

    // Token bucket parameters
    this.#capacity = maxRequestsPerMinute;             // 1 token per request
    this.#tokens = this.#capacity;                     // start "full"
    this.#refillRate = maxRequestsPerMinute / 60000;   // tokens per millisecond
    this.#lastRefill = Date.now();
  }

  /**
   * Enqueues a task to be rate-limited + concurrency-limited.
   * Returns a promise that resolves or rejects with the task’s result.
   */
  public execute<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // We'll wrap the user’s task in a small function
      // that we can call once we have a token AND concurrency is available.
      const run = async () => {
        try {
          this.#activeCount++;
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          this.#activeCount--;
          // After finishing, try to process more queued tasks
          this.#processQueue();
        }
      };

      // Add to our queue
      this.#queue.push({ run, reject });
      // Attempt to run tasks immediately if possible
      this.#processQueue();
    });
  }

  /**
   * Internal method that tries to process as many tasks in the queue
   * as possible, respecting both the token bucket limit and concurrency limit.
   */
  #processQueue() {
    this.#refillTokens();

    // While we have both tokens available and concurrency room, run tasks
    while (
      this.#queue.length > 0 &&
      this.#tokens >= 1 &&
      this.#activeCount < this.#maxConcurrency
    ) {
      this.#tokens--;
      const { run } = this.#queue.shift()!;
      run();  // start the task
    }

    // If there are still tasks waiting, but we ran out of tokens,
    // schedule a timer to wake up as soon as we get 1 new token.
    if (this.#queue.length > 0 && this.#activeCount < this.#maxConcurrency) {
      if (this.#tokens < 1) {
        const nextTokenIn = this.#timeUntilNextToken();
        // We only set a timer if there isn't one pending.
        // A simple way is to check if we have no active tasks running or so,
        // but you can also store a boolean to track "scheduled timer" if needed.
        if (nextTokenIn > 0) {
          setTimeout(() => this.#processQueue(), nextTokenIn);
        } else {
          // If nextTokenIn <= 0, we are effectively ready now.
          // But to avoid a busy loop, just do a microtask:
          queueMicrotask(() => this.#processQueue());
        }
      }
    }
  }

  /**
   * Refill the token bucket based on how much time has passed since our last refill.
   */
  #refillTokens() {
    const now = Date.now();
    const elapsed = now - this.#lastRefill;
    if (elapsed <= 0) return;

    // How many tokens to add
    const tokensToAdd = elapsed * this.#refillRate;
    this.#tokens = Math.min(this.#capacity, this.#tokens + tokensToAdd);
    this.#lastRefill = now;
  }

  /**
   * Returns how many milliseconds we need to wait until we have at least 1 token.
   * If we already have >=1 token, this returns 0 (meaning no wait needed).
   */
  #timeUntilNextToken(): number {
    if (this.#tokens >= 1) {
      return 0;
    }
    // tokens < 1 => how far are we from having exactly 1 token?
    const needed = 1 - this.#tokens;
    // time = tokens needed / rate
    return Math.ceil(needed / this.#refillRate);
  }
}
