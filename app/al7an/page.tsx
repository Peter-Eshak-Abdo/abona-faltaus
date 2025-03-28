import SomKebirPlayer from "./SomKebirPlayer";
import KeahkPlayer from "./KeahkPlayer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Asbo3AlamPlayer from "./Asbo3AlamPlayer";
import SnawiPlayer from "./SnawiPlayer";
import KhmacenPlayer from "./KhmacenPlayer";
import NhdetAl3draPlayer from "./NhdetAl3draPlayer";

function Al7an() {
  return (
    <>
      <Header />
      <main className="container pt-4 mt-5">
        <div className="d-flex flex-column justify-content-center align-items-center pt-5 mt-4">
          {/* <Image src="../../src/assets/media/images/img.jpg" alt="صورة لابونا فلتاؤس" className="img-thumbnail rounded" width={750} height={500} sizes="(max-width: 768px) 90vw" /> */}
          <h1 className="display-1 text-center m-5 text-primary fw-bolder">
            صفحة ابونا فلتاؤس
          </h1>
          <p className="fs-2 text-secondry text-center fw-light mt-5">
            قسم الالحان الارثوذكسية المسيحية
          </p>
          <img
            src="./images/sec1.jpeg"
            alt="قسم الالحان والترانيم والعظات"
            className="img-thumbnail rounded"
            width={750}
            height={500}
            sizes="(max-width: 768px) 90vw"
          />
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
                    قسم الحان الصوم الكبير
                  </button>
                </h4>
                <div
                  id="collapseOne"
                  className="accordion-collapse collapse"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    <SomKebirPlayer />
                    {/* <SomKebirPlayer source={sounds.filter((sound) => sound.monasba === "som-kebir").map((sound) => sound.src)} /> */}
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
                    قسم الحان كيهك
                  </button>
                </h4>
                <div
                  id="collapseTwo"
                  className="accordion-collapse collapse"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    <KeahkPlayer />
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
                    قسم الحان اسبوع الآلام
                  </button>
                </h4>
                <div
                  id="collapseThree"
                  className="accordion-collapse collapse"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    <Asbo3AlamPlayer />
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
                    قسم الحان سنوي
                  </button>
                </h4>
                <div
                  id="collapseFour"
                  className="accordion-collapse collapse"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    <SnawiPlayer />
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
                    قسم الحان خماسين
                  </button>
                </h4>
                <div
                  id="collapseFive"
                  className="accordion-collapse collapse"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    <KhmacenPlayer />
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
                    قسم الحان نهضة العذراء
                  </button>
                </h4>
                <div
                  id="collapseSix"
                  className="accordion-collapse collapse"
                  data-bs-parent="#accordionExample"
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
      <Footer />
    </>
  );
}

export default Al7an;





