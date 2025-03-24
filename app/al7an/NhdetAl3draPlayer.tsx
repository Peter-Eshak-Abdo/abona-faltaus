"use client";

const sounds = [
  {
    monasba: "nhdet-al3dra",
    name: "لحن سينا اتشو كثيره هي عجايبك",
    duration: "1:57",
    src: "./al7an/لحن سينا اتشو كثيره هي عجايبك.mp3",
  },
  {
    monasba: "nhdet-al3dra",
    name: "لحن_اوموف_اممو",
    duration: "7:40",
    src: "./al7an/لحن_اوموف_اممو.mp3",
  },
  {
    monasba: "nhdet-al3dra",
    name: "لحن_راشي_ني",
    duration: "12:52",
    src: "./al7an/لحن_راشي_ني.mp3",
  },
  {
    monasba: "nhdet-al3dra",
    name: "مديحة_يا_أم_النور_يا_فخر_الأمة",
    duration: "12:17",
    src: "./al7an/مديحة_يا_أم_النور_يا_فخر_الأمة.mp3",
  },
  {
    monasba: "nhdet-al3dra",
    name: "لحن فاي بي إبليمين",
    duration: "4:47",
    src: "./al7an/لحن فاي بي إبليمين.mp3",
  },
];

const NhdetAl3draPlayer: React.FC = () => {
  return (
    <div
      id="sec-nhdet-al3dra"
      className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3"
    >
      {sounds
        .filter((sound) => sound.monasba === "nhdet-al3dra")
        .map((sound, index) => (
          <div className="col" key={`nhdet-al3dra-${index}`}>
            <div
              className="card shadow-sm pt-3 ps-3"
              key={`nhdet-al3dra-${index}`}
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
                نهضة العذراء
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                    >
                      تفاصيل
                    </button>
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

export default NhdetAl3draPlayer;
