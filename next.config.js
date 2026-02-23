/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["next-auth"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
    localPatterns: [
      { pathname: "/uploads/**", search: "" },
    ],
  },
};
module.exports = nextConfig;
