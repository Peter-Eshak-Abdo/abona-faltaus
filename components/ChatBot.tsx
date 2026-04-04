"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import DOMPurify from "dompurify";
import { Send, Loader2, Sparkles, Plus, Trash2, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function ChatBot() {
  const endRef = useRef<HTMLDivElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const [convs, setConvs] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  // إدارة الرسائل والـ Loading يدوياً لضمان الاستقرار
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // جلب المحادثات
  const fetchConversations = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setConvs(data);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchConversations(session.user.id);
      }
    };
    initAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchConversations(session.user.id);
    });
    return () => authListener.subscription.unsubscribe();
  }, [fetchConversations]);

  const handleSelect = async (id: string) => {
    setConvId(id);
    setSheetOpen(false);
    setIsLoading(true);
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (msgs) {
      setMessages(msgs.map((m: any) => ({ id: m.id, role: m.role, content: m.content })));
    }
    setIsLoading(false);
  };

  // --- دالة الإرسال اليدوية "المضادة للرصاص" ---
  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading || !user) return;

    setIsLoading(true);
    const userMsg = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      let currentCid = convId;

      // 1. إنشاء محادثة في Supabase لو جديدة
      if (!currentCid) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert([{ user_id: user.id, title: text.slice(0, 40) }])
          .select().single();
        if (newConv) {
          currentCid = newConv.id;
          setConvId(currentCid);
          fetchConversations(user.id);
        }
      }

      // 2. حفظ رسالة المستخدم
      await supabase.from("messages").insert([{ conversation_id: currentCid, role: "user", content: text }]);

      // 3. نداء الـ API يدوياً (Streaming)
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!response.ok) throw new Error("API Error");

      // 4. قراءة الـ Stream وتحديث الـ UI لحظياً
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";

      const aiMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: aiMsgId, role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await (reader?.read() as any);
        if (done) break;

        const chunk = decoder.decode(value);
        // تنظيف الداتا من فورمات Vercel AI (لو الرد بيبدأ بـ 0: أو " )
        const cleanChunk = chunk.replace(/^\d+:"/g, '').replace(/"$/g, '').replace(/\\n/g, '\n');
        aiContent += cleanChunk;

        setMessages((prev) =>
          prev.map(m => m.id === aiMsgId ? { ...m, content: aiContent } : m)
        );
      }

      // 5. حفظ رد الـ AI النهائي في Supabase
      await supabase.from("messages").insert([{ conversation_id: currentCid, role: "assistant", content: aiContent }]);

    } catch (err) {
      console.error("Critical Chat Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-white" dir="rtl">
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-80 p-0 flex flex-col">
          <SheetHeader className="p-4 border-b bg-amber-50">
            <SheetTitle className="text-right text-amber-900 font-bold">المحادثات السابقة</SheetTitle>
            <Button onClick={() => { setMessages([]); setConvId(null); setSheetOpen(false); }} variant="outline" className="w-full mt-2 border-amber-200 text-amber-800">
              <Plus size={16} className="ml-2" /> محادثة جديدة
            </Button>
          </SheetHeader>
          <ScrollArea className="flex-1">
            {convs.map((c) => (
              <div key={c.id} onClick={() => handleSelect(c.id)} className={cn("p-4 border-b cursor-pointer text-right text-sm hover:bg-gray-50 transition-colors", convId === c.id && "bg-amber-100")}>
                {c.title}
              </div>
            ))}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <header className="h-14 flex items-center justify-between px-4 bg-amber-600 text-white shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <span className="font-bold">مساعد اجتماع النسور</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSheetOpen(true)} className="text-white">
          <PanelRight />
        </Button>
      </header>

      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-3xl mx-auto p-4 space-y-6">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex", m.role === "user" ? "justify-start" : "justify-end")}>
                <div className={cn("rounded-2xl px-4 py-2.5 max-w-[85%] text-sm shadow-sm", m.role === "user" ? "bg-amber-500 text-white rounded-tr-none" : "bg-gray-100 text-gray-800 rounded-tl-none")}>
                  {m.role === "user" ? m.content : <div className="prose prose-sm break-words" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(m.content) }} />}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-end p-2">
                <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
              </div>
            )}
            <div ref={endRef} />
          </div>
        </ScrollArea>
      </main>

      <footer className="p-4 border-t bg-white">
        <form onSubmit={onFormSubmit} className="max-w-3xl mx-auto flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={user ? "اكتب سؤالك هنا..." : "يرجى تسجيل الدخول"}
            className="flex-1 min-h-[50px] max-h-[150px] border-amber-100 focus-visible:ring-amber-500 resize-none"
            disabled={!user || isLoading}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onFormSubmit(e); } }}
          />
          <Button type="submit" size="icon" className="h-[50px] w-[50px] bg-amber-600 hover:bg-amber-700 shrink-0" disabled={!input.trim() || isLoading || !user}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
