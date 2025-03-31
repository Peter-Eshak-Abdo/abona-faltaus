// import Image from "next/image";
import Link from "next/link";

function Home() {
  return (
    <main className="container">
      <div className="d-flex flex-column justify-content-center align-items-center pt-5 mt-4">
        {/* <Image src="./images/img.jpg" alt="صورة لابونا فلتاؤس" className="img-thumbnail rounded" width={750} height={500} sizes="(max-width: 768px) 90vw" /> */}
        <img
          src="./images/img.jpg"
          alt="صورة لابونا فلتاؤس"
          className="img-thumbnail rounded"
          width={750}
          height={500}
          sizes="(max-width: 768px) 90vw"
        />
        <h1 className="display-1 text-center m-5 text-primary fw-bolder">
          اهلاً بك في صفحة ابونا فلتاؤس
        </h1>
        <p className="fs-4 text-secondry text-center fw-light mt-5">
          صفحة مخصصة للألحان والترانيم والمقالات والآيات والتعاليم المسيحية
          الارثوذكسية
        </p>
      </div>
      <div className="d-flex flex-row justify-content-evenly">
        <div className="d-grid col-3 mx-auto">
          <Link href={"#sec-ayat-mkalat"} className="btn btn-primary fs-4">
            الآيات والمقالات الدينية
          </Link>
        </div>
        <div className="d-grid col-5 mx-auto">
          <Link
            href={"#sec-al7an-tranim-3zat"}
            className="btn btn-outline-primary fs-4"
          >
            قسم الالحان والترانيم والعظات
          </Link>
        </div>
        <div className="d-grid col-2 mx-auto">
          <Link href={"#sec-fqrat"} className="btn btn-primary fs-4">
            عرض فقرات
          </Link>
        </div>
      </div>
      <hr className="featurette-divider" id="sec-al7an-tranim-3zat" />
      <br />
      <br />
      <div className="container marketing">
        <div className="row featurette">
          <div className="col-md-7 text-start">
            <p className="featurette-heading lh-1 fw-bolder fs-2">
              قسم الالحان والترانيم والعظات
            </p>
            <div className="lead fs-4">
              يوجد مجموعات من الالحان مقسمين علي حسب كل مناسبة الالحان الخاص
              بها.
              <p className="text-secondary  fs-4">
                وسيضاف قريباً كلمات الالحان قبطي وعربي وقبطي معرب.
              </p>
              <div className="d-grid gap-2 col-6 mx-auto">
                <Link href={"/al7an"} className="btn btn-outline-primary fs-5">
                  الحان
                </Link>
              </div>
              <br />
              <p className=" fs-4">
                وفي قسم الترانيم يوجد ترانيم مجمعة ليس لها مناسبة واقسام
                للترانيم المخصصة لكل مناسبة.
              </p>
              <p className="text-secondary">وسيضاف كلمات الترانيم.</p>
              <div className="d-grid gap-2 col-6 mx-auto">
                <Link href={"/tranim"} className="btn btn-outline-primary fs-5">
                  ترانيم
                </Link>
              </div>
              <br />
              وفي قسم العظات مقسمة لكل اب كاهن.
              <p className="text-secondary">وسيضاف تقسيمات لكل اب كاهن.</p>
              <div className="d-grid gap-2 col-6 mx-auto">
                <Link href={"/3zat"} className="btn btn-outline-primary fs-5">
                  عظات
                </Link>
              </div>
              <br />
            </div>
          </div>
          <div className="col-md-5">
            <img
              src="./images/sec1.jpeg"
              alt="قسم الالحان والترانيم والعظات"
              className="img-thumbnail rounded"
              width={750}
              height={500}
              sizes="(max-width: 768px) 90vw"
            />
          </div>
        </div>
        <hr className="featurette-divider" id="sec-ayat-mkalat" />

        <div className="row featurette">
          <div className="col-md-7 order-md-2 text-start">
            <p className="featurette-heading fw-bolder lh-1 fs-2">
              قسم الآيات والمقالات
            </p>
            <p className="lead fs-4">في هذا القسم يوجد الآيات المحفوظة</p>
            <div className="d-grid gap-2 col-6 mx-auto">
              <Link href={"/ayat"} className="btn btn-outline-primary fs-5 disabled">
                الآيات
              </Link>
            </div>
            <br />
            <p className="lead fs-4">في هذا المقالات الدينية</p>
            <div className="d-grid gap-2 col-6 mx-auto">
              <Link href={"/mkalat"} className="btn btn-outline-primary fs-5">
                المقالات
              </Link>
            </div>
          </div>
          <div className="col-md-5 order-md-1">
            <img
              src="./images/sec2.jpeg"
              alt="قسم الآيات والمقالات"
              className="img-thumbnail rounded"
              width={750}
              height={500}
              sizes="(max-width: 768px) 90vw"
            />
          </div>
        </div>

        <hr className="featurette-divider" id="sec-fqrat" />
        <div className="row featurette">
          <div className="col-md-7 text-start">
            <p className="featurette-heading fw-bolder lh-1 fs-2">قسم الفقرات</p>
            <div className="lead fs-4">
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
            <img
              src="./images/sec3.jpeg"
              alt="قسم الفقرات"
              className="img-thumbnail rounded"
              width={750}
              height={500}
              sizes="(max-width: 768px) 90vw"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default Home;
