"use client";
import ChatBot from "@/components/ChatBot";

export default function ChatPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-100">
      <div className="w-full max-w-2xl">
        <ChatBot />
      </div>
    </div>
  );
}
