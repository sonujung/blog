import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.hashnode.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      // Hashnode 리다이렉션은 마이그레이션 완료 후 추가
    ];
  },
};

export default nextConfig;
