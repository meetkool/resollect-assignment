/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';
    
    return [
      {
        source: '/api/:path*',
        destination: isProd 
          ? 'https://resollect-assignment-254j.onrender.com/api/:path*' 
          : 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 