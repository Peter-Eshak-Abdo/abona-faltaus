import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase"; // Import the new function
import { sendDailyVerseNotification } from "./onesignal";

export interface NotificationSchedule {
  id: string;
  time: string;
  enabled: boolean;
  daysOfWeek: number[]; // 0-6, Sunday=0
  createdAt: Date;
}

// Check if current time matches any schedule
export const checkAndSendScheduledNotifications = async () => {
  const { db } = getFirebaseServices(); // Initialize Firebase services
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Get all enabled schedules
    const schedulesQuery = query(
      collection(db, "notificationSchedules"),
      where("enabled", "==", true)
    );

    const schedulesSnapshot = await getDocs(schedulesQuery);
    const schedules = schedulesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as NotificationSchedule[];

    // Check each schedule
    for (const schedule of schedules) {
      const [scheduleHour, scheduleMinute] = schedule.time.split(':').map(Number);

      // Check if current time matches schedule time
      if (currentHour === scheduleHour && currentMinute === scheduleMinute) {
        // Check if current day is in the schedule
        if (schedule.daysOfWeek.includes(currentDay)) {
          console.log(`Sending scheduled notification for schedule ${schedule.id}`);

          // Get all users who have notifications enabled
          const usersQuery = query(
            collection(db, "users"),
            where("notificationsEnabled", "==", true)
          );

          const usersSnapshot = await getDocs(usersQuery);

          // Send notification to each user
          for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            try {
              await sendDailyVerseNotification(userId);
              console.log(`Notification sent to user ${userId}`);
            } catch (error) {
              console.error(`Failed to send notification to user ${userId}:`, error);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking scheduled notifications:", error);
  }
};

// Vercel Cron function (to be called by Vercel's cron service)
export async function handler() {
  await checkAndSendScheduledNotifications();
  return { statusCode: 200, body: "Scheduled notifications checked" };
}
