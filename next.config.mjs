/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 🔐 Headers globaux avec CSP
  async headers() {
    // ⚠️ En dev on assouplit un peu "script-src" pour Next HMR
    const isDev = process.env.NODE_ENV !== 'production';

    const csp = [
      "default-src 'self'",
      // autoriser scripts locaux + HMR; éviter les imports externes non nécessaires
      `script-src 'self' ${isDev ? "'unsafe-eval'" : ''} 'wasm-unsafe-eval'`,
      // styles inline (Tailwind, etc.) + Google Fonts CSS si besoin
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // images locales, data: (icônes) et blob: (preview)
      "img-src 'self' data: blob:",
      // fonts google
      "font-src 'self' https://fonts.gstatic.com",
      // connexions API : self, Stripe (checkout), Anthropic (si back appelle en edge), HMR
      "connect-src 'self' https://api.stripe.com https://r.stripe.com https://m.stripe.network https://js.stripe.com https://api.anthropic.com ws://localhost:3000 http://localhost:3000",
      // iframes Stripe
      'frame-src https://js.stripe.com https://hooks.stripe.com',
      // WebWorkers (ton worker sweetspot)
      "worker-src 'self' blob:",
      // (fallback certains navigateurs)
      'child-src blob:',
      // interdictions utiles
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'interest-cohort=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
