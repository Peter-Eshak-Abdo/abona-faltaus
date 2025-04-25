import useLocalStorage from "@/hooks/useLocalStorage";

const BookmarkButton = ({ verseRef, verseText }) => {
  const [bookmarks, setBookmarks] = useLocalStorage("bookmarks", []);

  const isBookmarked = bookmarks.some((b) => b.ref === verseRef);

  const toggleBookmark = () => {
    if (isBookmarked) {
      setBookmarks(bookmarks.filter((b) => b.ref !== verseRef));
    } else {
      setBookmarks([...bookmarks, { ref: verseRef, text: verseText }]);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      className="text-yellow-500 hover:text-yellow-700"
    >
      {isBookmarked ? "★" : "☆"}
    </button>
  );
};

export default BookmarkButton;
