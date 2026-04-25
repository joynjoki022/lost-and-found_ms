
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
    qualities: [100, 75, 95], // Add 95 to allowed qualities
  },
}

module.exports = nextConfig
