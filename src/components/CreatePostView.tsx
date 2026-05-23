import { useState, useEffect } from "react";
import { AIModel, GeneratedPost, FacebookPage } from "../types";
import { 
  PlusSquare, 
  Sparkles, 
  Tv, 
  Check, 
  Facebook, 
  Instagram, 
  Twitter, 
  MessageSquare, 
  Share2, 
  Smile, 
  Heart, 
  MapPin, 
  Compass,
  FileText
} from "lucide-react";

interface CreatePostViewProps {
  models: AIModel[];
  posts: GeneratedPost[];
  facebookPages: FacebookPage[];
  onSchedulePost: (postId: string, platform: string, pageId: string | undefined, scheduledTime: string) => void;
  onViewChange: (view: string) => void;
}

export default function CreatePostView({
  models,
  posts,
  facebookPages,
  onSchedulePost,
  onViewChange
}: CreatePostViewProps) {
  // Available platforms specified in prompt
  const PLATFORMS = [
    { id: "facebook", name: "Facebook Page", color: "bg-blue-600/25 border-blue-500/40 text-blue-300 hover:bg-blue-600/35", icon: Facebook },
    { id: "instagram", name: "Instagram", color: "bg-pink-600/25 border-pink-500/40 text-pink-300 hover:bg-pink-600/35", icon: Instagram },
    { id: "tiktok", name: "TikTok", color: "bg-neutral-800 border-neutral-700 text-slate-100 hover:bg-neutral-700/60", icon: MessageSquare },
    { id: "x", name: "X (Twitter)", color: "bg-neutral-800 border-neutral-700 text-slate-300", icon: Twitter },
  ];

  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [selectedPostId, setSelectedPostId] = useState("");
  const [customCaption, setCustomCaption] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Schedule setup
  const [scheduledDate, setScheduledDate] = useState("2026-05-24");
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [isScheduling, setIsScheduling] = useState(false);
  const [successInfo, setSuccessInfo] = useState("");

  const activePost = posts.find(p => p.id === selectedPostId) || posts[posts.length - 1];
  const activeModel = activePost ? models.find(m => m.id === activePost.model_id) : models[0];

  // Auto select last generated post
  useEffect(() => {
    if (posts.length > 0 && !selectedPostId) {
      setSelectedPostId(posts[posts.length - 1].id);
    }
  }, [posts, selectedPostId]);

  // Set initial caption whenever the active post changes
  useEffect(() => {
    if (activePost) {
      setCustomCaption(activePost.caption);
    }
  }, [activePost]);

  // Handle dedicated Geminicaption builder response
  const handleBuildDedicatedCaption = async () => {
    if (!activePost || !activeModel) return;
    setIsGenerating(true);
    try {
      const response = await fetch("/api/gemini/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: activeModel,
          prompt: activePost.prompt,
          platform: selectedPlatform,
          vibe: activeModel.vibe
        })
      });
      const data = await response.json();
      if (data.caption) {
        setCustomCaption(data.caption);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQueueScheduling = () => {
    if (!activePost) {
      alert("Please select a photo shoot item to schedule!");
      return;
    }

    setIsScheduling(true);
    setSuccessInfo("");

    const timeStr = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
    
    // Choose selected Facebook page, or fallback
    const selectedPage = facebookPages.find(p => p.selected);
    onSchedulePost(activePost.id, selectedPlatform, selectedPage?.page_id, timeStr);

    setTimeout(() => {
      setIsScheduling(false);
      setSuccessInfo(`Successfully scheduled this post for ${selectedPlatform}! Automatically published at selected slot.`);
    }, 700);
  };

  return (
    <div id="create-post-workspace" className="space-y-6 animate-fade-in text-slate-200">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
          <PlusSquare size={20} className="text-indigo-400" /> Automation Desk - Create Post
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Select generated model photography, generate platform-specific captions with hashtags using Gemini, and prepare scheduling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Setup Forms (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-5 space-y-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Campaign Configuration</h2>

            {/* Step 1: Select Generated Photoshoot */}
            <div className="space-y-1.5 text-xs">
              <label className="block text-slate-500 font-semibold uppercase">1. Select AI Photoshoot Result</label>
              {posts.length > 0 ? (
                <select 
                  id="select-post-image"
                  value={selectedPostId}
                  onChange={(e) => setSelectedPostId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-xs text-white focus:outline-none"
                >
                  {posts.slice().reverse().map(p => {
                    const creator = models.find(m => m.id === p.model_id);
                    return (
                      <option key={p.id} value={p.id}>
                        {creator?.name || "Lily"} — {p.prompt.slice(0, 50)}...
                      </option>
                    );
                  })}
                </select>
              ) : (
                <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-lg text-center text-slate-400">
                  No generated shoots found. Go to the Flow Generator to start!
                  <button onClick={() => onViewChange("generator")} className="text-indigo-400 underline block mt-2 font-semibold">Open Flow Generator</button>
                </div>
              )}
            </div>

            {/* Step 2: Platform Selector */}
            <div className="space-y-2">
              <label className="block text-xs text-slate-500 font-semibold uppercase">2. Core Social Channels</label>
              <div className="flex flex-wrap gap-2.5">
                {PLATFORMS.map(p => {
                  const Icon = p.icon;
                  return (
                    <button
                      id={`p-select-${p.id}`}
                      key={p.id}
                      onClick={() => setSelectedPlatform(p.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        selectedPlatform === p.id 
                          ? `${p.color} ring-2 ring-indigo-500/20` 
                          : "bg-white/5 text-slate-400 hover:text-slate-200 border-white/15"
                      }`}
                    >
                      <Icon size={14} />
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Platform Caption Generator & Editor */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs text-slate-500 font-semibold uppercase">3. Copywriter Caption Draft</label>
                <button
                  id="btn-dedicated-caption-build"
                  onClick={handleBuildDedicatedCaption}
                  disabled={!activePost || isGenerating}
                  className="bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/20 px-3 py-1.5 rounded text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={11} /> Generate Platform-Optimized Voice
                </button>
              </div>

              <textarea
                id="text-caption-main"
                rows={5}
                value={customCaption}
                onChange={(e) => setCustomCaption(e.target.value)}
                placeholder="Write, paste or auto generate catchy marketing messages..."
                className="w-full bg-[#050506]/90 border border-white/10 p-3 rounded-lg text-xs leading-relaxed text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
              />
              <p className="text-[10px] text-slate-500">Gemini auto adds hashtags and appropriate styling (e.g. friendly linebreaks for Insta, short punchy statements for X/Twitter).</p>
            </div>

            {/* Step 4: Time Selection & Execute Schedule */}
            <div className="bg-[#050506] border border-white/5 rounded-lg p-4 space-y-4">
              <label className="block text-[11px] text-slate-400 uppercase tracking-widest font-semibold"><MapPin size={10} className="inline mr-1" /> Automation Scheduler Setup</label>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Schedule date</label>
                  <input
                    id="sched-date-picker"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-[#111113] border border-white/10 p-2 rounded text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Time (Local)</label>
                  <input
                    id="sched-time-picker"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-[#111113] border border-white/10 p-2 rounded text-white focus:outline-none"
                  />
                </div>
              </div>

              {successInfo && (
                <div id="notice-success-local" className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded text-center font-medium animate-pulse">
                  {successInfo}
                </div>
              )}

              <button
                id="btn-queue-calendar"
                onClick={handleQueueScheduling}
                disabled={isScheduling || !activePost}
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-lg font-bold text-xs text-white uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/10 disabled:opacity-40 cursor-pointer"
              >
                {isScheduling ? "Publishing to Queue..." : "Confirm & Queue in Matrix"}
              </button>
            </div>

          </div>
        </div>

        {/* Right Side: Realistic Feed Mock (5/12) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Live Social Mock Preview</h2>

          {activePost ? (
            <div id="social-mockup-frame" className="bg-[#0d0d0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              
              {/* Mockup Top Brand Bar */}
              <div className="bg-neutral-900 px-4 py-2.5 border-b border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 capitalize font-mono text-indigo-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {selectedPlatform} Device Feed
                </span>
                <span className="text-[10px] font-mono text-slate-500">Live Client Aspect</span>
              </div>

              {/* Feed Card */}
              <div className="p-4 space-y-3.5">
                {/* User Info Bar */}
                <div className="flex items-center gap-3">
                  <img 
                    src={activePost?.image_urls?.[0] || "https://images.unsplash.com/photo-1544005313-94ddf0286df2"} 
                    alt="Channel profile avatar" 
                    className="w-9 h-9 rounded-full object-cover border border-white/15"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1">
                      {activeModel?.name || "Lily Laurent"} 
                      <span className="text-[10px] text-emerald-400 font-normal">✔ Page Partner</span>
                    </div>
                    <div className="text-[9px] text-slate-500 flex items-center gap-1 leading-none mt-0.5">
                      <span>Sponsored</span> • <span>Now</span> • <Smile size={8} /> Only Me
                    </div>
                  </div>
                </div>

                {/* Caption content rendered cleanly */}
                <p className="text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                  {customCaption || "Provide caption contents on the left..."}
                </p>

                {/* Post photo */}
                <div className="relative aspect-[4/5] bg-neutral-950 rounded-lg overflow-hidden border border-white/5">
                  <img 
                    src={activePost.image_urls[0]} 
                    alt="Mock publication visual" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Bottom Stats Like Interaction panel depends on standard platform metrics */}
                <div className="pt-2 border-t border-white/5 text-xs text-slate-400 flex items-center justify-between">
                  {selectedPlatform === "facebook" ? (
                    <>
                      <span className="flex items-center gap-1 text-[11px] font-sans">
                        <Heart size={14} className="text-red-500 fill-red-500" /> 1.2K Likes • 22 Comments
                      </span>
                      <Share2 size={14} className="hover:text-white transition-all cursor-pointer" />
                    </>
                  ) : selectedPlatform === "instagram" ? (
                    <>
                      <div className="flex items-center gap-3">
                        <Heart size={14} className="text-red-500 fill-red-500" />
                        <MessageSquare size={14} />
                        <Compass size={14} />
                      </div>
                      <span className="text-[10px] font-mono">15,920 Views</span>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-[10px]">#CompoundHabits #GymMotivation</span>
                      <span className="font-sans text-[11px] text-indigo-400">Viral Matrix Trigger</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-xl bg-white/5 text-slate-500 text-xs">
              Generate some photoshoot assets to preview live feeds here.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
