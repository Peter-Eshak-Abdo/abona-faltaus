import os
import json
import re

ROOT_DIR = r"P:\قداس ملايكة\قداس ملايكةةةةةة\St.Mary Elnozha Liturgy Powerpoint"
OUTPUT_JSON = "./lib/liturgies/data/full_liturgies_data.json"

def clean_text(text):
    return text.strip()

def extract_coptic_and_arabic(raw_text):
    lines = [l.strip() for l in raw_text.split('\n') if l.strip()]
    arabic_lines = []
    coptic_lines = []
    coptic_arabic_lines = []
    
    for line in lines:
        # Check if line contains coptic unicode characters
        has_coptic = any('\u2C80' <= ch <= '\u2CFF' or '\u03E2' <= ch <= '\u03EF' for ch in line)
        if has_coptic:
            coptic_lines.append(line)
        else:
            arabic_lines.append(line)
            
    return {
        "arabic": "\n".join(arabic_lines) if arabic_lines else raw_text,
        "coptic": "\n".join(coptic_lines) if coptic_lines else None,
        "coptic_arabic": None
    }

def build_full_hierarchy():
    with open("./coptic_liturgy_dataset.json", "r", encoding="utf-8") as f:
        items = json.load(f)

    # Group by category (القداس السنوي، الأعياد، كيهك، البصخة، الأجبية، الخ)
    categories_map = {}

    for idx, item in enumerate(items):
        cat = item.get("category", "liturgy")
        season = item.get("season", "annual")
        instruction = item.get("instruction", "صلوات")
        output = item.get("output", "").strip()

        if not output or len(output) < 3:
            continue

        if cat not in categories_map:
            categories_map[cat] = {}

        if season not in categories_map[cat]:
            categories_map[cat][season] = {}

        if instruction not in categories_map[cat][season]:
            categories_map[cat][season][instruction] = []

        parsed = extract_coptic_and_arabic(output)
        
        # Determine speaker
        speaker = "all"
        out_lower = output.lower()
        if "كاهن" in out_lower or "الرب مع جميعكم" in out_lower:
            speaker = "priest"
        elif "شماس" in out_lower or "صلوا" in out_lower or "انصتوا" in out_lower:
            speaker = "deacon"
        elif "شعب" in out_lower or "ومع روحك" in out_lower or "يا رب ارحم" in out_lower or "كيرياليسون" in out_lower:
            speaker = "people"

        categories_map[cat][season][instruction].append({
            "id": f"item-{idx}",
            "speaker": speaker,
            "arabic": parsed["arabic"],
            "coptic": parsed["coptic"],
            "coptic_arabic": parsed["coptic_arabic"]
        })

    # Format into LiturgyDocuments
    liturgy_documents = []
    
    # Priority folders
    main_sections = [
        ("00 القداس السنوى", "القداس السنوي", "Annual Liturgy", "#d97706"),
        ("03  شهر كيهك", "شهر كيهك والتسبحة الكيهكية", "Kiahk Liturgy", "#2563eb"),
        ("11 الصوم الكبير و صوم نينوى", "الصوم الكبير وصوم نينوى", "Great Lent", "#7c3aed"),
        ("14 البصخة", "البصخة المقدسة وأسبوع الآلام", "Holy Pascha", "#dc2626"),
        ("15 عيد القيامة", "عيد القيامة المجيد والخماسين", "Holy Resurrection", "#059669"),
        ("25 تسبحة", "الإبصالمودية والتسبحة السنوية", "Annual Tasbeha", "#0891b2"),
        ("صلوات الأجبية", "صلوات الأجبية المقدسة", "Agpeya Prayers", "#4f46e5"),
        ("صلوات متكررة", "الأواشي والمدائح والألحان", "Litanies & Doxologies", "#be185d"),
    ]

    for cat_key, cat_title_ar, cat_title_en, color in main_sections:
        if cat_key not in categories_map:
            continue
            
        groups = []
        season_data = categories_map[cat_key]
        
        for s_idx, (season_name, instructions) in enumerate(season_data.items()):
            sections = []
            for inst_name, verses_list in instructions.items():
                title_clean = inst_name.replace("أكمل النص الطقسي التالي من", "").replace("أكمل النص الطقسي من", "").strip()
                sections.append({
                    "id": f"sec-{len(sections)}",
                    "title": {
                        "arabic": title_clean or "صلوات ومردات",
                        "coptic": "",
                        "english": ""
                    },
                    "speaker": verses_list[0]["speaker"] if verses_list else "all",
                    "type": "prayer",
                    "verses": [
                        {
                            "arabic": v["arabic"],
                            "coptic": v["coptic"],
                            "coptic_arabic": v["coptic_arabic"]
                        }
                        for v in verses_list
                    ]
                })
            
            groups.append({
                "id": f"group-{s_idx}",
                "title": {
                    "arabic": season_name,
                    "coptic": "",
                    "english": season_name
                },
                "sections": sections
            })
            
        liturgy_documents.append({
            "id": cat_key.replace(" ", "-").replace("،", "-").lower(),
            "slug": cat_key.replace(" ", "-").replace("،", "-").lower(),
            "title": {
                "arabic": cat_title_ar,
                "coptic": "",
                "english": cat_title_en
            },
            "subtitle": f"كافة صلوات وقراءات ومردات {cat_title_ar}",
            "description": f"العرض الكامل والشامل لملفات الباوربوينت الأصلية بالترتيب الطقسي لـ {cat_title_ar}",
            "iconName": "FaChurch",
            "accentColor": color,
            "groups": groups
        })

    os.makedirs("./lib/liturgies/data", exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(liturgy_documents, f, ensure_ascii=False, indent=2)

    print(f"تم بنجاح بناء الهيكلية الكاملة: {len(liturgy_documents)} أقسام رئيسية تحتوي على كل ملفات الباوربوينت!")

if __name__ == "__main__":
    build_full_hierarchy()
