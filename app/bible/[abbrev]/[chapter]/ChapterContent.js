"use client"; // هذا السطر مهم لجعل المكون يعمل في الجهة العميلة (Client)

import { useState, useEffect } from "react";

export default function ChapterContent({ verses, }) {
  const [fontSize, setFontSize] = useState("base");

  // جلب حجم الخط من localStorage إذا كان موجودًا
  useEffect(() => {
    const storedFont = localStorage.getItem("fontSize") || "base";
    setFontSize(storedFont);
  }, []);

  // تغيير حجم الخط
  const handleFontSizeChange = (size) => {
    setFontSize(size);
    localStorage.setItem("fontSize", size); // حفظ الحجم في localStorage
  };

  const fontSizeClass =
    fontSize === "sm" ? "text-sm" : fontSize === "lg" ? "text-lg" : "text-base";

  return (
    <div>
      {/* التحكم في حجم الخط */}
      <div className="flex gap-2 text-sm mb-4">
        <span>حجم الخط:</span>
        <button
          onClick={() => handleFontSizeChange("sm")}
          className={`px-2 border rounded ${
            fontSize === "sm" ? "bg-gray-200" : ""
          }`}
        >
          A-
        </button>
        <button
          onClick={() => handleFontSizeChange("base")}
          className={`px-2 border rounded ${
            fontSize === "base" ? "bg-gray-200" : ""
          }`}
        >
          A
        </button>
        <button
          onClick={() => handleFontSizeChange("lg")}
          className={`px-2 border rounded ${
            fontSize === "lg" ? "bg-gray-200" : ""
          }`}
        >
          A+
        </button>
      </div>

      {/* عرض الآيات */}
      <div className="space-y-2">
        {verses.map((verse, idx) => (
          <p key={idx} className={fontSizeClass}>
            <strong>{idx + 1}</strong> - {verse}
          </p>
        ))}
      </div>

      {/* التنقل بين الإصحاحات */}
      <div className="mt-6 flex justify-between">
        {/* هنا يمكن إضافة روابط للتنقل بين الإصحاحات */}
      </div>
    </div>
  );
}
