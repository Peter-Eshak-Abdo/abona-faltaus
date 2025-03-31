"use client";

const sounds = [
  {
    monasba: "snawi",
    name: "لحن بينشتي الصغير",
    duration: "4:31",
    src: "./al7an/لحن بينشتي الصغير.mp3",
    hazatSrc: "./al7an/hazat/الطقس السنوي_page-0207.jpg",
  },
  {
    monasba: "snawi",
    name: "لحن_البركة_(تين_أوأوشت)",
    duration: "2:03",
    src: "./al7an/لحن_البركة_(تين_أوأوشت).mp3",
    hazatSrc: "./al7an/hazat/الطقس السنوي_page-0066.jpg",
  },
];

const SnawiPlayer: React.FC = () => {
  return (
    <div
      id="sec-snawi"
      className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3"
    >
      {sounds
        .filter((sound) => sound.monasba === "snawi")
        .map((sound, index) => (
          <div className="col" key={`snawi-${index}`}>
            <div className="card shadow-sm pt-3 ps-3" key={`snawi-${index}`}>
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
                  سنوي
                </p>
                <img src={sound.hazatSrc} alt={sound.name} className="img-thumbnail" />
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

export default SnawiPlayer;
