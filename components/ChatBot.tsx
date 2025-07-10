"use client";

import { useState, useRef, useEffect, SetStateAction } from "react";
// import { Button, Input, Card } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface ChatMessage { role: "user" | "assistant"; content: string; }

export default function ChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMsg] }),
    });
    const { reply } = await res.json();
    setMessages((m) => [...m, { role: "assistant", content: reply.content }]);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="p-4 flex flex-col h-full">
      <div className="flex-1 overflow-auto space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg ${m.role === "user" ? "bg-blue-100 self-end" : "bg-gray-100 self-start"}`}
          >
            {m.content}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="mt-2 flex">
        <Input
          value={input}
          onChange={(e: { target: { value: SetStateAction<string>; }; }) => setInput(e.target.value)}
          onKeyDown={(e: { key: string; }) => e.key === "Enter" && sendMessage()}
          placeholder="اكتب سؤالك..."
          className="flex-1"
        />
        <Button onClick={sendMessage} className="ml-2">إرسال</Button>
      </div>
    </Card>
  );
}
