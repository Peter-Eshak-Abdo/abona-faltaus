import SoundPlayer from "./sounds";

function Al7an() {
  return (
    <>
      <main className="container pt-4 mt-5">
        <div className="bd-example-snippet bd-code-snippet">
          <div className="bd-example m-0 border-0">
            <div className="accordion" id="accordionExample">
              <div className="accordion-item">
                <h4 className="accordion-header">
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseOne"
                    aria-expanded="true"
                    aria-controls="collapseOne"
                  >
                    قسم الحان الصوم الكبير
                  </button>
                </h4>
                <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                  <div className="accordion-body">
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3" id="sec-som-kebir">
                      <SoundPlayer />
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
                    قسم الحان كيهك
                  </button>
                </h4>
                <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
                  <div className="accordion-body">
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3" id="sec-keahk">
                      <SoundPlayer />
                    </div>
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

