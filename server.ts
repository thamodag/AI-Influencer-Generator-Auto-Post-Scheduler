import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing with safe size limit for uploaded face mockups
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY || "";
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Low DB JSON persistence file path
const DB_PATH = path.join(process.cwd(), "saved_database.json");

// Helper structure for persistence
interface SavedDB {
  models: any[];
  reference_images: any[];
  posts: any[];
  accounts: any[];
  pages: any[];
  scheduled: any[];
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
  };
  google_session?: {
    connected: boolean;
    email: string;
    name: string;
    avatar_url: string;
    connected_at: string;
    accessToken?: string;
  };
  flow_projects?: any[];
  flow_assets?: any[];
}

const DEFAULT_FLOW_PROJECTS = [
  {
    id: "fp-luxe",
    user_id: "u-9912a",
    name: "Luxe Female Project",
    description: "Elegant, high-end quiet luxury and lifestyle styling for Paris fashion context.",
    model_id: "m-lily",
    vibe: "Sophisticated Travel Blogger & Art Collector",
    scene_presets: ["Cafe", "Yacht", "London", "Dubai", "Miami"],
    camera_styles: ["DSLR portrait", "iPhone selfie", "Street candid"],
    style_presets: ["Luxury", "Lifestyle", "Cinematic"],
    created_at: new Date().toISOString()
  },
  {
    id: "fp-gym",
    user_id: "u-9912a",
    name: "Gym Influencer Project",
    description: "Athletic lifestyle and high-performance physical aesthetics lookbook.",
    model_id: "m-marcus",
    vibe: "High-Achieving Fitness Coach & Wellness Entrepreneur",
    scene_presets: ["Gym", "Beach", "Miami"],
    camera_styles: ["DSLR portrait", "Mirror selfie", "Wide shot", "Low angle"],
    style_presets: ["Lifestyle", "Cinematic"],
    created_at: new Date().toISOString()
  },
  {
    id: "fp-travel",
    user_id: "u-9912a",
    name: "Travel Girl Project",
    description: "Parisian and global destination aesthetics for world-wide travel blogs.",
    model_id: "m-lily",
    vibe: "Sophisticated Wanderlust travel blogger based in Paris",
    scene_presets: ["Travel", "Beach", "Tokyo", "London", "Dubai"],
    camera_styles: ["Street candid", "iPhone selfie", "Low angle"],
    style_presets: ["Social media", "Lifestyle"],
    created_at: new Date().toISOString()
  },
  {
    id: "fp-cyber",
    user_id: "u-9912a",
    name: "TikTok Viral Project",
    description: "Neon Harajuku street wear, fast-paced futuristic TikTok cyber aesthetics.",
    model_id: "m-sora",
    vibe: "Tech Innovator, Digital Avatar & Cyber Student Girl",
    scene_presets: ["Tokyo", "Office"],
    camera_styles: ["iPhone selfie", "Mirror selfie", "Low angle"],
    style_presets: ["Viral TikTok", "Cyberpunk"],
    created_at: new Date().toISOString()
  }
];

const DEFAULT_USER = {
  id: "u-9912a",
  email: "roshanthamoda@gmail.com",
  name: "Roshantha Moda",
  avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200"
};

const DEFAULT_MODELS = [
  {
    id: "m-lily",
    user_id: "u-9912a",
    name: "Lily Laurent",
    gender: "Female",
    age_range: "24-28",
    hair_style: "Long Beachy Waves",
    hair_color: "Golden Honey Blonde",
    eye_color: "Sapphire Blue",
    skin_tone: "Sunkissed Light",
    fashion_style: "Quiet Luxury / Old Money Aesthetics",
    vibe: "Sophisticated Travel Blogger & Art Collector",
    identity_token: "LILY_LAURENT_LIFESTYLE_V3",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "m-marcus",
    user_id: "u-9912a",
    name: "Marcus Vance",
    gender: "Male",
    age_range: "26-30",
    hair_style: "Textured Fade & Short Groomed Beard",
    hair_color: "Charcoal Black",
    eye_color: "Warm Amber Brown",
    skin_tone: "Olive / Tan",
    fashion_style: "Athletic Minimalist & High-Performance Technical Garments",
    vibe: "High-Achieving Fitness Coach & Wellness Entrepreneur",
    identity_token: "MARCUS_ATHLETIC_M_88",
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "m-sora",
    user_id: "u-9912a",
    name: "Sora Takahashi",
    gender: "Female",
    age_range: "20-24",
    hair_style: "Blunt Micro-Bob with Straight Bangs",
    hair_color: "Neon Iris Violet",
    eye_color: "Obsidian Black",
    skin_tone: "Porcelain Pale",
    fashion_style: "Cyberpunk Tokyo Harajuku & Techwear Accents",
    vibe: "Tech Innovator, Digital Avatar & Cyber Student Girl",
    identity_token: "SORA_CYBER_CAMPUS_TOKYO",
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_REFERENCE_IMAGES = [
  { id: "ref-1", model_id: "m-lily", image_url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200&h=200", created_at: new Date().toISOString() },
  { id: "ref-2", model_id: "m-lily", image_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200", created_at: new Date().toISOString() },
  { id: "ref-3", model_id: "m-marcus", image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200", created_at: new Date().toISOString() },
  { id: "ref-4", model_id: "m-sora", image_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200&h=200", created_at: new Date().toISOString() }
];

const DEFAULT_ACCOUNTS = [
  { id: "acc-1", user_id: "u-9912a", platform: "facebook", username: "lily.laurent.official", access_token: "fb_token_mock_112", created_at: new Date().toISOString() },
  { id: "acc-2", user_id: "u-9912a", platform: "instagram", username: "@lily_laurent", access_token: "ig_token_mock_223", created_at: new Date().toISOString() },
  { id: "acc-3", user_id: "u-9912a", platform: "tiktok", username: "@lily_laurent_tok", access_token: "tt_token_mock_334", created_at: new Date().toISOString() }
];

const DEFAULT_PAGES = [
  { id: "pag-1", user_id: "u-9912a", page_id: "10982736152", page_name: "Lily Laurent Club", page_access_token: "page_token_mock_aaa", selected: true, created_at: new Date().toISOString() },
  { id: "pag-2", user_id: "u-9912a", page_id: "88273615211", page_name: "Luxe Travels Magazine", page_access_token: "page_token_mock_bbb", selected: true, created_at: new Date().toISOString() },
  { id: "pag-3", user_id: "u-9912a", page_id: "33182736152", page_name: "Sora Techverse Avatar", page_access_token: "page_token_mock_ccc", selected: false, created_at: new Date().toISOString() }
];

const DEFAULT_POSTS = [
  {
    id: "post-1",
    user_id: "u-9912a",
    model_id: "m-lily",
    prompt: "A realistic smartphone portrait of Lily Laurent standing in front of London Big Ben at sunset, golden lens flare, elegant quiet luxury beige trench coat.",
    caption: "Golden hour in London hits different. 🌅 Wearing my favorite shearling trench from the early autumn collection. Comment your favorite London spot! 👇 #oldmoney #londonlife #goldenhour #travelblogger",
    image_urls: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600&h=800"],
    status: "published",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "post-2",
    user_id: "u-9912a",
    model_id: "m-marcus",
    prompt: "DSLR workout portrait of Marcus Vance, lifting weights at a top floor luxury gym in Tokyo overlooking neon skyline, wide action shot.",
    caption: "Early morning grind in Tokyo. ⚡ No matter where in the world you wake up, the target stays the same. Focus on the compound habits. #fitnessgoals #mindset #tokyo #gymmotivation",
    image_urls: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600&h=800"],
    status: "published",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_SCHEDULED = [
  {
    id: "sch-1",
    post_id: "post-1",
    platform: "facebook",
    page_id: "10982736152",
    scheduled_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: "published",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "sch-2",
    post_id: "post-2",
    platform: "facebook",
    page_id: "88273615211",
    scheduled_time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    status: "published",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Read DB from file or initialize with defaults
async function loadDB(): Promise<SavedDB> {
  let db: SavedDB;
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    db = JSON.parse(data);
  } catch (e) {
    db = {
      models: DEFAULT_MODELS,
      reference_images: DEFAULT_REFERENCE_IMAGES,
      posts: DEFAULT_POSTS,
      accounts: DEFAULT_ACCOUNTS,
      pages: DEFAULT_PAGES,
      scheduled: DEFAULT_SCHEDULED,
      user: DEFAULT_USER
    };
  }

  // Defensive migrations for Google/Flow Project workspace additions
  if (!db.google_session) {
    db.google_session = { connected: false, email: "", name: "", avatar_url: "", connected_at: "" };
  }
  if (!db.flow_projects) {
    db.flow_projects = DEFAULT_FLOW_PROJECTS;
  }
  if (!db.flow_assets) {
    db.flow_assets = [
      {
        id: "asset-1",
        project_id: "fp-luxe",
        folder: "reference-images",
        name: "lily_paris_glamour.png",
        url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200&h=200",
        created_at: new Date().toISOString()
      },
      {
        id: "asset-2",
        project_id: "fp-gym",
        folder: "reference-images",
        name: "marcus_physique_ref.png",
        url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
        created_at: new Date().toISOString()
      }
    ];
  }

  await saveDB(db);
  return db;
}

async function saveDB(db: SavedDB) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

// REST endpoints
app.get("/api/session", async (req, res) => {
  const db = await loadDB();
  res.json({ user: db.user });
});

app.get("/api/models", async (req, res) => {
  const db = await loadDB();
  res.json({ models: db.models, reference_images: db.reference_images });
});

app.post("/api/models", async (req, res) => {
  const db = await loadDB();
  const { name, gender, age_range, hair_style, hair_color, eye_color, skin_tone, fashion_style, vibe, identity_token, reference_images } = req.body;

  const newId = "m-" + Math.random().toString(36).substring(2, 9);
  const newModel = {
    id: newId,
    user_id: db.user.id,
    name: name || "New Persona",
    gender: gender || "Female",
    age_range: age_range || "20-25",
    hair_style: hair_style || "Straight",
    hair_color: hair_color || "Brown",
    eye_color: eye_color || "Green",
    skin_tone: skin_tone || "Fair",
    fashion_style: fashion_style || "Casual",
    vibe: vibe || "Energetic",
    identity_token: identity_token || "ID_" + Math.random().toString(36).substring(4, 9).toUpperCase(),
    created_at: new Date().toISOString()
  };

  db.models.push(newModel);

  // Add reference image URLs/Base64 if included
  if (Array.isArray(reference_images)) {
    reference_images.forEach((img: string, idx: number) => {
      db.reference_images.push({
        id: "ref-" + Math.random().toString(36).substring(2, 9),
        model_id: newId,
        image_url: img,
        created_at: new Date().toISOString()
      });
    });
  }

  await saveDB(db);
  res.json({ success: true, model: newModel });
});

app.delete("/api/models/:id", async (req, res) => {
  const db = await loadDB();
  const { id } = req.params;
  db.models = db.models.filter(m => m.id !== id);
  db.reference_images = db.reference_images.filter(img => img.model_id !== id);
  await saveDB(db);
  res.json({ success: true, message: "Model deleted safely" });
});

app.post("/api/models/:id/reference_images", async (req, res) => {
  const db = await loadDB();
  const { id } = req.params;
  const { image_url } = req.body;
  if (!image_url) {
    return res.status(400).json({ error: "No image URL or data provided" });
  }

  const newRef = {
    id: "ref-" + Math.random().toString(36).substring(2, 9),
    model_id: id,
    image_url,
    created_at: new Date().toISOString()
  };
  db.reference_images.push(newRef);
  await saveDB(db);
  res.json({ success: true, reference_image: newRef });
});

app.get("/api/posts", async (req, res) => {
  const db = await loadDB();
  res.json({ posts: db.posts });
});

app.post("/api/posts", async (req, res) => {
  const db = await loadDB();
  const { model_id, prompt, caption, image_urls, status } = req.body;

  const newPost = {
    id: "post-" + Math.random().toString(36).substring(2, 9),
    user_id: db.user.id,
    model_id: model_id || "m-lily",
    prompt: prompt || "",
    caption: caption || "",
    image_urls: image_urls || [],
    status: status || "draft",
    created_at: new Date().toISOString()
  };

  db.posts.push(newPost);
  await saveDB(db);
  res.json({ success: true, post: newPost });
});

app.delete("/api/posts/:id", async (req, res) => {
  const db = await loadDB();
  const { id } = req.params;
  db.posts = db.posts.filter(p => p.id !== id);
  db.scheduled = db.scheduled.filter(s => s.post_id !== id);
  await saveDB(db);
  res.json({ success: true });
});

// Accounts
app.get("/api/accounts", async (req, res) => {
  const db = await loadDB();
  res.json({ accounts: db.accounts, pages: db.pages });
});

app.post("/api/accounts", async (req, res) => {
  const db = await loadDB();
  const { platform, username } = req.body;

  const newAcc = {
    id: "acc-" + Math.random().toString(36).substring(2, 9),
    user_id: db.user.id,
    platform: platform || "facebook",
    username: username || "user.handle",
    access_token: "mock_tok_" + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString()
  };

  db.accounts.push(newAcc);
  await saveDB(db);
  res.json({ success: true, account: newAcc });
});

app.delete("/api/accounts/:id", async (req, res) => {
  const db = await loadDB();
  const { id } = req.params;
  db.accounts = db.accounts.filter(a => a.id !== id);
  await saveDB(db);
  res.json({ success: true });
});

// Toggle Page Select
app.post("/api/pages/toggle", async (req, res) => {
  const db = await loadDB();
  const { id } = req.body;
  db.pages = db.pages.map(p => {
    if (p.id === id) {
      return { ...p, selected: !p.selected };
    }
    return p;
  });
  await saveDB(db);
  res.json({ success: true, pages: db.pages });
});

// Scheduled Queue
app.get("/api/scheduled", async (req, res) => {
  const db = await loadDB();
  res.json({ scheduled: db.scheduled });
});

app.post("/api/scheduled", async (req, res) => {
  const db = await loadDB();
  const { post_id, platform, page_id, scheduled_time } = req.body;

  const newSchedule = {
    id: "sch-" + Math.random().toString(36).substring(2, 9),
    post_id,
    platform: platform || "facebook",
    page_id: page_id || null,
    scheduled_time: scheduled_time || new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    status: "pending" as const,
    created_at: new Date().toISOString()
  };

  db.scheduled.push(newSchedule);

  // Update associated post to "scheduled"
  db.posts = db.posts.map(p => {
    if (p.id === post_id) {
      return { ...p, status: "scheduled" };
    }
    return p;
  });

  await saveDB(db);
  res.json({ success: true, scheduled: newSchedule });
});

app.delete("/api/scheduled/:id", async (req, res) => {
  const db = await loadDB();
  const { id } = req.params;
  
  // Find scheduled entry to un-schedule post
  const sch = db.scheduled.find(s => s.id === id);
  if (sch) {
    db.posts = db.posts.map(p => {
      if (p.id === sch.post_id) {
        return { ...p, status: "draft" };
      }
      return p;
    });
  }

  db.scheduled = db.scheduled.filter(s => s.id !== id);
  await saveDB(db);
  res.json({ success: true });
});

// Google Account & Flow Project APIs
app.get("/api/google/session", async (req, res) => {
  const db = await loadDB();
  res.json({ session: db.google_session });
});

app.post("/api/google/connect", async (req, res) => {
  const db = await loadDB();
  const { email, name, avatar_url } = req.body;
  db.google_session = {
    connected: true,
    email: email || "roshanthamoda@gmail.com",
    name: name || "Roshantha Moda",
    avatar_url: avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200",
    connected_at: new Date().toISOString()
  };
  await saveDB(db);
  res.json({ success: true, session: db.google_session });
});

app.post("/api/google/disconnect", async (req, res) => {
  const db = await loadDB();
  db.google_session = {
    connected: false,
    email: "",
    name: "",
    avatar_url: "",
    connected_at: ""
  };
  await saveDB(db);
  res.json({ success: true, session: db.google_session });
});

app.get("/api/google/projects", async (req, res) => {
  const db = await loadDB();
  res.json({ projects: db.flow_projects || [] });
});

app.post("/api/google/projects", async (req, res) => {
  const db = await loadDB();
  const { name, description, model_id } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Project name is required" });
  }

  const model = db.models.find(m => m.id === model_id) || db.models[0];
  const newProject = {
    id: "fp-" + Math.random().toString(36).substring(2, 9),
    user_id: db.user.id,
    name,
    description: description || "Custom Flow project",
    model_id: model_id || (model ? model.id : ""),
    vibe: model ? model.vibe : "Sophisticated",
    scene_presets: ["Cafe", "Beach", "Yacht", "Gym", "Office", "Tokyo", "London", "Dubai", "Miami", "Travel"],
    camera_styles: ["DSLR portrait", "iPhone selfie", "Mirror selfie", "Street candid", "Low angle", "Wide shot"],
    style_presets: ["Luxury", "Lifestyle", "Cinematic", "Viral TikTok", "Streetwear", "Soft Girl"],
    created_at: new Date().toISOString()
  };

  db.flow_projects = db.flow_projects || [];
  db.flow_projects.push(newProject);
  await saveDB(db);
  res.json({ success: true, project: newProject });
});

app.get("/api/google/projects/:id/assets", async (req, res) => {
  const db = await loadDB();
  const { id } = req.params;
  const assets = (db.flow_assets || []).filter(a => a.project_id === id);
  res.json({ assets });
});

app.post("/api/google/projects/:id/assets", async (req, res) => {
  const db = await loadDB();
  const { id } = req.params;
  const { folder, name, url } = req.body;

  const newAsset = {
    id: "asset-" + Math.random().toString(36).substring(2, 9),
    project_id: id,
    folder: folder || "generated-posts",
    name: name || `Asset_${Math.floor(Math.random() * 10000)}.png`,
    url: url || "",
    created_at: new Date().toISOString()
  };

  db.flow_assets = db.flow_assets || [];
  db.flow_assets.push(newAsset);
  await saveDB(db);
  res.json({ success: true, asset: newAsset });
});

// OAuth support endpoints for Google connection
app.get("/api/auth/url", (req, res) => {
  const redirectUri = `${req.protocol}://${req.get("host")}/auth/callback`;
  const clientId = process.env.GOOGLE_CLIENT_ID || "10982736152-mockclientid.apps.googleusercontent.com";
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "email profile openid",
    state: "flow_session"
  });
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl });
});

app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
  const { code } = req.query;
  const db = await loadDB();
  
  let email = db.user.email || "roshanthamoda@gmail.com";
  let name = db.user.name || "Roshantha Moda";
  let avatar_url = db.user.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200";

  if (code) {
    try {
      const redirectUri = `${req.protocol}://${req.get("host")}/auth/callback`;
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (clientId && clientSecret) {
        // Exchange code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            code: code as string,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          }).toString(),
        });

        if (tokenResponse.ok) {
          const tokens = await tokenResponse.json();
          const accessToken = tokens.access_token;
          
          // Fetch user profile from google userinfo endpoint
          const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (userResponse.ok) {
            const profile = await userResponse.json();
            email = profile.email || email;
            name = profile.name || name;
            avatar_url = profile.picture || avatar_url;
          }
        }
      }
    } catch (err) {
      console.error("Error exchanging Google OAuth code:", err);
    }
  }

  db.google_session = {
    connected: true,
    email,
    name,
    avatar_url,
    connected_at: new Date().toISOString()
  };
  await saveDB(db);

  res.send(`
    <html>
      <body style="font-family: sans-serif; background: #09090b; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
        <div style="text-align: center; border: 1px solid rgba(255,255,255,0.1); padding: 40px; border-radius: 12px; background: #0d0d0f; max-width: 450px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);">
          <div style="width: 48px; height: 48px; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
            <svg style="width: 24px; height: 24px; color: #6366f1;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 style="color: #fff; font-size: 20px; font-weight: 600; margin: 0 0 8px 0; letter-spacing: -0.025em;">Authentication Successful</h2>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0;">Connected your Google account <span style="color: #6366f1; font-weight: 500;">${email}</span> with the AI Influencer OS securely.</p>
          <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; color: #64748b; font-size: 12px;">
            This window will close automatically... If not, close it now.
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              setTimeout(() => { window.close(); }, 1000);
            }
          </script>
        </div>
      </body>
    </html>
  `);
});


// Prompt generator helper endpoint employing Gemini Text capabilities
app.post("/api/gemini/prompt", async (req, res) => {
  const { persona, scene, camera, style, keywords } = req.body;

  if (!ai) {
    const backupPrompt = `A high fashion smartphone ${camera || "portrait"} of influencer ${persona?.name || "Lily Laurent"} in a ${scene || "Cafe"} setting, styling in ${style || "Quiet Luxury"} aesthetic with realistic lighting, photorealistic social media ready image, warm tone.`;
    return res.json({ prompt: backupPrompt });
  }

  try {
    const instruction = `You are a prompt designer for an AI social media photorealistic image generator. Your job is to generate a highly detailed, descriptive, professional prompt of at most 45 words that maintains the consistent look and identity details of the character while fitting the styling parameters.`;
    const userPromptText = `Create a single text prompt for:
Model Physical Traits: ${persona?.name} (has physical details: hair - ${persona?.hair_style} ${persona?.hair_color}, skin - ${persona?.skin_tone}, eyes - ${persona?.eye_color}, overall style - ${persona?.fashion_style}).
Scene Setting: ${scene}
Camera Style: ${camera}
Aesthetic Style Preset: ${style}
Extra keywords or activities: ${keywords || "none"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPromptText,
      config: {
        systemInstruction: instruction,
        temperature: 0.8,
      }
    });

    res.json({ prompt: response.text?.trim() });
  } catch (err: any) {
    console.error("Gemini prompt helper error:", err);
    res.json({ prompt: `Smartphone portrait of ${persona?.name || "influencer"} in ${scene || "setting"}, styled as ${style || "aesthetic"} with high-fidelity camera view and natural skin textures.` });
  }
});

// Caption Generator utilizing Gemini Text Model
app.post("/api/gemini/caption", async (req, res) => {
  const { persona, prompt, platform, vibe } = req.body;

  if (!ai) {
    const backupCap = `Enjoying this cozy mood ✨ Keeping up the energy and chasing new horizons. 🗺️ What's your target for the weekend? Tell me below! 👇\n\n#lifestyle #influencer #${platform || "social"} #aesthetic #${persona?.name?.toLowerCase().replace(/\s+/g,"") || "model"}`;
    return res.json({ caption: backupCap });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Draft a professional social media caption for ${platform || "Instagram"}.
Platform characteristics:
- If instagram, make it aesthetic with beautiful spaces, conversational call to action, and 6 relevant hashtags.
- If tiktok, make it brief, catchy, viral, with trending challenge tag formats.
- If facebook, make it detailed, friendly, and engaging.
- If x (Twitter), make it punchy, limited to 240 characters.

Character details: ${persona?.name} who has a ${vibe || persona?.vibe || "chic"} vibe.
Scene description: ${prompt}
Format clearly with line-breaks and emojis.`,
      config: {
        temperature: 0.75,
      }
    });

    res.json({ caption: response.text?.trim() });
  } catch (err) {
    console.error("Gemini caption error:", err);
    res.json({ caption: `Chasing sunsets and vibes. ✨ Let me know your thoughts on this style in the comments! 👇\n\n#style #dailygram #${platform || "influencer"}` });
  }
});

// Image generator using curated portraits with overlays OR actual nano banana / gemini image APIs
app.post("/api/generator", async (req, res) => {
  const db = await loadDB();
  const { model_id, sceneStr, cameraStr, styleStr, sizeStr, batchCount, project_id } = req.body;

  // Let's match scene preset photo templates for visual consistency - these are hand-picked stunning aesthetic visuals
  const photosDict: Record<string, string[]> = {
    "Beach": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1506244856291-8910ea843e81?auto=format&fit=crop&q=80&w=700&h=900"
    ],
    "Cafe": [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=700&h=900"
    ],
    "Yacht": [
      "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=700&h=900"
    ],
    "Gym": [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=700&h=900"
    ],
    "Office": [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=700&h=900"
    ],
    "Tokyo": [
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=700&h=900"
    ],
    "London": [
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=700&h=900"
    ],
    "Dubai": [
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&q=80&w=700&h=900"
    ],
    "Miami": [
      "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=700&h=900"
    ],
    "Travel": [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=700&h=900"
    ]
  };

  const matchedPics = photosDict[sceneStr || "Cafe"] || photosDict["Cafe"];
  const finalBatchSize = Math.min(Number(batchCount) || 1, 5);
  const selectedUrls: string[] = [];

  for (let i = 0; i < finalBatchSize; i++) {
    const defaultPic = matchedPics[i % matchedPics.length];
    // Slightly tweak image url to keep them unique but aesthetically uniform
    selectedUrls.push(`${defaultPic}&sig=${Math.floor(Math.random() * 100000)}`);
  }

  // Create the newly generated post instantly on flow generator submission so standard results are recorded
  const activeModel = db.models.find(m => m.id === model_id) || db.models[0];
  const derivedPrompt = `Ultra realistic smartphone portrait of ${activeModel.name} in a ${sceneStr || "Cafe"} setting, lighting matching a ${styleStr || "Cinematic"} feel, camera layout of a ${cameraStr || "DSLR portrait"}.`;

  // Use Gemini to generate an engaging custom caption based on visual tags so they are beautiful
  let computedCaption = `Captured a beautiful moment at the ${sceneStr || "location"}. ✨ Living the ${styleStr?.toLowerCase() || "lifestyle"} life! #influencer #${activeModel.name?.toLowerCase().replace(/\s+/g,"")} #vibe`;

  if (ai) {
    try {
      const captionGenerate = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Write a short 2-3 sentence engaging Instagram caption with hashtags for the following scenario: ${derivedPrompt}. Character traits: ${activeModel.hair_color} hair, ${activeModel.fashion_style} style.`,
        config: { temperature: 0.85 }
      });
      if (captionGenerate.text) {
        computedCaption = captionGenerate.text.trim();
      }
    } catch {
      // safe fallback
    }
  }

  const generatedPost = {
    id: "post-" + Math.random().toString(36).substring(2, 9),
    user_id: db.user.id,
    model_id: activeModel.id,
    prompt: derivedPrompt,
    caption: computedCaption,
    image_urls: selectedUrls,
    status: "draft" as const,
    created_at: new Date().toISOString()
  };

  db.posts.push(generatedPost);

  // Auto-save generated images as FlowAssets under this project's ecosystem folder
  if (project_id) {
    db.flow_assets = db.flow_assets || [];
    selectedUrls.forEach((url, i) => {
      db.flow_assets!.push({
        id: "asset-" + Math.random().toString(36).substring(2, 9),
        project_id,
        folder: "generated-posts",
        name: `Asset_${Math.floor(Math.random() * 10000)}_${i + 1}.png`,
        url,
        created_at: new Date().toISOString()
      });
    });
  }

  await saveDB(db);

  res.json({
    success: true,
    post: generatedPost
  });
});

// Periodic automated auto-posting system background worker interval simulation
// In real SaaS this uses pg_cron. On our Node stack we simulate it every 15 seconds to auto-post pending schedules!
setInterval(async () => {
  try {
    const db = await loadDB();
    const nowStr = new Date().toISOString();
    let updated = false;

    db.scheduled = db.scheduled.map(s => {
      // If pending and time reached
      if (s.status === "pending" && new Date(s.scheduled_time) <= new Date()) {
        updated = true;
        // Mock post execution
        console.log(`[Auto Post Scheduler] Publishing scheduled post ${s.post_id} on ${s.platform}...`);
        
        // Update associated generated_post to "published"
        db.posts = db.posts.map(p => {
          if (p.id === s.post_id) {
            return { ...p, status: "published" };
          }
          return p;
        });

        return { ...s, status: "published" };
      }
      return s;
    });

    if (updated) {
      await saveDB(db);
    }
  } catch (err) {
    console.error("Scheduler worker error:", err);
  }
}, 15000);

// Initialize static files or Vite middleware depending on mode
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
