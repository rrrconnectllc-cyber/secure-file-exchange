/** @type {import('next').NextConfig} */
const apiOrigin = process.env.VERCEL ? 'https://api.sfxlegal.org' : 'http://localhost:3002';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['cdn.example.com'],
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/v1/:path*',
          destination: `${apiOrigin}/api/v1/:path*`,
        },
      ],
    };
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
