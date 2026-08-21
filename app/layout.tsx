import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import Script from "next/script";
import LoadingProvider from "./loading-provider";
import { LoadingProvider as GlobalLoadingProvider } from "./loading-context";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import ClientLayoutAnimation from "@/components/ClientLayoutAnimation";
import { Toaster } from "@/components/ui/sonner";
import FixProcess from "@/components/FixProcess";
import OfflineNotification from "@/components/OfflineNotification";
import PwaManager from "@/components/PwaManager";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import OneSignal from "@/components/OneSignal";
import { Providers } from './providers';

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  display: "swap",
  preload: true,
  weight: ["400", "700"],
  variable: '--font-vazirmatn'
});

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#5C4538" },
    { media: "(prefers-color-scheme: dark)", color: "#3a2a1f" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'أبونا فلتاؤس تفاحة',
  description: "الحان وترانيم وعظات والكتاب المقدس ومقالات و امتحانات اسئلة دينية فردية و مجموعات وكل ما يخص الكنيسة الارثوذكسية",
  keywords: ["الحان", "عظات", "وعظات", "ترانيم", "مقالات دينية", "امتحانات", "اسئلة دينية", "ابونا فلتاؤس السرياني", "الكتاب المقدس", "كنيسة", "ارثوذكسية", "تفاحة"],
  authors: [{ name: 'Peter Eshak Abdo', url: baseUrl }],
  creator: 'Peter Eshak Abdo',
  icons: {
    icon: "/images/icons/favicon.ico",
    apple: "/images/icons/apple-touch-icon.png",
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
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "أبونا فلتاؤس",
    startupImage: [
      // iPhone SE (1st gen) - 320x568
      {
        url: "/images/icons/apple-touch-icon.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
      // iPhone 6/7/8 - 375x667
      {
        url: "/images/icons/apple-touch-icon.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      // iPhone 6+/7+/8+ - 414x736
      {
        url: "/images/icons/apple-touch-icon.png",
        media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone X/XS/11 Pro - 375x812
      {
        url: "/images/icons/apple-touch-icon.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone XR/11 - 414x896
      {
        url: "/images/icons/apple-touch-icon.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
      },
      // iPhone XS Max/11 Pro Max - 414x896
      {
        url: "/images/icons/apple-touch-icon.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone 12/13/14 - 390x844
      {
        url: "/images/icons/apple-touch-icon.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone 12/13/14 Pro Max - 428x926
      {
        url: "/images/icons/apple-touch-icon.png",
        media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone 14 Pro - 393x852
      {
        url: "/images/icons/apple-touch-icon.png",
        media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone 14 Pro Max / 15 Pro Max - 430x932
      {
        url: "/images/icons/apple-touch-icon.png",
        media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone 15 / 16 - 393x852
      {
        url: "/images/icons/apple-touch-icon.png",
        media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: light)",
      },
      // iPhone 16 Pro Max - 440x956
      {
        url: "/images/icons/apple-touch-icon.png",
        media: "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <head>
        {/* iOS PWA Meta Tags & Icons */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="أبونا فلتاؤس" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* iOS Touch Icons for Home Screen (Standard Apple Sizes) */}
        <link rel="apple-touch-icon" href="/images/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/images/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/images/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/images/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/images/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/images/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/images/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/images/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/images/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/images/icons/android-chrome-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/images/icons/android-chrome-512x512.png" />
        <link rel="apple-touch-icon-precomposed" href="/images/icons/apple-touch-icon.png" />
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ReligiousOrganization",
              "name": "أبونا فلتاؤس السرياني",
              "url": baseUrl,
              "image": "https://abona-faltaus.vercel.app/images/logo.webp",
              "description": "الحان وترانيم وعظات والكتاب المقدس ومقالات و امتحانات اسئلة دينية فردية و مجموعات وكل ما يخص الكنيسة الارثوذكسية"
            })
          }}
        />
        <link
          href="https://cdn.jsdelivr.net/npm/@docsearch/css@3"
          rel="stylesheet"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap"
          as="style"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          as="style"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          as="style"
        />
        {process.env.GOOGLE_SITE_VERIFICATION && <meta name="google-site-verification" content={process.env.GOOGLE_SITE_VERIFICATION} />}
        {/* AdSense Script - Optimized */}
        {/* {process.env.GOOGLE_ADSENSE_CLIENT_ID && (
          <Script
            id="adsense-init"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.GOOGLE_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )} */}

        {/* Google Analytics - Optimized */}
        {process.env.GOOGLE_TAG_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_TAG_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.GOOGLE_TAG_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body suppressHydrationWarning={true}>
        <ServiceWorkerRegister />
        <FixProcess />
        <div className="background-blur-overlay" />
        <GlobalLoadingProvider>
          <OfflineNotification />
          <OneSignal />
          <LoadingProvider>
            <PwaManager />
            <Providers>
              <ClientLayoutAnimation>{children}</ClientLayoutAnimation>
            </Providers>
          </LoadingProvider>
        </GlobalLoadingProvider>
        <Analytics />
        <SpeedInsights />
        <Toaster />
      </body>
    </html>
  );
}
