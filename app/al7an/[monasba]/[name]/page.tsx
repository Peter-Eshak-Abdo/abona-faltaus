export const dynamicParams = true;

import slugify from "slugify";
import al7anData from "@/public/al7an-all.json";
import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";

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
    <div className="container mt-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link href="/">الرئيسية</Link></li>
          <li className="breadcrumb-item"><Link href="/al7an">الألحان</Link></li>
          <li className="breadcrumb-item"><Link href={`/al7an/${monasba}`}>{monasba}</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{hymn.name}</li>
        </ol>
      </nav>
      <h1>{hymn.name}</h1>
      <p>المدة: {hymn.duration}</p>
      {hymn.src && (
        <>
          <audio controls src={hymn.src.replace("./", "/")} className="my-3 w-100">
            متصفحك لا يدعم تشغيل الصوت.
          </audio>
          <a href={hymn.src.replace("./", "/")} download className="btn btn-info">
            حفظ اللحن اوفلاين
          </a>
        </>
      )}
      <div className="row mt-4">
        {Object.keys(hymn)
          .filter((key) => key.startsWith("hazatSrc") && hymn[key])
          .map((key) => (
            <div key={key} className="col-md-4 mb-3">
              <a href={hymn[key]} data-lightbox="lahn-gallery" title="صورة اللحن">
                <Image src={hymn[key] as string} alt={hymn.name} width={400} height={300} />
              </a>
            </div>
          ))}
      </div>
    </div>
  );
}
