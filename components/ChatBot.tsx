"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState, useCallback } from "react";
import DOMPurify from "dompurify";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection, addDoc, updateDoc, doc, deleteDoc,
  serverTimestamp, query, orderBy, getDocs, limit, onSnapshot
} from "firebase/firestore";
import { Send, Loader2, Bot, User, Sparkles, Plus ,MessageSquare, Trash2, X , Menu} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ===================== Types =====================
interface SavedConversation {
  id: string;
  lastMessage: string;
  createdAt: any;
  updatedAt: any;
}

// ===================== Helpers =====================
function extractText(m: any): string {
  if (Array.isArray(m.parts))
    return m.parts.filter((p: any) => p.type === "text").map((p: any) => p.text ?? "").join("");
  if (typeof m.content === "string") return m.content;
  if (Array.isArray(m.content))
    return m.content.filter((p: any) => p.type === "text").map((p: any) => p.text ?? "").join("");
  return "";
}

// ===================== Firebase helpers =====================
async function createConversation(userId: string): Promise<string> {
  const ref = await addDoc(collection(db, "users", userId, "conversations"), {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: "",
  });
  return ref.id;
}

async function saveMessage(userId: string, convId: string, role: string, text: string) {
  await addDoc(collection(db, "users", userId, "conversations", convId, "messages"), {
    role, text, createdAt: serverTimestamp(),
  });
}

async function updateLastMessage(userId: string, convId: string, text: string) {
  await updateDoc(doc(db, "users", userId, "conversations", convId), {
    lastMessage: text.slice(0, 80),
    updatedAt: serverTimestamp(),
  });
}

async function loadMessages(userId: string, convId: string) {
  const q = query(
    collection(db, "users", userId, "conversations", convId, "messages"),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ===================== Sidebar =====================
function Sidebar({ open, onClose, conversations, activeId, onSelect, onNew, onDelete }: {
  open: boolean; onClose: () => void; conversations: SavedConversation[];
  activeId: string | null; onSelect: (id: string) => void; onNew: () => void; onDelete: (id: string) => void;
}) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-20" onClick={onClose} />}
      <div className={cn(
        "fixed top-0 right-0 h-full w-72 bg-white border-l border-gray-100 shadow-xl z-30",
        "flex flex-col transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <span className="text-sm font-semibold text-gray-700">المحادثات السابقة</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-50" onClick={onNew}>
              <Plus size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-gray-50" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 px-2 py-2">
          {conversations.length === 0 && (
            <div className="text-center text-xs text-gray-400 mt-8 flex flex-col items-center gap-2">
              <MessageSquare size={24} className="opacity-40" />
              لا توجد محادثات سابقة
            </div>
          )}
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div key={conv.id} onClick={() => onSelect(conv.id)}
                className={cn(
                  "group flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-colors",
                  activeId === conv.id ? "bg-amber-50 border border-amber-200" : "hover:bg-gray-50"
                )}>
                <MessageSquare size={14} className={cn("shrink-0", activeId === conv.id ? "text-amber-500" : "text-gray-400")} />
                <p className={cn("flex-1 text-xs truncate", activeId === conv.id ? "text-amber-700 font-medium" : "text-gray-600")}>
                  {conv.lastMessage || "محادثة جديدة"}
                </p>
                <button onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-red-400 transition-opacity shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}

// // ✅ حفظ رسالة في Firebase - بنحفظ بس role + text علشان نوفر مساحة
// async function saveMessageToFirebase(
//   userId: string,
//   conversationId: string,
//   role: "user" | "assistant",
//   text: string
// ) {
//   try {
//     await addDoc(
//       collection(db, "users", userId, "conversations", conversationId, "messages"),
//       { role, text, createdAt: serverTimestamp() }
//     );
//   } catch (e) {
//     console.error("Firebase save error:", e);
//   }
// }

// // ✅ تحديث آخر رسالة في المحادثة
// async function updateConversationLastMessage(userId: string, conversationId: string, text: string) {
//   try {
//     await updateDoc(doc(db, "users", userId, "conversations", conversationId), {
//       lastMessage: text.slice(0, 2000),
//       updatedAt: serverTimestamp(),
//     });
//   } catch (e) {
//     console.error("Firebase update error:", e);
//   }
// }

export default function ChatBot() {
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversationId, setConvId] = useState<string | null>(null);
  const [conversations, setConvs] = useState<SavedConversation[]>([]);
  const [savedMsgIds, setSavedMsgIds] = useState<Set<string>>(new Set()); // ✅ نتجنب حفظ نفس الرسالة مرتين

  const [user] = useAuthState(auth);

  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // ✅ real-time list للمحادثات
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "conversations"), orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setConvs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SavedConversation)));
    });
    return () => unsub();
  }, [user]);

  // ✅ إنشاء conversation جديدة عند أول دخول
  useEffect(() => {
    if (user && !conversationId) {
      createConversation(user.uid).then(setConvId);
    }
  }, [user, conversationId]);

  // ✅ حفظ في Firebase — بس لما status === "ready" وبنتجنب التكرار
  useEffect(() => {
    if (!user || !conversationId || status !== "ready" || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    const msgId = lastMsg?.id;
    if (!msgId || savedMsgIds.has(msgId)) return; // ✅ مش محفوظة قبل كده

    const text = extractText(lastMsg);
    if (!text) return;

    setSavedMsgIds((prev) => new Set(prev).add(msgId));

    saveMessage(user.uid, conversationId, lastMsg.role, text)
      .then(() => {
        if (lastMsg.role === "assistant") {
          updateLastMessage(user.uid, conversationId, text);
        }
      })
      .catch(console.error);
  }, [messages, status, user, conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [inputValue]);

  const handleNewChat = useCallback(async () => {
    setMessages([]);
    setInputValue("");
    setSidebarOpen(false);
    setSavedMsgIds(new Set());
    if (user) {
      const newId = await createConversation(user.uid);
      setConvId(newId);
    }
  }, [user, setMessages]);

  const handleSelectConversation = useCallback(async (convId: string) => {
    if (!user) return;
    setSidebarOpen(false);
    setConvId(convId);
    setSavedMsgIds(new Set());

    const saved = await loadMessages(user.uid, convId);
    const formatted = saved.map((m: any) => ({
      id: m.id,
      role: m.role,
      parts: [{ type: "text", text: m.text }],
      content: m.text,
    }));
    setMessages(formatted as any);
    // ✅ نعلّم كل الرسائل المحملة كمحفوظة عشان ما نحفظهاش تاني
    setSavedMsgIds(new Set(saved.map((m: any) => m.id)));
  }, [user, setMessages]);

  const handleDeleteConversation = useCallback(async (convId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "conversations", convId));
    if (convId === conversationId) handleNewChat();
  }, [user, conversationId, handleNewChat]);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue("");
    sendMessage({ text });
  }, [inputValue, isLoading, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-full bg-linear-to-b from-amber-50/40 to-white" style={{ fontFamily: "Tajawal, sans-serif" }}>

      <Sidebar
        open={sidebarOpen} onClose={() => setSidebarOpen(false)}
        conversations={conversations} activeId={conversationId}
        onSelect={handleSelectConversation} onNew={handleNewChat} onDelete={handleDeleteConversation}
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-amber-100 bg-white/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 shrink-0">
          <Sparkles size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 leading-tight">المساعد الروحي</p>
          <p className="text-[10px] text-gray-400">
            {isLoading ? <span className="text-amber-500 animate-pulse">يكتب...</span> : "متاح الآن"}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={handleNewChat}
              className="h-8 w-8 rounded-full text-gray-400 hover:text-amber-600 hover:bg-amber-50">
              <Plus size={16} />
            </Button>
          )}
          {user && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}
              className="h-8 w-8 rounded-full text-gray-400 hover:text-amber-600 hover:bg-amber-50">
              <Menu size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-3 py-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-52 gap-3 text-center select-none">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Sparkles size={24} />
            </div>
            <p className="text-sm font-medium text-gray-700">أهلاً بك في المساعد الروحي</p>
            <p className="text-xs text-gray-400">اسأل أي سؤال روحي أو كتابي وسأجيبك</p>
          </div>
        )}

        <div className="space-y-3">
          {messages.map((m: any) => {
            const text = extractText(m);
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={cn("flex gap-2 items-end", isUser ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                  "shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white mb-0.5",
                  isUser ? "bg-blue-500" : "bg-amber-500"
                )}>
                  {isUser ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={cn(
                  "max-w-[78%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                  isUser ? "bg-blue-600 text-white rounded-br-sm" : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                )}>
                  {isUser ? (
                    <p className="whitespace-pre-wrap" dir="rtl">{text}</p>
                  ) : (
                    <div dir="rtl"
                      className="prose prose-sm max-w-none [&_h3]:text-amber-700 [&_h3]:font-bold [&_h3]:text-base [&_strong]:text-gray-900 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_span[dir=rtl]]:block [&_span[dir=rtl]]:bg-amber-50 [&_span[dir=rtl]]:rounded-lg [&_span[dir=rtl]]:px-3 [&_span[dir=rtl]]:py-1.5 [&_span[dir=rtl]]:my-1.5 [&_span[dir=rtl]]:text-amber-800 [&_span[dir=rtl]]:font-medium [&_span[dir=rtl]]:border-r-2 [&_span[dir=rtl]]:border-amber-400"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text, { ADD_ATTR: ["dir", "style"] }) }}
                    />
                  )}
                </div>
              </div>
            );
          })}

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

          {error && (
            <div className="text-center text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              حدث خطأ، يرجى المحاولة مرة أخرى
            </div>
          )}
        </div>
        <div ref={endRef} className="h-2" />
      </ScrollArea>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="px-3 py-2 border-t border-gray-100 bg-white flex gap-2 items-end shrink-0">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اسأل سؤالاً روحياً..."
          rows={1}
          dir="rtl"
          className="flex-1 resize-none min-h-[42px] max-h-[120px] text-sm text-right rounded-2xl border-gray-200 focus-visible:ring-1 focus-visible:ring-amber-400 py-2.5 px-3 bg-gray-50"
        />
        <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon"
          className="h-[42px] w-[42px] rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 shrink-0 shadow-sm">
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} className="rotate-180" />}
        </Button>
      </form>
    </div>
  );
}
