"use client";
import Image from "next/image";

export default function LogoHeader() {

  return (
    <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-full flex flex-col items-center shadow-xl/30 inset-shadow-sm border-white/20 w-11/12 md:w-50 z-30 py-1">
      <div className="flex items-center gap-3">
        <Image
          src="/images/eagle.png"
          alt="Logo"
          width={60}
          height={80}
          className="rounded-full border-blue-300"
          priority
        />
        <h1 className="font-bold text-2xl md:text-4xl">
          ابونا فلتاؤس
        </h1>
        <Image
          src="/images/eagle.png"
          alt="Logo"
          width={60}
          height={80}
          className="rounded-full border-blue-300"
          style={{ transform: "scaleX(-1)" }}
          priority
        />
      </div>
    </div>
  );
}
