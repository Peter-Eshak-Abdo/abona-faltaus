"use client";

const sounds = [
  {
    monasba: "melad",
    name: "في مذود البقر",
    duration: "2:15",
    src: "./tranim/05-في مذود البقر.mp3",
  },
  {
    monasba: "melad",
    name: "بابا نويل",
    duration: "8:13",
    src: "./tranim/بابا نويل.mp3",
  },
  {
    monasba: "kyama",
    name: "قام حقاً",
    duration: "4:21",
    src: "./tranim/ترنيمة _ قـــام حــقـــاً _ .. ( 160kbps ).mp3",
  },
  {
    monasba: "kyama",
    name: "انا ديك",
    duration: "3:46",
    src: "./tranim/ترنيمة أنا ديك ( 160kbps ).mp3",
  },
  {
    monasba: "melad",
    name: "دقي يا اجراس",
    duration: "2:46",
    src: "./tranim/دقي يا اجراس .mp3",
  },
  {
    monasba: "kyama",
    name: "عند شق الفجر باكر",
    duration: "3:38",
    src: "./tranim/عند شق الفجر باكر   .mp3",
  },
  {
    monasba: "melad",
    name: "عيد ميلادك يا يسوع",
    duration: "6:55",
    src: "./tranim/عيد ميلادك يا يسوع.mp3",
  },
  {
    monasba: "kyama",
    name: "في فجر يوم الأحد",
    duration: "3:05",
    src: "./tranim/فى فجر يوم الأحد - قلب داود ( 160kbps ).mp3",
  },
  {
    monasba: "melad",
    name: "في كل عيد ميلاد",
    duration: "4:45",
    src: "./tranim/في كل عيد ميلاد.mp3",
  },
  {
    monasba: "kyama",
    name: "هذا هو اليو  الذي صنعة الرب",
    duration: "2:32",
    src: "./tranim/فيروز هذا هو اليوم الذي صنعه الرب ( 160kbps ).mp3",
  },
];

const KyamaPlayer: React.FC = () => {
  return (
    <div id="sec-kyama" className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
      {sounds
        .filter((sound) => sound.monasba === "kyama")
        .map((sound, index) => (
          <div className="col" key={`kyama-${index}`}>
            <div className="card shadow-sm pt-3 ps-3" key={`kyama-${index}`}>
              <div className="d-flex justify-content-center align-items-center">
                <audio controls is="x-audio" id={`kyama-audio-${index}`}>
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
                  <span className="fw-bold">المناسبة التي يقال فيها: </span>عيد القيامة
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

export default KyamaPlayer;

