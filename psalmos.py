import docx
import json
import re

def remove_diacritics(text):
    """حذف التشكيل من النص العربي"""
    arabic_diacritics = re.compile(r'[\u064b-\u0652]')
    return re.sub(arabic_diacritics, '', text)

def clean_text(text):
    """تنظيف النص من المسافات الزائدة وعلامات التبويب"""
    return re.sub(r'\s+', ' ', text).strip()

def parse_docx_to_bible_json(file_path, book_name, abbrev):
    doc = docx.Document(file_path)

    # دمج كل نصوص الملف في نص واحد كبير مع الحفاظ على فواصل الفقرات
    full_text = ""
    for para in doc.paragraphs:
        if para.text.strip():
            full_text += para.text + "\n"

    # 1. تقسيم النص إلى أصحاحات/مزامير
    # نبحث عن كلمة "المزمور" أو "الأصحاح" كفاصل
    chapter_pattern = r'(?=اَلْمَزْمُورُ|الْمَزْمُورُ|اَلأَصْحَاحُ|الأَصْحَاحُ)'
    chapters_raw = re.split(chapter_pattern, full_text)

    final_chapters = []

    for chunk in chapters_raw:
        if not chunk.strip():
            continue

        # 2. داخل كل أصحاح، نبحث عن الآيات باستخدام الأرقام
        # نبحث عن رقم يتبعه نص (مثال: 1طُوبَى أو 1 طُوبَى)
        verse_parts = re.split(r'(\d+)', chunk)

        # verse_parts ستكون قائمة مثل: ['عنوان المزمور', '1', 'نص آية 1', '2', 'نص آية 2'...]
        current_chapter_verses = []

        for i in range(1, len(verse_parts), 2):
            v_num = int(verse_parts[i])
            v_text = clean_text(verse_parts[i+1])

            if v_text:
                current_chapter_verses.append({
                    "text_vocalized": v_text,
                    "verse": v_num,
                    "text_plain": remove_diacritics(v_text)
                })

        if current_chapter_verses:
            final_chapters.append(current_chapter_verses)

    return {
        "abbrev": abbrev,
        "name": book_name,
        "chapters": final_chapters
    }

# --- إعدادات الملفات ---
input_docx = 'psalms.docx'  # تأكد من اسم ملفك
output_json = 'bible_data.json'

try:
    data = parse_docx_to_bible_json(input_docx, "19-Psalms", "ps")

    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    print(f"✅ تم التحويل بنجاح! تم استخراج {len(data['chapters'])} أصحاح.")
    print(f"📁 الملف الناتج: {output_json}")

except Exception as e:
    print(f"❌ حدث خطأ: {e}")
