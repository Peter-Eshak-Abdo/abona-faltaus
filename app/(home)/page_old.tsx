import "../globals.css";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = {
  title: "ابونا فلتاؤس السرياني تفاحة",
  description: "الحان وترانيم وعظات والكتاب المقدس ومقالات و امتحانات اسئلة دينية فردية و مجموعات وكل ما يخص الكنيسة الارثوذكسية",
  keywords: "الحان , عظات , وعظات , ترانيم , مقالات دينية , امتحانات , اسئلة دينية , ابونا فلتاؤس السرياني , الكتاب المقدس , كنيسة , ارثوذكسية",
};

function Home() {
  return (
    <>
    <main className="max-w-7xl mx-auto">
      <div className="flex flex-col justify-center items-center pt-20 mt-16">
        {/* <Image src="./images/img.jpg" alt="صورة لابونا فلتاؤس" className="rounded-lg border border-gray-300" width={750} height={500} sizes="(max-width: 768px) 90vw" /> */}
        <Image
          src="/images/logo.jpg"
          alt="صورة لابونا فلتاؤس"
          className="w-3/4 rounded-lg"
          width={750}
          height={500}
          sizes="(max-width: 768px) 80vw, (max-width: 1200px) 50vw, 33vw"
        />
        <h1 className="text-6xl text-center m-20 text-blue-600 font-extrabold">
          اهلاً بك في صفحة ابونا فلتاؤس
        </h1>
        <p className="text-lg text-gray-600 text-center font-light mt-20">
          صفحة مخصصة للألحان والترانيم والمقالات والآيات والتعاليم المسيحية
          الارثوذكسية
        </p>
      </div>
      <div className="w-full p-0">
        <div className="flex flex-wrap gap-2 justify-center">
          <div className="w-full sm:w-1/3 md:w-1/4 flex">
            <Link
              href={"#sec-bible-mkalat"}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full text-lg sm:text-base py-2 px-4 rounded text-center"
            >
              الكتاب المقدس والمقالات
            </Link>
          </div>
          <div className="w-full sm:w-1/3 md:w-5/12 flex">
            <Link
              href={"#sec-al7an-tranim-3zat"}
              className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white w-full text-lg sm:text-base py-2 px-4 rounded text-center"
            >
              الالحان والترانيم والعظات
            </Link>
          </div>
          <div className="w-full sm:w-1/3 md:w-1/4 flex">
            <Link
              href={"#sec-fqrat"}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full text-lg sm:text-base py-2 px-4 rounded text-center"
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
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-7/12 text-right">
            <p className="text-3xl font-extrabold leading-tight">
              الالحان والترانيم والعظات
            </p>
            <div className="text-lg">
              يوجد مجموعات من الالحان مقسمين علي حسب كل مناسبة الالحان الخاص
              بها ويوجد هزات كل لحن وملف هزات كل مناسبة.
              <p className="text-gray-600 text-lg">
                وسيضاف قريباً كلمات الالحان قبطي وعربي وقبطي معرب.
              </p>
              <div className="flex justify-center w-3/4 mx-auto gap-2">
                <Link href={"/al7an"} className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded text-base">
                  الحان
                </Link>
              </div>
              <br />
              <p className="text-lg">
                وفي الترانيم يوجد ترانيم مجمعة ليس لها مناسبة واقسام
                للترانيم المخصصة لكل مناسبة.
              </p>
              <p className="text-gray-600">وسيضاف كلمات الترانيم.</p>
              <div className="flex justify-center w-3/4 mx-auto gap-2">
                <Link href={"/tranim"} className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded text-base">
                  ترانيم
                </Link>
              </div>
              <br />
              وفي العظات مقسمة لكل اب كاهن.
              <p className="text-gray-600">وسيضاف تقسيمات لكل اب كاهن.</p>
              <div className="flex justify-center w-3/4 mx-auto gap-2">
                <Link href={"/3zat"} className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded text-base">
                  عظات
                </Link>
              </div>
              <br />
            </div>
          </div>
          <div className="md:w-5/12">
            <Image
              src="/images/sec1.jpeg"
              alt="الالحان والترانيم والعظات"
              className="rounded-lg border border-gray-300"
              width={750}
              height={500}
              sizes="(max-width: 768px) 90vw"
            />
          </div>
        </div>

        <hr className="featurette-divider" id="sec-bible-mkalat" />
        <br /><br /><br /><br />
        <div className="flex flex-col md:flex-row">
          <div className="md:w-7/12 md:order-2 text-right">
            <p className="text-3xl font-extrabold leading-tight">
              الكتاب المقدس والمقالات
            </p>
            <p className="text-lg">في هذا  يوجد الكتاب المقدس</p>
            <p className="text-gray-600 text-xl">Thanks to : Androw Akladuos Bekhet <br/> for his ideas that hepled me alot</p>
            <h6 className="text-gray-600">عارف انه مش كامل في مشكلة وانا مش فاهمها ف لما افهمها هبقي اشوف</h6>
            <div className="flex justify-center w-3/4 mx-auto gap-2">
              <Link href={"/bible"} className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded text-base">
                الكتاب المقدس
              </Link>
            </div>
            <br />
            <p className="text-lg">يوجد مقالات من اباء كهنة او مقالات حياتية</p>
            <div className="flex justify-center w-3/4 mx-auto gap-2">
              <Link href={"/mkalat"} className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded text-base">
                المقالات
              </Link>
            </div>
            <h6 className="text-gray-500">عارف الصورة غلط هبقي اغيرها بعدين</h6>
          </div>
          <div className="md:w-5/12 md:order-1">
            <Image
              src="/images/sec2.jpeg"
              alt=" الآيات والمقالات"
              className="rounded-lg border border-gray-300"
              width={750}
              height={500}
              sizes="(max-width: 768px) 90vw"
            />
          </div>
        </div>

        <hr className="featurette-divider" id="sec-fqrat" />
        <br /><br /><br /><br />
        <div className="flex flex-col md:flex-row">
          <div className="md:w-7/12 text-right">
            <p className="text-3xl font-extrabold leading-tight"> الفقرات</p>
            <div className="text-lg">
              يوجد مواقع لتسهيل عمل الفقرات مثل:
              <ul>
                <li>لعمل تصاميم الرحلات</li>
                <li>كتاب مقدس</li>
                <li>قنوات للوعظات</li>
                <li>لعمل باوربوينت</li>
              </ul>
              <p className="text-lg">في الامتحانات فردية ومجموعات</p>
              <div className="flex justify-center w-3/4 mx-auto gap-2">
                <Link href={"/exam"} className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded text-base">
                  الامتحانات
                </Link>
              </div>
            </div>
          </div>
          <div className="md:w-5/12">
            <Image
              src="/images/sec3.jpeg"
              alt=" الفقرات"
              className="rounded-lg border border-gray-300"
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
