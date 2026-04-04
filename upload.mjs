import { createClient } from '@supabase/supabase-client'
import fs from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVIC_ROLE_SECRET,
);

async function upload() {
  const data = JSON.parse(fs.readFileSync('./public/bible-json/bible_fixed.json', 'utf8'))
  const allVerses = []

  data.forEach(book => {
    book.chapters.forEach((chapter, cIdx) => {
      chapter.forEach(vObj => {
        allVerses.push({
          book_name: book.name,
          chapter_number: cIdx + 1,
          verse_number: vObj.verse,
          vocalized_text: vObj.text_vocalized,
          plain_text: vObj.text_plain
        })
      })
    })
  })

  console.log(`جاري رفع ${allVerses.length} آية...`)

  // رفع البيانات على دفعات (Chunks) عشان المتصفح ميهنجش
  for (let i = 0; i < allVerses.length; i += 1000) {
    const chunk = allVerses.slice(i, i + 1000)
    const { error } = await supabase.from('bible_verses').insert(chunk)
    if (error) console.error('خطأ في الدفعة:', error)
    else console.log(`تم رفع ${i + chunk.length} آية...`)
  }
}

upload()
