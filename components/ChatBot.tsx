"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import DOMPurify from "dompurify";
import { Send, Loader2, Sparkles, Plus, Trash2, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// مكون اللودينج اللزيز (Typing Indicator)
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex space-x-1 space-x-reverse p-1 bg-gray-100 rounded-2xl rounded-tl-none w-fit shadow-sm"
  >
    <motion.div className="w-2 h-2 bg-gray-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
    <motion.div className="w-2 h-2 bg-gray-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
    <motion.div className="w-2 h-2 bg-gray-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
  </motion.div>
);

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchConversations(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchConversations(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
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
    <div className="flex flex-col h-full w-full max-w-full bg-transparent p-0.5" dir="rtl">
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-90 p-0 flex flex-col">
          <SheetHeader className="p-1 border-b bg-amber-50">
            <SheetTitle className="text-right text-amber-900 font-bold pb-1">المحادثات السابقة</SheetTitle>
              <Button onClick={() => { setMessages([]); setConvId(null); setSheetOpen(false); }} variant="outline" className="w-full mt-1 border-amber-200 text-amber-800 float-end">
                <Plus size={5} className="ml-1" /> محادثة جديدة
              </Button>
          </SheetHeader>
          <ScrollArea className="flex-1">
            {convs.map((c) => (
              <div key={c.id} onClick={() => handleSelect(c.id)} className={cn("p-1 border-b cursor-pointer text-right text-sm hover:bg-gray-50 transition-colors", convId === c.id && "bg-amber-100")}>
                {c.title}
              </div>
            ))}
          </ScrollArea>
          {/* <SheetDescription className="sr-only">
            المحادثات كلها
          </SheetDescription> */}
        </SheetContent>
      </Sheet>

      <header className="h-6 flex items-center justify-between px-1 bg-amber-600 text-white shrink-0">
        <div className="flex items-center gap-1 ">
          <Sparkles className="h-3 w-3" />
          <span className="font-bold">مساعد ابونا فلتاؤس</span>
        </div>
        <Button variant="ghost" size="smallIcon" onClick={() => setSheetOpen(true)} className="text-white ">
          <PanelRight className="h-3 w-3" />
        </Button>
      </header>

      <main className="flex-1 overflow-hidden" dir="rtl">
        <ScrollArea className="h-full" dir="rtl">
          <div className="mx-auto p-1 space-y-1" dir="rtl">
            <AnimatePresence>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  layout
                  className={cn("flex", m.role === "user" ? "justify-start" : "justify-end")}
                >
                  <div className={cn(
                    "rounded-2xl p-1 max-w-[85%] text-sm shadow-sm md:text-base leading-relaxed",
                    m.role === "user"
                      ? "bg-amber-600 text-white rounded-tr-none"
                      : "bg-gray-100 text-gray-900 rounded-tl-none border border-gray-200"
                  )}>
                    {m.role === "user"
                      ? m.content
                      : <div className="prose prose-sm md:prose-base prose-amber wrap-break-words" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(m.content) }} />
                    }
                  </div>
                </motion.div>
              ))}

              {/* ظهور اللودينج */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex justify-end w-full">
                  <TypingIndicator />
                </div>
              )}
            </AnimatePresence>
            <div ref={endRef} />
          </div>
        </ScrollArea>
      </main>

      <footer className="p-1 border-t bg-white">
        <form onSubmit={onFormSubmit} className="max-w-3xl mx-auto flex gap-1 items-center">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={user ? "اكتب سؤالك هنا..." : "يرجى تسجيل الدخول"}
            className="flex-1 min-h-[50px] max-h-[150px] border-amber-100 focus-visible:ring-amber-500 resize-none"
            disabled={!user || isLoading}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onFormSubmit(e); } }}
          />
          <Button type="submit" size="smallIcon" className="h-4.5 w-4.5 bg-amber-600 hover:bg-amber-700 shrink-0" disabled={!input.trim() || isLoading || !user}>
            <Send className="h-2 w-2" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
