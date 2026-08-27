import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFoundPage() {
  const t = await getTranslations("Common");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-0.5 p-1 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="opacity-70">{t("appName")}</p>
      <Link href="/" className="underline text-primary">
        {t("back")}
      </Link>
    </div>
  );
}
