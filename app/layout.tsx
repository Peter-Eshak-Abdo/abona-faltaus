import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import Script from "next/script";
import LoadingProvider from "./loading-provider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
// import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "700"],
  variable: '--font-vazirmatn'
});

export const metadata: Metadata = {
  title: 'Abona Faltaous | أبونا فلتاؤس',
  description: "الحان وترانيم وعظات والكتاب المقدس ومقالات و امتحانات اسئلة دينية فردية و مجموعات وكل ما يخص الكنيسة الارثوذكسية",
  keywords: ["الحان", "عظات", "وعظات", "ترانيم", "مقالات دينية", "امتحانات", "اسئلة دينية", "ابونا فلتاؤس السرياني", "الكتاب المقدس", "كنيسة", "ارثوذكسية"],
  authors: [{ name: 'Peter Eshak Abdo', url: 'https://abona-faltaus.vercel.app' }],
  creator: 'Peter Eshak Abdo',
  icons: {
    icon: "./images/icons/favicon.ico",
  },
  openGraph: {
    title: 'أبونا فلتاؤس السرياني',
    description: 'الحان وترانيم وعظات والكتاب المقدس ومقالات و امتحانات اسئلة دينية فردية و مجموعات وكل ما يخص الكنيسة الارثوذكسية.',
    url: 'https://abona-faltaus.vercel.app',
    siteName: 'Abona Faltaous',
    images: [
      {
        url: '/images/icons/favicon.ico',
        width: 1200,
        height: 630,
        alt: 'أبونا فلتاؤس السرياني',
      },
    ],
    locale: 'ar_EG',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },

};

import ClientLayoutAnimation from "@/components/ClientLayoutAnimation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={vazirmatn.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:type" content="website"/>
        <meta property="og:site_name" content="أبونا فلتاؤس السرياني"/>
        <meta property="og:url" content="https://abona-faltaus.vercel.app/"/>
        <meta property="og:title" content="أبونا فلتاؤس السرياني"/>
        <meta property="og:description" content="الحان وترانيم وعظات والكتاب المقدس ومقالات و امتحانات اسئلة دينية فردية و مجموعات وكل ما يخص الكنيسة الارثوذكسية."/>
        <meta property="og:image" content="/images/icons/favicon.ico"/>
        <link rel="canonical" href="https://abona-faltaus.vercel.app/" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* iOS splash + PWA support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link
          href="https://cdn.jsdelivr.net/npm/@docsearch/css@3"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
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
          href="/manifest.webmanifest"
        />
        <meta name="google-site-verification" content="45CwlQo0Fk1QKL796kCc0ZRO2Kd-n9cq2m1JHmzNjnk" />
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap-0.xml" />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/css/lightbox.min.css"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning={true}>
        <ServiceWorkerRegister />
        <div className="background-blur" />
        <LoadingProvider>
          <ClientLayoutAnimation>{children}</ClientLayoutAnimation>
        </LoadingProvider>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/js/lightbox.min.js"
          strategy="afterInteractive"
        />
      </body>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.bundle.min.js"
        integrity="sha512-7Pi/otdlbbCR+LnW+F7PwFcSDJOuUJB3OxtEHbg4vSMvzvJjde4Po1v4BR9Gdc9aXNUNFVUY+SK51wWT8WF0Gg=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
    </html>
  );
}
