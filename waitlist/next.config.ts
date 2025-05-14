import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true, // only disables TypeScript build errors
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ This is VALID for ESLint only
  },
}

export default nextConfig
