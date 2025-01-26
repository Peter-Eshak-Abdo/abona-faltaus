"use client";
// import React, { useEffect } from "react";
// import Howl from "react-howler";
// interface Sound {
//   monasba: string;
//   name: string;
//   duration: string;
//   src: string;
// }

// const sounds: Sound[] = [
const sounds = [
  {
    monasba: "som-kebir",
    name: "لحن إنثو تي تي شوري",
    duration: "3:06",
    // src: "https://www.dropbox.com/scl/fi/i03y7cndra6lqxcz2mzog/06.mp3?rlkey=ts1l7ps97knknc23e6m40rloq&st=c7yx2pxn&dl=0",
    // src: "https://drive.google.com/file/d/1LAFS_6kNqL100fqwKgfy2_wWKmBGSsOI/view?usp=drive_link",
    // src: "https://cisuezedu-my.sharepoint.com/:u:/g/personal/fciugs118_ci_suez_edu_eg/ER1off32v05Fn7y9P8FUONIBtuAHrFAB-KitY7-zIiIjcg?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=hfRX4X",

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

  //   const soun = new Howl({
  //   src: [sounds], // Path to the audio file in the `public` folder
  //   preload: true, // Load audio in the background
  // });
  // const [soundsss, setSound] = useState<Howl | null>(null);
  // useEffect(() => {
  //   const newSound = new Howl({
  //     src: source,
  //     preload: true,
  //   });
  //   setSound(newSound);
  //   return () => {
  //     if (newSound)
  //       newSound.unload();

  //   };
  // }, [source]);

  // const handlePlay = () => {
  //   if (soundsss)
  //     soundsss.play();

  // };

  // const handlePause = () => {
  //   if (soundsss)
  //     soundsss.pause();

  // };
  return (
    <div id="sec-som-kebir" className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
      {sounds
        .filter((sound) => sound.monasba === "som-kebir")
        .map((sound, index) => (
          <div className="col" key={`som-kebir-${index}`}>
            <div className="card shadow-sm pt-3 ps-3" key={`som-kebir-${index}`}>
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
                  <span className="fw-bold align-content-end">المناسبة التي يقال فيها: </span>الصوم الكبير وصوم نينوي
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




