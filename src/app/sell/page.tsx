"use client";

import React, { useState, useRef } from 'react';
import { usePlatform } from '@/context/PlatformContext';
import { TicketTier, AdCustomizerConfig, EventItem } from '@/types';
import { Plus, Trash2, Sliders, Palette, Layout, Sparkles, AlertCircle, ArrowLeft, ArrowRight, CheckCircle, Upload } from 'lucide-react';

interface SellEventProps {
  onSuccess: () => void;
}

// Preset modern event flyers to accommodate quick sandbox uploads
const PRESET_FLYERS = [
  { name: 'Neon Beat', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop' },
  { name: 'Tech Horizon', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop' },
  { name: 'Afro Festival', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop' },
  { name: 'Wine Tasting', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=600&auto=format&fit=crop' }
];

// Preset background gradients for promotion ads
const PRESET_GRADIENTS = [
  { name: 'Midnight Cosmic', value: 'linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #4c0519 100%)' },
  { name: 'Oceanic Glow', value: 'linear-gradient(135deg, #020617 0%, #0c4a6e 60%, #164e63 100%)' },
  { name: 'Volcanic Core', value: 'linear-gradient(135deg, #450a0a 0%, #7c2d12 100%)' },
  { name: 'Cyber Neon', value: 'linear-gradient(135deg, #064e3b 0%, #022c22 40%, #1e1b4b 100%)' }
];

export const SellEvent: React.FC<SellEventProps> = ({ onSuccess }) => {
  const { addEvent } = usePlatform();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // --- STEP 1: EVENT DETAILS STATE ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [flyerUrl, setFlyerUrl] = useState(PRESET_FLYERS[0].url);
  const [category, setCategory] = useState('Music');

  // Custom User Flyer Upload State & Refs
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFlyerUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFlyerUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- STEP 2: TICKET CONFIGURATION STATE ---
  const [ticketsConfig, setTicketsConfig] = useState<TicketTier[]>([
    { name: 'Early Bird Pass', price: 5000, capacity: 100, visibility: 'Public', soldCount: 0 },
    { name: 'General Admission', price: 10000, capacity: 300, visibility: 'Public', soldCount: 0 }
  ]);
  const [newTierName, setNewTierName] = useState('');
  const [newTierPrice, setNewTierPrice] = useState('');
  const [newTierCapacity, setNewTierCapacity] = useState('');
  const [newTierVisibility, setNewTierVisibility] = useState<'Public' | 'Invite Only'>('Public');

  // --- STEP 3: AD CUSTOMIZER CONFIG STATE ---
  const [adCustomizer, setAdCustomizer] = useState<AdCustomizerConfig>({
    backgroundType: 'gradient',
    backgroundValue: PRESET_GRADIENTS[0].value,
    textColor: '#ffffff',
    overlayText: '⚡ SELLING OUT FAST - SECURE TICKETS IN MINUTES ⚡',
    promote: true
  });

  // Ticket config operations
  const handleAddTier = () => {
    if (!newTierName || !newTierPrice || !newTierCapacity) {
      setError('Please provide Name, Price, and Max Capacity metrics for your ticket tier.');
      return;
    }
    setError('');

    const newTier: TicketTier = {
      name: newTierName,
      price: Math.abs(Number(newTierPrice)),
      capacity: Math.abs(Number(newTierCapacity)),
      visibility: newTierVisibility,
      soldCount: 0
    };

    setTicketsConfig([...ticketsConfig, newTier]);
    
    // Clear adding form
    setNewTierName('');
    setNewTierPrice('');
    setNewTierCapacity('');
    setNewTierVisibility('Public');
  };

  const handleDeleteTier = (idx: number) => {
    setTicketsConfig(ticketsConfig.filter((_, i) => i !== idx));
  };

  // Navigations & Validations
  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      if (!title || !date || !venue) {
        setError('Event Title, Event Date, and Venue are strictly required fields.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (ticketsConfig.length === 0) {
        setError('Please configure at least one access ticket tier for Nigerian buyers.');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError('');
    setStep(prev => Math.max(1, prev - 1));
  };

  const handlePublish = () => {
    try {
      addEvent({
        title,
        description: description || 'No core breakdown details provided. Standby for agenda notifications.',
        date,
        time: time || '19:00',
        venue,
        flyerUrl,
        category,
        ticketsConfig,
        adCustomizer,
        isPromoted: adCustomizer.promote
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving event.');
    }
  };

  const handleResetForm = () => {
    // Reset all form inputs to base states
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setVenue('');
    setFlyerUrl(PRESET_FLYERS[0].url);
    setCategory('Music');
    setTicketsConfig([
      { name: 'Early Bird Pass', price: 5000, capacity: 100, visibility: 'Public', soldCount: 0 },
      { name: 'General Admission', price: 10000, capacity: 300, visibility: 'Public', soldCount: 0 }
    ]);
    setAdCustomizer({
      backgroundType: 'gradient',
      backgroundValue: PRESET_GRADIENTS[0].value,
      textColor: '#ffffff',
      overlayText: '⚡ SELLING OUT FAST - SECURE TICKETS IN MINUTES ⚡',
      promote: true
    });
    setSuccess(false);
    setStep(1);
    setError('');
    onSuccess();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 text-left">
      
      {/* SUCCESS SCREEN */}
      {success ? (
        <div className="max-w-md mx-auto text-center py-16 space-y-6">
          <div className="h-16 w-16 mx-auto rounded-full bg-neon-cyan/10 border-2 border-neon-cyan text-neon-cyan flex items-center justify-center animate-bounce">
            <CheckCircle className="h-9 w-9" />
          </div>
          
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">Event Launched!</h2>
            <p className="text-white/40 text-sm">
              Your ticketing page is live on the Baba-K Platform in Nigeria. Ticket codes, P2P options, and wallet integrations are immediately active.
            </p>
          </div>

          <div className="glass border border-white/10 p-4 rounded-2xl flex items-center gap-4 text-left">
            <img src={flyerUrl} alt={title} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/5" referrerPolicy="no-referrer" />
            <div>
              <h4 className="text-[9px] font-mono font-black text-neon-cyan uppercase tracking-wider">{category} category</h4>
              <p className="text-sm font-black text-white leading-snug uppercase mt-0.5">{title}</p>
              <p className="text-xs text-white/40 font-mono">{date} • {ticketsConfig.length} Tier Configs</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleResetForm}
              className="w-full py-3.5 bg-[#FF00E5] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-neon-pink/15 cursor-pointer hover:bg-opacity-90 transition-colors"
            >
              Configure Another Event
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT CONTAINER: MULTI-STEP CREATOR PANEL */}
          <div className="lg:col-span-7 bg-[#0D0D0E]/90 border border-white/10 p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl">
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-lg font-black uppercase tracking-tight text-white">Create Event Ticket</span>
                <span className="text-white/45 text-xs font-mono">/ {category.toUpperCase()}</span>
              </div>
              
              <div className="flex gap-2 text-[10px] font-mono text-white/45">
                <span className={`${step >= 1 ? 'text-neon-cyan font-black' : ''}`}>1. Info</span>
                <span>•</span>
                <span className={`${step >= 2 ? 'text-neon-cyan font-black' : ''}`}>2. Tiers</span>
                <span>•</span>
                <span className={`${step >= 3 ? 'text-neon-cyan font-black' : ''}`}>3. Promos</span>
              </div>
            </div>

            {/* ERROR FEEDBACK */}
            {error && (
              <div className="rounded-xl bg-red-950/40 border border-red-850/60 p-3.5 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* --- STEP 1: EVENT DESCRIPTION & METRIC FIELDS --- */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-white/40 mb-1.5">Event Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Lagos Afrobeat Sunset Symphony 2026"
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-xs text-white focus:border-neon-cyan focus:outline-none placeholder-white/20 font-sans"
                  />
                  <p className="text-[10px] text-white/30 font-mono mt-1">Include a recognizable name describing music genre or keynote agendas.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-white/40 mb-1.5">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-xs text-white uppercase font-black tracking-wider focus:border-neon-cyan focus:outline-none"
                    >
                      <option value="Music">Music Event</option>
                      <option value="Nightlife">Nightlife / Lounge</option>
                      <option value="Food & Drink">Food & Drink Fest</option>
                      <option value="Arts & Culture">Arts & Culture Display</option>
                      <option value="Tech & Business">Tech & Business Summit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-white/40 mb-1.5">Date *</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs text-white focus:border-neon-cyan focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-white/40 mb-1.5">Start Time</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs text-white focus:border-neon-cyan focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-white/40 mb-1.5">Venue Location *</label>
                    <input
                      type="text"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="e.g., Landmark Hall, VI, Lagos"
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-xs text-white focus:border-neon-cyan focus:outline-none placeholder-white/20 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-white/40 mb-1.5">Event Description Breakdown</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide guidelines, details of who is performing, age restrictions, or refund rules..."
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-xs text-white focus:border-neon-cyan focus:outline-none placeholder-white/20"
                  />
                </div>

                {/* Custom Logo/Flyer Selector Presets + Interactive Drag-and-Drop Image Uploader */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-white/40">Event Graphic / Flyer *</label>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">Use a preset template or upload your custom design</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Presets Grid */}
                    <div className="md:col-span-12 lg:col-span-5 space-y-2">
                      <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Quick Presets</span>
                      <div className="grid grid-cols-2 gap-2">
                        {PRESET_FLYERS.map((curFlyer) => (
                          <button
                            type="button"
                            key={curFlyer.name}
                            onClick={() => setFlyerUrl(curFlyer.url)}
                            className={`p-1 rounded-xl border text-center relative overflow-hidden h-14 cursor-pointer transition-all ${
                              flyerUrl === curFlyer.url ? 'border-[#00F2FF] bg-[#00F2FF]/10' : 'border-white/5 bg-black hover:border-white/10'
                            }`}
                          >
                            <img src={curFlyer.url} alt={curFlyer.name} className="w-full h-full object-cover rounded opacity-80" referrerPolicy="no-referrer" />
                            <span className="absolute bottom-1 left-1 right-1 text-[8px] truncate bg-black/80 px-1 py-0.5 rounded font-mono text-zinc-300 uppercase font-bold tracking-tighter">{curFlyer.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Drag-and-Drop Uploader Frame */}
                    <div className="md:col-span-12 lg:col-span-7 space-y-2">
                      <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Upload Custom Graphic</span>
                      
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`h-[120px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all cursor-pointer relative overflow-hidden text-center select-none ${
                          isDragging 
                            ? 'border-[#00F2FF] bg-[#00F2FF]/5' 
                            : !PRESET_FLYERS.some(f => f.url === flyerUrl)
                            ? 'border-[#FF00E5] bg-[#FF00E5]/5'
                            : 'border-white/15 bg-black/40 hover:border-white/25 hover:bg-black/60'
                        }`}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        
                        {!PRESET_FLYERS.some(f => f.url === flyerUrl) ? (
                          <div className="space-y-1.5 flex flex-col items-center">
                            <div className="h-7 w-7 rounded-full bg-[#FF00E5]/15 border border-[#FF00E5]/30 flex items-center justify-center text-[#FF00E5]">
                              <CheckCircle className="h-4 w-4" />
                            </div>
                            <p className="text-[11px] font-bold text-white uppercase tracking-tight">Custom flyer attached</p>
                            <span className="text-[9px] text-[#FF00E5] font-mono font-black uppercase">REPLACE FLYER (DRAG & DROP OR BROWSE)</span>
                          </div>
                        ) : (
                          <div className="space-y-1.5 flex flex-col items-center">
                            <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                              <Upload className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] text-white font-bold uppercase tracking-tight">Drag and drop image here</p>
                              <p className="text-[9px] text-zinc-500 font-mono">or click to choose files from device</p>
                            </div>
                            <p className="text-[8px] text-zinc-650 font-mono">Supports JPG, PNG, WEBP (Max 5MB)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 2: DYNAMIC TICKET TIER BUILDER (UNLIMITED CONFIGS) --- */}
            {step === 2 && (
              <div className="space-y-6">
                
                {/* Active configurator adding form fields */}
                <div className="p-4 rounded-2xl border border-white/5 bg-black space-y-4 text-left">
                  <span className="text-[9px] font-mono text-neon-cyan uppercase tracking-widest font-black">Configure Ticket tier metrics</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">Ticket Name</label>
                      <input
                        type="text"
                        value={newTierName}
                        onChange={(e) => setNewTierName(e.target.value)}
                        placeholder="e.g. VIP Backstage Pass"
                        className="w-full rounded-xl border border-white/10 bg-[#0D0D0E] px-3.5 py-2.5 text-xs text-white focus:border-neon-cyan focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">Price (₦ - NGN)</label>
                      <input
                        type="number"
                        value={newTierPrice}
                        onChange={(e) => setNewTierPrice(e.target.value)}
                        placeholder="e.g. 25000"
                        className="w-full rounded-xl border border-white/10 bg-[#0D0D0E] px-3.5 py-2.5 text-xs text-white focus:border-neon-cyan focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">Max Volume Capacity</label>
                      <input
                        type="number"
                        value={newTierCapacity}
                        onChange={(e) => setNewTierCapacity(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full rounded-xl border border-white/10 bg-[#0D0D0E] px-3.5 py-2.5 text-xs text-white focus:border-neon-cyan focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">Accessibility Visibility</label>
                      <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                        {(['Public', 'Invite Only'] as const).map((v) => (
                          <button
                            type="button"
                            key={v}
                            onClick={() => setNewTierVisibility(v)}
                            className={`py-1.5 rounded-lg border text-[10px] font-bold text-center transition-all cursor-pointer uppercase tracking-wider ${
                              newTierVisibility === v
                                ? 'border-neon-cyan bg-neon-cyan/15 text-neon-cyan'
                                : 'border-white/5 bg-[#0D0D0E] text-white/40'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Add action */}
                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="w-full py-3 bg-[#FF00E5] text-white hover:bg-opacity-95 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all border border-none cursor-pointer shadow-lg shadow-neon-pink/15"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Initialize Ticket Tier</span>
                  </button>
                </div>

                {/* Built tiers lists */}
                <div className="space-y-3 text-left">
                  <h4 className="text-xs font-mono font-black uppercase tracking-widest text-[#00F2FF]">Configured Access Tiers ({ticketsConfig.length})</h4>
                  
                  {ticketsConfig.length === 0 ? (
                    <p className="text-xs text-white/40 italic font-mono">No tickets formulated. Add at least one tier above to satisfy event checkout logic.</p>
                  ) : (
                    <div className="space-y-2">
                      {ticketsConfig.map((tier, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3.5 rounded-xl border border-white/10 bg-black text-xs">
                          <div className="text-left">
                            <p className="font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wide">
                              <span>{tier.name}</span>
                              <span className="text-[9px] font-mono font-black uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded border border-white/5 text-white/40">
                                {tier.visibility}
                              </span>
                            </p>
                            <p className="text-[10px] text-white/40 mt-0.5 font-mono">Capacity Limit: {tier.capacity} passes (0 sold)</p>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-mono font-black text-[#00F2FF]">₦{tier.price.toLocaleString()}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteTier(idx)}
                              className="text-white/40 hover:text-red-400 p-2 rounded-full hover:bg-red-950/20 cursor-pointer"
                              title="Delete Tier"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* --- STEP 3: AD CUSTOMizer & THEME PICKERS --- */}
            {step === 3 && (
              <div className="space-y-5">
                
                {/* 1. Promoting check */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black flex-row">
                  <div className="text-left">
                    <h5 className="text-xs font-black uppercase tracking-wide text-white">Promote Event across Baba-K Hub</h5>
                    <p className="text-[10px] text-white/40 mt-0.5 max-w-md">Features event flyers at the top hero discovery banner for a flat hub fee of ₦5,000.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={adCustomizer.promote}
                    onChange={(e) => setAdCustomizer({ ...adCustomizer, promote: e.target.checked })}
                    className="h-4 w-4 text-neon-cyan border-white/15 rounded bg-black focus:ring-neon-cyan"
                  />
                </div>

                {/* 2. Custom hye text editing inputs */}
                <div className="text-left">
                  <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-white/40 mb-1.5">Overlay Banner Hype Text</label>
                  <input
                    type="text"
                    value={adCustomizer.overlayText}
                    onChange={(e) => setAdCustomizer({ ...adCustomizer, overlayText: e.target.value })}
                    placeholder="e.g., ⚡ EARLY BIRD DISCOUNTS ALMOST GONE - SECURE PASS ⚡"
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs text-white focus:border-neon-cyan focus:outline-none"
                  />
                  <p className="text-[10px] text-white/30 font-mono mt-1">Slick marquee notification line displaying live on search card cards.</p>
                </div>

                {/* 3. Gradient Preset Picker */}
                <div className="text-left">
                  <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-white/40 mb-2">Interactive Promo Ad Gradient Pattern</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_GRADIENTS.map((g) => (
                      <button
                        type="button"
                        key={g.name}
                        onClick={() => setAdCustomizer({ ...adCustomizer, backgroundValue: g.value })}
                        className={`p-2.5 rounded-xl border text-left transition-all h-14 relative overflow-hidden cursor-pointer ${
                          adCustomizer.backgroundValue === g.value ? 'border-white text-white' : 'border-white/5'
                        }`}
                        style={{ background: g.value }}
                      >
                        <span className="absolute bottom-1 right-2 text-[9px] bg-black/60 font-mono text-white px-1 py-0.2 rounded uppercase font-bold tracking-tight">{g.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Multi-step movement controls button rail */}
            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-wider text-white transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span>PREVIOUS STEP</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 rounded-full bg-neon-cyan text-black hover:bg-opacity-95 text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                >
                  <span>NEXT WORKFLOW</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  className="px-6 py-2.5 rounded-full bg-neon-pink text-white hover:bg-opacity-95 text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-neon-pink/20 transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span>PUBLISH & ACTIVATE</span>
                </button>
              )}
            </div>

          </div>

          {/* RIGHT CONTAINER: INTERACTIVE LIVE PREVIEW PANEL */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#FF00E5]">Live Custom Ad Preview</h3>
            
            {/* Real-time styled Ad rendering mock */}
            <div className="rounded-3xl border border-white/10 bg-black overflow-hidden shadow-2xl relative">
              
              {/* Dynamic Theme background configured by step custom colors */}
              <div
                style={{
                  background: adCustomizer.backgroundType === 'gradient'
                    ? adCustomizer.backgroundValue
                    : undefined,
                  backgroundColor: adCustomizer.backgroundType === 'color'
                    ? adCustomizer.backgroundValue
                    : undefined,
                  minHeight: '260px'
                }}
                className="p-6 text-white flex flex-col justify-between transition-all duration-300 relative"
              >
                {/* Visual Glassmorphic grid effect */}
                <div className="absolute inset-0 bg-white/2 backdrop-blur-3xl pointer-events-none" />

                {/* Hype Text Banner */}
                <span className="px-3 py-1 bg-black/80 text-neon-cyan font-black font-mono text-[9px] uppercase rounded-full text-center tracking-wider block truncate border border-neon-cyan/20 z-10 animate-pulse">
                  {adCustomizer.overlayText || '⚡ BABA-K SPONSORED PROMOTION EVENT ⚡'}
                </span>

                {/* Cover representation flyer and catalog badge key */}
                <div className="flex gap-4 items-center z-10 pt-4">
                  <img
                    src={flyerUrl}
                    alt="Event flyer preset"
                    className="w-20 h-20 rounded-xl object-cover hover:scale-105 transition-transform shrink-0 border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="text-left space-y-1">
                    <span className="text-[8px] font-mono bg-white text-black font-extrabold px-1.5 py-0.2 rounded">
                      {category.toUpperCase()} CATEGORY
                    </span>
                    <h4 className="font-display text-sm font-black uppercase tracking-tight text-white leading-tight line-clamp-2">
                      {title || 'Untitled Lagos Carnival Fest'}
                    </h4>
                    <p className="text-[10px] text-white/50 font-mono">Date: {date || 'YYYY-MM-DD'} • {time || '19:00'}</p>
                  </div>
                </div>

                {/* Card footer values */}
                <div className="flex justify-between items-center z-10 border-t border-white/10 pt-3 mt-4 text-[10px] font-mono text-white/45">
                  <span className="font-bold text-white uppercase">Tickets configured: {ticketsConfig.length}</span>
                  <span className="text-neon-cyan font-black">₦{(ticketsConfig[0]?.price || 0).toLocaleString()} regular from</span>
                </div>
              </div>

              {/* Informative summary note */}
              <div className="p-4 bg-[#0d0d0f] border-t border-white/5 space-y-2.5 text-[10.5px] text-white/40 text-left">
                <p className="flex gap-1.5 font-mono"><Palette className="h-3.5 w-3.5 text-neon-cyan shrink-0" /> Your design is synced live inside the Nigeria home discovery grid.</p>
                <p className="flex gap-1.5 font-mono"><Layout className="h-3.5 w-3.5 text-neon-pink shrink-0" /> Interactive elements inside card structures automatically fit desktop and smaller mobile aspect ratios.</p>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default function SellPage() {
  const handleEventCreated = () => {
    // Event successfully created - could show a success message or redirect
    console.log('Event created successfully');
  };

  return <SellEvent onSuccess={handleEventCreated} />;
}
