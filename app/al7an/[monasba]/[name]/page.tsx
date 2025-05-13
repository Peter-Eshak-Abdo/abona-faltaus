import al7anData from "@/public/al7an-all.json";
import Link from "next/link";
import { Metadata } from "next";
import Script from "next/script";

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
  name: string;
};

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const awaitedParams = await params;
  const { monasba, name } = awaitedParams;
  const allAl7an = typedAl7anData.find((item) => item[monasba])?.[monasba] || [];
  const l7n = allAl7an.find((item) => item.name === decodeURIComponent(name));

  if (!l7n) {
    return {
      title: "اللحن غير موجود",
    };
  }

  return {
    title: l7n.name,
    description: `استماع وتحميل لحن ${l7n.name} من مناسبة ${monasba}`,
    keywords: [l7n.name, monasba, "الحان", "ترانيم", "كنيسة", "ارثوذكسية"],
  };
}

export default async function L7nDetailsPage({ params }: { params: PageParams }) {
  const { monasba, name } = await params;
  const allAl7an = typedAl7anData.find((item) => item[monasba])?.[monasba] || [];
  const l7n = allAl7an.find((item) => item.name === decodeURIComponent(name));

  if (!l7n) return <div className="container mt-5">اللحن غير موجود</div>;

  return (
    <>
      <head>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/css/lightbox.min.css"
          rel="stylesheet"
        />
      </head>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/js/lightbox.min.js" />
      <div className="container mt-5">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">الرئيسية</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/al7an">الألحان</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href={`/al7an/${monasba}`}>{monasba}</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {l7n.name}
            </li>
          </ol>
        </nav>

        <h1>{l7n.name}</h1>
        <p>المدة: {l7n.duration}</p>

        {l7n.src && (
          <>
            <audio
              controls
              src={l7n.src.replace("./", "/")}
              className="my-3"
              style={{ width: "100%" }}
            >
              متصفحك لا يدعم تشغيل الصوت.
            </audio>
            <a href={l7n.src.replace("./", "/")} download className="btn btn-info">
              حفظ اللحن اوفلاين
            </a>
          </>
        )}

        <div className="row">
          {Object.keys(l7n)
            .filter((key) => key.startsWith("hazatSrc") && l7n[key])
            .map((key, idx) => (
              <div key={idx} className="col-md-4 mb-3">
                <a
                  href={l7n[key]}
                  data-lightbox="lahn-gallery"
                  data-title={l7n.name}
                >
                  <img
                    src={l7n[key]}
                    className="card-img-top"
                    alt={`Hazat ${idx}`}
                  />
                </a>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
