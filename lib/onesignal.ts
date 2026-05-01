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
      include_external_user_ids: [userId], // نستخدم معرف المستخدم في سوبابيس
      contents: { en: message, ar: message },
      name: "ADMIN_REPLY",
    }),
  };

  return fetch("https://onesignal.com/api/v1/notifications", options);
}
