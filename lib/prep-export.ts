import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

/**
 * دالة تصدير العرض التقديمي PowerPoint (PPTX) عبر الـ API
 */
export async function exportToPowerPoint(title: string, markdownContent: string) {
  try {
    // استخراج الشرائح من الـ Markdown أو استخدام الـ API
    const sections = markdownContent.split(/^##\s+/gm).filter(Boolean);
    const slides: Array<{ title: string; points: string[]; verse?: string }> = [];

    if (sections.length === 0) {
      slides.push({
        title: title || "فكرة الدرس",
        points: markdownContent.split("\n").filter((l) => l.trim().length > 0).slice(0, 5),
      });
    } else {
      for (const sec of sections) {
        const lines = sec.trim().split("\n");
        const secTitle = lines[0]?.replace(/[#*]/g, "").trim() || "عنصر الدرس";
        const bodyLines = lines.slice(1).map((l) => l.replace(/[*#_`]/g, "").trim()).filter(Boolean);
        
        const verseLine = bodyLines.find((l) => l.includes("(") && l.includes(")") || l.includes("«") || l.includes("»"));
        const points = bodyLines.filter((l) => l !== verseLine).slice(0, 5);

        slides.push({
          title: secTitle,
          points: points.length > 0 ? points : ["نقطة توضيحية ومناقشة تفاعلية"],
          verse: verseLine,
        });
      }
    }

    const res = await fetch("/api/notes/generate-pptx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slides }),
    });

    if (!res.ok) throw new Error("فشل توليد ملف البوربوينت من السيرفر");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "lesson-prep"}.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err: any) {
    console.error("PPTX export error:", err);
    throw err;
  }
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
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * دالة تصدير PDF نظيف ومضبوط مع اللغة العربية باستخدام html2pdf.js
 */
export async function exportToPDF(title: string, markdownContent: string) {
  try {
    // تحويل الـ Markdown إلى HTML منسق
    const formattedHtml = markdownContent
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return "<br/>";
        if (trimmed.startsWith("### ")) {
          return `<h3>${trimmed.replace("### ", "")}</h3>`;
        }
        if (trimmed.startsWith("## ")) {
          return `<h2>${trimmed.replace("## ", "")}</h2>`;
        }
        if (trimmed.startsWith("# ")) {
          return `<h1>${trimmed.replace("# ", "")}</h1>`;
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return `<li>${trimmed.substring(2)}</li>`;
        }
        if (trimmed.includes("«") || (trimmed.includes("(") && trimmed.includes(")") && trimmed.length < 150)) {
          return `<div class="verse">${trimmed}</div>`;
        }
        return `<p>${trimmed}</p>`;
      })
      .join("");

    const res = await fetch("/api/notes/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ htmlContent: formattedHtml, title }),
    });

    if (!res.ok) throw new Error("تعذر تجهيز قالب الـ PDF من السيرفر");

    const { html } = await res.json();

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
    container.style.width = "210mm";
    container.innerHTML = html;
    document.body.appendChild(container);

    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default || html2pdfModule;

    await html2pdf()
      .from(container)
      .set({
        margin: [12, 12, 12, 12],
        filename: `${title || "lesson-prep"}.pdf`,
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save();

    document.body.removeChild(container);
  } catch (err: any) {
    console.error("PDF Export error:", err);
    throw err;
  }
}
