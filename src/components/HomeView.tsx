import { AIModel, GeneratedPost, ScheduledPost } from "../types";
import { 
  Users, 
  Tv, 
  Calendar, 
  Sparkles, 
  Grid, 
  CheckCircle2, 
  Hourglass, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock
} from "lucide-react";

interface HomeViewProps {
  models: AIModel[];
  posts: GeneratedPost[];
  scheduled: ScheduledPost[];
  onViewChange: (view: string) => void;
  onDeletePost: (id: string) => void;
}

export default function HomeView({ models, posts, scheduled, onViewChange, onDeletePost }: HomeViewProps) {
  const publishedCount = posts.filter(p => p.status === "published").length + 14; // including pre-seed metrics
  const scheduledCount = scheduled.filter(s => s.status === "pending").length;

  // Find next upcoming scheduled post
  const upcomingSchedule = scheduled
    .filter(s => s.status === "pending" && new Date(s.scheduled_time) > new Date())
    .sort((a,b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())[0];

  const upcomingPost = upcomingSchedule 
    ? posts.find(p => p.id === upcomingSchedule.post_id) 
    : null;

  return (
    <div id="home-dashboard" className="space-y-6 animate-fade-in text-slate-200">
      {/* Premium Hero Greeting */}
      <div id="hero-greeting" className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0f] p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-500/10 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
            <Sparkles size={11} /> AUTOPILOT ENGINE ACTIVE
          </span>
          <h1 className="text-2xl md:text-3.5xl font-semibold tracking-tight text-white leading-tight">
            Consistency Locked. Feeds Scheduled. <span className="text-indigo-400 block sm:inline font-bold">Autopilot Engaged.</span>
          </h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-sans">
            Maintain perfect physical headshot identities using face tokens. Trigger high quality AI photography presets, generate captions with Gemini, select linked Facebook Pages, and authorize autopilot queues.
          </p>

          <div className="flex flex-wrap gap-3 pt-3">
            <button 
              id="hero-btn-generator"
              onClick={() => onViewChange("generator")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={13} /> Trigger Shoot Camera
            </button>
            <button 
              id="hero-btn-models"
              onClick={() => onViewChange("models")}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Users size={13} /> Edit Personas
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Key Performance Metrics Grid */}
      <div id="metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#0c0c0e] p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
            <Users size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Influencer Models</p>
            <h3 className="text-xl font-bold text-white mt-1">{models.length}</h3>
          </div>
        </div>

        <div className="bg-[#0c0c0e] p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
            <Tv size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Generated Posts</p>
            <h3 className="text-xl font-bold text-white mt-1">{posts.length}</h3>
          </div>
        </div>

        <div className="bg-[#0c0c0e] p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Queue</p>
            <h3 className="text-xl font-bold text-white mt-1">{scheduledCount}</h3>
          </div>
        </div>

        <div className="bg-[#0c0c0e] p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-4">
          <div className="p-3 rounded-lg bg-[#060608] text-emerald-400 border border-white/5">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Published Posts</p>
            <h3 className="text-xl font-bold text-white mt-1">{publishedCount}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Live Post Schedule Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-5 rounded-xl border border-white/10 bg-[#0c0c0e] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h2 className="text-xs font-semibold tracking-wide text-slate-300 flex items-center gap-1.5 uppercase">
                <Clock size={14} className="text-indigo-400" /> Auto-Publish Watch
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Scheduler worker listening" />
            </div>

            {upcomingPost && upcomingSchedule ? (
              <div id="upcoming-scheduler-info" className="space-y-4 pt-1">
                <div className="relative rounded-lg overflow-hidden border border-white/5 bg-neutral-950">
                  <img 
                    src={upcomingPost.image_urls[0] || "https://picsum.photos/400/300"} 
                    alt="Next publication visual candidate" 
                    className="w-full h-36 object-cover brightness-75"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-600 text-[8.5px] font-semibold text-white tracking-wider uppercase mb-1">
                      {upcomingSchedule.platform}
                    </span>
                    <h4 className="text-[11px] text-white line-clamp-1">{upcomingPost.prompt}</h4>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs p-3 rounded-lg bg-[#060608] border border-white/5">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Hourglass size={11} className="text-indigo-400" /> Scheduled Timing
                  </span>
                  <span className="font-mono text-white text-[11px]">
                    {new Date(upcomingSchedule.scheduled_time).toLocaleString()}
                  </span>
                </div>

                <button 
                  id="btn-inspect-queue"
                  onClick={() => onViewChange("calendar")}
                  className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  Inspect Full Queue <ChevronRight size={14} />
                </button>
              </div>
            ) : (
              <div id="no-scheduled-warning" className="py-8 text-center space-y-3">
                <Hourglass size={24} className="mx-auto text-slate-700 animate-spin" style={{ animationDuration: '6s' }} />
                <p className="text-xs text-slate-500">No pending automated publications.</p>
                <button 
                  id="btn-schedule-something"
                  onClick={() => onViewChange("create-post")}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/5 hover:border-white/15 text-xs text-slate-300 transition-all cursor-pointer"
                >
                  Create active post
                </button>
              </div>
            )}
          </div>

          {/* Quick Engine Status / Connected Handles Summary */}
          <div className="p-5 rounded-xl border border-white/10 bg-[#0c0c0e] space-y-4">
            <h2 className="text-xs font-semibold tracking-wide text-white uppercase flex items-center gap-2">
              <TrendingUp size={14} className="text-indigo-400" /> Pipeline Services
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#060608] border border-white/5">
                <span className="text-slate-500">Gemini Assistant Copywriter</span>
                <span className="text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" /> Connected
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#060608] border border-white/5">
                <span className="text-slate-500">Image Rendering Engine</span>
                <span className="text-indigo-400 font-medium text-[11px] flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-indigo-500" /> Curation active
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#060608] border border-white/5">
                <span className="text-slate-500">Meta Graph Webhook Gateway</span>
                <span className="text-indigo-400 font-medium text-[11px] flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" /> Sandbox Mode
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Generations & Quick Delete / Captions inspect */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-white/10 bg-[#0c0c0e] space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h2 className="text-xs font-semibold tracking-wide text-white uppercase flex items-center gap-1.5">
              <Grid size={14} className="text-indigo-400" /> Recent Shoot History
            </h2>
            <button 
              id="btn-show-generator"
              onClick={() => onViewChange("generator")}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
            >
              Camera Workspace <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-4">
            {posts.slice().reverse().slice(0, 3).map((post) => {
              const creator = models.find(m => m.id === post.model_id);
              return (
                <div 
                  id={`history-post-card-${post.id}`}
                  key={post.id} 
                  className="p-4 rounded-lg border border-white/5 bg-[#060608]/90 hover:border-white/10 transition-all flex gap-3.5"
                >
                  <img 
                    src={post.image_urls[0] || "https://picsum.photos/400/300"} 
                    alt="Generated post thumbnail" 
                    className="w-16 h-20 rounded object-cover bg-neutral-900 border border-white/5 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="flex justify-between items-start gap-3">
                        <div className="overflow-hidden">
                          <h4 className="text-[11.5px] font-semibold text-white truncate">{post.prompt}</h4>
                          <p className="text-[10px] text-slate-500 mt-1">Persona: <span className="font-semibold text-indigo-400">{creator?.name || "Lily Laurent"}</span></p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-semibold tracking-wider uppercase border ${
                          post.status === "published" 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : post.status === "scheduled"
                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse"
                            : "bg-white/5 text-slate-400 border-white/5"
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 line-clamp-1 mt-1.5 font-sans leading-normal">
                        {post.caption}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-2">
                      <span className="text-[9px] font-mono text-slate-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          id={`btn-post-action-${post.id}`}
                          onClick={() => onViewChange("create-post")}
                          className="px-2 py-0.5 rounded bg-indigo-600/10 text-indigo-400 hover:bg-indigo-500/20 text-[9.5px] font-semibold transition-all cursor-pointer"
                        >
                          Schedule Post
                        </button>
                        <button
                          id={`btn-post-delete-${post.id}`}
                          onClick={() => onDeletePost(post.id)}
                          className="px-2 py-0.5 rounded hover:bg-red-600/10 text-slate-500 hover:text-red-400 text-[9.5px] transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {posts.length === 0 && (
              <div id="no-posts-indicator" className="text-center py-10 border border-dashed border-white/5 rounded-xl">
                <p className="text-xs text-slate-500">Photoshoots timeline is empty.</p>
                <button 
                  id="btn-goto-generator"
                  onClick={() => onViewChange("generator")}
                  className="text-xs text-indigo-400 hover:underline mt-2 inline-block font-semibold"
                >
                  Generate First Influencer Image 
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
