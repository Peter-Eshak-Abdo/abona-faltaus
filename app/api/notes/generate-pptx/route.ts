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
      x: 0.5,
      y: 2.2,
      w: "90%",
      h: 1.5,
      fontSize: 34,
      bold: true,
      color: "FFD700",
      align: "center",
      fontFace: "Arial",
    });
    coverSlide.addText("منصة أبونا فلتاؤس — إعداد الخدمة الأرثوذكسية", {
      x: 0.5,
      y: 4.0,
      w: "90%",
      h: 0.8,
      fontSize: 18,
      color: "E2E8F0",
      align: "center",
      fontFace: "Arial",
    });

    if (Array.isArray(slides) && slides.length > 0) {
      slides.forEach((slide: any) => {
        const s = pptx.addSlide();
        s.background = { color: "1a1a2e" };

        // عنوان الشريحة
        s.addText(slide.title || "عنصر الدرس", {
          x: 0.5,
          y: 0.5,
          w: "90%",
          h: 0.9,
          fontSize: 26,
          bold: true,
          color: "FFD700",
          align: "right",
          fontFace: "Arial",
        });

        // النقاط
        if (Array.isArray(slide.points)) {
          slide.points.forEach((point: string, i: number) => {
            s.addText(`• ${point}`, {
              x: 0.8,
              y: 1.6 + i * 0.7,
              w: "85%",
              h: 0.6,
              fontSize: 18,
              color: "FFFFFF",
              align: "right",
              fontFace: "Arial",
            });
          });
        }

        // الآية إن وجدت
        if (slide.verse) {
          s.addText(`"${slide.verse}"`, {
            x: 0.5,
            y: 5.4,
            w: "90%",
            h: 0.8,
            fontSize: 15,
            italic: true,
            color: "FFD700",
            align: "center",
            fontFace: "Arial",
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
