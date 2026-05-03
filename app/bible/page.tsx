"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useRef } from "react";
import localforage from "localforage";
import { motion, AnimatePresence } from "framer-motion";
import { FaCopy, FaShareAlt, FaStar, FaPlay, FaStop, FaSearch, FaTimes, FaHeart, FaSpinner } from "react-icons/fa";
import { bookNames, shortBookNames } from "@/lib/books";
import BibleSearch from "@/components/BibleSearch";
import Link from "next/link";
import { loadBible } from "@/lib/bible-utils";

type VerseObj = { verse: number; text_plain: string; text_vocalized: string };
type BookObj = { abbrev: string; name: string; chapters: VerseObj[][] };

export default function BibleReaderPage() {
  const [bibleData, setBibleData] = useState<BookObj[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("جاري الاتصال بالسيرفر...");
  const [currentBookIdx, setCurrentBookIdx] = useState(0);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [fontSize, setFontSize] = useState(24);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([])
  // ADDED: State for search results and ref for verses
  const [searchResults, setSearchResults] = useState<
    { bookIndex: number; chapterIndex: number; verseNumber: number; text: string; bookName: string; chapterNum: number }[]
  >([]);
  const verseRefs = useRef<{ [key: string]: HTMLParagraphElement | null }>({});

  // MODIFIED: handleSearch function to support advanced search patterns
  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    let searchPredicate: (text: string) => boolean;

    if (lowerCaseSearchTerm.startsWith('^')) {
      const actualTerm = lowerCaseSearchTerm.substring(1);
      searchPredicate = (text) => text.toLowerCase().startsWith(actualTerm);
    } else if (lowerCaseSearchTerm.endsWith('$')) {
      const actualTerm = lowerCaseSearchTerm.slice(0, -1);
      searchPredicate = (text) => text.toLowerCase().endsWith(actualTerm);
    } else {
      searchPredicate = (text) => text.toLowerCase().includes(lowerCaseSearchTerm);
    }

    const results: { bookIndex: number; chapterIndex: number; verseNumber: number; text: string; bookName: string; chapterNum: number }[] = [];
    bibleData.forEach((book, bookIdx) => {
      book.chapters.forEach((chapter, chapterIdx) => {
        chapter.forEach((verseObj, verseIdx) => {
          if (searchPredicate(verseObj.text_plain)) {
            results.push({
              bookIndex: bookIdx,
              chapterIndex: chapterIdx,
              verseNumber: verseObj.verse,
              text: verseObj.text_plain,
              bookName: book.name,
              chapterNum: chapterIdx + 1,
            });
          }
        });
      });
    });
    setSearchResults(results);
  };

  // ADDED: handleSelectSearchResult function for navigating to a selected verse
  const handleSelectSearchResult = (bookIdx: number, chapterIdx: number, verseNumber: number) => {
    setCurrentBookIdx(bookIdx);
    setCurrentChapterIdx(chapterIdx);
    setSelectedVerses([verseNumber]); // Highlight the selected verse
    setIsSearchOpen(false); // Close search panel

    // Scroll to the verse after the chapter has rendered
    // Using setTimeout to ensure the DOM has updated with the new chapter/book
    setTimeout(() => {
      const verseKey = `${bookIdx}-${chapterIdx}-${verseNumber}`;
      const verseElement = verseRefs.current[verseKey];
      if (verseElement) {
        verseElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100); // A small delay to ensure DOM update
  };

  // ... (rest of the component logic, assuming it exists after the above functions)

  // Example of where BibleSearch might be rendered, assuming it's within the 18740 chars
  // This block should replace the existing BibleSearch component usage.
  return (
    <div className="bible-reader-container">
      {/* ... existing UI elements ... */}

      {/* MODIFIED: BibleSearch component usage to include onSelectResult */}
      <BibleSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
        searchResults={searchResults}
        onSelectResult={handleSelectSearchResult} // ADDED: Pass the new handler
      />

      {/* ... existing UI elements ... */}

      <div className="chapter-content">
        {/* ... existing chapter navigation/info ... */}

        {/* MODIFIED: Verse rendering loop to include ref for scrolling */}
        {bibleData[currentBookIdx]?.chapters[currentChapterIdx]?.map((verseObj) => (
          <p
            key={verseObj.verse}
            ref={(el) => (verseRefs.current[`${currentBookIdx}-${currentChapterIdx}-${verseObj.verse}`] = el)} // ADDED: Ref for scrolling
            className={`text-right leading-relaxed mb-4 ${
              selectedVerses.includes(verseObj.verse) ? "bg-yellow-200 dark:bg-yellow-700 rounded p-2" : ""
            }`}
            style={{ fontSize: `${fontSize}px` }}
          >
            <span className="font-bold ml-2 text-gray-600 dark:text-gray-400">{verseObj.verse}.</span>
            {verseObj.text_plain}
          </p>
        ))}

        {/* ... rest of the chapter content ... */}
      </div>

      {/* ... rest of the component's return JSX ... */}
    </div>
  );
}
