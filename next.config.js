/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'condominio-supa-academic.yzqq8i.easypanel.host',
      },
    ],
  },
};

module.exports = nextConfig;
