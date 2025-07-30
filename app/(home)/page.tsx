import { Metadata } from "next";
export const dynamic = "force-dynamic";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  metadataBase: new URL("https://abona-faltaus.vercel.app"),
  title: "ابونا فلتاؤس السرياني تفاحة",
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
