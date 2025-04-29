import Link from "next/link";

export const metadata = {
  title: "Not Found",
  description: "Could not find requested resource",
};

export default function NotFound() {
  return (
    <>
      <br className="my-5" />
      <br className="my-5" />
      <br className="my-5" />
      <div className="bg-secondary bg-opacity-50 p-3 rounded-3 w-75 mx-auto">
        <h1 className="display-1 mt-5">404</h1>
        <h2>الصفحة غير موجودة</h2>
        <Link href="/" className="fs-2 nav-link text-primary">
          ارجع للصفحة الرئيسية
        </Link>
        <div
          className="container text-center d-flex flex-column justify-content-center align-items-bottom"
          style={{
            backgroundImage: `url('./images/IMG-20240512-WA0001.jpg')`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            height: "40vh",
            margin: "auto",
            backgroundPosition: "center",
          }}
        >
        </div>
      </div>
    </>
  );
}
// export const dynamic = "force-dynamic"; // Force static generation
