import { useState } from "react";
import { searchVerses } from "@/lib/bibleService";
import Link from "next/link";

const SearchModal = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    if (query.length > 2) {
      setResults(searchVerses(query));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">بحث في الكتاب المقدس</h2>
          <button onClick={onClose} className="text-red-500">
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بكلمة..."
            className="flex-1 border p-2 rounded"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            بحث
          </button>
        </div>

        <div className="search-results max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <div key={index} className="p-2 border-b">
              <Link
                href={`/bible/${result.book}/${result.chapter}#v${result.verse}`}
                className="block hover:bg-gray-100"
                onClick={onClose}
              >
                <strong>
                  {bookNames[result.book]} {result.chapter}:{result.verse}
                </strong>
                <p className="text-gray-600">{result.text}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
