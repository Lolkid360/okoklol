/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@radix-ui/react-form",
    "@radix-ui/react-label",
    "@radix-ui/react-aspect-ratio",
    "lucide-react"
  ],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
};

export default nextConfig;
