import { Metadata } from "next";
import Al7anClient from "./Al7anClient";
import al7anData from "@/public/al7an-all.json";

// Get all hymn names from the JSON file
const allHymnNames = al7anData.flatMap(category =>
  Object.values(category)[0].map((hymn: { name: string }) => hymn.name)
);

export const metadata: Metadata = {
  title: "الالحان",
  description: "الحان وترانيم وعظات والكتاب المقدس ومقالات و امتحانات اسئلة دينية فردية و مجموعات وكل ما يخص الكنيسة الارثوذكسية",
  keywords: ["الحان", "عظات", "وعظات", "ترانيم", "مقالات دينية", "امتحانات", "اسئلة دينية", "ابونا فلتاؤس السرياني", "الكتاب المقدس", "كنيسة", "ارثوذكسية", ...allHymnNames],
};

export default function Al7anPage() {
  return <Al7anClient />;
}
