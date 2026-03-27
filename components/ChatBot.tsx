"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import DOMPurify from "dompurify";
import { Send, Loader2, Bot, User, Sparkles, Plus, MessageSquare, Trash2, X, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface Conversation { id: string; lastMessage: string; updatedAt: any; }

// ── extract text ──────────────────────────────────────────────────────────────
function extractText(m: any): string {
  if (Array.isArray(m.parts)) return m.parts.filter((p: any) => p.type === "text").map((p: any) => p.text ?? "").join("");
  if (typeof m.content === "string") return m.content;
  return "";
}


// ── Sidebar ───────────────────────────────────────────────────────────────────
function ConvSidebar({ open, onOpenChange, conversations, activeId, onSelect, onNew, onDelete }: any) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-72 p-0 flex flex-col">
        <SheetHeader className="p-1 border-b flex flex-row justify-between items-center">
          <SheetTitle className="text-sm">المحادثات</SheetTitle>
          <Button variant="ghost" size="sm" onClick={onNew} className="text-amber-600"><Plus size={8} /> جديدة</Button>
        </SheetHeader>
        <ScrollArea className="flex-1">
          {conversations.map((c: any) => (
            <div key={c.id} onClick={() => onSelect(c.id)} className={cn("p-1 cursor-pointer hover:bg-gray-100 flex justify-between", activeId === c.id && "bg-amber-50")}>
              <span className="text-xs truncate">{c.last_message || "محادثة جديدة"}</span>
              <Trash2 size={6} className="text-red-400" onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} />
            </div>
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ChatBot() {
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<any>(null);

  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const isLoading = status === "streaming" || status === "submitted";

  // ── Auth & Real-time setup ──────────────────────────────────────────────
  useEffect(() => {
    // الحصول على المستخدم الحالي
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    // الاشتراك في تغييرات المحادثات (Real-time)
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => fetchConversations()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchConversations = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });
    if (data) setConvs(data as any);
  };

  useEffect(() => { if (user) fetchConversations(); }, [user]);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const handleNew = useCallback(() => {
    if (messages.length === 0) { setSheetOpen(false); return; }
    setMessages([]);
    setInput("");
    setSavedIds(new Set());
    setConvId(null);
    setSheetOpen(false);
  }, [messages, setMessages]);

  const handleSelect = useCallback(async (id: string) => {
    if (!user || id === convId) { setSheetOpen(false); return; }
    setSheetOpen(false);
    setConvId(id);
    setMessages([]);

    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (msgs) {
      setMessages(msgs.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
      })) as any);
      setSavedIds(new Set(msgs.map((m) => m.id)));
    }
  }, [user, convId, setMessages]);

  const handleDelete = useCallback(async (id: string) => {
    await supabase.from('conversations').delete().eq('id', id);
    if (id === convId) handleNew();
    fetchConversations();
  }, [convId, handleNew]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage({ text });
  }, [input, isLoading, sendMessage]);

  // ── Auto Save to Supabase ──────────────────────────────────────────────
  useEffect(() => {
    if (!user || status !== "ready" || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (!last?.id || savedIds.has(last.id)) return;

    const text = extractText(last);
    if (!text) return;

    const doSave = async () => {
      let currentCid = convId;

      // 1. إنشاء محادثة لو مش موجودة
      if (!currentCid) {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert([{ user_id: user.id, title: text.slice(0, 30) }])
          .select()
          .single();
        if (newConv) {
          currentCid = newConv.id;
          setConvId(currentCid);
        }
      }

      // 2. حفظ الرسالة
      await supabase.from('messages').insert([
        { conversation_id: currentCid, role: last.role, content: text }
      ]);

      // 3. تحديث وقت المحادثة
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString(), last_message: text.slice(0, 80) })
        .eq('id', currentCid);

      setSavedIds((p) => new Set(p).add(last.id));
    };

    doSave();
  }, [messages, status, user]);

  // ── Auto Scroll & UI effects ──
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full bg-linear-to-b from-amber-50/30 to-white" style={{ fontFamily: "Tajawal, sans-serif" }}>

      <ConvSidebar
        open={sheetOpen} onOpenChange={setSheetOpen}
        conversations={convs} activeId={convId}
        onSelect={handleSelect} onNew={handleNew} onDelete={handleDelete}
      />

      {/* Header */}
      <div className="flex items-center gap-1 p-1 border-b border-amber-100 bg-white/90 backdrop-blur-sm">
        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><Sparkles size={7} /></div>
        <div className="flex-1"><p className="text-sm font-semibold">المساعد الروحي</p></div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setSheetOpen(true)} className="h-7 w-7"><PanelRight size={8} /></Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-1">
        <div className="space-y-1">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex gap-1", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
              <div className={cn("max-w-[80%] p-1 rounded-2xl text-sm", m.role === "user" ? "bg-blue-600 text-white" : "bg-white border")}>
                {m.role === "user" ? extractText(m) : <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(extractText(m)) }} />}
              </div>
            </div>
          ))}
          {isLoading && <Loader2 className="animate-spin text-amber-500 mx-auto" size={8} />}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-1 border-t bg-white flex gap-1">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اسأل سؤالاً..."
          className="flex-1 text-right"
          dir="rtl"
        />
        <Button type="submit" disabled={isLoading} className="bg-amber-500"><Send size={8} /></Button>
      </form>
    </div>
  );
}
