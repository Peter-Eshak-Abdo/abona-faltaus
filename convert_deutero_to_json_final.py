#!/usr/bin/env python3
"""
convert_deutero_to_json_final.py

Usage:
  - ضع ملفات .doc/.docx في مجلد "temp_deutero_docx"
  - ثبّت: pip install python-docx regex
  - شغّل: python convert_deutero_to_json_final.py
Outputs:
  - ملفات JSON لكل سفر في output_deutero_json/
  - ملف مدمج public/bible-json/bible_fixed.json (يأخذ نسخة احتياطية إن وجد)
"""
import os
import re
import sys
import json
import unicodedata
import subprocess
from pathlib import Path
from shutil import copyfile
from datetime import datetime
from docx import Document

# ---- Config ----
INPUT_DIR = Path("temp_deutero_docx")
TEMP_DOCX_DIR = Path("temp_deutero_docx")
OUTPUT_DIR = Path("output_deutero_json")
MASTER_JSON_DIR = Path("public/bible-json")
MASTER_JSON_FILE = MASTER_JSON_DIR / "bible_fixed.json"

SOFFICE_CANDIDATES = [
    r"C:\Program Files\LibreOffice\program\soffice.exe",
    r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
    "/usr/bin/soffice",
    "/usr/local/bin/soffice",
    "soffice",
]

# ensure folders
INPUT_DIR.mkdir(exist_ok=True)
TEMP_DOCX_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)
MASTER_JSON_DIR.mkdir(parents=True, exist_ok=True)

# ---- Helpers ----
def normalize_unicode(s: str) -> str:
    if not s:
        return ""
    s = unicodedata.normalize("NFKC", s)
    s = s.replace("\r", "\n")
    s = re.sub(r"[ \t\u00A0]+", " ", s)
    # keep paragraph breaks
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()

# Remove Arabic diacritics (for text_plain)
def remove_arabic_diacritics(s: str) -> str:
    if not s:
        return ""
    return re.sub(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]', '', s).replace('\u200f','').strip()

# find soffice executable if available
def find_soffice():
    for p in SOFFICE_CANDIDATES:
        try:
            if Path(p).exists():
                return str(p)
            if p == "soffice":
                if os.name == "nt":
                    r = subprocess.run(["where","soffice"], capture_output=True, text=True)
                else:
                    r = subprocess.run(["which","soffice"], capture_output=True, text=True)
                if r.returncode == 0 and r.stdout.strip():
                    return r.stdout.splitlines()[0].strip()
        except Exception:
            continue
    return None

def convert_doc_to_docx(input_dir: Path, out_dir: Path):
    docs = sorted(list(input_dir.glob("*.doc")))
    if not docs:
        return []
    soffice = find_soffice()
    if not soffice:
        print("soffice not found: لا يمكن تحويل .doc تلقائياً. حول الملفات إلى .docx يدوياً أو ثبت LibreOffice.")
        return []
    args = [soffice, "--headless", "--convert-to", "docx", "--outdir", str(out_dir)] + [str(p) for p in docs]
    print("Converting .doc -> .docx using:", soffice)
    subprocess.run(args, check=True)
    return [out_dir / (p.stem + ".docx") for p in docs if (out_dir / (p.stem + ".docx")).exists()]

# read docx paragraphs (preserve paragraph gaps)
def read_docx_paragraphs(path: Path) -> str:
    doc = Document(path)
    paras = [p.text for p in doc.paragraphs]
    # join with double-newline to mark paragraph break: helpful when splitting by paragraphs
    return normalize_unicode("\n\n".join(paras))

# remove chapter markers inside a verse string ("الأصحَاحُ ...")
CHAPTER_KEYWORD_NORM = remove_arabic_diacritics("الأصحَاحُ").lower()
def strip_chapter_marker_from_text(orig_text: str):
    if not orig_text:
        return orig_text, False
    norm = remove_arabic_diacritics(orig_text).lower()
    idx = norm.find(CHAPTER_KEYWORD_NORM)
    if idx == -1:
        return orig_text, False
    # attempt to map normalized position back to original (best-effort)
    orig = orig_text
    parts=[]
    acc=[]
    total=0
    for ch in orig:
        chn = remove_arabic_diacritics(ch)
        parts.append(chn)
        total += len(chn)
        acc.append(total)
    orig_norm = ''.join(parts)
    pos = orig_norm.find(CHAPTER_KEYWORD_NORM)
    if pos == -1:
        # fallback: remove from occurrence of Arabic word in original naive
        m = re.search(r'(?mi)الأصح[^\n]*', orig_text)
        if m:
            return orig_text[:m.start()].rstrip(), True
        return orig_text, True
    start = None
    for i, v in enumerate(acc):
        if v > pos-1:
            start = i
            break
    if start is None:
        return orig_text, True
    cleaned = orig_text[:start].rstrip()
    return cleaned, True

# ---- splitting logic ----
# verse number regex: catches "1." "1)" "١." etc at start of line or after newline
VERSE_NUM_RE = re.compile(r'(?m)(?:^|\n)\s*([0-9\u0660-\u0669]{1,3})[\.\)\-:\t ]+')

# chapter heading regex (الإصحاح ...) at line start
CHAP_HEADING_RE = re.compile(r'(?mi)^\s*(?:سِفْرُ.*|الإصحَاحُ[^\n]*|الإصحاح[^\n]*|الأصحَاحُ[^\n]*|الأصحاح[^\n]*)', flags=re.MULTILINE)

def split_text_into_chapters(full_text: str):
    # find chapter heading positions
    matches = list(CHAP_HEADING_RE.finditer(full_text))
    if matches:
        starts = [m.start() for m in matches]
        chapters=[]
        # include leading text before first heading as chapter if any
        if starts and starts[0] > 0:
            before = full_text[:starts[0]].strip()
            if before:
                chapters.append(before)
        for i, st in enumerate(starts):
            end = starts[i+1] if i+1 < len(starts) else len(full_text)
            chunk = full_text[st:end].strip()
            chapters.append(chunk)
        return chapters
    # fallback: split by "الإصحاح" anywhere
    if re.search(r'(?i)الأصح|الإصح', full_text):
        parts = re.split(r'(?mi)الأصح[^\n]*|(?mi)الإصح[^\n]*', full_text)
        parts = [p.strip() for p in parts if p.strip()]
        if parts:
            return parts
    # fallback2: split by double newlines (paragraph groups)
    paras = [p.strip() for p in re.split(r'\n{2,}', full_text) if p.strip()]
    if len(paras) > 1:
        return paras
    # final: entire text as single chapter
    return [full_text.strip()]

def split_chapter_to_verses(chap_text: str):
    # drop heading line if present at start
    lines = chap_text.splitlines()
    if lines and re.search(r'(?mi)^\s*(?:الإصحَاحُ|الإصحاح|الأصحَاحُ|الأصحاح)', lines[0]):
        body = "\n".join(lines[1:]).strip()
    else:
        # sometimes heading is in the middle of the chunk: remove any heading occurrences
        body = re.sub(r'(?mi)^\s*(?:سِفْرُ.*|الإصحَاحُ[^\n]*|الإصحاح[^\n]*|الأصحَاحُ[^\n]*|الأصحاح[^\n]*)', '', chap_text, flags=re.MULTILINE).strip()
    if not body:
        return []
    # find verse number matches
    matches = list(VERSE_NUM_RE.finditer(body))
    verses = []
    if matches:
        positions = [m.start() for m in matches] + [len(body)]
        for i, m in enumerate(matches):
            start = m.end()
            end = positions[i+1]
            piece = body[start:end].strip()
            # convert arabic-indic digits
            raw_num = m.group(1)
            raw_num = raw_num.translate(str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789"))
            try:
                num = int(raw_num)
            except:
                num = None
            cleaned_piece, found = strip_chapter_marker_from_text(piece)
            cleaned_piece = cleaned_piece.strip()
            verses.append({"verse": num if num is not None else (i+1), "text_vocalized": cleaned_piece})
        return verses
    # no explicit numbering -> split by double newline (paragraphs)
    paras = [p.strip() for p in re.split(r'\n{2,}', body) if p.strip()]
    if len(paras) > 1:
        out=[]
        for i,p in enumerate(paras):
            c,_ = strip_chapter_marker_from_text(p)
            out.append({"verse": i+1, "text_vocalized": c.strip()})
        return out
    # fallback split by single lines (if many lines)
    lines2 = [ln.strip() for ln in body.splitlines() if ln.strip()]
    if len(lines2) > 1:
        out=[]
        idx=1
        for ln in lines2:
            c,_ = strip_chapter_marker_from_text(ln)
            if len(c) < 6 and out:
                out[-1]["text_vocalized"] += " " + c  # append short fragment to previous
            else:
                out.append({"verse": idx, "text_vocalized": c})
                idx += 1
        return out
    # final fallback: whole body as single verse
    c,_ = strip_chapter_marker_from_text(body)
    return [{"verse": 1, "text_vocalized": c.strip()}]

# ---- process file ----
def process_docx(path: Path, desired_abbrev: str=None, desired_name: str=None):
    text = read_docx_paragraphs(path)
    if not text:
        print("Empty:", path.name)
        return None
    # determine name from first non-empty line if not given
    first_line = next((ln.strip() for ln in text.splitlines() if ln.strip()), "")
    name = desired_name or first_line or path.stem
    chapters_raw = split_text_into_chapters(text)
    chapters_out = []
    for chunk in chapters_raw:
        verses = split_chapter_to_verses(chunk)
        ch_out=[]
        for i, v in enumerate(verses):
            tv = (v.get("text_vocalized") or "").strip()
            num = v.get("verse") or (i+1)
            ch_out.append({
                "text_vocalized": tv,
                "verse": int(num) if str(num).isdigit() else (i+1),
                "text_plain": remove_arabic_diacritics(tv)
            })
        chapters_out.append(ch_out)
    abbrev = (desired_abbrev or path.stem).lower()
    return {"abbrev": abbrev, "name": name, "chapters": chapters_out}

# ---- save/merge ----
def save_book_json(book_obj: dict, out_dir: Path):
    out_path = out_dir / f"{book_obj['abbrev']}.json"
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(book_obj, f, ensure_ascii=False, indent=2)
    print("Saved:", out_path)
    return out_path

def merge_master(output_dir: Path, master_file: Path):
    files = sorted(output_dir.glob("*.json"))
    master = []
    if master_file.exists():
        bak = master_file.with_suffix(f".bak.{datetime.now().strftime('%Y%m%d%H%M%S')}")
        copyfile(master_file, bak)
        print("Backed up existing master to", bak)
        try:
            master = json.loads(master_file.read_text(encoding="utf-8"))
            if not isinstance(master, list):
                master = []
        except Exception:
            master = []
    for fn in files:
        try:
            bk = json.loads(fn.read_text(encoding="utf-8"))
            if not isinstance(bk, dict) or "abbrev" not in bk:
                print("Skipping invalid file:", fn.name)
                continue
            master = [m for m in master if m.get("abbrev") != bk["abbrev"]]
            master.append(bk)
        except Exception as e:
            print("Error reading", fn.name, e)
    with master_file.open("w", encoding="utf-8") as f:
        json.dump(master, f, ensure_ascii=False, indent=2)
    print("Wrote master:", master_file)

# ---- main ----
def main():
    print("Starting convert_deutero_to_json_final.py")
    # convert .doc -> .docx if present
    converted = convert_doc_to_docx(INPUT_DIR, TEMP_DOCX_DIR)
    docx_files = sorted(set(list(INPUT_DIR.glob("*.docx")) + converted))
    if not docx_files:
        print("No .docx files found in", INPUT_DIR.resolve())
        return
    processed=[]
    for p in docx_files:
        print("Processing:", p.name)
        try:
            book = process_docx(p)
            if book:
                save_book_json(book, OUTPUT_DIR)
                processed.append(book)
        except Exception as e:
            print("Error processing", p.name, e)
    if processed:
        merge_master(OUTPUT_DIR, MASTER_JSON_FILE)
    print("Done. Processed:", len(processed))

if __name__ == "__main__":
    main()
