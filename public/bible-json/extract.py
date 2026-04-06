import json

# ضع اسم ملفك الأصلي هنا
input_filename = 'bible_fixed.json'
# اسم الملف الجديد الذي سيتم إنشاؤه
output_filename = 'books_mapping.json'

def transform_bible_json():
    try:
        # فتح الملف الأصلي وقراءته
        with open(input_filename, 'r', encoding='utf-8') as file:
            data = json.load(file)

        # استخراج البيانات وتحويلها للشكل المطلوب
        # نستخدم Dictionary Comprehension لسرعة التنفيذ
        result = {item["name"]: item["abbrev"] for item in data}

        # حفظ النتيجة في ملف جديد
        with open(output_filename, 'w', encoding='utf-8') as file:
            json.dump(result, file, ensure_ascii=False, indent=2)

        print(f"✅ تم بنجاح! تم استخراج البيانات في ملف: {output_filename}")
        print(f"📊 إجمالي عدد الأسفار التي تم تحويلها: {len(result)}")

    except FileNotFoundError:
        print("❌ خطأ: الملف الأصلي غير موجود. تأكد من وضع الملف بجانب السكربت.")
    except Exception as e:
        print(f"❌ حدث خطأ غير متوقع: {e}")

if __name__ == "__main__":
    transform_bible_json()
