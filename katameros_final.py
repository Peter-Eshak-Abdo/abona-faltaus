import json
import os

class KatamerosFixed:
    def __init__(self, katameros_folder, bible_path):
        self.readings_schedule = []
        self.bible_lookup = {} # قاموس سريع للبحث بالكود (gn, mt)

        # ========================================================
        # 1. خريطة التحويل من أرقام القطمارس إلى أكواد ملفك
        # (قمت بضبطها بناءً على lib/books.ts والترقيم القياسي)
        # ========================================================
        self.id_to_abbrev = {
            1: "gn", 2: "ex", 3: "lv", 4: "nm", 5: "dt", 6: "js", 7: "jd", 8: "rt",
            9: "1sm", 10: "2sm", 11: "1ki", 12: "2ki", 13: "1ch", 14: "2ch",
            15: "ezr", 16: "ne", 17: "to", 18: "jdt", 19: "es", # تأكد من كود استير في ملفك هل هو es أم est
            22: "job", 19: "ps", 20: "pr", 21: "ec", 22: "so", 23: "wi", 24: "sir",
            25: "is", 26: "jr", 27: "la", 28: "bar", 29: "ez", 30: "dn",
            31: "ho", 32: "jl", 33: "am", 34: "ob", 35: "jon", 36: "mic",
            37: "na", 38: "hab", 39: "zep", 40: "hg", 41: "zec", 42: "mal",
            # العهد الجديد
            40: "mt",  # متى
            41: "mk",  # مرقس
            42: "lk",  # لوقا
            43: "jn",  # يوحنا
            44: "ac",  # أعمال الرسل
            45: "ro",  # رومية
            46: "1co", 47: "2co", 48: "ga", 49: "ep", 50: "php", 51: "col",
            52: "1th", 53: "2th", 54: "1ti", 55: "2ti", 56: "ti", 57: "phm",
            58: "hb", 59: "ja", 60: "1pe", 61: "2pe", 62: "1jn", 63: "2jn", 64: "3jn",
            65: "jude", 73: "re" # الرؤيا نادراً ما تستخدم في القطمارس اليومي
        }

        print("🚀 جاري تحميل البيانات...")
        self._load_data(katameros_folder, bible_path)

    def _load_data(self, data_folder, bible_path):
        # تحميل جدول القطمارس
        with open(os.path.join(data_folder, 'AnnualReadings.json'), 'r', encoding='utf-8') as f:
            self.readings_schedule = json.load(f)

        # تحميل الكتاب المقدس
        if not os.path.exists(bible_path):
            print(f"❌ ملف الكتاب المقدس غير موجود في: {bible_path}")
            return

        with open(bible_path, 'r', encoding='utf-8') as f:
            raw_bible_list = json.load(f)

            # تحويل القائمة إلى قاموس ليسهل البحث فيه
            # Key = "mt", Value = { "chapters": [...] }
            for book in raw_bible_list:
                if "abbrev" in book:
                    self.bible_lookup[book["abbrev"]] = book

        print(f"✅ تم تحميل الكتاب المقدس ({len(self.bible_lookup)} سفر) بنجاح.")

    def get_readings(self, month, day):
        # البحث عن اليوم
        day_record = next((r for r in self.readings_schedule
                           if r["Month_Number"] == month and r["Day"] == day), None)

        if not day_record:
            return None

        result = {
            "title": day_record.get("DayName", "بدون عنوان"),
            "readings": {}
        }

        # مفاتيح القراءات في AnnualReadings.json
        map_keys = {
            "m_gospel": "M_Gospel_Ref", # إنجيل باكر
            "l_gospel": "L_Gospel_Ref", # إنجيل القداس
            "l_psalm": "L_Psalm_Ref",   # مزمور القداس
            "pauline": "P_Gospel_Ref",  # البولس
            "catholic": "C_Gospel_Ref", # الكاثوليكون
            "acts": "X_Gospel_Ref"      # الإبركسيس
        }

        for output_key, json_key in map_keys.items():
            ref_str = day_record.get(json_key)
            if ref_str:
                result["readings"][output_key] = self._fetch_text(ref_str)

        return result

    def _fetch_text(self, ref_string):
        """
        تفسير الكود وجلب النص
        Ref Format: 40.13:1-5  => (BookID.Chapter:Verses)
        """
        full_text = []
        # التعامل مع الفواصل الغريبة في البيانات *@+
        parts = ref_string.split('*@+')

        for part in parts:
            try:
                # part = "40.13:1-5"
                book_part, rest = part.split('.')
                book_id = int(book_part)

                # 1. تحويل الـ ID لـ Abbrev (مثلاً 40 -> mt)
                abbrev = self.id_to_abbrev.get(book_id)

                # تصحيح خاص للمزامير (أحياناً تأتي 19 وأحياناً ID آخر حسب النسخة)
                if book_id == 19: abbrev = "ps"

                if not abbrev or abbrev not in self.bible_lookup:
                    full_text.append(f"[سفر غير موجود: {book_id}]")
                    continue

                chapter_str, verses_str = rest.split(':')
                chapter_num = int(chapter_str) # رقم الإصحاح (بداية من 1)

                # 2. الوصول للسفر
                book_obj = self.bible_lookup[abbrev]
                chapters_list = book_obj["chapters"]

                # 3. الوصول للإصحاح
                # المصفوفات تبدأ من 0، والإصحاح 1 هو العنصر 0
                if chapter_num > len(chapters_list) or chapter_num < 1:
                    full_text.append(f"[إصحاح غير موجود: {chapter_num}]")
                    continue

                target_chapter = chapters_list[chapter_num - 1]

                # 4. تحليل الآيات المطلوبة (1-5 أو 1,3,5)
                target_indices = []
                if '-' in verses_str:
                    s, e = map(int, verses_str.split('-'))
                    target_indices = range(s, e + 1)
                elif ',' in verses_str:
                    target_indices = map(int, verses_str.split(','))
                else:
                    target_indices = [int(verses_str)]

                # 5. جلب نص الآيات
                # الهيكلة عندك: الإصحاح عبارة عن مصفوفة objects
                # [{ "verse": 1, "text_vocalized": "..." }, ...]
                for v_idx in target_indices:
                    # غالباً ترتيب الآيات في المصفوفة هو نفس رقم الآية - 1
                    # لكن للأمان سنبحث عنها لو الترتيب مختلف
                    verse_obj = None

                    # المحاولة السريعة (Direct Access)
                    if v_idx <= len(target_chapter):
                        candidate = target_chapter[v_idx - 1]
                        if candidate.get("verse") == v_idx:
                            verse_obj = candidate

                    # لو فشلت المحاولة السريعة، ابحث بالدوران
                    if not verse_obj:
                        verse_obj = next((v for v in target_chapter if v["verse"] == v_idx), None)

                    if verse_obj:
                        full_text.append(f"{verse_obj.get('text_vocalized', '')} ({v_idx})")

            except Exception as e:
                full_text.append(f"[خطأ: {e}]")

        return " ".join(full_text)

# ==========================================
# التشغيل
# ==========================================
if __name__ == "__main__":
    # 1. مسار مجلد القطمارس (اللي فيه AnnualReadings.json)
    katameros_dir = "./extracted_data"

    # 2. مسار ملف الكتاب المقدس بتاعك (تأكد من المسار!)
    # P:/Projects/abona-faltaus/public/bible-json/bible-fixed.json
    my_bible_path = "public/bible-json/bible_fixed.json"

    app = KatamerosFixed(katameros_dir, my_bible_path)

    # تجربة: قراءات 1 توت
    print("\n📅 --- قراءات 1 توت ---")
    data = app.get_readings(1, 1) # شهر 1، يوم 1

    if data:
        print(f"العنوان: {data['title']}")
        print("\n📖 [إنجيل القداس]:")
        # ستظهر لك الآيات مشكلة الآن
        print(data['readings'].get('l_gospel', 'لا يوجد'))
