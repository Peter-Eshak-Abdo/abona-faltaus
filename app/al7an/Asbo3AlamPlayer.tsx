"use client";

import Image from "next/image";

const sounds = [
  {
    monasba: "asbo3-alam",
    name: "لحن افلوجيمينوس",
    duration: "6:33",
    src: "./al7an/لحن افلوجيمينوس.mp3",
    hazatSrc: "/al7an/hazat/سبت لعازر و احد الشعانين_page-0119.png",
  },
  {
    monasba: "asbo3-alam",
    name: "لحن بيك إثرونوس",
    duration: "18:23",
    src: "./al7an/لحن بيك إثرونوس.mp3",
    hazatSrc: "/al7an/hazat/البصخة_page-0084.png",
  },
  {
    monasba: "asbo3-alam",
    name: "لحن_اومونوجنيس",
    duration: "11:12",
    src: "./al7an/لحن_اومونوجنيس.mp3",
    hazatSrc: "/al7an/hazat/البصخة_page-0067.png",
  },
  {
    monasba: "asbo3-alam",
    name: "لحن_مقدمه_العظه_اوكاتي",
    duration: "11:08",
    src: "./al7an/لحن_مقدمه_العظه_اوكاتي.mp3",
    hazatSrc: "/al7an/hazat/البصخة_page-0014.png",
  },
];

const Asbo3AlamPlayer: React.FC = () => {
  return (
    <div
      id="sec-asbo3-alam"
      className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3"
    >
      {sounds
        .filter((sound) => sound.monasba === "asbo3-alam")
        .map((sound, index) => (
          <div className="col" key={`asbo3-alam-${index}`}>
            <div
              className="card shadow-sm pt-3 ps-3"
              key={`asbo3-alam-${index}`}
            >
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
                  اسبوع الآلام
                </p>
                {/* <img
                  src={sound.hazatSrc}
                  alt={sound.name}
                  className="img-thumbnail"
                /> */}
                <a href={sound.hazatSrc} target="_blank" rel="noopener noreferrer">
                    <Image src={sound.hazatSrc} className="card-img-top" alt={sound.name} width={200} height={450}/>
                </a>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      data-bs-toggle="modal" data-bs-target={"#exampleModel" + index} data-bs-whatever="@Tofa7a"
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
                            <Image src={sound.hazatSrc} className="card-img-top" alt={sound.name} width={200} height={350}/>
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
                            <button className="btn btn-information" data-bs-target="#payment${[i]}" data-bs-toggle="modal">Open Payment</button>
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

export default Asbo3AlamPlayer;
