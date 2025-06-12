import crypto from 'node:crypto';

import type { Pepper } from '@auth/core';

export interface SHA256PepperOptions {
  readonly secret: string;
}

export class SHA256Pepper implements Pepper {
  private readonly secret: string;

  constructor(options: Readonly<SHA256PepperOptions>) {
    this.secret = options.secret;
  }

  pepper(...strings: string[]): string {
    const data = [...strings, this.secret].join('.');
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
