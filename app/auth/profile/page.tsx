"use client";
export const dynamic = "force-dynamic";

import AccountInfo from "@/components/AccountInfo";

export default function ProfilePage() {
  return (
    <div className="p-4">
      <AccountInfo />
    </div>
  );
}
