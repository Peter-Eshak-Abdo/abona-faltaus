// import { useEffect } from "react";

// const CACHE_NAME = "abona-cache-v1";
// const urlsToCache = ["/", "/offline.html"];

// self.addEventListener("install", (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
//   );
// });

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     fetch(event.request).catch(() =>
//       caches
//         .match(event.request)
//         .then((res) => res || caches.match("/offline.html"))
//     )
//   );
// });

// const ServiceWorkerComponent = () => {
//   useEffect(() => {
//     if ("serviceWorker" in navigator) {
//       navigator.serviceWorker
//         .register("/sw.js")
//         .then((reg) => console.log("SW registered", reg.scope))
//         .catch((err) => console.error("SW failed", err));
//     }
//   }, []);

//   return null;
// };

// export default ServiceWorkerComponent;

const CACHE_NAME = "abona-faltaus-cache-v2.6.0";
const OFFLINE_URL = ["/", "/offline.html"];
const FILES_TO_CACHE = [
  OFFLINE_URL,
  "/al7an/لحن_البركة_(تين_أوأوشت).mp3",
  "/al7an/لحن(الهوس_الثالث)آسمو_ابشويس.mp3",
  "/al7an/لحن_تين_ثينو_الكبير.mp3",
  "/al7an/لحن_تينين.mp3",
  "/al7an/لحن_سيموتى.mp3",
  "/ar_svd.json",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     fetch(event.request).catch(() =>
//       caches
//         .match(event.request)
//         .then((res) => res || caches.match("/offline.html"))
//     )
//   );
// });
