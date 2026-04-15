import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  // Permanent redirects for routes that moved when we reorganised the
  // resources area. Keep these around so external links and search
  // engines find the new home.
  async redirects() {
    return [
      {
        source: "/sermons",
        destination: "/resources/messages",
        permanent: true,
      },
      {
        source: "/sermons/:slug",
        destination: "/resources/messages/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
