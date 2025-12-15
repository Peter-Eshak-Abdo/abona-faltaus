import os
import subprocess
import json
import regex as re
import unicodedata
from pathlib import Path
from docx import Document

# =========================
# الإعدادات
# =========================
INPUT_DIR = r"public/bib"
TEMP_DOCX_DIR = r"temp_docx"
OUTPUT_DIR = r"public/bible-json"

Path(TEMP_DOCX_DIR).mkdir(exist_ok=True)
Path(OUTPUT_DIR).mkdir(exist_ok=True)

# =========================
# تحويل DOC → DOCX
# =========================
def convert_doc_to_docx():
    docs = list(Path(INPUT_DIR).glob("*.doc"))
    if not docs:
        print("❌ لم يتم العثور على ملفات .doc")
        return False

    print(f"🔄 تحويل {len(docs)} ملف DOC → DOCX")
    SOFFICE_PATH = r"C:\Program Files\LibreOffice\program\soffice.exe"
    subprocess.run([
        SOFFICE_PATH,
        "--headless",
        "--convert-to", "docx",
        "--outdir", TEMP_DOCX_DIR,
        *[str(f) for f in docs]
    ], check=True)

    return True

# =========================
# تنظيف النص
# =========================
def normalize_text(text):
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"\s+", " ", text)
    text = text.replace("٠","0").replace("١","1").replace("٢","2") \
               .replace("٣","3").replace("٤","4").replace("٥","5") \
               .replace("٦","6").replace("٧","7").replace("٨","8").replace("٩","9")
    return text.strip()

# =========================
# قراءة ملف DOCX
# =========================
def read_docx(path):
    doc = Document(path)
    return normalize_text("\n".join(p.text for p in doc.paragraphs))

# =========================
# استخراج الأصحاحات والآيات
# =========================
VERSE_REGEX = re.compile(r"(\d+)\s*([^0-9]+)")

def parse_chapters(text):
    chapters = []
    current = []

    for num, verse in VERSE_REGEX.findall(text):
        current.append({
            "verse": int(num),
            "text_vocalized": verse.strip()
        })

    chapters.append(current)
    return chapters

# =========================
# التنفيذ
# =========================
if not convert_doc_to_docx():
    exit()

docx_files = list(Path(TEMP_DOCX_DIR).glob("*.docx"))
print(f"📖 قراءة {len(docx_files)} ملف DOCX")

bible = []

for f in docx_files:
    print("📘", f.name)
    text = read_docx(f)

    book_name = f.stem
    chapters = parse_chapters(text)

    bible.append({
        "abbrev": book_name.lower(),
        "name": book_name,
        "chapters": chapters
    })

# =========================
# حفظ JSON
# =========================
out_path = Path(OUTPUT_DIR) / "bible.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(bible, f, ensure_ascii=False, indent=2)

print("✅ تم إنشاء bible.json بنجاح")
