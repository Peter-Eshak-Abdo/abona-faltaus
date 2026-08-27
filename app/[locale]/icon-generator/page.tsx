import type { Metadata } from "next";
import IconGeneratorClient from "@/components/icon-generator/IconGeneratorClient";

export const metadata: Metadata = {
  title: "مولد الأيقونات والصور الأرثوذكسية الذكي | موقع أبونا فلتاؤس السرياني",
  description: "توليد أيقونات قبطية وبيزنطية وفن مسيحي مقدس بالذكاء الاصطناعي مع التأملات والشروحات اللاهوتية الرصينة وفق القواعد الكنسية الأرثوذكسية.",
};

export default function IconGeneratorPage() {
  return <IconGeneratorClient />;
}
