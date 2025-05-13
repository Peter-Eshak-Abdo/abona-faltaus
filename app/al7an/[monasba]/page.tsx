import Link from "next/link";
import al7anData from "@/public/al7an-all.json";
import { Metadata } from "next";

type Hymn = {
  monasba: string;
  name: string;
  duration: string;
  src: string;
  hazatSrc?: string;
  hazatSrc1?: string;
  hazatSrc2?: string;
  hazatSrc3?: string;
  hazatSrc4?: string;
  hazatSrc5?: string;
  [key: string]: string | undefined;
};

type Al7anData = {
  snawi?: Hymn[];
  "som-kebir"?: Hymn[];
  "asbo3-alam"?: Hymn[];
  khmacen?: Hymn[];
  "nhdet-al3dra"?: Hymn[];
  keahk?: Hymn[];
  [key: string]: Hymn[] | undefined;
}[];

const typedAl7anData = al7anData as unknown as Al7anData;

type PageParams = {
  monasba: string;
};

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const awaitedParams = await params;
  const { monasba } = awaitedParams;
  const allAl7an = typedAl7anData.find((item) => item[monasba])?.[monasba] || [];
  const hymnNames = allAl7an.map((hymn: Hymn) => hymn.name);

  return {
    title: `ألحان ${monasba}`,
    description: `ألحان وترانيم مناسبة ${monasba}`,
    keywords: [monasba, ...hymnNames],
  };
}

export default async function MonasbaPage({ params }: { params: PageParams }) {
  const awaitedParams = await params;
  const { monasba } = awaitedParams;
  const allAl7an = typedAl7anData.find((item) => item[monasba])?.[monasba] || [];

  return (
    <div className="container mt-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/">الرئيسية</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/al7an">الألحان</Link>
          </li>
          <li className="breadcrumb-item" aria-current="page">
            ألحان مناسبة: {monasba}
          </li>
        </ol>
      </nav>

      <h1>ألحان مناسبة: {monasba}</h1>
      <ul className="list-group">
        {allAl7an.map((l7n: Hymn, idx: number) => (
          <li key={idx} className="list-group-item">
            <Link href={`/al7an/${monasba}/${encodeURIComponent(l7n.name)}`}>
              {l7n.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
