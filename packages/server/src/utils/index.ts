export * from './responses';
export * from './uuid5';

/**
 * Parses a Cookie header string into an object of key-value pairs.
 * @param cookieHeader The Cookie header string
 * @returns An object mapping cookie names to values
 */
export function parseCookies(cookieHeader: string = ''): Record<string, string> {
  return cookieHeader.split(';').reduce((acc, part) => {
    const [key, ...v] = part.trim().split('=');
    if (key) acc[key] = decodeURIComponent(v.join('='));
    return acc;
  }, {} as Record<string, string>);
}

export interface CookieOptions {
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  maxAge?: number;
  expires?: Date | string;
}

/**
 * Serializes a cookie name, value, and options into a Set-Cookie header string.
 */
export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): string {
  let cookie = `${name}=${encodeURIComponent(value)}`;
  if (options.path) cookie += `; Path=${options.path}`;
  if (options.httpOnly) cookie += '; HttpOnly';
  if (options.secure) cookie += '; Secure';
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
  if (options.maxAge !== undefined) cookie += `; Max-Age=${options.maxAge}`;
  if (options.expires) cookie += `; Expires=${
    typeof options.expires === 'string' ? options.expires : options.expires.toUTCString()
  }`;
  return cookie;
}
