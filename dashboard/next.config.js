/** @type {import('next').NextConfig} */
const apiUrl = process.env.API_GATEWAY_URL || "http://localhost:3000";
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiUrl}/:path*` },
    ];
  },
};

module.exports = nextConfig;
