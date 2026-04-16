INSERT INTO daily_verses_pool (verse_id)
SELECT id FROM bible_verses
WHERE book_name LIKE '%John%'
  AND chapter_number = 3
  AND verse_number = 16
LIMIT 1;

INSERT INTO daily_verses_pool (verse_id)
SELECT id FROM bible_verses
WHERE book_name LIKE '%Matthew%'
  AND chapter_number = 5
  AND verse_number = 8
LIMIT 1;

INSERT INTO daily_verses_pool (verse_id)
SELECT id FROM bible_verses
WHERE book_name LIKE '%Psalms%'
  AND chapter_number = 23
  AND verse_number = 1
LIMIT 1;

INSERT INTO daily_verses_pool (verse_id)
SELECT id FROM bible_verses
WHERE book_name LIKE '%Romans%'
  AND chapter_number = 15
  AND verse_number = 33
LIMIT 1;

INSERT INTO daily_verses_pool (verse_id)
SELECT id FROM bible_verses
WHERE book_name LIKE '%Proverbs%'
  AND chapter_number = 3
  AND verse_number = 5
LIMIT 1;