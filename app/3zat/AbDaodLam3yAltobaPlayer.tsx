"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const sounds = [
  {
    monasba: "abDaodLam3y-alsla",
    name: "1. سنة الصلاة",
    duration: "32:23",
    src: "./3zat/abDaodLam3y/alsla/01- سنة الصلاة.mp3",
  },
  {
    monasba: "abDaodLam3y-alsla",
    name: "2. تعقلوا واصحوا للصلوات",
    duration: "49:09",
    src: "./3zat/abDaodLam3y/alsla/02- تعقلوا واصحوا للصلوات.mp3",
  },
  {
    monasba: "abDaodLam3y-alsla",
    name: "3. الثقة فى الصلاة",
    duration: "47:06",
    src: "./3zat/abDaodLam3y/alsla/03- الثقة فى الصلاة.mp3",
  },
  {
    monasba: "abDaodLam3y-altoba",
    name: "1. اقوال عن التوبة",
    duration: "14:11",
    src: "./3zat/abDaodLam3y/altoba/أقوال عن التوبة (1) - لأبونا داود لمعي.mp3",
  },
  {
    monasba: "abDaodLam3y-altoba",
    name: "2. اقوال عن التوبة",
    duration: "11:03",
    src: "./3zat/abDaodLam3y/altoba/أقوال عن التوبة (2) - لأبونا داود لمعي.mp3",
  },
];

const AbDaodLam3yAltobaPlayer: React.FC = () => {
  return (
    <div id="sec-abDaodLam3y-altoba" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {sounds
        .filter((sound) => sound.monasba === "abDaodLam3y-altoba")
        .map((sound, index) => (
          <Card key={`abDaodLam3y-altoba-${index}`} className="shadow-sm pt-3 ps-3">
            <CardContent>
              <div className="flex justify-center items-center">
                <audio controls is="x-audio" id={`abDaodLam3y-altoba-audio-${index}`}>
                  <source src={sound.src} type="audio/mpeg" />
                  متصفحك لا يدعم ملفات الصوت.
                </audio>
              </div>
              <div className="text-left">
                <p>
                  <span className="font-bold">ابونا: </span>داؤد لمعي
                </p>
                <p>
                  <span className="font-bold">اسم الوعظة: </span>
                  {sound.name}
                </p>
                <p>
                  <span className="font-bold">تتحدث عن: </span>الصلاة
                </p>
                <div className="flex justify-between items-center">
                  <Button type="button" variant="outline" size="sm">
                    تفاصيل
                  </Button>
                  <small className="text-gray-500">{sound.duration}</small>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
};

export default AbDaodLam3yAltobaPlayer;
