import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // 强制将所有日志输出到 stdout/stderr
  onError: (err: unknown) => {
    console.error('Next.js Error:', err);
  },
};

export default nextConfig;
