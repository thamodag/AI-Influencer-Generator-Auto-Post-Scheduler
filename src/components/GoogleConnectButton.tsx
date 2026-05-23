import React from "react";
import { LogOut, Eye, ShieldAlert } from "lucide-react";

interface GoogleSession {
  connected: boolean;
  email: string;
  name: string;
  avatar_url: string;
  connected_at: string;
}

interface GoogleConnectButtonProps {
  session: GoogleSession;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnecting?: boolean;
}

export default function GoogleConnectButton({
  session,
  onConnect,
  onDisconnect,
  isConnecting = false
}: GoogleConnectButtonProps) {
  if (session.connected) {
    return (
      <div id="google-connected-panel" className="flex flex-col sm:flex-row sm:items-center gap-4 bg-zinc-900/80 border border-emerald-500/30 p-4 rounded-xl shadow-lg shadow-emerald-500/5">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={session.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200"}
              alt="Google Profile"
              className="w-12 h-12 rounded-full border-2 border-emerald-500 object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-zinc-900 animate-pulse" />
          </div>

          <div className="flex flex-col">
            <span className="text-white text-sm font-semibold tracking-wide">
              {session.name}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              {session.email}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-mono uppercase font-bold tracking-wider">
                Google Active
              </span>
            </div>
          </div>
        </div>

        <button
          id="btn-disconnect-session"
          onClick={onDisconnect}
          className="sm:ml-auto flex items-center justify-center gap-1.5 bg-rose-500/15 hover:bg-rose-650 hover:text-white border border-rose-500/30 text-rose-450 text-xs px-4 py-2 rounded-lg transition-all font-semibold"
        >
          <LogOut size={13} /> Disconnect Account
        </button>
      </div>
    );
  }

  return (
    <div id="google-trigger-block" className="flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20">
      <div className="flex-1 space-y-1">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShieldAlert className="text-yellow-500" size={16} /> Connection Authorization Required
        </h3>
        <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">
          Connect your authorized Google Account credentials to link live metadata channels, synchronize social networks, and unlock model assets generation features.
        </p>
      </div>

      <button
        id="btn-trigger-oauth-start"
        onClick={onConnect}
        disabled={isConnecting}
        className="relative bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 transition-all text-white text-xs font-bold px-6 py-3.5 rounded-xl tracking-widest uppercase shadow-lg shadow-indigo-650/15 flex items-center justify-center gap-2"
      >
        {isConnecting ? (
          "Initiating Secure Link..."
        ) : (
          <>
            <svg className="w-4 h-4 fill-current mr-0.5" viewBox="0 0 24 24">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.693 0-8.51-3.817-8.51-8.51s3.817-8.51 8.51-8.51c2.196 0 4.16.804 5.679 2.128L19.98 1.55C17.92-.375 15.19-.94 12.24-.94c-6.887 0-12.47 5.583-12.47 12.47s5.583 12.47 12.47 12.47c6.16 0 11.231-4.329 11.231-10.457 0-.743-.074-1.423-.198-2.258H12.24z"/>
            </svg>
            Connect Google Account
          </>
        )}
      </button>
    </div>
  );
}
