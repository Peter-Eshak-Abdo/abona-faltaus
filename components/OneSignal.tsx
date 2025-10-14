"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

declare global {
  interface Window {
    OneSignalDeferred?: ((OneSignal: typeof import('onesignal-web-sdk')) => void)[];
    OneSignal?: typeof import('onesignal-web-sdk');
  }
}

export default function OneSignal() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Initialize OneSignal
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal) {
      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
        safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID!,
        notifyButton: {
          enable: true,
        },
        // Enable external user ID for targeting
        allowLocalhostAsSecureOrigin: process.env.NODE_ENV === "development",
      });

      // Listen to auth state changes
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // User is signed in, set external user ID
          try {
            await OneSignal.login(user.uid);
            console.log("OneSignal user logged in:", user.uid);

            // External user ID is set, no need to store player ID separately
            console.log("OneSignal external user ID set:", user.uid);
          } catch (error) {
            console.error("Error setting OneSignal user:", error);
          }
        } else {
          // User is signed out, logout from OneSignal
          try {
            await OneSignal.logout();
            console.log("OneSignal user logged out");
          } catch (error) {
            console.error("Error logging out from OneSignal:", error);
          }
        }
      });

      return () => unsubscribe();
    });
  }, []);

  return null; // This component doesn't render anything
}
