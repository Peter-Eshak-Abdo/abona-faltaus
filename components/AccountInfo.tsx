"use client";
import { useEffect, useState } from "react";
import { Copy, Share2, LogOut, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  updated_at: string;
}

export default function AccountInfo() {
  const supabase = createClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  // const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
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
      // const { data: { user } } = await supabase.auth.getUser();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        return;
      }

      if (!session) {
        router.push('/auth/signin');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles') // Assuming a 'profiles' table with user data
        .select('id, full_name, avatar_url, updated_at')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
      } else {
        setUser({
          id: profile.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          email: session.user.email || '',
          updated_at: profile.updated_at
        });
      }
      setLoading(false);
    };

    // if (user) {
    // setUser(user);
    // const { data } = await supabase
    // .from('profiles')
    // .select('full_name')
    // .eq('id', user.id)
    //  .single();
    // setProfile(data);
    // } else {
    // router.push("/auth/signin");
    // }
    // setLoading(false);
    // };
    getProfile();
  }, [supabase, router]);

  // const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!e.target.files || !user) return;
  //   setUploading(true);
  //   const file = e.target.files[0];
  //   const fileExt = file.name.split('.').pop();
  //   const filePath = `${user.id}/avatar.${fileExt}`;

  //   // 1. رفع الصورة لـ Storage (Bucket اسمه 'avatars')
  //   const { error: uploadError } = await supabase.storage
  //     .from('avatars')
  //     .upload(filePath, file, { upsert: true });

  //   if (uploadError) {
  //     console.error(uploadError);
  //     setUploading(false);
  //     return;
  //   }

  //   // 2. الحصول على رابط الصورة العام
  //   const { data: { publicUrl } } = supabase.storage
  //     .from('avatars')
  //     .getPublicUrl(filePath);

  //   // 3. تحديث الداتابيز برابط الصورة الجديد
  //   await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

  //   setProfile({ ...profile, avatar_url: publicUrl });
  //   setUploading(false);
  //   setSuccessMsg("تم تحديث الصورة الشخصية");
  //   setTimeout(() => setSuccessMsg(""), 3000);
  // };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      setError('You must select an image to upload.');
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    // Ensure user is not null before proceeding
    if (!user) {
      setError('User not loaded. Please try again.');
      return;
    }
    const fileName = `${user.id}-${Math.random()}.${fileExt}`; // Unique file name
    const filePath = `${fileName}`; // Path within the bucket

    setUploading(true);
    setError(null);

    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars') // Assuming an 'avatars' bucket for profile pictures
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update avatar_url in the profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setUser((prevUser) => prevUser ? { ...prevUser, avatar_url: publicUrl } : null);
      alert('Profile picture updated successfully!');

    } catch (error: any) {
      setError(error.message || 'Error uploading file.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/signin");
  };

  if (loading) return <div className="flex justify-center p-1"><Loader2 className="animate-spin" /></div>;

  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-lg text-red-500">Error: {error}</p></div>;

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-lg text-gray-700">No user profile found. Please sign in.</p></div>;

  return (
    <div className="max-w-md mx-auto p-1 mt-7 bg-white shadow-lg rounded-2xl border" dir="rtl">
      {successMsg && (
        <div className="fixed top-4 left-4 bg-green-500 text-white p-1 rounded-md shadow-xl flex gap-1 items-center">
          <span>{successMsg}</span>
          <X size={8} className="cursor-pointer" onClick={() => setSuccessMsg("")} />
        </div>
      )}

      <div className="text-center space-y-1">
        <div className="relative w-12 h-12 mx-auto">
          <div className="flex flex-col items-center mb-1">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt="Profile Picture"
                width={128}
                height={128}
                className="rounded-full object-cover border-4 border-blue-300"
              />
            ) : (
              <div className="w-18 h-18 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm">
                <Image
                  src={user.avatar_url || "/images/eagle.webp"}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover border-3 border-amber-100"
                />
                No Image
              </div>
            )}
            <p className="mt-1 text-lg font-semibold text-gray-700">{user.full_name || "مستخدم جديد"}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-1 space-y-1">
        <div className="text-sm">
          <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">
            Upload New Profile Picture
          </label>
          <input
            type="file"
            id="profilePicture"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
                       file:mr-1 file:py-1 file:px-1
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
          {uploading && <p className="mt-1 text-sm text-blue-600">Uploading...</p>}
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          {/* <label className="block font-medium mb-1">تغيير الصورة</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="text-xs" /> */}
        </div>

        <div className="bg-gray-50 p-1 rounded-lg space-y-1 text-sm">
          <div className="flex justify-between"><strong>رقم الحساب:</strong> <span className="text-[10px]">{user?.id}</span></div>
          <div className="flex justify-between"><strong>تاريخ الانضمام:</strong> <span>{new Date(user?.updated_at).toLocaleDateString('ar-EG')}</span></div>
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
