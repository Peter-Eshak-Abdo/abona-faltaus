// import React, { useEffect } from "react";
// import Howl from "react-howler";
// interface Sound {
//   monasba: string;
//   name: string;
//   duration: string;
//   src: string;
// }

// const sounds: Sound[] = [

// const sounds = [
//   {
//     monasba: "som-kebir",
//     name: "لحن إنثو تي تي شوري",
//     duration: "3:06",
//     // src: "https://www.dropbox.com/scl/fi/i03y7cndra6lqxcz2mzog/06.mp3?rlkey=ts1l7ps97knknc23e6m40rloq&st=c7yx2pxn&dl=0",
//     // src: "https://drive.google.com/file/d/1LAFS_6kNqL100fqwKgfy2_wWKmBGSsOI/view?usp=drive_link",
//     src: "../../../src/assets/media/sound/al7an/06 لحن إنثو تي تي شوري الصيامي.mp3",
//   },
//   {
//     monasba: "keahk",
//     name: "التوزيع الكيهكى",
//     duration: "1:40",
//     src: "../../../src/assets/media/sound/al7an/التوزيع الكيهكى.mp3",
//   },
//   {
//     monasba: "som-kebir",
//     name: "الليلويا إي ا ايخون",
//     duration: "2:04",
//     src: "../../../src/assets/media/sound/al7an/الليلويا إي ا ايخون.mp3",
//   },
//   {
//     monasba: "keahk",
//     name: "مجمع التسبحة",
//     duration: "20:07",
//     src: "../../../src/assets/media/sound/al7an/المجمع_التسبحة.mp3",
//   },
//   {
//     monasba: "keahk",
//     name: "الهوس الأول قبطي",
//     duration: "7:06",
//     src: "../../../src/assets/media/sound/al7an/الهوس الأول قبطي.mp3",
//   },
//   {
//     monasba: "keahk",
//     name: "الهوس الأول عربي",
//     duration: "3:33",
//     // src: "https://soundcloud.com/abanoub-fana/aghapy-tv?si=5173a99c46aa4a2abc8e31eab1ad0571&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
//     src: "../../../src/assets/media/sound/al7an/الهوس_الاول-عربي.mp3",
//   },
//   {
//     monasba: "keahk",
//     name: "الهوس الثاني قبطي",
//     duration: "4:33",
//     src: "../../../src/assets/media/sound/al7an/الهوس_الثاني-قبطي.mp3",
//   },
//   {
//     monasba: "keahk",
//     name: "الهوس الرابع قبطي",
//     duration: "7:00",
//     src: "../../../src/assets/media/sound/al7an/الهوس_الرابع-قبطي.mp3",
//   },
//   {
//     monasba: "som-kebir",
//     name: "توزيع الصوم الكبير",
//     duration: "14:40",
//     src: "../../../src/assets/media/sound/al7an/توزيع الصوم الكبير .mp3",
//   },
//   {
//     monasba: "som-kebir",
//     name: "ثيؤطوكية_الأحد_قبطي",
//     duration: "6:57",
//     src: "../../../src/assets/media/sound/al7an/ثيؤطوكية_الأحد_قبطي.mp3",
//   },
// ];
// alert("Hello!");
// const sectionSomKebir = document.getElementById("sec-som-kebir");
// const sectionKeahk = document.getElementById("sec-keahk");

//   for (let i = 0; i < sounds.length; i++) {
//     const col = document.createElement("div");
//     const card = document.createElement("div");
//     col.classList.add("col");
//     card.classList.add("card", "shadow-sm", "pt-3", "ps-3");

//     if (sounds[i].monasba == "som-kebir") {
//       card.innerHTML = `
//         <div class="d-flex justify-content-center align-items-center">
//           <audio controls id="la7n-som-kebir${[i]}">
//             <source src="${sounds[i].src}" type="audio/mpeg">
//             متصفحك لا يدعم ملفات الصوت.
//           </audio>
//         </div>
//         <div class="card-body">
//           <p class="card-text"><span class="fw-bold">اسم اللحن: </span>${sounds[i].name}</p>
//           <p class="card-text"><span class="fw-bold">المناسبة التي يقال فيها: </span>صوم يونان والصوم الكبير</p>
//           <div class="d-flex justify-content-between align-items-center">
//             <div class="btn-group">
//               <button type="button" class="btn btn-sm btn-outline-secondary">تفاصيل</button>
//             </div>
//             <small class="text-body-secondary">${sounds[i].duration}</small>
//             <!--<small class="text-body-secondary" id="la7n-som-kebir-duration${[i]}"></small>-->
//           </div>
//         </div>
//       `;

//     // let la7nSomKebir0 = document.getElementById("la7n-som-kebir0");
//       // console.log(la7nSomKebir0.duration);
//       //--------------------------------------------------------------
//       // la7nSomKebir0.addEventListener("DOMContentLoaded", () => {
//       //   const duration = la7nSomKebir0.duration; // Now it should be safe
//       //   console.log("Duration:", duration);
//       //   // ... rest of your code that uses the duration
//       // });

//       // la7nSomKebir0.addEventListener("error", (error) => {
//       //   console.error("Error loading audio:", error);
//       // });
//       //-------------------------------------------------------------------------
//       // async function loadSound() {
//       //   try {

//       //     // const response = await fetch(sounds[i].src);
//       //       const response0 = await fetch(sounds[0].src);
//       //       const response1 = await fetch(sounds[1].src);
//       //       const response2 = await fetch(sounds[2].src);
//       //       const response3 = await fetch(sounds[3].src);
//       //       const response4 = await fetch(sounds[4].src);
//       //       const response5 = await fetch(sounds[5].src);
//       //       const la7nSomKebir0 = new Audio(URL.createObjectURL(await response0.blob()));
//       //       const la7nSomKebir1 = new Audio(URL.createObjectURL(await response1.blob()));
//       //       const la7nSomKebir2 = new Audio(URL.createObjectURL(await response2.blob()));
//       //       const la7nSomKebir3 = new Audio(URL.createObjectURL(await response3.blob()));
//       //       const la7nSomKebir4 = new Audio(URL.createObjectURL(await response4.blob()));
//       //       const la7nSomKebir5 = new Audio(URL.createObjectURL(await response5.blob()));

//       //       la7nSomKebir0.addEventListener("loadedmetadata", () => {
//       //         let la7nSomKebirDur0 = document.getElementById("la7n-som-kebir-duration0");
//       //         la7nSomKebirDur0.innerHTML = la7nSomKebir0.duration;
//       //       });
//       //       la7nSomKebir1.addEventListener("loadedmetadata", () => {
//       //         let la7nSomKebirDur1 = document.getElementById("la7n-som-kebir-duration1");
//       //         la7nSomKebirDur1.innerHTML = la7nSomKebir1.duration;
//       //       });
//       //       la7nSomKebir2.addEventListener("loadedmetadata", () => {
//       //         let la7nSomKebirDur2 = document.getElementById("la7n-som-kebir-duration2");
//       //         la7nSomKebirDur2.innerHTML = la7nSomKebir2.duration;
//       //       });
//       //       la7nSomKebir3.addEventListener("loadedmetadata", () => {
//       //         let la7nSomKebirDur3 = document.getElementById("la7n-som-kebir-duration3");
//       //         la7nSomKebirDur3.innerHTML = la7nSomKebir3.duration;
//       //       });
//       //       la7nSomKebir4.addEventListener("loadedmetadata", () => {
//       //         let la7nSomKebirDur4 = document.getElementById("la7n-som-kebir-duration4");
//       //         la7nSomKebirDur4.innerHTML = la7nSomKebir4.duration;
//       //       });
//       //       la7nSomKebir5.addEventListener("loadedmetadata", () => {
//       //         let la7nSomKebirDur5 = document.getElementById("la7n-som-kebir-duration5");
//       //         la7nSomKebirDur5.innerHTML = la7nSomKebir5.duration;
//       //       });

//       //   } catch (error) {
//       //     console.error("Error loading sound:", error);
//       //   }
//       // }
//       // loadSound();
//       // -----------------------------------------------------------------------------------
//   // async function loadAndDisplayDurations(sound) {
//   //   try {
//   //     const audioElements = await Promise.all(
//   //       sound.map(async (sound) => {
//   //         const response = await fetch(sounds[i].src);
//   //         const blob = await response.blob();
//   //         return new Audio(URL.createObjectURL(blob));
//   //       })
//   //     );

//   //     audioElements.forEach((audio, index) => {
//   //       audio.addEventListener("loadedmetadata", () => {
//   //         const durationElementId = `la7n-som-kebir-duration${index}`;
//   //         const durationElement = document.getElementById(durationElementId);

//   //         if (durationElement) {
//   //           durationElement.innerHTML = audio.duration.toFixed(2); // Format to 2 decimal places
//   //         } else {
//   //           console.error(`Duration element with ID '${durationElementId}' not found.`);
//   //         }
//   //       });
//   //       audio.addEventListener("error", (error) => {
//   //         console.error("Error loading audio:", sounds[index].src, error);
//   //       });
//   //     });
//   //   } catch (error) {
//   //     console.error("Error loading audio files:", error);
//   //   }
//   // }
//   //     loadAndDisplayDurations(sounds);

//       col.appendChild(card);
//       if (sectionSomKebir) {
//         sectionSomKebir.appendChild(col);
//       }

//     } else if (sounds[i].monasba == "keahk") {
//       card.innerHTML = `
//               <div class="d-flex justify-content-center align-items-center">
//                 <audio controls>
//                   <source src="${sounds[i].src}" type="audio/mpeg">
//                   متصفحك لا يدعم ملفات الصوت.
//                 </audio>
//               </div>
//               <div class="card-body">
//                 <p class="card-text"><span class="fw-bold">اسم اللحن: </span>${sounds[i].name}</p>
//                 <p class="card-text"><span class="fw-bold">المناسبة التي يقال فيها: </span>تسبحة كيهك او تسبحة نصف الليل</p>
//                 <div class="d-flex justify-content-between align-items-center">
//                   <div class="btn-group">
//                     <button type="button" class="btn btn-sm btn-outline-secondary">تفاصيل</button>
//                   </div>
//                   <small class="text-body-secondary">${sounds[i].duration}</small>
//                 </div>
//               </div>
//     `;
//       col.appendChild(card);
//       if (sectionKeahk) {
//         sectionKeahk.appendChild(col);
//       }
//     }
//   }
"use client";
// import React, { useEffect } from "react";

// interface Sound {
//   monasba: string;
//   name: string;
//   duration: string;
//   src: string;
// }

const sounds = [
  {
    monasba: "keahk",
    name: "التوزيع الكيهكى",
    duration: "1:40",
    src: "./al7an/التوزيع الكيهكى.mp3",
    hazatSrc: "./al7an/hazat/كيهك و الميلاد_page-0052.jpg",
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
    monasba: "keahk",
    name: "ثيؤطوكية_الأحد_قبطي",
    duration: "6:57",
    src: "./al7an/ثيؤطوكية_الأحد_شاشف_إنسوب_إمينى.mp3",
  },
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
    hazatSrc: "./al7an/hazat/كيهك و الميلاد_page-0009.jpg",
    hazatSrc1: "./al7an/hazat/كيهك و الميلاد_page-0010.jpg",
    hazatSrc2: "./al7an/hazat/كيهك و الميلاد_page-0011.jpg",
  },
  {
    monasba: "keahk",
    name: "لحن تي جاليلي اي",
    duration: "11:42",
    src: "./al7an/لحن تي جاليلي اي.mp3",
  },
  {
    monasba: "keahk",
    name: "لحن هوس إيروف (الهوس الثالث) - الم_علم جاد لويس",
    duration: "7:55",
    src: "./al7an/لحن هوس إيروف (الهوس الثالث) - الم_علم جاد لويس.mp3",
    hazatSrc: "./al7an/hazat/التسبحة_page-0038.jpg",
    hazatSrc1: "./al7an/hazat/التسبحة_page-0039.jpg",
  },
  {
    monasba: "keahk",
    name: "لحن_اريبصالين",
    duration: "7:55",
    src: "./al7an/لحن_اريبصالين.mp3",
  },
  {
    monasba: "keahk",
    name: "لحن_تين_اويه_أنسوك",
    duration: "7:02",
    src: "./al7an/لحن_تين_اويه_أنسوك.mp3",
    hazatSrc: "./al7an/hazat/التسبحة_page-0047.jpg",
    hazatSrc1: "./al7an/hazat/التسبحة_page-0048.jpg",
    hazatSrc2: "./al7an/hazat/التسبحة_page-0049.jpg",
  },
  {
    monasba: "keahk",
    name: "لحن_تين_ثينو_الكبير",
    duration: "11:18",
    src: "./al7an/لحن_تين_ثينو_الكبير.mp3",
    hazatSrc: "./al7an/hazat/التسبحة_page-0024.jpg",
    hazatSrc1: "./al7an/hazat/التسبحة_page-0025.jpg",
  },
  {
    monasba: "keahk",
    name: "لحن_تينين",
    duration: "7:25",
    src: "./al7an/لحن_تينين.mp3",
    hazatSrc: "./al7an/hazat/التسبحة_page-0042.jpg",
    hazatSrc1: "./al7an/hazat/التسبحة_page-0043.jpg",
    hazatSrc2: "./al7an/hazat/التسبحة_page-0044.jpg",
    hazatSrc3: "./al7an/hazat/التسبحة_page-0045.jpg",
    hazatSrc4: "./al7an/hazat/التسبحة_page-0046.jpg",
  },
  {
    monasba: "keahk",
    name: "لحن_سيموتى",
    duration: "7:45",
    src: "./al7an/لحن_سيموتى.mp3",
    hazatSrc: "./al7an/hazat/التسبحة_page-0056.jpg",
    hazatSrc1: "./al7an/hazat/التسبحة_page-0057.jpg",
    hazatSrc2: "./al7an/hazat/التسبحة_page-0058.jpg",
    hazatSrc3: "./al7an/hazat/التسبحة_page-0059.jpg",
  },
  {
    monasba: "keahk",
    name: "لحن_شيري_نيه_ماريا",
    duration: "6:50",
    src: "./al7an/لحن_شيري_نيه_ماريا.mp3",
    hazatSrc: "./al7an/hazat/التسبحة_page-0053.jpg",
    hazatSrc1: "./al7an/hazat/التسبحة_page-0054.jpg",
    hazatSrc2: "./al7an/hazat/التسبحة_page-0055.jpg",
  },
  {
    monasba: "keahk",
    name: "لحن(الهوس_الثالث)آسمو_ابشويس",
    duration: "20:35",
    src: "./al7an/لحن(الهوس_الثالث)آسمو_ابشويس.mp3",
    hazatSrc: "./al7an/hazat/التسبحة_page-0036.jpg",
    hazatSrc1: "./al7an/hazat/التسبحة_page-0037.jpg",
    hazatSrc2: "./al7an/hazat/التسبحة_page-0038.jpg",
    hazatSrc3: "./al7an/hazat/التسبحة_page-0039.jpg",
    hazatSrc4: "./al7an/hazat/التسبحة_page-0040.jpg",
    hazatSrc5: "./al7an/hazat/التسبحة_page-0041.jpg",
  },
];

const KeahkPlayer: React.FC = () => {
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
    <div
      id="sec-keahk"
      className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3"
    >
      {sounds
        .filter((sound) => sound.monasba === "keahk")
        .map((sound, index) => (
          <div className="col" key={`keahk-${index}`}>
            <div className="card shadow-sm pt-3 ps-3" key={`keahk-${index}`}>
              <div className="d-flex justify-content-center align-items-center">
                <audio controls is="x-audio" id={`keahk-audio-${index}`}>
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
                  <span className="fw-bold">المناسبة التي يقال فيها: </span>
                  تسبحة كيهك او تسبحة نصف الليل
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      data-bs-toggle="modal" data-bs-target={"#exampleModel" + index} data-bs-whatever="@Tofa7a"
                    >
                      تفاصيل
                    </button>
                    <div
                      className="modal fade"
                      id={"exampleModel" + index}
                      data-bs-backdrop="static"
                      data-bs-keyboard="false"
                      tabIndex={-1}
                      aria-labelledby={"exampleModelLabel" + index}
                      // aria-labelledby={`infoLabel${[index]}`}
                      aria-hidden="true"
                    >
                      <div className="modal-dialog modal-dialog-scrollable">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h1 className="modal-title fs-5" id={"exampleModelLabel" + index}>{sound.name}</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div className="modal-body">
                            <img src={sound.hazatSrc} className="card-img-top" alt={sound.name} />
                            {sound.hazatSrc1 == ""? <p>مفيش صورة لللحن ده</p>: <img
                              src={sound.hazatSrc1}
                              alt={sound.name}
                              className="img-thumbnail"/>}
                            {sound.hazatSrc2 == ""? <br />: <img
                              src={sound.hazatSrc2}
                              alt={sound.name}
                              className="img-thumbnail"/>}
                            {sound.hazatSrc3 == ""?<br />: <img
                              src={sound.hazatSrc3}
                              alt={sound.name}
                              className="img-thumbnail"/>}
                            {sound.hazatSrc4 == ""? <br />: <img
                              src={sound.hazatSrc4}
                              alt={sound.name}
                              className="img-thumbnail"/>}
                            {sound.hazatSrc5 == ""? <br />: <img
                              src={sound.hazatSrc5}
                              alt={sound.name}
                              className="img-thumbnail"/>}
                          </div>
                          <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button className="btn btn-information" data-bs-target="#payment${[i]}" data-bs-toggle="modal">Open Payment</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="modal fade" id="payment${[i]}" aria-hidden="true" aria-labelledby="paymentLabel${[i]}" tabIndex={-1}>
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h1 className="modal-title fs-5" id="paymentLabel${[i]}">Modal 2</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div className="modal-body">
                            <h4 className="mb-3">Payment TripsData[i].payment LE</h4>

                            <div className="my-3">
                              <div className="form-check">
                                <input id="credit" name="paymentMethod" type="radio" className="form-check-input" checked required />
                                <label className="form-check-label" htmlFor="credit">Credit card</label>
                              </div>
                              <div className="form-check">
                                <input id="debit" name="paymentMethod" type="radio" className="form-check-input" required />
                                <label className="form-check-label" htmlFor="debit">Debit card</label>
                              </div>
                              <div className="form-check">
                                <input id="paypal" name="paymentMethod" type="radio" className="form-check-input" required />
                                <label className="form-check-label" htmlFor="paypal">PayPal</label>
                              </div>
                            </div>

                            <div className="row gy-3">
                              <div className="col-md-6">
                                <label htmlFor="cc-name" className="form-label">Name on card</label>
                                <input type="text" className="form-control" id="cc-name" placeholder="" required />
                                <small className="text-body-secondary">Full name as displayed on card</small>
                                <div className="invalid-feedback">Name on card is required</div>
                              </div>

                              <div className="col-md-6">
                                <label htmlFor="cc-number" className="form-label">Credit card number</label>
                                <input type="text" className="form-control" id="cc-number" placeholder="" required />
                                <div className="invalid-feedback">Credit card number is required</div>
                              </div>

                              <div className="col-md-3">
                                <label htmlFor="cc-expiration" className="form-label">Expiration</label>
                                <input type="text" className="form-control" id="cc-expiration" placeholder="" required />
                                <div className="invalid-feedback">Expiration date required</div>
                              </div>

                              <div className="col-md-3">
                                <label htmlFor="cc-cvv" className="form-label">CVV</label>
                                <input type="text" className="form-control" id="cc-cvv" placeholder="" required />
                                <div className="invalid-feedback">Security code required</div>
                              </div>
                            </div>
                          </div>
                          <div className="modal-footer">
                            <button className="btn btn-secondary" data-bs-target="#info${[i]}" data-bs-whatever="@Tofa7a" data-bs-toggle="modal">
                              Back to Informations
                            </button>
                            <button
                              className="btn-information"
                              data-bs-target="#submit${[i]}"
                              data-bs-whatever="@Tofa7a"
                              data-bs-nameUni="${TripsData[i].name} University"
                              data-bs-toggle="modal"
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="modal fade" id="submit${[i]}" aria-hidden="true" aria-labelledby="submitLabel${[i]}" tabIndex={-1}>
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h1 className="modal-title fs-5" id="submitLabel${[i]}">Modal [i]</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div className="modal-body">
                            <h3></h3>
                          </div>
                        </div>
                        <div className="modal-footer">
                          {/* <button className="btn btn-secondary" data-bs-target="#info${[i]}" data-bs-whatever="@Tofa7a" data-bs-toggle="modal">
                Back to first
              </button>
              <button className="btn-information" data-bs-target="#info" data-bs-whatever="@Tofa7a" data-bs-nameUni="${
                    TripsData[i].name
                  } University" data-bs-toggle="modal">
                Submit
              </button> */}
                        </div>
                      </div>
                    </div>

                  </div>
                  <small className="text-body-secondary">
                    {/* {(document.getElementById(`keahk-audio-${index}`) as HTMLAudioElement)?.duration} */}
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

export default KeahkPlayer;
