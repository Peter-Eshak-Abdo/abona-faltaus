// import Image from "next/image";

function Home() {
  return (
    <main className="container">
      <div className="d-flex flex-column justify-content-center align-items-center pt-5 mt-4">
        {/* <Image src="../../src/assets/media/images/img.jpg" alt="صورة لابونا فلتاؤس" className="img-thumbnail rounded" width={750} height={500} sizes="(max-width: 768px) 90vw" /> */}
        <h1 className="display-1 text-center m-5 text-primary fw-bolder">اهلاً بك في صفحة ابونا فلتاؤس</h1>
        <p className="fs-4 text-secondry text-center fw-light mt-5">صفحة مخصصة للألحان والترانيم والمقالات والآيات والتعاليم المسيحية الارثوذكسية</p>
      </div>
      <div className="d-flex flex-row justify-content-evenly">
        <a href="site/blog.html" className="btn btn-primary">
          اقراء مقالات دينية
        </a>
        <a href="site/carousel.html" className="btn btn-primary">
          عرض فقرات
        </a>
        <a href="blog/al7an/" className="btn btn-primary">
          الحان
        </a>
        <a href="../blog/tranim/" className="btn btn-primary">
          ترانيم
        </a>
        <a href="blog/w3zat/w3zat.html" className="btn btn-primary">
          وعظات
        </a>
        <a href="#" className="btn btn-primary">
          آيات
        </a>
      </div>
      <hr className="featurette-divider" />
      <br />
      <div className="container marketing">
        <div className="row featurette">
          <div className="col-md-7">
            <a href="site/sounds.html">
              <h2 className="featurette-heading fw-normal lh-1">قسم الالحان والترانيم والوعظات</h2>
            </a>
            <div className="lead">
              يوجد مجموعات من الالحان مقسمين علي حسب كل مناسبة الالحان الخاص بها.{" "}
              <p className="text-secondary">وسيضاف قريباً كلمات اللحنان قبطي وعربي وقبطي معرب.</p>
              <br />
              وفي قسم الترانيم يوجد ترانيم مجمعة ليس لها مناسبة واقسام للترانيم المخصصة لكل مناسبة.{" "}
              <p className="text-secondary">وسيضاف كلمات الترانيم.</p>
              <br />
              وفي قسم الوعظات مقسمة لكل اب كاهن.
              <br />
            </div>
          </div>
          <div className="col-md-5">
            <svg
              className="bd-placeholder-img bd-placeholder-img-lg featurette-image img-fluid mx-auto"
              width="500"
              height="500"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Placeholder: 500x500"
              preserveAspectRatio="xMidYMid slice"
              focusable="false"
            >
              <title>Placeholder</title>
              <rect width="100%" height="100%" fill="var(--bs-secondary-bg)" />
              <text x="50%" y="50%" fill="var(--bs-secondary-color)" dy=".3em">
                500x500
              </text>
            </svg>
          </div>
        </div>

        <hr className="featurette-divider" />
        <div className="row featurette">
          <div className="col-md-7 order-md-2">
            <h2 className="featurette-heading fw-normal lh-1">قسم الآيات</h2>
            <p className="lead">في هذا القسم يوجد الآيات المحفوظة</p>
          </div>
          <div className="col-md-5 order-md-1">
            <svg
              className="bd-placeholder-img bd-placeholder-img-lg featurette-image img-fluid mx-auto"
              width="500"
              height="500"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Placeholder: 500x500"
              preserveAspectRatio="xMidYMid slice"
              focusable="false"
            >
              <title>Placeholder</title>
              <rect width="100%" height="100%" fill="var(--bs-secondary-bg)" />
              <text x="50%" y="50%" fill="var(--bs-secondary-color)" dy=".3em">
                500x500
              </text>
            </svg>
          </div>
        </div>

        <hr className="featurette-divider" />
        <div className="row featurette">
          <div className="col-md-7">
            <h2 className="featurette-heading fw-normal lh-1">قسم الفقرات</h2>
            <div className="lead">
              يوجد مواقع لسهيل عمل الفقرات مثل:
              <ul>
                <li>لعمل تصاميم الرحلات</li>
                <li>كتاب مقدس</li>
                <li>قنوات للوعظات</li>
                <li>لعمل باوربوينت</li>
              </ul>
            </div>
          </div>
          <div className="col-md-5">
            <svg
              className="bd-placeholder-img bd-placeholder-img-lg featurette-image img-fluid mx-auto"
              width="500"
              height="500"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Placeholder: 500x500"
              preserveAspectRatio="xMidYMid slice"
              focusable="false"
            >
              <title>Placeholder</title>
              <rect width="100%" height="100%" fill="var(--bs-secondary-bg)" />
              <text x="50%" y="50%" fill="var(--bs-secondary-color)" dy=".3em">
                500x500
              </text>
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Home;




