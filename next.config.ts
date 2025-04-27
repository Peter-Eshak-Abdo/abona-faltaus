// import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /\/al7an\/.*$/,  // هذه Regex لتحديد صفحات اللحن
      // urlPattern: /\/al7an\/.*$/,  // هذه Regex لتحديد صفحات اللحن
      handler: 'NetworkFirst',
      options: {
        cacheName: 'al7an-cache',
        expiration: {
          maxEntries: 999999,
          maxAgeSeconds: 157680000, // 5 سنوات
        },
      },
    },
    {
      urlPattern: /\/bible\/.*$/,  // هذه Regex لتحديد صفحات الإنجيل
      handler: 'NetworkFirst',
      options: {
        cacheName: 'bible-cache',
        expiration: {
          maxEntries: 9999999,
          maxAgeSeconds: 157680000,
        },
      },
    },
  ],
});

export default nextConfig;
// const nextConfig = {
//   // output: 'export',
//   /* config options here */
// };

// export default nextConfig;
