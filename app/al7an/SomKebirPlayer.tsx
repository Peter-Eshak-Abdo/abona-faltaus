"use client";

const sounds = [
  {
    monasba: "som-kebir",
    name: "الليلويا إي ا ايخون",
    duration: "2:04",
    src: "./al7an/الليلويا إي ا ايخون.mp3",
    hazatSrc: "./al7an/hazat/الصوم الكبير و صوم نينوي_page-0031.jpg",
  },
  {
    monasba: "som-kebir",
    name: "لحن إنثو تي تي شوري",
    duration: "3:06",
    // src: "https://www.dropbox.com/scl/fi/i03y7cndra6lqxcz2mzog/06.mp3?rlkey=ts1l7ps97knknc23e6m40rloq&st=c7yx2pxn&dl=0",
    // src: "https://drive.google.com/file/d/1LAFS_6kNqL100fqwKgfy2_wWKmBGSsOI/view?usp=drive_link",
    // src: "https://cisuezedu-my.sharepoint.com/:u:/g/personal/fciugs118_ci_suez_edu_eg/ER1off32v05Fn7y9P8FUONIBtuAHrFAB-KitY7-zIiIjcg?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=hfRX4X",
    // src: "https://drive.google.com/uc?export=download&id=1LAFS_6kNqL100fqwKgfy2_wWKmBGSsOI"
    src: "./al7an/06 لحن إنثو تي تي شوري الصيامي.mp3",
    hazatSrc: "./al7an/hazat/الصوم الكبير و صوم نينوي_page-0033.jpg",
  },
  {
    monasba: "som-kebir",
    name: "لحن شاري افنوتي ϣⲁⲣⲉ ⲫ_ⲛⲟⲩϯ _ Hymn Share Efnouti",
    duration: "3:45",
    src: "./al7an/لحن شاري افنوتي ϣⲁⲣⲉ ⲫ_ⲛⲟⲩϯ _ Hymn Share Efnouti.mp3",
    hazatSrc: "./al7an/hazat/الصوم الكبير و صوم نينوي_page-0036.jpg",
  },
  {
    monasba: "som-kebir",
    name: "لحن ميغالو",
    duration: "12:18",
    src: "./al7an/لحن ميغالو.mp3",
    // hazatSrc: "./al7an/hazat/الصوم الكبير و صوم نينوي_page-0033.jpg",
  },
  {
    monasba: "som-kebir",
    name: "توزيع أيام صوم نينوى وأيام الصوم الكبير _ Distribution for Weekdays of Lent",
    duration: "14:40",
    src: "./al7an/توزيع أيام صوم نينوى وأيام الصوم الكبير _ Distribution for Weekdays of Lent.mp3",
    hazatSrc: "./al7an/hazat/الصوم الكبير و صوم نينوي_page-0047.jpg",
  },
  {
    monasba: "som-kebir",
    name: "سوماتوس ختام أيام الصوم الكبير _ Somatos Concluding Canon for Weekdays of Lent",
    duration: "2:45",
    src: "./al7an/سوماتوس ختام أيام الصوم الكبير _ Somatos Concluding Canon for Weekdays of Lent.mp3",
    hazatSrc: "./al7an/hazat/الصوم الكبير و صوم نينوي_page-0059.jpg",
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

export default SomKebirPlayer;
