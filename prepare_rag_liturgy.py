import json
import os

INPUT_DATASET = "./coptic_liturgy_dataset.json"
OUTPUT_DIR = "./data/rag_sources"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "liturgy_rag_chunks.json")

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
        "work_title": f"الخولاجي المقدس والألحان الطقسية - {category}",
        "reference_location": f"{season} - {instruction}",
        "content": content,
        "metadata": {
            "category": category,
            "season": season,
            "instruction": instruction,
            "source": "Liturgy Powerpoint Dataset"
        }
    }
    rag_items.append(rag_item)

# Limit to top representative distinct chunks for seeding
sampled_rag_items = rag_items[:100]

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(sampled_rag_items, f, ensure_ascii=False, indent=2)

print(f"تم إنشاء ملف RAG جاهز بنجاح: {OUTPUT_FILE} ويحتوي على {len(sampled_rag_items)} مقطع طقسي.")
