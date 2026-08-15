// app/settings/page.tsx
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bell, Palette, HardDrive, WifiOff } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import OneSignal from 'react-onesignal';
import Link from "next/link";

const NOTIFICATION_CATEGORIES = [
  { id: 'verse_enabled', name: 'آية اليوم', desc: 'استلام آية يومية وأقوال آباء' },
  { id: 'mass_enabled', name: 'تذكير القداسات', desc: 'تنبيهات بمواعيد القداسات والخدمات' },
  { id: 'confession_enabled', name: 'مواعيد الاعتراف', desc: 'تذكير بمواعيد الاعتراف الخاصة بك' },
  { id: 'hymns_enabled', name: 'ألحان وترانيم جديدة', desc: 'إشعار عند إضافة محتوى روحي جديد' },
];

export default function SettingsView() {
  const [user, setUser] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [isOptedIn, setIsOptedIn] = useState(false);
  const [tags, setTags] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState({ displayName: "", email: "" });
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
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
        if (profile) setSettings({ displayName: profile.full_name || user.user_metadata?.full_name || "", email: user.email || "" });
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
        toast.success("تم إيقاف جميع الإشعارات");
        return;
      }

      await OneSignal.Notifications.requestPermission();
      await OneSignal.User.PushSubscription.optIn();

      const optedIn = OneSignal.User.PushSubscription.optedIn;
      setIsOptedIn(!!optedIn);

      if (optedIn) {
        toast.success("تم تفعيل الإشعارات بنجاح");
      } else {
        toast.error("لم يتم تفعيل الإشعارات");
      }
    } catch (error) {
      console.error("Notification permission error:", error);
      toast.error("حدث خطأ أثناء تفعيل الإشعارات");
    }
  };

  const toggleTag = async (tagId: string) => {
    if (!isOptedIn) {
      toast.error("برجاء تفعيل الإشعارات الرئيسية أولاً");
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
      toast.success(`تم ${newValue ? "تفعيل" : "إيقاف"} ${categoryName}`);
    } catch (error) {
      console.error("Tag toggle error:", error);
      setTags(prev => ({ ...prev, [tagId]: String(currentValue) }));
      toast.error("فشل تحديث إعداد الإشعارات");
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: settings.displayName }).eq("id", user?.id);
    if (!error) toast.success("تم حفظ البيانات");
    else toast.error("خطأ في الحفظ");
    setSaving(false);
  };

  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      toast.success("تم مسح الكاش بنجاح");
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
    <div className="min-h-screen bg-transparent flex items-center justify-center p-0.25" dir="rtl">
      <div className="w-full max-w-7xl space-y-0.25">

        <div className="text-center">
          <h1 className="text-4xl font-bold text-black dark:text-white">الإعدادات</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-0.25">تحكم في حسابك وتفضيلاتك</p>
        </div>

        {/* وضع الأوفلاين ومسح الكاش */}
        <Card className="backdrop-blur-lg bg-white/60 dark:bg-black/40 border-white/40 dark:border-white/10 shadow-xl">
          <CardHeader className="pb-0.25">
            <CardTitle className="flex items-center gap-0.25"><HardDrive className="w-3 h-3 text-gray-500" /> التخزين والاتصال</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0.25">
            <div className="flex items-center justify-between p-0.25 rounded-lg bg-gray-100 dark:bg-gray-800">
              <div className="flex items-center gap-0.25">
                <WifiOff className={isOfflineMode ? "text-red-500" : "text-green-500"} />
                <span className="font-medium">حالة الاتصال</span>
              </div>
              <span className={`font-bold ${isOfflineMode ? "text-red-500" : "text-green-500"}`}>
                {isOfflineMode ? "أوفلاين" : "أونلاين"}
              </span>
            </div>
            <Button onClick={clearCache} variant="destructive" className="w-full">
              مسح الذاكرة المؤقتة (Cache)
            </Button>
          </CardContent>
        </Card>

        {/* المظهر */}
        <Card className="backdrop-blur-lg bg-white/60 dark:bg-black/40 border-white/40 dark:border-white/10 shadow-xl">
          <CardHeader className="pb-0.25">
            <CardTitle className="flex items-center gap-0.25"><Palette className="w-3 h-3 text-blue-500" /> مظهر التطبيق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="font-medium">اختر النمط المفضل</span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-white dark:bg-zinc-800 border rounded-lg p-0.25 outline-none focus:ring-2 ring-blue-500"
              >
                <option value="system">تلقائي (النظام)</option>
                <option value="light">مضيء</option>
                <option value="dark">داكن</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* الإشعارات المتقدمة */}
        <Card className="backdrop-blur-lg bg-white/60 dark:bg-black/40 border-white/40 dark:border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-0.25"><Bell className="w-3 h-3 text-red-500" /> تفضيلات الإشعارات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0.25">
            <div className="flex items-center justify-between p-0.25 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <div>
                <p className="font-bold text-blue-900 dark:text-blue-100">استقبال الإشعارات</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">المفتاح الرئيسي للخدمة</p>
              </div>
              <button
                onClick={toggleMainSubscription}
                className={`w-5 h-2 rounded-full transition-all relative ${isOptedIn ? 'bg-green-500' : 'bg-gray-400'}`}
              >
                <span className={`top-1/2 -translate-y-1/2 absolute w-1.5 h-1.5 bg-white rounded-full transition-all ${isOptedIn ? 'left-0.25' : 'right-0.25'}`} />
              </button>
            </div>

            <div className="grid gap-0.25 transition-opacity" style={{ opacity: isOptedIn ? 1 : 0.5 }}>
              <p className="text-sm font-semibold text-gray-500">تخصيص أنواع الرسائل:</p>
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
          <CardHeader><CardTitle className="flex items-center gap-0.25"><User className="w-3 h-3 text-green-500" /> البيانات الأساسية</CardTitle></CardHeader>
          <CardContent className="space-y-0.25">
            <div className="space-y-0.25">
              <Label>الاسم المعروض</Label>
              <Input
                value={settings.displayName}
                onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                className="bg-white/50 dark:bg-black/20"
              />
            </div>
            <div className="space-y-0.25 text-left" dir="ltr">
              <Label className="block text-left">Email (Read Only)</Label>
              <Input value={settings.email} disabled className="opacity-60" />
            </div>
            <Link onClick={saveProfile} href="/" className="w-full flex h-3 rounded-b-full justify-center content-center align-middle bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}</Link>
            {/* <Button onClick={saveProfile} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
