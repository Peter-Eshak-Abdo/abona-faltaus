import { getChapterData } from '@/lib/bibleService';
import BookmarkButton from '@/components/BookmarkButton';
import AudioPlayer from '@/components/AudioPlayer';
import FontControls from '@/components/FontControls';
import useLocalStorage from '@/hooks/useLocalStorage';

export default function ChapterPage({ params }) {
  const { book, chapter } = params;
  const verses = getChapterData(book, chapter);

  const [fontSize] = useLocalStorage("fontSize", 16);
  // const [fontSize, setFontSize] = useLocalStorage("fontSize", 16);
  const [, setLastRead] = useLocalStorage("lastRead", null);
  // const [lastRead, setLastRead] = useLocalStorage("lastRead", null);

  // حفظ آخر قراءة
  useEffect(() => {
    setLastRead({ book, chapter, timestamp: Date.now() });
  }, [book, chapter]);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {bookNames[book]} {chapter}
        </h1>
        <FontControls />
      </div>

      <div className="verses space-y-4" style={{ fontSize: `${fontSize}px` }}>
        {verses.map((verse, index) => (
          <div key={index} className="verse flex gap-2">
            <span className="verse-number text-gray-500">{index + 1}</span>
            <div className="flex-1">
              <p className="verse-text text-right">{verse}</p>
              <div className="verse-actions flex gap-2 mt-1">
                <BookmarkButton
                  verseRef={`${book} ${chapter}:${index + 1}`}
                  verseText={verse}
                />
                <AudioPlayer text={verse} />
                <button
                  onClick={() => navigator.clipboard.writeText(verse)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  📋 نسخ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
