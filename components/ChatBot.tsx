"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import DOMPurify from "dompurify";
import { Send, Sparkles, Plus, UserCircle, PanelRight, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Button } from "react-day-picker";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import TextareaAutosize from "react-textarea-autosize";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { toast } from "sonner";
import { ORTHODOX_SUB_BOTS, SubBotPersona, getSubBotById } from "@/lib/orthodox-subbots";
import PersonaSelector from "@/components/chat/PersonaSelector";

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
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const [convs, setConvs] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  // إدارة البوت المتخصص المختار
  const [selectedBotId, setSelectedBotId] = useState<string>("general-abona");
  const currentPersona = getSubBotById(selectedBotId);

  // إدارة الرسائل والـ Loading يدوياً لضمان الاستقرار
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // مراقبة الـ query param لو جاي من صفحة ثانية زي الكتاب المقدس أو الرابط لبوت معين
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    const botParam = searchParams.get("bot");
    if (promptParam) {
      setInput(promptParam);
    }
    if (botParam && ORTHODOX_SUB_BOTS.some((b) => b.id === botParam)) {
      setSelectedBotId(botParam);
    }
  }, [searchParams]);

  // مراقبة حالة الشبكة
  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    setIsOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  // جلب المحادثات مع كاش محلي للأوفلاين
  const fetchConversations = useCallback(async (userId: string) => {
    const CACHE_KEY = `chat_convs_${userId}`;
    try {
      if (!navigator.onLine) {
        // أوفلاين: قراءة من localStorage
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) setConvs(JSON.parse(cached));
        return;
      }
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (data) {
        setConvs(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(data)); // حفظ للأوفلاين
      }
    } catch {
      // fallback للكاش
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) setConvs(JSON.parse(cached));
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
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
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
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

    // فحص الاتصال بالإنترنت قبل الإرسال
    if (!navigator.onLine) {
      toast.error("🔌 لا يوجد اتصال بالإنترنت", {
        description: "الشات يحتاج اتصال بالنت لإرسال الرسائل. تحقق من اتصالك وحاول مرة أخرى.",
        duration: 5000,
      });
      return;
    }

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

      // 3. نداء الـ API يدوياً (Streaming) مع إرسال معرف البوت المتخصص
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          botId: selectedBotId,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        }),
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

  const handleSuggestionClick = (suggestion: string) => {
    if (!user) {
      toast.error("برجاء تسجيل الدخول أولاً");
      return;
    }
    setInput(suggestion);
  };

  const handleSelectPersona = (bot: SubBotPersona) => {
    setSelectedBotId(bot.id);
    toast.success(`تم التبديل إلى: ${bot.name}`);
  };

  const handleMicClick = () => { alert("ميزة التسجيل الصوتي ستتوفر قريباً!"); };
  const handleAttachmentClick = () => { alert("ميزة إرفاق الملفات ستتوفر قريباً!"); };

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-[#fcf9f850]" dir="rtl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

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
        </SheetContent>
      </Sheet>

      {/* --- Header المحادثة --- */}
      <div className="flex-none border-b border-[#dcc0c1]/30 bg-[#f6f3f2]/90 backdrop-blur-md px-0.5 py-0.5 flex items-center justify-between z-10 shadow-sm gap-0.5">
        <div className="flex items-center gap-0.5">
          <Link href="/" prefetch={true} className="p-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-700 transition" title="الرجوع للصفحة الرئيسية">
            <FaArrowRight size={16} />
          </Link>

          <PersonaSelector
            selectedBotId={selectedBotId}
            onSelectBot={handleSelectPersona}
          />
        </div>

        <div className="flex items-center gap-0.5">
          <Link
            href="/icon-generator"
            className="flex items-center gap-0.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/30 px-0.5 py-0.5 rounded-full text-xs font-bold transition-all shadow-xs"
            title="توليد أيقونات وصور بالذكاء الاصطناعي"
          >
            <Sparkles size={13} className="text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">مولد الأيقونات</span>
          </Link>
          <button onClick={() => setSheetOpen(true)} className="p-1 flex items-center justify-center rounded-full text-[#564243] hover:bg-[#e5e2e1] transition-colors" title="سجل المحادثات">
            <PanelRight size={18} />
          </button>
        </div>
      </div>

      {/* --- منطقة الرسائل --- */}
      <main className="flex-1 overflow-y-auto px-1 md:px-2 py-0.25 flex flex-col gap-0.5 relative z-10" id="chat-messages">
        {/* خلفية مزخرفة شفافة */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[-1] opacity-30 mix-blend-multiply">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#ffe088]/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 -left-5 w-18 h-18 bg-[#4a0012]/10 rounded-full blur-3xl"></div>
        </div>

        <AnimatePresence>
          {!user && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="my-0.5 mx-auto p-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-2xl text-center max-w-md shadow-sm z-20">
              <p className="text-amber-900 dark:text-amber-200 font-bold text-base mb-0.5">برجاء تسجيل الدخول أولاً لاستخدام شات أبونا فلتاؤس والمساعدين المتخصصين</p>
              <Link href="/auth/signin" className="inline-block bg-amber-700 hover:bg-amber-800 text-white font-bold px-1 py-0.5 rounded-full text-sm transition-all shadow-md hover:scale-105">
                تسجيل الدخول
              </Link>
            </motion.div>
          )}

          {messages.length === 0 && user && (
            // رسالة ترحيب أولية مخصصة للشخصية المختارة
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center p-1 max-w-xl mx-auto text-center mt-1">
              <div className={cn("p-0.5 rounded-2xl mb-0.5 shadow-md", currentPersona.badgeBg)}>
                <Sparkles size={28} className="text-amber-800" />
              </div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-0.5">
                {currentPersona.name}
              </h2>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-0.5">
                {currentPersona.title}
              </p>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-w-md mb-0.5">
                {currentPersona.description}
              </p>
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
        <div className="flex gap-0.5 max-w-4xl mx-auto">
          {currentPersona.defaultSuggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(item)}
              className={cn(
                "inline-flex items-center gap-0.5 px-1 py-0.5 transition-all duration-300 rounded-full border text-xs font-semibold shadow-xs shrink-0",
                !user
                  ? "bg-gray-300 dark:bg-gray-800 text-gray-500 border-gray-400 cursor-not-allowed grayscale opacity-75"
                  : "bg-[#eae7e7]/80 hover:bg-amber-100/70 text-[#564243] hover:text-[#4a0012] border-[#dcc0c1]/40 hover:shadow-xs"
              )}
            >
              <Sparkles size={13} className="text-amber-700 dark:text-amber-400" />
              <span>{item}</span>
            </button>
          ))}
        </div>
      </div>

      {/* --- منطقة الإدخال (Input Area) --- */}
      <footer className="flex-none bg-[#f6f3f2] p-1 md:px-1 md:py-1 border-t border-[#dcc0c1]/20 shadow-[0_-4px_20px_rgba(31,31,31,0.02)] z-20 pb-safe">
        <form onSubmit={onFormSubmit} className="max-w-4xl mx-auto">
          <div
            onClickCapture={(e) => {
              if (!user) {
                toast.error("برجاء تسجيل الدخول أولاً");
              }
            }}
            className={cn(
              "relative flex items-end gap-1 rounded-3xl border transition-all p-1",
              !user
                ? "bg-gray-300/60 dark:bg-zinc-800/80 border-gray-400/60 cursor-not-allowed opacity-75 grayscale"
                : "bg-[#fcf9f8] border-[#dcc0c1]/40 shadow-sm focus-within:border-[#4a0012]/50 focus-within:ring-1 focus-within:ring-[#4a0012]/20"
            )}
          >
            <TextareaAutosize
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={user ? "اكتب رسالتك هنا..." : "برجاء تسجيل الدخول أولاً"}
              className="flex-1 resize-none bg-transparent outline-none pe-0.5 text-[16px] leading-relaxed overflow-y-auto"
              disabled={!user || isLoading}
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
            />

            <div className="flex items-center gap-1">
              <button
                type={user ? "submit" : "button"}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    toast.error("برجاء تسجيل الدخول أولاً");
                  }
                }}
                className={cn(
                  "w-3 h-3 flex-none rounded-full flex items-center justify-center text-white transition-all shadow-md",
                  !user
                    ? "bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed grayscale opacity-75"
                    : "bg-[#4a0012] hover:bg-[#6b1124] transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                )}
                disabled={user ? (!input.trim() || isLoading) : false}
              >
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
