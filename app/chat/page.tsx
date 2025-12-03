"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ChatBot = dynamic(() => import('@/components/ChatBot'), { ssr: false, loading: () => <div /> });

export default function ChatPage() {
  return (
    <div className="min-h-screen flex items-center justify-center from-white to-blue-100">
      <div className="w-full max-w-2xl">
        <Suspense fallback={<div className="text-center p-2">جاري تحميل الشات...</div>}>
          <ChatBot />
        </Suspense>
      </div>
    </div>
  );
}
