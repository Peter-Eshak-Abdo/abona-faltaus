// // components/PwaManager.tsx
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function PwaManager() {
  const [showPwaMessage, setShowPwaMessage] = useState(false);

  useEffect(() => {
    const pwaClosed = localStorage.getItem("pwa_message_closed");
    const isPwa = window.matchMedia("(display-mode: standalone)").matches;

    if (!pwaClosed && !isPwa) {
      setShowPwaMessage(true);
    }
  }, []);

  const closePwaMessage = () => {
    localStorage.setItem("pwa_message_closed", "true");
    setShowPwaMessage(false);
  };

  return (
    <AnimatePresence>
      {showPwaMessage && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed bottom-1 left-1/2 -translate-x-1/2 z-100 bg-blue-600 text-white px-1 py-0.5 rounded-full shadow-lg flex items-center gap-1"
        >
          <span className="text-sm">أضف التطبيق للشاشة الرئيسية لتجربة أفضل</span>
          <button onClick={closePwaMessage} className="p-1 bg-white/20 rounded-full hover:bg-white/30 transition">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
