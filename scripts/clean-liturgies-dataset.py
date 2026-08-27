import os
import json
import re

DATASET_FILE = "./coptic_liturgy_dataset.json"
LITURGIES_OUT = "./lib/liturgies/data/full_liturgies_data.json"
TASBEHA_OUT = "./lib/tasbeha/data/full_tasbeha_data.json"

# Coptic Unicode ranges
def is_coptic_char(char):
    code = ord(char)
    return (0x2C80 <= code <= 0x2CFF) or (0x03E2 <= code <= 0x03EF)

def is_arabic_char(char):
    code = ord(char)
    return (0x0600 <= code <= 0x06FF) or (0x0750 <= code <= 0x077F)

def clean_and_split_slide(raw_text):
    """
    تحليل كل سلايد وفصل:
    1. القبطي الأصلي
    2. القبطي المعرب
    3. العربي المترجم
    4. تحديد الرول (كاهن / شماس / شعب)
    5. استبعاد الفهارس المتكررة وقوائم الأزرار
    """
    lines = [l.strip() for l in raw_text.split('\n') if l.strip()]
    if not lines:
        return None

    # استبعاد الشرائح التي تمثل أزرار تنقل فقط (Menu slides)
    if len(lines) == 1 and ("القائمة" in lines[0] or "الرجوع" in lines[0] or "إبدأ هنا" in lines[0]):
        return None
    if all("القائمة" in l or "رجوع" in l for l in lines):
        return None

    arabic_lines = []
    coptic_lines = []
    coptic_arabic_lines = []

    speaker = "all"
    text_full = " ".join(lines)

    if any(k in text_full for k in ["يقول الكاهن", "الكاهن:", "يصلي الكاهن", "الرب مع جميعكم", "إيرينى باسى"]):
        speaker = "priest"
    elif any(k in text_full for k in ["يقول الشماس", "الشماس:", "إسبيثيتى", "صلوا من أجل", "إنصتوا بحكمة"]):
        speaker = "deacon"
    elif any(k in text_full for k in ["يجاوبه الشعب", "الشعب:", "ومع روحك", "يا رب ارحم", "كيرياليسون", "أمين أمين"]):
        speaker = "people"

    for line in lines:
        # إزالة زوائد القوائم وأرقام التنقل
        if line in ["القائمة", "الرجوع", "السابق", "التالي", "الرئيسية"]:
            continue

        coptic_chars_count = sum(1 for c in line if is_coptic_char(c))
        arabic_chars_count = sum(1 for c in line if is_arabic_char(c))
        
        # لو السطر قبطي يونيكود
        if coptic_chars_count > len(line) * 0.35:
            coptic_lines.append(line)
        # لو السطر قبطي معرب (يبدأ بألفاظ طقسية معربة مثل هيتين، خين، اؤووه، مارين، ذوكصاباتري...)
        elif any(line.startswith(prefix) for prefix in ["هيتين", "خين", "أووه", "مارين", "ذوكصا", "إكإسماروؤت", "شيرى", "تين أوؤشت"]):
            coptic_arabic_lines.append(line)
        else:
            arabic_lines.append(line)

    clean_arabic = "\n".join(arabic_lines).strip()
    clean_coptic = "\n".join(coptic_lines).strip() if coptic_lines else None
    clean_coptic_arabic = "\n".join(coptic_arabic_lines).strip() if coptic_arabic_lines else None

    # إذا لم يكن هناك عربي صريح، اجعل المحتوى هو المتاح
    if not clean_arabic and not clean_coptic and not clean_coptic_arabic:
        return None

    return {
        "speaker": speaker,
        "arabic": clean_arabic or (clean_coptic_arabic or clean_coptic or ""),
        "coptic": clean_coptic,
        "coptic_arabic": clean_coptic_arabic
    }

def generate_organized_liturgy():
    with open(DATASET_FILE, "r", encoding="utf-8") as f:
        items = json.load(f)

    # هيكل الترتيب الكنسي المنظم
    liturgy_seasons = {
        "00-annual": {
            "title": "القداس السنوي ورفع بخور",
            "english": "Annual Liturgy & Incense",
            "color": "#d97706",
            "groups": {}
        },
        "03-kiahk": {
            "title": "شهر كيهك المريمي والتسبحة",
            "english": "Kiahk Month & Praises",
            "color": "#2563eb",
            "groups": {}
        },
        "11-great-lent": {
            "title": "الصوم الكبير وصوم نينوى",
            "english": "Great Lent & Jonah Fast",
            "color": "#7c3aed",
            "groups": {}
        },
        "14-pascha": {
            "title": "البصخة المقدسة وأسبوع الآلام",
            "english": "Holy Pascha Week",
            "color": "#dc2626",
            "groups": {}
        },
        "15-resurrection": {
            "title": "عيد القيامة والخماسين المقدسة",
            "english": "Holy Resurrection & Pentecost",
            "color": "#059669",
            "groups": {}
        },
        "20-apostles": {
            "title": "صوم وعيد الرسل والتجلي",
            "english": "Apostles Fast & Feast",
            "color": "#0284c7",
            "groups": {}
        },
        "25-tasbeha": {
            "title": "الإبصالمودية والتسبحة السنوية",
            "english": "Annual Holy Psalmody",
            "color": "#0891b2",
            "groups": {}
        },
        "agpeya-litanies": {
            "title": "الأجبية والأواشي والمدائح",
            "english": "Agpeya, Litanies & Doxologies",
            "color": "#be185d",
            "groups": {}
        }
    }

    for item in items:
        cat = item.get("category", "")
        season = item.get("season", "")
        instruction = item.get("instruction", "")
        output = item.get("output", "")

        parsed = clean_and_split_slide(output)
        if not parsed:
            continue

        # تحديد القسم الرئيسي
        target_key = "00-annual"
        if "كيهك" in cat or "كيهك" in season:
            target_key = "03-kiahk"
        elif "الصوم الكبير" in cat or "نينوى" in cat or "الصوم" in season:
            target_key = "11-great-lent"
        elif "البصخة" in cat or "جمعة" in cat or "شعانين" in cat:
            target_key = "14-pascha"
        elif "القيامة" in cat or "الخماسين" in cat or "العنصرة" in cat:
            target_key = "15-resurrection"
        elif "الرسل" in cat or "التجلى" in cat:
            target_key = "20-apostles"
        elif "تسبحة" in cat:
            target_key = "25-tasbeha"
        elif "الأجبية" in cat or "أواشى" in cat or "مدائح" in cat or "صلوات متكررة" in cat:
            target_key = "agpeya-litanies"

        # تنظيف عنوان المجموعة
        group_name = season if season and season != "annual" else cat
        if not group_name:
            group_name = "الصلوات الطقسية"

        target_dict = liturgy_seasons[target_key]["groups"]
        if group_name not in target_dict:
            target_dict[group_name] = {}

        # تنظيف اسم القسم من زوائد التعليمات
        sec_title = instruction.replace("أكمل النص الطقسي التالي من", "").replace("أكمل النص الطقسي من", "").strip()
        if not sec_title:
            sec_title = "المردات والصلوات"

        if sec_title not in target_dict[group_name]:
            target_dict[group_name][sec_title] = []

        target_dict[group_name][sec_title].append(parsed)

    # تحويل إلى مصفوفة LiturgyDocument جاهزة للـ UI
    liturgy_documents = []
    tasbeha_documents = []

    for key, conf in liturgy_seasons.items():
        groups_list = []
        for g_idx, (g_name, sections_map) in enumerate(conf["groups"].items()):
            sections_list = []
            for s_idx, (s_title, verses_list) in enumerate(sections_map.items()):
                sections_list.append({
                    "id": f"sec-{g_idx}-{s_idx}",
                    "title": {
                        "arabic": s_title,
                        "coptic": "",
                        "english": ""
                    },
                    "speaker": verses_list[0]["speaker"] if verses_list else "all",
                    "type": "prayer",
                    "verses": verses_list
                })

            groups_list.append({
                "id": f"group-{g_idx}",
                "title": {
                    "arabic": g_name,
                    "coptic": "",
                    "english": g_name
                },
                "sections": sections_list
            })

        doc = {
            "id": key,
            "slug": key,
            "title": {
                "arabic": conf["title"],
                "coptic": "",
                "english": conf["english"]
            },
            "subtitle": f"كافة الصلوات والمردات والقراءات الطقسية المنظمة لـ {conf['title']}",
            "description": f"العرض الكامل والشامل لملفات الباوربوينت الأصلية مرتبة طقسياً بدون تكرار أو أخطاء نصوص.",
            "iconName": "FaChurch",
            "accentColor": conf["color"],
            "groups": groups_list
        }

        liturgy_documents.append(doc)
        if "tasbeha" in key or "kiahk" in key or "annual" in key:
            tasbeha_documents.append(doc)

    os.makedirs("./lib/liturgies/data", exist_ok=True)
    os.makedirs("./lib/tasbeha/data", exist_ok=True)

    with open(LITURGIES_OUT, "w", encoding="utf-8") as f:
        json.dump(liturgy_documents, f, ensure_ascii=False, indent=2)

    with open(TASBEHA_OUT, "w", encoding="utf-8") as f:
        json.dump(tasbeha_documents, f, ensure_ascii=False, indent=2)

    print(f"تم بنجاح توليد وتنظيف وتنسيق بيانات القداسات ({len(liturgy_documents)} أقسام) والتسبحة ({len(tasbeha_documents)} أقسام).")

if __name__ == "__main__":
    generate_organized_liturgy()
