"use client";

const sounds = [
  {
    monasba: "khmacen",
    name: "لحن السبع طرائق",
    duration: "26:44",
    src: "./al7an/لحن السبع طرائق.mp3",
  },
  {
    monasba: "khmacen",
    name: "لحن ني صافيف تيرو",
    duration: "5:42",
    src: "./al7an/لحن ني صافيف تيرو.mp3",
  },

  {
    monasba: "khmacen",
    name: "لحن_اوكيريوس_ميتاسو",
    duration: "4:26",
    src: "./al7an/لحن_اوكيريوس_ميتاسو.mp3",
  },
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

export default KhmacenPlayer;
