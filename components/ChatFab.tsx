"use client";
import { useRouter } from "next/navigation";

export default function ChatFab() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/chat")}
      className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all"
      aria-label="افتح الشات"
    >
      {/* يمكنك وضع أي أيقونة شات هنا */}
      <svg width="32" height="32" fill="currentColor"><circle cx="16" cy="16" r="16" /></svg>
    </button>
  );
}
