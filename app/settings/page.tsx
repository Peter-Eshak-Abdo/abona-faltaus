'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Palette } from "lucide-react"; 
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import OneSignal from 'react-onesignal';

// تعريف أنواع الإشعارات المتاحة
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
  const supabase = createClient();

  // حالات الإشعارات
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [tags, setTags] = useState<Record<string, string>>({});

  const [settings, setSettings] = useState({ displayName: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);

    const initNotifications = async () => {
      if (typeof window !== "undefined") {
        // 1. التحقق من الاشتراك العام
        const optedIn = OneSignal.User.PushSubscription.optedIn;
        setIsOptedIn(!!optedIn);

        // 2. جلب الـ Tags الحالية من OneSignal
        try {
          const currentTags = await OneSignal.User.getTags();
          setTags(currentTags || {});
        } catch (err) {
          console.error("Error fetching tags:", err);
        }
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

    initNotifications();
    loadProfile();
  }, []);

  // دالة التحكم في الاشتراك العام
  const toggleMainSubscription = async () => {
    if (isOptedIn) {
      await OneSignal.User.PushSubscription.optOut();
      setIsOptedIn(false);
      toast.success("تم إيقاف جميع الإشعارات");
    } else {
      await OneSignal.User.PushSubscription.optIn();
      setIsOptedIn(true);
      toast.success("تم تفعيل الإشعارات بنجاح");
    }
  };

  // دالة التحكم في الـ Tags (الأقسام الفرعية)
  const toggleTag = async (tagId: string) => {
    if (!isOptedIn) {
      toast.error("برجاء تفعيل الإشعارات الرئيسية أولاً");
      return;
    }

    const isCurrentlyEnabled = tags[tagId] === 'true';
    const newValue = !isCurrentlyEnabled;

    try {
      // تحديث OneSignal
      await OneSignal.User.addTag(tagId, newValue.toString());

      // تحديث الواجهة محلياً
      setTags(prev => ({ ...prev, [tagId]: newValue.toString() }));

      toast.success(`تم ${newValue ? 'تفعيل' : 'إيقاف'} قسم ${NOTIFICATION_CATEGORIES.find(c => c.id === tagId)?.name}`);
    } catch (err) {
      toast.error("فشل تحديث الإعدادات");
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: settings.displayName }).eq("id", user?.id);
    if (!error) toast.success("تم حفظ البيانات");
    else toast.error("خطأ في الحفظ");
    setSaving(false);
  };

  if (loading || !mounted) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>;

  // لو الصفحة لسه بتعمل Load أو الـ Theme لسه متحددش
  if (loading || !mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-1" dir="rtl">
      <div className="w-full max-w-7xl space-y-1">

        <div className="text-center">
          <h1 className="text-4xl font-bold text-black dark:text-white">الإعدادات</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">تحكم في حسابك وتفضيلاتك</p>
        </div>

        {/* المظهر */}
        <Card className="backdrop-blur-lg bg-white/60 dark:bg-black/40 border-white/40 dark:border-white/10 shadow-xl">
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-blue-500" /> مظهر التطبيق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="font-medium">اختر النمط المفضل</span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-white dark:bg-zinc-800 border rounded-lg p-1 outline-none focus:ring-2 ring-blue-500"
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
            <CardTitle className="flex items-center gap-1"><Bell className="w-5 h-5 text-red-500" /> تفضيلات الإشعارات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {/* المفتاح الرئيسي */}
            <div className="flex items-center justify-between p-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <div>
                <p className="font-bold text-blue-900 dark:text-blue-100">استقبال الإشعارات</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">المفتاح الرئيسي للخدمة</p>
              </div>
              <button
                onClick={toggleMainSubscription}
                className={`w-4 h-2 rounded-full transition-all relative ${isOptedIn ? 'bg-green-500' : 'bg-gray-400'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isOptedIn ? 'left-1' : 'left-7'}`} />
              </button>
            </div>

            {/* الأقسام الفرعية */}
            <div className="grid gap-1 opacity-100 transition-opacity" style={{ opacity: isOptedIn ? 1 : 0.5 }}>
              <p className="text-sm font-semibold text-gray-500 mr-1">تخصيص أنواع الرسائل:</p>
              {NOTIFICATION_CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-1 border-b border-black/5 dark:border-white/5 last:border-0">
                  <div>
                    <p className="font-medium dark:text-gray-200">{cat.name}</p>
                    <p className="text-xs text-gray-500">{cat.desc}</p>
                  </div>
                  <button
                    disabled={!isOptedIn}
                    onClick={() => toggleTag(cat.id)}
                    className={`w-10 h-5 rounded-full transition-all relative ${tags[cat.id] === 'true' && isOptedIn ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${tags[cat.id] === 'true' && isOptedIn ? 'left-1' : 'left-5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* الملف الشخصي */}
        <Card className="backdrop-blur-lg bg-white/60 dark:bg-black/40 border-white/40 dark:border-white/10 shadow-xl">
          <CardHeader><CardTitle className="flex items-center gap-1"><User className="w-5 h-5 text-green-500" /> البيانات الأساسية</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            <div className="space-y-1">
              <Label>الاسم المعروض</Label>
              <Input
                value={settings.displayName}
                onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                className="bg-white/50 dark:bg-black/20"
              />
            </div>
            <div className="space-y-1 text-left" dir="ltr">
              <Label className="block text-right">Email (Read Only)</Label>
              <Input value={settings.email} disabled className="opacity-60" />
            </div>
            <Button onClick={saveProfile} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
