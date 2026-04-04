import json
from supabase import create_client, Client

# بيانات المشروع
url: str = "https://xginokdunnhesgohymja.supabase.co"
key: str = "ادخل_هنا_الـ_service_role_secret_بتاعك"

supabase: Client = create_client(url, key)

def upload_bible():
    # قراءة ملف الـ JSON
    with open('./public/bible-json/bible_fixed.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    all_verses = []

    # تجهيز البيانات
    for book in data:
        book_name = book.get('name')
        for c_idx, chapter in enumerate(book.get('chapters', [])):
            chapter_number = c_idx + 1
            for v_obj in chapter:
                all_verses.append({
                    "book_name": book_name,
                    "chapter_number": chapter_number,
                    "verse_number": v_obj.get('verse'),
                    "vocalized_text": v_obj.get('text_vocalized'),
                    "plain_text": v_obj.get('text_plain')
                })

    print(f"تم تجهيز {len(all_verses)} آية للرفع...")

    # الرفع على دفعات (Chunks) لتجنب مشاكل الـ Timeout
    chunk_size = 1000
    for i in range(0, len(all_verses), chunk_size):
        chunk = all_verses[i:i + chunk_size]
        try:
            response = supabase.table("bible_verses").insert(chunk).execute()
            print(f"تم رفع {i + len(chunk)} آية بنجاح...")
        except Exception as e:
            print(f"حدث خطأ في الدفعة التي تبدأ بـ {i}: {e}")

if __name__ == "__main__":
    upload_bible()
