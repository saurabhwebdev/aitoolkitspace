/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'cdn2.futurepedia.io',
      'futurepedia.io',
      'cdn.futurepedia.io',
      'aitoolkit-public.s3.amazonaws.com',
      'raw.githubusercontent.com',
      'githubusercontent.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'storage.googleapis.com',
      'res.cloudinary.com'
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 