import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "ioredis",
    "firebase-admin",
    "cloudinary",
    "@prisma/client",
  ],
};

export default nextConfig;