# دليل نظام Orthodox RAG & إضافة كتب وتفاسير الآباء

هذا الدليل يوضح لك بالخطوات العملية كيف تجهز أي كتاب، تفسير، أو ملف نصي (سواء كان PDF، Word، أو صفحات ويب) وتحوله إلى بيانات مدخلة في قاعدة بيانات Supabase (Vector Store) عبر نظام الـ RAG.

---

## 1. كيف تضيف ملفات جديدة (PDF / Word / نصوص)؟

### القاعدة الذهبية:
نماذج الذكاء الاصطناعي وقواعد بيانات الفيكتور لا تقرأ ملفات الـ PDF أو Word مباشرة داخل الـ SQL، بل يجب تحويل المحتوى إلى **نصوص نظيفة (Clean Text / JSON)** مقسمة إلى مقاطع (Chunks)، ثم توليد Vector Embedding لها.

### الخطوات العملية:

#### الخطوة 1: استخراج النص من الـ PDF
إذا كان لديك تفسير (مثل تفسير كنيسة مارمرقس بمصر الجديدة، أو تفسير أبونا أنطونيوس فكري، أو كتب البابا شنودة):
1. **استخراج النص**:
   - يمكنك استخدام أداة مثل Word لتحويل الـ PDF إلى نص، أو موقع مثل Google Docs، أو كتابة سكربت بايثون سريع يقرأ الـ PDF.
2. **تنظيف النص**:
   - إزالة أرقام الصفحات الزائدة، الفهارس غير الضرورية، الترويسات المتكررة (Headers/Footers).

---

## 2. أفضل صيغة لتخزين الملفات محلياً قبل الرفع (JSON Format)

ضع الملفات داخل المجلد:
`data/rag_sources/` (يمكنك إنشاء هذا المجلد).

أنشئ ملف لكل مصدر بصيغة JSON، مثل: `data/rag_sources/masr_el_gedida_matthew.json`

### شكل بنية الـ JSON المطلوبة:

```json
[
  {
    "corpus_category": "patristic_commentary",
    "author": "كنيسة مارمرقس بمصر الجديدة",
    "work_title": "تفسير إنجيل متى",
    "reference_location": "متى 1: 1-17",
    "content": "نص التفسير الخاص بسلسلة أنساب السيد المسيح وكيف تؤكد تحقيق النبوات...",
    "metadata": {
      "testament": "New Testament",
      "book": "Matthew",
      "chapter": 1,
      "source_url": "st-takla.org / coptic-book.pdf"
    }
  },
  {
    "corpus_category": "patristic_commentary",
    "author": "كنيسة مارمرقس بمصر الجديدة",
    "work_title": "تفسير إنجيل متى",
    "reference_location": "متى 1: 18-25",
    "content": "نص التفسير الخاص بميلاد السيد المسيح وتفسير معنى اسم عمانوئيل الذي تفسيره الله معنا...",
    "metadata": {
      "testament": "New Testament",
      "book": "Matthew",
      "chapter": 1,
      "verses": "18-25"
    }
  }
]
```

---

## 3. تصنيفات المحتوى المعتمدة (Corpus Categories)

عند إضافة أي محتوى، حدد قيمة `corpus_category` بأحد القيم التالية حصرياً:

| التصنيف (`corpus_category`) | الاستخدام والأمثلة |
| :--- | :--- |
| `patristic_commentary` | تفاسير الكتاب المقدس (تفسير مصر الجديدة، أبونا تادرس يعقوب، أبونا أنطونيوس فكري). |
| `early_church_fathers` | كتابات آباء الكنيسة الأولى (أثناسيوس الرسولي، كيرلس الكبير، ذهبي الفم، باسيليوس الكبير، غريغوريوس النزينزي، مار إسحق السرياني). |
| `liturgy` | النصوص الطقسية والليتورجية (الخلاجي المقدس، الإبصلمودية، السنكسار، القطمارس، الدفنار، طقس الألحان). |
| `dogmatics` | اللاهوت والعقيدة والردود (كتب البابا شنودة الثالث: طبيعة المسيح، الخلاص، اللاهوت المقارن، قرارات المجامع المسكونية). |
| `prayers` | الصلوات والصلوات الأجبية والتأملات الروحية. |

---

## 4. حجم المقطع المثالي (Chunk Size)

- **لا تضع الإصحاح أو الكتاب كله في حقل `content` واحد.**
- **الحجم الأفضل لكل مقطع**: بين **400 إلى 900 حرف** (أو تفسير مجموعة أعداد مترابطة معاً مثل 3-5 آيات).
- **السبب**: عند استرجاع المرجع أثناء السؤال، يرسل النظام أدق فقرة تجيب على سؤال المستخدم بدون استهلاك غير مبرر للـ Tokens.

---

## 5. سكربت الرفع التلقائي لملفاتك الجديدة

أنشأنا لك سكربت يقرأ أي ملف JSON تضعه في مجلد `data/rag_sources/` ويقوم برفعها وحساب الفيكتور تلقائياً:

### الخطوة لتشغيل رفع ملفاتك:
1. ضع ملف الـ JSON الخاص بك داخل المجلد:
   `data/rag_sources/your_file.json`
2. نفّذ الأمر التالي في التيرمينال:
   ```bash
   npx tsx scripts/import-rag-json.ts data/rag_sources/your_file.json
   ```

---

## 6. خطة معالجة وتحويل كتب وفولدر `rag/` (PDF إلى JSON)

يحتوي مجلد `rag/` على 46 كتاب ومصدر هام تغطي:
1. **تفاسير العهدين القديم والجديد** (كنيسة مارمرقس بمصر الجديدة: التكوين، الخروج، اللاويين، العدد، التثنية، يشوع، القضاة، صموئيل، الملوك، الأخبار، عزرا، نحميا، طوبيا، يهوديت، أستير، أيوب، المزامير، الجامعة، النشيد، سيراخ، إشعياء، إرميا، المراثي، دانيال، عاموس، يوئيل).
2. **العقيدة واللاهوت والدفاعيات** (قداسة البابا شنودة الثالث: لاهوت المسيح، طبيعة المسيح، الخلاص في المفهوم الأرثوذكسي، بدعة الخلاص في لحظة، قانون الإيمان، شريعة الزوجة الواحدة، حتمية التجسد الإلهي).
3. **اللغة القبطية وقواعدها** (أبونا أندرياس المقاري أجزاء 1 و 2).
4. **الطقوس والليتورجيا والألحان** (ملفات p1 إلى p5 و bo24_004).

---

## 7. سكربت بايثون لتحويل واستخراج ملفات الـ PDF تلقائياً إلى Chunks

لتحويل أي ملف PDF من مجلد `rag/` إلى ملف JSON مهيأ للـ RAG والتدريب:

### تثبيت مكتبات الاستخراج (في حال لم تكن مثبتة):
```bash
pip install pypdf pymupdf
```

### كود السكربت المخصص `scripts/extract_rag_pdf.py`:
```python
import fitz # PyMuPDF
import json
import os
import sys

def extract_chunks_from_pdf(pdf_path, author, category, work_title, chunk_size=700, chunk_overlap=100):
    doc = fitz.open(pdf_path)
    full_text = ""
    
    print(f"📖 جاري قراءة: {pdf_path} (عدد الصفحات: {len(doc)})")
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text")
        # تنظيف أسطر الهيدر والفوتر المتكررة
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        full_text += " ".join(lines) + "\n\n"
    
    # تقسيم النص إلى Chunks بحجم مناسب
    chunks = []
    start = 0
    total_len = len(full_text)
    chunk_index = 1
    
    while start < total_len:
        end = start + chunk_size
        chunk_content = full_text[start:end].strip()
        
        if len(chunk_content) > 100: # تجاهل القطع الصغيرة جداً
            chunks.append({
                "corpus_category": category,
                "author": author,
                "work_title": work_title,
                "reference_location": f"مقطع {chunk_index}",
                "content": chunk_content,
                "metadata": {
                    "source_file": os.path.basename(pdf_path),
                    "chunk_index": chunk_index
                }
            })
            chunk_index += 1
            
        start += (chunk_size - chunk_overlap)
        
    return chunks

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("الاستخدام: python scripts/extract_rag_pdf.py <pdf_path> <author> <category> <work_title>")
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    author = sys.argv[2]
    category = sys.argv[3]
    work_title = sys.argv[4]
    
    os.makedirs("data/rag_sources", exist_ok=True)
    chunks = extract_chunks_from_pdf(pdf_path, author, category, work_title)
    
    out_name = os.path.splitext(os.path.basename(pdf_path))[0] + ".json"
    out_path = os.path.join("data/rag_sources", out_name)
    
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)
        
    print(f"✅ تم استخراج {len(chunks)} مقطع بنجاح وحفظها في: {out_path}")
```

---

## 8. تدريب وتغذية الذكاء الاصطناعي (Fine-Tuning & RAG)

لديك طريقتان متكاملتان لتدريب الذكاء الاصطناعي على هذه البيانات:

### الطريقة الأولى: التخزين السحابي (Vector RAG) - الاسترجاع الفوري
1. بعد تحويل أي ملف إلى `data/rag_sources/*.json`.
2. شغّل أمر الفهرسة:
   ```bash
   npx tsx scripts/import-rag-json.ts data/rag_sources/your_extracted_file.json
   ```
3. يقوم النظام تلقائياً بتوليد Embeddings من خلال **Gemini Embedding** أو المحرك المحلي **Transformers** وتخزينها في جدول `orthodox_documents` في قاعدة بيانات Supabase.

### الطريقة الثانية: توليد داتاسيت Fine-Tuning (سؤال وجواب)
لتحويل فقرات الـ RAG إلى أزواج تدريبية (Instruction / Output) لتدريب نماذج LoRA المحلية:
```json
{
  "instruction": "ما هو المفهوم الأرثوذكسي لطبيعة السيد المسيح بحسب كتابات البابا شنودة الثالث؟",
  "input": "",
  "output": "طبيعة واحدة متجسدة لله الكلمة (ميا فيزيس)، لاهوت كامل وناسوت كامل بغير اختلاط ولا امتزاج ولا تغيير ولا انفصال..."
}
```

---

## 9. جدول توثيق المراجع المعتمدة والممنوعة

### المراجع الموصى بإضافتها (Recommended):
- تفاسير كنيسة مارمرقس بمصر الجديدة (العهد القديم والجديد).
- كتب القمص تادرس يعقوب ملطي (التفاسير وسير الآباء).
- تفاسير القمص أنطونيوس فكري للأسفار القانونية الأولى والثانية.
- كتب الآباء الكبار المترجمة من اليونانية/القبطية (مؤسسة القديس أنطونيوس / المركز الأرثوذكسي للدراسات الآبائية).
- كتب قداسة البابا شنودة الثالث اللاهوتية والطقسية والروحية.
- كتب الأنبا يوأنس (اللاهوت الطقسي وبستان الرهبان) والأنبا غريغوريوس.

### المراجع الممنوع إضافتها تماماً (Strictly Prohibited):
- تفاسير أو كتابات طائفية غير أرثوذكسية (لا تتفق مع الفكر القبطي الأرثوذكسي).
- أي نصوص تتنافى مع الإيمان الميامفيسي (طبيعة واحدة متجسدة لله الكلمة) أو أسرار الكنيسة السبعة.
- كتب غير موثقة المصدر كنسياً.
