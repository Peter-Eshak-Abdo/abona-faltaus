import "./globals.css";
import Script from "next/script";
import Header from "@/components/Header";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import Footer from "@/components/Footer";

function serviceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("sw.js");
        console.log("Service worker registered for scope", registration.scope);
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.name, err.message);
        } else {
          console.error(err);
        }
      }
    });
  }
}

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  serviceWorker();
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>ابونا فلتاؤس السرياني</title>
        <meta
          name="description"
          content="الحان وترانيم ووعظات او عظات وكتب ومقالات ومواقع مسيحية وكل ما يخص الكنيسة الارثوذكسية"
        />
        <meta name="author" content="بيتر اسحاق عبده" />
        <meta
          name="keywords"
          content="الحان , عظات , وعظات , ترانيم , مقالات دينية"
        />
        <link rel="icon" href="./images/icons/favicon.ico" sizes="any" />
        <link
          href="https://cdn.jsdelivr.net/npm/@docsearch/css@3"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        ></link>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.rtl.min.css"
          integrity="sha512-VNBisELNHh6+nfDjsFXDA6WgXEZm8cfTEcMtfOZdx0XTRoRbr/6Eqb2BjqxF4sNFzdvGIt+WqxKgn0DSfh2kcA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="./images/icons/apple-touch-icon.png"
        />
        <link
          rel="manifest"
          id="manifest-placeholder"
          href="./manifest.webmanifest"
        />
      </head>
      <body>
        <Header />
        <ServiceWorkerRegister />
        {children}
        <Footer />
      </body>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.bundle.min.js"
        integrity="sha512-7Pi/otdlbbCR+LnW+F7PwFcSDJOuUJB3OxtEHbg4vSMvzvJjde4Po1v4BR9Gdc9aXNUNFVUY+SK51wWT8WF0Gg=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      ></Script>
    </html>
  );
}
export default RootLayout;
