import Image from "next/image";
import KyamaPlayer from "./KyamaPlayer";
import MeladPlayer from "./MeladPlayer";

export const metadata = {
  title: "الترانيم",
  description: "ترانيم مسيحية ارثوذكسية",
  keywords: "ترانيم, ترانيم مسيحية, ترانيم ارثوذكسية, ترانيم عيد الميلاد, ترانيم عيد القيامة",
};

function Tranim() {
  return (
    <>
      <main className="container">
        <div className="d-flex flex-column justify-content-center align-items-center">
          <h1 className="display-1 text-center m-5 text-primary fw-bolder">صفحة ابونا فلتاؤس</h1>
          <h2 className="fs-2 text-secondry text-center fw-light mt-2"> الترانيم الارثوذكسية المسيحية</h2>
          <Image src="/images/sec1.jpeg" alt=" الترانيم" className="img-thumbnail rounded" width={750} height={500} sizes="(max-width: 768px) 90vw" />
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
                    ترانيم عيد الميلاد
                  </button>
                </h4>
                <div id="collapseOne" className="accordion-collapse collapse visible">
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
                    ترانيم عيد القيامة
                  </button>
                </h4>
                <div id="collapseTwo" className="accordion-collapse collapse visible" >
                  <div className="accordion-body">
                    <KyamaPlayer />
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

export default Tranim;
