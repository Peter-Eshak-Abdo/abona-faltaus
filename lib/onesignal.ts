import { doc, updateDoc, getDoc, onSnapshot } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase";
import { loveVerses } from "./daily-verses";

declare global {
  interface Window {
    OneSignal?: {
      init: (config: {
        appId: string;
        safari_web_id: string;
        notifyButton: { enable: boolean };
        allowLocalhostAsSecureOrigin: boolean;
      }) => Promise<void>;
      // Add index signature to allow additional properties
      [x: string]: unknown;
      login?: (externalId: string) => Promise<void>;
      logout?: () => Promise<void>;
      User?: {
        getExternalId?: () => Promise<string>;
        PushSubscription?: {
          id: string | null;
        };
      };
      Notifications?: {
        permission: boolean;
        requestPermission: () => Promise<boolean>;
      };
    };
  }
}
export const sendDailyVerseNotification = async (userId: string) => {
  try {
    // Get random verse from love verses
    const randomVerse =
      loveVerses[Math.floor(Math.random() * loveVerses.length)];
    const verseText = `${randomVerse.text} (${randomVerse.reference})`;

    // Send notification via OneSignal REST API using external_user_id
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        include_external_user_ids: [userId], // Use external_user_id instead of player_ids
        headings: { ar: "آية اليوم" },
        contents: { ar: verseText },
        data: { type: "daily_verse" },
        ttl: 86400, // 1 day
      }),
    });

    if (!response.ok) {
      console.error("Failed to send notification:", response.statusText);
    } else {
      console.log("Notification sent successfully");
      // Increment unread count when notification is sent successfully
      await incrementUnreadCount(userId);
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

export const requestNotificationPermission = async () => {
  if (typeof window === "undefined" || !window.OneSignal) return false;

  try {
    const permission = await window.OneSignal.Notifications!.requestPermission();
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

export const getNotificationPermission = () => {
  if (typeof window === "undefined" || !window.OneSignal) return false;
  return window.OneSignal.Notifications!.permission;
};

export const getPlayerId = () => {
  if (
    typeof window === "undefined" ||
    !window.OneSignal ||
    !window.OneSignal.User ||
    !window.OneSignal.User.PushSubscription
  )
    return null;
  return window.OneSignal.User.PushSubscription.id || null;
};

// Badge functionality for unread notifications
export const updateBadge = async (count: number) => {
  if ('setAppBadge' in navigator) {
    try {
      await navigator.setAppBadge(count);
    } catch (e) {
      console.error("Badging failed", e);
    }
  } else {
    // fallback: update page title
    document.title = count > 0 ? `(${count}) أبونا فلتاؤس تفاحة` : "أبونا فلتاؤس تفاحة";
  }
};

// Get unread notifications count from Firestore
export const getUnreadNotificationsCount = async (userId: string): Promise<number> => {
  try {
    const { db } = getFirebaseServices();
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return 0;

    const userData = userDoc.data();
    return userData?.unreadNotificationsCount || 0;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};

// Update unread notifications count in Firestore
export const updateUnreadNotificationsCount = async (userId: string, count: number) => {
  try {
    const { db } = getFirebaseServices();
    await updateDoc(doc(db, "users", userId), {
      unreadNotificationsCount: count,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error("Error updating unread count:", error);
  }
};

// Listen for real-time updates to unread count
export const listenToUnreadCount = (userId: string, callback: (count: number) => void) => {
  const { db } = getFirebaseServices();
  const userRef = doc(db, "users", userId);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const count = data?.unreadNotificationsCount || 0;
      callback(count);
      updateBadge(count);
    }
  });
};

// Mark notifications as read
export const markNotificationsAsRead = async (userId: string) => {
  await updateUnreadNotificationsCount(userId, 0);
  updateBadge(0);
};

// Increment unread count when sending notification
export const incrementUnreadCount = async (userId: string) => {
  const currentCount = await getUnreadNotificationsCount(userId);
  await updateUnreadNotificationsCount(userId, currentCount + 1);
};
