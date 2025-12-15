'use client';

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { getFirebaseServices } from "@/lib/firebase";
import { doc, getDoc, updateDoc, Firestore } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Moon, Sun, Volume2, VolumeX, Globe, User, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Auth } from 'firebase/auth';

interface UserSettings {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  language: string;
  theme: string;
  displayName: string;
  email: string;
}

function SettingsView({ auth, db }: { auth: Auth, db: Firestore }) {
  const [user] = useAuthState(auth);
  const { theme, setTheme } = useTheme();
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
    if (user) {
      loadUserSettings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserSettings = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user!.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSettings({
          notificationsEnabled: userData.notificationsEnabled ?? true,
          soundEnabled: userData.soundEnabled ?? true,
          language: userData.language ?? "ar",
          theme: userData.theme ?? "light",
          displayName: userData.name || user!.displayName || "",
          email: user!.email || "",
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        notificationsEnabled: settings.notificationsEnabled,
        soundEnabled: settings.soundEnabled,
        language: settings.language,
        theme: settings.theme,
        name: settings.displayName,
      });

      // Update theme
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
    <div className="min-h-screen bg-linear-to-br flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-2 backdrop-blur-md bg-white/20 dark:bg-black/30 rounded-2xl p-1 border-white/30 dark:border-white/20 shadow-2xl">
        <div className="text-center mb-3">
          <h1 className="text-3xl font-bold mb-2 text-black drop-shadow-lg">الإعدادات</h1>
          <p className="text-black/90 drop-shadow-md">تخصيص تجربتك في التطبيق</p>
        </div>

        {/* Profile Settings */}
        <Card className="backdrop-blur-md bg-white/20 dark:bg-black/20 shadow-xl/30 inset-shadow-sm border-white/30 dark:border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black drop-shadow-md">
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
                className="bg-white/20 border-white/30 text-gray-800 font-medium"
              />
              <p className="text-sm text-black/80">
                لا يمكن تغيير البريد الإلكتروني من هنا
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card className="backdrop-blur-md bg-white/20 dark:bg-black/20 shadow-xl/30 inset-shadow-sm border-white/30 dark:border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-1 text-black drop-shadow-md">
              <Bell className="w-5 h-5" />
              الإشعارات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-black font-semibold">تفعيل الإشعارات</Label>
                <p className="text-sm text-black/80">
                  تلقي إشعارات يومية من الآيات والعظات
                </p>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) => handleSettingChange("notificationsEnabled", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-black font-semibold">الأصوات</Label>
                <p className="text-sm text-black/80">
                  تشغيل الأصوات في التطبيق
                </p>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => handleSettingChange("soundEnabled", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="backdrop-blur-md bg-white/20 dark:bg-black/20 shadow-xl/30 inset-shadow-sm border-white/30 dark:border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black drop-shadow-md">
              {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              المظهر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="space-y-1">
              <Label className="text-black font-semibold">السمة</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant={settings.theme === "light" ? "default" : "outline"}
                  onClick={() => handleSettingChange("theme", "light")}
                  className="flex-1 bg-white/30 hover:bg-white/40 border-white/40 text-black font-semibold"
                >
                  <Sun className="w-4 h-4 mr-2" />
                  فاتح
                </Button>
                <Button
                  variant={settings.theme === "dark" ? "default" : "outline"}
                  onClick={() => handleSettingChange("theme", "dark")}
                  className="flex-1 bg-white/30 hover:bg-white/40 border-white/40 text-black font-semibold"
                >
                  <Moon className="w-4 h-4 mr-2" />
                  داكن
                </Button>
                <Button
                  variant={settings.theme === "system" ? "default" : "outline"}
                  onClick={() => handleSettingChange("theme", "system")}
                  className="flex-1 bg-white/30 hover:bg-white/40 border-white/40 text-black font-semibold"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  النظام
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card className="backdrop-blur-md bg-white/20 dark:bg-black/20 shadow-xl/30 inset-shadow-sm border-white/30 dark:border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black drop-shadow-md">
              <Globe className="w-5 h-5" />
              اللغة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-black font-semibold">لغة التطبيق</Label>
              <div className="flex gap-2">
                <Button
                  variant={settings.language === "ar" ? "default" : "outline"}
                  onClick={() => handleSettingChange("language", "ar")}
                  className="flex-1 bg-white/30 hover:bg-white/40 border-white/40 text-black font-semibold"
                >
                  العربية
                </Button>
                <Button
                  variant={settings.language === "en" ? "default" : "outline"}
                  onClick={() => handleSettingChange("language", "en")}
                  className="flex-1 bg-white/30 hover:bg-white/40 border-white/40 text-black font-semibold"
                >
                  English
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center pt-2">
          <Button
            onClick={saveSettings}
            disabled={saving}
            size="lg"
            className="px-8 bg-white/30 hover:bg-white/40 border-white/40 text-black font-semibold shadow-xl/30 inset-shadow-sm"
          >
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>

        {/* User Info */}
        {user && (
          <Card className="mt-2 backdrop-blur-md bg-white/20 dark:bg-black/20 shadow-xl/30 inset-shadow-sm border-white/30 dark:border-white/20">
            <CardHeader>
              <CardTitle className="text-black drop-shadow-md font-semibold">معلومات الحساب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex justify-between">
                <span className="text-black font-semibold">رقم الحساب:</span>
                <Badge variant="secondary" className="bg-white/30 text-black border-white/40 font-semibold">{user.uid}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-black font-semibold">تاريخ الإنشاء:</span>
                <span className="text-sm text-black/80 font-medium">
                  {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('ar-EG') : 'غير محدد'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black font-semibold">آخر دخول:</span>
                <span className="text-sm text-black/80 font-medium">
                  {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString('ar-EG') : 'غير محدد'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


export default function SettingsPage() {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);

  useEffect(() => {
    const { auth, db } = getFirebaseServices();
    setAuth(auth);
    setDb(db);
  }, []);

  if (!auth || !db) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <SettingsView auth={auth} db={db} />;
}
