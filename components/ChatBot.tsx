"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState, useCallback } from "react";
import DOMPurify from "dompurify";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function ChatBot() {
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState("");

  // ✅ AI SDK v5/6: transport بدل api، وسendMessage بدل append
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [inputValue]);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue("");
    // ✅ sendMessage في v5 بياخد { text } مش { role, content }
    sendMessage({ text });
  }, [inputValue, isLoading, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  // ✅ في v5 الـ messages بتبقى parts مش content مباشرة
  const getMessageText = (m: any): string => {
    // لو في parts (v5 format)
    if (m.parts) {
      return m.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("");
    }
    // fallback لـ content القديم
    return m.content ?? "";
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-amber-50/40 to-white font-[Tajawal,sans-serif]">

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-amber-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 shrink-0">
          <Sparkles size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 leading-tight">المساعد الروحي</p>
          <p className="text-[10px] text-gray-400">
            {isLoading
              ? <span className="text-amber-500 animate-pulse">يكتب...</span>
              : "متاح الآن"
            }
          </p>
        </div>
      </div>
{/* Messages */}
      <ScrollArea className="flex-1 px-3 py-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-52 gap-3 text-center select-none">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">أهلاً بك في المساعد الروحي</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                اسأل أي سؤال روحي أو كتابي وسأجيبك
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {messages.map((m: any) => (
            <div
              key={m.id}
              className={cn(
                "flex gap-2 items-end",
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white mb-0.5",
                m.role === "user" ? "bg-blue-500" : "bg-amber-500"
              )}>
                {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>

              {/* Bubble */}
              <div className={cn(
                "max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm",
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
              )}>
                {m.role === "user" ? (
                  <p className="whitespace-pre-wrap text-right">{m.content}</p>
                ) : (
                  <div
                    className="prose prose-sm max-w-none text-right [&_h3]:text-amber-700 [&_h3]:font-bold [&_strong]:text-gray-900 [&_p]:mb-2 [&_p:last-child]:mb-0"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(m.content) }}
                  />
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-2 items-end">
              <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0">
                <Bot size={14} />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              حدث خطأ، يرجى المحاولة مرة أخرى
            </div>
          )}
        </div>

        <div ref={endRef} className="h-2" />
      </ScrollArea>

      {/* Input bar */}
      <form
        onSubmit={handleFormSubmit}
        className="px-3 py-2 border-t border-gray-100 bg-white flex gap-2 items-end"
      >
        <Textarea
          ref={textareaRef}
          value={inputValue}
          // onChange={handleInputChange}
          onChange={(e) => setInputValue(e.target.value)}  // ✅ بدل handleInputChange مباشرة
          onKeyDown={handleKeyDown}
          placeholder="اسأل سؤالاً روحياً..."
          rows={1}
          dir="rtl"
          className="flex-1 resize-none min-h-[42px] max-h-[120px] text-sm text-right rounded-2xl border-gray-200 focus-visible:ring-1 focus-visible:ring-amber-400 py-2.5 px-3 leading-relaxed bg-gray-50"
        />
        <Button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          size="icon"
          className="h-[42px] w-[42px] rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 shrink-0 shadow-sm transition-colors"
        >
          {isLoading
            ? <Loader2 className="animate-spin" size={18} />
            : <Send size={18} className="rotate-180" />
          }
        </Button>
      </form>
    </div>
  );
}
