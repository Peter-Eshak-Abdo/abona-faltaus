import type { Metadata, Viewport } from "next";
import { Vazirmatn, Plus_Jakarta_Sans, Libre_Caslon_Text } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import LoadingProvider from "../loading-provider";
import { LoadingProvider as GlobalLoadingProvider } from "../loading-context";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import ClientLayoutAnimation from "@/components/ClientLayoutAnimation";
import { Toaster } from "@/components/ui/sonner";
import FixProcess from "@/components/FixProcess";
import OfflineNotification from "@/components/OfflineNotification";
import PwaManager from "@/components/PwaManager";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import OneSignal from "@/components/OneSignal";
import { Providers } from "../providers";
import { routing, htmlLang, isRtlLocale } from "@/i18n/routing";
import { LocaleSync } from "@/components/LocaleSync";
import UnifiedGlobalHeader from "@/components/navigation/UnifiedGlobalHeader";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500", "700"],
  variable: "--font-vazirmatn",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
  variable: "--font-plus-jakarta",
});

const libreCaslon = Libre_Caslon_Text({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
  variable: "--font-libre-caslon",
});

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

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
  title: "أبونا فلتاؤس تفاحة",
  description:
    "الحان وترانيم وعظات والكتاب المقدس ومقالات و امتحانات اسئلة دينية فردية و مجموعات وكل ما يخص الكنيسة الارثوذكسية",
  keywords: [
    "الحان",
    "عظات",
    "وعظات",
    "ترانيم",
    "مقالات دينية",
    "امتحانات",
    "اسئلة دينية",
    "ابونا فلتاؤس السرياني",
    "الكتاب المقدس",
    "كنيسة",
    "ارثوذكسية",
    "تفاحة",
  ],
  authors: [{ name: "Peter Eshak Abdo", url: baseUrl }],
  creator: "Peter Eshak Abdo",
  icons: {
    icon: "/images/icons/favicon.ico",
    apple: "/images/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "أبونا فلتاؤس تفاحة",
    description:
      "الحان وترانيم وعظات والكتاب المقدس ومقالات و امتحانات اسئلة دينية فردية و مجموعات وكل ما يخص الكنيسة الارثوذكسية.",
    url: baseUrl,
    siteName: "Abona Faltaus",
    images: [
      {
        url: "/images/icons/favicon.ico",
        width: 1200,
        height: 630,
        alt: "أبونا فلتاؤس تفاحة",
      },
    ],
    locale: "ar_EG",
    type: "website",
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
      {
        url: "/images/icons/apple-touch-icon.png",
        media:
          "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/images/icons/apple-touch-icon.png",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/images/icons/apple-touch-icon.png",
        media:
          "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/images/icons/apple-touch-icon.png",
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/images/icons/apple-touch-icon.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/images/icons/apple-touch-icon.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/images/icons/apple-touch-icon.png",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/images/icons/apple-touch-icon.png",
        media:
          "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/images/icons/apple-touch-icon.png",
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/images/icons/apple-touch-icon.png",
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/images/icons/apple-touch-icon.png",
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: light)",
      },
      {
        url: "/images/icons/apple-touch-icon.png",
        media:
          "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";
  const lang = htmlLang(locale);

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${vazirmatn.variable} ${plusJakarta.variable} ${libreCaslon.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="أبونا فلتاؤس" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="format-detection" content="telephone=no" />

        <link rel="apple-touch-icon" href="/images/icons/apple-touch-icon.png" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/images/icons/apple-touch-icon.png"
        />
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ReligiousOrganization",
              name: "أبونا فلتاؤس السرياني",
              url: baseUrl,
              image: "https://abona-faltaus.vercel.app/images/logo.webp",
              description:
                "الحان وترانيم وعظات والكتاب المقدس ومقالات و امتحانات اسئلة دينية فردية و مجموعات وكل ما يخص الكنيسة الارثوذكسية",
            }),
          }}
        />
        <link
          href="https://cdn.jsdelivr.net/npm/@docsearch/css@3"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Coptic&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        {process.env.GOOGLE_SITE_VERIFICATION && (
          <meta
            name="google-site-verification"
            content={process.env.GOOGLE_SITE_VERIFICATION}
          />
        )}
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
      <body
        suppressHydrationWarning={true}
        className={
          locale === "en"
            ? "font-sans-en"
            : locale === "cop"
              ? "font-coptic-ui"
              : "font-sans-ar"
        }
      >
        <NextIntlClientProvider messages={messages}>
          <ServiceWorkerRegister />
          <FixProcess />
          <div className="background-blur-overlay" />
          <GlobalLoadingProvider>
            <OfflineNotification />
            <OneSignal />
            <LoadingProvider>
              <PwaManager />
              <Providers>
                <LocaleSync />
                {/* <UnifiedGlobalHeader /> */}
                <ClientLayoutAnimation>{children}</ClientLayoutAnimation>
              </Providers>
            </LoadingProvider>
          </GlobalLoadingProvider>
          <Analytics />
          <SpeedInsights />
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
