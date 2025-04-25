"use client";
import { useEffect, useState } from "react";
import Controls from "../../../../components/Controls";
import VerseList from "../../../../components/VerseList";

export default function VersesPage({ params }) {
  const { book, chapter } = params;
  const [bible, setBible] = useState([]);
  const [search, setSearch] = useState("");
  const [fontSize, setFontSize] = useState(18);
  const [verses, setVerses] = useState([]);

  useEffect(() => {
    fetch("/ar_svd.json")
      .then((r) => r.json())
      .then((data) => {
        setBible(data);
        const arr = data[book].chapters[chapter];
        setVerses(arr);
      });

    const savedFont = +localStorage.getItem("fontSize") || 18;
    setFontSize(savedFont);
    const saved = JSON.parse(localStorage.getItem("lastRead"));
    if (saved?.book == book && saved.chapter == chapter) setSearch("");
  }, [book, chapter]);

  useEffect(() => {
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  const filtered = search
    ? bible.flatMap((b, bi) =>
        b.chapters.flatMap((chArr, ci) =>
          chArr
            .map((v, vi) => ({
              text: v,
              ref: `${b.name} ${ci + 1}:${vi + 1}`,
            }))
            .filter((x) => x.text.includes(search))
        )
      )
    : verses.map((v, i) => ({ text: v, idx: i }));

  const readAll = () => {
    const utter = new SpeechSynthesisUtterance(verses.join(" "));
    utter.lang = "ar-SA";
    speechSynthesis.speak(utter);
  };

  const saveLast = () => {
    localStorage.setItem("lastRead", JSON.stringify({ book, chapter }));
    alert("تم حفظ الموضع");
  };

  return (
    <div>
      <Controls
        search={search}
        onSearch={setSearch}
        fontSize={fontSize}
        onFontIncrease={() => setFontSize((s) => s + 2)}
        onFontDecrease={() => setFontSize((s) => s - 2)}
        onRead={readAll}
        onBookmark={saveLast}
      />
      <VerseList data={filtered} fontSize={fontSize} />
    </div>
  );
}
