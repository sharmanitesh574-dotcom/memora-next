/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API calls to Express backend during development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/:path*`,
      },
    ]
  },

  // Image optimization for memory attachments
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'memora-4eaj.onrender.com',
      },
    ],
  },
}

export default nextConfig
