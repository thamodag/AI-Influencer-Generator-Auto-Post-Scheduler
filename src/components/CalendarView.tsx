import { useState } from "react";
import { ScheduledPost, GeneratedPost, AIModel, FacebookPage } from "../types";
import { 
  Calendar as CalIcon, 
  Clock, 
  CheckCircle2, 
  Hourglass, 
  AlertCircle, 
  Facebook, 
  Instagram, 
  Twitter, 
  Video,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from "lucide-react";

interface CalendarViewProps {
  scheduledPosts: ScheduledPost[];
  posts: GeneratedPost[];
  models: AIModel[];
  facebookPages: FacebookPage[];
  onTriggerPublish: (id: string) => void;
}

export default function CalendarView({
  scheduledPosts,
  posts,
  models,
  facebookPages,
  onTriggerPublish
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1)); // May 2026

  // Days of week header
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Helper: map platform to correct Icon
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <Facebook size={12} className="text-blue-400" />;
      case "instagram":
        return <Instagram size={12} className="text-pink-400" />;
      case "tiktok":
        return <Video size={12} className="text-white" />;
      default:
        return <Twitter size={12} className="text-slate-400" />;
    }
  };

  // Helper: status formatting
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return (
          <span className="flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
            <CheckCircle2 size={10} /> PUBLISHED
          </span>
        );
      case "publishing":
        return (
          <span className="flex items-center gap-1 text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 font-mono animate-pulse">
            <Hourglass size={10} className="animate-spin" /> PUBLISHING
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1 text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 font-mono">
            <AlertCircle size={10} /> FAILED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[9px] bg-slate-500/10 text-slate-400 px-1.5 py-0.5 rounded border border-white/5 font-mono">
            <Clock size={10} /> PENDING
          </span>
        );
    }
  };

  // Build grid days for May 2026 (Starts on Friday, 31 days)
  const startDayOffset = 5; // Friday
  const totalDays = 31;
  const daysArray = Array.from({ length: startDayOffset + totalDays }, (_, i) => {
    if (i < startDayOffset) return null;
    return i - startDayOffset + 1;
  });

  return (
    <div id="calendar-scheduler-page" className="space-y-6 animate-fade-in text-slate-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
            <CalIcon className="text-indigo-400" size={20} /> Calendar & Schedule Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track automated publication timings, monitor Facebook Page triggers, and manually push pending posts.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#0c0c0e] border border-white/10 p-1.5 rounded-lg text-xs font-semibold">
          <span className="text-indigo-400 px-2">Autopilot Mode:</span>
          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">ACTIVE (pg_cron)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Monthly Calendar Board (8/12) */}
        <div className="lg:col-span-8 bg-[#0c0c0e] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white tracking-wide">May 2026</span>
            <div className="flex gap-2">
              <button className="p-1 px-2.5 bg-white/5 rounded hover:bg-white/10 text-xs text-slate-400">
                <ChevronLeft size={14} className="inline mr-0.5" /> Previous
              </button>
              <button className="p-1 px-2.5 bg-white/5 rounded hover:bg-white/10 text-xs text-slate-200">
                Next <ChevronRight size={14} className="inline ml-0.5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map(d => (
              <div key={d} className="text-center font-semibold text-[10px] text-slate-500 py-1 uppercase tracking-wider">{d}</div>
            ))}

            {daysArray.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="aspect-square bg-transparent rounded-lg border border-transparent"></div>;
              }

              // Filter posts scheduled on this exact day of May 2026
              const dayPosts = scheduledPosts.filter(sp => {
                const dateObj = new Date(sp.scheduled_time);
                return dateObj.getDate() === day && dateObj.getMonth() === 4; // May
              });

              return (
                <div 
                  id={`cal-day-${day}`}
                  key={`day-${day}`} 
                  className={`aspect-square p-2 bg-[#060608] border border-white/5 rounded-lg flex flex-col justify-between group hover:border-indigo-500/40 transition-all ${day === 24 ? 'ring-1 ring-indigo-500/50 bg-indigo-950/20' : ''}`}
                >
                  <span className={`text-xs font-semibold ${day === 24 ? 'text-indigo-400' : 'text-slate-400'}`}>{day}</span>
                  
                  {/* Micro list of channel triggers */}
                  <div className="space-y-1">
                    {dayPosts.map(dp => {
                      const postDetails = posts.find(p => p.id === dp.post_id);
                      return (
                        <div 
                          key={dp.id} 
                          title={postDetails?.caption || "Autopilot post"}
                          className="flex items-center gap-1 p-0.5 rounded bg-white/5 border border-white/5 text-[8.5px] text-slate-300 leading-none truncate"
                        >
                          {getPlatformIcon(dp.platform)}
                          <span className="truncate">{postDetails?.prompt ? postDetails.prompt.slice(0, 10) : "Post"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Upcoming queue detail with Publish Now action trigger (4/12) */}
        <div className="lg:col-span-4 bg-[#0c0c0e] border border-white/10 rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Upcoming Queue</h2>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {scheduledPosts.map(sp => {
              const postDetails = posts.find(p => p.id === sp.post_id);
              // Avoid TS compilation issues by making a direct binding variable
              const matchingPost = postDetails || posts[0];
              const creator = matchingPost ? models.find(m => m.id === matchingPost.model_id) : null;
              
              // Formatting the page names
              const targetPage = facebookPages.find(p => p.page_id === sp.page_id);

              return (
                <div 
                  id={`queue-item-${sp.id}`}
                  key={sp.id} 
                  className="bg-neutral-950/60 border border-white/5 p-3.5 rounded-lg space-y-3"
                >
                  {/* Queue Header details */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(sp.platform)}
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{sp.platform}</span>
                    </div>
                    {getStatusBadge(sp.status)}
                  </div>

                  {/* Thumbnail and snippet */}
                  {matchingPost && (
                    <div className="flex gap-3">
                      <img 
                        src={matchingPost.image_urls[0]} 
                        alt="queue thumbnail" 
                        className="w-12 h-16 rounded object-cover border border-white/15"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-xs overflow-hidden">
                        <span className="block text-[11px] text-slate-300 truncate font-semibold">{creator?.name || "Lily Laurent"}</span>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{matchingPost?.caption || "Automation payload"}</p>
                      </div>
                    </div>
                  )}

                  {/* Details block */}
                  <div className="pt-2 border-t border-white/5 text-[10px] space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>Scheduled timing:</span>
                      <span className="text-slate-300 font-medium font-mono">
                        {new Date(sp.scheduled_time).toLocaleString()}
                      </span>
                    </div>
                    {targetPage && (
                      <div className="flex justify-between text-slate-500">
                        <span>Target Page:</span>
                        <span className="text-indigo-300 font-semibold">{targetPage.page_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Push Publish Now CTA */}
                  {sp.status === "pending" && (
                    <button
                      id={`btn-publish-now-${sp.id}`}
                      onClick={() => onTriggerPublish(sp.id)}
                      className="w-full bg-[#161618] hover:bg-neutral-800 border border-white/10 text-white text-[10px] font-bold py-1.5 rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ExternalLink size={10} /> Publish Instantly Now
                    </button>
                  )}
                </div>
              );
            })}

            {scheduledPosts.length === 0 && (
              <div className="text-center py-12 text-slate-600">
                <CalIcon size={24} className="mx-auto text-slate-700 mb-2" />
                <p className="text-xs italic">No scheduled automated postings in the matrix queue.</p>
                <p className="text-[10px] text-slate-500 mt-1">Ready to create? Tap Flow Generator.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
