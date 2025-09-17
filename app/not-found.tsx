"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-3">
      <div className="bg-gray-500 bg-opacity-50 p-4 rounded-lg w-3/4 mx-auto text-center">
        <h1 className="text-6xl">404</h1>
        <h2 className="mb-4">الصفحة غير موجودة</h2>

        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            العودة للصفحة السابقة
          </button>
          <Link href="/" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
            الصفحة الرئيسية
          </Link>
        </div>

        <div className="flex justify-center">
          <Image
            src="/images/IMG-20240512-WA0001.jpg"
            alt="404 Image"
            width={400}
            height={300}
            className="rounded-lg max-h-[40vh] object-contain"
          />
        </div>
      </div>
    </div>
  );
}
// export const dynamic = "force-dynamic"; // Force static generation
