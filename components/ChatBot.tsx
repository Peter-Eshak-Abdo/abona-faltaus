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

// ===================== Sidebar Component =====================
function Sidebar({
  open, onClose, conversations, activeId, onSelect, onNew, onDelete,
}: {
  open: boolean;
  onClose: () => void;
  conversations: SavedConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      {/* Overlay للموبايل */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-72 bg-white border-l border-gray-100 shadow-xl z-30",
        "flex flex-col transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-1 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">المحادثات السابقة</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-4 w-4 text-amber-600 hover:bg-amber-50" onClick={onNew}>
              <Plus size={8} />
            </Button>
            <Button variant="ghost" size="icon" className="h-4 w-4 text-gray-400 hover:bg-gray-50" onClick={onClose}>
              <X size={8} />
            </Button>
          </div>
        </div>

        {/* List */}
        <ScrollArea className="flex-1 p-1">
          {conversations.length === 0 && (
            <div className="text-center text-xs text-gray-400 mt-1">
              <MessageSquare size={10} className="mx-auto mb-1 opacity-40" />
              لا توجد محادثات سابقة
            </div>
          )}
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  "group flex items-center gap-1 rounded-xl p-1 cursor-pointer transition-colors",
                  activeId === conv.id
                    ? "bg-amber-50 border border-amber-200"
                    : "hover:bg-gray-50"
                )}
              >
                <MessageSquare size={7} className={cn("shrink-0", activeId === conv.id ? "text-amber-500" : "text-gray-400")} />
                <p className={cn(
                  "flex-1 text-xs truncate",
                  activeId === conv.id ? "text-amber-700 font-medium" : "text-gray-600"
                )}>
                  {conv.lastMessage || "محادثة جديدة"}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-red-400 transition-opacity"
                >
                  <Trash2 size={6} />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}

// ✅ حفظ رسالة في Firebase - بنحفظ بس role + text علشان نوفر مساحة
async function saveMessageToFirebase(
  userId: string,
  conversationId: string,
  role: "user" | "assistant",
  text: string
) {
  try {
    await addDoc(
      collection(db, "users", userId, "conversations", conversationId, "messages"),
      { role, text, createdAt: serverTimestamp() }
    );
  } catch (e) {
    console.error("Firebase save error:", e);
  }
}

// ✅ تحديث آخر رسالة في المحادثة
async function updateConversationLastMessage(userId: string, conversationId: string, text: string) {
  try {
    await updateDoc(doc(db, "users", userId, "conversations", conversationId), {
      lastMessage: text.slice(0, 2000),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Firebase update error:", e);
  }
}

export default function ChatBot() {
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Firebase Auth
  const [user] = useAuthState(auth);

  // ✅ AI SDK v5/6: transport بدل api، وسendMessage بدل append
  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // ✅ تحميل قائمة المحادثات من Firebase بـ real-time
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "conversations"),
      orderBy("updatedAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setConversations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SavedConversation)));
    });
    return () => unsub();
  }, [user]);

  // ✅ إنشاء conversation جديدة لو المستخدم مسجل ومفيش conversation
  useEffect(() => {
    if (user && !conversationId) {
      createConversation(user.uid).then(setConversationId);
    }
  }, [user]);


  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [inputValue]);

   // ✅ حفظ الرسائل في Firebase بعد كل رسالة جديدة
  useEffect(() => {
    if (!user || !conversationId || messages.length === 0 || isSaving) return;
    const lastMsg = messages[messages.length - 1];
    // بنحفظ بس لما الـ status بيبقى ready (خلص الـ streaming)
    if (status !== "ready") return;

    const text = extractText(lastMsg);
    if (!text) return;

    setIsSaving(true);
    saveMessageToFirebase(user.uid, conversationId, lastMsg.role as any, text)
      .then(() => {
        if (lastMsg.role === "assistant") {
          updateConversationLastMessage(user.uid, conversationId, text);
        }
      })
      .finally(() => setIsSaving(false));
  }, [messages, status]);

  // ✅ محادثة جديدة
  const handleNewChat = useCallback(async () => {
    setMessages([]);
    setInputValue("");
    setSidebarOpen(false);
    if (user) {
      const newId = await createConversation(user.uid);
      setConversationId(newId);
    }
  }, [user, setMessages]);

  // ✅ تحميل محادثة قديمة
  const handleSelectConversation = useCallback(async (convId: string) => {
    if (!user) return;
    setSidebarOpen(false);
    setConversationId(convId);

    const saved = await loadMessages(user.uid, convId);
    // حوّل الـ messages للـ format المطلوب لـ useChat
    const formatted = saved.map((m: any) => ({
      id: m.id,
      role: m.role,
      parts: [{ type: "text", text: m.text }],
      content: m.text,
    }));
    setMessages(formatted as any);
  }, [user, setMessages]);

  // ✅ حذف محادثة
  const handleDeleteConversation = useCallback(async (convId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "conversations", convId));
    if (convId === conversationId) {
      handleNewChat();
    }
  }, [user, conversationId, handleNewChat]);

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

  return (
    <div className="flex flex-col h-full bg-linear-to-b from-amber-50/40 to-white" style={{ fontFamily: "Tajawal, sans-serif" }}>
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeId={conversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewChat}
        onDelete={handleDeleteConversation}
      />

      {/* Header */}
      <div className="flex items-center gap-1 p-1 border-b border-amber-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-700 shrink-0">
          <Sparkles size={8} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 leading-tight">المساعد الروحي</p>
          <p className="text-[10px] text-gray-400">
            {isLoading
              ? <span className="text-amber-500 animate-pulse">يكتب...</span>
              : "متاح الآن"
            }
          </p>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={handleNewChat}
              className="h-4 w-4 rounded-full text-gray-400 hover:text-amber-600 hover:bg-amber-50" title="محادثة جديدة">
              <Plus size={8} />
            </Button>
          )}
          {user && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}
              className="h-4 w-4 rounded-full text-gray-400 hover:text-amber-600 hover:bg-amber-50" title="المحادثات السابقة">
              <Menu size={8} />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-52 gap-1 text-center">
            <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Sparkles size={6} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">أهلاً بك في المساعد الروحي</p>
              <p className="text-xs text-gray-400 mt-1">اسأل أي سؤال روحي أو كتابي وسأجيبك</p>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {messages.map((m: any) => {
            const text = extractText(m);
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={cn("flex gap-1 items-end", isUser ? "flex-row-reverse" : "flex-row")}>
                {/* Avatar */}
                <div className={cn(
                  "shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white mb-0.5",
                  isUser ? "bg-blue-500" : "bg-amber-500"
                )}>
                  {isUser ? <User size={7} /> : <Bot size={7} />}
                </div>

                {/* Bubble */}
                <div className={cn(
                  "max-w-[78%] p-1 rounded-2xl text-sm leading-relaxed shadow-sm",
                  isUser
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                )}>
                  {isUser ? (
                    <p className="whitespace-pre-wrap text-right" dir="rtl">{text}</p>
                  ) : (
                      <div
                        dir="rtl"
                        className="prose prose-sm max-w-none [&_h3]:text-amber-700 [&_h3]:font-bold [&_strong]:text-gray-900 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_span[dir]]:block [&_span[dir]]:bg-amber-50 [&_span[dir]]:rounded [&_span[dir]]:px-2 [&_span[dir]]:py-1 [&_span[dir]]:my-1 [&_span[dir]]:text-amber-800 [&_span[dir]]:font-medium [&_span[dir=rtl]]:border-r-2 [&_span[dir=rtl]]:border-amber-400"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text, { ADD_ATTR: ["dir", "style"] }) }}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-1 items-end">
              <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0">
                <Bot size={7} />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm p-1 shadow-sm">
                <div className="flex gap-1 items-center h-3">
                  <span className="w-1 h-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1 h-1 bg-amber-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1 h-1 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl p-1">
              حدث خطأ، يرجى المحاولة مرة أخرى
            </div>
          )}
        </div>

        <div ref={endRef} className="h-2" />
      </ScrollArea>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="p-1 border-t border-gray-100 bg-white flex gap-1 items-end"
      >
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اسأل سؤالاً روحياً..."
          rows={1}
          dir="rtl"
          className="flex-1 resize-none min-h-5 max-h-30 text-sm text-right rounded-2xl border-gray-200 focus-visible:ring-1 focus-visible:ring-amber-400 p-1 bg-gray-50"
        />
        <Button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          size="icon"
          className="h-5 w-6 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 shrink-0 shadow-sm"
        >
          {isLoading
            ? <Loader2 className="animate-spin" size={8} />
            : <Send size={8} className="rotate-180" />
          }
        </Button>
      </form>
    </div>
  );
}
