// app/auth/profile/page.tsx
'use client';
export const dynamic = "force-dynamic";

import LogoHeader from '@/components/LogoHeader';
import AccountInfo from '@/components/AccountInfo';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <LogoHeader />
      <div className="py-1">
        <AccountInfo />
      </div>
    </div>
  );
}
