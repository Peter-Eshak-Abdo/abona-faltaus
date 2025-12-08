"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type AnyObj = Record<string, any>;

function findSections(obj: AnyObj): AnyObj | null {
  if (!obj) return null;
  if (Array.isArray(obj.sections)) return obj;
  if (Array.isArray(obj.reading?.sections)) return obj.reading;
  if (Array.isArray(obj.data?.sections)) return obj.data;
  // search deep
  const queue = [obj];
  while (queue.length) {
    const cur = queue.shift();
    if (!cur || typeof cur !== "object") continue;
    if (Array.isArray(cur.sections)) return cur;
    for (const k of Object.keys(cur)) {
      if (typeof cur[k] === "object") queue.push(cur[k]);
    }
  }
  return null;
}

export default function ReadingViewer({ date, reading }: { date: string; reading: AnyObj }) {
  const [lang, setLang] = useState<"arabic" | "coptic" | "english">("arabic");
  const [openSection, setOpenSection] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("readingsLang");
    if (saved === "arabic" || saved === "coptic" || saved === "english") setLang(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("readingsLang", lang);
  }, [lang]);

  const picked = findSections(reading);
  const titleObj = picked?.title || reading?.title || { arabic: date, english: date };

  if (!picked) {
    return (
      <div className="p-1 border rounded">
        <div className="text-sm text-gray-500 mb-1">لا توجد أقسام بصيغة متوقعة — عرض الخام:</div>
        <pre className="bg-gray-50 p-1 rounded max-h-[60vh] overflow-auto text-sm">{JSON.stringify(reading, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-1">
        <div>
          <div className="text-sm text-gray-500">التاريخ</div>
          <div className="text-lg font-semibold">{date}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">النوع</div>
          <div className="text-lg">{picked.type || reading.type || "قراءة"}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">اللغة</div>
          <div className="flex gap-1">
            <button onClick={() => setLang("arabic")} className={`p-1 rounded ${lang === "arabic" ? "bg-blue-600 text-white" : "border"}`}>عربي</button>
            <button onClick={() => setLang("coptic")} className={`p-1 rounded ${lang === "coptic" ? "bg-blue-600 text-white" : "border"}`}>قبطي</button>
            <button onClick={() => setLang("english")} className={`p-1 rounded ${lang === "english" ? "bg-blue-600 text-white" : "border"}`}>English</button>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h2 className="text-xl font-bold">{(titleObj && (titleObj[lang] || titleObj.arabic || titleObj.english)) || date}</h2>
      </motion.div>

      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {picked.sections?.map((sec: any, si: number) => {
            const header = `${sec.title?.arabic || sec.title?.english || sec.type || sec.speaker || `Section ${si + 1}`}`;
            const verses = Array.isArray(sec.verses) ? sec.verses : Array.isArray(sec.text) ? sec.text : [];
            return (
              <motion.section
                layout
                key={si}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28 }}
                className="border rounded p-1 bg-white/60"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 font-medium">{header}</div>
                  <div className="flex gap-1">
                    <button title="عرض القسم" type="button" onClick={() => setOpenSection(openSection === si ? null : si)} className="p-1 border rounbuttonxt-sm">عرض</button>
                    <button
                      title="button"
                      type="button"
                      onClick={() => {
                        // copy whole section in selected language
                        const combined = verses.map((v: any, i: number) => {
                          const t = (lang === "arabic" && v.arabic) || (lang === "coptic" && v.coptic) || (lang === "english" && v.english) || v.arabic || v.english || v.coptic || "";
                          return `${i + 1}. ${t}`;
                        }).join("\n\n");
                        navigator.clipboard.writeText(combined || header);
                        const el = document.createElement("div");
                        el.textContent = "تم النسخ";
                        el.className = "fixed bottom-5 left-1/2 -translate-x-1/2 bg-black text-white p-1 rounded z-50";
                        document.body.appendChild(el);
                        setTimeout(() => el.remove(), 1200);
                      }}
                      className="p-1 border rounded text-sm"
                    >
                      نسخ
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {openSection === si && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28 }}
                      className="mt-1 space-y-1"
                    >
                      {verses.length === 0 && <div className="text-sm text-gray-500">لا توجد آيات في هذا القسم</div>}
                      {verses.map((v: any, vi: number) => {
                        const text = (lang === "arabic" && v.arabic) || (lang === "coptic" && v.coptic) || (lang === "english" && v.english) || v.arabic || v.english || v.coptic || "";
                        return (
                          <motion.div key={vi} layout className="p-1 rounded hover:bg-gray-50">
                            <div className="text-sm text-gray-400 mb-1">{vi + 1}</div>
                            <div className="whitespace-pre-wrap">{text}</div>
                            <div className="mt-1 flex gap-1">
                              <button onClick={() => navigator.clipboard.writeText(text)} className="p-1 border rounded text-sm">نسخ</button>
                              <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")} className="p-1 border rounded text-sm">واتساب</button>
                              <button onClick={() => {
                                if (navigator.share) {
                                  navigator.share({ title: `${titleObj?.english || date}`, text });
                                } else {
                                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                                }
                              }} className="p-1 border rounded text-sm">مشاركة</button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
