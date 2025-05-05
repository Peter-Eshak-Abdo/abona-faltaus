"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center p-3">
      <div className="bg-secondary bg-opacity-50 p-4 rounded-3 w-75 mx-auto text-center">
        <h1 className="display-1">404</h1>
        <h2 className="mb-4">الصفحة غير موجودة</h2>

        <div className="d-flex justify-content-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="btn btn-primary"
          >
            العودة للصفحة السابقة
          </button>
          <Link href="/" className="btn btn-secondary">
            الصفحة الرئيسية
          </Link>
        </div>

        <div className="d-flex justify-content-center">
          <img
            src="/images/IMG-20240512-WA0001.jpg"
            alt="404 Image"
            className="img-fluid rounded"
            style={{ maxHeight: "40vh", objectFit: "contain" }}
          />
        </div>
      </div>
    </div>
  );
}
// export const dynamic = "force-dynamic"; // Force static generation
