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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M8 2a6 6 0 0 0-4.472 10.03c-.195.26-.453.568-.708.885-.255.317-.51.634-.708.885A.5.5 0 0 0 4 15h8a.5.5 0 0 0 .396-.8c-.198-.251-.453-.568-.708-.885-.255-.317-.513-.625-.708-.885A6 6 0 0 0 8 2zm0 1a5 5 0 0 1 4.472 7.03.5.5 0 0 0-.104.326c0 .13.053.26.104.326A5 5 0 1 1 8 3z" />
      </svg>
    </button>
  );
}
