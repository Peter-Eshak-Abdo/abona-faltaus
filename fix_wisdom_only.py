#!/usr/bin/env python3
"""
fix_wisdom_only.py
Usage:
  python fix_wisdom_only.py <input_docx> <output_json>

Example:
  python fix_wisdom_only.py temp_deutero_docx/25-wisdom__deu.docx output_deutero_json/25-wisdom__deu.json
"""
import sys
import json
import unicodedata
import regex as re
from pathlib import Path
from docx import Document
from shutil import copyfile
from datetime import datetime

# ---------- helpers ----------
def normalize_unicode(s: str) -> str:
    if s is None: return ""
    s = unicodedata.normalize("NFKC", s)
    s = s.replace("\r", "\n")
    s = re.sub(r"[ \t\u00A0]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()

def remove_arabic_diacritics(s: str) -> str:
    if not s: return ""
    return re.sub(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]', '', s).replace('\u200f','').strip()

def read_docx_paragraphs(path: Path) -> str:
    doc = Document(path)
    paras = [p.text for p in doc.paragraphs]
    return normalize_unicode("\n\n".join(paras))

# remove heading "سفر ..." and "الإصحاح ..." if found at top or as standalone lines
def strip_title_and_chap_heading_lines(text: str):
    lines = text.splitlines()
    cleaned_lines = []
    for ln in lines:
        if re.match(r'(?mi)^\s*سفر\b', ln):
            # skip pure book title line
            continue
        if re.match(r'(?mi)^\s*(?:الإصحَاحُ|الإصحاح|الأصحَاحُ|الأصحاح)\b', ln):
            # skip chapter heading lines (we will split by them)
            continue
        cleaned_lines.append(ln)
    return "\n".join(cleaned_lines).strip()

# split full text into chapters using occurrences of "الإصحاح" headings;
# if none, treat entire text as single chapter and rely on verse numbers
CHAP_HEADING_RE = re.compile(r'(?mi)^\s*(?:الإصحَاحُ|الإصحاح|الأصحَاحُ|الأصحاح)[^\n]*', flags=re.MULTILINE)
def split_text_into_chapters(full_text: str):
    matches = list(CHAP_HEADING_RE.finditer(full_text))
    if matches:
        starts = [m.start() for m in matches]
        chapters=[]
        # include leading text before first heading if any
        if starts and starts[0] > 0:
            before = full_text[:starts[0]].strip()
            if before:
                chapters.append(before)
        for i, st in enumerate(starts):
            end = starts[i+1] if i+1 < len(starts) else len(full_text)
            chunk = full_text[st:end].strip()
            chapters.append(chunk)
        return chapters
    # fallback: split by double newlines into paragraph groups
    parts = [p.strip() for p in re.split(r'\n{2,}', full_text) if p.strip()]
    if len(parts) > 1:
        return parts
    return [full_text.strip()]

# verse regex: start of line or after newline a number (arabic-indic allowed) then dot/)/- etc
VERSE_NUM_RE = re.compile(r'(?m)(?:^|\n)\s*([0-9\u0660-\u0669]{1,3})[\.\)\-:\t ]+')

def strip_chapter_marker_from_text(orig_text: str):
    # remove any "الإصحاح..." embedded inside a verse text
    if not orig_text: return orig_text, False
    if re.search(r'(?mi)الأصح|الإصح', orig_text):
        cleaned = re.sub(r'(?mi)الأصح[^\n]*|(?mi)الإصح[^\n]*', '', orig_text).strip()
        return cleaned, True
    return orig_text, False

def split_chapter_to_verses(chap_text: str):
    # remove possible starting "الإصحاح ..." line
    lines = chap_text.splitlines()
    if lines and re.match(r'(?mi)^\s*(?:الإصحَاحُ|الإصحاح|الأصحَاحُ|الأصحاح)\b', lines[0]):
        body = "\n".join(lines[1:]).strip()
    else:
        body = chap_text.strip()
    if not body:
        return []
    matches = list(VERSE_NUM_RE.finditer(body))
    if matches:
        positions = [m.start() for m in matches] + [len(body)]
        verses = []
        for i, m in enumerate(matches):
            start = m.end()
            end = positions[i+1]
            piece = body[start:end].strip()
            raw_num = m.group(1)
            raw_num = raw_num.translate(str.maketrans("٠١٢٣٤٥٦٧٨٩","0123456789"))
            try:
                num = int(raw_num)
            except:
                num = i+1
            cleaned_piece, _ = strip_chapter_marker_from_text(piece)
            verses.append({"verse": num, "text_vocalized": cleaned_piece.strip()})
        return verses
    # no numbers: split by paragraph groups
    paras = [p.strip() for p in re.split(r'\n{2,}', body) if p.strip()]
    if len(paras) > 1:
        out=[]
        for i,p in enumerate(paras):
            c,_ = strip_chapter_marker_from_text(p)
            out.append({"verse": i+1, "text_vocalized": c.strip()})
        return out
    # fallback: split by single lines
    lines2 = [ln.strip() for ln in body.splitlines() if ln.strip()]
    if len(lines2) > 1:
        out=[]
        idx=1
        for ln in lines2:
            c,_ = strip_chapter_marker_from_text(ln)
            if len(c) < 6 and out:
                out[-1]["text_vocalized"] += " " + c
            else:
                out.append({"verse": idx, "text_vocalized": c})
                idx += 1
        return out
    # whole body as one verse
    c,_ = strip_chapter_marker_from_text(body)
    return [{"verse": 1, "text_vocalized": c.strip()}]

# ---------- main transform for a single file ----------
def convert_single_docx_to_json(input_path: Path, output_json_path: Path, abbrev: str, book_name: str, merge_master: bool=True):
    text = read_docx_paragraphs(input_path)
    # remove leading book title / chapter headings that appear as separate lines
    text = strip_title_and_chap_heading_lines(text)
    chapters_chunks = split_text_into_chapters(text)
    chapters_out = []
    for chunk in chapters_chunks:
        verses = split_chapter_to_verses(chunk)
        ch_out=[]
        for i,v in enumerate(verses):
            tv = (v.get("text_vocalized") or "").strip()
            num = v.get("verse") or (i+1)
            ch_out.append({
                "text_vocalized": tv,
                "verse": int(num) if str(num).isdigit() else (i+1),
                "text_plain": remove_arabic_diacritics(tv)
            })
        # only append non-empty chapters (but keep if empty to preserve index? here we skip empties)
        if ch_out:
            chapters_out.append(ch_out)
    book_obj = {"abbrev": abbrev, "name": book_name, "chapters": chapters_out}
    # write output file
    output_json_path.parent.mkdir(parents=True, exist_ok=True)
    output_json_path.write_text(json.dumps(book_obj, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Wrote:", output_json_path)
    # optional: merge into master bible_fixed.json by replacing same abbrev
    if merge_master:
        master = []
        master_file = Path("public/bible-json/bible_fixed.json")
        if master_file.exists():
            try:
                master = json.loads(master_file.read_text(encoding="utf-8"))
                if not isinstance(master, list):
                    master = []
            except Exception:
                master = []
            # backup
            bak = master_file.with_suffix(f".bak.{datetime.now().strftime('%Y%m%d%H%M%S')}")
            copyfile(master_file, bak)
            print("Backed up master to", bak)
        # remove any existing with same abbrev
        master = [m for m in master if m.get("abbrev") != abbrev]
        master.append(book_obj)
        master_file.parent.mkdir(parents=True, exist_ok=True)
        master_file.write_text(json.dumps(master, ensure_ascii=False, indent=2), encoding="utf-8")
        print("Updated master file:", master_file)
    return book_obj

# ---------- CLI ----------
def main():
    if len(sys.argv) < 3:
        print("Usage: python fix_wisdom_only.py <input_docx> <output_json>")
        sys.exit(1)
    input_docx = Path(sys.argv[1])
    output_json = Path(sys.argv[2])
    if not input_docx.exists():
        print("Input file not found:", input_docx)
        sys.exit(1)
    # change these if you named file differently
    abbrev = "25-wisdom__deu"
    book_name = "سفر الحكمة"
    obj = convert_single_docx_to_json(input_docx, output_json, abbrev, book_name, merge_master=True)
    print("Done. Book has", len(obj["chapters"]), "chapters. Example first verse:", obj["chapters"][0][0] if obj["chapters"] else "NO")

if __name__ == "__main__":
    main()
