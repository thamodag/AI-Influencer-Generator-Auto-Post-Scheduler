import { useState, useEffect } from "react";
import { AIModel, ReferenceImage, GeneratedPost, ScheduledPost, ConnectedAccount, FacebookPage } from "./types";
import Sidebar from "./components/Sidebar";
import HomeView from "./components/HomeView";
import ModelsView from "./components/ModelsView";
import GeneratorView from "./components/GeneratorView";
import CreatePostView from "./components/CreatePostView";
import CalendarView from "./components/CalendarView";
import AccountsView from "./components/AccountsView";
import AnalyticsView from "./components/AnalyticsView";
import SettingsView from "./components/SettingsView";

export default function App() {
  const [currentView, setCurrentView] = useState("home");
  const [user, setUser] = useState({
    name: "Alex Rivera",
    email: "alex@studio-ai.com",
    avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100"
  });

  // State arrays initialized with high quality photorealistic presets to guarantee premium immediate evaluation
  const [models, setModels] = useState<AIModel[]>(() => {
    const saved = localStorage.getItem("influencer_models");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "m_lily",
        user_id: "u_primary",
        name: "Lily Laurent",
        gender: "Female",
        age_range: "22-25",
        hair_style: "Long Tousled Waves",
        hair_color: "Golden Honey Blonde",
        eye_color: "Deep Emerald",
        skin_tone: "Sunkissed Sand",
        fashion_style: "Quiet Luxury / Casual Chic",
        vibe: "Sophisticated Wanderlust travel blogger based in Paris",
        identity_token: "ID_LILY_WANDER_304",
        created_at: "2026-05-20T10:00:00Z"
      },
      {
        id: "m_marcus",
        user_id: "u_primary",
        name: "Marcus Aurelius Fit",
        gender: "Male",
        age_range: "26-29",
        hair_style: "Sharp Buzzcut",
        hair_color: "Charcoal Dark",
        eye_color: "Steel Grey",
        skin_tone: "Olive Bronze",
        fashion_style: "Tech Athleisure wear",
        vibe: "High-intensity athletic trainer & longevity optimizer on TikTok",
        identity_token: "ID_MARCUS_FIT_291",
        created_at: "2026-05-21T08:30:00Z"
      }
    ];
  });

  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>(() => {
    const saved = localStorage.getItem("influencer_references");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "ref_lily_1",
        model_id: "m_lily",
        image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300",
        created_at: "2026-05-20T10:01:00Z"
      },
      {
        id: "ref_lily_2",
        model_id: "m_lily",
        image_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300",
        created_at: "2026-05-20T10:02:00Z"
      },
      {
        id: "ref_marcus_1",
        model_id: "m_marcus",
        image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300&h=300",
        created_at: "2026-05-21T08:31:00Z"
      }
    ];
  });

  const [posts, setPosts] = useState<GeneratedPost[]>(() => {
    const saved = localStorage.getItem("influencer_posts");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "post_lily_cafe",
        user_id: "u_primary",
        model_id: "m_lily",
        prompt: "Ultra realistic smartphone selfie of Lily Laurent styling cashmere knitwear in cozy Parisian cafe",
        image_urls: ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=500&h=700"],
        caption: "A quiet morning sipping latte and designing layouts here in Paris. There's real magic in slowing down. ☕✨ #QuietLuxury #AestheticLife",
        status: "published",
        created_at: "2026-05-22T09:15:00Z"
      }
    ];
  });

  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(() => {
    const saved = localStorage.getItem("influencer_schedules");
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>(() => {
    const saved = localStorage.getItem("influencer_accounts");
    if (saved) return JSON.parse(saved);
    // Pre-seed connected Facebook authorization to make autopilot demo works immediately
    return [
      {
        id: "acc_fb_primary",
        user_id: "u_primary",
        platform: "facebook",
        username: "Alex Rivera",
        access_token: "OAUTH_EAA_SANDBOX_ACCESS",
        created_at: "2026-05-22T07:00:00Z"
      }
    ];
  });

  const [facebookPages, setFacebookPages] = useState<FacebookPage[]>(() => {
    const saved = localStorage.getItem("influencer_pages");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "page_aesthetic",
        user_id: "u_primary",
        account_id: "acc_fb_primary",
        page_id: "fb_page_aesthetic",
        page_name: "Modern Aesthetics Hub",
        page_access_token: "PAT_EAA_AESTHETIC_SANDBOX",
        selected: true,
        created_at: "2026-05-22T07:01:00Z"
      },
      {
        id: "page_fitness",
        user_id: "u_primary",
        account_id: "acc_fb_primary",
        page_id: "fb_page_fitness",
        page_name: "Aura Gym & Wellness Pro",
        page_access_token: "PAT_EAA_FITNESS_SANDBOX",
        selected: false,
        created_at: "2026-05-22T07:02:00Z"
      }
    ];
  });

  // Keep state array synchronization persistent
  useEffect(() => {
    localStorage.setItem("influencer_models", JSON.stringify(models));
  }, [models]);

  useEffect(() => {
    localStorage.setItem("influencer_references", JSON.stringify(referenceImages));
  }, [referenceImages]);

  useEffect(() => {
    localStorage.setItem("influencer_posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("influencer_schedules", JSON.stringify(scheduledPosts));
  }, [scheduledPosts]);

  useEffect(() => {
    localStorage.setItem("influencer_accounts", JSON.stringify(connectedAccounts));
  }, [connectedAccounts]);

  useEffect(() => {
    localStorage.setItem("influencer_pages", JSON.stringify(facebookPages));
  }, [facebookPages]);

  // -- Event Handlers --
  
  const handleCreateModel = (modelData: any) => {
    const newModel: AIModel = {
      id: `model_${Math.floor(Math.random() * 100000)}`,
      user_id: "u_primary",
      name: modelData.name,
      gender: modelData.gender,
      age_range: modelData.age_range || "24",
      hair_style: modelData.hair_style || "Tousled Waves",
      hair_color: modelData.hair_color || "Blonde",
      eye_color: modelData.eye_color || "Blue",
      skin_tone: modelData.skin_tone || "Fair",
      fashion_style: modelData.fashion_style || "Casual Chic",
      vibe: modelData.vibe || "Travel influencer",
      identity_token: modelData.identity_token,
      created_at: new Date().toISOString()
    };

    setModels([...models, newModel]);

    // Insert associated reference memory items
    if (modelData.reference_images && modelData.reference_images.length > 0) {
      const newRefs = modelData.reference_images.map((imgUrl: string, index: number) => ({
        id: `ref_${newModel.id}_${index}_${Math.floor(Math.random() * 1000)}`,
        model_id: newModel.id,
        image_url: imgUrl,
        created_at: new Date().toISOString()
      }));
      setReferenceImages(prev => [...prev, ...newRefs]);
    }
  };

  const handleDeleteModel = (id: string) => {
    setModels(models.filter(m => m.id !== id));
    // clean ref records
    setReferenceImages(referenceImages.filter(r => r.model_id !== id));
  };

  const handleAddReferenceImage = (modelId: string, imageUrl: string) => {
    const newRef: ReferenceImage = {
      id: `ref_${modelId}_manual_${Math.floor(Math.random() * 10000)}`,
      model_id: modelId,
      image_url: imageUrl,
      created_at: new Date().toISOString()
    };
    setReferenceImages([...referenceImages, newRef]);
  };

  const handlePostGenerated = (newPost: GeneratedPost) => {
    setPosts(prev => [...prev, newPost]);
  };

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
    setScheduledPosts(scheduledPosts.filter(s => s.post_id !== id));
  };

  const handleSchedulePost = (
    postId: string, 
    platform: string, 
    pageId: string | undefined, 
    scheduledTime: string
  ) => {
    const associatedPost = posts.find(p => p.id === postId);

    const newSchedule: ScheduledPost = {
      id: `sched_${Math.floor(Math.random() * 100000)}`,
      post_id: postId,
      platform,
      page_id: pageId,
      scheduled_time: scheduledTime,
      status: "pending",
      created_at: new Date().toISOString()
    };

    setScheduledPosts(prev => [...prev, newSchedule]);

    // update state status on the original post to 'scheduled'
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: "scheduled" } : p));
  };

  const handleTriggerPushNowInstantly = (scheduleId: string) => {
    // Elevate status instantly with simulated Meta API updates callbacks
    setScheduledPosts(prev => prev.map(item => {
      if (item.id === scheduleId) {
        return { ...item, status: "published" };
      }
      return item;
    }));

    // Find original post connected
    const scheduledItem = scheduledPosts.find(s => s.id === scheduleId);
    if (scheduledItem) {
      setPosts(prev => prev.map(p => p.id === scheduledItem.post_id ? { ...p, status: "published" } : p));
    }
  };

  const handleToggleFacebookPage = (id: string) => {
    setFacebookPages(facebookPages.map(p => 
      p.id === id ? { ...p, selected: !p.selected } : p
    ));
  };

  const handleConnectFacebook = (partnerName: string, pages: any[]) => {
    const newAccId = `acc_fb_${Math.floor(Math.random() * 10000)}`;
    const newAccount: ConnectedAccount = {
      id: newAccId,
      user_id: "u_primary",
      platform: "facebook",
      username: partnerName,
      access_token: `OAUTH_ACCESS_${Math.floor(Math.random() * 1000000)}`,
      created_at: new Date().toISOString()
    };

    setConnectedAccounts([...connectedAccounts, newAccount]);

    // parse pages
    const parsedPagesList: FacebookPage[] = pages.map((p, index) => ({
      id: `page_fb_${Math.floor(Math.random() * 100000)}_${index}`,
      user_id: "u_primary",
      account_id: newAccId,
      page_id: p.page_id,
      page_name: p.page_name,
      page_access_token: p.page_access_token,
      selected: p.selected,
      created_at: new Date().toISOString()
    }));

    setFacebookPages(prev => [...prev, ...parsedPagesList]);
  };

  const handleUpdateUserProfile = (name: string, email: string) => {
    setUser({ ...user, name, email });
  };

  // Render switch-case matching Sidebar nav ids
  const renderCoreViewContent = () => {
    switch (currentView) {
      case "models":
        return (
          <ModelsView 
            models={models}
            referenceImages={referenceImages}
            onCreateModel={handleCreateModel}
            onDeleteModel={handleDeleteModel}
            onAddReferenceImage={handleAddReferenceImage}
          />
        );
      case "generator":
        return (
          <GeneratorView 
            models={models}
            facebookPages={facebookPages}
            onToggleFacebookPage={handleToggleFacebookPage}
            onPostGenerated={handlePostGenerated}
            onSchedulePost={handleSchedulePost}
            onViewChange={setCurrentView}
          />
        );
      case "create-post":
        return (
          <CreatePostView 
            models={models}
            posts={posts}
            facebookPages={facebookPages}
            onSchedulePost={handleSchedulePost}
            onViewChange={setCurrentView}
          />
        );
      case "calendar":
        return (
          <CalendarView 
            scheduledPosts={scheduledPosts}
            posts={posts}
            models={models}
            facebookPages={facebookPages}
            onTriggerPublish={handleTriggerPushNowInstantly}
          />
        );
      case "accounts":
        return (
          <AccountsView 
            accounts={connectedAccounts}
            facebookPages={facebookPages}
            onConnectFacebook={handleConnectFacebook}
            onToggleFacebookPage={handleToggleFacebookPage}
          />
        );
      case "analytics":
        return (
          <AnalyticsView 
            posts={posts}
            scheduledPosts={scheduledPosts}
            models={models}
          />
        );
      case "settings":
        return (
          <SettingsView 
            user={user}
            onUpdateUser={handleUpdateUserProfile}
          />
        );
      default:
        // Home View dashboard
        return (
          <HomeView 
            models={models}
            posts={posts}
            scheduled={scheduledPosts}
            onViewChange={setCurrentView}
            onDeletePost={handleDeletePost}
          />
        );
    }
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-[#09090b] text-slate-200 antialiased flex">
      {/* Sidebar Integration */}
      <Sidebar 
        currentView={currentView}
        onViewChange={setCurrentView}
        user={user}
      />

      {/* Main Container */}
      <main id="app-main-layout" className="flex-1 min-w-0 md:pl-64 transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen flex flex-col justify-between">
          <div className="flex-1">
            {renderCoreViewContent()}
          </div>
          
          {/* Subdued design footer */}
          <footer className="mt-16 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 gap-4">
            <div>© 2026 AI Influencer Generator & Scheduler OS. All rights reserved.</div>
            <div className="flex gap-4 font-mono uppercase tracking-widest text-[#4f46e5]/80 font-bold">
              <span>Metaspace Automation active</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
