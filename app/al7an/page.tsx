import SomKebirPlayer from "./SomKebirPlayer";
import KeahkPlayer from "./KeahkPlayer";
import Asbo3AlamPlayer from "./Asbo3AlamPlayer";
// import SnawiPlayer from "./SnawiPlayer";
import KhmacenPlayer from "./KhmacenPlayer";
import NhdetAl3draPlayer from "./NhdetAl3draPlayer";
import Image from "next/image";
// import Link from "next/link";
// import snawi from './snawi.json';

export const metadata = {
  title: " الحان",
  description: " الحان الارثوذكسية المسيحية",
  keywords: "الحان , طقس صنوي , طقس كيهك , طقس الصوم الكبير , طقس الخماسين , طقس عيد الميلاد , طقس عيد الغطاس , طقس عيد النيروز , طقس عيد الصليب , طقس عيد القيامة , طقس عيد العذراء",
}

// const PdfViewer = ({ pdfUrl }: { pdfUrl: string }) => {
//   return (
//     <embed
//       src={pdfUrl}
//       title="قسم الحان الصوم الكبير و صوم نينوي"
//       type="application/pdf"
//       width="85%"
//       height="600px" // Adjust as needed
//     />
//   );
// };
function Al7an() {
  // const pdfUrl = "./al7an/pdf/الصوم الكبير و صوم نينوي.pdf"; // Path to your PDF file
  return (
    <>
      <main className="container pt-4 mt-5">
        <div className="d-flex flex-column justify-content-center align-items-center pt-5 mt-4">
          {/* <Image src="../../src/assets/media/images/img.jpg" alt="صورة لابونا فلتاؤس" className="img-thumbnail rounded" width={750} height={500} sizes="(max-width: 768px) 90vw" /> */}
          <h1 className="display-1 text-center m-5 text-primary fw-bolder">
            صفحة ابونا فلتاؤس
          </h1>
          <p className="fs-2 text-secondry text-center fw-light mt-5">
            الالحان الارثوذكسية المسيحية
          </p>
          <Image
            src="/images/sec1.jpeg"
            alt=" الالحان والترانيم والعظات"
            className="img-thumbnail rounded"
            width={750}
            height={500}
            sizes="(max-width: 768px) 90vw"
          />
          <a href="./al7an/pdf/النيروز و الصليب.pdf" download={"النيروز و الصليب.pdf"} className="btn btn-primary my-2">تنزيل ملف هزات عيد النيروز و الصليب</a>
          <a href="./al7an/pdf/كيهك و الميلاد.pdf" download={"كيهك و الميلاد.pdf"} className="btn btn-primary my-2">تنزيل ملف هزات شهر كيهك و عيد الميلاد</a>
          <a href="./al7an/pdf/التسبحة.pdf" download={"التسبحة.pdf"} className="btn btn-primary my-2">تنزيل ملف هزات التسبحة</a>
          <a href="./al7an/pdf/الطقس السنوي.pdf" download={"الطقس السنوي.pdf"} className="btn btn-primary my-2">تنزيل ملف هزات السنوي</a>
          <a href="./al7an/pdf/الغطاس و اللقان.pdf" download={"الغطاس و اللقان.pdf"} className="btn btn-primary my-2">تنزيل ملف هزات عيد الغطاس و اللقان</a>
          <a href="./al7an/pdf/الصوم الكبير و صوم نينوي.pdf" download={"هزات الصوم الكبير و صوم نينوي.pdf"} className="btn btn-primary my-2">تنزيل ملف هزات الصوم الكبير وصوم نينوي</a>
          <a href="./al7an/pdf/سبت لعازر و احد الشعانين.pdf" download={"سبت لعازر و احد الشعانين.pdf"} className="btn btn-primary my-2">تنزيل ملف هزات سبت لعازر واحد الشعانين</a>
          <a href="./al7an/pdf/البصخة.pdf" download={"البصخة.pdf"} className="btn btn-primary my-2">تنزيل ملف هزات البصخة</a>
          <a href="./al7an/pdf/مزامير البصخة.pdf" download={"مزامير البصخة.pdf"} className="btn btn-primary my-2">تنزيل ملف هزات مزامير البصخة</a>
          <a href="./al7an/pdf/سبت الفرح.pdf" download={"سبت الفرح.pdf"} className="btn btn-primary my-2">تنزيل ملف هزات سبت الفرح</a>
          <a href="./al7an/pdf/الخماسين.pdf" download={"الخماسين.pdf"} className="btn btn-primary my-2">تنزيل ملف هزات الخماسين</a>
          <a href="./al7an/pdf/صوم الرسل.pdf" download={"صوم الرسل.pdf"} className="btn btn-primary my-2">تنزيل ملف هزات صوم الرسل</a>
        </div>
        <div className="bd-example-snippet bd-code-snippet">
          <div className="bd-example m-0 border-0">
            <div className="accordion" id="accordionExample">
              <div className="accordion-item">
                <h4 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseOne"
                    aria-expanded="false"
                    aria-controls="collapseOne"
                  >
                     الحان الصوم الكبير
                  </button>
                </h4>
                <div
                  id="collapseOne"
                  className="accordion-collapse collapse"
                >
                  <div className="accordion-body">
                    <SomKebirPlayer />
                    <audio controls>
                      <source src="https://docs.google.com/uc?export=download&id=1LAFS_6kNqL100fqwKgfy2_wWKmBGSsOI" type="audio/mp3" />
                      Your browser does not support the audio element.
                    </audio>

                    {/* <iframe
                      src="./al7an/pdf/الصوم الكبير و صوم نينوي.pdf"
                      title="قسم الحان الصوم الكبير و صوم نينوي"
                      width="85%"
                      height="500"
                    ></iframe>
                    <object data="./al7an/pdf/الصوم الكبير و صوم نينوي.pdf" type="application/pdf" width="85%" height="500px">
                      <p>Unable to display PDF file. <a href="./al7an/pdf/الصوم الكبير و صوم نينوي.pdf">Download</a> instead.</p>
                    </object>
                    <PdfViewer pdfUrl={pdfUrl} />
                    <embed src="./al7an/pdf/الصوم الكبير و صوم نينوي.pdf" type="application/pdf" width="85%" height="500px" /> */}
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h4 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseTwo"
                    aria-expanded="false"
                    aria-controls="collapseTwo"
                  >
                     الحان كيهك
                  </button>
                </h4>
                <div
                  id="collapseTwo"
                  className="accordion-collapse collapse"

                >
                  <div className="accordion-body">
                    <KeahkPlayer />
                    {/* <iframe
                      src="./al7an/pdf/التسبحة.pdf"
                      title="قسم الحان التسبحة"
                      width="100%"
                      height="500"
                    ></iframe>
                    <iframe
                      src="./al7an/pdf/كيهك و الميلاد.pdf"
                      title="قسم الحان كيهك و الميلاد"
                      width="100%"
                      height="500"
                    ></iframe> */}
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h4 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseThree"
                    aria-expanded="false"
                    aria-controls="collapseThree"
                  >
                     الحان اسبوع الآلام
                  </button>
                </h4>
                <div
                  id="collapseThree"
                  className="accordion-collapse collapse"

                >
                  <div className="accordion-body">
                    <Asbo3AlamPlayer />
                    {/* <iframe
                      src="./al7an/pdf/سبت لعازر و احد الشعانين.pdf"
                      title="قسم الحان سبت لعازر و احد الشعانين"
                      width="100%"
                      height="500"
                    ></iframe>
                    <iframe
                      src="./al7an/pdf/البصخة.pdf"
                      title="قسم الحان البصخة"
                      width="100%"
                      height="500"
                    ></iframe>
                    <iframe
                      src="./al7an/pdf/مزامير البصخة.pdf"
                      title="قسم الحان مزامير البصخة"
                      width="100%"
                      height="500"
                    ></iframe>
                    <iframe
                      src="./al7an/pdf/سبت الفرح.pdf"
                      title="قسم الحان سبت الفرح"
                      width="100%"
                      height="500"
                    ></iframe> */}
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h4 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseFour"
                    aria-expanded="false"
                    aria-controls="collapseFour"
                  >
                     الحان سنوي
                  </button>
                </h4>
                <div
                  id="collapseFour"
                  className="accordion-collapse collapse"
                >
                  <div className="accordion-body">
                    {/* <ul>
                      {snawi.snawi.map(la7n => (
                        <li key={la7n.id}>
                          <Link href={`/al7an/al7an-tfasil/${la7n.id}`} legacyBehavior>
                            <a>{la7n.name}</a>
                          </Link>
                        </li>
                      ))}
              </ul> */}
                    {/* <ul>
                      <li>
                        <Link href="/al7an/al7an-tfasil/1">Post 1</Link>
                      </li>
                      <li>
                        <Link href="/al7an/al7an-tfasil/2">Post 2</Link>
                      </li>
                      <li>
                        <Link href="/al7an/al7an-tfasil/3">Post 3</Link>
                      </li>
                    </ul> */}
                    {/* <SnawiPlayer /> */}
                    {/* <iframe
                      src="./al7an/pdf/الطقس السنوي.pdf"
                      title="قسم الحان الطقس السنوي"
                      width="100%"
                      height="500"
                    ></iframe> */}
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h4 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseFive"
                    aria-expanded="false"
                    aria-controls="collapseFive"
                  >
                     الحان خماسين
                  </button>
                </h4>
                <div
                  id="collapseFive"
                  className="accordion-collapse collapse"

                >
                  <div className="accordion-body">
                    <KhmacenPlayer />
                    {/* <iframe
                      src="./al7an/pdf/الخماسين.pdf"
                      title="قسم الحان خماسين"
                      width="100%"
                      height="500"
                    ></iframe> */}
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h4 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseSix"
                    aria-expanded="false"
                    aria-controls="collapseSix"
                  >
                     الحان نهضة العذراء
                  </button>
                </h4>
                <div
                  id="collapseSix"
                  className="accordion-collapse collapse"

                >
                  <div className="accordion-body">
                    <NhdetAl3draPlayer />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Al7an;
