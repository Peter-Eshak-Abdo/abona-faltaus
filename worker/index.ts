// worker/index.ts
const ctx: any = self;

// 1. استدعاء OneSignal SDK Worker لضمان استلام إشعارات OneSignal الموجهة
try {
  if (typeof ctx.importScripts === "function") {
    ctx.importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
  }
} catch (e) {
  console.warn("Could not import OneSignal worker in SW:", e);
}

// 2. معالج Push احتياطي لمنع ظهور رسالة Chrome: "This site has been updated in the background"
ctx.addEventListener("push", (event: any) => {
  if (!event.data) {
    event.waitUntil(
      ctx.registration.showNotification("أبونا فلتاؤس", {
        body: "بركة جديدة وتأمل روحي متاح لك اليوم في التطبيق.",
        icon: "/images/icons/android-chrome-192x192.png",
        badge: "/images/icons/favicon-32x32.png",
      })
    );
    return;
  }

  try {
    const data = event.data.json();
    const title =
      data.title ||
      data.headings?.ar ||
      data.headings?.en ||
      "أبونا فلتاؤس — آية اليوم";
    const body =
      data.body ||
      data.contents?.ar ||
      data.contents?.en ||
      data.alert ||
      "اضغط لقراءة آية وتأمل اليوم.";

    // دعم أزرار الإجراءات في إشعارات الويب (تفسير الآية، مشاركة الآية)
    const actions: any[] = [];
    const actionUrls: Record<string, string> = {};

    const rawButtons = data.web_buttons || data.actions || [];
    if (Array.isArray(rawButtons)) {
      rawButtons.forEach((btn: any) => {
        if (btn.id && btn.text) {
          actions.push({
            action: btn.id,
            title: btn.text,
            icon: btn.icon,
          });
          if (btn.url) {
            actionUrls[btn.id] = btn.url;
          }
        }
      });
    }

    event.waitUntil(
      ctx.registration.showNotification(title, {
        body,
        icon: "/images/icons/android-chrome-192x192.png",
        badge: "/images/icons/favicon-32x32.png",
        actions: actions.length > 0 ? actions : undefined,
        data: {
          url: data.custom?.u || data.url || "/",
          actionUrls,
        },
      })
    );
  } catch (e) {
    const text = event.data.text();
    event.waitUntil(
      ctx.registration.showNotification("أبونا فلتاؤس", {
        body: text || "تأمل وآية اليوم جاهزة لك.",
        icon: "/images/icons/android-chrome-192x192.png",
        badge: "/images/icons/favicon-32x32.png",
      })
    );
  }
});

// 3. فتح الرابط عند النقر على الإشعار أو أزرار الإجراءات
ctx.addEventListener("notificationclick", (event: any) => {
  event.notification.close();

  let urlToOpen = "/";
  const notificationData = event.notification.data;

  if (typeof notificationData === "string") {
    urlToOpen = notificationData;
  } else if (notificationData && typeof notificationData === "object") {
    urlToOpen = notificationData.url || "/";
    // إذا كان النقر على زر مخصص (مثل: interpret-verse أو share-verse)
    if (event.action && notificationData.actionUrls?.[event.action]) {
      urlToOpen = notificationData.actionUrls[event.action];
    }
  }

  event.waitUntil(
    ctx.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList: any[]) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (ctx.clients.openWindow) {
        return ctx.clients.openWindow(urlToOpen);
      }
    })
  );
});

// 4. تفعيل فوري للـ Service Worker عند تثبيت تحديث جديد
ctx.addEventListener("install", () => {
  ctx.skipWaiting();
});

// 5. استلام التحكم بجميع الصفحات فوراً وحذف الكاشات القديمة المتضاربة
ctx.addEventListener("activate", (event: any) => {
  event.waitUntil(
    (async () => {
      await ctx.clients.claim();
    })()
  );
});

// 6. استقبال أوامر الرسائل (مثل تخطي الانتظار أو التحميل المسبق)
ctx.addEventListener("message", (event: any) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    ctx.skipWaiting();
  }
});

export {};
