import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  // @blocknote/server-util imports react createContext at module top; mark it
  // external so it runs in node, not the RSC/Server Actions client bundle.
  serverExternalPackages: ["@blocknote/server-util"],
};

export default nextConfig;
