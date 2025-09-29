// middleware.ts (Edge runtime)
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const isDev = process.env.NODE_ENV !== 'production';
// Note: the full Content-Security-Policy (including a per-request nonce in prod)
// is constructed inside the middleware function where a nonce and the response
// object are available.

function genNonce(): string {
  const rand = crypto.getRandomValues(new Uint8Array(16));
  return Buffer.from(rand).toString('base64');
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Block /dev-login in prod
  if (!isDev && pathname === '/dev-login') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Legacy rewrite: /api/sweetspot/* -> /api/sweet-spot/*
  if (pathname.startsWith('/api/sweetspot/')) {
    url.pathname = pathname.replace('/api/sweetspot/', '/api/sweet-spot/');
    return NextResponse.rewrite(url);
  }

  // Let API routes pass without CSP/nonces (optional)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Page requests
  const nonce = genNonce();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-csp-nonce', nonce);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set('x-csp-nonce', nonce);

  // CSP: relaxed in dev (eval/ws/etc.), strict nonce in prod
  const csp = isDev
    ? [
        "default-src 'self'",
        // dev: allow inline/eval for Next.js tooling + HMR workers/blob + Segment if enabled
        `script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.segment.com`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob:",
        "font-src 'self' https://fonts.gstatic.com data:",
        // allow HMR/eventsource/ws + local APIs
        "connect-src 'self' http://localhost:* ws://localhost:* https://*.supabase.co https://*.supabase.in https://api.segment.io https://cdn.segment.com",
        "frame-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
    : [
        "default-src 'self'",
        // prod: strict nonce; 'strict-dynamic' lets boot script allow Next chunks
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob:",
        "font-src 'self' https://fonts.gstatic.com data:",
        "connect-src 'self' https://*.supabase.co https://*.supabase.in",
        "frame-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ');

  res.headers.set('Content-Security-Policy', csp);

  // Supabase SSR cookie sync (non-API pages)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieEncoding: 'raw',
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );
  await supabase.auth.getSession();

  return res;
}

export const config = {
  // keep static/images exempt; everything else gets CSP
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

