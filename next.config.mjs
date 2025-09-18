/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Replit environment configuration
  experimental: {
    allowedHosts: true,
  },
  // Configure for development server
  async rewrites() {
    return []
  },
}

export default nextConfig