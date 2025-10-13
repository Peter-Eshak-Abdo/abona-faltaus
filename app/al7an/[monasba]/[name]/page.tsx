export const dynamicParams = true;

import slugify from "slugify";
import al7anData from "@/public/al7an-all.json";
import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";
import HymnPlayerClient from "./HymnPlayerClient";
import { notFound } from "next/navigation";

type Hymn = {
  monasba: string;
  name: string;
  slug?: string;
  duration?: string;
  src?: string;
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

  if (!hymn) return notFound();

  // بناء رابط Archive (ملفاتك داخل item abona-faltaus-audio)
  const item = "abona-faltaus-audio";
  const encodedName = encodeURIComponent(hymn.name.trim() + ".mp3");
  const archiveSrc = `https://archive.org/download/${item}/${encodedName}`;

  // تحقق سريع إن الملف موجود (HEAD) — سرّعنا بخيارات بسيطة
  async function checkIfExists(url: string) {
    try {
      const res = await fetch(url, { method: "HEAD", cache: "no-store" });
      return res.ok;
    } catch {
      return false;
    }
  }

  const isArchiveAvailable = await checkIfExists(archiveSrc);
  const finalSrc = isArchiveAvailable ? archiveSrc : (hymn.src?.replace("./", "/") ?? "");

  // حوّل أي صور من hazatSrc إلى صفيف
  const images = Object.keys(hymn)
    .filter((k) => k.startsWith("hazatSrc") && hymn[k])
    .map((k) => hymn[k] as string);

  // كلمات/lyrics إن وُجدت
  const lyrics =
    hymn.lyrics ||
    hymn.words ||
    hymn.kalam ||
    hymn.lyrics_ar ||
    "";

  return (
    <main className="max-w-4xl mx-auto mt-6 p-4">
      <nav className="text-sm text-muted-foreground mb-3 flex flex-wrap gap-2">
        <Link href="/">الرئيسية</Link>
        <span>/</span>
        <Link href="/al7an">الألحان</Link>
        <span>/</span>
        <Link href={`/al7an/${encodeURIComponent(monasba)}`}>{monasba}</Link>
        <span>/</span>
        <span className="font-medium">{hymn.name}</span>
      </nav>

      <header className="mb-4">
        <h1 className="text-3xl font-extrabold">{hymn.name}</h1>
        {hymn.duration && <p className="text-sm text-muted-foreground">المدة: {hymn.duration}</p>}
      </header>

      {/* HymnPlayerClient هو client component سيستلم كل البيانات اللازمة */}
      <HymnPlayerClient
        finalSrc={finalSrc}
        pageTitle={hymn.name}
        lyrics={lyrics}
        images={images}
      />

      {/* صور الهزّات */}
      {images.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          {images.map((src, i) => (
            <div key={i} className="rounded overflow-hidden shadow">
              <Image src={src} alt={`${hymn.name} - صورة ${i + 1}`} width={600} height={400} className="object-cover" />
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
