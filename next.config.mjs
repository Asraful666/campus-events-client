/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    agentFeedback: true,
  },

  cacheComponents: true,

  partialPrefetching: true,

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  async rewrites() {
    const backendURL = (
      process.env.API_SERVER_URL || "http://localhost:8000"
    ).replace(/\/+$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${backendURL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;