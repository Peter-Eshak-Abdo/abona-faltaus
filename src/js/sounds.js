const sounds = [
  {
    monasba: "som-kebir",
    name: "لحن إنثو تي تي شوري",
    duration: "3:06",
    // src: "https://www.dropbox.com/scl/fi/i03y7cndra6lqxcz2mzog/06.mp3?rlkey=ts1l7ps97knknc23e6m40rloq&st=c7yx2pxn&dl=0",
    // src: "https://drive.google.com/file/d/1LAFS_6kNqL100fqwKgfy2_wWKmBGSsOI/view?usp=drive_link",
    src: "../media/sound/al7an/06 لحن إنثو تي تي شوري الصيامي.mp3",
  },
  {
    monasba: "keahk",
    name: "التوزيع الكيهكى",
    duration: "1:40",
    src: "../media/sound/al7an/التوزيع الكيهكى.mp3",
  },
  {
    monasba: "som-kebir",
    name: "الليلويا إي ا ايخون",
    duration: "2:04",
    src: "../media/sound/al7an/الليلويا إي ا ايخون.mp3",
  },
  {
    monasba: "keahk",
    name: "مجمع التسبحة",
    duration: "20:07",
    src: "../media/sound/al7an/المجمع_التسبحة.mp3",
  },
  {
    monasba: "keahk",
    name: "الهوس الأول قبطي",
    duration: "7:06",
    src: "../media/sound/al7an/الهوس الأول قبطي.mp3",
  },
  {
    monasba: "keahk",
    name: "الهوس الأول عربي",
    duration: "3:33",
    // src: "https://soundcloud.com/abanoub-fana/aghapy-tv?si=5173a99c46aa4a2abc8e31eab1ad0571&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
    src: "../media/sound/al7an/الهوس_الاول-عربي.mp3",
  },
  {
    monasba: "keahk",
    name: "الهوس الثاني قبطي",
    duration: "4:33",
    src: "../media/sound/al7an/الهوس_الثاني-قبطي.mp3",
  },
  {
    monasba: "keahk",
    name: "الهوس الرابع قبطي",
    duration: "7:00",
    src: "../media/sound/al7an/الهوس_الرابع-قبطي.mp3",
  },
  {
    monasba: "som-kebir",
    name: "توزيع الصوم الكبير",
    duration: "14:40",
    src: "../media/sound/al7an/توزيع الصوم الكبير .mp3",
  },
  {
    monasba: "som-kebir",
    name: "ثيؤطوكية_الأحد_قبطي",
    duration: "6:57",
    src: "../media/sound/al7an/ثيؤطوكية_الأحد_قبطي.mp3",
  },
];
const sectionSomKebir = document.getElementById("sec-som-kebir");
const sectionKeahk = document.getElementById("sec-keahk");
for (let i = 0; i < sounds.length; i++) {
  const col = document.createElement("div");
  const card = document.createElement("div");
  col.classList.add("col");
  card.classList.add("card", "shadow-sm", "pt-3", "ps-3");

  if (sounds[i].monasba == "som-kebir") {
    card.innerHTML = `
      <div class="d-flex justify-content-center align-items-center">
        <audio controls id="la7n-som-kebir${[i]}">
          <source src="${sounds[i].src}" type="audio/mpeg">
          متصفحك لا يدعم ملفات الصوت.
        </audio>
      </div>
      <div class="card-body">
        <p class="card-text"><span class="fw-bold">اسم اللحن: </span>${sounds[i].name}</p>
        <p class="card-text"><span class="fw-bold">المناسبة التي يقال فيها: </span>صوم يونان والصوم الكبير</p>
        <div class="d-flex justify-content-between align-items-center">
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-secondary">تفاصيل</button>
          </div>
          <small class="text-body-secondary">${sounds[i].duration}</small>
          <!--<small class="text-body-secondary" id="la7n-som-kebir-duration${[i]}"></small>-->
        </div>
      </div>
    `;

  // let la7nSomKebir0 = document.getElementById("la7n-som-kebir0");
    // console.log(la7nSomKebir0.duration);
    //--------------------------------------------------------------
    // la7nSomKebir0.addEventListener("DOMContentLoaded", () => {
    //   const duration = la7nSomKebir0.duration; // Now it should be safe
    //   console.log("Duration:", duration);
    //   // ... rest of your code that uses the duration
    // });

    // la7nSomKebir0.addEventListener("error", (error) => {
    //   console.error("Error loading audio:", error);
    // });
    //-------------------------------------------------------------------------
    // async function loadSound() {
    //   try {

    //     // const response = await fetch(sounds[i].src);
    //       const response0 = await fetch(sounds[0].src);
    //       const response1 = await fetch(sounds[1].src);
    //       const response2 = await fetch(sounds[2].src);
    //       const response3 = await fetch(sounds[3].src);
    //       const response4 = await fetch(sounds[4].src);
    //       const response5 = await fetch(sounds[5].src);
    //       const la7nSomKebir0 = new Audio(URL.createObjectURL(await response0.blob()));
    //       const la7nSomKebir1 = new Audio(URL.createObjectURL(await response1.blob()));
    //       const la7nSomKebir2 = new Audio(URL.createObjectURL(await response2.blob()));
    //       const la7nSomKebir3 = new Audio(URL.createObjectURL(await response3.blob()));
    //       const la7nSomKebir4 = new Audio(URL.createObjectURL(await response4.blob()));
    //       const la7nSomKebir5 = new Audio(URL.createObjectURL(await response5.blob()));

    //       la7nSomKebir0.addEventListener("loadedmetadata", () => {
    //         let la7nSomKebirDur0 = document.getElementById("la7n-som-kebir-duration0");
    //         la7nSomKebirDur0.innerHTML = la7nSomKebir0.duration;
    //       });
    //       la7nSomKebir1.addEventListener("loadedmetadata", () => {
    //         let la7nSomKebirDur1 = document.getElementById("la7n-som-kebir-duration1");
    //         la7nSomKebirDur1.innerHTML = la7nSomKebir1.duration;
    //       });
    //       la7nSomKebir2.addEventListener("loadedmetadata", () => {
    //         let la7nSomKebirDur2 = document.getElementById("la7n-som-kebir-duration2");
    //         la7nSomKebirDur2.innerHTML = la7nSomKebir2.duration;
    //       });
    //       la7nSomKebir3.addEventListener("loadedmetadata", () => {
    //         let la7nSomKebirDur3 = document.getElementById("la7n-som-kebir-duration3");
    //         la7nSomKebirDur3.innerHTML = la7nSomKebir3.duration;
    //       });
    //       la7nSomKebir4.addEventListener("loadedmetadata", () => {
    //         let la7nSomKebirDur4 = document.getElementById("la7n-som-kebir-duration4");
    //         la7nSomKebirDur4.innerHTML = la7nSomKebir4.duration;
    //       });
    //       la7nSomKebir5.addEventListener("loadedmetadata", () => {
    //         let la7nSomKebirDur5 = document.getElementById("la7n-som-kebir-duration5");
    //         la7nSomKebirDur5.innerHTML = la7nSomKebir5.duration;
    //       });

    //   } catch (error) {
    //     console.error("Error loading sound:", error);
    //   }
    // }
    // loadSound();
    // -----------------------------------------------------------------------------------
// async function loadAndDisplayDurations(sound) {
//   try {
//     const audioElements = await Promise.all(
//       sound.map(async (sound) => {
//         const response = await fetch(sounds[i].src);
//         const blob = await response.blob();
//         return new Audio(URL.createObjectURL(blob));
//       })
//     );

//     audioElements.forEach((audio, index) => {
//       audio.addEventListener("loadedmetadata", () => {
//         const durationElementId = `la7n-som-kebir-duration${index}`;
//         const durationElement = document.getElementById(durationElementId);

//         if (durationElement) {
//           durationElement.innerHTML = audio.duration.toFixed(2); // Format to 2 decimal places
//         } else {
//           console.error(`Duration element with ID '${durationElementId}' not found.`);
//         }
//       });
//       audio.addEventListener("error", (error) => {
//         console.error("Error loading audio:", sounds[index].src, error);
//       });
//     });
//   } catch (error) {
//     console.error("Error loading audio files:", error);
//   }
// }
//     loadAndDisplayDurations(sounds);

    col.appendChild(card);
    sectionSomKebir.appendChild(col);


  } else if (sounds[i].monasba == "keahk") {
    card.innerHTML = `
            <div class="d-flex justify-content-center align-items-center">
              <audio controls>
                <source src="${sounds[i].src}" type="audio/mpeg">
                متصفحك لا يدعم ملفات الصوت.
              </audio>
            </div>
            <div class="card-body">
              <p class="card-text"><span class="fw-bold">اسم اللحن: </span>${sounds[i].name}</p>
              <p class="card-text"><span class="fw-bold">المناسبة التي يقال فيها: </span>تسبحة كيهك او تسبحة نصف الليل</p>
              <div class="d-flex justify-content-between align-items-center">
                <div class="btn-group">
                  <button type="button" class="btn btn-sm btn-outline-secondary">تفاصيل</button>
                </div>
                <small class="text-body-secondary">${sounds[i].duration}</small>
              </div>
            </div>
  `;
    col.appendChild(card);
    sectionKeahk.appendChild(col);
  }
}

