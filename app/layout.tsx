'use client';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

import "./globals.css";
import { Vazirmatn } from "next/font/google";
import Script from "next/script";
import Header from "@/components/Header";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import Footer from "@/components/Footer";
import { SpeedInsights } from '@vercel/speed-insights/next';

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

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "700"],
});

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  serviceWorker();
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>ابونا فلتاؤس السرياني</title>
        <meta
          name="description"
          content="الحان وترانيم وعظات والكتاب المقدس ومقالات و امتحانات اسئلة دينية فردية و مجموعات وكل ما يخص الكنيسة الارثوذكسية"
        />
        <meta name="author" content="بيتر اسحاق عبده" />
        <meta
          name="keywords"
          content="الحان , عظات , وعظات , ترانيم , مقالات دينية , امتحانات , اسئلة دينية , ابونا فلتاؤس السرياني , الكتاب المقدس , كنيسة , ارثوذكسية"
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
      <body className={vazirmatn.className}>
        <Header />
        <ServiceWorkerRegister />
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="container mx-auto px-4"
          >
            {children}
            <SpeedInsights />
          </motion.div>
        </AnimatePresence>
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
