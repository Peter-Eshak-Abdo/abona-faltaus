import Al7anClient from "./Al7anClient";
import { Metadata } from "next";
import al7anData from "@/public/al7an-all.json";

type Al7anItem = { name: string;[key: string]: unknown };
type Al7anCategory = { [category: string]: Al7anItem[] };

const allNames = (al7anData as unknown as Al7anCategory[]).flatMap((c) =>
  Object.values(c)[0].map((h) => h.name)
);

export const metadata: Metadata = {
  title: "الألحان تفاحة",
  description: "مجموعة الألحان لجميع المناسبات",
  keywords: ["الحان", ...allNames],
};

export default function Al7anPage() {
  return (
    <main className="max-w-7xl mx-auto p-4">
      <Al7anClient />
    </main>
  );
}
