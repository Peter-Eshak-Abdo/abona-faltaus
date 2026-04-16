# هنا بتكتب الشواهد اللي أنت عايز تجمعها (اسم السفر إصحاح:آية)
verses_to_add = [
    "John 3:16",
    "Matthew 5:8",
    "Psalms 23:1",
    "Romans 15:33",
    "Proverbs 3:5"
]

sql_commands = []

for reference in verses_to_add:
    # بنفصل السفر عن الإصحاح والآية
    # مثال: "John 3:16" -> book="John", chapter_verse="3:16"
    parts = reference.rsplit(' ', 1)
    book_name = parts[0].strip()

    chapter, verse = parts[1].split(':')
    chapter = chapter.strip()
    verse = verse.strip()

    # بنكون أمر SQL بيستخدم LIKE عشان نتجاهل الأرقام اللي في الأول زي 50-John
    sql = f"""
INSERT INTO daily_verses_pool (verse_id)
SELECT id FROM bible_verses
WHERE book_name LIKE '%{book_name}%'
  AND chapter_number = {chapter}
  AND verse_number = {verse}
LIMIT 1;
"""
    sql_commands.append(sql.strip())

# حفظ الأوامر في ملف SQL
with open('insert_verses.sql', 'w', encoding='utf-8') as f:
    f.write('\n\n'.join(sql_commands))

print("تم إنشاء ملف insert_verses.sql بنجاح! خده حطه في Supabase SQL Editor.")
