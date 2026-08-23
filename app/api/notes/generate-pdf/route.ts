import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { htmlContent, title } = await req.json();

    const fullHtml = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${title || "تحضير الدرس"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Amiri', 'Traditional Arabic', serif;
      font-size: 16px;
      line-height: 2;
      color: #1a1a1a;
      direction: rtl;
      padding: 40px;
      background: white;
    }
    h1 { font-size: 28px; font-weight: 700; color: #7c2d12; margin-bottom: 20px; text-align: center; }
    h2 { font-size: 22px; font-weight: 700; color: #92400e; margin: 24px 0 12px; }
    h3 { font-size: 18px; font-weight: 700; color: #b45309; margin: 16px 0 8px; }
    p { margin-bottom: 12px; text-align: justify; }
    .verse {
      background: #fef3c7;
      border-right: 4px solid #d97706;
      padding: 12px 16px;
      margin: 16px 0;
      border-radius: 4px;
      font-style: italic;
      color: #92400e;
    }
    .source {
      font-size: 12px;
      color: #6b7280;
      font-family: monospace;
      background: #f3f4f6;
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
      margin: 4px 0;
    }
    ul { padding-right: 24px; margin-bottom: 12px; }
    li { margin-bottom: 6px; }
    .page-header {
      text-align: center;
      border-bottom: 2px solid #d97706;
      padding-bottom: 16px;
      margin-bottom: 32px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
    }
  </style>
</head>
<body>
  <div class="page-header">
    <h1>${title || "تحضير الدرس"}</h1>
    <p class="source">كنيسة السيدة العذراء مريم بالإسماعيلية — موقع أبونا فلتاؤس</p>
  </div>
  <div class="content">
    ${htmlContent || ""}
  </div>
  <div class="footer">
    تم إنشاء هذا الدرس بواسطة موقع أبونا فلتاؤس تفاحة
    | ${new Date().toLocaleDateString("ar-EG")}
  </div>
</body>
</html>`;

    return NextResponse.json({ html: fullHtml });
  } catch (error: any) {
    console.error("PDF Generate Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate PDF HTML" }, { status: 500 });
  }
}
