"use client";
import Image from "next/image";

export default function LogoHeader() {

  return (
    <>
      <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-full flex flex-col items-center shadow-lg border border-white/20 w-75 z-30 pt-2">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo.jpg"
            alt="Logo"
            width={80}
            height={80}
            className="rounded-full border-4 border-blue-300"
            priority
          />
          <h1 className="text-black text-lg font-semibold fs-5">
            ابونا فلتاؤس السرياني
          </h1>
        </div>
      </div>
      <br /><br /><br /><br />
    </>
  );
}
