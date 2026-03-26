"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection, addDoc, updateDoc, doc, deleteDoc,
  serverTimestamp, query, orderBy, getDocs, onSnapshot, where, writeBatch,
} from "firebase/firestore";
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

// ── firebase helpers ──────────────────────────────────────────────────────────
const convCol = (uid: string) => collection(db, "users", uid, "conversations");
const msgCol  = (uid: string, cid: string) => collection(db, "users", uid, "conversations", cid, "messages");

async function createConv(uid: string) {
  const r = await addDoc(convCol(uid), { createdAt: serverTimestamp(), updatedAt: serverTimestamp(), lastMessage: "", messageCount: 0 });
  return r.id;
}

async function deleteEmptyConvs(uid: string) {
  // ✅ احذف المحادثات الفاضية (messageCount == 0) عند الخروج
  const snap = await getDocs(query(convCol(uid), where("messageCount", "==", 0)));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  if (!snap.empty) await batch.commit();
}

async function saveMsg(uid: string, cid: string, role: string, text: string) {
  await addDoc(msgCol(uid, cid), { role, text, createdAt: serverTimestamp() });
  await updateDoc(doc(db, "users", uid, "conversations", cid), {
    lastMessage: text.slice(0, 80),
    updatedAt: serverTimestamp(),
    messageCount: (await getDocs(msgCol(uid, cid))).size,
  });
}

async function loadMsgs(uid: string, cid: string) {
  const snap = await getDocs(query(msgCol(uid, cid), orderBy("createdAt", "asc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() as any }));
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function ConvSidebar({ open, onOpenChange, conversations, activeId, onSelect, onNew, onDelete }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  conversations: Conversation[]; activeId: string | null;
  onSelect: (id: string) => void; onNew: () => void; onDelete: (id: string) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-72 p-0 flex flex-col" style={{ fontFamily: "Tajawal, sans-serif" }}>
        <SheetHeader className="p-1 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-sm font-semibold text-gray-700">المحادثات</SheetTitle>
            <Button variant="ghost" size="sm" onClick={onNew}
              className="h-5 gap-1 text-xs text-amber-600 hover:bg-amber-50 px-1">
              <Plus size={8} /> جديدة
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-1 text-gray-400">
              <MessageSquare size={10} className="opacity-40" />
              <p className="text-xs">لا توجد محادثات</p>
            </div>
          ) : (
            <div className="p-1 space-y-0.5">
              {conversations.map((c) => (
                <button key={c.id} onClick={() => onSelect(c.id)}
                  className={cn(
                    "group w-full flex items-center gap-1 rounded-lg p-1 text-right transition-colors",
                    activeId === c.id ? "bg-amber-50 text-amber-800" : "hover:bg-gray-50 text-gray-700"
                  )}>
                  <MessageSquare size={7} className={cn("shrink-0 mt-0.5", activeId === c.id ? "text-amber-500" : "text-gray-400")} />
                  <span className="flex-1 text-xs truncate text-right">{c.lastMessage || "محادثة جديدة"}</span>
                  <span onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-red-400 transition-opacity shrink-0">
                    <Trash2 size={6} />
                  </span>
                </button>
              ))}
            </div>
          )}
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
  const [user] = useAuthState(auth);

  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const isLoading = status === "streaming" || status === "submitted";

  // ── real-time conversations list ─────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      query(convCol(user.uid), orderBy("updatedAt", "desc")),
      (snap) => setConvs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation)))
    );
    return () => unsub();
  }, [user]);

  // ── مش بنفتح conversation فورًا — بس لما المستخدم يبعت رسالة ──────────────
  // ── حذف المحادثات الفاضية لما المكوّن يتفك ─────────────────────────────────
  useEffect(() => {
    return () => {
      if (user) deleteEmptyConvs(user.uid).catch(() => {});
    };
  }, [user]);

  // ── auto scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── auto resize textarea ─────────────────────────────────────────────────
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  // ── حفظ في Firebase بعد انتهاء streaming ────────────────────────────────
  useEffect(() => {
    if (!user || status !== "ready" || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (!last?.id || savedIds.has(last.id)) return;
    const text = extractText(last);
    if (!text) return;

    setSavedIds((p) => new Set(p).add(last.id));

    // ✅ لو مفيش conversation بعد، ننشئها دلوقتي
    const doSave = async () => {
      let cid = convId;
      if (!cid) {
        cid = await createConv(user.uid);
        setConvId(cid);
      }
      await saveMsg(user.uid, cid, last.role, text);
    };
    doSave().catch(console.error);
  }, [messages, status]);

  // ── new chat ─────────────────────────────────────────────────────────────
  const handleNew = useCallback(async () => {
    // ✅ لو المحادثة الحالية فاضية (ما فيهاش رسائل)، مش بنعمل جديدة
    if (messages.length === 0) { setSheetOpen(false); return; }
    setMessages([]);
    setInput("");
    setSavedIds(new Set());
    setConvId(null); // ✅ هنعمل conversation جديدة بس لما المستخدم يبعت
    setSheetOpen(false);
  }, [messages, setMessages]);

  // ── select old conversation ───────────────────────────────────────────────
  const handleSelect = useCallback(async (id: string) => {
    if (!user || id === convId) { setSheetOpen(false); return; }
    setSheetOpen(false);
    setConvId(id);
    setSavedIds(new Set());
    setMessages([]); // ✅ امسح الـ messages الحالية الأول

    const saved = await loadMsgs(user.uid, id);
    // ✅ بنحمّل الـ messages الجديدة بشكل منفصل تماماً
    setMessages(saved.map((m) => ({
      id: m.id, role: m.role,
      parts: [{ type: "text", text: m.text }],
      content: m.text,
    })) as any);
    setSavedIds(new Set(saved.map((m) => m.id)));
  }, [user, convId, setMessages]);

  // ── delete conversation ───────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "conversations", id));
    if (id === convId) handleNew();
  }, [user, convId, handleNew]);

  // ── send ─────────────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage({ text });
  }, [input, isLoading, sendMessage]);

  return (
    <div className="flex flex-col h-full bg-linear-to-b from-amber-50/30 to-white" style={{ fontFamily: "Tajawal, sans-serif" }}>

      <ConvSidebar
        open={sheetOpen} onOpenChange={setSheetOpen}
        conversations={convs} activeId={convId}
        onSelect={handleSelect} onNew={handleNew} onDelete={handleDelete}
      />

      {/* ── Header ── */}
      <div className="flex items-center gap-1 p-1 border-b border-amber-100 bg-white/90 backdrop-blur-sm shrink-0">
        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
          <Sparkles size={7} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 leading-tight">المساعد الروحي</p>
          <p className="text-[10px] text-gray-400 leading-tight">
            {isLoading ? <span className="text-amber-500 animate-pulse">يكتب...</span> : "متاح الآن"}
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={handleNew}
              className="h-7 w-7 rounded-full text-gray-400 hover:text-amber-600 hover:bg-amber-50">
              <Plus size={8} />
            </Button>
          )}
          {user && (
            <Button variant="ghost" size="icon" onClick={() => setSheetOpen(true)}
              className="h-7 w-7 rounded-full text-gray-400 hover:text-amber-600 hover:bg-amber-50">
              <PanelRight size={8} />
            </Button>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <ScrollArea className="flex-1 p-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-1 text-center select-none">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Sparkles size={10} />
            </div>
            <p className="text-sm font-medium text-gray-700">أهلاً بك في المساعد الروحي</p>
            <p className="text-xs text-gray-400">اسأل أي سؤال روحي أو كتابي</p>
          </div>
        )}

        <div className="space-y-1">
          {messages.map((m: any) => {
            const text = extractText(m);
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={cn("flex gap-1 items-end", isUser ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mb-0.5",
                  isUser ? "bg-blue-500" : "bg-amber-500"
                )}>
                  {isUser ? <User size={6} /> : <Bot size={6} />}
                </div>
                <div className={cn(
                  "max-w-[80%] p-1 rounded-2xl text-sm leading-relaxed shadow-sm",
                  isUser ? "bg-blue-600 text-white rounded-br-sm" : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                )}>
                  {isUser ? (
                    <p className="whitespace-pre-wrap" dir="rtl">{text}</p>
                  ) : (
                    <div dir="rtl"
                      className="prose prose-sm max-w-none [&_h3]:text-amber-700 [&_h3]:font-semibold [&_h3]:text-sm [&_strong]:text-gray-900 [&_p]:mb-1 [&_p:last-child]:mb-0 [&_span[dir=rtl]]:block [&_span[dir=rtl]]:bg-amber-50 [&_span[dir=rtl]]:border-r-2 [&_span[dir=rtl]]:border-amber-400 [&_span[dir=rtl]]:rounded-lg [&_span[dir=rtl]]:px-1 [&_span[dir=rtl]]:py-1 [&_span[dir=rtl]]:my-1 [&_span[dir=rtl]]:text-amber-800 [&_span[dir=rtl]]:text-xs"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text, { ADD_ATTR: ["dir", "style"] }) }}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-1 items-end">
              <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0">
                <Bot size={12} />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm p-1 shadow-sm">
                <div className="flex gap-1 items-center">
                  <span className="w-1 h-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1 h-1 bg-amber-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1 h-1 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="text-center text-xs text-red-400 bg-red-50 rounded-xl p-1">
              حدث خطأ، يرجى المحاولة مرة أخرى
            </p>
          )}
        </div>
        <div ref={endRef} className="h-1" />
      </ScrollArea>

      {/* ── Input ── */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="p-1 border-t border-gray-100 bg-white flex gap-1 items-end shrink-0">
        <Textarea
          ref={taRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="اسأل سؤالاً روحياً..."
          rows={1}
          dir="rtl"
          className="flex-1 resize-none min-h-[38px] max-h-[110px] text-sm rounded-2xl border-gray-200 focus-visible:ring-1 focus-visible:ring-amber-400 p-1 bg-gray-50 text-right"
        />
        <Button type="submit" disabled={isLoading || !input.trim()} size="icon"
          className="h-[38px] w-[38px] rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 shrink-0">
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={8} className="rotate-180" />}
        </Button>
      </form>
    </div>
  );
}
