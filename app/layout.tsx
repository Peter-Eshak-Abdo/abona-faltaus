import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import Script from "next/script";
import LoadingProvider from "./loading-provider";
import { LoadingProvider as GlobalLoadingProvider } from "./loading-context";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import ClientLayoutAnimation from "@/components/ClientLayoutAnimation";
// import ChatFab from "@/components/ChatFab";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from "@vercel/analytics/next";
import OneSignal from "@/components/OneSignal";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "700"],
  variable: '--font-vazirmatn'
});

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://abona-faltaus.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'أبونا فلتاؤس تفاحة',
  description: "الحان وترانيم وعظات والكتاب المقدس ومقالات و امتحانات اسئلة دينية فردية و مجموعات وكل ما يخص الكنيسة الارثوذكسية",
  keywords: ["الحان", "عظات", "وعظات", "ترانيم", "مقالات دينية", "امتحانات", "اسئلة دينية", "ابونا فلتاؤس السرياني", "الكتاب المقدس", "كنيسة", "ارثوذكسية", "تفاحة"],
  authors: [{ name: 'Peter Eshak Abdo', url: baseUrl }],
  creator: 'Peter Eshak Abdo',
  icons: {
    icon: "/images/icons/favicon.ico",
  },
  openGraph: {
    title: 'أبونا فلتاؤس تفاحة',
    description: 'الحان وترانيم وعظات والكتاب المقدس ومقالات و امتحانات اسئلة دينية فردية و مجموعات وكل ما يخص الكنيسة الارثوذكسية.',
    url: baseUrl,
    siteName: 'Abona Faltaus',
    images: [
      {
        url: '/images/icons/favicon.ico',
        width: 1200,
        height: 630,
        alt: 'أبونا فلتاؤس تفاحة',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={vazirmatn.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="أبونا فلتاؤس تفاحة" />
        <meta property="og:url" content="https://abona-faltaus.vercel.app" />
        <meta property="og:title" content="أبونا فلتاؤس تفاحة" />
        <meta property="og:description" content="الحان وترانيم وعظات والكتاب المقدس ومقالات و امتحانات اسئلة دينية فردية و مجموعات وكل ما يخص الكنيسة الارثوذكسية." />
        <meta property="og:image" content="/images/icons/favicon.ico" />
        <link rel="canonical" href="https://abona-faltaus.vercel.app/" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link
          href="https://cdn.jsdelivr.net/npm/@docsearch/css@3"
          rel="stylesheet"
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
        <GlobalLoadingProvider>
          <LoadingProvider>
            {/* <ChatFab /> */}
            <OneSignal />
            <ClientLayoutAnimation>{children}</ClientLayoutAnimation>
          </LoadingProvider>
        </GlobalLoadingProvider>
        <Analytics />
        <SpeedInsights />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/js/lightbox.min.js"
          strategy="afterInteractive"
        />
        <Toaster />
      </body>
    </html>
  );
}
