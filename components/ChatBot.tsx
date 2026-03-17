"use client";
import { useState, useRef, useEffect } from "react";
import DOMPurify from "dompurify";
import { Send, User, Bot, Loader2 } from "lucide-react"; // أيقونات جميلة
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBot() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!res.ok) throw new Error("فشل الاتصال بالسيرفر");

      const data = await res.json();
      if (data.reply) {
        setMessages((m) => [...m, { role: "assistant", content: data.reply.content }]);
      }
    } catch (err: any) {
      setMessages((m) => [...m, { role: "assistant", content: `<b>خطأ:</b> ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // التمرير التلقائي لأسفل عند وصول رسالة جديدة
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <Card className="flex flex-col h-full border-none rounded-none shadow-none">
      {/* رأس الشات */}
      <CardHeader className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-10 p-1">
        <CardTitle className="text-xl font-bold text-blue-700 flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          مساعدك الروحي
        </CardTitle>
      </CardHeader>

      {/* منطقة الرسائل */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-1">
          <div className="space-y-1 pb-1">
            {messages.length === 0 && (
              <div className="text-center py-2 text-muted-foreground italic">
                ابدأ بكتابة سؤالك الروحي هنا...
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-1 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <Avatar className="w-8 h-8 border">
                  {m.role === "user" ? (
                    <AvatarFallback className="bg-blue-100 text-blue-700"><User size={18} /></AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-slate-100 text-slate-700"><Bot size={18} /></AvatarFallback>
                  )}
                </Avatar>

                <div
                  className={`max-w-[85%] md:max-w-[75%] p-1 rounded-2xl shadow-sm border ${m.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-slate-50 text-slate-900 rounded-tl-none prose-sm sm:prose"
                    }`}
                  style={{ wordBreak: "break-word", lineHeight: "1.6" }}
                  dangerouslySetInnerHTML={{
                    __html: m.role === "assistant" ? DOMPurify.sanitize(m.content) : m.content,
                  }}
                />
              </div>
            ))}

            {loading && (
              <div className="flex gap-1">
                <Avatar className="w-8 h-8 border animate-spin-slow">
                  <AvatarFallback><Loader2 className="animate-spin" size={18} /></AvatarFallback>
                </Avatar>
                <div className="bg-slate-100 p-1 rounded-2xl rounded-tl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-.3s]" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-.5s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* منطقة الإدخال */}
      <CardFooter className="p-1 border-t bg-slate-50/50">
        <form
          className="flex w-full items-center gap-1"
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسأل عن آية أو موضوع روحي..."
            className="flex-1 bg-white h-12 rounded-full px-1 shadow-inner focus-visible:ring-blue-500"
          />
          <Button
            disabled={loading || !input.trim()}
            size="icon"
            className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 transition-all shrink-0"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} className="mr-0.5" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
