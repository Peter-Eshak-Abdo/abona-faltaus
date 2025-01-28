"use client";

// const sounds = [
//   {
//     monasba: "BabaShenodaPlayer",
//     name: "",
//     duration: "44:09",
//     src: "./3zat/babaSenoda/111111.mp3",
//   },
//   {
//     monasba: "BabaShenodaPlayer",
//     name: "",
//     duration: "29:54",
//     src: "./3zat/babaSenoda/videoplayback.mp3",
//   },
//   {
//     monasba: "BabaShenodaPlayer",
//     name: "",
//     duration: "20:50",
//     src: "./3zat/babaSenoda/videoplayback(1).mp3",
//   },
//   {
//     monasba: "BabaShenodaPlayer",
//     name: "اله الضعفاء",
//     duration: "32:22",
//     src: "./3zat/babaSenoda/اله الضعفاء.mp3",
//   },
//   {
//     monasba: "BabaShenodaPlayer",
//     name: "تأمل إجذبني وراءك فنجري",
//     duration: "17:42",
//     src: "./3zat/babaSenoda/تأمل إجذبني وراءك فنجري - البابا شنودة الثالث.mp3",
//   },
//   {
//     monasba: "BabaShenodaPlayer",
//     name: "رحله الروح بعد الموت",
//     duration: "1:00:17",
//     src: "./3zat/babaSenoda/رحله الروح بعد الموت † عظه هامه  للبابا شنوده الثالث † 1991 (192 kbps).mp3",
//   },
//   {
//     monasba: "BabaShenodaPlayer",
//     name: "تأمل دفعت لأسقط",
//     duration: "15:38",
//     src: "./3zat/babaSenoda/تأمل دفعت لأسقط - البابا شنودة الثالث.mp3",
//   },
//   {
//     monasba: "BabaShenodaPlayer",
//     name: "سلم ربنا مشكلتك يحلها",
//     duration: "27:16",
//     src: "./3zat/babaSenoda/سلم ربنا مشكلتك يحلها - عظة مريحة قداسة البابا شنودة الثالث.mp3",
//   },
//   {
//     monasba: "BabaShenodaPlayer",
//     name: "انا سوداء و جميلة ج1",
//     duration: "43:25",
//     src: "./3zat/babaSenoda/عظة قداسة البابا شنودة انا سوداء و جميلة ج1 بالموسيقى.mp3",
//   },
// ];

const BabaShenodaPlayer: React.FC = () => {
  return (
    <div id="sec-BabaShenodaPlayer" className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
      {sounds
        .filter((sound) => sound.monasba === "BabaShenodaPlayer")
        .map((sound, index) => (
          <div className="col" key={`BabaShenodaPlayer-${index}`}>
            <div className="card shadow-sm pt-3 ps-3" key={`BabaShenodaPlayer-${index}`}>
              <div className="d-flex justify-content-center align-items-center">
                <audio controls is="x-audio" id={`BabaShenodaPlayer-audio-${index}`}>
                  <source src={sound.src} type="audio/mpeg" />
                  متصفحك لا يدعم ملفات الصوت.
                </audio>
              </div>
              <div className="card-body text-start">
                <p className="card-text">
                  <span className="fw-bold">البابا: </span>شنودة الثالث
                </p>
                <p className="card-text">
                  <span className="fw-bold">اسم الوعظة: </span>
                  {sound.name}
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

export default BabaShenodaPlayer;






















