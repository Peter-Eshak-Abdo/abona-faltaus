import json
import os
import time

class KatamerosOffline:
    def __init__(self, data_folder):
        self.data_folder = data_folder
        self.readings_schedule = []
        self.verses_db = {}  # قاعدة بيانات سريعة للبحث
        self.books_map = {}

        # إعدادات اللغة (3 عادة هو العربي في هذه القاعدة، سنخمن أو نثبتها)
        self.preferred_bible_id = 3

        print("🚀 جاري تحميل البيانات (قد يستغرق لحظات)...")
        self._load_data()

    def _load_data(self):
        # 1. تحميل جدول القراءات السنوية
        with open(os.path.join(self.data_folder, 'AnnualReadings.json'), 'r', encoding='utf-8') as f:
            self.readings_schedule = json.load(f)

        # 2. تحميل أسماء الأسفار (Books)
        with open(os.path.join(self.data_folder, 'Books.json'), 'r', encoding='utf-8') as f:
            books_list = json.load(f)
            # تحويلها لقاموس لسهولة البحث: {BookId: Name}
            for b in books_list:
                # ملاحظة: الاسم قد يكون في جدول BooksTranslations، سنستخدم ID حالياً
                self.books_map[b['Id']] = b.get('Name', f"Safar {b['Id']}")

        # 3. تحميل الآيات (الجزء الأثقل والأهم)
        with open(os.path.join(self.data_folder, 'Verses.json'), 'r', encoding='utf-8') as f:
            raw_verses = json.load(f)
            # نقوم ببناء "فهرس" سريع (Hash Map)
            # المفتاح سيكون: "BibleId_BookId_Chapter_Verse"
            for v in raw_verses:
                key = f"{v['BibleId']}_{v['BookId']}_{v['Chapter']}_{v['Verse']}"
                self.verses_db[key] = v['Text']

        print("✅ تم تحميل البيانات وجاهز للعمل Offline!")

    def get_readings_for_date(self, month_id, day):
        """
        استدعاء القراءات بناء على الشهر القبطي واليوم
        Month 1 = توت, etc.
        """
        # البحث عن اليوم في الجدول
        day_record = next((item for item in self.readings_schedule
                           if item["Month_Number"] == month_id and item["Day"] == day), None)

        if not day_record:
            return None

        result = {
            "DayName": day_record.get("DayName"),
            "Season": day_record.get("Season"),
            "Readings": {}
        }

        # قائمة القراءات التي نريد جلب نصوصها
        # المفاتيح هنا هي الموجودة في الـ JSON مثل M_Psalm_Ref (مزمور باكر)
        readings_map = {
            "Vespers_Psalm": "V_Psalm_Ref",   # مزمور عشية
            "Vespers_Gospel": "V_Gospel_Ref", # إنجيل عشية
            "Matins_Psalm": "M_Psalm_Ref",    # مزمور باكر
            "Matins_Gospel": "M_Gospel_Ref",  # إنجيل باكر
            "Pauline": "P_Gospel_Ref",        # البولس
            "Catholic": "C_Gospel_Ref",       # الكاثوليكون
            "Acts": "X_Gospel_Ref",           # الإبركسيس
            "Liturgy_Psalm": "L_Psalm_Ref",   # مزمور القداس
            "Liturgy_Gospel": "L_Gospel_Ref"  # إنجيل القداس
        }

        for title, ref_key in readings_map.items():
            ref_string = day_record.get(ref_key)
            if ref_string:
                text_content = self._parse_and_get_text(ref_string)
                result["Readings"][title] = text_content

        return result

    def _parse_and_get_text(self, ref_string):
        """
        تحويل الشفرة المعقدة إلى نص
        Format Example: 19.96:1-2
        Complex Example: 47.5:11-21*@+47.6:1-13 (تعني قراءتين متصلتين)
        """
        full_text = []

        # بعض القراءات مفصولة بـ *@+ (بمعنى "و أيضا")
        parts = ref_string.split('*@+')

        for part in parts:
            try:
                # part = "19.96:1-2"
                # تقسيم الكتاب عن الاصحاح
                book_part, rest = part.split('.')
                book_id = int(book_part)

                # تقسيم الاصحاح عن الآيات
                chapter_part, verses_part = rest.split(':')
                chapter_id = int(chapter_part)

                # التعامل مع الآيات (قد تكون آية واحدة 1 أو مدى 1-5 أو متفرقة 1,3)
                verses_to_fetch = []

                if '-' in verses_part:
                    start, end = map(int, verses_part.split('-'))
                    verses_to_fetch = range(start, end + 1)
                elif ',' in verses_part:
                    verses_to_fetch = map(int, verses_part.split(','))
                else:
                    verses_to_fetch = [int(verses_part)]

                # جلب النصوص من قاعدة البيانات
                for v_num in verses_to_fetch:
                    # مفتاح البحث: BibleId_BookId_Chapter_Verse
                    # ملاحظة: BibleId = 3 للعربي (افتراضاً بناء على Katameros API)
                    key = f"{self.preferred_bible_id}_{book_id}_{chapter_id}_{v_num}"
                    text = self.verses_db.get(key, "--- نص غير موجود ---")
                    full_text.append(f"{text} ({v_num})")

            except Exception as e:
                full_text.append(f"[Error parsing ref: {part}]")

        return " ".join(full_text)

# ==========================================
# منطقة التجربة (Main)
# ==========================================
if __name__ == "__main__":
    # 1. حدد مجلد البيانات المستخرجة
    data_dir = "./extracted_data"

    # 2. تشغيل المحرك (سيأخذ ثواني للتحميل)
    engine = KatamerosOffline(data_dir)

    # 3. طلب قراءة يوم 1 توت (Month=1, Day=1)
    print("\n📅 جاري جلب قراءات عيد النيروز (1 توت)...")
    readings = engine.get_readings_for_date(4, 13)

    if readings:
        print(f"\n✝️  المناسبة: {readings['DayName']}")
        print(f"🍂 الموسم: {readings['Season']}")
        print("-" * 40)

        # عرض إنجيل باكر كمثال
        print("\n📖 [إنجيل باكر]:")
        print(readings['Readings'].get('Matins_Gospel', 'لا يوجد'))

        print("\n📖 [إنجيل القداس]:")
        print(readings['Readings'].get('Liturgy_Gospel', 'لا يوجد'))

    else:
        print("❌ لم يتم العثور على قراءات لهذا التاريخ.")
