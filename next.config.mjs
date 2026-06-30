/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/privacy-policy.html",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/terms-service.html",
        destination: "/terms-service",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/privacy-policy",
        destination: "/privacy-policy.html",
      },
      {
        source: "/terms-service",
        destination: "/terms-service.html",
      },
      {
        source: "/terms-of-service",
        destination: "/terms-service.html",
      },
    ];
  },
};

export default nextConfig;
