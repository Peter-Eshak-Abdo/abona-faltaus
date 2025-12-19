import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import Script from "next/script";
import LoadingProvider from "./loading-provider";
import { LoadingProvider as GlobalLoadingProvider } from "./loading-context";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import ClientLayoutAnimation from "@/components/ClientLayoutAnimation";
import { Toaster } from "@/components/ui/sonner";
import LazyLoadOnInteraction from "@/components/LazyLoadOnInteraction";
import FixProcess from "@/components/FixProcess";
import OfflineNotification from "@/components/OfflineNotification";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  display: "swap",
  preload: true,
  weight: ["400", "700"],
  variable: '--font-vazirmatn'
});

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://abona-faltaus.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
        <link
          href="https://cdn.jsdelivr.net/npm/@docsearch/css@3"
          rel="stylesheet"
        />
        {process.env.GOOGLE_SITE_VERIFICATION && <meta name="google-site-verification" content={process.env.GOOGLE_SITE_VERIFICATION} />}
        {/* AdSense Script - Optimized */}
        {process.env.GOOGLE_ADSENSE_CLIENT_ID && (
          <Script
            id="adsense-init"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.GOOGLE_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}

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
        <div className="background-blur" />
        <GlobalLoadingProvider>
          <OfflineNotification />
          <LoadingProvider>
            {process.env.NODE_ENV === "production" && <LazyLoadOnInteraction src="https://cdn.onesignal.com/sdks/OneSignalSDK.js" id="onesignal-sdk" />}
            <ClientLayoutAnimation>{children}</ClientLayoutAnimation>
          </LoadingProvider>
        </GlobalLoadingProvider>
        <Analytics />
        <SpeedInsights />
        <Toaster />
      </body>
    </html>
  );
}
