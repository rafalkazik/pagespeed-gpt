/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_KEY: process.env.OPEN_AI_API_KEY,
  },
};

module.exports = nextConfig;
