/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  experimental: {
    turbopack: false,
  },
};

export default nextConfig;