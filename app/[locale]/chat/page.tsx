"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Sparkles, MessageSquare } from "lucide-react";
import IconGeneratorClient from "@/components/icon-generator/IconGeneratorClient";

const ChatBot = dynamic(() => import('@/components/ChatBot'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen text-muted-foreground animate-pulse">جاري تحميل الشات...</div>
});

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "icons">("chat");

  return (
    <main className="h-dvh w-full flex flex-col p-0 md:p-0.5 bg-neutral-950 text-neutral-100" dir="rtl">
      {/* Top Switcher Bar: Chat vs Icon Generator */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-0.5 py-0.5 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-0.5 py-0.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
              activeTab === "chat"
                ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
            }`}
          >
            <MessageSquare size={16} />
            <span>المساعد الذكي (الشات)</span>
          </button>

          <button
            onClick={() => setActiveTab("icons")}
            className={`px-0.5 py-0.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
              activeTab === "icons"
                ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
            }`}
          >
            <Sparkles size={16} />
            <span>توليد الأيقونات والصور 🎨</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full h-full shadow-2xl overflow-hidden md:rounded-b-2xl border border-t-0 border-neutral-800">
        {activeTab === "chat" ? (
          <Suspense fallback={<div className="flex items-center justify-center h-full">جاري التحميل...</div>}>
            <ChatBot />
          </Suspense>
        ) : (
          <div className="h-full overflow-y-auto bg-neutral-950">
            <IconGeneratorClient />
          </div>
        )}
      </div>
    </main>
  );
}
