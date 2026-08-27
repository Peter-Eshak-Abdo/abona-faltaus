// app/settings/page.tsx
'use client';

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bell, Palette, HardDrive, WifiOff, Languages } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import OneSignal from 'react-onesignal';
import { Link } from "@/i18n/navigation";
import { FaArrowRight } from "react-icons/fa";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { isRtlLocale } from "@/i18n/routing";
import { useLocale } from "next-intl";

const PRESET_COLORS = [
  { name: 'افتراضي', primary: '#4a0012', secondary: '#735c00' },
  { name: 'ذهبي قبطي', primary: '#d4af37', secondary: '#b8860b' },
  { name: 'رهباني', primary: '#2c3e50', secondary: '#95a5a6' },
  { name: 'أزرق ملكي', primary: '#1a237e', secondary: '#0d47a1' },
];
void PRESET_COLORS;

export default function SettingsView() {
  const t = useTranslations("Settings");
  const tHome = useTranslations("Home");
  const tLang = useTranslations("Language");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const NOTIFICATION_CATEGORIES = useMemo(
    () => [
      { id: 'verse_enabled', name: t("categories.verse.name"), desc: t("categories.verse.desc") },
      { id: 'mass_enabled', name: t("categories.mass.name"), desc: t("categories.mass.desc") },
      { id: 'confession_enabled', name: t("categories.confession.name"), desc: t("categories.confession.desc") },
    ],
    [t],
  );
  const [user, setUser] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [isOptedIn, setIsOptedIn] = useState(false);
  const [tags, setTags] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState({
    displayName: "",
    email: "",
    primaryColor: "",
    secondaryColor: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    setMounted(true);

    const initNotifications = async () => {
      if (typeof window === "undefined") return;

      try {
        const optedIn = OneSignal.User.PushSubscription.optedIn;
        setIsOptedIn(!!optedIn);

        const currentTags = await OneSignal.User.getTags();
        setTags(currentTags || {});
      } catch (err) {
        console.error("Error initializing notifications:", err);
      }
    };

    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, theme_primary, theme_secondary")
          .eq("id", user.id)
          .single();

        const primary = profile?.theme_primary || localStorage.getItem('theme-primary') || "#4a0012";
        const secondary = profile?.theme_secondary || localStorage.getItem('theme-secondary') || "#735c00";

        setSettings({
          displayName: profile?.full_name || user.user_metadata?.full_name || "",
          email: user.email || "",
          primaryColor: primary,
          secondaryColor: secondary
        });
      } else {
        // Guest mode
        setSettings({
          displayName: "زائر",
          email: "",
          primaryColor: localStorage.getItem('theme-primary') || "#4a0012",
          secondaryColor: localStorage.getItem('theme-secondary') || "#735c00"
        });
      }
      setLoading(false);
    };

    const checkOfflineStatus = async () => {
      setIsOfflineMode(!navigator.onLine);
      window.addEventListener('offline', () => setIsOfflineMode(true));
      window.addEventListener('online', () => setIsOfflineMode(false));
    };

    initNotifications();
    loadProfile();
    checkOfflineStatus();
  }, []);

  const toggleMainSubscription = async () => {
    try {
      if (isOptedIn) {
        await OneSignal.User.PushSubscription.optOut();
        setIsOptedIn(!!OneSignal.User.PushSubscription.optedIn);
        toast.success(t("notifOff"));
        return;
      }

      await OneSignal.Notifications.requestPermission();
      await OneSignal.User.PushSubscription.optIn();

      const optedIn = OneSignal.User.PushSubscription.optedIn;
      setIsOptedIn(!!optedIn);

      if (optedIn) {
        toast.success(t("notifOn"));
      } else {
        toast.error(t("notifFail"));
      }
    } catch (error) {
      console.error("Notification permission error:", error);
      toast.error(t("notifError"));
    }
  };

  const toggleTag = async (tagId: string) => {
    if (!isOptedIn) {
      toast.error(t("notifEnableFirst"));
      return;
    }

    const currentValue = tags[tagId] === "true";
    const newValue = !currentValue;

    setTags(prev => ({ ...prev, [tagId]: String(newValue) }));

    try {
      await OneSignal.User.addTag(tagId, String(newValue));
      const updatedTags = await OneSignal.User.getTags();
      setTags(updatedTags || {});

      const categoryName = NOTIFICATION_CATEGORIES.find((cat) => cat.id === tagId)?.name;
      toast.success(`${newValue ? "✓" : "·"} ${categoryName}`);
    } catch (error) {
      console.error("Tag toggle error:", error);
      setTags(prev => ({ ...prev, [tagId]: String(currentValue) }));
      toast.error(t("notifTagFail"));
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: settings.displayName }).eq("id", user?.id);
    if (!error) toast.success(t("saved"));
    else toast.error(t("saveError"));
    setSaving(false);
  };

  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      toast.success(t("cacheCleared"));
    }
  };

  if (loading || !mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-0.25">
      <div className="w-full max-w-7xl space-y-0.25">

        <div className="text-center">
          <Link href="/" className="p-0.5 m-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:bg-zinc-300 transition self-baseline inline-flex">
            <FaArrowRight size={18} className={isRtlLocale(locale) ? "" : "rotate-180"} />
          </Link>
          <h1 className="text-4xl font-bold text-black dark:text-white">{t("title")}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-0.25">{t("subtitle")}</p>
        </div>

        {/* وضع الأوفلاين ومسح الكاش */}
        <Card className="backdrop-blur-lg bg-white/60 dark:bg-black/40 border-white/40 dark:border-white/10 shadow-xl">
          <CardHeader className="pb-0.25">
            <CardTitle className="flex items-center gap-0.25"><HardDrive className="w-3 h-3 text-gray-500" /> {t("storage")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0.25">
            <div className="flex items-center justify-between p-0.25 rounded-lg bg-gray-100 dark:bg-gray-800">
              <div className="flex items-center gap-0.25">
                <WifiOff className={isOfflineMode ? "text-red-500" : "text-green-500"} />
                <span className="font-medium">{t("connectionStatus")}</span>
              </div>
              <span className={`font-bold ${isOfflineMode ? "text-red-500" : "text-green-500"}`}>
                {isOfflineMode ? tCommon("offline") : tCommon("online")}
              </span>
            </div>
            <Button onClick={clearCache} variant="destructive" className="w-full">
              {t("clearCache")}
            </Button>
          </CardContent>
        </Card>

        {/* اللغة */}
        <Card className="backdrop-blur-lg bg-white/60 dark:bg-black/40 border-white/40 dark:border-white/10 shadow-xl">
          <CardHeader className="pb-0.25">
            <CardTitle className="flex items-center gap-0.25"><Languages className="w-3 h-3 text-amber-600" /> {tLang("title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-0.5 flex-wrap">
              <span className="font-medium">{tLang("hint")}</span>
              <LanguageSwitcher />
            </div>
          </CardContent>
        </Card>

        {/* المظهر */}
        <Card className="backdrop-blur-lg bg-white/60 dark:bg-black/40 border-white/40 dark:border-white/10 shadow-xl">
          <CardHeader className="pb-0.25">
            <CardTitle className="flex items-center gap-0.25"><Palette className="w-3 h-3 text-blue-500" /> {t("appearance")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="font-medium">{t("chooseTheme")}</span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-white dark:bg-zinc-800 border rounded-lg p-0.25 outline-none focus:ring-2 ring-blue-500"
              >
                <option value="system">{t("themeSystem")}</option>
                <option value="light">{t("themeLight")}</option>
                <option value="dark">{t("themeDark")}</option>
                <option value="gold">{t("themeGold")}</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* الإشعارات المتقدمة */}
        <Card className="backdrop-blur-lg bg-white/60 dark:bg-black/40 border-white/40 dark:border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-0.25"><Bell className="w-3 h-3 text-red-500" /> {t("notifications")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0.25">
            <div className="flex items-center justify-between p-0.25 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <div>
                <p className="font-bold text-blue-900 dark:text-blue-100">{t("notificationsMain")}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">{t("notificationsMainHint")}</p>
              </div>
              <button
                onClick={toggleMainSubscription}
                className={`w-5 h-2 rounded-full transition-all relative ${isOptedIn ? 'bg-green-500' : 'bg-gray-400'}`}
              >
                <span className={`top-1/2 -translate-y-1/2 absolute w-1.5 h-1.5 bg-white rounded-full transition-all ${isOptedIn ? 'left-0.25' : 'right-0.25'}`} />
              </button>
            </div>

            <div className="grid gap-0.25 transition-opacity" style={{ opacity: isOptedIn ? 1 : 0.5 }}>
              <p className="text-sm font-semibold text-gray-500">{t("notificationsCustomize")}</p>
              {NOTIFICATION_CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-0.25 border-b border-black/5 dark:border-white/5 last:border-0">
                  <div>
                    <p className="font-medium dark:text-gray-200">{cat.name}</p>
                    <p className="text-xs text-gray-500">{cat.desc}</p>
                  </div>
                  <button
                    disabled={!isOptedIn}
                    onClick={() => toggleTag(cat.id)}
                    className={`w-5 h-2 rounded-full transition-all relative ${tags[cat.id] === 'true' && isOptedIn ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                  >
                    <span className={`top-1/2 -translate-y-1/2 absolute w-1.5 h-1.5 bg-white rounded-full transition-all ${tags[cat.id] === 'true' && isOptedIn ? 'left-0.25' : 'right-0.25'}`} />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* الملف الشخصي */}
        <Card className="backdrop-blur-lg bg-white/60 dark:bg-black/40 border-white/40 dark:border-white/10 shadow-xl">
          <CardHeader><CardTitle className="flex items-center gap-0.25"><User className="w-3 h-3 text-green-500" /> {t("profile")}</CardTitle></CardHeader>
          <CardContent className="space-y-0.25">
            <div className="space-y-0.25">
              <Label>{t("displayName")}</Label>
              <Input
                value={settings.displayName}
                onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                className="bg-white/50 dark:bg-black/20"
              />
            </div>
            <div className="space-y-0.25 text-left" dir="ltr">
              <Label className="block text-left">{t("emailReadOnly")}</Label>
              <Input value={settings.email} disabled className="opacity-60" />
            </div>
            <div className="pt-1 border-t border-black/5 dark:border-white/5 space-y-0.5">
              <Link
                href="/auth/profile"
                className="w-full flex h-3 rounded-xl justify-center items-center gap-0.5 border border-amber-700/30 text-amber-900 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-sm font-semibold transition"
              >
                تغيير كلمة المرور / إدارة الحساب
              </Link>
            </div>

            <Button onClick={saveProfile} disabled={saving} className="w-full flex h-3 rounded-xl justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              {saving ? tCommon("saving") : tCommon("save")}
            </Button>

            <div className="flex justify-center gap-0.25 pointer-events-auto flex-wrap">
              <Link href="/privacy" className="hover:underline">{tHome("privacy")}</Link>
              <span>•</span>
              <Link href="/terms" className="hover:underline">{tHome("terms")}</Link>
              <span>•</span>
              <Link href="/about" className="hover:underline">{tHome("about")}</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
