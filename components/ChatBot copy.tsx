"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react"; // استيراد Message كـ Type فقط
import { supabase } from "@/lib/supabase";
import DOMPurify from "dompurify";
import { Send, Loader2, Sparkles, Plus, Trash2, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DefaultChatTransport } from "ai";
import { cn } from "@/lib/utils";

// تعريف الأنواع لضمان عدم وجود أخطاء في الـ Build
interface Conversation {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
}

export default function ChatBot() {
  const endRef = useRef<HTMLDivElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [user, setUser] = useState<any>(null);
  const [chatInput, setChatInput] = useState("");

  // استخدام useChat مع API مباشرة لضمان ظهور append
  const { messages, sendMessage, setMessages, status, append } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onFinish: async (message: any) => {
      if (user && convId) {
        await supabase.from("messages").insert([
          {
            conversation_id: convId,
            role: "assistant",
            content: message.content,
          },
        ]);
      }
    },
  }) as any;

  const isLoading = status === "streaming" || status === "submitted";

  const fetchConversations = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) setConvs(data as Conversation[]);
  }, []);

  // حل مشكلة الـ Auth: مراقبة حالة الجلسة لحظياً
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchConversations(session.user.id);
      }
    };
    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: { user: { id: string; }; }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchConversations(session.user.id);
    });

    return () => authListener.subscription.unsubscribe();
  }, [fetchConversations]);

  const handleNew = () => {
    setMessages([]);
    setChatInput("");
    setConvId(null);
    setSheetOpen(false);
  };

  const handleSelect = async (id: string) => {
    setConvId(id);
    setSheetOpen(false);
    const { data: msgs, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (!error && msgs) {
      setMessages(msgs.map((m: { id: any; role: any; content: any; }) => ({ id: m.id, role: m.role, content: m.content })));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    if (!error) {
      if (id === convId) handleNew();
      if (user) fetchConversations(user.id);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = chatInput.trim();
    if (!content || isLoading || !user) return;

    setChatInput("");
    let currentCid = convId;

    try {
      if (!currentCid) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert([{ user_id: user.id, title: content.slice(0, 40) }])
          .select().single();
        if (newConv) {
          currentCid = newConv.id;
          setConvId(currentCid);
          fetchConversations(user.id);
        }
      }

      await supabase.from("messages").insert([
        { conversation_id: currentCid, role: "user", content }
      ]);

      // استدعاء append بشكل صريح
      await append({ role: "user", content });
    } catch (err) {
      console.error("Error in handleSend:", err);
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-white" dir="rtl">
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-72 flex flex-col p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-right">سجل المحادثات</SheetTitle>
            <Button onClick={handleNew} variant="outline" className="w-full mt-2 gap-2 border-amber-200 text-amber-700 hover:bg-amber-50">
              <Plus size={16} /> محادثة جديدة
            </Button>
          </SheetHeader>
          <ScrollArea className="flex-1">
            {convs.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "p-3 cursor-pointer hover:bg-amber-50 flex justify-between items-center group border-b transition-colors",
                  convId === c.id && "bg-amber-100/50"
                )}
                onClick={() => handleSelect(c.id)}
              >
                <span className="text-sm truncate flex-1 ml-2 text-right text-gray-700">{c.title}</span>
                <Trash2
                  size={14}
                  className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600"
                  onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                />
              </div>
            ))}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <header className="flex items-center justify-between p-3 bg-amber-600 text-white shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles size={18} />
          <h1 className="font-bold text-sm md:text-base">مساعد اجتماع النسور</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSheetOpen(true)} className="text-white hover:bg-amber-700">
          <PanelRight size={20} />
        </Button>
      </header>

      <main className="flex-1 overflow-hidden relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <ScrollArea className="h-full p-4">
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.map((m: { role: string; content: string | Node; }, idx: number) => (
              <div key={idx} className={cn("flex animate-in fade-in slide-in-from-bottom-2", m.role === "user" ? "justify-start" : "justify-end")}>
                <div className={cn(
                  "max-w-[85%] p-3 rounded-2xl shadow-sm text-sm leading-relaxed",
                  m.role === "user" ? "bg-amber-500 text-white rounded-tr-none" : "bg-white border border-amber-100 text-gray-800 rounded-tl-none"
                )}>
                  <div
                    className="prose prose-sm max-w-none text-right prose-p:my-1 prose-headings:text-amber-700"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(m.content) }}
                  />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-end p-2">
                <Loader2 className="animate-spin text-amber-500" size={20} />
              </div>
            )}
            <div ref={endRef} />
          </div>
        </ScrollArea>
      </main>

      <footer className="p-4 border-t bg-white/80 backdrop-blur-sm">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto flex gap-2">
          <Textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={user ? "اكتب سؤالك الروحي هنا..." : "برجاء تسجيل الدخول..."}
            className="flex-1 min-h-[44px] max-h-32 resize-none border-amber-200 focus-visible:ring-amber-500"
            disabled={!user || isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <Button
            type="submit"
            disabled={isLoading || !chatInput.trim() || !user}
            className="bg-amber-600 hover:bg-amber-700 h-11 w-11 p-0 rounded-xl transition-all active:scale-95"
          >
            <Send size={18} className="ml-1" />
          </Button>
        </form>
        {!user && <p className="text-center text-xs text-red-500 mt-2">يجب تسجيل الدخول لحفظ المحادثات</p>}
      </footer>
    </div>
  );
}
