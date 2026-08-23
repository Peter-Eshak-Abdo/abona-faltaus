import { NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, slides } = body;

    // slides: Array<{ title: string; points: string[]; verse?: string }>
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE";

    // Slide 1: غلاف العرض
    const coverSlide = pptx.addSlide();
    coverSlide.background = { color: "1a1a2e" };
    coverSlide.addText(title || "تحضير الدرس", {
      x: 0.8,
      y: 1.8,
      w: "88%",
      h: 2.2,
      fontSize: 40,
      bold: true,
      color: "FFD700",
      align: "center",
      fontFace: "Arial",
      rtlMode: true,
    });
    coverSlide.addText("منصة أبونا فلتاؤس — إعداد الخدمة الأرثوذكسية", {
      x: 0.8,
      y: 4.3,
      w: "88%",
      h: 1.0,
      fontSize: 22,
      color: "E2E8F0",
      align: "center",
      fontFace: "Arial",
      rtlMode: true,
    });

    if (Array.isArray(slides) && slides.length > 0) {
      slides.forEach((slide: any) => {
        const s = pptx.addSlide();
        s.background = { color: "1a1a2e" };

        // عنوان الشريحة
        s.addText(slide.title || "عنصر الدرس", {
          x: 0.6,
          y: 0.5,
          w: "88%",
          h: 1.0,
          fontSize: 32,
          bold: true,
          color: "FFD700",
          align: "right",
          fontFace: "Arial",
          rtlMode: true,
        });

        // النقاط والمحتوى بحجم خط كبير ومحاذاة لليمين RTL
        if (Array.isArray(slide.points) && slide.points.length > 0) {
          const pointCount = slide.points.length;
          // ضبط حجم الخط: 28 إلى 34 بناءً على عدد الأسطر
          const bodyFontSize = pointCount === 1 ? 34 : pointCount === 2 ? 30 : 26;

          slide.points.forEach((point: string, i: number) => {
            const cleanPoint = point.replace(/^[-*_•\s]+/, "").trim();
            if (!cleanPoint) return;

            s.addText(cleanPoint, {
              x: 0.8,
              y: 1.8 + i * 1.8,
              w: "85%",
              h: 1.5,
              fontSize: bodyFontSize,
              color: "FFFFFF",
              align: "right",
              fontFace: "Arial",
              rtlMode: true,
              bullet: { type: "bullet", code: "2022" },
            });
          });
        }

        // الآية إن وجدت
        if (slide.verse) {
          const cleanVerse = slide.verse.replace(/^[-*_•\s]+/, "").trim();
          s.addText(`« ${cleanVerse} »`, {
            x: 0.8,
            y: 5.5,
            w: "85%",
            h: 1.0,
            fontSize: 22,
            italic: true,
            color: "FFD700",
            align: "right",
            fontFace: "Arial",
            rtlMode: true,
          });
        }
      });
    }

    const buffer:any = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(title || "lesson")}.pptx"`,
      },
    });
  } catch (error: any) {
    console.error("PPTX Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate PPTX" }, { status: 500 });
  }
}
