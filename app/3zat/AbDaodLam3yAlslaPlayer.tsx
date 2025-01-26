"use client";

const sounds = [
  {
    monasba: "abDaodLam3y-alsla",
    name: "1. سنة الصلاة",
    duration: "32:23",
    src: "./3zat/abDaodLam3y/alsla/01- سنة الصلاة.mp3",
  },
  {
    monasba: "abDaodLam3y-alsla",
    name: "2. تعقلوا واصحوا للصلوات",
    duration: "49:09",
    src: "./3zat/abDaodLam3y/alsla/02- تعقلوا واصحوا للصلوات.mp3",
  },
  {
    monasba: "abDaodLam3y-alsla",
    name: "3. الثقة فى الصلاة",
    duration: "47:06",
    src: "./3zat/abDaodLam3y/alsla/03- الثقة فى الصلاة.mp3",
  },
  {
    monasba: "abDaodLam3y-altoba",
    name: "1. اقوال عن التوبة",
    duration: "14:11",
    src: "./3zat/abDaodLam3y/altoba/أقوال عن التوبة (1) - لأبونا داود لمعي.mp3",
  },
  {
    monasba: "abDaodLam3y-altoba",
    name: "2. اقوال عن التوبة",
    duration: "11:03",
    src: "./3zat/abDaodLam3y/altoba/أقوال عن التوبة (2) - لأبونا داود لمعي.mp3",
  },
];

const AbDaodLam3yAlslaPlayer: React.FC = () => {
  return (
    <div id="sec-abDaodLam3y-alsla" className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
      {sounds
        .filter((sound) => sound.monasba === "abDaodLam3y-alsla")
        .map((sound, index) => (
          <div className="col" key={`abDaodLam3y-alsla-${index}`}>
            <div className="card shadow-sm pt-3 ps-3" key={`abDaodLam3y-alsla-${index}`}>
              <div className="d-flex justify-content-center align-items-center">
                <audio controls is="x-audio" id={`abDaodLam3y-alsla-audio-${index}`}>
                  <source src={sound.src} type="audio/mpeg" />
                  متصفحك لا يدعم ملفات الصوت.
                </audio>
              </div>
              <div className="card-body text-start">
                <p className="card-text">
                  <span className="fw-bold">ابونا: </span>داؤد لمعي
                </p>
                <p className="card-text">
                  <span className="fw-bold">اسم الوعظة: </span>
                  {sound.name}
                </p>
                <p className="card-text">
                  <span className="fw-bold">تتحدث عن: </span>الصلاة
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="btn-group">
                    <button type="button" className="btn btn-sm btn-outline-secondary">
                      تفاصيل
                    </button>
                  </div>
                  <small className="text-body-secondary">{sound.duration}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default AbDaodLam3yAlslaPlayer;

