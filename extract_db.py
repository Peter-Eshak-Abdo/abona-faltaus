import sqlite3
import json
import os

# ==========================================
# ⚙️ إعدادات المسار
# ضع هنا اسم ملف قاعدة البيانات الذي وجدته في المشروع
DB_PATH = './katameros-api/Core/KatamerosDatabase.db'  # أو katameros.db حسب ما تجد
OUTPUT_DIR = 'extracted_data'
# ==========================================

def extract_sqlite_to_json():
    # 1. التحقق من وجود الملف
    if not os.path.exists(DB_PATH):
        print(f"❌ خطأ: لم يتم العثور على ملف قاعدة البيانات في المسار: {DB_PATH}")
        print("💡 ابحث داخل مجلدات المشروع عن ملف ينتهي بـ .db أو .sqlite وانقله هنا أو عدل المسار.")
        return

    # 2. الاتصال بقاعدة البيانات
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 3. معرفة أسماء الجداول الموجودة
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    if not tables:
        print("⚠️ قاعدة البيانات فارغة أو لا تحتوي على جداول!")
        return

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    print(f"🔍 تم العثور على {len(tables)} جدول. جاري الاستخراج...")

    # 4. تحويل كل جدول لملف JSON
    for table_name in tables:
        table = table_name[0]
        try:
            # قراءة كل البيانات من الجدول
            cursor.execute(f"SELECT * FROM {table}")
            rows = cursor.fetchall()

            # قراءة أسماء الأعمدة
            col_names = [description[0] for description in cursor.description]

            # دمج البيانات مع أسماء الأعمدة
            data_list = []
            for row in rows:
                row_dict = dict(zip(col_names, row))
                data_list.append(row_dict)

            # الحفظ في ملف JSON
            output_file = os.path.join(OUTPUT_DIR, f"{table}.json")
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data_list, f, ensure_ascii=False, indent=4)

            print(f"✅ تم استخراج الجدول [{table}] -> {output_file} ({len(data_list)} سجل)")

        except Exception as e:
            print(f"⚠️ خطأ في استخراج الجدول {table}: {e}")

    conn.close()
    print("\n🎉 تمت العملية! البيانات موجودة في مجلد extracted_data")

if __name__ == "__main__":
    extract_sqlite_to_json()
