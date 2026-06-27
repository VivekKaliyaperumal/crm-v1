import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The shared package lives one level up (monorepo); let Turbopack resolve it.
  turbopack: {
    root: path.join(process.cwd(), '..'),
  },
  transpilePackages: ['@smartagro-crm/shared'],
};

export default nextConfig;
