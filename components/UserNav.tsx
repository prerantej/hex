'use client';

import { signOut } from "next-auth/react";

export default function UserNav({ handle, role }: { handle?: string; role?: string }) {
  // No SessionProvider needed for signOut; it's a direct POST.
  async function doLogout() {
    try {
      await signOut({ callbackUrl: "/" }); // back to home
    } catch {
      // no-op
    }
  }

  return (
    <div className="flex items-center gap-3">
      {role === "ADMIN" && (
        <a href="/admin/moderation" className="text-sm underline">Admin</a>
      )}
      <span className="text-sm opacity-80">@{handle ?? "you"}</span>
      <button onClick={doLogout} className="btn-secondary text-sm px-2 py-1">
        Log out
      </button>
    </div>
  );
}
