import React, { useState } from "react";
import { 
  Settings, 
  User, 
  Cpu, 
  Lock, 
  Zap, 
  HardDrive, 
  RefreshCw, 
  Check, 
  HelpCircle,
  FileCode
} from "lucide-react";

interface SettingsViewProps {
  user: { name: string; email: string; avatar_url: string } | null;
  onUpdateUser: (name: string, email: string) => void;
}

export default function SettingsView({ user, onUpdateUser }: SettingsViewProps) {
  const [name, setName] = useState(user?.name || "Alex Rivera");
  const [email, setEmail] = useState(user?.email || "alex@studio-ai.com");
  const [creditsThreshold, setCreditsThreshold] = useState("50");
  const [selectedEngine, setSelectedEngine] = useState("gemini-3.5-flash");
  const [isSaving, setIsSaving] = useState(false);
  const [saveBanner, setSaveBanner] = useState("");

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    onUpdateUser(name, email);
    
    setTimeout(() => {
      setIsSaving(false);
      setSaveBanner("Profile presets synchronized successfully!");
      setTimeout(() => setSaveBanner(""), 3000);
    }, 600);
  };

  return (
    <div id="settings-page" className="space-y-6 animate-fade-in text-slate-200">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
          <Settings className="text-indigo-400" size={20} /> System Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure API endpoints, adjust default system generation properties, and save dashboard accounts profile details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Profile Setup Forms (7/12) */}
        <div className="lg:col-span-7 bg-[#0c0c0e] border border-white/10 rounded-xl p-6 space-y-6">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Profile & Security Settings</h2>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 mb-1.5">Your Full Name</label>
                <input 
                  id="settings-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 p-2.5 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1.5">Synchronized Email</label>
                <input 
                  id="settings-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 p-2.5 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs text-slate-500 mb-1.5">Autopilot credits Threshold warning</label>
              <select 
                id="select-credits-thresh"
                value={creditsThreshold}
                onChange={(e) => setCreditsThreshold(e.target.value)}
                className="bg-white/5 border border-white/10 p-2.5 rounded-lg text-xs text-white focus:outline-none w-32"
              >
                <option value="10">10 Credits</option>
                <option value="50">50 Credits</option>
                <option value="100">100 Credits</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1.5">Receive warnings before autopilot scheduler pauses due to low credit balance.</p>
            </div>

            {saveBanner && (
              <div id="notice-settings-local" className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded text-center">
                {saveBanner}
              </div>
            )}

            <button
              id="btn-save-profile"
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              {isSaving ? "Syncing..." : "Save Preferences"}
            </button>
          </form>

          {/* Engine select block */}
          <div className="pt-5 border-t border-white/5 space-y-3 text-xs">
            <h3 className="font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="text-indigo-400" size={14} /> Default Translation & Copywriting Engine
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <label className="p-3 bg-[#060608] border border-indigo-500/30 rounded-lg flex items-center justify-between cursor-pointer">
                <div>
                  <span className="block font-semibold text-white">Gemini 3.5 Flash</span>
                  <span className="block text-[10px] text-slate-500">Low-latency high precision copywriting</span>
                </div>
                <input 
                  type="radio" 
                  checked={selectedEngine === "gemini-3.5-flash"} 
                  onChange={() => setSelectedEngine("gemini-3.5-flash")} 
                  className="text-indigo-600" 
                />
              </label>

              <label className="p-3 bg-[#060608] border border-white/5 rounded-lg flex items-center justify-between opacity-60 cursor-not-allowed">
                <div>
                  <span className="block font-semibold text-white">Gemini 3.1 Pro (Paid)</span>
                  <span className="block text-[10px] text-slate-500">Extra thick multi-turn contextual reasoner</span>
                </div>
                <input 
                  type="radio" 
                  disabled 
                  checked={selectedEngine === "gemini-3.1-pro"} 
                  className="text-indigo-600" 
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right side Info panels (5/12) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">
              <Lock className="text-indigo-400" size={13} /> Safe API Management Key
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Credentials are kept completely encrypted and secure within server-side environments. Third-party integrations (like Meta API keys and Unsplash headshot references) never touch client bundles.
            </p>

            <div className="p-3.5 bg-neutral-950 border border-white/5 rounded-lg font-mono text-[10.5px] text-slate-500 leading-normal space-y-0.5">
              <div className="text-indigo-400 font-bold uppercase tracking-wider text-[9px] mb-1">Active Credentials:</div>
              <div className="flex justify-between">
                <span>GEMINI_API_KEY:</span> <span className="text-slate-400">•••••••••••</span>
              </div>
              <div className="flex justify-between">
                <span>META_CLIENT_ID:</span> <span className="text-slate-400">•••••••••••</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-5 flex items-center gap-3">
            <HardDrive size={24} className="text-slate-500" />
            <div className="text-xs">
              <span className="block font-semibold text-white">Local Database Storage</span>
              <span className="block text-[10px] text-slate-500 mt-0.5">SQLite database successfully provisioned on server instance.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
