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

const CACHE_NAME = "abona-cache-v1";
const urlsToCache = ["/", "/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() =>
      caches
        .match(event.request)
        .then((res) => res || caches.match("/offline.html"))
    )
  );
});
