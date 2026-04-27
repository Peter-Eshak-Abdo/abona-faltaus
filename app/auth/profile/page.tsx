'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image'; // Assuming Image component is available or can be added

interface UserProfile {
  id: string;
  username: string;
  profile_picture_url: string | null;
}

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      setLoading(true);
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
        .select('id, username, profile_picture_url')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
      } else {
        setUser(profile);
      }
      setLoading(false);
    };

    getProfile();
  }, [supabase, router]);

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

      // Update profile_picture_url in the profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setUser((prevUser) => prevUser ? { ...prevUser, profile_picture_url: publicUrl } : null);
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-lg text-gray-700">Loading profile...</p></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-lg text-red-500">Error: {error}</p></div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-lg text-gray-700">No user profile found. Please sign in.</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Your Profile</h1>

        <div className="flex flex-col items-center mb-6">
          {user.profile_picture_url ? (
            <Image
              src={user.profile_picture_url}
              alt="Profile Picture"
              width={128}
              height={128}
              className="rounded-full object-cover border-4 border-blue-300"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm">
              No Image
            </div>
          )}
          <p className="mt-4 text-lg font-semibold text-gray-700">{user.username}</p>
        </div>

        <div className="mb-4">
          <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-2">
            Upload New Profile Picture
          </label>
          <input
            type="file"
            id="profilePicture"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
          {uploading && <p className="mt-2 text-sm text-blue-600">Uploading...</p>}
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        {/* Other profile details could go here */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
