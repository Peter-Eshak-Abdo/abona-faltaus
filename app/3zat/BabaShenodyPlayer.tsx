"use client";

const sounds = [
  {
    monasba: "babaShenody",
    name: "مش عارف اسمية ايه",
    duration: "44:09",
    src: "./3zat/babaShenody/111111.MP3",
  },
  {
    monasba: "babaShenody",
    name: "مش عارف اسمية ايه",
    duration: "29:54",
    src: "./3zat/babaShenody/videoplayback.mp4",
  },
  {
    monasba: "babaShenody",
    name: "مش عارف اسمية ايه",
    duration: "20:50",
    src: "./3zat/babaShenody/videoplayback(1).mp4",
  },
  {
    monasba: "babaShenody",
    name: "اله الضعفاء",
    duration: "32:22",
    src: "./3zat/babaShenody/اله الضعفاء.mp4",
  },
  {
    monasba: "babaShenody",
    name: "تأمل إجذبني وراءك فنجري",
    duration: "17:42",
    src: "./3zat/babaShenody/تأمل إجذبني وراءك فنجري - البابا شنودة الثالث.mp4",
  },
  {
    monasba: "babaShenody",
    name: "تأمل دفعت لأسقط",
    duration: "15:38",
    src: "./3zat/babaShenody/تأمل دفعت لأسقط - البابا شنودة الثالث.mp4",
  },
  {
    monasba: "babaShenody",
    name: "رحله الروح بعد الموت",
    duration: "1:00:07",
    src: "./3zat/babaShenodyرحله الروح بعد الموت † عظه هامه  للبابا شنوده الثالث † 1991 (192 kbps).mp3",
  },
  {
    monasba: "babaShenody",
    name: "انا سوداء و جميلة ج1",
    duration: "43:25",
    src: "./3zat/babaShenody/عظة قداسة البابا شنودة انا سوداء و جميلة ج1 بالموسيقى.mp4",
  },
];

const BabaShenodyPlayer: React.FC = () => {
  return (
    <div
      id="sec-babaShenody"
      className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3"
    >
      {sounds
        .filter((sound) => sound.monasba === "babaShenody")
        .map((sound, index) => (
          <div className="col" key={`babaShenody-${index}`}>
            <div
              className="card shadow-sm pt-3 ps-3"
              key={`babaShenody-${index}`}
            >
              <div className="d-flex justify-content-center align-items-center">
                <audio
                  controls
                  is="x-audio"
                  id={`babaShenody-audio-${index}`}
                >
                  <source src={sound.src} type="audio/mpeg" />
                  متصفحك لا يدعم ملفات الصوت.
                </audio>
              </div>
              <div className="card-body text-start">
                <p className="card-text">
                  <span className="fw-bold">ابونا: </span>البابا شنودة الثالث
                </p>
                <p className="card-text">
                  <span className="fw-bold">اسم الوعظة: </span>
                  {sound.name}
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

export default BabaShenodyPlayer;
