"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const sounds = [
  {
    monasba: "babaShenody",
    name: "مش عارف اسمية ايه",
    duration: "44:09",
    src: "./3zat/babaShenody/111111.MP3",
  },
  {
    monasba: "babaShenody",
    name: "مش عارف اسمية ايه",
    duration: "29:54",
    src: "./3zat/babaShenody/videoplayback.mp4",
  },
  {
    monasba: "babaShenody",
    name: "مش عارف اسمية ايه",
    duration: "20:50",
    src: "./3zat/babaShenody/videoplayback(1).mp4",
  },
  {
    monasba: "babaShenody",
    name: "اله الضعفاء",
    duration: "32:22",
    src: "./3zat/babaShenody/اله الضعفاء.mp4",
  },
  {
    monasba: "babaShenody",
    name: "تأمل إجذبني وراءك فنجري",
    duration: "17:42",
    src: "./3zat/babaShenody/تأمل إجذبني وراءك فنجري - البابا شنودة الثالث.mp4",
  },
  {
    monasba: "babaShenody",
    name: "تأمل دفعت لأسقط",
    duration: "15:38",
    src: "./3zat/babaShenody/تأمل دفعت لأسقط - البابا شنودة الثالث.mp4",
  },
  {
    monasba: "babaShenody",
    name: "رحله الروح بعد الموت",
    duration: "1:00:07",
    src: "./3zat/babaShenodyرحله الروح بعد الموت † عظه هامه  للبابا شنوده الثالث † 1991 (192 kbps).mp3",
  },
  {
    monasba: "babaShenody",
    name: "انا سوداء و جميلة ج1",
    duration: "43:25",
    src: "./3zat/babaShenody/عظة قداسة البابا شنودة انا سوداء و جميلة ج1 بالموسيقى.mp4",
  },
];

const BabaShenodyPlayer: React.FC = () => {
  return (
    <div
      id="sec-babaShenody"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
    >
      {sounds
        .filter((sound) => sound.monasba === "babaShenody")
        .map((sound, index) => (
          <Card key={`babaShenody-${index}`} className="shadow-sm pt-3 ps-3">
            <CardContent>
              <div className="flex justify-center items-center">
                <audio
                  controls
                  is="x-audio"
                  id={`babaShenody-audio-${index}`}
                >
                  <source src={sound.src} type="audio/mpeg" />
                  متصفحك لا يدعم ملفات الصوت.
                </audio>
              </div>
              <div className="text-left">
                <p>
                  <span className="font-bold">ابونا: </span>البابا شنودة الثالث
                </p>
                <p>
                  <span className="font-bold">اسم الوعظة: </span>
                  {sound.name}
                </p>
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                  >
                    تفاصيل
                  </Button>
                  <small className="text-gray-500">
                    {sound.duration}
                  </small>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
};

export default BabaShenodyPlayer;
