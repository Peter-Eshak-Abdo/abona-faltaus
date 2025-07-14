"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ChatFab() {
  const router = useRouter();
  return (
    <motion.button
      onClick={() => router.push("/chat")}
      // className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all border-4 border-white"
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all border-4 border-white"
      aria-label="افتح الشات"
      type="button"
      title="افتح الشات"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      style={{ boxShadow: "0 0 20px 2px #60a5fa" }}
    >
      <Image
        src="/images/chatbot.png"
        alt="ChatBot"
        width={40}
        height={40}
        className="rounded-full"
      />
    </motion.button>
  );
}
