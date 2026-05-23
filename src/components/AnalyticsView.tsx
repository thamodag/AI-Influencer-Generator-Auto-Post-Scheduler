import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { GeneratedPost, ScheduledPost, AIModel } from "../types";
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Calendar, 
  Flame, 
  Users, 
  Zap, 
  Eye, 
  Award,
  ArrowUpRight
} from "lucide-react";

interface AnalyticsViewProps {
  posts: GeneratedPost[];
  scheduledPosts: ScheduledPost[];
  models: AIModel[];
}

export default function AnalyticsView({
  posts,
  scheduledPosts,
  models
}: AnalyticsViewProps) {
  // Mock statistical aggregations over time
  const viewsGrowthData = [
    { name: "Mon", postsPublished: 2, impressions: 4500, engagement: 250 },
    { name: "Tue", postsPublished: 4, impressions: 9800, engagement: 820 },
    { name: "Wed", postsPublished: 5, impressions: 16500, engagement: 1400 },
    { name: "Thu", postsPublished: 3, impressions: 24000, engagement: 2900 },
    { name: "Fri", postsPublished: 8, impressions: 38200, engagement: 4100 },
    { name: "Sat", postsPublished: 12, impressions: 59000, engagement: 5800 },
    { name: "Sun", postsPublished: 15, impressions: 84300, engagement: 7920 },
  ];

  const channelBreakoutData = [
    { platform: "Instagram", value: 45 },
    { platform: "Facebook", value: 35 },
    { platform: "TikTok", value: 15 },
    { platform: "Twitter/X", value: 5 },
  ];

  // Calculated metrics
  const totalPostsCount = posts.length + 8; // Including pre-seeded mock history
  const activeSchedulesCount = scheduledPosts.filter(s => s.status === "pending").length;
  const publishedSchedulesCount = scheduledPosts.filter(s => s.status === "published").length + 14;

  const totalModelsCount = models.length;

  return (
    <div id="analytics-studio-page" className="space-y-6 animate-fade-in text-slate-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="text-indigo-400" size={20} /> Analytics Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track visual engagement performance metrics, monitor channel growth statistics, and evaluate model virality.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#0c0c0e]/95 border border-white/10 px-3 py-1.5 rounded-lg text-xs">
          <span className="text-slate-500 font-medium">Automatic reporting:</span>
          <span className="text-indigo-400 font-semibold font-mono">Syncs Realtime (GMT)</span>
        </div>
      </div>

      {/* KPI Cards Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Shoots */}
        <div className="bg-[#0c0c0e] border border-white/10 p-5 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs uppercase tracking-wider font-semibold">AI Shoot Assets</span>
            <Flame size={16} className="text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{totalPostsCount}</span>
            <span className="text-[10px] text-emerald-400 font-semibold font-mono flex items-center gap-0.5"><ArrowUpRight size={10} /> +12%</span>
          </div>
          <p className="text-[10px] text-slate-500">Direct consistency locks active</p>
        </div>

        {/* Total Campaigns */}
        <div className="bg-[#0c0c0e] border border-white/10 p-5 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Active Scheduled</span>
            <Calendar size={16} className="text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{activeSchedulesCount}</span>
            <span className="text-[10px] text-indigo-400 font-bold font-mono">Autopilot ON</span>
          </div>
          <p className="text-[10px] text-slate-500">Queued in automation index</p>
        </div>

        {/* Published Posts */}
        <div className="bg-[#0c0c0e] border border-white/10 p-5 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Successful Posts</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{publishedSchedulesCount}</span>
            <span className="text-[10px] text-emerald-400 font-semibold font-mono flex items-center gap-0.5"><ArrowUpRight size={10} /> +24.5%</span>
          </div>
          <p className="text-[10px] text-slate-500">Relayed to Facebook & feeds</p>
        </div>

        {/* Unique Personas */}
        <div className="bg-[#0c0c0e] border border-white/10 p-5 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Unique Personas</span>
            <Users size={16} className="text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{totalModelsCount}</span>
            <span className="text-[10px] text-slate-500 font-mono">Identities active</span>
          </div>
          <p className="text-[10px] text-slate-500">Housed in Models Studio</p>
        </div>

      </div>

      {/* Recharts Graphs section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Main Area Graph (8/12) */}
        <div className="lg:col-span-8 bg-[#0c0c0e] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Weekly impressions Growth</h3>
              <p className="text-[10px] text-slate-500">Consolidated impressions breakout from Page autopilot updates</p>
            </div>
            <TrendingUp size={16} className="text-indigo-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewsGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="impressionsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0c0c0e", borderColor: "#27272a" }} />
                <Area type="monotone" dataKey="impressions" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#impressionsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakouts side-panel (4/12) */}
        <div className="lg:col-span-4 bg-[#0c0c0e] border border-white/10 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Platform Breakout %</h3>
            
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelBreakoutData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="platform" type="category" stroke="#71717a" fontSize={10} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: "#0c0c0e", borderColor: "#27272a" }} />
                  <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/5 rounded-lg">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Award size={13} className="text-amber-500" /> Influencer Performance Highlight
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              Posts generated utilizing premium custom scene presets with <strong>9:16 aspect ratio</strong> yields an estimated <strong>35% higher impressions rate</strong>.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
