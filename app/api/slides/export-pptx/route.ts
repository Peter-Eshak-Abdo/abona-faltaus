import { NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";
import { Slide, SlideTheme, SLIDE_THEMES } from "@/lib/slides/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { title, theme = "orthodox-dark", slides } = (await req.json()) as {
      title: string;
      theme: SlideTheme;
      slides: Slide[];
    };

    if (!Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: "لا توجد شرائح لتصديرها" }, { status: 400 });
    }

    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE"; // 16:9
    pptx.title = title || "عرض تقديمي كنسي أرثوذكسي";

    const globalThemeConfig = SLIDE_THEMES[theme] || SLIDE_THEMES["orthodox-dark"];

    slides.forEach((slide, idx) => {
      const slideThemeConfig = slide.backgroundTheme
        ? SLIDE_THEMES[slide.backgroundTheme] || globalThemeConfig
        : globalThemeConfig;

      const s = pptx.addSlide();
      s.background = { color: slideThemeConfig.pptxBg };

      // Top branding banner
      s.addText("منصة أبونا فلتاؤس — خدمة مدارس الأحد والعروض التقديمية", {
        x: 0.5,
        y: 0.3,
        w: "92%",
        h: 0.4,
        fontSize: 11,
        color: slideThemeConfig.pptxAccentColor,
        align: "right",
        fontFace: "Arial",
        rtlMode: true,
      });

      if (slide.slideType === "cover") {
        // Cover Slide Layout
        s.addText(slide.title || title || "عرض تقديمي أرثوذكسي", {
          x: 0.8,
          y: 1.8,
          w: "85%",
          h: 2.2,
          fontSize: 42,
          bold: true,
          color: slideThemeConfig.pptxTitleColor,
          align: "center",
          fontFace: "Arial",
          rtlMode: true,
        });

        if (slide.subtitle) {
          s.addText(slide.subtitle, {
            x: 1.0,
            y: 4.2,
            w: "80%",
            h: 1.2,
            fontSize: 24,
            italic: true,
            color: slideThemeConfig.pptxTextColor,
            align: "center",
            fontFace: "Arial",
            rtlMode: true,
          });
        }
      } else if (slide.slideType === "verse") {
        // Verse Focused Slide Layout
        s.addText(slide.title || "الآية الذهبية", {
          x: 0.8,
          y: 0.8,
          w: "85%",
          h: 0.8,
          fontSize: 30,
          bold: true,
          color: slideThemeConfig.pptxTitleColor,
          align: "right",
          fontFace: "Arial",
          rtlMode: true,
        });

        if (slide.verse) {
          s.addText(`« ${slide.verse.text} »`, {
            x: 1.0,
            y: 2.0,
            w: "80%",
            h: 2.5,
            fontSize: 34,
            bold: true,
            color: slideThemeConfig.pptxAccentColor,
            align: "center",
            fontFace: "Arial",
            rtlMode: true,
          });

          s.addText(`(${slide.verse.ref})`, {
            x: 1.0,
            y: 4.6,
            w: "80%",
            h: 0.8,
            fontSize: 22,
            italic: true,
            color: slideThemeConfig.pptxTextColor,
            align: "center",
            fontFace: "Arial",
            rtlMode: true,
          });
        }

        if (slide.points && slide.points.length > 0) {
          s.addText(slide.points.join(" • "), {
            x: 0.8,
            y: 5.5,
            w: "85%",
            h: 1.0,
            fontSize: 18,
            color: slideThemeConfig.pptxTextColor,
            align: "center",
            fontFace: "Arial",
            rtlMode: true,
          });
        }
      } else if (slide.slideType === "quote") {
        // Patristic Quote Slide Layout
        s.addText(slide.title || "أقوال الآباء القديسين", {
          x: 0.8,
          y: 0.8,
          w: "85%",
          h: 0.8,
          fontSize: 30,
          bold: true,
          color: slideThemeConfig.pptxTitleColor,
          align: "right",
          fontFace: "Arial",
          rtlMode: true,
        });

        if (slide.quote) {
          s.addText(`" ${slide.quote.text} "`, {
            x: 1.0,
            y: 2.0,
            w: "80%",
            h: 2.5,
            fontSize: 30,
            italic: true,
            color: slideThemeConfig.pptxTextColor,
            align: "center",
            fontFace: "Arial",
            rtlMode: true,
          });

          s.addText(`— ${slide.quote.author}`, {
            x: 1.0,
            y: 4.6,
            w: "80%",
            h: 0.8,
            fontSize: 24,
            bold: true,
            color: slideThemeConfig.pptxAccentColor,
            align: "center",
            fontFace: "Arial",
            rtlMode: true,
          });
        }
      } else {
        // Standard Content / Activity / Conclusion Slide
        s.addText(slide.title || "عنصر ومحور الدرس", {
          x: 0.8,
          y: 0.8,
          w: "85%",
          h: 0.9,
          fontSize: 32,
          bold: true,
          color: slideThemeConfig.pptxTitleColor,
          align: "right",
          fontFace: "Arial",
          rtlMode: true,
        });

        if (Array.isArray(slide.points) && slide.points.length > 0) {
          const fontSize = slide.points.length <= 2 ? 28 : slide.points.length <= 3 ? 24 : 20;
          slide.points.forEach((pt, pIdx) => {
            s.addText(pt.replace(/^[-*•\s]+/, "").trim(), {
              x: 1.0,
              y: 2.0 + pIdx * 1.3,
              w: "80%",
              h: 1.1,
              fontSize,
              color: slideThemeConfig.pptxTextColor,
              align: "right",
              fontFace: "Arial",
              rtlMode: true,
              bullet: { type: "bullet", code: "2022" },
            });
          });
        }

        if (slide.verse) {
          s.addText(`« ${slide.verse.text} » (${slide.verse.ref})`, {
            x: 0.8,
            y: 5.6,
            w: "85%",
            h: 0.8,
            fontSize: 18,
            italic: true,
            color: slideThemeConfig.pptxAccentColor,
            align: "right",
            fontFace: "Arial",
            rtlMode: true,
          });
        }
      }

      // Slide index footer
      s.addText(`${idx + 1} / ${slides.length}`, {
        x: 0.5,
        y: 6.8,
        w: 2.0,
        h: 0.4,
        fontSize: 11,
        color: slideThemeConfig.pptxTextColor,
        align: "left",
        fontFace: "Arial",
      });

      // Speaker Notes
      if (slide.notes) {
        s.addNotes(slide.notes);
      }
    });

    const buffer: any = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          title || "orthodox-presentation"
        )}.pptx"`,
      },
    });
  } catch (error: any) {
    console.error("Advanced PPTX Export Error:", error);
    return NextResponse.json(
      { error: error.message || "فشل تصدير العرض التقديمي" },
      { status: 500 }
    );
  }
}
