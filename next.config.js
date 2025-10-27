/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/compta',
  assetPrefix: '/compta/',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
