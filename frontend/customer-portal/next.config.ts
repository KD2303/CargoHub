import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: 'http://127.0.0.1:4001/admin',
      },
      {
        source: '/admin/:path*',
        destination: 'http://127.0.0.1:4001/admin/:path*',
      },
      {
        source: '/_admin_next/_next/:path*',
        destination: 'http://127.0.0.1:4001/_next/:path*',
      }
    ];
  },
};

export default nextConfig;
