"use client";
import Image from "next/image";

export default function LogoHeader() {

  return (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-full flex flex-col items-center shadow-lg border border-white/20 w-[300px] z-30">
          {/* <div className="flex items-center gap-3"> */}
            <Image src="/images/logo.jpg" alt="logo" width={65} height={65} />
            <span className="text-black text-lg font-semibold">
              ابونا فلتاؤس السرياني
            </span>
          {/* </div> */}
      </div>
  );
}
