import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      { source: "/kannada", destination: "/languages/kannada", permanent: true },
      { source: "/tamil", destination: "/languages/tamil", permanent: true },
      { source: "/telugu", destination: "/languages/telugu", permanent: true },
      { source: "/malayalam", destination: "/languages/malayalam", permanent: true },
      { source: "/hindi", destination: "/languages/hindi", permanent: true },
      { source: "/english", destination: "/languages/english", permanent: true },
    ];
  },
};

export default nextConfig;
