/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    outputFileTracingRoot: undefined,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://edubridge-backend-fcj0.onrender.com/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
