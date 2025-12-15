#!/usr/bin/env python3
"""
repair_bible_json.py

Usage:
    python repair_bible_json.py input.json output.json

What it does:
- يقرأ الملف JSON الموجود (يمكن أن يكون array من الكتب أو object)
- يزيل عبارات "الأصحَاحُ ..." الظاهرة داخل نصوص الآيات
- يجزّئ الآيات إلى أصحاحات: كل مكان يوجد به علامة "الأصحاح" يبدأ فصل جديد
- ينتج ملف JSON مرتّب: لكل كتاب -> chapters = [ [verseObj,...], [..], ... ]
- ينتج أيضاً تقرير بسيط عن المشاكل (آيات بدون رقم، آيات مكررة، عدد أصحاحات)
"""

import sys
import json
from pathlib import Path
import regex as re
import unicodedata

# -----------------------
# Helpers
# -----------------------
def remove_diacritics(s: str) -> str:
    """إزالة الحركات/الـcombining marks من النص (للمطابقة غير الحساسة للتشكيل)."""
    # نطبّع ثم نحذف حركات Unicode marks
    nf = unicodedata.normalize("NFKD", s)
    return re.sub(r'[\p{M}]', '', nf)

def build_norm_map(orig: str):
    """
    يبني قائمة acc_lengths حيث acc_lengths[i] = الطول الحالي للنص المُنَزَّل من الأصل (بعد إزالة الحركات)
    بعد إدراج الرموز orig[0..i].
    يرجع (orig_norm, acc_lengths)
    """
    acc = []
    parts = []
    total = 0
    for ch in orig:
        ch_norm = remove_diacritics(ch)
        parts.append(ch_norm)
        total += len(ch_norm)
        acc.append(total)
    orig_norm = ''.join(parts)
    return orig_norm, acc

def find_substring_orig_indices(orig: str, substr_norm: str):
    """
    يجد موضع substr_norm (في النص المنزوَّل من الحركات) ويعيد إحداثيات البداية والنهاية في النص الأصلي.
    إن لم يوجد يعيد None.
    """
    orig_norm, acc = build_norm_map(orig)
    pos = orig_norm.find(substr_norm)
    if pos == -1:
        return None
    # إيجاد start_orig: أصغر i حيث acc[i] > pos-1
    start = None
    end = None
    # نهاية في الـnorm
    end_pos = pos + len(substr_norm)
    for i, val in enumerate(acc):
        if start is None and val > pos - 1:
            start = i
        if end is None and val >= end_pos:
            end = i + 1  # end index exclusive
            break
    if start is None:
        start = 0
    if end is None:
        end = len(orig)
    return start, end

# نمط كلمة الاصحاح بدون حساسية للتشكيل
# سنبحث في النص المنزوَّل (بدون حركات) عن كلمة "الاصحاح"
CHAPTER_KEYWORD = remove_diacritics("الأصحَاحُ").lower()  # => "الاصحاح"

def strip_chapter_marker_from_text(orig_text: str):
    """
    إذا كان النص يحتوي على كلمة 'الاصحاح' بتركيبة ما، نحذف من ظهور الكلمة وحتى نهاية السطر.
    نعيد: cleaned_text, found_flag
    """
    if not orig_text:
        return orig_text, False
    orig_norm = remove_diacritics(orig_text).lower()
    idx = orig_norm.find(CHAPTER_KEYWORD)
    if idx == -1:
        return orig_text, False
    # نريد حذف من موقع العثور وحتى نهاية النص الأصلي
    coords = find_substring_orig_indices(orig_text, orig_norm[idx:])
    if coords is None:
        # لو فشل الخريطة، نكتفي بحذف من خلال تعويض على النص المنزّل (أبسط fallback)
        cleaned_norm = orig_norm[:idx].rstrip()
        # نحاول إعادة بناء تقريبية: حذف الحروف المتطابقة في الأصل حتى نصل للطول المكافئ
        # أسهل: نستخدم replace على النسخة الأصلية بعد إزالة الحركات
        # لكن البساطة: سنزيل آخر 100 حرف كحد أقصى (fallback)
        fallback = orig_text
        # محاولة أفضل: حذف كل حروف عالٍ من نهاية تطابق بعد إزالة الحركات
        # للفشل، نرجع cleaned_norm بدون mapping
        return re.sub(r'\s+$', '', orig_text[:max(0, len(orig_text)-100)]).rstrip(), True
    start, end = coords
    cleaned = orig_text[:start].rstrip()
    return cleaned, True

def flatten_chapters_field(chapters_field):
    """
    بعض الملفات قد تكون chapters = [ {verse...}, {verse...}, ... ]
    أو chapters = [ [ {verse...}, ... ], [..] ]
    هذه الدالة تعيد قائمة مسطحة من كائنات الآيات.
    """
    flat = []
    if not isinstance(chapters_field, list):
        return flat
    # إذا العناصر داخل قائمة وقابلة للتكرار
    for elem in chapters_field:
        if isinstance(elem, list):
            for v in elem:
                flat.append(v)
        elif isinstance(elem, dict):
            flat.append(elem)
        else:
            # تجاهل عناصر غير متوقعة
            continue
    return flat

# -----------------------
# Main processing
# -----------------------
def process_book(book_obj, book_index=None, report=None):
    """
    يعالج كتاب واحد ويعيد نسخة مصححة مع chapters مصفوفة.
    """
    chapters_field = book_obj.get("chapters", [])
    flat = flatten_chapters_field(chapters_field)

    new_chapters = []
    current_ch = []
    verse_count_total = 0
    anomalies = report.setdefault("anomalies", [])

    for i, v in enumerate(flat):
        # دعم صيغ مختلفة لحقل النص/رقم
        verse_num = v.get("verse") if isinstance(v, dict) else None
        text = None
        if isinstance(v, dict):
            # قد يكون هناك نص تحت 'text_vocalized' أو 'text'
            text = v.get("text_vocalized") or v.get("text") or ""
        else:
            # عنصر غير متوقع: تجاهل
            continue

        if not isinstance(text, str):
            text = str(text or "")

        # 1) نُزيل أي ماركر "الأصحاح..." الموجود داخل النص
        cleaned_text, found_marker = strip_chapter_marker_from_text(text)

        # 2) إذا الآية هي في الواقع مجرد علامة فصل (مثلاً text = "الأصحَاحُ الثَّالِثُ")
        # بعد التنظيف تصبح empty أو قصيرة جدًا -> نعتبرها فصل جديد فقط
        if found_marker and (cleaned_text.strip() == "" or len(cleaned_text.strip()) < 3):
            # فقط نبدأ فصل جديد (لا نضيف آية فارغة)
            if current_ch:
                new_chapters.append(current_ch)
            current_ch = []
            continue

        # 3) إذا وُجد مؤشر فصل داخل نفس السطر (نزلنا الماركر) => نضيف الجزء المتبقي كآية ثم نبدأ فصل جديد
        # أضف الحقل text_vocalized = cleaned_text
        verse_obj = {}
        verse_obj["text_vocalized"] = cleaned_text.strip()
        # احتفظ بالرقم لو موجود
        if verse_num is not None:
            try:
                verse_obj["verse"] = int(verse_num)
            except Exception:
                verse_obj["verse"] = verse_num
        else:
            # لو لا يوجد رقم نعطي None ونضيف تحذير
            verse_obj["verse"] = None
            anomalies.append({
                "type": "missing_verse_number",
                "book": book_obj.get("name"),
                "index_in_flat": i,
                "sample_text": (cleaned_text.strip()[:60] + "...") if cleaned_text else ""
            })
        # أضف حقل نص بلا تشكيل للتحسينات المستقبلية (search index)
        verse_obj["text_plain"] = remove_diacritics(verse_obj["text_vocalized"]).strip()
        current_ch.append(verse_obj)
        verse_count_total += 1

        # إذا كانت العلامة وُجدت داخل نفس السطر، نبدأ فصل جديد بعد إضافة الآية
        if found_marker:
            new_chapters.append(current_ch)
            current_ch = []

    # نهاية حلقة - أضف الفصل الأخير إن فيه آيات
    if current_ch:
        new_chapters.append(current_ch)

    # إذا ما اكتشفنا أي فصل (خارجياً)، نترك فصل واحد يحتوي كل الآيات
    if not new_chapters:
        # إذا لم تكن هناك آيات أبداً، حاول أن تترك الكائن كما هو
        new_chapters = [[]] if not flat else [ [
            {
                "verse": (v.get("verse") if isinstance(v, dict) else None),
                "text_vocalized": (v.get("text_vocalized") if isinstance(v, dict) else v.get("text") if isinstance(v, dict) else ""),
                "text_plain": remove_diacritics(v.get("text_vocalized") if isinstance(v, dict) else v.get("text") if isinstance(v, dict) else "")
            } for v in flat
        ] ]

    # تحديث الكتاب
    new_book = dict(book_obj)  # shallow copy
    new_book["chapters"] = new_chapters
    # optional: remove other fields that are noisy
    report.setdefault("books_processed", []).append({
        "book": book_obj.get("name") or book_obj.get("abbrev"),
        "chapters_count": len(new_chapters),
        "verses_count": verse_count_total
    })
    return new_book

def main():
    if len(sys.argv) < 3:
        print("Usage: python repair_bible_json.py input.json output.json")
        sys.exit(1)

    in_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])
    if not in_path.exists():
        print("Input not found:", in_path)
        sys.exit(1)

    data = json.loads(in_path.read_text(encoding="utf-8"))
    report = {}
    output = None

    # Determine structure
    if isinstance(data, list):
        # قائمة كتب
        new_books = []
        for idx, book in enumerate(data):
            nb = process_book(book, book_index=idx, report=report)
            new_books.append(nb)
        output = new_books
    elif isinstance(data, dict):
        # قد يكون dict يحتوي على كتب keyed by abbrev, أو يحتوي على single book
        # نتحقق إذا القيم قائمة كتب
        if "chapters" in data and ("abbrev" in data or "name" in data):
            # single book object
            output = process_book(data, book_index=0, report=report)
        else:
            # نفترض dict of books
            new_dict = {}
            for k, v in data.items():
                if isinstance(v, dict):
                    new_dict[k] = process_book(v, report=report)
                else:
                    # غير معهود، انسخ كما هو
                    new_dict[k] = v
            output = new_dict
    else:
        print("Unrecognized JSON top-level structure.")
        sys.exit(1)

    # حفظ الناتج
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    # حفظ التقرير
    report_path = out_path.with_name(out_path.stem + "_repair_report.json")
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print("Done.")
    print("Output:", out_path)
    print("Report:", report_path)
    # print summary
    books_processed = report.get("books_processed", [])
    for b in books_processed:
        print(f"- {b['book']}: chapters={b['chapters_count']} verses={b['verses_count']}")
    anomalies = report.get("anomalies", [])
    print("Anomalies found:", len(anomalies))
    if anomalies:
        print("Example anomaly:", anomalies[0])

if __name__ == "__main__":
    main()
