"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function SessionResetRedirect() {
  useEffect(() => {
    signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0f] text-white">
      <div className="text-center">
        <p className="text-gray-400">Resetting session...</p>
      </div>
    </div>
  );
}
