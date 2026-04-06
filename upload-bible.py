import json
import http.client
import urllib.parse

# --- بيانات المشروع ---
SUPABASE_URL = "xginokdunnhesgohymja.supabase.co" # الرابط بدون https://
API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnaW5va2R1bm5oZXNnb2h5bWphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU2MzQ3NywiZXhwIjoyMDkwMTM5NDc3fQ.Yl_9kz8v24kzUkdO58XdvYKjCeHY1xmcxtIdFw2adgg'
TABLE_NAME = "bible_verses"

def upload_data():
    # 1. قراءة الملف
    try:
        with open('./public/bible-json/bible_fixed.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("خطأ: ملف bible_fixed.json غير موجود في المسار المحدد.")
        return

    # 2. تجهيز البيانات في قائمة واحدة (Flattening)
    all_verses = []
    for book in data:
        book_name = book.get('name')
        for c_idx, chapter in enumerate(book.get('chapters', [])):
            for v_obj in chapter:
                all_verses.append({
                    "book_name": book_name,
                    "chapter_number": c_idx + 1,
                    "verse_number": v_obj.get('verse'),
                    "vocalized_text": v_obj.get('text_vocalized'),
                    "plain_text": v_obj.get('text_plain')
                })

    print(f"تم تجهيز {len(all_verses)} آية. يبدأ الرفع الآن...")

    # 3. إعداد الاتصال بـ Supabase
    conn = http.client.HTTPSConnection(SUPABASE_URL)

    headers = {
        "apiKey": API_KEY,
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal" # لتقليل استهلاك الداتا
    }

    # 4. الرفع على دفعات (Chunks)
    chunk_size = 500 # صغرنا الدفعة شوية لضمان الاستقرار
    for i in range(0, len(all_verses), chunk_size):
        chunk = all_verses[i:i + chunk_size]
        json_payload = json.dumps(chunk)

        try:
            conn.request("POST", f"/rest/v1/{TABLE_NAME}", json_payload, headers)
            response = conn.getresponse()

            if response.status in [200, 201]:
                print(f"✅ تم رفع {i + len(chunk)} آية...")
            else:
                print(f"❌ خطأ في الدفعة {i}: {response.status} - {response.read().decode()}")

            # قراءة الاستجابة عشان نقدر نبعت الطلب اللي بعده
            response.read()
        except Exception as e:
            print(f"❌ حدث خطأ تقني: {e}")

    conn.close()
    print("--- انتهت العملية ---")

if __name__ == "__main__":
    upload_data()
