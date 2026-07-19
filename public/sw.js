// public/sw.js
if (!self.define) {
  let e,
    a = {};
  const c = (c, i) => (
    (c = new URL(c + ".js", i).href),
    a[c] ||
      new Promise((a) => {
        if ("document" in self) {
          const e = document.createElement("script");
          ((e.src = c), (e.onload = a), document.head.appendChild(e));
        } else ((e = c), importScripts(c), a());
      }).then(() => {
        let e = a[c];
        if (!e) throw new Error(`Module ${c} didn’t register its module`);
        return e;
      })
  );
  self.define = (i, s) => {
    const n =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (a[n]) return;
    let r = {};
    const d = (e) => c(e, n),
      b = { module: { uri: n }, exports: r, require: d };
    a[n] = Promise.all(i.map((e) => b[e] || d(e))).then((e) => (s(...e), r));
  };
}

define(["./workbox-c21402de"], function (e) {
  "use strict";
  importScripts();
  self.skipWaiting();
  e.clientsClaim();

  // أزلنا كل الملفات من الـ Precache عشان ما يحملش حاجة تلقائي أول ما يفتح
  e.precacheAndRoute([], {
    ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  });
  e.cleanupOutdatedCaches();

  // سيتم تحميل الملفات فقط عند الطلب (تصفح المستخدم) أو عند الضغط على زر تحميل الكل
  e.registerRoute(
    "/",
    new e.NetworkFirst({
      cacheName: "start-url",
      plugins: [
        {
          cacheWillUpdate: async ({ response: e }) =>
            e && "opaqueredirect" === e.type
              ? new Response(e.body, {
                  status: 200,
                  statusText: "OK",
                  headers: e.headers,
                })
              : e,
        },
      ],
    }),
    "GET",
  );

  e.registerRoute(
    /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/,
    new e.CacheFirst({
      cacheName: "google-fonts",
      plugins: [
        new e.ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 31536e3 }),
      ],
    }),
    "GET",
  );
  e.registerRoute(
    /\/api\/.*/,
    new e.NetworkOnly({ cacheName: "api-calls", plugins: [] }),
    "GET",
  );

  e.registerRoute(
    ({ request: e }) => "navigate" === e.mode,
    new e.NetworkFirst({
      cacheName: "pages-cache",
      plugins: [
        new e.ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 31536e3 }),
        new e.CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
    "GET",
  );

  e.registerRoute(
    /\.(?:png|jpg|jpeg|svg|gif|ico|webp|avif|mp3|wav|ogg|m4a|json|pdf)$/,
    new e.CacheFirst({
      cacheName: "static-assets-cache",
      plugins: [
        new e.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 31536e3 }),
      ],
    }),
    "GET",
  );

  e.registerRoute(
    /_next\/static\/.+/,
    new e.CacheFirst({
      cacheName: "next-static-cache",
      plugins: [
        new e.ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 31536e3 }),
      ],
    }),
    "GET",
  );

  e.registerRoute(
    /https:\/\/(?:firebasestorage\.googleapis\.com|lh3\.googleusercontent\.com)\/.*/,
    new e.StaleWhileRevalidate({
      cacheName: "remote-images",
      plugins: [
        new e.ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 31536e3 }),
      ],
    }),
    "GET",
  );

  self.__WB_DISABLE_DEV_LOGS = !0;

  // الاستماع لطلب تحميل كل الملفات للأوفلاين يدوياً
  self.addEventListener("message", async (event) => {
    if (event.data && event.data.type === "CACHE_ALL_FILES") {
      const cache = await caches.open("static-assets-cache");
      // قائمة بأهم الملفات التي سيتم تحميلها يدوياً
      const filesToCache = [
        "/offline.html",
        "/images/logo.webp",
        "/images/eagle.webp",
        // يمكنك وضع مسارات الـ JSON والألحان الرئيسية هنا
      ];
      await cache.addAll(filesToCache);
    }
  });
});
