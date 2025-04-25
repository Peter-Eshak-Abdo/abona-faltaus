import bibleData from "@/public/ar_svd.json";

export const getChapterData = (bookAbbrev, chapterNumber) => {
  const book = bibleData.find((b) => b.abbrev === bookAbbrev);
  return book ? book.chapters[chapterNumber - 1] : [];
};

export const searchVerses = (query) => {
  const results = [];
  bibleData.forEach((book) => {
    book.chapters.forEach((chapter, chapterIndex) => {
      chapter.forEach((verse, verseIndex) => {
        if (verse.includes(query)) {
          results.push({
            book: book.abbrev,
            chapter: chapterIndex + 1,
            verse: verseIndex + 1,
            text: verse,
          });
        }
      });
    });
  });
  return results;
};
