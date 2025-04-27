import al7anData from "@/public/al7an-all.json";
import Link from "next/link";

export default async function L7nDetailsPage({ params }) {
  const { monasba, name } = await params;
  const allAl7an = al7anData.find((item) => item[monasba])?.[monasba] || [];
  const l7n = allAl7an.find((item) => item.name === decodeURIComponent(name));

  if (!l7n) return <div className="container mt-5">اللحن غير موجود</div>;

  return (
    <>
      <haed>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/css/lightbox.min.css"
          rel="stylesheet"
        />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/js/lightbox.min.js"></script>
      </haed>
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
            <a href={l7n.src.replace("./", "/")} download class="btn btn-info">
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
                  data-title="اسم اللحن"
                >
                  <img
                    src={l7n[key]}
                    class="card-img-top"
                    alt={`Hazat ${idx}`}
                  />
                </a>
              </div>
            ))}
        </div>
        {/* <div className="row">
          {Object.keys(l7n)
            .filter((key) => key.startsWith("hazatSrc") && l7n[key])
            .map((key, idx) => (
              <div key={idx} className="col-md-4 mb-3">
                <img
                  src={l7n[key]}
                  alt={`Hazat ${idx}`}
                  className="img-fluid rounded"
                />
              </div>
            ))}
        </div> */}
      </div>
    </>
  );
}
