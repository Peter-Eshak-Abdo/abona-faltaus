// app/bible/BibleClientPage.js (Client Component)
"use client";

import { useState } from "react";
import Link from "next/link";
import { bookNames, oldTestament, newTestament } from "@/lib/books";
import SearchModal from "@/components/SearchModal";

export default function BibleClientPage({ bible }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const getBooks = (abbrevs) =>
    abbrevs
      .map((abbr) => {
        const book = bible.find((b) => b.abbrev === abbr);
        if (!book) return console.warn(`Book ${abbr} not found in JSON file`);
        return { abbrev: abbr, name: bookNames[abbr] || abbr };
      })
      .filter(Boolean);

  const oldBooks = getBooks(oldTestament);
  const newBooks = getBooks(newTestament);

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">الكتاب المقدس</h1>
        <button
          onClick={() => setIsSearchOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          🔍 بحث
        </button>
      </div>
      <section>
        <h2 className="text-xl font-semibold mb-2">العهد القديم</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {oldBooks.map((book) => (
            <Link
              key={book.abbrev}
              // href={book.disabled ? "#" : `/bible/${book.abbrev}`}
              href={`/bible/${book.abbrev}`}
              // className={`${
              //   book.disabled
              //     ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              //     : "bg-blue-100 hover:bg-blue-200 text-blue-800"
              // } px-3 py-1 rounded text-right`}
              className="bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-blue-800 text-right"
              // onClick={book.disabled ? (e) => e.preventDefault() : undefined}
            >
              {book.name}
            </Link>
          ))}
        </div>
      </section>
      {/* <Link
        href={`/bible/${book.abbrev}/${chapter}`}
        className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-gray-800 text-center"
      /> */}
      <section>
        <h2 className="text-xl font-semibold mb-2">العهد الجديد</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {newBooks.map((book) => (
            <Link
              key={book.abbrev}
              href={`/bible/${book.abbrev}`}
              className="bg-green-100 hover:bg-green-200 px-3 py-1 rounded text-green-800 text-right"
            >
              {book.name}
            </Link>
          ))}
        </div>
      </section>
      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
    </div>
  );
}
