"use client";

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
    name: "توزيع أيام صوم نينوى وأيام الصوم الكبير _ Distribution for Weekdays of Lent",
    duration: "14:40",
    src: "./al7an/توزيع أيام صوم نينوى وأيام الصوم الكبير _ Distribution for Weekdays of Lent.mp3",
  },
  {
    monasba: "keahk",
    name: "ثيؤطوكية_الأحد_شاشف_إنسوب_إمينى",
    duration: "6:57",
    src: "./al7an/ثيؤطوكية_الأحد_شاشف_إنسوب_إمينى.mp3",
  },
  // ----------------------------------------------------------------------------------------------
  {
    monasba: "som-kebir",
    name: "الليلويا إي ا ايخون لأيام صوم نينوى والصوم الكبير _ Alleluia Ei E Ei Ekhon",
    duration: "2:04",
    src: "./al7an/الليلويا إي ا ايخون لأيام صوم نينوى والصوم الكبير _ Alleluia Ei E Ei Ekhon.mp3",
  },
  // {
  //   monasba: "keahk",
  //   name: "ترنيمة_أنا_أول_كلامي_أصيح_السلام",
  //   duration: "10:10",
  //   src: "./al7an/ترنيمة_أنا_أول_كلامي_أصيح_السلام.mp3",
  // },
  {
    monasba: "keahk",
    name: "ثيؤطوكية_الاربعاء_كل_الطغمات_السمائية",
    duration: "7:57",
    src: "./al7an/ثيؤطوكية_الاربعاء_كل_الطغمات_السمائية.mp3",
  },
  {
    monasba: "keahk",
    name: "ذكصولوجية شهر كيهك_كى غار",
    duration: "4:18",
    src: "./al7an/ذكصولوجية شهر كيهك_كى غار.mp3",
  },
  {
    monasba: "som-kebir",
    name: "سوماتوس ختام أيام الصوم الكبير _ Somatos Concluding Canon for Weekdays of Lent",
    duration: "2:45",
    src: "./al7an/سوماتوس ختام أيام الصوم الكبير _ Somatos Concluding Canon for Weekdays of Lent.mp3",
  },
  {
    monasba: "asbo3-alam",
    name: "لحن افلوجيمينوس",
    duration: "6:33",
    src: "./al7an/لحن افلوجيمينوس.mp3",
  },
  {
    monasba: "keahk",
    name: "لحن السبع طرائق",
    duration: "26:44",
    src: "./al7an/لحن السبع طرائق.mp3",
  },
  {
    monasba: "som-kebir",
    name: "لحن ايطاف ايه ني اسخاي",
    duration: "6:11",
    src: "./al7an/لحن ايطاف ايه ني اسخاي.mp3",
  },
  {
    monasba: "asbo3-alam",
    name: "لحن بيك إثرونوس",
    duration: "18:23",
    src: "./al7an/لحن بيك إثرونوس.mp3",
  },
  {
    monasba: "snawi",
    name: "لحن بينشتي الصغير",
    duration: "4:31",
    src: "./al7anلحن بينشتي الصغير.mp3",
  },
  {
    monasba: "keahk",
    name: "لحن تي جاليلي اي",
    duration: "11:42",
    src: "./al7an/لحن تي جاليلي اي.mp3",
  },
  {
    monasba: "nhdet-al3dra",
    name: "لحن سينا اتشو كثيره هي عجايبك",
    duration: "1:57",
    src: "./al7an/لحن سينا اتشو كثيره هي عجايبك.mp3",
  },
  {
    monasba: "som-kebir",
    name: "لحن شاري افنوتي ϣⲁⲣⲉ ⲫ_ⲛⲟⲩϯ _ Hymn Share Efnouti",
    duration: "3:45",
    src: "./al7an/لحن شاري افنوتي ϣⲁⲣⲉ ⲫ_ⲛⲟⲩϯ _ Hymn Share Efnouti.mp3",
  },
  {
    monasba: "som-kebir",
    name: "لحن فاي إيطاف إينف",
    duration: "6:11",
    src: "./al7an/لحن فاي إيطاف إينف.mp3",
  },
  {
    monasba: "nhdet-al3dra",
    name: "لحن فاي بي إبليمين",
    duration: "4:47",
    src: "./al7an/لحن فاي بي إبليمين.mp3",
  },
  {
    monasba: "keahk",
    name: "لحن ميغالو",
    duration: "12:18",
    src: "./al7an/لحن ميغالو.mp3",
  },
  {
    monasba: "keahk",
    name: "لحن ني صافيف تيرو",
    duration: "5:42",
    src: "./al7an/لحن ني صافيف تيرو.mp3",
  },
  {
    monasba: "keahk",
    name: "لحن هوس إيروف (الهوس الثالث) - الم_علم جاد لويس",
    duration: "7:55",
    src: "./al7an/لحن هوس إيروف (الهوس الثالث) - الم_علم جاد لويس.mp3",
  },
  {
    monasba: "keahk",
    name: "لحن_اريبصالين",
    duration: "7:55",
    src: "./al7an/لحن_اريبصالين.mp3",
  },
  {
    monasba: "snawi",
    name: "لحن_البركة_(تين_أوأوشت)",
    duration: "2:03",
    src: "./al7an/لحن_البركة_(تين_أوأوشت).mp3",
  },
  {
    monasba: "khmacen",
    name: "لحن_اوكيريوس_ميتاسو",
    duration: "4:26",
    src: "./al7an/لحن_اوكيريوس_ميتاسو.mp3",
  },
  {
    monasba: "nhdet-al3dra",
    name: "لحن_اوموف_اممو",
    duration: "7:40",
    src: "./al7an/لحن_اوموف_اممو.mp3",
  },
  {
    monasba: "asbo3-alam",
    name: "لحن_اومونوجنيس",
    duration: "11:12",
    src: "./al7an/لحن_اومونوجنيس.mp3",
  },
  {
    monasba: "keahk",
    name: "لحن_تين_اويه_أنسوك",
    duration: "7:02",
    src: "./al7an/لحن_تين_اويه_أنسوك.mp3",
  },
  {
    monasba: "keahk",
    name: "لحن_تين_ثينو_الكبير",
    duration: "11:18",
    src: "./al7an/لحن_تين_ثينو_الكبير.mp3",
  },
  {
    monasba: "keahk",
    name: "لحن_تينين",
    duration: "7:25",
    src: "./al7an/لحن_تينين.mp3",
  },
  {
    monasba: "nhdet-al3dra",
    name: "لحن_راشي_ني",
    duration: "12:52",
    src: "./al7an/لحن_راشي_ني.mp3",
  },
  {
    monasba: "keahk",
    name: "لحن_سيموتى",
    duration: "7:45",
    src: "./al7an/لحن_سيموتى.mp3",
  },
  {
    monasba: "keahk",
    name: "لحن_شيري_نيه_ماريا",
    duration: "6:50",
    src: "./al7an/لحن_شيري_نيه_ماريا.mp3",
  },
  {
    monasba: "asbo3-alam",
    name: "لحن_مقدمه_العظه_اوكاتي",
    duration: "11:08",
    src: "./al7an/لحن_مقدمه_العظه_اوكاتي.mp3",
  },
  {
    monasba: "keahk",
    name: "لحن(الهوس_الثالث)آسمو_ابشويس",
    duration: "20:35",
    src: "./al7an/لحن(الهوس_الثالث)آسمو_ابشويس.mp3",
  },
  {
    monasba: "nhdet-al3dra",
    name: "مديحة_يا_أم_النور_يا_فخر_الأمة",
    duration: "12:17",
    src: "./al7an/مديحة_يا_أم_النور_يا_فخر_الأمة.mp3",
  },
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
