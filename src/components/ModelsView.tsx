import React, { useState } from "react";
import { AIModel, ReferenceImage } from "../types";
import { 
  Users, 
  Plus, 
  Trash2, 
  Camera, 
  Sparkles, 
  Cpu, 
  UserPlus, 
  Check, 
  HelpCircle,
  FileText
} from "lucide-react";

interface ModelsViewProps {
  models: AIModel[];
  referenceImages: ReferenceImage[];
  onCreateModel: (modelData: any) => void;
  onDeleteModel: (id: string) => void;
  onAddReferenceImage: (modelId: string, imageUrl: string) => void;
}

export default function ModelsView({ 
  models, 
  referenceImages, 
  onCreateModel, 
  onDeleteModel, 
  onAddReferenceImage 
}: ModelsViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("Female");
  const [ageRange, setAgeRange] = useState("20-25");
  const [hairStyle, setHairStyle] = useState("Long Tousled Waves");
  const [hairColor, setHairColor] = useState("Golden Honey Blonde");
  const [eyeColor, setEyeColor] = useState("Hazel Blue");
  const [skinTone, setSkinTone] = useState("Sunkissed Sand");
  const [fashionStyle, setFashionStyle] = useState("Quiet Luxury / Casual Chic");
  const [vibe, setVibe] = useState("Sophisticated Wanderlust travel blogger");
  const [identityToken, setIdentityToken] = useState("");
  const [referenceImagesInput, setReferenceImagesInput] = useState<string[]>([
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300"
  ]);

  // Handle auto generation of perfect identity tokens
  const triggerAutoToken = () => {
    const cleanName = name.replace(/\s+/g, "_").toUpperCase();
    const cleanVibe = vibe.split(" ")[0]?.toUpperCase() || "LIFESTYLE";
    const rand = Math.floor(Math.random() * 900 + 100);
    setIdentityToken(`ID_${cleanName || "INFLUENCER"}_${cleanVibe}_${rand}`);
  };

  const [activeRefInput, setActiveRefInput] = useState("");

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const token = identityToken || `ID_${name.replace(/\s+/g, "_").toUpperCase()}_${Math.floor(Math.random()*1000)}`;

    onCreateModel({
      name,
      gender,
      age_range: ageRange,
      hair_style: hairStyle,
      hair_color: hairColor,
      eye_color: eyeColor,
      skin_tone: skinTone,
      fashion_style: fashionStyle,
      vibe,
      identity_token: token,
      reference_images: referenceImagesInput
    });

    // Reset Form
    setName("");
    setIdentityToken("");
    setIsCreating(false);
  };

  const handleAddUrlToImagesInput = () => {
    if (activeRefInput.trim()) {
      setReferenceImagesInput([...referenceImagesInput, activeRefInput.trim()]);
      setActiveRefInput("");
    }
  };

  return (
    <div id="models-studio-page" className="space-y-6 animate-fade-in text-slate-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
            <Users className="text-indigo-400" size={20} /> Models Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build and nurture physically consistent AI influencer faces, lock identities, and store visual memories.
          </p>
        </div>
        <button
          id="btn-trigger-creation"
          onClick={() => {
            setIsCreating(!isCreating);
            // Suggest initial identity token
            triggerAutoToken();
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/10 cursor-pointer"
        >
          {isCreating ? "Cancel" : "Create Persona"} <Plus size={14} />
        </button>
      </div>

      {isCreating && (
        <form 
          id="form-create-model"
          onSubmit={handleAddModel} 
          className="bg-[#0c0c0e] border border-white/10 rounded-xl p-6 space-y-6 max-w-4xl"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-400" size={16} />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Configure New Identity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Influencer Name</label>
                <input 
                  id="input-model-name"
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lily Laurent"
                  className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Gender Focus</label>
                <select 
                  id="select-model-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-xs text-white focus:outline-none"
                >
                  <option value="Female">Female Persona</option>
                  <option value="Male">Male Persona</option>
                  <option value="Nonbinary">Non-binary Persona</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Age Bracket</label>
                <input 
                  id="input-model-age"
                  type="text"
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  placeholder="e.g. 23-26"
                  className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Creative Vibe / Personality</label>
                <textarea 
                  id="input-model-vibe"
                  rows={2}
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  placeholder="e.g. Travel and wellness Blogger based in Tokyo, aesthetic cozy posts"
                  className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>
            </div>

            {/* Hair and Face Physical consistency details */}
            <div className="space-y-4 col-span-1">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Hair Style Focus</label>
                <input 
                  id="input-model-hairstyle"
                  type="text"
                  value={hairStyle}
                  onChange={(e) => setHairStyle(e.target.value)}
                  placeholder="e.g. Messy beach waves"
                  className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Hair Color</label>
                  <input 
                    id="input-model-haircolor"
                    type="text"
                    value={hairColor}
                    onChange={(e) => setHairColor(e.target.value)}
                    placeholder="e.g. Hazel Blonde"
                    className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Eye Color</label>
                  <input 
                    id="input-model-eyecolor"
                    type="text"
                    value={eyeColor}
                    onChange={(e) => setEyeColor(e.target.value)}
                    placeholder="e.g. Deep Emerald"
                    className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Skin Tone Spec</label>
                <input 
                  id="input-model-skin"
                  type="text"
                  value={skinTone}
                  onChange={(e) => setSkinTone(e.target.value)}
                  placeholder="e.g. Light Beige Sunkissed"
                  className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Fashion Aesthetics</label>
                <input 
                  id="input-model-fashion"
                  type="text"
                  value={fashionStyle}
                  onChange={(e) => setFashionStyle(e.target.value)}
                  placeholder="e.g. Urban Techwear or quiet luxury"
                  className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Reference image uploads & Identity token info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Identity Lock Token</label>
                <div className="flex gap-2">
                  <input 
                    id="input-model-token"
                    type="text"
                    value={identityToken} 
                    onChange={(e) => setIdentityToken(e.target.value)}
                    placeholder="e.g. LILY_V5"
                    className="flex-1 bg-white/5 border border-white/10 p-2.5 rounded-lg text-xs text-white font-mono focus:outline-none"
                  />
                  <button 
                    id="btn-auto-token"
                    type="button" 
                    onClick={triggerAutoToken}
                    className="px-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs rounded-lg hover:bg-indigo-600/20 transition-all font-semibold"
                  >
                    Auto
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Locks details safely into AI photorealistic rendering queue.</p>
              </div>

              {/* Multiple Upload reference urls */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Face Reference Photos (URLs)</label>
                <div className="flex gap-2">
                  <input 
                    id="input-ref-url"
                    type="text"
                    value={activeRefInput}
                    onChange={(e) => setActiveRefInput(e.target.value)}
                    placeholder="Paste face sample Unsplash URL"
                    className="flex-1 bg-white/5 border border-white/10 p-2 rounded-lg text-xs text-white focus:outline-none"
                  />
                  <button 
                    id="btn-add-ref-url"
                    type="button"
                    onClick={handleAddUrlToImagesInput}
                    className="px-3 bg-white/10 text-white hover:bg-white/20 text-xs rounded-lg transition-all"
                  >
                    Add
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-3">
                  {referenceImagesInput.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-neutral-900 border border-white/5 group">
                      <img src={img} alt="face reference sample" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setReferenceImagesInput(referenceImagesInput.filter((_, i) => i !== index))}
                        className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  <div className="aspect-square border border-dashed border-white/15 rounded-md flex flex-col items-center justify-center bg-white/5 text-slate-500 text-center p-1">
                    <Camera size={14} />
                    <span className="text-[8px] mt-1">Multi Ref</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
            <button 
              id="btn-form-cancel"
              type="button" 
              onClick={() => setIsCreating(false)} 
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-400 transition-all cursor-pointer"
            >
              Discard
            </button>
            <button 
              id="btn-form-submit"
              type="submit" 
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Verify & Save Model Persona
            </button>
          </div>
        </form>
      )}

      {/* Grid of existing Persona Profiles */}
      <div id="models-list-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => {
          const modelRefs = referenceImages.filter(img => img.model_id === model.id);
          return (
            <div 
              id={`model-profile-card-${model.id}`}
              key={model.id} 
              className="bg-[#0b0b0d] border border-white/10 rounded-xl overflow-hidden shadow-xl hover:border-white/20 transition-all group flex flex-col justify-between"
            >
              {/* Primary Visual */}
              <div className="relative h-48 bg-neutral-950/80 overflow-hidden">
                <img 
                  src={(modelRefs && modelRefs[0]?.image_url) || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300"} 
                  alt={model.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-wide">{model.name}</h3>
                    <p className="text-[10px] text-indigo-400 font-mono mt-0.5">{model.identity_token}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-indigo-600/20 border border-indigo-500/30 text-[9px] font-semibold text-indigo-300 tracking-wider uppercase">
                    {model.gender}
                  </span>
                </div>
              </div>

              {/* Physical metadata specs */}
              <div className="p-4 space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <span className="block text-[9px] text-slate-500 uppercase tracking-wider">Hair Spec</span>
                    <span className="block text-[11px] text-white font-medium truncate mt-0.5">{model.hair_style} ({model.hair_color})</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <span className="block text-[9px] text-slate-500 uppercase tracking-wider">Skin / Eyes</span>
                    <span className="block text-[11px] text-white font-medium truncate mt-0.5">{model.skin_tone} / {model.eye_color}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px]">Fashion Profile:</span>
                    <span className="text-white font-medium truncate max-w-[150px]">{model.fashion_style}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px]">Vibe focus:</span>
                    <span className="text-slate-300 line-clamp-1 text-[11px]">{model.vibe}</span>
                  </div>
                </div>

                {/* Sub-references slider layout */}
                <div className="pt-2">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-2">Reference Memory ({modelRefs.length} Photos)</span>
                  <div className="flex gap-2 flex-wrap">
                    {modelRefs.map((img) => (
                      <img 
                        key={img.id} 
                        src={img.image_url} 
                        alt="memory preview" 
                        className="w-10 h-10 rounded-md object-cover border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                    {/* Direct image input */}
                    <button 
                      id={`btn-add-ref-model-${model.id}`}
                      onClick={() => {
                        const url = prompt("Please enter memory photo URL to connect:");
                        if (url) {
                          onAddReferenceImage(model.id, url);
                        }
                      }}
                      className="w-10 h-10 bg-white/5 border border-dashed border-white/15 hover:border-white/35 rounded-md flex items-center justify-center text-slate-400 hover:text-white transition-all text-xs cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-4 py-3 bg-white/5 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-500">
                  Created {new Date(model.created_at).toLocaleDateString()}
                </span>
                <button
                  id={`btn-delete-model-${model.id}`}
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete profile for ${model.name}?`)) {
                      onDeleteModel(model.id);
                    }
                  }}
                  className="p-1 px-2.5 rounded bg-red-600/10 hover:bg-red-600/20 text-red-400 text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </div>
          );
        })}

        {models.length === 0 && (
          <div id="no-models-banner" className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
            <Users size={32} className="mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-300">No Influencer Models constructed yet.</p>
            <p className="text-xs text-slate-500 mt-1">Unlock your first AI physical consistency engine by tapping 'Create Persona'.</p>
          </div>
        )}
      </div>
    </div>
  );
}
