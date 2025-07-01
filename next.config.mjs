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
  devIndicators: {
    position: 'top-right',
  }
}

export default nextConfig
