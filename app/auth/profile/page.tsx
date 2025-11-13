"use client";
export const dynamic = "force-dynamic";

import AccountInfo from "@/components/AccountInfo";
import LogoHeader from "@/components/LogoHeader";

export default function ProfilePage() {
  return (
    <div className="p-1">
      <LogoHeader />
      <AccountInfo />
    </div>
  );
}
