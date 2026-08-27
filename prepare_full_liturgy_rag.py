import json
import os
from math import ceil

INPUT_DATASET = "./coptic_liturgy_dataset.json"
OUTPUT_DIR = "./data/rag_sources"
os.makedirs(OUTPUT_DIR, exist_ok=True)

with open(INPUT_DATASET, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

rag_items = []
seen_texts = set()

for idx, item in enumerate(raw_data):
    content = item.get("output", "").strip()
    if not content or len(content) < 15 or content in seen_texts:
        continue
    
    seen_texts.add(content)
    category = item.get("category", "liturgy")
    season = item.get("season", "annual")
    instruction = item.get("instruction", "النصوص الطقسية")

    rag_item = {
        "corpus_category": "liturgy",
        "author": "الكنيسة القبطية الأرثوذكسية",
        "work_title": f"الخولاجي والتسبحة الطقسية - {category}",
        "reference_location": f"{season} - {instruction}",
        "content": content,
        "metadata": {
            "category": category,
            "season": season,
            "instruction": instruction,
            "source": "Liturgy Full Dataset"
        }
    }
    rag_items.append(rag_item)

# تقسيم البيانات إلى دفعات (Batches) كل دفعة 500 عنصر لرفعها بسلاسة
BATCH_SIZE = 500
total_batches = ceil(len(rag_items) / BATCH_SIZE)

for b in range(total_batches):
    batch_data = rag_items[b * BATCH_SIZE : (b + 1) * BATCH_SIZE]
    batch_file = os.path.join(OUTPUT_DIR, f"liturgy_rag_batch_{b+1}.json")
    with open(batch_file, "w", encoding="utf-8") as f:
        json.dump(batch_data, f, ensure_ascii=False, indent=2)

print(f"تم تجهيز {len(rag_items)} مقطع طقسي كامل ومقسمة على {total_batches} ملفات داخل {OUTPUT_DIR}.")
