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
  },
  // Increase server action body size limit for image uploads (5MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb'
    }
  }
}

export default nextConfig
