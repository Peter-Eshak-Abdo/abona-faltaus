import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // تعطيل في وضع التطوير

  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,

  workboxOptions: {
    disableDevLogs: true,
    // globPatterns: [
    //   "**/*.{js,css,html,png,jpg,jpeg,svg,ico,webp,json,woff2}", // تحميل كل أنواع الملفات دي فوراً
    // ],
    // زيادة المساحة المسموح بتخزينها (تجنب مشاكل الملفات الكبيرة)
    maximumFileSizeToCacheInBytes: 150 * 1024 * 1024, // 150 ميجا لكل ملف كحد أقصى
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /\/api\/.*/,
        handler: "NetworkOnly", // الـ API لا يُحفظ في الكاش عشان البيانات تكون طازجة
        options: {
          cacheName: "api-calls",
        },
      },
      // قاعدة مهمة جداً لصفحات الموقع نفسه (App Router)
      {
        // استراتيجية الصفحات: حاول تجيب من النت، لو مفيش هات من الكاش
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst", // حاول تجيب الصفحة من النت، لو مفيش هات من الكاش
        options: {
          cacheName: "pages-cache",
          expiration: { maxEntries: 100, maxAgeSeconds: 365 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern:
          /\.(?:png|jpg|jpeg|svg|gif|ico|webp|avif|mp3|wav|ogg|m4a|json|pdf)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets-cache",
          expiration: { maxEntries: 200, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /_next\/static\/.+/,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static-cache",
          expiration: { maxEntries: 100, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
      {
        // الصور والملفات الخارجية (مثل Firebase)
        urlPattern:
          /https:\/\/(?:firebasestorage\.googleapis\.com|lh3\.googleusercontent\.com)\/.*/,
        handler: "StaleWhileRevalidate", // يعرض الكاش ويحدثه في الخلفية
        options: {
          cacheName: "remote-images",
          expiration: { maxEntries: 100, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /^https:\/\/archive\.org\/download\/.*/,
        handler: "CacheFirst", // اسحب من الكاش أولاً لأن الألحان مش هتتغير
        options: {
          cacheName: "archive-audio-cache",
          expiration: {
            maxEntries: 500, // عدد الألحان القصوى
            maxAgeSeconds: 60 * 60 * 24 * 365 * 5, // سنة كاملة 5 سنوات عشان الألحان مش هتتغير
          },
          cacheableResponse: {
            statuses: [0, 200], // 0 مهمة جداً لروابط الـ CORS الخارجية
          },
          rangeRequests: true, // مهم جداً لملفات الصوت عشان تقدر تقدم وترجع في اللحن
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      { protocol: "https", hostname: "archive.org" }, // ضيف أرشيف هنا كمان
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*).(jpg|jpeg|png|webp|avif|svg)$",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
