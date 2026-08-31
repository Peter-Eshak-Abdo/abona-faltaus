import json
import os
import re

def main():
    ar_path = r"p:\Projects\abona-faltaus\data\coptic_io_temp\packages\data\src\ar\synaxarium\canonical.json"
    en_path = r"p:\Projects\abona-faltaus\data\coptic_io_temp\packages\data\src\en\synaxarium\canonical.json"
    output_dir = r"p:\Projects\abona-faltaus\data\synaxarium"
    os.makedirs(output_dir, exist_ok=True)

    with open(ar_path, "r", encoding="utf-8") as f:
        ar_data = json.load(f)

    with open(en_path, "r", encoding="utf-8") as f:
        en_data = json.load(f)

    months_meta = {
        "Tout": {"coptic": "Ⲑⲱⲟⲩⲧ", "arabic": "توت", "index": 1},
        "Baba": {"coptic": "Ⲡⲁⲱⲡⲉ", "arabic": "بابه", "index": 2},
        "Hator": {"coptic": "Ϩⲁⲑⲱⲣ", "arabic": "هاتور", "index": 3},
        "Kiahk": {"coptic": "Ⲭⲟⲓⲁⲕ", "arabic": "كيهك", "index": 4},
        "Toba": {"coptic": "Ⲧⲱⲃⲉ", "arabic": "طوبة", "index": 5},
        "Amshir": {"coptic": "Ⲙϣⲓⲣ", "arabic": "أمشير", "index": 6},
        "Baramhat": {"coptic": "Ⲡⲁⲣⲉⲙϩⲁⲧ", "arabic": "برمهات", "index": 7},
        "Baramouda": {"coptic": "Ⲡⲁⲣⲙⲟⲩⲧⲉ", "arabic": "برمودة", "index": 8},
        "Bashans": {"coptic": "Ⲡⲁϣⲟⲛⲥ", "arabic": "بشنس", "index": 9},
        "Paona": {"coptic": "Ⲡⲁⲱⲛⲓ", "arabic": "بؤونة", "index": 10},
        "Epep": {"coptic": "Ⲉⲡⲏⲡ", "arabic": "أبيب", "index": 11},
        "Mesra": {"coptic": "Ⲙⲉⲥⲱⲣⲏ", "arabic": "مسرى", "index": 12},
        "Nasie": {"coptic": "Ⲡⲓⲕⲟⲩϫⲓ ⲛ̀ⲁ̀ⲃⲟⲧ", "arabic": "النسيء", "index": 13}
    }

    coptic_numbers = {
        1: "ⲁ̅", 2: "ⲃ̅", 3: "ⲅ̅", 4: "ⲇ̅", 5: "ⲉ̅",
        6: "ⲋ̅", 7: "ⲍ̅", 8: "ⲏ̅", 9: "ⲑ̅", 10: "ⲓ̅",
        11: "ⲓ̅ⲁ̅", 12: "ⲓ̅ⲃ̅", 13: "ⲓ̅ⲅ̅", 14: "ⲓ̅ⲇ̅", 15: "ⲓ̅ⲉ̅",
        16: "ⲓ̅ⲋ̅", 17: "ⲓ̅ⲍ̅", 18: "ⲓ̅ⲏ̅", 19: "ⲓ̅ⲑ̅", 20: "ⲕ̅",
        21: "ⲕ̅ⲁ̅", 22: "ⲕ̅ⲃ̅", 23: "ⲕ̅ⲅ̅", 24: "ⲕ̅ⲇ̅", 25: "ⲕ̅ⲉ̅",
        26: "ⲕ̅ⲋ̅", 27: "ⲕ̅ⲍ̅", 28: "ⲕ̅ⲏ̅", 29: "ⲕ̅ⲑ̅", 30: "ⲗ̅"
    }

    # Extract all keys (days)
    all_keys = list(ar_data.keys())
    
    combined_synaxarium = {}
    
    for key in all_keys:
        parts = key.split(" ", 1)
        day_num = int(parts[0]) if len(parts) > 1 and parts[0].isdigit() else None
        month_name = parts[1] if len(parts) > 1 else key
        
        m_meta = months_meta.get(month_name, {"coptic": month_name, "arabic": month_name, "index": 0})
        day_coptic_sym = coptic_numbers.get(day_num, str(day_num)) if day_num else ""
        coptic_date_title = f"{day_coptic_sym} {m_meta['coptic']}" if day_num else m_meta['coptic']
        arabic_date_title = f"{day_num} {m_meta['arabic']}" if day_num else m_meta['arabic']
        english_date_title = f"{day_num} {month_name}" if day_num else month_name

        ar_stories = ar_data.get(key, [])
        en_stories = en_data.get(key, [])

        combined_synaxarium[key] = {
            "date": {
                "day": day_num,
                "month_en": month_name,
                "month_ar": m_meta["arabic"],
                "month_cop": m_meta["coptic"],
                "month_index": m_meta["index"],
                "title_en": english_date_title,
                "title_ar": arabic_date_title,
                "title_cop": coptic_date_title,
            },
            "coptic_liturgical_doxology_header": {
                "coptic": "Ϧⲉⲛ ⲫ̀ⲣⲁⲛ ⲙ̀Ⲫ̀ⲓⲱⲧ ⲛⲉⲙ Ⲡ̀ϣⲏⲣⲓ ⲛⲉⲙ Ⲡⲓⲡ̀ⲛⲉⲩⲙⲁ Ⲉⲑⲟⲩⲁⲃ Ⲟⲩⲛⲟⲩϯ ⲛ̀ⲟⲩⲱⲧ: Ⲁ̀ⲙⲏⲛ.",
                "arabic": "باسم الآب والابن والروح القدس الإله الواحد. آمين.",
                "english": "In the name of the Father, and the Son, and the Holy Spirit, One God. Amen."
            },
            "coptic_liturgical_conclusion": {
                "coptic": "Ⲡⲟⲩⲭⲏ ⲉⲑⲟⲩⲁⲃ ⲉ̀ⲥⲉ̀ϣⲱⲡⲓ ⲛⲉⲙⲁⲛ: Ⲁ̀ⲙⲏⲛ. Ⲟⲩⲱ̀ⲟⲩ ⲙ̀Ⲫ̀ⲛⲟⲩϯ ϣⲁ ⲉ̀ⲛⲉϩ: Ⲁ̀ⲙⲏⲛ.",
                "arabic": "بركة صلواتهم فلتكن معنا ولربنا المجد دائماً أبدياً. آمين.",
                "english": "May their holy prayers be with us and Glory be to God forever. Amen."
            },
            "stories_ar": ar_stories,
            "stories_en": en_stories
        }

    # Save complete merged synaxarium
    with open(os.path.join(output_dir, "synaxarium_complete.json"), "w", encoding="utf-8") as f:
        json.dump(combined_synaxarium, f, ensure_ascii=False, indent=2)

    # Save separate clean Arabic
    with open(os.path.join(output_dir, "synaxarium_ar.json"), "w", encoding="utf-8") as f:
        json.dump(ar_data, f, ensure_ascii=False, indent=2)

    # Save separate clean English
    with open(os.path.join(output_dir, "synaxarium_en.json"), "w", encoding="utf-8") as f:
        json.dump(en_data, f, ensure_ascii=False, indent=2)

    print(f"Successfully generated Synaxarium dataset with {len(combined_synaxarium)} days.")

if __name__ == "__main__":
    main()
