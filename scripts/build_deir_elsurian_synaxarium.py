import zipfile
import xml.etree.ElementTree as ET
import re
import json
import os

COPTIC_MONTHS = {
    'توت': (1, 'توت', 'Tout'),
    'بابه': (2, 'بابه', 'Baba'),
    'هاتور': (3, 'هاتور', 'Hator'),
    'كيهك': (4, 'كيهك', 'Kiahk'),
    'طوبة': (5, 'طوبة', 'Toba'),
    'طوبه': (5, 'طوبة', 'Toba'),
    'أمشير': (6, 'أمشير', 'Amshir'),
    'امشير': (6, 'أمشير', 'Amshir'),
    'برمهات': (7, 'برمهات', 'Baramhat'),
    'برمودة': (8, 'برمودة', 'Baramouda'),
    'برموده': (8, 'برمودة', 'Baramouda'),
    'بشنس': (9, 'بشنس', 'Bashans'),
    'بؤونة': (10, 'بؤونة', 'Paona'),
    'بؤونه': (10, 'بؤونة', 'Paona'),
    'بوؤنه': (10, 'بؤونة', 'Paona'),
    'أبيب': (11, 'أبيب', 'Epep'),
    'ابيب': (11, 'أبيب', 'Epep'),
    'مسرى': (12, 'مسرى', 'Mesra'),
    'مسري': (12, 'مسرى', 'Mesra'),
    'النسيء': (13, 'النسيء', 'Nasie'),
    'النسي': (13, 'النسيء', 'Nasie'),
    'نسي': (13, 'النسيء', 'Nasie')
}

NUM_WORDS = [
    ('الحادي والثلاثون', 31), ('الحادي و الثلاثون', 31),
    ('الحادي والعشرون', 21), ('الحادي و العشرون', 21),
    ('الثاني والعشرون', 22), ('الثاني و العشرون', 22),
    ('الثالث والعشرون', 23), ('الثالث و العشرون', 23),
    ('الرابع والعشرون', 24), ('الرابع و العشرون', 24),
    ('الخامس والعشرون', 25), ('الخامس و العشرون', 25),
    ('السادس والعشرون', 26), ('السادس و العشرون', 26),
    ('السابع والعشرون', 27), ('السابع و العشرون', 27),
    ('الثامن والعشرون', 28), ('الثامن و العشرون', 28),
    ('التاسع والعشرون', 29), ('التاسع و العشرون', 29),
    ('الحادي عشر', 11), ('الثاني عشر', 12),
    ('الثالث عشر', 13), ('الرابع عشر', 14), ('الخامس عشر', 15),
    ('السادس عشر', 16), ('السابع عشر', 17), ('الثامن عشر', 18),
    ('التاسع عشر', 19), ('الثلاثون', 30), ('العشرون', 20),
    ('الاول', 1), ('الأول', 1), ('الثاني', 2), ('الثالث', 3), ('الرابع', 4),
    ('الخامس', 5), ('السادس', 6), ('السابع', 7), ('الثامن', 8),
    ('التاسع', 9), ('العاشر', 10),
    ('30', 30), ('29', 29), ('28', 28), ('27', 27), ('26', 26),
    ('25', 25), ('24', 24), ('23', 23), ('22', 22), ('21', 21),
    ('20', 20), ('19', 19), ('18', 18), ('17', 17), ('16', 16),
    ('15', 15), ('14', 14), ('13', 13), ('12', 12), ('11', 11),
    ('10', 10), ('9', 9), ('8', 8), ('7', 7), ('6', 6), ('5', 5),
    ('4', 4), ('3', 3), ('2', 2), ('1', 1)
]

def parse_day_header(text):
    clean = " ".join(text.strip().split())
    if not ('اليوم' in clean or 'شهر' in clean):
        return None, None
    m_info = None
    for k, v in COPTIC_MONTHS.items():
        if k in clean:
            m_info = v
            break
    if not m_info:
        return None, None
    for word, num in NUM_WORDS:
        if word in clean:
            return m_info, num
    return None, None

def categorize_story(title: str, text: str) -> str:
    content = (title + " " + text).lower()
    if any(k in content for k in ["استشهاد", "شهيد", "martyr", "شهداء", "قتل"]):
        return "martyrs"
    if any(k in content for k in ["راهب", "أنبا", "دير", "متوحد", "monk", "hermit", "متوحدين", "قديس"]) and "رهبن" in content:
        return "monastics"
    if any(k in content for k in ["بطريرك", "بابا", "أسقف", "patriarch", "pope", "bishop", "مطران"]):
        return "patriarchs"
    if any(k in content for k in ["نبي", "رسول", "تلميذ", "داود", "إيليا", "موسى", "يوحنا المعمدان", "apostle", "prophet"]):
        return "biblical"
    if any(k in content for k in ["عيد", "تذكار", "تكريس", "feast", "consecration", "صعود", "بشارة", "ميلاد", "غطاس", "قيامة"]):
        return "feasts"
    return "general"

def extract_synaxarium(pptx_path: str, output_path: str):
    print(f"Reading PPTX: {pptx_path}")
    with zipfile.ZipFile(pptx_path) as z:
        slides = [name for name in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml', name)]
        slides.sort(key=lambda s: int(re.search(r'\d+', s).group()))

        stories = []
        cur_month = None
        cur_month_ar = ""
        cur_month_en = ""
        cur_day = None
        cur_title = ""
        cur_paragraphs = []
        story_idx = 0

        def save_current_story():
            nonlocal cur_title, cur_paragraphs, story_idx
            if cur_month and cur_day and (cur_title or cur_paragraphs):
                title = cur_title.strip()
                body = "\n\n".join([p.strip() for p in cur_paragraphs if p.strip()]).strip()
                if not title and body:
                    lines = body.split("\n")
                    title = lines[0][:80]
                    body = "\n".join(lines[1:]).strip()
                if title or body:
                    story_idx += 1
                    stories.append({
                        "id": f"{cur_month}-{cur_day}-{story_idx}",
                        "month": cur_month,
                        "monthNameAr": cur_month_ar,
                        "monthNameEn": cur_month_en,
                        "day": cur_day,
                        "titleAr": title,
                        "titleEn": "",
                        "textAr": body,
                        "textEn": "",
                        "category": categorize_story(title, body),
                        "source": "دير السريان العامر"
                    })
            cur_title = ""
            cur_paragraphs = []

        for s in slides:
            num = int(re.search(r'\d+', s).group())
            # Slide 5445+ are doxologies / liturgy praises
            if num >= 5445:
                break

            # Check rels for layout
            rel_file = f"ppt/slides/_rels/slide{num}.xml.rels"
            layout = ""
            try:
                rel_content = z.read(rel_file).decode('utf-8')
                m = re.search(r'slideLayout\d+\.xml', rel_content)
                if m:
                    layout = m.group()
            except:
                pass

            # Read slide paragraphs
            xml_content = z.read(s)
            root = ET.fromstring(xml_content)
            paragraphs = []
            for p in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}p'):
                text = ''.join([node.text for node in p.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t') if node.text]).strip()
                if text:
                    paragraphs.append(text)

            slide_text = " ".join(paragraphs).strip()
            if not slide_text:
                continue

            # Check if this slide is a Day Header (slideLayout6 or text matching "اليوم ... من شهر ...")
            m_info, d_num = parse_day_header(slide_text)
            if (layout == "slideLayout6.xml" or (m_info and d_num and len(slide_text) < 70)) and m_info and d_num:
                save_current_story()
                cur_month = m_info[0]
                cur_month_ar = m_info[1]
                cur_month_en = m_info[2]
                cur_day = d_num
                story_idx = 0
                continue

            # Check if this slide is a Story Title (slideLayout8 or short title starting with commemoration words)
            is_title_slide = (layout == "slideLayout8.xml") or (
                len(slide_text) < 130 and any(w in slide_text for w in [
                    "عيد", "تذكار", "استشهاد", "نياحة", "تدشين", "نقل جسد", "حضور", "ظهور",
                    "حلول", "معجزة", "اجتماع مجمع", "صعود", "بشارة", "دخول السيد المسيح"
                ]) and not slide_text.startswith("في مثل هذا اليوم") and not slide_text.startswith("وفيه أيضاً")
            )

            if is_title_slide:
                save_current_story()
                cur_title = slide_text
            else:
                # Content slide
                if (slide_text.startswith("وفيه أيضاً") or slide_text.startswith("وفي مثل هذا اليوم") or slide_text.startswith("في مثل هذا اليوم")) and cur_paragraphs:
                    first_clause = slide_text.split(".")[0].split("،")[0]
                    if len(first_clause) < 100 and any(w in first_clause for w in ["استشهد", "تنيح", "تنيَّح", "تذكار", "عيد", "أبصر"]):
                        save_current_story()
                        cur_title = first_clause
                cur_paragraphs.append(slide_text)

        save_current_story()

        print(f"Total extracted stories: {len(stories)}")
        days_covered = set((s['month'], s['day']) for s in stories)
        print(f"Total unique Coptic days covered: {len(days_covered)} / 365")

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(stories, f, ensure_ascii=False, indent=2)
        print(f"Saved successfully to: {output_path}")

if __name__ == "__main__":
    extract_synaxarium(
        "test/السنكسار - اصدار دير السريان.pptx",
        "data/synaxarium/synaxarium_deir_elsurian.json"
    )
