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
  // Disable source maps in production to prevent source map errors
  productionBrowserSourceMaps: false,
  // Optimize for better performance
  swcMinify: true,
  // Handle source map issues in development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = false
    }
    return config
  },
}

export default nextConfig
