import { useState } from "react";
import { 
  Home, 
  Users, 
  Tv, 
  PlusSquare, 
  Calendar, 
  Link2, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Sparkles,
  Zap
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  user: { name: string; email: string; avatar_url: string } | null;
}

export default function Sidebar({ currentView, onViewChange, user }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "home", label: "Home", icon: Home, category: "Platform" },
    { id: "models", label: "Models Studio", icon: Users, category: "Platform" },
    { id: "generator", label: "Flow Generator", icon: Tv, category: "Platform" },
    { id: "create-post", label: "Create Post", icon: PlusSquare, category: "Platform" },
    { id: "calendar", label: "Calendar & Schedule", icon: Calendar, category: "Platform" },
    { id: "accounts", label: "Social Accounts", icon: Link2, category: "Platform" },
    { id: "analytics", label: "Analytics Studio", icon: BarChart3, category: "Reports" },
    { id: "settings", label: "Settings", icon: Settings, category: "Reports" },
  ];

  return (
    <>
      {/* Mobile Menu Button Overlay */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button 
          id="btn-mobile-menu"
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-neutral-200 hover:text-white"
        >
          {isOpen ? <X id="icon-close" size={20} /> : <Menu id="icon-menu" size={20} />}
        </button>
      </div>

      {/* Sidebar Layout */}
      <aside 
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0d0d0f] border-r border-white/10 p-6 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col gap-6">
          {/* Platform Identity Branding Header */}
          <div id="sidebar-branding" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">
              <span className="text-sm font-sans">AI</span>
            </div>
            <div>
              <span className="font-semibold tracking-tight text-white block">Influencer OS</span>
              <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block">Pro Platform</span>
            </div>
          </div>

          <div className="h-px bg-white/5 my-1" />

          {/* Navigation Items categorized by Design HTML */}
          <nav id="sidebar-nav" className="flex-1 space-y-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 mt-2 ml-2 font-semibold">Platform & Generation</div>
              <div className="space-y-1">
                {menuItems.filter(item => item.category === "Platform").map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      id={`nav-item-${item.id}`}
                      key={item.id}
                      onClick={() => {
                        onViewChange(item.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 relative ${
                        isActive 
                          ? "bg-white/5 text-indigo-400 border border-white/10" 
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      }`}
                    >
                      <Icon size={15} className={`${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 mt-4 ml-2 font-semibold">Reports & Config</div>
              <div className="space-y-1">
                {menuItems.filter(item => item.category === "Reports").map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      id={`nav-item-${item.id}`}
                      key={item.id}
                      onClick={() => {
                        onViewChange(item.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 relative ${
                        isActive 
                          ? "bg-white/5 text-indigo-400 border border-white/10" 
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      }`}
                    >
                      <Icon size={15} className={`${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        {/* Live Active Profile Workspace Footer */}
        <div id="sidebar-user" className="p-3 border-t border-white/5 flex items-center gap-3 mt-auto">
          <img 
            id="user-avatar"
            src={user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100"} 
            alt="User avatar" 
            className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 flex-shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden">
            <div className="text-xs font-medium text-white truncate">{user?.name || "Alex Rivera"}</div>
            <div className="text-[10px] text-slate-500 truncate">{user?.email || "alex@studio-ai.com"}</div>
          </div>
        </div>
      </aside>
    </>
  );
}
