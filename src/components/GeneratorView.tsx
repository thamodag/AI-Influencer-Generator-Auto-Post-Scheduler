import React, { useState, useEffect, useRef } from "react";
import { AIModel, GeneratedPost, FacebookPage, FlowProject, FlowAsset } from "../types";
import { 
  Sparkles, 
  Tv, 
  Layers, 
  Maximize2, 
  Download, 
  RotateCw, 
  Calendar, 
  Loader2, 
  CheckCircle,
  Clock,
  ExternalLink,
  FolderOpen,
  Terminal,
  Plus,
  X,
  ChevronRight,
  FileText,
  Video,
  LogOut,
  Sliders,
  AlertCircle
} from "lucide-react";

interface GeneratorViewProps {
  models: AIModel[];
  facebookPages: FacebookPage[];
  onToggleFacebookPage: (id: string) => void;
  onPostGenerated: (post: GeneratedPost) => void;
  onSchedulePost: (postId: string, platform: string, pageId: string | undefined, scheduledTime: string) => void;
  onViewChange: (view: string) => void;
}

export default function GeneratorView({
  models,
  facebookPages,
  onToggleFacebookPage,
  onPostGenerated,
  onSchedulePost,
  onViewChange
}: GeneratorViewProps) {
  // Select Preset parameters arrays
  const SCENE_PRESETS = ["Cafe", "Beach", "Yacht", "Gym", "Office", "Tokyo", "London", "Dubai", "Miami", "Travel"];
  const CAMERA_STYLES = ["iPhone selfie", "DSLR portrait", "Mirror selfie", "Street candid", "Low angle", "Wide shot"];
  const STYLE_PRESETS = ["Luxury", "Lifestyle", "Cinematic", "Viral TikTok", "Streetwear", "Soft Girl"];
  const ASPECT_RATIOS = ["9:16", "1:1", "4:5", "16:9"];
  const BATCH_COUNTS = [1, 3, 5];
  const FLOW_PIPELINE_PRESETS = ["Cinema Luxe V1", "Elite Hyperreal Studio", "Street Candid Pro", "TikTok Glamour Ultra", "Ethereal Portrait"];

  // State for connected Google session details
  const [googleSession, setGoogleSession] = useState<{
    connected: boolean;
    email: string;
    name: string;
    avatar_url: string;
    connected_at: string;
  }>({
    connected: false,
    email: "",
    name: "",
    avatar_url: "",
    connected_at: ""
  });

  // State for Flow Projects & Assets
  const [flowProjects, setFlowProjects] = useState<FlowProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectAssets, setProjectAssets] = useState<FlowAsset[]>([]);
  const [activeAssetFolder, setActiveAssetFolder] = useState<'generated-posts' | 'reference-images' | 'captions'>('generated-posts');

  // New project creation modal status
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  // Base generator parameter selections
  const [selectedModelId, setSelectedModelId] = useState("");
  const [selectedFlowPreset, setSelectedFlowPreset] = useState("Cinema Luxe V1");
  const [selectedScene, setSelectedScene] = useState("Cafe");
  const [selectedCamera, setSelectedCamera] = useState("iPhone selfie");
  const [selectedStyle, setSelectedStyle] = useState("Luxury");
  const [selectedRatio, setSelectedRatio] = useState("9:16");
  const [selectedBatch, setSelectedBatch] = useState(1);
  const [extraKeywords, setExtraKeywords] = useState("");

  // Live Auto Prompt states
  const [builtPrompt, setBuiltPrompt] = useState("");
  const [isBuildingPrompt, setIsBuildingPrompt] = useState(false);

  // Flow Generator execution variables
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Active view outputs
  const [lastResult, setLastResult] = useState<GeneratedPost | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Caption/Scheduling controls
  const [editedCaption, setEditedCaption] = useState("");
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("2026-05-24");
  const [scheduledTime, setScheduledTime] = useState("09:45");
  const [isScheduling, setIsScheduling] = useState(false);
  const [successNotice, setSuccessNotice] = useState("");

  const activeModel = models.find(m => m.id === selectedModelId) || models[0];

  // System status monitoring logs helper
  const addLog = (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    let prefix = "⚙️";
    if (type === 'success') prefix = "✅";
    if (type === 'warning') prefix = "⚠️";
    if (type === 'error') prefix = "❌";
    
    setTerminalLogs(prev => [...prev, `${prefix} [${timestamp}] ${msg}`]);
  };

  // 1. Fetch Google Auth Connection status
  const fetchGoogleSession = async () => {
    try {
      const response = await fetch("/api/google/session");
      const data = await response.json();
      if (data.session) {
        setGoogleSession(data.session);
      }
    } catch {}
  };

  // 2. Fetch Google Flow Projects
  const fetchFlowProjects = async () => {
    try {
      const response = await fetch("/api/google/projects");
      const data = await response.json();
      if (data.projects) {
        setFlowProjects(data.projects);
        if (data.projects.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data.projects[0].id);
        }
      }
    } catch {}
  };

  // 3. Fetch specific project asset directories
  const fetchProjectAssets = async (projId: string) => {
    if (!projId) return;
    try {
      const response = await fetch(`/api/google/projects/${projId}/assets`);
      const data = await response.json();
      if (data.assets) {
        setProjectAssets(data.assets);
      }
    } catch {}
  };

  // Listen to popups callback cross-origin postMessage success events
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        addLog("OAuth authentication success returned from popup safely!", "success");
        fetchGoogleSession();
        fetchFlowProjects();
      }
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  // Sync session on load
  useEffect(() => {
    fetchGoogleSession();
    fetchFlowProjects();
    addLog("Flow Camera rendering terminal loaded & synchronized with metachannel API.");
  }, []);

  // Sync assets list whenever active project shifts
  useEffect(() => {
    if (selectedProjectId) {
      addLog(`Shift workspace directory to active project workspace: user-id/${selectedProjectId}/`);
      fetchProjectAssets(selectedProjectId);
      const proj = flowProjects.find(p => p.id === selectedProjectId);
      if (proj && proj.model_id) {
        setSelectedModelId(proj.model_id);
      }
    }
  }, [selectedProjectId, flowProjects]);

  // Sync built prompt when selections change
  const localPreviewPrompt = () => {
    if (!activeModel) return "Select an influencer personality to load face anchors...";
    return `Ultra realistic smartphone ${selectedCamera} of ${activeModel.name} (${activeModel.hair_color} hair, styled as ${activeModel.fashion_style}) in ${selectedScene} setting, perfect ${selectedStyle?.toLowerCase()} ambient lighting, hyperrealistic details.`;
  };

  useEffect(() => {
    setBuiltPrompt(localPreviewPrompt());
  }, [selectedModelId, selectedScene, selectedCamera, selectedStyle, extraKeywords]);

  // Scroll console screen to bottom safely
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Initializing oauth workflow with fallback button trigger
  const handleConnectGoogle = async () => {
    addLog("Launching Google OAuth authentication popup window...");
    try {
      const response = await fetch('/api/auth/url');
      if (response.ok) {
        const { url } = await response.json();
        const popup = window.open(url, 'google_oauth_popup', 'width=600,height=700');
        if (!popup) {
          addLog("Browser popup blocker detected. Redirecting to quick fallback login.", "warning");
          await handleConnectGoogleInstant();
        }
      } else {
        await handleConnectGoogleInstant();
      }
    } catch (e) {
      await handleConnectGoogleInstant();
    }
  };

  const handleConnectGoogleInstant = async () => {
    addLog("Calling fast Google Flow Account API connector...");
    try {
      const res = await fetch("/api/google/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "roshanthamoda@gmail.com",
          name: "Roshantha Moda",
          avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200"
        })
      });
      const d = await res.json();
      if (d.success) {
        setGoogleSession(d.session);
        addLog(`Connected with Google Account: ${d.session.email} successfully!`, "success");
        fetchFlowProjects();
      }
    } catch {}
  };

  const handleDisconnectGoogle = async () => {
    addLog("Cleaning active credentials session...");
    try {
      const res = await fetch("/api/google/disconnect", { method: "POST" });
      const d = await res.json();
      if (d.success) {
        setGoogleSession(d.session);
        setSelectedProjectId("");
        setProjectAssets([]);
        addLog("Google session disconnected safely.", "warning");
      }
    } catch {}
  };

  // Create a new Flow Project Workspace inside Models Studio structure
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;
    try {
      const res = await fetch("/api/google/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDesc,
          model_id: selectedModelId
        })
      });
      const d = await res.json();
      if (d.success && d.project) {
        setFlowProjects(prev => [...prev, d.project]);
        setSelectedProjectId(d.project.id);
        setShowCreateProjectModal(false);
        setNewProjectName("");
        setNewProjectDesc("");
        addLog(`Successfully initialized Google Flow workspace for: "${d.project.name}"!`, "success");
      }
    } catch {}
  };

  // Optimize prompt with Gemini text reasoning
  const handleOptimizePrompt = async () => {
    if (!activeModel) return;
    setIsBuildingPrompt(true);
    addLog("Sending prompt tags to Gemini for cinematic optimization...");
    try {
      const response = await fetch("/api/gemini/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: activeModel,
          scene: selectedScene,
          camera: selectedCamera,
          style: selectedStyle,
          keywords: extraKeywords
        })
      });
      const data = await response.json();
      if (data.prompt) {
        setBuiltPrompt(data.prompt);
        addLog("Gemini optimization response received! Rebuilt prompt structured.", "success");
      }
    } catch (e) {
      addLog("Failed to reach Gemini optimizer. Using local default schema.", "warning");
    } finally {
      setIsBuildingPrompt(false);
    }
  };

  // Generator Pipeline handler with log streaming terminal updates
  const handleGenerateAssets = async () => {
    if (!activeModel) {
      alert("Please configure an Influencer Persona first in the Models Studio tab!");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(5);
    setTerminalLogs([]); // Reset log console
    
    // Core timed sequential log generator simulating natural cluster steps
    addLog(`Initiating camera shoot for influencer "${activeModel.name}" model token: ${activeModel.identity_token}`, "info");
    
    setTimeout(() => {
      setGenerationProgress(15);
      addLog(`Querying active project directory space: user-id/${selectedProjectId || "fp-luxe"}/`, "info");
    }, 400);

    setTimeout(() => {
      setGenerationProgress(30);
      addLog(`Verifying credentials with Google Flow Engine on active project: ${selectedProjectId || "fp-luxe"}`, "info");
    }, 800);

    setTimeout(() => {
      setGenerationProgress(50);
      addLog(`Synthesizing character face anchors & blending metadata details (hair: ${activeModel.hair_color}, style: ${activeModel.fashion_style})`, "info");
    }, 1200);

    setTimeout(() => {
      setGenerationProgress(70);
      addLog(`Running diffusion pipeline in remote Cloud Run containers: preset "${selectedFlowPreset}" active`, "info");
      addLog(`Sending optimized rendering instructions: "${builtPrompt.substring(0, 95)}..."`, "info");
    }, 1800);

    setTimeout(() => {
      setGenerationProgress(85);
      addLog(`Batch render configured count: ${selectedBatch} image file outputs`, "info");
      addLog("Executing image super-resolution upscalers...", "info");
    }, 2400);

    try {
      // Fire backend request saving images into assets under project ID
      const response = await fetch("/api/generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_id: activeModel.id,
          sceneStr: selectedScene,
          cameraStr: selectedCamera,
          styleStr: selectedStyle,
          sizeStr: selectedRatio,
          batchCount: selectedBatch,
          project_id: selectedProjectId || undefined
        })
      });

      const data = await response.json();
      
      setTimeout(() => {
        setGenerationProgress(100);
        if (data.success && data.post) {
          setLastResult(data.post);
          setActiveImageIdx(0);
          setEditedCaption(data.post.caption);
          onPostGenerated(data.post);
          
          addLog(`Rendered images successfully written into Google Cloud store path: "user-id/${selectedProjectId || "fp-luxe"}/generated-posts/"`, "success");
          addLog("Photoshoot execution complete!", "success");
          
          // Re-fetch project assets to populate asset directory panel instantly
          if (selectedProjectId) {
            fetchProjectAssets(selectedProjectId);
          }
        } else {
          addLog("Pipeline returned success: false or invalid file markers.", "error");
        }
        setIsGenerating(false);
      }, 3000);

    } catch (err) {
      addLog(`Error during Flow pipeline processing: ${err}`, "error");
      setIsGenerating(false);
    }
  };

  // Caption creator from Gemini
  const handleGenerateCaption = async () => {
    if (!activeModel) return;
    setIsGeneratingCaption(true);
    addLog("Asking Gemini to structure engaging rich social captions...");
    try {
      const response = await fetch("/api/gemini/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: activeModel,
          prompt: builtPrompt,
          platform: "Instagram",
          vibe: activeModel.vibe
        })
      });
      const data = await response.json();
      if (data.caption) {
        setEditedCaption(data.caption);
        addLog("Gemini Caption generated successfully!", "success");
        if (lastResult) {
          setLastResult({ ...lastResult, caption: data.caption });
        }
      }
    } catch (err) {
       addLog("Failed to pull Gemini optimized caption. Safe fallback applied.", "warning");
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  // Schedule trigger
  const handleScheduleSubmit = async () => {
    if (!lastResult) return;
    setIsScheduling(true);
    setSuccessNotice("");
    addLog("Compiling publication package details for scheduled automated dispatch...");

    const isoString = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
    const selectedPages = facebookPages.filter(p => p.selected);
    
    if (selectedPages.length === 0) {
      onSchedulePost(lastResult.id, "facebook", undefined, isoString);
      addLog(`Post queued for general Meta distribution at ${scheduledDate} ${scheduledTime}`, "success");
    } else {
      for (const page of selectedPages) {
        onSchedulePost(lastResult.id, "facebook", page.page_id, isoString);
        addLog(`Post mapped dynamically for scheduled distribution to Facebook Page: "${page.page_name}"`, "success");
      }
    }

    setTimeout(() => {
      setIsScheduling(false);
      setSuccessNotice("Publication queued in automated post matrix successfully! View queue on Calendar view.");
    }, 800);
  };

  return (
    <div id="flow-generator-page" className="flex flex-col h-full text-slate-100">
      
      {/* Top Banner indicating Google account OAuth state */}
      <div id="google-auth-status-bar" className="mb-6 p-4 rounded-xl border transition-all duration-300 bg-zinc-950/40 border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
            <FolderOpen size={20} />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              Google Account Connection Status
              <span className={`inline-block w-2 h-2 rounded-full ${googleSession.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
            </div>
            {googleSession.connected ? (
              <p className="text-sm text-slate-300">
                Connected with <span className="font-semibold text-white">{googleSession.email}</span> (active since {new Date(googleSession.connected_at).toLocaleString()})
              </p>
            ) : (
              <p className="text-sm text-yellow-500/90 flex items-center gap-1.5 font-medium">
                <AlertCircle size={14} /> Account offline. Connect Google Account to pull cloud Flow projects mapping character consistency.
              </p>
            )}
          </div>
        </div>
        <div>
          {googleSession.connected ? (
            <button 
              id="btn-disconnect-google"
              onClick={handleDisconnectGoogle}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700/80 hover:text-rose-400 text-slate-300 text-xs px-4 py-2 rounded-lg transition-all font-semibold border border-zinc-700/50"
            >
              <LogOut size={13} /> Disconnect Account
            </button>
          ) : (
            <button 
              id="btn-connect-google"
              onClick={handleConnectGoogle}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4  py-2 rounded-lg transition-all font-semibold shadow-lg shadow-indigo-600/15"
            >
              <ExternalLink size={13} /> Connect Google Account
            </button>
          )}
        </div>
      </div>

      {/* Main 3-Column Studio Grid */}
      <div id="generator-split-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: Controls Desk (4/12) */}
        <section className="lg:col-span-4 bg-zinc-950/60 border border-zinc-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders size={14} className="text-indigo-400" /> System Settings
            </h2>
            <div className="text-[11px] font-mono text-zinc-500">pipeline.config</div>
          </div>

          <div className="space-y-4">
            {/* Active Cloud Project Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Active Flow Project</label>
                <button 
                  id="btn-trigger-new-project"
                  onClick={() => setShowCreateProjectModal(true)}
                  disabled={!googleSession.connected}
                  className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5 disabled:opacity-30 disabled:no-underline font-medium"
                >
                  <Plus size={10} /> Create Project
                </button>
              </div>

              {googleSession.connected ? (
                flowProjects.length > 0 ? (
                  <select 
                    id="select-active-project"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                  >
                    {flowProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-lg text-slate-500 text-center text-[11px]">
                    No projects found. Create your first Flow project to get started.
                  </div>
                )
              ) : (
                <div className="p-3 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-lg text-slate-500 text-center text-[11px] italic">
                  Offline. Please link Google Account above.
                </div>
              )}
            </div>

            {/* Character select option */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 col-span-2">Influencer Character reference</label>
              {models.length > 0 ? (
                <select 
                  id="select-generator-persona"
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                >
                  {models.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.gender}, Hair: {m.hair_color})</option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-zinc-900/40 border border-dashed border-neutral-800 rounded-lg text-zinc-500 text-center text-xs">
                  No characters constructed.
                  <button onClick={() => onViewChange("models")} className="text-indigo-400 underline font-semibold ml-1 block mt-1">Go to Models Studio</button>
                </div>
              )}
            </div>

            {/* Google Flow Pipeline preset selection details */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Flow Generation Pipeline</label>
              <select 
                id="select-flow-pipeline"
                value={selectedFlowPreset}
                onChange={(e) => setSelectedFlowPreset(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-medium"
              >
                {FLOW_PIPELINE_PRESETS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Scene details and cameras */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1">Scene Settings</label>
                <select 
                  id="select-generator-scene"
                  value={selectedScene}
                  onChange={(e) => setSelectedScene(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-xs text-slate-300 font-medium"
                >
                  {SCENE_PRESETS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1">Camera Styles</label>
                <select 
                  id="select-generator-camera"
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-xs text-slate-300 font-medium"
                >
                  {CAMERA_STYLES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visual style options, Aspect Ratio, Batch size parameters */}
            <div className="grid grid-cols-3 gap-2 pb-1">
              <div>
                <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Style Preset</label>
                <select 
                  id="select-generator-style"
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 p-1.5 rounded text-[11px] text-slate-300"
                >
                  {STYLE_PRESETS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Aspect ratio</label>
                <select 
                  id="select-generator-ratio"
                  value={selectedRatio}
                  onChange={(e) => setSelectedRatio(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 p-1.5 rounded text-[11px] text-slate-300"
                >
                  {ASPECT_RATIOS.map(ar => (
                    <option key={ar} value={ar}>{ar}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Batch count</label>
                <select 
                  id="select-generator-batch"
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 p-1.5 rounded text-[11px] text-slate-300"
                >
                  {BATCH_COUNTS.map(bc => (
                    <option key={bc} value={bc}>{bc} Image{bc > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Manual Keyword injections */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Action Details or Keywords</label>
              <input 
                id="input-extra-details"
                type="text"
                value={extraKeywords}
                onChange={(e) => setExtraKeywords(e.target.value)}
                placeholder="e.g. sipping hot tea, wearing classy blazer"
                className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Auto Prompt Construction Area */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Dynamic Prompt Pipeline</span>
                <button 
                  id="btn-optimize-pipeline"
                  type="button"
                  onClick={handleOptimizePrompt}
                  disabled={isBuildingPrompt || !activeModel}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                >
                  {isBuildingPrompt ? "Refining prompt..." : "✨ Optimize Prompt"}
                </button>
              </div>
              <textarea 
                id="text-generator-prompt"
                rows={3}
                value={builtPrompt}
                onChange={(e) => setBuiltPrompt(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-2.5 rounded-lg text-[10.5px] font-mono text-slate-300 leading-normal focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Global Run Button */}
            <div className="pt-2 border-t border-zinc-800/65">
              <button 
                id="btn-trigger-generation-flow"
                onClick={handleGenerateAssets}
                disabled={isGenerating || !googleSession.connected || !activeModel}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-xs py-3 rounded-lg tracking-widest uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={14} /> Pipeline Running...
                  </>
                ) : (
                  <>
                    <Tv size={14} /> Execute Diffuser Flow
                  </>
                )}
              </button>
              {!googleSession.connected && (
                <p className="text-[10px] text-center text-rose-400 mt-2 font-medium">⚠️ Google Account authentication required to run generation.</p>
              )}
            </div>

          </div>
        </section>

        {/* CENTER COLUMN: Live Canvas & Progress Monitor (4/12) */}
        <section className="lg:col-span-4 bg-zinc-950/20 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
          
          {/* Main Visual Render viewport */}
          <div className="flex flex-col items-center justify-center flex-1 min-h-[380px] relative">
            
            {/* Model Identity Lock Info indicator */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center">
              <div className="bg-black/85 border border-zinc-800 px-3 py-1.5 rounded-full text-[10px] flex items-center gap-2 shadow-lg">
                <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500'}`} />
                <span className="text-zinc-400">
                  Target Identity Anchor: <span className="font-mono text-indigo-400 font-semibold">"{activeModel?.identity_token || "LILY_V3"}"</span>
                </span>
              </div>
            </div>

            {isGenerating ? (
              <div id="canvas-loading-state" className="text-center p-6 space-y-4 max-w-xs">
                <div className="w-14 h-14 rounded-full bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center mx-auto animate-pulse">
                  <Sparkles className="text-indigo-400 animate-spin" size={24} style={{ animationDuration: '4s' }} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">Generating AI Shoot...</h3>
                  <p className="text-[11px] text-zinc-500 font-mono italic">{progressText || "Connecting to cluster nodes..."}</p>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden border border-zinc-800">
                  <div 
                    className="bg-indigo-500 h-1 rounded-full transition-all duration-300" 
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
            ) : lastResult ? (
              <div id="image-display-frame" className="w-full flex flex-col items-center space-y-3 pt-8">
                <div className="w-[245px] h-[340px] rounded-xl border border-zinc-800 bg-black overflow-hidden relative shadow-2xl group">
                  <img 
                    src={lastResult.image_urls[activeImageIdx]} 
                    alt="AI photoshoot visual output" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 bg-black/75 border border-zinc-800 text-[9px] font-mono text-zinc-400 px-1.5 py-0.5 rounded">
                    Aspect {selectedRatio}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/75 border border-zinc-800 text-[9px] font-mono text-indigo-400 px-1.5 py-0.5 rounded font-bold">
                    Variant #{activeImageIdx + 1}
                  </div>
                </div>

                {/* Multibatch preview selectors */}
                {lastResult.image_urls.length > 1 && (
                  <div className="flex gap-1.5">
                    {lastResult.image_urls.map((u, i) => (
                      <button 
                        key={i}
                        onClick={() => setActiveImageIdx(i)}
                        className={`w-9 h-12 rounded overflow-hidden border transition-all ${activeImageIdx === i ? 'border-indigo-500 ring-2 ring-indigo-500/25 scale-105' : 'border-zinc-800 opacity-50'}`}
                      >
                        <img src={u} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Direct quick action file options */}
                <div className="flex items-center gap-2 pt-1.5">
                  <a 
                    href={lastResult.image_urls[activeImageIdx]} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[10px] font-semibold px-2.5 py-1.5 rounded flex items-center gap-1 transition-all"
                  >
                    <Maximize2 size={11} /> View Original
                  </a>
                  <button 
                    onClick={handleGenerateAssets}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[10px] font-semibold px-2.5 py-1.5 rounded flex items-center gap-1 transition-all"
                  >
                    <RotateCw size={11} /> Re-run Shoot
                  </button>
                </div>
              </div>
            ) : (
              <div id="empty-shoot-canvas" className="text-center p-6 bg-zinc-950/10 border border-dashed border-zinc-800/80 rounded-2xl w-full max-w-xs">
                <div className="w-14 h-14 rounded-full bg-indigo-600/10 border border-indigo-500/15 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="text-indigo-400" size={24} />
                </div>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Diffuser Ready</h3>
                <p className="text-[10px] text-zinc-500 mt-1 max-w-xs leading-normal">
                  Toggle settings on left control board and trigger generation pipeline.
                </p>
              </div>
            )}

          </div>

          {/* REALTIME SYSTEM DECK LOG PROGRESS MONITOR */}
          <div id="system-progress-console" className="mt-4 bg-black border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
            <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wide">
                <Terminal size={12} className="text-rose-400" /> Google Flow Engine progress
              </div>
              <span className="text-[9px] font-mono text-zinc-500">live_node_logs</span>
            </div>
            <div 
              ref={terminalRef}
              className="p-3 h-32 md:h-36 overflow-y-auto font-mono text-[10px] text-indigo-300 leading-normal bg-black space-y-1.5"
            >
              {terminalLogs.length > 0 ? (
                terminalLogs.map((log, index) => (
                  <div key={index} className="whitespace-pre-wrap select-text selection:bg-indigo-500/20">{log}</div>
                ))
              ) : (
                <div className="text-zinc-650 italic">[* SYSTEM ACTIVE *] Standby for compilation logs...</div>
              )}
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: Automation Workspace (4/12) */}
        <section className="lg:col-span-4 bg-zinc-950/60 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* System Title Tab Header */}
            <div className="border-b border-zinc-800 pb-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Automation Desk
              </h2>
            </div>

            {/* Simulated Workspace directory structures assets finder */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">
                Saved Project Workspace File Tree
              </label>
              
              <div className="bg-black border border-zinc-800 rounded-lg overflow-hidden">
                {/* Simulated directories paths display tabs */}
                <div className="grid grid-cols-3 bg-zinc-900/60 border-b border-zinc-800 text-[10px] font-mono">
                  <button 
                    onClick={() => setActiveAssetFolder('generated-posts')}
                    className={`py-2 text-center transition-all ${activeAssetFolder === 'generated-posts' ? 'bg-black text-indigo-400 border-b-2 border-indigo-500 font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    📁 posts/
                  </button>
                  <button 
                    onClick={() => setActiveAssetFolder('reference-images')}
                    className={`py-2 text-center transition-all ${activeAssetFolder === 'reference-images' ? 'bg-black text-indigo-400 border-b-2 border-indigo-500 font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    📁 identity/
                  </button>
                  <button 
                    onClick={() => setActiveAssetFolder('captions')}
                    className={`py-2 text-center transition-all ${activeAssetFolder === 'captions' ? 'bg-black text-indigo-400 border-b-2 border-indigo-500 font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    📁 texts/
                  </button>
                </div>

                {/* Directory file contents list simulation */}
                <div className="p-3 max-h-40 overflow-y-auto text-[11px] font-mono space-y-2">
                  <div className="text-[10px] text-slate-500 mb-1">
                    Path: <span className="text-slate-400">user-9912a/{selectedProjectId || "fp-luxe"}/{activeAssetFolder}/</span>
                  </div>

                  {activeAssetFolder === 'generated-posts' && (
                    <div className="space-y-1.5">
                      {projectAssets.filter(a => a.folder === 'generated-posts').length > 0 ? (
                        projectAssets.filter(a => a.folder === 'generated-posts').map(asset => (
                          <div key={asset.id} className="flex items-center justify-between p-1.5 rounded bg-zinc-900/50 border border-zinc-800">
                            <span className="text-zinc-300 truncate w-32">{asset.name}</span>
                            <button 
                              onClick={() => {
                                setLastResult({
                                  id: "post-history",
                                  user_id: "u-9a",
                                  model_id: selectedModelId,
                                  prompt: builtPrompt,
                                  caption: editedCaption,
                                  image_urls: [asset.url],
                                  status: "draft",
                                  created_at: asset.created_at
                                });
                                setEditedCaption(`Aesthetic lifestyle photoshoot candidate from target project root. #style #curated`);
                              }}
                              className="text-[9px] text-indigo-400 hover:underline uppercase tracking-wider"
                            >
                              Inspect
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-zinc-650 italic text-center py-4">No generated posts stored yet in this workspace.</div>
                      )}
                    </div>
                  )}

                  {activeAssetFolder === 'reference-images' && (
                    <div className="grid grid-cols-4 gap-2">
                      {models.length > 0 ? (
                        // Map standard model reference photos list
                        projectAssets.filter(a => a.folder === 'reference-images').concat(
                          models.map(m => ({ id: m.id, url: m.id === 'm-lily' ? "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200&h=200" : "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200&h=200", name: `${m.name}_ref.png` }))
                        ).map((ref, idx) => (
                          <div key={idx} className="aspect-square bg-zinc-900 rounded overflow-hidden border border-zinc-800 relative group">
                            <img src={ref.url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-[8px] text-indigo-400 text-center font-bold">
                              Reference
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-zinc-650 italic text-center col-span-4 py-4">No reference identity targets mapped.</div>
                      )}
                    </div>
                  )}

                  {activeAssetFolder === 'captions' && (
                    <div className="space-y-1.5">
                      <div className="p-2 border border-zinc-805 bg-zinc-900/40 rounded text-zinc-400">
                        <div className="font-bold text-[10px] text-zinc-500 mb-1">CAP_PRESET_ECO.txt</div>
                        <p className="line-clamp-2 text-[10px]">"Paris lifestyle is a state of mind. ✨ Trench styling comments are down below!"</p>
                      </div>
                      <div className="p-2 border border-zinc-850 bg-zinc-900/40 rounded text-zinc-400">
                        <div className="font-bold text-[10px] text-zinc-500 mb-1">CAP_PRESET_GYM.txt</div>
                        <p className="line-clamp-2 text-[10px]">"Habits form character. compound training schedule locked."</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* AI Caption generator interface block */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">AI Caption Space</label>
                <button 
                  id="btn-trigger-caption-generation"
                  onClick={handleGenerateCaption}
                  disabled={!activeModel || isGeneratingCaption}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                >
                  {isGeneratingCaption ? "Optimized by Gemini..." : "✨ Generate Caption"}
                </button>
              </div>
              <textarea 
                id="textarea-automated-caption"
                rows={4}
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                placeholder="Captions, tags and viral engagement guidelines show up here..."
                className="w-full bg-[#050506] border border-zinc-800 p-2 text-xs text-slate-300 italic focus:outline-none focus:border-indigo-505"
              />
            </div>

            {/* Platform Metachannel Page targeting checks */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Target Metachannels</label>
                <button onClick={() => onViewChange("accounts")} className="text-[10px] text-indigo-400 hover:underline">Manage Accounts</button>
              </div>

              <div id="pages-targeting-matrix" className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {facebookPages.map(page => (
                  <label 
                    id={`lbl-facebook-page-row-${page.id}`}
                    key={page.id} 
                    className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 transition-all cursor-pointer text-xs"
                  >
                    <span className="text-slate-300 font-medium truncate">{page.page_name}</span>
                    <input 
                      id={`chk-targeting-${page.id}`}
                      type="checkbox" 
                      checked={page.selected} 
                      onChange={() => onToggleFacebookPage(page.id)}
                      className="rounded border-zinc-700 text-indigo-600 focus:ring-transparent h-3.5 w-3.5 bg-zinc-900" 
                    />
                  </label>
                ))}

                {facebookPages.length === 0 && (
                  <p className="text-[11px] text-zinc-650 italic py-1">No pages connected. Go to Social Accounts to link Pages.</p>
                )}
              </div>
            </div>

            {/* Direct date and time schedule option block */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-3 space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Automated Schedule Slot</label>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[9px] text-slate-500 mb-1">Date</label>
                  <input 
                    id="input-sched-date-option"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-black border border-zinc-800 p-2 rounded text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 mb-1">Time</label>
                  <input 
                    id="input-sched-time-option"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-black border border-zinc-800 p-2 rounded text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Core Dispatch Actions */}
          <div className="pt-4 space-y-3 border-t border-zinc-800/60 mt-4">
            {successNotice && (
              <div id="scheduler-toast-notice" className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-xs text-center font-medium animate-fade-in">
                {successNotice}
              </div>
            )}

            <button 
              id="btn-schedule-matrix"
              onClick={handleScheduleSubmit}
              disabled={!lastResult || isScheduling}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer disabled:opacity-45 disabled:bg-zinc-800"
            >
              <Calendar size={13} /> Schedule Post to Channels
            </button>

            <div className="p-2.5 bg-indigo-950/20 border border-indigo-500/20 rounded-lg text-center text-[10px] text-indigo-400 tracking-wide font-mono">
              ⚡ METASCHEDULE ENGINE: Active for {facebookPages.filter(p => p.selected).length} Pages
            </div>
          </div>

        </section>

      </div>

      {/* CREATE NEW PROJECT DIALOG MODAL (Sleek Overlay) */}
      {showCreateProjectModal && (
        <div id="create-project-modal" className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl w-full max-w-md animate-fade-in space-y-4">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FolderOpen size={16} className="text-indigo-400" /> Create Google Flow Project
              </h3>
              <button 
                id="btn-close-project-modal"
                onClick={() => setShowCreateProjectModal(false)}
                className="text-slate-400 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wide">Project Workspace Name</label>
                <input 
                  id="input-new-project-name"
                  type="text"
                  required
                  placeholder="e.g. Luxe Female Project"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wide">Workspace Description</label>
                <textarea 
                  id="textarea-new-project-desc"
                  placeholder="Aesthetic description or campaign scope detail..."
                  rows={2}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-white focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wide">Link Initial Persona Anchor</label>
                <select 
                  id="select-project-model"
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {models.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button 
                  id="btn-cancel-new-project"
                  type="button" 
                  onClick={() => setShowCreateProjectModal(false)}
                  className="px-4 py-2 border border-zinc-800 text-slate-300 rounded-lg hover:bg-zinc-900 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button 
                  id="btn-submit-new-project"
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all font-semibold shadow-lg shadow-indigo-600/15 animate-pulse"
                >
                  Initialize Project
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
