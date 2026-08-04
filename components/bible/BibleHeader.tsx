import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import { UserCircle } from "lucide-react";
import {FaSearch} from "react-icons/fa";
import BibleSearch from "../BibleSearch";

type VerseObj = { verse: number; text_plain: string; text_vocalized: string };
type BookObj = { abbrev: string; name: string; chapters: VerseObj[][] };

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  updated_at: string;
}

export default function BibleHeader() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bibleData, setBibleData] = useState<BookObj[]>([]);
  const [currentBookIdx, setCurrentBookIdx] = useState(0);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const verseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [searchResults, setSearchResults] = useState<
    { bookIndex: number; chapterIndex: number; verseNumber: number; text: string; bookName: string; chapterNum: number }[]
  >([]);

  const toggleVerseSelection = (verseNum: number) => {
    setSelectedVerses(prev =>
      prev.includes(verseNum) ? prev.filter(v => v !== verseNum) : [...prev, verseNum]
    );
  };


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

  const handleSelectSearchResult = (bookIdx: number, chapterIdx: number, verseNumber: number) => {
    setCurrentBookIdx(bookIdx);
    setCurrentChapterIdx(chapterIdx);
    setIsSearchOpen(false);

    setTimeout(() => {
      toggleVerseSelection(verseNumber);
      const verseKey = `${bookIdx}-${chapterIdx}-${verseNumber}`;
      const verseElement = verseRefs.current[verseKey];

      if (verseElement) {
        verseElement.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        document.getElementById(`verse-${verseNumber}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/70 backdrop-blur-md shadow-[0_4px_20px_rgba(31,31,31,0.04)]">
        <div className="h-5 w-full px-0.5 flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {user?.avatar_url ? (
              <Image src={user.avatar_url} alt={user.full_name} fill className="object-cover" sizes="auto" />
            ) : (
              <UserCircle className="w-5 h-5 text-stone-300" />
            )}

            {/* <img
            alt="Logo"
            className="h-3 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AP1WRLuvvpt5WZuH9UmkRJl_yg9q_9zEkdEI8BIKQW7hKxDszaEfF0LZHmTklSnUwaLWzL4JXFcWxwxJhideKh1nNrbvMGQsW4kR75MJGV-8jpaENyoiAQmE4wqOmuhhcyzlkKsBpxMyvJHhH1xKiuWVRY5dDk5elYRzNgG8wVTYVtCD0170avoGLgMevSDsMOh9dedlm71KKKLksRqHpme51g_zvAjngMn6rzAclvvepyaxf9JmklWW9OtKxJI"
          /> */}
            <span className="font-headline-md text-headline-md text-primary hidden sm:block">Abouna Faltaous</span>
          </div>

          <nav className="hidden lg:flex items-center gap-0.5 px-0.5">
            <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all px-1 py-0.5" href="/">Home</Link>
            <Link aria-current="page" className="transition-all text-primary font-bold bg-primary-fixed/30 rounded-full px-1 py-0.5" href="#">الكتاب المقدس</Link>
            <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all px-1 py-0.5" href="/al7an">الألحان</Link>
            <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all px-1 py-0.5" href="/chat">الشات بوت</Link>
          </nav>

          <div className="flex items-center gap-1">
            <button onClick={() => setIsSearchOpen(true)} className="p-0.5 bg-blue-100 text-blue-600 rounded-lg font-bold">
              <FaSearch size={8} />
            </button>
          </div>
        </div>
      </header>

      <BibleSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        bibleData={bibleData}
        onGoToVerse={handleSelectSearchResult}
      />
    </>
  );
}
