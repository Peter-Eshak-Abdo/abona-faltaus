"use client";
import { useState, useRef, useEffect } from "react";
import DOMPurify from "dompurify";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBot() {
  const [mode, setMode] = useState<"keyword" | "concept">("keyword");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMsg], mode }),
    });
    const { reply } = await res.json();
    setMessages((m) => [...m, { role: "assistant", content: reply.content }]);
    setLoading(false);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="p-4 flex flex-col h-full border rounded-xl shadow bg-white">
      {/* أزرار التبديل بين الوضعين */}
      <div className="flex space-x-2 mb-2">
        <button
          onClick={() => setMode("keyword")}
          className={`px-4 py-2 rounded ${mode === "keyword" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          type="button"
        >
          بحث بالكلمة
        </button>
        <button
          onClick={() => setMode("concept")}
          className={`px-4 py-2 rounded ${mode === "concept" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          type="button"
        >
          بحث بالمفهوم
        </button>
      </div>

      {/* الرسائل */}
      <div className="flex-1 overflow-auto space-y-2">
        {messages.map((m, i) =>
          m.role === "assistant" ? (
            <div
              key={i}
              className="max-w-xs md:max-w-md p-3 my-2 rounded-2xl shadow self-start bg-gray-200 text-black rounded-bl-none mr-auto"
              style={{ wordBreak: "break-word" }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(m.content),
              }}
            />
          ) : (
            <div
              key={i}
              className="max-w-xs md:max-w-md p-3 my-2 rounded-2xl shadow self-end bg-blue-500 text-white rounded-br-none text-right ml-auto"
              style={{ wordBreak: "break-word" }}
            >
              {m.content}
            </div>
          )
        )}

        {loading && (
          <div className="flex justify-end">
            <div className="bg-blue-500 text-white p-2 rounded-lg self-end ml-2 animate-pulse">
              جاري التحميل...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* إدخال الرسالة */}
      <div className="mt-2 flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="اكتب سؤالك..."
          className="flex-1 border rounded-lg p-2"
          title="اكتب سؤالك"
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
          type="button"
          title="ارسال"
        >
          إرسال
        </button>
      </div>
    </div>
  );
}
