import { Metadata } from "next";
import PresentationBuilderClient from "@/components/slides/PresentationBuilderClient";

export const metadata: Metadata = {
  title: "صانع العروض التقديمية الأرثوذكسية (PowerPoint & Slides AI) — منصة أبونا فلتاؤس",
  description: "أداة ذكية لتوليد وتصميم عروض البوربوينت ودروس مدارس الأحد مع التصدير إلى PPTX بنقرة واحدة.",
};

export default function SlidesPage() {
  return <PresentationBuilderClient />;
}
