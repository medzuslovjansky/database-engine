import { Router } from 'itty-router';
import { errorResponse, jsonResponse } from '../utils/responses';
import { serializeCookie } from '../utils';

// Google OAuth2 token endpoint
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

// --- Types for request bodies ---
export interface GoogleAuthCodeRequest {
  code: string;
  code_verifier: string;
  redirect_uri: string;
}

export interface GoogleRefreshTokenRequest {
  refresh_token?: string; // now optional, since we prefer cookie
}

// Google token response type
export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
  [key: string]: any; // allow extra fields for forward compatibility
}

// Helper to set refresh_token cookie
function setRefreshTokenCookie(refresh_token: string | undefined) {
  if (!refresh_token) return undefined;
  // Only send cookie if we have a refresh_token
  return `refresh_token=${refresh_token}; HttpOnly; Secure; Path=/api/auth/refresh-token; SameSite=Strict; Max-Age=2592000`;
}

// Helper to clear refresh_token cookie
function clearRefreshTokenCookie() {
  return 'refresh_token=; HttpOnly; Secure; Path=/api/auth/refresh-token; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
}

// Helper to generate PKCE code_verifier and code_challenge
async function generatePKCE() {
  // Generate a random 32-byte code_verifier
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const code_verifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  // SHA-256 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(code_verifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const code_challenge = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return { code_verifier, code_challenge };
}

export function registerAuthRoutes(router: ReturnType<typeof Router>) {
  // GET /api/auth/google/login
  // Redirects the user to Google's OAuth 2.0 authorization endpoint
  router.get('/api/auth/google/login', async (request: Request, env) => {
    const url = new URL(request.url);
    // Default redirect_uri to /api/auth/google/callback on the current origin
    const redirect_uri = url.searchParams.get('redirect_uri') || `${url.origin}/api/auth/google/callback`;
    const { code_verifier, code_challenge } = await generatePKCE();
    const isProd = env.NODE_ENV === 'production'; // or use your own flag
    // Store code_verifier in a secure, HTTP-only cookie for the callback
    const pkceCookie = serializeCookie('pkce_verifier', code_verifier, {
      httpOnly: true,
      path: '/api/auth/google/callback',
      maxAge: 300,
      secure: isProd, // only secure in prod
      sameSite: isProd ? 'Strict' : 'Lax',
    });

    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      code_challenge,
      code_challenge_method: 'S256',
    });

    const redirectResponse = Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, 302);
    const headers = new Headers(redirectResponse.headers);
    headers.set('Set-Cookie', pkceCookie);
    return new Response(null, {
      status: 302,
      headers,
    });
  });

  // GET /api/auth/google/callback
  router.get('/api/auth/google/callback', async (request: Request, env) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    // Use the same default as in login
    const redirect_uri = `${url.origin}/api/auth/google/callback`;

    if (!code) {
      return errorResponse('Missing code in callback', 400);
    }

    // Retrieve code_verifier from cookie
    const cookieHeader = request.headers.get('Cookie') || '';
    const pkceMatch = cookieHeader.match(/pkce_verifier=([^;]+)/);
    const code_verifier = pkceMatch ? decodeURIComponent(pkceMatch[1]) : undefined;
    if (!code_verifier) {
      return errorResponse('Missing PKCE code_verifier in cookie', 400);
    }

    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET, // Only needed for web apps, not SPA
      code,
      redirect_uri,
      grant_type: 'authorization_code',
      code_verifier,
    });

    const googleRes = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const tokens: GoogleTokenResponse = await googleRes.json();
    if (!googleRes.ok) {
      return errorResponse('Failed to exchange code: ' + JSON.stringify(tokens), 400);
    }
    // Set refresh_token cookie if present
    const setCookie = tokens.refresh_token
      ? serializeCookie('refresh_token', tokens.refresh_token, {
          httpOnly: true,
          secure: true,
          path: '/api/v1/auth/refresh-token',
          sameSite: 'Strict',
          maxAge: 2592000,
        })
      : undefined;
    return new Response(JSON.stringify(tokens), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...(setCookie ? { 'Set-Cookie': setCookie } : {})
      }
    });
  });

  // POST /api/auth/refresh-token
  router.post('/api/auth/refresh-token', async (request: Request, env) => {
    try {
      // Try to get refresh_token from cookie first
      const cookie = request.headers.get('Cookie') || '';
      const match = cookie.match(/refresh_token=([^;]+)/);
      const refresh_token = match ? decodeURIComponent(match[1]) : undefined;
      // Fallback: allow refresh_token in body for non-browser clients
      let token = refresh_token;
      if (!token) {
        const body = (await request.json()) as GoogleRefreshTokenRequest;
        token = body.refresh_token;
      }
      if (!token) {
        return errorResponse('Missing refresh_token', 400);
      }
      const params = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET, // Only needed for web apps, not SPA
        refresh_token: token,
        grant_type: 'refresh_token',
      });
      const googleRes = await fetch(GOOGLE_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const tokens: GoogleTokenResponse = await googleRes.json();
      if (!googleRes.ok) {
        return errorResponse('Failed to refresh token', 400);
      }
      // If Google returns a new refresh_token, update the cookie
      const setCookie = setRefreshTokenCookie(tokens.refresh_token);
      return new Response(JSON.stringify(tokens), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...(setCookie ? { 'Set-Cookie': setCookie } : {})
        }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return errorResponse(`Internal error: ${message}`, 500);
    }
  });

  // POST /api/auth/logout
  router.post('/api/auth/logout', async () => {
    // Clear the refresh_token cookie
    return new Response(null, {
      status: 204,
      headers: {
        'Set-Cookie': clearRefreshTokenCookie()
      }
    });
  });
}
