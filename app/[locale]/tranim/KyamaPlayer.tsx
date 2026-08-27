"use client";
import { Button } from "@/components/ui/button";

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
    <div id="sec-kyama" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {sounds
        .filter((sound) => sound.monasba === "kyama")
        .map((sound, index) => (
          <div className="bg-white rounded-lg shadow-sm p-4" key={`kyama-${index}`}>
            <div className="flex justify-center items-center mb-4">
              <audio controls className="w-full" id={`kyama-audio-${index}`}>
                <source src={sound.src} type="audio/mpeg" />
                متصفحك لا يدعم ملفات الصوت.
              </audio>
            </div>
            <div className="text-right">
              <p className="text-sm">
                <span className="font-bold">اسم اللحن: </span>
                {sound.name}
              </p>
              <p className="text-sm">
                <span className="font-bold">المناسبة التي يقال فيها: </span>عيد القيامة
              </p>
              <div className="flex justify-between items-center mt-4">
                <Button variant="outline" size="sm">
                  تفاصيل
                </Button>
                <small className="text-gray-600">{sound.duration}</small>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default KyamaPlayer;

