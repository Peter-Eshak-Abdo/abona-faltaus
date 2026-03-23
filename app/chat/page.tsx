"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ChatBot = dynamic(() => import('@/components/ChatBot'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen text-muted-foreground animate-pulse">جاري تحميل الشات...</div>
});

export default function ChatPage() {
  return (
    <main className="h-dvh w-full bg-slate-50 flex items-center justify-center p-0 md:p-1">
      <div className="w-full h-full max-w-4xl shadow-2xl overflow-hidden md:rounded-2xl border bg-white">
        <Suspense fallback={<div className="flex items-center justify-center h-full">جاري التحميل...</div>}>
          <ChatBot />
        </Suspense>
      </div>
    </main>
  );
}
