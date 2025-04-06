import AbDaodLam3yAltobaPlayer from "./AbDaodLam3yAltobaPlayer";
import AbDaodLam3yAlslaPlayer from "./AbDaodLam3yAlslaPlayer";
import BabaShenodyPlayer from "./BabaShenodyPlayer";

export const metadata = {
  title: "قسم العظات",
  description: "قسم العظات الارثوذكسية المسيحية",
  keywords: "العظات, العظات الارثوذكسية, عظات ابونا فلتاؤس, عظات ابونا داؤد لمعي, عظات البابا شنودة",
}
function W3zat() {
  return (
    <>
      <main className="container pt-4 mt-5">
        <div className="d-flex flex-column justify-content-center align-items-center pt-5 mt-4">
          {/* <Image src="../../src/assets/media/images/img.jpg" alt="صورة لابونا فلتاؤس" className="img-thumbnail rounded" width={750} height={500} sizes="(max-width: 768px) 90vw" /> */}
          <h1 className="display-1 text-center m-5 text-primary fw-bolder">
            صفحة ابونا فلتاؤس
          </h1>
          <p className="fs-2 text-secondry text-center fw-light mt-5">
            قسم العظات الارثوذكسية المسيحية
          </p>
          <img
            src="./images/sec1.jpeg"
            alt="قسم الالحان والترانيم والعظات"
            className="img-thumbnail rounded"
            width={400}
            height={200}
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
                    قسم عظات ابونا داؤد لمعي
                  </button>
                </h4>
                <div
                  id="collapseOne"
                  className="accordion-collapse collapse"

                >
                  <div className="accordion-body">
                    <div className="accordion-item">
                      <h4 className="accordion-header">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseAlsla"
                          aria-expanded="false"
                          aria-controls="collapseAlsla"
                        >
                          قسم الصلاة
                        </button>
                      </h4>
                      <div
                        id="collapseAlsla"
                        className="accordion-collapse collapse"

                      >
                        <div className="accordion-body">
                          <AbDaodLam3yAlslaPlayer />
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <h4 className="accordion-header">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseAltoba"
                          aria-expanded="false"
                          aria-controls="collapseAltoba"
                        >
                          قسم التوبة
                        </button>
                      </h4>
                      <div
                        id="collapseAltoba"
                        className="accordion-collapse collapse"
                        data-bs-parent="#accordionExample1"
                      >
                        <div className="accordion-body">
                          <AbDaodLam3yAltobaPlayer />
                        </div>
                      </div>
                    </div>
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
                    قسم عظات البابا شنودة
                  </button>
                </h4>
                <div
                  id="collapseTwo"
                  className="accordion-collapse collapse"

                >
                  <div className="accordion-body">
                    <BabaShenodyPlayer />
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

export default W3zat;
