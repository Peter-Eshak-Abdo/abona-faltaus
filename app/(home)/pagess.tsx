import "../globals.css";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = {
  metadataBase: new URL("https://abona-faltaus.vercel.app"),
  title: "ابونا فلتاؤس السرياني تفاحة",
  description: "الحان وترانيم وعظات والكتاب المقدس ومقالات و امتحانات اسئلة دينية فردية و مجموعات وكل ما يخص الكنيسة الارثوذكسية",
  keywords: "الحان , عظات , وعظات , ترانيم , مقالات دينية , امتحانات , اسئلة دينية , ابونا فلتاؤس السرياني , الكتاب المقدس , كنيسة , ارثوذكسية",
};

function Home() {
  return (
    <>
    <main className="container">
      <div className="d-flex flex-column justify-content-center align-items-center pt-5 mt-4">
        {/* <Image src="./images/img.jpg" alt="صورة لابونا فلتاؤس" className="img-thumbnail rounded" width={750} height={500} sizes="(max-width: 768px) 90vw" /> */}
        <Image
          src="/images/logo.jpg"
          alt="صورة لابونا فلتاؤس"
          className="w-75 rounded img-fluid"
          width={750}
          height={500}
          sizes="(max-width: 768px) 80vw, (max-width: 1200px) 50vw, 33vw"
        />
        <h1 className="display-1 text-center m-5 text-primary fw-bolder">
          اهلاً بك في صفحة ابونا فلتاؤس
        </h1>
        <p className="fs-4 text-secondry text-center fw-light mt-5">
          صفحة مخصصة للألحان والترانيم والمقالات والآيات والتعاليم المسيحية
          الارثوذكسية
        </p>
      </div>
      <div className="container-fluid p-0">
        <div className="row g-2 justify-content-center">
          <div className="col-12 col-sm-4 col-md-3 d-flex">
            <Link
              href={"#sec-bible-mkalat"}
              className="btn btn-primary w-100 fs-4 fs-sm-5 py-2"
            >
              الكتاب المقدس والمقالات
            </Link>
          </div>
          <div className="col-12 col-sm-4 col-md-5 d-flex">
            <Link
              href={"#sec-al7an-tranim-3zat"}
              className="btn btn-outline-primary w-100 fs-4 fs-sm-5 py-2"
            >
              الالحان والترانيم والعظات
            </Link>
          </div>
          <div className="col-12 col-sm-4 col-md-3 d-flex">
            <Link
              href={"#sec-fqrat"}
              className="btn btn-primary w-100 fs-4 fs-sm-5 py-2"
            >
              الفقرات والامتحانات
            </Link>
          </div>
        </div>
      </div>
      <hr className="featurette-divider" id="sec-al7an-tranim-3zat" />
      <br />
      <br />
      {/* <div className="relative my-12">
        <div className="absolute inset-0 flex items-center">
          <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent w-full animate-draw"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white dark:bg-gray-900 px-6 text-2xl font-bold text-primary transform transition-all duration-500 hover:scale-110">
            الالحان والترانيم والعظات
          </span>
        </div>
      </div> */}
      <br />
      <br />
      <div className="container marketing">
        <div className="row featurette">
          <div className="col-md-7 text-start">
            <p className="featurette-heading lh-1 fw-bolder fs-2">
              الالحان والترانيم والعظات
            </p>
            <div className="lead fs-4">
              يوجد مجموعات من الالحان مقسمين علي حسب كل مناسبة الالحان الخاص
              بها ويوجد هزات كل لحن وملف هزات كل مناسبة.
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
                وفي الترانيم يوجد ترانيم مجمعة ليس لها مناسبة واقسام
                للترانيم المخصصة لكل مناسبة.
              </p>
              <p className="text-secondary">وسيضاف كلمات الترانيم.</p>
              <div className="d-grid gap-2 col-6 mx-auto">
                <Link href={"/tranim"} className="btn btn-outline-primary fs-5">
                  ترانيم
                </Link>
              </div>
              <br />
              وفي العظات مقسمة لكل اب كاهن.
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
            <Image
              src="/images/sec1.jpeg"
              alt="الالحان والترانيم والعظات"
              className="img-thumbnail rounded"
              width={750}
              height={500}
              sizes="(max-width: 768px) 90vw"
            />
          </div>
        </div>

        <hr className="featurette-divider" id="sec-bible-mkalat" />
        <br /><br /><br /><br />
        <div className="row featurette">
          <div className="col-md-7 order-md-2 text-start">
            <p className="featurette-heading fw-bolder lh-1 fs-2">
              الكتاب المقدس والمقالات
            </p>
            <p className="lead fs-4">في هذا  يوجد الكتاب المقدس</p>
            <p className="text-secondary fs-3">Thanks to : Androw Akladuos Bekhet <br/> for his ideas that hepled me alot</p>
            <h6 className="text-secondary">عارف انه مش كامل في مشكلة وانا مش فاهمها ف لما افهمها هبقي اشوف</h6>
            <div className="d-grid gap-2 col-6 mx-auto">
              <Link href={"/bible"} className="btn btn-outline-primary fs-5">
                الكتاب المقدس
              </Link>
            </div>
            <br />
            <p className="lead fs-4">يوجد مقالات من اباء كهنة او مقالات حياتية</p>
            <div className="d-grid gap-2 col-6 mx-auto">
              <Link href={"/mkalat"} className="btn btn-outline-primary fs-5">
                المقالات
              </Link>
            </div>
            <h6 className="text-body-secondary">عارف الصورة غلط هبقي اغيرها بعدين</h6>
          </div>
          <div className="col-md-5 order-md-1">
            <Image
              src="/images/sec2.jpeg"
              alt=" الآيات والمقالات"
              className="img-thumbnail rounded"
              width={750}
              height={500}
              sizes="(max-width: 768px) 90vw"
            />
          </div>
        </div>

        <hr className="featurette-divider" id="sec-fqrat" />
        <br /><br /><br /><br />
        <div className="row featurette">
          <div className="col-md-7 text-start">
            <p className="featurette-heading fw-bolder lh-1 fs-2"> الفقرات</p>
            <div className="lead fs-4">
              يوجد مواقع لتسهيل عمل الفقرات مثل:
              <ul>
                <li>لعمل تصاميم الرحلات</li>
                <li>كتاب مقدس</li>
                <li>قنوات للوعظات</li>
                <li>لعمل باوربوينت</li>
              </ul>
              <p className="lead fs-4">في الامتحانات فردية ومجموعات</p>
              <div className="d-grid gap-2 col-6 mx-auto">
                <Link href={"/exam"} className="btn btn-outline-primary fs-5">
                  الامتحانات
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-5">
            <Image
              src="/images/sec3.jpeg"
              alt=" الفقرات"
              className="img-thumbnail rounded"
              width={750}
              height={500}
              sizes="(max-width: 768px) 90vw"
            />
          </div>
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
}

export default Home;
