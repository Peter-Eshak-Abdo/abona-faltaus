"use client";

const sounds = [
  {
    monasba: "khmacen",
    name: "لحن السبع طرائق",
    duration: "26:44",
    src: "./al7an/لحن السبع طرائق.mp3",
    hazatSrc: "./al7an/hazat/الخماسين_page-0014.png",
  },
  {
    monasba: "khmacen",
    name: "لحن ني صافيف تيرو",
    duration: "5:42",
    src: "./al7an/لحن ني صافيف تيرو.mp3",
    hazatSrc: "./al7an/hazat/الخماسين_page-0079.png",
  },

  // { // صوم الرسل
  //   monasba: "khmacen",
  //   name: "لحن_اوكيريوس_ميتاسو",
  //   duration: "4:26",
  //   src: "./al7an/لحن_اوكيريوس_ميتاسو.mp3",
  // },
];

const KhmacenPlayer: React.FC = () => {
  return (
    <div
      id="sec-khmacen"
      className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3"
    >
      {sounds
        .filter((sound) => sound.monasba === "khmacen")
        .map((sound, index) => (
          <div className="col" key={`khmacen-${index}`}>
            <div className="card shadow-sm pt-3 ps-3" key={`khmacen-${index}`}>
              <div className="d-flex justify-content-center align-items-center">
                <audio controls>
                  <source src={sound.src} type="audio/mpeg" />
                  متصفحك لا يدعم ملفات الصوت.
                </audio>
              </div>
              <div className="card-body text-start">
                <p className="card-text">
                  <span className="fw-bold">اسم اللحن: </span>
                  {sound.name}
                </p>
                <p className="card-text">
                  <span className="fw-bold align-content-end">
                    المناسبة التي يقال فيها:{" "}
                  </span>
                  الخماسين المقدسة
                </p>
                {/* <img
                  src={sound.hazatSrc}
                  alt={sound.name}
                  className="img-thumbnail"
                /> */}

                <div className="d-flex justify-content-between align-items-center">
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                    >
                      تفاصيل
                    </button>
                    <div
                      className="modal fade"
                      id={"exampleModel" + index}
                      data-bs-backdrop="static"
                      data-bs-keyboard="false"
                      tabIndex={-1}
                      aria-labelledby={"exampleModelLabel" + index}
                      // aria-labelledby={`infoLabel${[index]}`}
                      aria-hidden="true"
                    >
                      <div className="modal-dialog modal-dialog-scrollable">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h1 className="modal-title fs-5" id={"exampleModelLabel" + index}>{sound.name}</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div className="modal-body">
                            <img src={sound.hazatSrc} className="card-img-top" alt={sound.name} />
                            {/* {sound.hazatSrc1 == "" ? <p>مفيش صورة لللحن ده</p> : <img
                              src={sound.hazatSrc1}
                              alt={sound.name}
                              className="img-thumbnail" />}
                            {sound.hazatSrc2 == "" ? <br /> : <img
                              src={sound.hazatSrc2}
                              alt={sound.name}
                              className="img-thumbnail" />}
                            {sound.hazatSrc3 == "" ? <br /> : <img
                              src={sound.hazatSrc3}
                              alt={sound.name}
                              className="img-thumbnail" />}
                            {sound.hazatSrc4 == "" ? <br /> : <img
                              src={sound.hazatSrc4}
                              alt={sound.name}
                              className="img-thumbnail" />}
                            {sound.hazatSrc5 == "" ? <br /> : <img
                              src={sound.hazatSrc5}
                              alt={sound.name}
                              className="img-thumbnail" />} */}
                          </div>
                          <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button className="btn-information" data-bs-target="#payment${[i]}" data-bs-toggle="modal">Open Payment</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="modal fade" id="payment${[i]}" aria-hidden="true" aria-labelledby="paymentLabel${[i]}" tabIndex={-1}>
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h1 className="modal-title fs-5" id="paymentLabel${[i]}">Modal 2</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div className="modal-body">
                            <h4 className="mb-3">Payment TripsData[i].payment LE</h4>

                            <div className="my-3">
                              <div className="form-check">
                                <input id="credit" name="paymentMethod" type="radio" className="form-check-input" checked required />
                                <label className="form-check-label" htmlFor="credit">Credit card</label>
                              </div>
                              <div className="form-check">
                                <input id="debit" name="paymentMethod" type="radio" className="form-check-input" required />
                                <label className="form-check-label" htmlFor="debit">Debit card</label>
                              </div>
                              <div className="form-check">
                                <input id="paypal" name="paymentMethod" type="radio" className="form-check-input" required />
                                <label className="form-check-label" htmlFor="paypal">PayPal</label>
                              </div>
                            </div>

                            <div className="row gy-3">
                              <div className="col-md-6">
                                <label htmlFor="cc-name" className="form-label">Name on card</label>
                                <input type="text" className="form-control" id="cc-name" placeholder="" required />
                                <small className="text-body-secondary">Full name as displayed on card</small>
                                <div className="invalid-feedback">Name on card is required</div>
                              </div>

                              <div className="col-md-6">
                                <label htmlFor="cc-number" className="form-label">Credit card number</label>
                                <input type="text" className="form-control" id="cc-number" placeholder="" required />
                                <div className="invalid-feedback">Credit card number is required</div>
                              </div>

                              <div className="col-md-3">
                                <label htmlFor="cc-expiration" className="form-label">Expiration</label>
                                <input type="text" className="form-control" id="cc-expiration" placeholder="" required />
                                <div className="invalid-feedback">Expiration date required</div>
                              </div>

                              <div className="col-md-3">
                                <label htmlFor="cc-cvv" className="form-label">CVV</label>
                                <input type="text" className="form-control" id="cc-cvv" placeholder="" required />
                                <div className="invalid-feedback">Security code required</div>
                              </div>
                            </div>
                          </div>
                          <div className="modal-footer">
                            <button className="btn btn-secondary" data-bs-target="#info${[i]}" data-bs-whatever="@Tofa7a" data-bs-toggle="modal">
                              Back to Informations
                            </button>
                            <button
                              className="btn-information"
                              data-bs-target="#submit${[i]}"
                              data-bs-whatever="@Tofa7a"
                              data-bs-nameUni="${TripsData[i].name} University"
                              data-bs-toggle="modal"
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="modal fade" id="submit${[i]}" aria-hidden="true" aria-labelledby="submitLabel${[i]}" tabIndex={-1}>
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h1 className="modal-title fs-5" id="submitLabel${[i]}">Modal [i]</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div className="modal-body">
                            <h3></h3>
                          </div>
                        </div>
                        <div className="modal-footer">
                          {/* <button className="btn btn-secondary" data-bs-target="#info${[i]}" data-bs-whatever="@Tofa7a" data-bs-toggle="modal">
                Back to first
              </button>
              <button className="btn-information" data-bs-target="#info" data-bs-whatever="@Tofa7a" data-bs-nameUni="${
                    TripsData[i].name
                  } University" data-bs-toggle="modal">
                Submit
              </button> */}
                        </div>
                      </div>
                    </div>

                  </div>
                  <small className="text-body-secondary">
                    {sound.duration}
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default KhmacenPlayer;
