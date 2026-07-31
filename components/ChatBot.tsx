"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import DOMPurify from "dompurify";
import { Send, Loader2, Sparkles, Plus, UserCircle, Trash2, PanelRight, BookOpen, HeartPulse, ScrollText, Mic, Paperclip } from "lucide-react";
// import { Send, Loader2, Sparkles, Plus, Trash2, PanelRight, Mic, AttachFile, MenuBook, AutoAwesome, HistoryEdu } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Button } from "react-day-picker";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import TextareaAutosize from "react-textarea-autosize";

// --- الألوان والخطوط (مستوحاة من تصميم Stitch الجديد) ---
// يمكنك إضافة هذه الألوان لملف tailwind.config.js الخاص بك، أو استخدام فئات الألوان التقريبية كما فعلنا هنا لتسهيل النقل المباشر.
// الألوان المستخدمة في التصميم:
// primary: '#4a0012' (نبيتي غامق)
// primary-container: '#6b1124' (نبيتي فاتح)
// secondary-fixed: '#ffe088' (ذهبي)
// surface-container: '#f0eded' (رمادي فاتح جداً للمربعات)

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-1 p-1 bg-[#f0eded] rounded-full w-fit shadow-sm border border-[#dcc0c1]/20 mt-1"
  >
    <motion.div className="w-2 h-2 bg-[#4a0012]/40 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
    <motion.div className="w-2 h-2 bg-[#4a0012]/40 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
    <motion.div className="w-2 h-2 bg-[#4a0012]/40 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
  </motion.div>
);

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  updated_at: string;
}

export default function ChatBot() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const [convs, setConvs] = useState<any[]>([]);
  // const [user, setUser] = useState<any>(null);

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
      if (session?.user) {
        setUser({
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || "",
          avatar_url: session.user.user_metadata?.avatar_url || null,
          email: session.user.email || "",
          updated_at: session.user.updated_at || "",
        });
        fetchConversations(session.user.id);
      } else {
        setUser(null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || "",
          avatar_url: session.user.user_metadata?.avatar_url || null,
          email: session.user.email || "",
          updated_at: session.user.updated_at || "",
        });
        fetchConversations(session.user.id);
      } else {
        setUser(null);
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

  const handleSuggestionClick = (suggestion: string) => { setInput(suggestion); };

  const handleMicClick = () => { alert("ميزة التسجيل الصوتي ستتوفر قريباً!"); };
  const handleAttachmentClick = () => { alert("ميزة إرفاق الملفات ستتوفر قريباً!"); };

  return (
    // الحاوية الرئيسية (شاشة كاملة)
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-[#fcf9f8]" dir="rtl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* --- Sidebar المحادثات (Sheet) --- */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-20 p-0 flex flex-col">
          <SheetHeader className="p-1 border-b bg-amber-50">
            <SheetTitle className="text-right text-amber-900 font-bold pb-1">المحادثات السابقة</SheetTitle>
            <Button onClick={() => { setMessages([]); setConvId(null); setSheetOpen(false); }} className="w-full mt-1 border-amber-200 text-amber-800 float-end">
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

      {/* --- Header المحادثة --- */}
      <div className="flex-none border-b border-[#dcc0c1]/30 bg-[#f6f3f2]/80 backdrop-blur-md flex items-center justify-between z-10 shadow-2xl">
        <div className="flex items-center gap-1">
            <button onClick={() => setSheetOpen(true)} className="w-3 h-3 flex items-center justify-center rounded-full text-[#564243] hover:bg-[#e5e2e1] transition-colors" title="القائمة">
              <PanelRight size={18} />
            </button>
          <div className="relative">
            {/* صورة افتراضية لأبونا فلتاؤس (استبدل المسار بصورتك الحقيقية) */}
            {/* <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-[#4a0012]/20 flex items-center justify-center overflow-hidden"> */}
            <div className="w-3 h-3 rounded-full overflow-hidden bg-white relative flex items-center justify-center">
              {/* <span className="text-xl">📿</span> */}
              {user?.avatar_url ? (
                <Image src={user.avatar_url} alt={user.full_name} fill className="object-cover" sizes="auto" />
              ) : (
                <UserCircle className="w-5 h-5 text-stone-300" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-1 h-1 bg-[#ffe088] rounded-full border-2 border-[#fcf9f8]"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-[#1b1b1c]" style={{ fontFamily: "'Libre Caslon Text', serif" }}>شات أبونا فلتاؤس</h1>
            <span className="text-xs text-[#564243] flex items-center gap-1">
              <span className="w-0.5 h-0.5 rounded-full bg-[#ffe088] animate-pulse"></span>
              متصل الآن
            </span>
          </div>
        </div>
        <button className="w-4 h-4 rounded-full flex items-center justify-center text-[#564243] hover:bg-[#e5e2e1] transition-colors" title="مسح المحادثة" onClick={() => setMessages([])}>
          <Trash2 size={16} />
        </button>
      </div>

      {/* --- منطقة الرسائل --- */}
      <main className="flex-1 overflow-y-auto px-1 md:px-2 py-0.5 flex flex-col gap-1 relative z-10" id="chat-messages">
        {/* خلفية مزخرفة شفافة (اختياري) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[-1] opacity-30 mix-blend-multiply">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#ffe088]/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 -left-5 w-18 h-18 bg-[#4a0012]/10 rounded-full blur-3xl"></div>
        </div>

        <AnimatePresence>
          {messages.length === 0 && (
            // رسالة ترحيب أولية إذا كانت المحادثة فارغة
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-0.5 w-full md:w-4/5 max-w-3xl self-start">
              <div className="bg-[#f0eded] rounded-t-3xl rounded-br-3xl rounded-bl-lg p-0.5 shadow-sm border border-[#ffdadb]/30 relative">
                <p className="text-[16px] text-[#1b1b1c] leading-relaxed">
                  سلام ونعمة يا ابني. كيف يمكنني مساعدتك اليوم؟ أنا هنا للإجابة على أسئلتك الروحية، ومشاركتك أقوال القديسين، أو الصلاة معك.
                </p>
              </div>
            </motion.div>
          )}

          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} layout
              className={cn("flex items-end gap-0.5 w-full md:w-4/5", m.role === "user" ? "self-end justify-end max-w-2xl" : "self-start max-w-3xl")}
            >
              {/* صورة الـ AI (تظهر فقط في رسائل الـ AI وعلى الشاشات الكبيرة) */}
              {m.role !== "user" && (
                <div className="w-2 h-2 rounded-full bg-gray-200 hidden md:flex items-center justify-center opacity-70 shrink-0">
                  <span className="text-sm">📿</span>
                </div>
              )}

              <div className={cn(
                "p-0.5 shadow-sm relative",
                m.role === "user"
                  ? "bg-[#4a0012] text-white rounded-t-3xl rounded-bl-3xl rounded-br-lg shadow-md"
                  : "bg-[#f0eded] text-[#1b1b1c] rounded-t-3xl rounded-br-3xl rounded-bl-lg border border-[#dcc0c1]/40"
              )}>
                {m.role === "user" ? (
                  <p className="text-[16px] leading-relaxed">{m.content}</p>
                ) : (
                  <div className="prose prose-sm md:prose-base prose-p:leading-relaxed max-w-none prose-strong:text-[#4a0012] prose-blockquote:border-r-4 prose-blockquote:border-[#ffe088] prose-blockquote:bg-white/50 prose-blockquote:p-2 prose-blockquote:rounded-l-lg" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(m.content) }} />
                )}
              </div>
            </motion.div>
          ))}

          {/* ظهور اللودينج */}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <TypingIndicator />
          )}
        </AnimatePresence>
        <div ref={endRef} />
      </main>

      {/* --- Quick Suggestions (Chips) --- */}
      <div className="flex-none p-0.5 overflow-x-auto whitespace-nowrap hide-scrollbar border-t border-[#dcc0c1]/10 bg-linear-to-t from-[#fcf9f8] to-transparent z-10">
        <div className="flex gap-0.5">
          {[
            // { label: "أقوال القديسين", icon: BookOpen },
            // { label: "صلوات للمرضى", icon: HeartPulse },
            { label: "تفسير آية", icon: Sparkles },
            { label: "تفسير مثل", icon: ScrollText }
          ].map((item, idx) => (
            <button key={idx} onClick={() => handleSuggestionClick(item.label)} className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-[#eae7e7] hover:bg-[#ffe088]/20 text-[#564243] hover:text-[#4a0012] transition-all duration-300 rounded-full border border-[#dcc0c1]/30 text-xs font-semibold shadow-sm hover:shadow-md">
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- منطقة الإدخال (Input Area) --- */}
      <footer className="flex-none bg-[#f6f3f2] p-1 md:px-1 md:py-1 border-t border-[#dcc0c1]/20 shadow-[0_-4px_20px_rgba(31,31,31,0.02)] z-20 pb-safe">
        <form onSubmit={onFormSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-1 bg-[#fcf9f8] rounded-3xl border border-[#dcc0c1]/40 shadow-sm focus-within:border-[#4a0012]/50 focus-within:ring-1 focus-within:ring-[#4a0012]/20 transition-all p-1">

            {/* <button type="button" className="w-3 h-3 flex-none rounded-full flex items-center justify-center text-[#564243] hover:bg-[#e5e2e1] transition-colors group">
              <Paperclip size={18} className="group-hover:text-[#4a0012] transition-colors" />
            </button> */}

            <TextareaAutosize
            // <textarea
              value={input}
              onChange={(e)=> setInput(e.target.value)}
              // onChange={(e) => {
              //   setInput(e.target.value)

              //   e.target.style.height = "auto";
              //   e.target.style.height = `${e.target.scrollHeight}px`;
              // }}
              // onInput={(e) => {
              //   const target = e.currentTarget;
              //   target.style.height = "auto";
              //   target.style.height = `${target.scrollHeight}px`;
              // }}
              placeholder={user ? "اكتب رسالتك هنا..." : "يرجى تسجيل الدخول"}
              // className="flex-1 max-h-32 min-h-[30px] bg-transparent resize-none outline-none py-0.5 px-0.5 text-[16px] text-[#1b1b1c] placeholder:text-[#564243]/50 leading-relaxed overflow-y-auto"
              className="flex-1 resize-none bg-transparent outline-none pe-0.5 text-[16px] leading-relaxed overflow-y-auto"
              disabled={!user || isLoading}
              // onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onFormSubmit(e as any); } }}
              minRows={1}
              maxRows={6}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.nativeEvent.isComposing &&
                  (e.ctrlKey || e.metaKey)
                ) {
                  e.preventDefault();
                  onFormSubmit(e as any);
                }
              }}
              // rows={1}
            />

            <div className="flex items-center gap-1">
              {/* <button type="button" className="w-3 h-3 flex-none rounded-full flex items-center justify-center text-[#564243] hover:bg-[#e5e2e1] transition-colors group">
                <Mic size={18} className="group-hover:text-[#4a0012] transition-colors" />
              </button> */}

              <button type="submit" className="w-3 h-3 flex-none rounded-full bg-[#4a0012] flex items-center justify-center text-white hover:bg-[#6b1124] transition-all shadow-md transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none" disabled={!input.trim() || isLoading || !user}>
                <Send size={22} className="rtl:rotate-270" />
              </button>
            </div>
          </div>
          <div className="text-center mt-0.5">
            <span className="text-[10px] text-[#564243]/50 font-semibold">قد يخطئ الذكاء الاصطناعي أحياناً. يرجى مراجعة الإجابات اللاهوتية.</span>
          </div>
        </form>
      </footer>

    </div >
  );
}
