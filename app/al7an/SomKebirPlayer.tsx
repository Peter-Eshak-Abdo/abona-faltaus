"use client";
import Image from "next/image";

const sounds = [
  {
    id: "1",
    monasba: "som-kebir",
    name: "الليلويا إي ا ايخون",
    duration: "2:04",
    src: "./al7an/الليلويا إي ا ايخون.mp3",
    hazatSrc: "/al7an/hazat/الصوم الكبير و صوم نينوي_page-0031.jpg",
  },
  {
    id: "2",
    monasba: "som-kebir",
    name: "لحن إنثو تي تي شوري",
    duration: "3:06",
    // src: "https://www.dropbox.com/scl/fi/i03y7cndra6lqxcz2mzog/06.mp3?rlkey=ts1l7ps97knknc23e6m40rloq&st=c7yx2pxn&dl=0",
    // src: "https://drive.google.com/file/d/1LAFS_6kNqL100fqwKgfy2_wWKmBGSsOI/view?usp=drive_link",
    // src: "https://cisuezedu-my.sharepoint.com/:u:/g/personal/fciugs118_ci_suez_edu_eg/ER1off32v05Fn7y9P8FUONIBtuAHrFAB-KitY7-zIiIjcg?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=hfRX4X",
    // src: "https://drive.google.com/uc?export=download&id=1LAFS_6kNqL100fqwKgfy2_wWKmBGSsOI"
    // src: "https://docs.google.com/uc?export=download&id=1LAFS_6kNqL100fqwKgfy2_wWKmBGSsOI",

    src: "./al7an/06 لحن إنثو تي تي شوري الصيامي.mp3",
    hazatSrc: "/al7an/hazat/الصوم الكبير و صوم نينوي_page-0033.jpg",
  },
  {
    id: "3",
    monasba: "som-kebir",
    name: "لحن شاري افنوتي ϣⲁⲣⲉ ⲫ_ⲛⲟⲩϯ _ Hymn Share Efnouti",
    duration: "3:45",
    src: "./al7an/لحن شاري افنوتي ϣⲁⲣⲉ ⲫ_ⲛⲟⲩϯ _ Hymn Share Efnouti.mp3",
    hazatSrc: "/al7an/hazat/الصوم الكبير و صوم نينوي_page-0036.jpg",
  },
  {
    id: "4",
    monasba: "som-kebir",
    name: "لحن ميغالو",
    duration: "12:18",
    src: "./al7an/لحن ميغالو.mp3",
    hazatSrc: ""
    // hazatSrc: "./al7an/hazat/الصوم الكبير و صوم نينوي_page-0033.jpg",
  },
  {
    id: "5",
    monasba: "som-kebir",
    name: "توزيع أيام صوم نينوى وأيام الصوم الكبير _ Distribution for Weekdays of Lent",
    duration: "14:40",
    src: "./al7an/توزيع أيام صوم نينوى وأيام الصوم الكبير _ Distribution for Weekdays of Lent.mp3",
    hazatSrc: "/al7an/hazat/الصوم الكبير و صوم نينوي_page-0047.jpg",
  },
  {
    id: "6",
    monasba: "som-kebir",
    name: "سوماتوس ختام أيام الصوم الكبير _ Somatos Concluding Canon for Weekdays of Lent",
    duration: "2:45",
    src: "./al7an/سوماتوس ختام أيام الصوم الكبير _ Somatos Concluding Canon for Weekdays of Lent.mp3",
    hazatSrc: "/al7an/hazat/الصوم الكبير و صوم نينوي_page-0059.jpg",
  },
  // {
    //   monasba: "som-kebir",
    //   name: "لحن ايطاف ايه ني اسخاي",
    //   duration: "6:11",
    //   src: "./al7an/لحن ايطاف ايه ني اسخاي.mp3",
  //   hazatSrc: "./al7an/hazat/الصوم الكبير و صوم نينوي_page-0033.jpg",
  // },
  // {
  //   monasba: "som-kebir",
  //   name: "لحن فاي إيطاف إينف",
  //   duration: "6:11",
  //   src: "./al7an/لحن فاي إيطاف إينف.mp3",
  //   hazatSrc: "./al7an/hazat/الصوم الكبير و صوم نينوي_page-0033.jpg",
  // },
];

const SomKebirPlayer: React.FC = () => {
  return (
    <div
      id="sec-som-kebir"
      className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3"
    >
      {sounds
        .filter((sound) => sound.monasba === "som-kebir")
        .map((sound, index) => (
          <div className="col" key={`som-kebir-${index}`}>
            <div
              className="card shadow-sm pt-3 ps-3"
              key={`som-kebir-${index}`}
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
                  الصوم الكبير وصوم نينوي
                </p>
                {/* {sound.hazatSrc == ""? <p>مفيش صورة لللحن ده</p>: <img
                  src={sound.hazatSrc}
                  alt={sound.name}
                  className="img-thumbnail"
                />} */}

                <div className="d-flex justify-content-between align-items-center">
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      data-bs-toggle="modal" data-bs-target={"#exampleModel"+index} data-bs-whatever="@Tofa7a"
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
                            <Image src={sound.hazatSrc} className="card-img-top" alt={sound.name} width={300} height={450} />
                            {/* {sound.hazatSrc1 == ""? <p>مفيش صورة لللحن ده</p>: <img
                              src={sound.hazatSrc1}
                              alt={sound.name}
                              className="img-thumbnail"/>} */}
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

export default SomKebirPlayer;
