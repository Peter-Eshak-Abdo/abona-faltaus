import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

/**
 * دالة تصدير العرض التقديمي PowerPoint (PPTX) عبر الـ API
 */
export async function exportToPowerPoint(title: string, markdownContent: string) {
  try {
    // 1. تنظيف النص من علامات الفواصل الطويلة --- والرموز الزائدة
    const cleanedText = markdownContent
      .replace(/^(\s*[-*_]){3,}\s*$/gm, "")
      .replace(/\r\n/g, "\n");

    // 2. تقسيم النص إلى أقسام وعناصر بناءً على العناوين (# أو ## أو ### أو خط عريض مستقل)
    const rawSections = cleanedText.split(/(?=(?:^|\n)#{1,3}\s+|(?:\n\*\*[^\n]+\*\*))/g).filter((s) => s.trim().length > 0);

    const slides: Array<{ title: string; points: string[]; verse?: string; isSummary?: boolean }> = [];

    if (rawSections.length === 0) {
      // إذا كان النص كتلة واحدة بدون عناوين
      const allLines = cleanedText
        .split("\n")
        .map((l) => l.replace(/^[*•-]\s*/, "").replace(/[*#_`]/g, "").trim())
        .filter(Boolean);

      for (let i = 0; i < allLines.length; i += 2) {
        slides.push({
          title: title || "فكرة وعنصر الدرس",
          points: allLines.slice(i, i + 2),
        });
      }
    } else {
      for (const sec of rawSections) {
        const lines = sec
          .trim()
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

        if (lines.length === 0) continue;

        // استخراج عنوان القسم
        const rawFirstLine = lines[0];
        const secTitle = rawFirstLine.replace(/^[#*•\-\s]+/, "").replace(/[*_`]/g, "").trim() || "عنصر الدرس";

        // استخراج أسطر المحتوى
        const bodyLines = lines
          .slice(1)
          .map((l) => l.replace(/^[*•\-]\s*/, "").replace(/[*_`]/g, "").trim())
          .filter((l) => l.length > 0 && !/^[-*_]{3,}$/.test(l));

        if (bodyLines.length === 0) {
          // إذا كان السطر الأول فقط موجوداً ومعه نص
          slides.push({
            title: secTitle,
            points: ["شرح ومناقشة تفاعلية حول هذا المحور."],
          });
          continue;
        }

        // استخراج الآيات إن وجدت
        const verseLines = bodyLines.filter(
          (l) => (l.includes("«") && l.includes("»")) || (l.includes("(") && l.includes(")") && l.length < 160)
        );
        const nonVerseLines = bodyLines.filter((l) => !verseLines.includes(l));

        // تقسيم المحتوى إلى شرائح صغيرة (1 إلى 2 نقطة في كل شريحة لكي يتسع لخط 36pt كبير وواضح)
        const isSummary = secTitle.includes("خلاصة") || secTitle.includes("تطبيق") || secTitle.includes("ختام");
        const chunkSize = 2; // نقطتان كحد أقصى لكل سلايد ليكون الفونت كبيراً ومريحاً

        if (nonVerseLines.length <= chunkSize) {
          slides.push({
            title: secTitle,
            points: nonVerseLines.length > 0 ? nonVerseLines : ["نقطة ومحور تأملي"],
            verse: verseLines[0],
            isSummary,
          });
        } else {
          // تقسيم العنصر على 2 أو 3 سلايدات
          for (let i = 0; i < nonVerseLines.length; i += chunkSize) {
            const partIndex = Math.floor(i / chunkSize) + 1;
            const totalParts = Math.ceil(nonVerseLines.length / chunkSize);
            const partTitle = totalParts > 1 ? `${secTitle} (${partIndex})` : secTitle;

            slides.push({
              title: partTitle,
              points: nonVerseLines.slice(i, i + chunkSize),
              verse: i === 0 ? verseLines[0] : undefined,
              isSummary,
            });
          }
        }
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
      children: [
        new TextRun({
          text: title || "تحضير الدرس",
          bold: true,
          size: 36, // 18pt
          font: "Traditional Arabic",
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 240 },
    }),
  ];

  // إزالة الفواصل الطويلة --- أو استبدالها بسطر فاصل موحد دون تكرار سطور فارغة
  const lines = markdownContent
    .replace(/^(\s*[-*_]){3,}\s*$/gm, "\n") // تحويل الفواصل الأفقية --- إلى سطر عادي
    .split("\n");

  let lastWasEmpty = false;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // منع تكرار أكثر من سطر فارغ واحد
    if (!trimmed) {
      if (!lastWasEmpty) {
        paragraphs.push(
          new Paragraph({
            text: "",
            spacing: { after: 120 },
            bidirectional: true,
            alignment: AlignmentType.RIGHT,
          })
        );
        lastWasEmpty = true;
      }
      continue;
    }

    lastWasEmpty = false;

    if (trimmed.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed.replace("### ", "").replace(/[*_`]/g, ""),
              bold: true,
              size: 36, // 18pt
              font: "Traditional Arabic",
              rightToLeft: true,
            }),
          ],
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (trimmed.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed.replace("## ", "").replace(/[*_`]/g, ""),
              bold: true,
              size: 36, // 18pt
              font: "Traditional Arabic",
              rightToLeft: true,
            }),
          ],
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 260, after: 120 },
        })
      );
    } else if (trimmed.startsWith("# ")) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed.replace("# ", "").replace(/[*_`]/g, ""),
              bold: true,
              size: 36, // 18pt
              font: "Traditional Arabic",
              rightToLeft: true,
            }),
          ],
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 320, after: 160 },
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed.replace(/[*_`]/g, ""),
              size: 32, // 16pt
              font: "Traditional Arabic",
              rightToLeft: true,
            }),
          ],
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 120, line: 360 }, // تباعد سطور مريح
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

    // استخدام iframe معزول تماماً لتجنب وراثة متغيرات Tailwind v4 oklch من الصفحة الحالية
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "210mm";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error("تعذر إنشاء بيئة تصدير الـ PDF");

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // ننتظر تحميل الخطوط والمحتوى داخل الـ iframe
    await new Promise((resolve) => setTimeout(resolve, 300));

    const elementToPrint = iframeDoc.body;

    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default || html2pdfModule;

    await html2pdf()
      .from(elementToPrint)
      .set({
        margin: [12, 12, 12, 12],
        filename: `${title || "lesson-prep"}.pdf`,
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save();

    document.body.removeChild(iframe);
  } catch (err: any) {
    console.error("PDF Export error:", err);
    throw err;
  }
}
