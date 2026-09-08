export async function sendPushNotification(userId: string, message: string) {
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      include_aliases: {
        external_id: [userId],
      },
      include_external_user_ids: [userId],
      contents: { en: message, ar: message },
      name: "ADMIN_REPLY",
    }),
  };

  return fetch("https://onesignal.com/api/v1/notifications", options);
}

export async function sendAdminNotification({
  title,
  message,
  url,
}: {
  title: string;
  message: string;
  url?: string;
}) {
  const adminEmail = process.env.NEXT_PUBLIC_GMAIL || "petereshak11@gmail.com";

  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      // Target admin by external user id or admin tag
      include_aliases: {
        external_id: [adminEmail],
      },
      include_external_user_ids: [adminEmail],
      filters: [
        { field: "tag", key: "is_admin", relation: "=", value: "true" },
        { operator: "OR" },
        { field: "tag", key: "email", relation: "=", value: adminEmail },
      ],
      headings: { en: title, ar: title },
      contents: { en: message, ar: message },
      url: url || "/admin/reviews",
      name: "ADMIN_REVIEW_NOTIFICATION",
    }),
  };

  try {
    const res = await fetch("https://onesignal.com/api/v1/notifications", options);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("OneSignal Admin Notification failed:", error);
    return null;
  }
}
