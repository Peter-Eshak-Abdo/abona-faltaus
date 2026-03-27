'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface UserSettings {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  language: string;
  theme: string;
  displayName: string;
  email: string;
}

export default function SettingsView() {
  const [user, setUser] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  const supabase = createClient();

  const [settings, setSettings] = useState<UserSettings>({
    notificationsEnabled: true,
    soundEnabled: true,
    language: "ar",
    theme: "light",
    displayName: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUserSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile) {
            setSettings({
              notificationsEnabled: profile.notifications_enabled ?? true,
              soundEnabled: profile.sound_enabled ?? true,
              language: profile.language ?? "ar",
              theme: profile.theme ?? "light",
              displayName: profile.name || user.user_metadata?.full_name || "",
              email: user.email || "",
            });
            if (profile.theme) setTheme(profile.theme);
          }
        } catch (error) {
          console.error("Error loading settings:", error);
        }
      }
      setLoading(false);
    };

    loadUserSettings();
  }, [setTheme]);

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          notifications_enabled: settings.notificationsEnabled,
          sound_enabled: settings.soundEnabled,
          language: settings.language,
          theme: settings.theme,
          name: settings.displayName,
        })
        .eq("id", user.id);

      if (error) throw error;

      setTheme(settings.theme);
      toast.success("تم حفظ الإعدادات بنجاح!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("حدث خطأ في حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: keyof UserSettings, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br flex items-center justify-center p-1" dir="rtl">
      <div className="w-full max-w-4xl space-y-1 backdrop-blur-md bg-white/20 dark:bg-black/30 rounded-2xl p-1 border-white/30 dark:border-white/20 shadow-2xl">
        <div className="text-center mb-1">
          <h1 className="text-3xl font-bold mb-1 text-black drop-shadow-lg">الإعدادات</h1>
          <p className="text-black/90 drop-shadow-md">تخصيص تجربتك في التطبيق</p>
        </div>

        {/* Profile Settings */}
        <Card className="backdrop-blur-md bg-white/20 dark:bg-black/20 shadow-xl/30 inset-shadow-sm border-white/30 dark:border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-1 text-black drop-shadow-md">
              <User className="w-5 h-5" />
              الملف الشخصي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="space-y-1">
              <Label htmlFor="displayName" className="text-black font-semibold">الاسم المعروض</Label>
              <Input
                id="displayName"
                value={settings.displayName}
                onChange={(e) => handleSettingChange("displayName", e.target.value)}
                placeholder="أدخل اسمك"
                className="bg-white/30 border-white/40 text-black placeholder:text-gray-600 font-medium"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-black font-semibold">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                disabled
                className="bg-white/20 border-white/30 text-gray-800 font-medium cursor-not-allowed"
              />
              <p className="text-sm text-black/80">
                لا يمكن تغيير البريد الإلكتروني من هنا
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center pt-1">
          <Button
            onClick={saveSettings}
            disabled={saving}
            size="lg"
            className="p-1 text-lg bg-white/30 hover:bg-white/40 border-white/40 text-black font-bold shadow-xl/30 inset-shadow-sm transition-all"
          >
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>

        {/* User Info */}
        {user && (
          <Card className="mt-1 backdrop-blur-md bg-white/20 dark:bg-black/20 shadow-xl/30 inset-shadow-sm border-white/30 dark:border-white/20">
            <CardHeader>
              <CardTitle className="text-black drop-shadow-md font-semibold">معلومات الحساب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex justify-between items-center border-b border-white/10 pb-1">
                <span className="text-black font-semibold">رقم الحساب (ID):</span>
                <Badge variant="secondary" className="bg-white/30 text-black border-white/40 font-semibold text-xs">{user.id}</Badge>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-1">
                <span className="text-black font-semibold">تاريخ الإنشاء:</span>
                <span className="text-sm text-black/80 font-medium">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG') : 'غير محدد'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black font-semibold">آخر دخول:</span>
                <span className="text-sm text-black/80 font-medium">
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ar-EG') : 'غير محدد'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
