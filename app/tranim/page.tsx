import Header from "@/components/Header";
import KyamaPlayer from "./KyamaPlayer";
import MeladPlayer from "./MeladPlayer";
import Footer from "@/components/Footer";

function Tranim() {
  return (
    <>
      <Header />

      <main className="container pt-4 mt-5">
        <div className="d-flex flex-column justify-content-center align-items-center pt-5 mt-4">
          {/* <Image src="../../src/assets/media/images/img.jpg" alt="صورة لابونا فلتاؤس" className="img-thumbnail rounded" width={750} height={500} sizes="(max-width: 768px) 90vw" /> */}
          <h1 className="display-1 text-center m-5 text-primary fw-bolder">صفحة ابونا فلتاؤس</h1>
          <p className="fs-2 text-secondry text-center fw-light mt-5">قسم الترانيم الارثوذكسية المسيحية</p>
          <img src="./images/sec1.jpeg" alt="قسم الترانيم" className="img-thumbnail rounded" width={750} height={500} sizes="(max-width: 768px) 90vw" />
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
                    قسم ترانيم عيد الميلاد
                  </button>
                </h4>
                <div id="collapseOne" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
                  <div className="accordion-body">
                    <MeladPlayer />
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
                    قسم ترانيم عيد القيامة
                  </button>
                </h4>
                <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
                  <div className="accordion-body">
                    <KyamaPlayer />
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

export default Tranim;

