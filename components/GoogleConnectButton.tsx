"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function GoogleConnectButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={session.user?.image || ""}
          className="w-10 h-10 rounded-full border border-purple-500"
        />

        <div className="flex flex-col">
          <span className="text-white text-sm font-medium">
            {session.user?.name}
          </span>

          <span className="text-green-400 text-xs">
            Google Connected
          </span>
        </div>

        <button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="bg-purple-600 hover:bg-purple-700 transition-all text-white px-5 py-3 rounded-2xl shadow-lg shadow-purple-900/30"
    >
      Connect Google Account
    </button>
  );
}
