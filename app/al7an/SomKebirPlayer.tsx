"use client";
// import React, { useEffect } from "react";

interface Sound {
  monasba: string;
  name: string;
  duration: string;
  src: string;
}

const sounds: Sound[] = [
  {
    monasba: "som-kebir",
    name: "لحن إنثو تي تي شوري",
    duration: "3:06",
    // src: "https://www.dropbox.com/scl/fi/i03y7cndra6lqxcz2mzog/06.mp3?rlkey=ts1l7ps97knknc23e6m40rloq&st=c7yx2pxn&dl=0",
    // src: "https://drive.google.com/file/d/1LAFS_6kNqL100fqwKgfy2_wWKmBGSsOI/view?usp=drive_link",

    src: "./al7an/06 لحن إنثو تي تي شوري الصيامي.mp3",
  },
  {
    monasba: "keahk",
    name: "التوزيع الكيهكى",
    duration: "1:40",
    src: "./al7an/التوزيع الكيهكى.mp3",
  },
  {
    monasba: "som-kebir",
    name: "الليلويا إي ا ايخون",
    duration: "2:04",
    src: "./al7an/الليلويا إي ا ايخون.mp3",
  },
  {
    monasba: "keahk",
    name: "مجمع التسبحة",
    duration: "20:07",
    src: "./al7an/المجمع_التسبحة.mp3",
  },
  {
    monasba: "keahk",
    name: "الهوس الأول قبطي",
    duration: "7:06",
    src: "./al7an/الهوس الأول قبطي.mp3",
  },
  {
    monasba: "keahk",
    name: "الهوس الأول عربي",
    duration: "3:33",
    src: "./al7an/الهوس_الاول-عربي.mp3",
  },
  {
    monasba: "keahk",
    name: "الهوس الثاني قبطي",
    duration: "4:33",
    src: "./al7an/الهوس_الثاني-قبطي.mp3",
  },
  {
    monasba: "keahk",
    name: "الهوس الرابع قبطي",
    duration: "7:00",
    src: "./al7an/الهوس_الرابع-قبطي.mp3",
  },
  {
    monasba: "som-kebir",
    name: "توزيع الصوم الكبير",
    duration: "14:40",
    src: "./al7an/توزيع الصوم الكبير .mp3",
  },
  {
    monasba: "keahk",
    name: "ثيؤطوكية_الأحد_قبطي",
    duration: "6:57",
    src: "./al7an/ثيؤطوكية_الأحد_قبطي.mp3",
  },
];

const SomKebirPlayer: React.FC = () => {
  // useEffect(() => {
  //   // Moved the alert inside useEffect to avoid running it on every render.
  //   alert("Hello!");
  // }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div id="sec-som-kebir" className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
      {sounds
        .filter((sound) => sound.monasba === "som-kebir")
        .map((sound, index) => (
          <div className="col" key={`som-kebir-${index}`}>
            {" "}
            {/* Added key for React */}
            <div className="card shadow-sm pt-3 ps-3" key={`som-kebir-${index}`}>
              <div className="d-flex justify-content-center align-items-center">
                <audio controls>
                  <source src={sound.src} type="audio/mpeg" />
                  متصفحك لا يدعم ملفات الصوت.
                </audio>
              </div>
              <div className="card-body">
                <p className="card-text">
                  <span className="fw-bold">اسم اللحن: </span>
                  {sound.name}
                </p>
                <p className="card-text">
                  <span className="fw-bold">المناسبة التي يقال فيها: </span>تسبحة كيهك او تسبحة نصف الليل
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

export default SomKebirPlayer;


