/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'vercel.app', 'vercel.com'],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig 