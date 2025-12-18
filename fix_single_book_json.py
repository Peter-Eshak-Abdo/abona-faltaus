#!/usr/bin/env python3
"""
fix_single_book_json.py

Usage:
  python fix_single_book_json.py [input.json] [output.json]

Defaults:
  input.json  -> output_deutero_json/25-wisdom__deu.json
  output.json -> output_deutero_json/25-wisdom__deu.fixed.json

What it does:
  - يقرأ JSON لكتاب واحد (بنية: {abbrev,name,chapters:[ [ {text_vocalized,verse,text_plain}, ...], ... ]})
  - يزيل الفصول التي تحتوي فقط على عنوان الكتاب أو "الإصحاح ..." (مثلاً فصل واحد فيه "سفر الحكمة" أو "الإصحاح الأول").
  - إذا ظهرت عناوين في بداية الفصل (مثل "الإصحاح الأول" كجزء من أول آية) سيحاول إزالة السطر العلوي ثم الحفاظ على الآيات.
  - يحفظ النتيجة المصحّحة.
"""
import sys, json, re
from pathlib import Path

def normalize(s: str) -> str:
    if not s: return ""
    s = s.strip()
    # lowercase-like for arabic (no real lowercase) and remove diacritics-ish chars and punctuation for matching
    s = re.sub(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]', '', s)
    s = re.sub(r'[^\w\u0600-\u06FF\s]', '', s)  # remove punctuation but keep arabic letters/numbers
    s = re.sub(r'\s+', ' ', s).strip()
    return s

IS_HEADING_RE = re.compile(r'^(?:سفر\b|الإصحح|الإصحاح|الأصحاح|الاصحاح|اصحاح)\b', flags=re.IGNORECASE)

def is_heading_only_chapter(chapter):
    """
    chapter: list of verse-objects
    Return True if this chapter is just a heading like "سفر الحكمة" or "الإصحاح الأول"
    """
    if not isinstance(chapter, list) or len(chapter) == 0:
        return True
    # if chapter has a single verse and its text is very short or starts with "سفر" or "الإصحاح"
    if len(chapter) == 1:
        tv = chapter[0].get("text_vocalized", "") if isinstance(chapter[0], dict) else str(chapter[0])
        norm = normalize(tv)
        if not norm:
            return True
        # if contains 'سفر' or starts with 'الاصح' etc OR text length small (<30 chars) and few words
        if IS_HEADING_RE.search(norm) or norm.startswith("سفر") or norm.startswith("الاصح") or len(norm.split()) <= 3:
            return True
    return False

def strip_heading_line_from_verse_text(text):
    """
    If the verse text contains a leading 'الأصحَاحُ ...' or 'الإصحاح ...' line, remove that line.
    Return cleaned_text, removed_flag
    """
    if not text: return text, False
    # split into lines and drop leading heading-like lines
    lines = text.splitlines()
    # remove leading empty lines
    while lines and not lines[0].strip():
        lines.pop(0)
    removed = False
    if lines and re.match(r'(?mi)^\s*(?:سِفْرُ|سفر\b)', lines[0]):
        # drop the pure book-title line
        lines.pop(0)
        removed = True
    # drop any leading 'الإصحاح...' lines
    if lines and re.match(r'(?mi)^\s*(?:الإصحَاحُ|الإصحاح|الأصحَاحُ|الأصحاح)\b', lines[0]):
        lines.pop(0)
        removed = True
    return "\n".join(lines).strip(), removed

def fix_book_json(data):
    """
    data: dict with keys 'abbrev','name','chapters'
    returns fixed data
    """
    chapters = data.get("chapters", [])
    fixed_chapters = []
    i = 0
    # first pass: remove chapters that are heading-only
    while i < len(chapters):
        ch = chapters[i]
        if is_heading_only_chapter(ch):
            # if heading-only, remove it (skip)
            i += 1
            continue
        # not heading-only: for each verse in chapter, strip embedded headings from verse text
        new_ch = []
        for v in ch:
            if isinstance(v, dict):
                tv = v.get("text_vocalized", "")
                cleaned, removed = strip_heading_line_from_verse_text(tv)
                if removed:
                    v = dict(v)
                    v["text_vocalized"] = cleaned
                    # also update text_plain
                    if "text_plain" in v:
                        v["text_plain"] = normalize(cleaned)
                # if after cleaning the verse becomes empty, skip it
                if cleaned.strip():
                    new_ch.append(v)
                else:
                    # skip empty
                    continue
            else:
                new_ch.append(v)
        # Only add chapter if it has verses after cleaning
        if new_ch:
            fixed_chapters.append(new_ch)
        i += 1
    # second pass: ensure chapters have numeric verse numbers sequentially starting at 1
    for idx, ch in enumerate(fixed_chapters):
        for j, v in enumerate(ch):
            if isinstance(v, dict):
                v["verse"] = j+1
    data["chapters"] = fixed_chapters
    return data

def main():
    in_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("output_deutero_json/25-wisdom__deu.json")
    out_path = Path(sys.argv[2]) if len(sys.argv) > 2 else in_path.with_name(in_path.stem + ".fixed.json")
    if not in_path.exists():
        print("Input not found:", in_path)
        sys.exit(1)
    data = json.loads(in_path.read_text(encoding="utf-8"))
    fixed = fix_book_json(data)
    out_path.write_text(json.dumps(fixed, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Wrote fixed JSON:", out_path)
    # quick summary
    print("Chapters before:", len(data.get("chapters", [])), "after:", len(fixed.get("chapters", [])))
    if fixed.get("chapters"):
        print("Verses in chapter 1:", len(fixed["chapters"][0]))
        print("First verse example:", fixed["chapters"][0][0] if fixed["chapters"][0] else "empty")
        print("First verse example:", fixed["chapters"][0][1] if fixed["chapters"][1] else "empty")
        print("First verse example:", fixed["chapters"][0][2] if fixed["chapters"][2] else "empty")

if __name__ == "__main__":
    main()
