#!/usr/bin/env python3
"""
merge_single_verse_chapters.py

Usage:
  python merge_single_verse_chapters.py <input_json> [<output_json>] [--abbrev ABBREV]

- If input_json is a master list (array), use --abbrev to pick the book (default "25-wisdom__deu").
- If input_json is single-book JSON, it will fix that book.
- Output will be written to output_json (default: input.fixed.json).
"""
import sys, json, re
from pathlib import Path
import unicodedata

DEFAULT_ABBREV = "25-wisdom__deu"

def remove_diacritics(s: str) -> str:
    if not s: return ""
    return re.sub(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]', '', s).replace('\u200f','').strip()

def normalize(s: str) -> str:
    if not s: return ""
    s = unicodedata.normalize("NFKC", s)
    s = s.strip()
    s = re.sub(r'\s+', ' ', s)
    return s

# detect if a text is likely a heading (book title or chapter heading)
HEADING_PAT = re.compile(r'(?i)^(?:سِفْرُ\b|سفر\b|الإصحَاحُ|الإصحاح|الأصحَاحُ|الأصحاح|الاصحاح)\b')
HEADING_ANYWHERE = re.compile(r'(?i)(الإصح|الأصح|سفر)')

def is_heading_text(txt: str) -> bool:
    if not txt: return False
    t = normalize(remove_diacritics(txt))
    if not t: return True
    # if starts with book/chapter keywords
    if HEADING_PAT.search(t):
        return True
    # short strings that are likely heading-only (<=3 words and contains 'سفر' or 'اصحاح')
    words = t.split()
    if len(words) <= 3 and ('سفر' in t or 'اصحاح' in t or 'الاصحاح' in t):
        return True
    return False

def strip_leading_heading_lines(txt: str):
    # remove leading lines that are pure headings like "سفر ...", "الإصحاح الأول"
    if not txt: return txt
    lines = txt.splitlines()
    # drop leading blank lines
    while lines and not lines[0].strip():
        lines.pop(0)
    changed = False
    while lines:
        first = lines[0].strip()
        if not first:
            lines.pop(0); changed = True; continue
        if HEADING_ANYWHERE.search(remove_diacritics(first)):
            lines.pop(0); changed = True; continue
        break
    return ("\n".join(lines)).strip(), changed

def fix_book_obj(book: dict):
    chapters = book.get("chapters", [])
    new_chapters = []
    current_ch = None  # list of verse dicts
    for idx, ch in enumerate(chapters):
        # skip empty chapter arrays
        if not isinstance(ch, list) or len(ch) == 0:
            continue
        # get the textual content of this chapter-array's first item (most cases single-element arrays)
        first_item = ch[0]
        first_text = ""
        if isinstance(first_item, dict):
            first_text = first_item.get("text_vocalized", "") or first_item.get("text", "") or ""
        else:
            first_text = str(first_item)
        # if this array is a heading-only (مثل "سفر الحكمة" أو "الإصحاح الأول")
        if len(ch) == 1 and is_heading_text(first_text):
            # start a new chapter boundary: push existing current_ch if any
            if current_ch and len(current_ch) > 0:
                new_chapters.append(current_ch)
            current_ch = []  # prepare to collect verses of next chapter
            continue  # skip adding this heading-as-verse
        # otherwise, if this array contains actual verse(s)
        # if it's multi-verse chunk (len>1), treat as a full chapter block:
        if len(ch) > 1:
            # if we were building a current chapter, flush it first
            if current_ch and len(current_ch) > 0:
                new_chapters.append(current_ch)
                current_ch = None
            # normalize and renumber verses in this multi-chunk
            processed = []
            for i,v in enumerate(ch):
                t = v.get("text_vocalized") if isinstance(v, dict) else str(v)
                t_clean, _ = strip_leading_heading_lines(t)
                processed.append({
                    "text_vocalized": t_clean,
                    "verse": i+1,
                    "text_plain": remove_diacritics(t_clean)
                })
            new_chapters.append(processed)
            continue
        # here length==1 and not heading => a single-verse chunk that should be appended to current chapter
        # ensure current_ch exists
        if current_ch is None:
            current_ch = []
        v = ch[0]
        t = v.get("text_vocalized") if isinstance(v, dict) else str(v)
        t_clean, removed = strip_leading_heading_lines(t)
        # append as verse object (verse will be renumbered later)
        current_ch.append({
            "text_vocalized": t_clean,
            "verse": None,
            "text_plain": remove_diacritics(t_clean)
        })
    # end loop
    if current_ch and len(current_ch) > 0:
        new_chapters.append(current_ch)
    # final renumbering
    for ci, ch in enumerate(new_chapters):
        for vi, v in enumerate(ch):
            v["verse"] = vi+1
            # ensure keys presence
            if "text_plain" not in v:
                v["text_plain"] = remove_diacritics(v.get("text_vocalized",""))
    book["chapters"] = new_chapters
    return book

def main():
    if len(sys.argv) < 2:
        print("Usage: python merge_single_verse_chapters.py <input_json> [output_json] [--abbrev ABBREV]")
        sys.exit(1)
    input_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2]) if len(sys.argv) >= 3 and not sys.argv[2].startswith("--") else None
    abbrev = DEFAULT_ABBREV
    # parse optional --abbrev
    if "--abbrev" in sys.argv:
        try:
            abbrev = sys.argv[sys.argv.index("--abbrev")+1]
        except:
            pass
    if not input_path.exists():
        print("Input file not found:", input_path)
        sys.exit(1)
    data = json.loads(input_path.read_text(encoding="utf-8"))
    wrote = False
    if isinstance(data, list):
        # master file -> find book with abbrev
        found = False
        for i, book in enumerate(data):
            if book.get("abbrev","").lower() == abbrev.lower():
                print(f"Found book {abbrev} at index {i}, fixing...")
                fixed = fix_book_obj(book)
                data[i] = fixed
                found = True
                break
        if not found:
            print("Book with abbrev not found in master. Trying to fix first matching name-like entry.")
            # fallback: try first where name contains 'حكمة' or so
            for i,book in enumerate(data):
                name = book.get("name","")
                if "حكمة" in name:
                    print("Fallback fix on", name)
                    data[i] = fix_book_obj(book)
                    found = True
                    break
        out_file = out_path or input_path.with_name(input_path.stem + ".fixed.json")
        out_file.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print("Wrote fixed master to", out_file)
        wrote = True
    elif isinstance(data, dict):
        # single book object
        book = data
        print("Fixing single-book JSON:", book.get("abbrev", "<no abbrev>"))
        fixed = fix_book_obj(book)
        out_file = out_path or input_path.with_name(input_path.stem + ".fixed.json")
        out_file.write_text(json.dumps(fixed, ensure_ascii=False, indent=2), encoding="utf-8")
        print("Wrote fixed book to", out_file)
        wrote = True
    else:
        print("Unknown JSON structure")
    if wrote:
        # print short summary
        fixed_obj = json.loads(out_file.read_text(encoding="utf-8"))
        if isinstance(fixed_obj, dict):
            ch = fixed_obj.get("chapters", [])
            print("Chapters:", len(ch))
            if ch:
                print("Verses in chapter 1:", len(ch[0]))
                print("Verses in chapter 1:", len(ch[1]))
                print("First verse:", ch[0][0])
                print("First verse:", ch[0][1])
        else:
            # master: try to find abbrev
            for book in fixed_obj:
                if book.get("abbrev","").lower() == abbrev.lower():
                    ch = book.get("chapters", [])
                    print("Chapters:", len(ch))
                    if ch:
                        print("Verses in chapter 1:", len(ch[0]))
                        print("Verses in chapter 1:", len(ch[1]))
                        print("First verse:", ch[0][0])
                        print("First verse:", ch[0][1])
                    break

if __name__ == "__main__":
    main()
