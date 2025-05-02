import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(reg => console.log("✅ SW registered", reg.scope))
        .catch(err => console.error("❌ SW failed:", err));
    }
  }, []);

  return null;
}
