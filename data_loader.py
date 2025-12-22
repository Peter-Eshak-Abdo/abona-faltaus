import os
import json

class CopticLiturgyLoader:
    def __init__(self, repo_path):

        # repo_path:'Coptic-Liturgy-App'

        self.assets_path = os.path.join(repo_path, 'assets')
        self.data_store = {}

    def load_all_data(self):
        """يقوم بالبحث عن كل ملفات JSON داخل مجلد assets وتحميلها"""
        print(f"🔍 جاري البحث في: {self.assets_path}...")

        if not os.path.exists(self.assets_path):
            print("❌ خطأ: لم يتم العثور على مجلد assets. تأكد من مسار المشروع.")
            return

        # البحث داخل المجلدات الفرعية أيضًا (json, data, etc)
        for root, dirs, files in os.walk(self.assets_path):
            for file in files:
                if file.endswith(".json"):
                    file_path = os.path.join(root, file)
                    # نستخدم اسم الملف كمفتاح (مثلاً: agpeya)
                    key_name = file.replace('.json', '')
                    self._load_file(key_name, file_path)

        print(f"✅ تم تحميل {len(self.data_store)} ملفات بنجاح!")
        print(f"📂 الملفات المتاحة: {list(self.data_store.keys())}")

    def _load_file(self, key, path):
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.data_store[key] = data
        except Exception as e:
            print(f"⚠️ فشل قراءة الملف {key}: {e}")

    def get_content(self, file_key):
        """استدعاء محتوى ملف معين (مثل 'agpeya' أو 'liturgy')"""
        return self.data_store.get(file_key, [])

    def search_text(self, keyword):
        """دالة بحث تجريبية داخل كل الملفات"""
        results = []
        for file_key, content in self.data_store.items():
            # هذا الجزء يعتمد على هيكلة الملف، سنفترض أنها قائمة (List)
            if isinstance(content, list):
                for item in content:
                    # تحويل العنصر لنص للبحث فيه
                    str_item = str(item)
                    if keyword in str_item:
                        results.append((file_key, item))
        return results

# ==========================================
# طريقة الاستخدام (How to Call)
# ==========================================

if __name__ == "__main__":
    # 1. حدد مسار المجلد الذي حملته
    repo_path = "./Coptic-Liturgy-App"  # غير هذا المسار إذا كان مختلفاً

    # 2. إنشاء نسخة من الـ Loader
    loader = CopticLiturgyLoader(repo_path)

    # 3. تحميل البيانات
    loader.load_all_data()

    # 4. مثال: عرض الأجبية (تأكد من اسم الملف الظاهر في الـ Logs)
    # ملاحظة: الأسماء قد تختلف حسب محتوى الريبو، انظر للطباعة في السطر 30
    print("\n--- تجربة عرض صلاة باكر (مثال) ---")

    # لنفترض أننا وجدنا ملف اسمه 'agpeya' أو 'prayers'
    agpeya_data = loader.get_content('agpeya')

    if agpeya_data:
        # عرض أول 3 عناصر كعينة
        for i, prayer in enumerate(agpeya_data[:3]):
            print(f"\nPrayer #{i+1}:")
            # هنا نحاول تخمين مفاتيح الـ JSON (غالباً Ar_Text, Cop_Text, Title)
            # سنطبع العنصر كاملاً لتعرف الهيكلة أول مرة
            print(json.dumps(prayer, indent=4, ensure_ascii=False))
    else:
        print("⚠️ لم يتم العثور على ملف باسم 'agpeya'، تحقق من القائمة المطبوعة بالأعلى.")
