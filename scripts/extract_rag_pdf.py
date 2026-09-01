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
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        full_text += " ".join(lines) + "\n\n"
    
    chunks = []
    start = 0
    total_len = len(full_text)
    chunk_index = 1
    
    while start < total_len:
        end = start + chunk_size
        chunk_content = full_text[start:end].strip()
        
        if len(chunk_content) > 100:
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
        print("Usage: python scripts/extract_rag_pdf.py <pdf_path> <author> <category> <work_title>")
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
