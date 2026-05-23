export interface AppUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  created_at: string;
}

export interface AIModel {
  id: string;
  user_id: string;
  name: string;
  gender: string;
  age_range: string;
  hair_style: string;
  hair_color: string;
  eye_color: string;
  skin_tone: string;
  fashion_style: string;
  vibe: string;
  identity_token: string;
  created_at: string;
}

export interface ReferenceImage {
  id: string;
  model_id: string;
  image_url: string;
  created_at: string;
}

export interface GeneratedPost {
  id: string;
  user_id: string;
  model_id: string;
  prompt: string;
  caption: string;
  image_urls: string[];
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  created_at: string;
}

export interface ConnectedAccount {
  id: string;
  user_id: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'x' | 'pinterest' | 'threads';
  username: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  created_at: string;
}

export interface FacebookPage {
  id: string;
  user_id: string;
  page_id: string;
  page_name: string;
  page_access_token: string;
  selected: boolean;
  created_at: string;
}

export interface ScheduledPost {
  id: string;
  post_id: string;
  platform: string;
  page_id?: string;
  scheduled_time: string; // ISO String
  status: 'pending' | 'publishing' | 'published' | 'failed';
  error_message?: string;
  created_at: string;
}

export interface GoogleAccountSession {
  connected: boolean;
  email: string;
  name: string;
  avatar_url: string;
  connected_at: string;
  accessToken?: string;
}

export interface FlowProject {
  id: string;
  user_id: string;
  name: string;
  description: string;
  model_id: string; // Active associated character model
  vibe: string;
  scene_presets: string[];
  camera_styles: string[];
  style_presets: string[];
  created_at: string;
}

export interface FlowAsset {
  id: string;
  project_id: string;
  folder: 'reference-images' | 'generated-posts' | 'reels' | 'thumbnails' | 'captions';
  name: string;
  url: string;
  created_at: string;
}

