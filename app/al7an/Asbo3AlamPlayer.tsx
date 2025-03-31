"use client";

const sounds = [
  {
    monasba: "asbo3-alam",
    name: "لحن افلوجيمينوس",
    duration: "6:33",
    src: "./al7an/لحن افلوجيمينوس.mp3",
    hazatSrc: "./al7an/hazat/سبت لعازر و احد الشعانين_page-0119.png",
  },
  {
    monasba: "asbo3-alam",
    name: "لحن بيك إثرونوس",
    duration: "18:23",
    src: "./al7an/لحن بيك إثرونوس.mp3",
    hazatSrc: "./al7an/hazat/البصخة_page-0084.png",
  },
  {
    monasba: "asbo3-alam",
    name: "لحن_اومونوجنيس",
    duration: "11:12",
    src: "./al7an/لحن_اومونوجنيس.mp3",
    hazatSrc: "./al7an/hazat/البصخة_page-0067.png",
  },
  {
    monasba: "asbo3-alam",
    name: "لحن_مقدمه_العظه_اوكاتي",
    duration: "11:08",
    src: "./al7an/لحن_مقدمه_العظه_اوكاتي.mp3",
    hazatSrc: "./al7an/hazat/البصخة_page-0014.png",
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
                <img
                  src={sound.hazatSrc}
                  alt={sound.name}
                  className="img-thumbnail"
                />

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

export default Asbo3AlamPlayer;
