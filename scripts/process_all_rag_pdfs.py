import os
import sys
import json
import re
import fitz  # PyMuPDF

RAG_DIR = "rag"
OUTPUT_DIR = os.path.join("data", "rag_sources")

os.makedirs(OUTPUT_DIR, exist_ok=True)

def detect_metadata(filename):
    fname = filename.lower()
    
    # تفاسير كنيسة مارمرقس بمصر الجديدة
    if "تفسير" in fname or "سفر" in fname:
        return {
            "author": "كنيسة مارمرقس بمصر الجديدة",
            "category": "patristic_commentary",
            "work_title": filename.replace(".pdf", "").strip()
        }
    # كتب البابا شنودة الثالث
    elif "البابا شنودة" in filename or "البابا-شنودة" in filename:
        return {
            "author": "قداسة البابا شنودة الثالث",
            "category": "dogmatics",
            "work_title": filename.replace(".pdf", "").strip()
        }
    # اللغة القبطية
    elif "قبطي" in fname or "قواعد" in fname or "المقاري" in fname:
        return {
            "author": "الراهب أندرياس المقاري",
            "category": "liturgy",
            "work_title": filename.replace(".pdf", "").strip()
        }
    # حتمية التجسد الالهي
    elif "التجسد" in fname or "يعقوب" in fname:
        return {
            "author": "الأرشيدياكون حلمي القمص يعقوب",
            "category": "dogmatics",
            "work_title": filename.replace(".pdf", "").strip()
        }
    # كتب الطقوس والليتورجيا p1..p5
    elif fname.startswith("p") or fname.startswith("bo"):
        return {
            "author": "الكنيسة القبطية الأرثوذكسية",
            "category": "liturgy",
            "work_title": f"طقوس وصلوات الكنيسة - {filename.replace('.pdf', '')}"
        }
    else:
        return {
            "author": "الكنيسة القبطية الأرثوذكسية",
            "category": "dogmatics",
            "work_title": filename.replace(".pdf", "").strip()
        }

def clean_text(text):
    text = re.sub(r'[\r\n]+', ' ', text)
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()

def process_pdf(pdf_path, chunk_size=700, chunk_overlap=100):
    filename = os.path.basename(pdf_path)
    meta = detect_metadata(filename)
    
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        print(f"❌ خطأ أثناء فتح {filename}: {e}")
        return None

    full_text_pages = []
    for page_num in range(len(doc)):
        try:
            page = doc[page_num]
            text = page.get_text("text")
            cleaned = clean_text(text)
            if cleaned:
                full_text_pages.append(cleaned)
        except Exception:
            continue
            
    doc.close()
    
    full_text = " ".join(full_text_pages)
    if not full_text or len(full_text) < 50:
        print(f"⚠️ تحذير: الملف {filename} لا يحتوي على نصوص مستخرجة (قد يكون صور فقط / سكان).")
        return None

    chunks = []
    start = 0
    total_len = len(full_text)
    chunk_index = 1

    while start < total_len:
        end = start + chunk_size
        chunk_content = full_text[start:end].strip()

        if len(chunk_content) > 100:
            chunks.append({
                "corpus_category": meta["category"],
                "author": meta["author"],
                "work_title": meta["work_title"],
                "reference_location": f"مقطع {chunk_index}",
                "content": chunk_content,
                "metadata": {
                    "source_file": filename,
                    "chunk_index": chunk_index
                }
            })
            chunk_index += 1

        start += (chunk_size - chunk_overlap)

    return chunks

def main():
    pdf_files = [f for f in os.listdir(RAG_DIR) if f.endswith(".pdf")]
    print(f"📚 وجدنا {len(pdf_files)} ملف PDF داخل مجلد {RAG_DIR}/\n")
    
    processed_count = 0
    total_chunks = 0
    skipped_count = 0

    for idx, fname in enumerate(pdf_files, 1):
        pdf_path = os.path.join(RAG_DIR, fname)
        out_json_name = os.path.splitext(fname)[0] + ".json"
        out_json_path = os.path.join(OUTPUT_DIR, out_json_name)

        if os.path.exists(out_json_path):
            print(f"[{idx}/{len(pdf_files)}] ⏭️ موجود مسبقاً: {fname}")
            continue

        print(f"[{idx}/{len(pdf_files)}] 🔄 جاري المعالجة: {fname}")
        chunks = process_pdf(pdf_path)

        if chunks and len(chunks) > 0:
            with open(out_json_path, "w", encoding="utf-8") as f:
                json.dump(chunks, f, ensure_ascii=False, indent=2)
            print(f"   ✓ تم استخراج {len(chunks)} مقطع -> {out_json_name}")
            processed_count += 1
            total_chunks += len(chunks)
        else:
            skipped_count += 1

    print(f"\n==========================================")
    print(f"🎉 ملخص العملية:")
    print(f"- إجمالي الملفات المعالجة بنجاح: {processed_count}")
    print(f"- إجمالي المقاطع (Chunks) المستخرجة: {total_chunks}")
    print(f"- الملفات المتخطاة/فارغة: {skipped_count}")
    print(f"==========================================")

if __name__ == "__main__":
    main()
