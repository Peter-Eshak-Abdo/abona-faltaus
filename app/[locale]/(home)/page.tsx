import { Metadata } from "next";
export const revalidate = 3600; // ISR: كاش للصفحة الرئيسية لمدة ساعة لتقليل TTFB من 3.8 ثانية إلى أقل من 100ms
import HomeClient from "@/components/home/HomeClient";

export const metadata: Metadata = {
  title: "ابونا فلتاؤس تفاحة",
  description: "الحان وترانيم وعظات والكتاب المقدس ومقالات و امتحانات اسئلة دينية فردية و مجموعات وكل ما يخص الكنيسة الارثوذكسية",
  keywords: ["الحان", "عظات", "وعظات", "ترانيم", "مقالات دينية", "امتحانات", "اسئلة دينية", "ابونا فلتاؤس السرياني", "الكتاب المقدس", "كنيسة", "ارثوذكسية"],
  authors: [{ name: "بيتر اسحاق عبده" }],
  icons: {
    icon: "/images/icons/favicon.ico",
  },
};

export default function Home() {
  return <HomeClient />;
}
