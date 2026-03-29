"use client";
import { useEffect, useState } from "react";
import { Copy, Share2, LogOut, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function AccountInfo() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user || error) {
        console.log("No user found, redirecting...");
        router.push("/auth/signin");
      }
    };

    // استنى ثانية بسيطة عشان السيشن تستقر
    const timeout = setTimeout(checkUser, 500);
    return () => clearTimeout(timeout);
  }, []);
  
  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      } else {
        router.push("/auth/signin");
      }
      setLoading(false);
    };
    getProfile();
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    // 1. رفع الصورة لـ Storage (Bucket اسمه 'avatars')
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error(uploadError);
      setUploading(false);
      return;
    }

    // 2. الحصول على رابط الصورة العام
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // 3. تحديث الداتابيز برابط الصورة الجديد
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

    setProfile({ ...profile, avatar_url: publicUrl });
    setUploading(false);
    setSuccessMsg("تم تحديث الصورة الشخصية");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/signin");
  };

  if (loading) return <div className="flex justify-center p-1"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-md mx-auto p-1 bg-white shadow-lg rounded-2xl border mt-1" dir="rtl">
      {successMsg && (
        <div className="fixed top-4 left-4 bg-green-500 text-white p-1 rounded-md shadow-xl flex gap-1 items-center">
          <span>{successMsg}</span>
          <X size={8} className="cursor-pointer" onClick={() => setSuccessMsg("")} />
        </div>
      )}

      <div className="text-center space-y-1">
        <div className="relative w-12 h-12 mx-auto">
          <Image
            src={profile?.avatar_url || "/images/eagle.webp"}
            alt="Profile"
            fill
            className="rounded-full object-cover border-3 border-amber-100"
          />
        </div>
        <div>
          <h2 className="text-xl font-bold">{profile?.name || "مستخدم جديد"}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="mt-1 space-y-1">
        <div className="text-sm">
          <label className="block font-medium mb-1">تغيير الصورة</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="text-xs" />
        </div>

        <div className="bg-gray-50 p-1 rounded-lg space-y-1 text-sm">
          <div className="flex justify-between"><strong>رقم الحساب:</strong> <span className="text-[10px]">{user?.id}</span></div>
          <div className="flex justify-between"><strong>تاريخ الانضمام:</strong> <span>{new Date(user?.created_at).toLocaleDateString('ar-EG')}</span></div>
        </div>

        <div className="grid grid-cols-2 gap-1">
          <Button onClick={() => { navigator.clipboard.writeText(user.id); setCopied(true); setTimeout(() => setCopied(false), 2000); }} variant="outline" className="text-xs">
            <Copy size={7} className="ml-1" /> {copied ? "تم!" : "نسخ ID"}
          </Button>
          <Button onClick={handleLogout} variant="destructive" className="text-xs">
            <LogOut size={7} className="ml-1" /> خروج
          </Button>
        </div>
      </div>
    </div>
  );
}
