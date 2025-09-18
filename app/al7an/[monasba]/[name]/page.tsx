export const dynamicParams = true;

import slugify from "slugify";
import al7anData from "@/public/al7an-all.json";
import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type Hymn = {
  monasba: string;
  name: string;
  slug?: string;
  duration: string;
  src: string;
  hazatSrc?: string;
  [key: string]: string | undefined;
};

type Al7anDataItem = {
  [key: string]: Hymn[] | undefined;
};

type Al7anData = Al7anDataItem[];
const typedAl7anData = al7anData as unknown as Al7anData;

// Generate slugs at runtime and static params
export async function generateStaticParams() {
  const paths: Array<{ monasba: string; name: string }> = [];
  typedAl7anData.forEach((collection) => {
    Object.entries(collection).forEach(([monasba, hymns]) => {
      hymns?.forEach((hymn) => {
        const slug = slugify(hymn.name, { lower: true, strict: true });
        paths.push({ monasba, name: slug });
      });
    });
  });
  return paths;
}

export async function generateMetadata({ params }: { params: Promise<{ monasba: string; name: string }> }): Promise<Metadata> {
  const { monasba, name: slug } = await params;
  const hymns = typedAl7anData.find((c) => c[monasba])?.[monasba] || [];
  const hymn = hymns.find((h) => slugify(h.name, { lower: true, strict: true }) === slug);
  if (!hymn) return { title: "اللحن غير موجود" };
  return {
    title: hymn.name,
    description: `استماع وتحميل لحن ${hymn.name} من مناسبة ${monasba}`,
    keywords: [hymn.name, monasba, "الحان", "ترانيم"],
  };
}

export default async function L7nDetailsPage({ params }: { params: Promise<{ monasba: string; name: string }> }) {
  const { monasba, name: slug } = await params;
  const hymns = typedAl7anData.find((c) => c[monasba])?.[monasba] || [];
  const hymn = hymns.find((h) => slugify(h.name, { lower: true, strict: true }) === slug);
  if (!hymn) return <div className="container mt-5">اللحن غير موجود</div>;

  return (
    <div className="max-w-7xl mx-auto mt-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/" className="text-blue-500 hover:underline">الرئيسية</Link>
          <span>/</span>
          <Link href="/al7an" className="text-blue-500 hover:underline">الألحان</Link>
          <span>/</span>
          <Link href={`/al7an/${monasba}`} className="text-blue-500 hover:underline">{monasba}</Link>
          <span>/</span>
          <span className="text-gray-600">{hymn.name}</span>
        </div>
      </nav>
      <h1 className="text-3xl font-bold mb-2">{hymn.name}</h1>
      <p className="mb-4">المدة: {hymn.duration}</p>
      {hymn.src && (
        <>
          <audio controls src={hymn.src.replace("./", "/")} className="my-3 w-full rounded shadow" />
          <Button asChild variant="outline">
            <a href={hymn.src.replace("./", "/")} download>
              حفظ اللحن اوفلاين
            </a>
          </Button>
        </>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {Object.keys(hymn)
          .filter((key) => key.startsWith("hazatSrc") && hymn[key])
          .map((key) => (
            <div key={key} className="mb-3">
              <a href={hymn[key]} data-lightbox="lahn-gallery" title="صورة اللحن">
                <Image src={hymn[key] as string} alt={hymn.name} width={400} height={300} className="rounded shadow" />
              </a>
            </div>
          ))}
      </div>
    </div>
  );
}
