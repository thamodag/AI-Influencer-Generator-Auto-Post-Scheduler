import { useState } from "react";
import { ConnectedAccount, FacebookPage } from "../types";
import { 
  Link2, 
  Facebook, 
  Instagram, 
  Video, 
  Twitter, 
  Check, 
  AlertCircle,
  Plus,
  RefreshCw,
  ExternalLink,
  Lock,
  LockOpen
} from "lucide-react";

interface AccountsViewProps {
  accounts: ConnectedAccount[];
  facebookPages: FacebookPage[];
  onConnectFacebook: (accountName: string, pages: any[]) => void;
  onToggleFacebookPage: (id: string) => void;
}

export default function AccountsView({
  accounts,
  facebookPages,
  onConnectFacebook,
  onToggleFacebookPage
}: AccountsViewProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [simulatedPages, setSimulatedPages] = useState([
    { page_id: "fb_page_aesthetic", name: "Modern Aesthetics Hub", selected: true },
    { page_id: "fb_page_fitness", name: "Aura Gym & Wellness Pro", selected: false },
    { page_id: "fb_page_travel", name: "Wanderlust Destinations Collective", selected: true },
  ]);

  const [partnerName, setPartnerName] = useState("Alex Rivera Professional Admin");

  const handleSimulateOAuthJoin = () => {
    // Collect active permissions list
    const pagesToInject = simulatedPages.map(sp => ({
      page_id: sp.page_id,
      page_name: sp.name,
      page_access_token: `PAT_EAA_${Math.floor(Math.random() * 1000000)}_LIVE`,
      selected: sp.selected
    }));

    onConnectFacebook(partnerName, pagesToInject);
    setShowAuthDialog(false);
  };

  const handleToggleSimulatedSelect = (id: string) => {
    setSimulatedPages(simulatedPages.map(p => 
      p.page_id === id ? { ...p, selected: !p.selected } : p
    ));
  };

  return (
    <div id="social-accounts-page" className="space-y-6 animate-fade-in text-slate-200">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
          <Link2 className="text-indigo-400" size={20} /> Social Accounts Hub
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Link Meta OAuth resources, synchronize verified business Facebook Pages, and authorize autopilot workers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Connection control lists (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-6 space-y-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="text-indigo-400" size={15} /> Authenticate channels
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated publishing requires Meta Business integrations. Connecting your account grants secure page posting scopes.
            </p>

            <div className="space-y-3.5">
              {/* Facebook Page connector */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/5 border border-white/5 rounded-xl gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/10">
                    <Facebook size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">Facebook & Pages</h3>
                    <span className="text-[10px] text-slate-500 font-mono">Status: {accounts.some(a => a.platform === "facebook") ? "Connected" : "Not Linked"}</span>
                  </div>
                </div>
                <button
                  id="btn-oauth-fb"
                  onClick={() => setShowAuthDialog(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Link Facebook pages
                </button>
              </div>

              {/* Instagram Connector */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/5 border border-white/5 rounded-xl gap-4 opacity-70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-600/10 flex items-center justify-center text-pink-400 border border-pink-500/10">
                    <Instagram size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">Instagram Business Feed</h3>
                    <span className="text-[10px] text-slate-500 font-mono">Requires linked Facebook page</span>
                  </div>
                </div>
                <button className="text-slate-400 text-xs font-semibold px-4 py-2 rounded-lg bg-white/5 border border-white/5 cursor-not-allowed">
                  Linked via Meta
                </button>
              </div>

              {/* TikTok Connector */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/5 border border-white/5 rounded-xl gap-4 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-white border border-neutral-700">
                    <Video size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">TikTok Pro Account</h3>
                    <span className="text-[10px] text-slate-500 font-mono">Status: Offline</span>
                  </div>
                </div>
                <button className="bg-white/5 hover:bg-white/10 text-white text-xs font-semibold px-4 py-2 rounded-lg border border-white/10 transition-all cursor-pointer">
                  Setup OAuth
                </button>
              </div>
            </div>
          </div>

          {/* Active List of connected pages */}
          {accounts.length > 0 && (
            <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Active Meta Integrations</h3>
              
              <div className="space-y-3">
                {accounts.map(acc => (
                  <div key={acc.id} className="p-4 bg-white/5 border border-white/5 rounded-lg space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Facebook size={14} className="text-blue-400" /> Connected by {acc.username}
                      </span>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono uppercase">Live Sync</span>
                    </div>

                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold pt-1">Select Active broadcasting pages:</p>
                    
                    <div className="space-y-1.5">
                      {facebookPages.map(page => (
                        <div key={page.id} className="flex justify-between items-center p-2.5 rounded bg-[#060608] border border-white/5">
                          <div className="overflow-hidden">
                            <span className="text-xs font-medium text-white block">{page.page_name}</span>
                            <span className="text-[9px] font-mono text-slate-500 block truncate">{page.page_access_token.slice(0, 24)}...</span>
                          </div>
                          
                          <label className="flex items-center gap-1 cursor-pointer">
                            <span className="text-[10.5px] text-slate-400 mr-2">{page.selected ? "Broadcasting Enabled" : "Ignored"}</span>
                            <input 
                              id={`active-page-sync-${page.id}`}
                              type="checkbox" 
                              checked={page.selected} 
                              onChange={() => onToggleFacebookPage(page.id)}
                              className="rounded border-white/10 text-indigo-600 bg-[#161618] h-4 w-4"
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Security info panel & Meta simulation instructions (5/12) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-5 space-y-3.5">
            <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Meta Developer sandbox scope</h3>
            <p className="text-xs text-indigo-200/80 leading-relaxed font-sans">
              To guarantee seamless sandbox testing pre-production, AI Influencer OS operates in developer verification mode. Connecting simulating profiles grants rapid, valid Facebook Page access tokens.
            </p>
            <div className="text-[10.5px] font-mono text-slate-500 bg-neutral-950 p-2.5 rounded border border-white/5 space-y-1">
              <div className="flex justify-between">
                <span>API version:</span> <span className="text-indigo-400">Graph v19.0</span>
              </div>
              <div className="flex justify-between">
                <span>Webhook triggers:</span> <span className="text-indigo-400">feed_status_update</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-5 text-center text-slate-500 text-xs py-8">
            <RefreshCw size={24} className="mx-auto text-slate-700 mb-2.5 animate-pulse" />
            <p className="font-semibold text-slate-400">Auto Resync Worker</p>
            <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">System performs page access reviews every 24 hours to prevent posting failures caused by token expiration.</p>
          </div>
        </div>

      </div>

      {/* Simulated Facebook Authentication Modal Dialog Overlay */}
      {showAuthDialog && (
        <div id="simulated-meta-oauth" className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111215] border border-white/15 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            {/* Meta Branding Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Facebook className="text-blue-500" size={24} />
                <h2 className="text-sm font-bold text-white tracking-tight">Meta Business Integrations Manager</h2>
              </div>
              <span className="text-[9.5px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded">OAuth 2.0 Flow</span>
            </div>

            {/* Information Body */}
            <div className="space-y-3.5 text-xs text-slate-300">
              <p>
                <strong>AI Influencer Generator</strong> is requesting access to broadcast and coordinate content updates on your linked pages.
              </p>

              <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg space-y-2">
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Select Access Permissions ({simulatedPages.length} Pages Available):</span>
                
                {simulatedPages.map(sp => (
                  <label key={sp.page_id} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-all cursor-pointer">
                    <span className="font-medium text-slate-300 text-xs">{sp.name}</span>
                    <input 
                      id={`simulate-pages-chk-${sp.page_id}`}
                      type="checkbox" 
                      checked={sp.selected} 
                      onChange={() => handleToggleSimulatedSelect(sp.page_id)}
                      className="rounded text-blue-600 bg-neutral-950 border-white/10 h-4 w-4"
                    />
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 font-semibold">User Identity Reference (Simulated)</label>
                <input 
                  id="input-partner-name"
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 p-2.5 rounded text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Simulated Buttons actions */}
            <div className="flex justify-end gap-3.5 pt-2">
              <button
                id="btn-oauth-cancel"
                onClick={() => setShowAuthDialog(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-all cursor-pointer"
              >
                Cancel permissions
              </button>
              <button
                id="btn-oauth-submit"
                onClick={handleSimulateOAuthJoin}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/20 flex items-center gap-1 cursor-pointer"
              >
                Accept & Authorize
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
