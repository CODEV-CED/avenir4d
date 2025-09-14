import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 'frame-src https://www.google.com https://maps.google.com;',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
