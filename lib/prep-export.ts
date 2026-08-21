import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import jsPDF from "jspdf";

/**
 * دالة تصدير العرض التقديمي PowerPoint (PPTX)
 */
export async function exportToPowerPoint(title: string, markdownContent: string) {
  const pptxgenModule = await import("pptxgenjs");
  const pptxgen = pptxgenModule.default || pptxgenModule;
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";

  // Slide 1: غلاف العرض التقديمي
  const titleSlide = pres.addSlide();
  titleSlide.background = { color: "2D1B18" };
  titleSlide.addText(title || "تحضير الدرس", {
    x: "10%",
    y: "35%",
    w: "80%",
    h: 1.5,
    fontSize: 36,
    bold: true,
    color: "E8CFAE",
    align: "center",
    fontFace: "Arial",
  });
  titleSlide.addText("منصة أبونا فلتاؤس — إعداد الخدمة", {
    x: "10%",
    y: "55%",
    w: "80%",
    h: 0.8,
    fontSize: 18,
    color: "FFFFFF",
    align: "center",
    fontFace: "Arial",
  });

  // تقسيم المحتوى إلى أقسام بناءً على العناوين ##
  const sections = markdownContent.split(/^##\s+/gm).filter(Boolean);

  if (sections.length === 0) {
    const slide = pres.addSlide();
    slide.addText(markdownContent.slice(0, 800), {
      x: 0.8,
      y: 0.8,
      w: 8.4,
      h: 5.5,
      fontSize: 14,
      color: "333333",
      align: "right",
      fontFace: "Arial",
    });
  } else {
    for (const sec of sections) {
      const lines = sec.trim().split("\n");
      const secTitle = lines[0]?.replace(/[#*]/g, "").trim() || "عنصر الدرس";
      const secBody = lines.slice(1).join("\n").replace(/[*#_`]/g, "").trim();

      if (!secBody && !secTitle) continue;

      const slide = pres.addSlide();
      slide.background = { color: "FDFBF7" };

      // شريط العنوان
      slide.addShape(pres.ShapeType.rect, {
        x: 0,
        y: 0,
        w: "100%",
        h: 1.1,
        fill: { color: "5C4538" },
      });

      slide.addText(secTitle, {
        x: 0.5,
        y: 0.2,
        w: 9.0,
        h: 0.8,
        fontSize: 22,
        bold: true,
        color: "E8CFAE",
        align: "right",
        fontFace: "Arial",
      });

      // نص الشريحة
      slide.addText(secBody.slice(0, 900), {
        x: 0.8,
        y: 1.4,
        w: 8.4,
        h: 5.2,
        fontSize: 15,
        color: "2D1B18",
        align: "right",
        fontFace: "Arial",
        lineSpacing: 24,
      });
    }
  }

  await pres.writeFile({ fileName: `${title || "lesson-prep"}.pptx` });
}

/**
 * دالة تصدير مستند Word (DOCX)
 */
export async function exportToWord(title: string, markdownContent: string) {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: title || "تحضير الدرس",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 300 },
    }),
  ];

  const lines = markdownContent.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      paragraphs.push(new Paragraph({ text: "", spacing: { after: 150 } }));
      continue;
    }

    if (trimmed.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace("### ", ""),
          heading: HeadingLevel.HEADING_3,
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (trimmed.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace("## ", ""),
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 300, after: 150 },
        })
      );
    } else if (trimmed.startsWith("# ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace("# ", ""),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 400, after: 200 },
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed.replace(/[*_`]/g, ""),
              size: 24,
            }),
          ],
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 120 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title || "lesson-prep"}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * دالة تصدير PDF نظيف ومباشر
 */
export async function exportToPDF(title: string, markdownContent: string) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const cleanText = markdownContent.replace(/[*#_`]/g, "");
  const lines = doc.splitTextToSize(cleanText, 170);

  doc.setFontSize(18);
  doc.text(title || "تحضير الدرس", 190, 20, { align: "right" });

  doc.setFontSize(11);
  let y = 30;
  for (let i = 0; i < lines.length; i++) {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    doc.text(lines[i], 190, y, { align: "right" });
    y += 7;
  }

  doc.save(`${title || "lesson-prep"}.pdf`);
}
