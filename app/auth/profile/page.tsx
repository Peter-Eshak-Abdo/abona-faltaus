// app/auth/profile/page.tsx
'use client';
export const dynamic = "force-dynamic";

import AccountInfo from '@/components/AccountInfo';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-stone-50/50 dark:bg-zinc-950 flex items-center justify-center p-3">
      <AccountInfo />
    </div>
  );
}
