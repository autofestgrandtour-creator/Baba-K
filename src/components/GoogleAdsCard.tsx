"use client";

import React, { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlatform } from '@/context/PlatformContext';
interface AdCampaign {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  destinationUrl: string;
  imageUrl: string;
  badge: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
}

const MOCK_CAMPAIGNS: AdCampaign[] = [
  {
    id: 'campaign-1',
    title: 'CHILLERS LAGOS HIGHWAY SHUTTLE',
    subtitle: 'Zero-Friction Private Travel Service',
    description: 'Avoid transit chaos. Grab pre-booked elite shuttles directly from the main Baba-K concert gates with security escorts.',
    ctaText: 'Secure Seat Free ₦0',
    destinationUrl: 'https://google.com/search?q=lagos+premium+shuttles',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&auto=format&fit=crop&q=80',
    badge: 'LUXURY SHUTTLE',
    bgColor: 'from-cyan-950/20 via-[#0c0c0e]/95 to-zinc-950/40',
    borderColor: 'border-cyan-500/20',
    accentColor: '#00F2FF'
  },
  {
    id: 'campaign-2',
    title: 'OPAY PREMIUM ZERO-FAIL CHANNEL',
    subtitle: 'Bypassing Local Banking Latency',
    description: 'Ensure 100% instant payment voucher clearance at checking gates. Connect your OPay wallet for instant ₦500 cashback.',
    ctaText: 'Activate Wallet Promo',
    destinationUrl: 'https://google.com/search?q=opay+nigeria',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&auto=format&fit=crop&q=80',
    badge: 'FINTECH PARTNER',
    bgColor: 'from-purple-950/20 via-[#0c0c0e]/95 to-zinc-950/40',
    borderColor: 'border-purple-500/20',
    accentColor: '#a855f7'
  },
  {
    id: 'campaign-3',
    title: 'LAGOS BEACHSIDE GLAMPING AFTERPARTY',
    subtitle: 'Official Baba-K Extension Sanctuary',
    description: 'The night never concludes at Baba-K. Dive directly into early bird VIP access VIP Cabanas, beachside fire grids, and Amapiano loops.',
    ctaText: 'Secure 15% RSVP Pass',
    destinationUrl: 'https://google.com/search?q=lagos+beachside+vip+parties',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop&q=80',
    badge: 'AFTERPARTY ACCESS',
    bgColor: 'from-[#FF00E5]/10 via-[#0c0c0e]/95 to-zinc-950/40',
    borderColor: 'border-pink-500/20',
    accentColor: '#FF00E5'
  }
];

export const GoogleAdsCard: React.FC = () => {
  const { currentUser } = usePlatform();
  const isAdmin = currentUser?.role === 'Admin';

  const [activeCampaignIndex, setActiveCampaignIndex] = useState(0);
  const [adLayout, setAdLayout] = useState<'responsive' | 'compact' | 'minimal'>('responsive');
  
  // Real-time local simulation metrics
  const [impressions, setImpressions] = useState(1480);
  const [clicks, setClicks] = useState(142);
  const [earnings, setEarnings] = useState(16330); // in NGN ₦
  const [justClicked, setJustClicked] = useState(false);

  const campaign = MOCK_CAMPAIGNS[activeCampaignIndex];

  // Random increment tracker to simulate live AdSense traffic
  useEffect(() => {
    const interval = setInterval(() => {
      setImpressions(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleCampaignClick = (e: React.MouseEvent) => {
    // Increment stats locally to make simulator feel alive
    setClicks(prev => prev + 1);
    setEarnings(prev => prev + 120); // Add 120 NGN CPM rate credit
    setJustClicked(true);
    setTimeout(() => setJustClicked(false), 2000);
  };

  const calculateCTR = () => {
    if (impressions === 0) return '0.00%';
    return `${((clicks / impressions) * 100).toFixed(2)}%`;
  };

  const cycleCampaign = () => {
    setActiveCampaignIndex((prev) => (prev + 1) % MOCK_CAMPAIGNS.length);
  };

  return (
    <div id="google-adsense-slot" className="relative w-full max-w-7xl mx-auto rounded-3xl border border-white/5 bg-[#09090b] overflow-hidden p-6 text-left shadow-2xl">
      
      {/* Decorative light grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none" />
      
      {/* Absolute top glowing bar for active Google Ads classification */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#FF00E5]/20 via-[#00F2FF] to-[#FF00E5]/20" />

      {/* HEADER BAR: Google Ads classification tag & live sandbox metrics */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 ${isAdmin ? 'border-b border-white/5' : ''} relative z-10`}>
        
        {/* Left Google AdSense logo with brand tag */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1 items-center bg-white/5 border border-white/10 rounded-md px-2 py-1 font-mono text-[9px] font-black tracking-widest text-[#00F2FF]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF00E5] animate-pulse" />
            <span>GOOGLE ADSENSE // VERIFIED SPONSOR</span>
          </div>
          
          <span className="text-[10px] text-white/30 font-mono tracking-tighter uppercase hidden sm:inline">AdSlot #G-49204A</span>
        </div>

        {/* Live Simulator Performance Console */}
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-mono text-white/50 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 shrink-0">
            <div className="flex items-center gap-1.5 border-r border-white/10 pr-2.5">
              <span className="text-zinc-550 uppercase text-[9px]">Impressions:</span>
              <span className="text-white font-bold">{impressions.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 border-r border-white/10 pr-2.5 pl-1">
              <span className="text-zinc-550 uppercase text-[9px]">Clicks:</span>
              <span className="text-[#FF00E5] font-bold">{clicks}</span>
            </div>
            <div className="flex items-center gap-1.5 border-r border-white/10 pr-2.5 pl-1">
              <span className="text-zinc-550 uppercase text-[9px]">CTR:</span>
              <span className="text-[#00F2FF] font-bold">{calculateCTR()}</span>
            </div>
            <div className="flex items-center gap-1.5 pl-1">
              <span className="text-zinc-550 uppercase text-[9px]">Earnings:</span>
              <span className="text-[#00F2FF] font-extrabold text-xs">₦{earnings.toLocaleString()}</span>
            </div>
          </div>
        )}

      </div>

      {/* INTERACTIVE CONTROLS TRAY FOR THE SANDBOX USER */}
      {isAdmin && (
        <div className="mt-4 flex flex-wrap gap-2 items-center justify-between text-xs font-mono relative z-10 border-b border-white/5 pb-4">
          
          {/* Quick layout customizer */}
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
            <span className="text-[9.5px] text-white/40 uppercase font-black px-2">AD LAYOUT:</span>
            {(['responsive', 'compact', 'minimal'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setAdLayout(mode)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  adLayout === mode
                    ? 'bg-[#00F2FF] text-black font-extrabold shadow-sm'
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Cycle campaign button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={cycleCampaign}
              className="px-3 border border-white/10 hover:border-[#00F2FF]/40 hover:bg-white/5 py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase text-zinc-300 transition-all cursor-pointer"
            >
              <RefreshCw className="h-3 w-3 animate-pulse text-[#FF00E5]" />
              <span>Cycle Live Campaigns ({activeCampaignIndex + 1}/{MOCK_CAMPAIGNS.length})</span>
            </button>
          </div>

        </div>
      )}

      {/* AD CARD VIEWPORTS DETAILED ENGINE */}
      <div className={`${isAdmin ? 'mt-5' : 'mt-4'} relative z-10`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${campaign.id}-${adLayout}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {/* RESPONSIVE LAYOUT (Full featured native display banner) */}
            {adLayout === 'responsive' && (
              <div className={`p-[1px] rounded-2xl bg-gradient-to-r from-[#FF00E5]/15 via-white/5 to-[#00F2FF]/15 border border-white/10 relative overflow-hidden`}>
                <div className={`relative rounded-2xl bg-gradient-to-b ${campaign.bgColor} p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden`}>
                  
                  {/* Outer lighting flare */}
                  <span className="absolute -top-32 -left-32 w-64 h-64 bg-[#00F2FF]/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Campaign details left side */}
                  <div className="space-y-3 max-w-xl text-left flex-grow">
                    <div className="flex items-center gap-2">
                      <span 
                        style={{ color: campaign.accentColor, borderColor: `${campaign.accentColor}33`, backgroundColor: `${campaign.accentColor}11` }}
                        className="text-[9px] font-mono font-black border px-2 py-0.5 rounded-md tracking-wider uppercase"
                      >
                        {campaign.badge}
                      </span>
                      <span className="text-[10px] text-white/30 font-mono">Premium Sponsor</span>
                    </div>

                    <h4 className="font-display text-xl md:text-2xl font-black text-white tracking-tight uppercase leading-tight">
                      {campaign.title}
                    </h4>
                    
                    <h5 className="text-xs font-semibold uppercase text-[#00F2FF] font-mono">
                      {campaign.subtitle}
                    </h5>

                    <p className="text-xs text-white/50 leading-relaxed font-sans max-w-lg">
                      {campaign.description}
                    </p>

                    <div className="pt-2 flex items-center gap-3">
                      <a
                        href={campaign.destinationUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={handleCampaignClick}
                        className="px-5 py-2.5 rounded-full bg-[#00F2FF] hover:bg-[#00e1ec] text-black font-black text-[10.5px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 shadow-lg shadow-[#00F2FF]/10"
                      >
                        <span>{campaign.ctaText}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      
                      <span className="text-[10px] text-white/30 font-mono italic">Requires no entry visa</span>
                    </div>
                  </div>

                  {/* Image side with border highlight frames */}
                  <div className="relative w-full md:w-44 h-28 md:h-36 shrink-0 rounded-xl overflow-hidden border border-white/10 group shadow-md bg-zinc-950">
                    <img
                      src={campaign.imageUrl}
                      alt={campaign.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 inset-x-0 text-center">
                      <span className="text-[8px] font-mono tracking-widest text-[#00F2FF] uppercase font-black">AD BY GOOGLE</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* COMPACT LAYOUT (Sleek minimalist panel optimized for sidebar grids) */}
            {adLayout === 'compact' && (
              <div className="border border-white/10 rounded-2xl bg-[#0c0c0e]/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00F2FF] animate-pulse" />
                    <span className="text-[9px] font-mono text-zinc-500 font-extrabold uppercase">SPONSORED CO-PARTNER</span>
                  </div>
                  <h4 className="font-display font-black text-white text-base truncate uppercase">{campaign.title}</h4>
                  <p className="text-xs text-white/50 truncate max-w-lg">{campaign.subtitle} • {campaign.description}</p>
                </div>

                <a
                  href={campaign.destinationUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleCampaignClick}
                  className="px-4 py-2 border border-[#00F2FF] text-[#00F2FF] hover:bg-[#00F2FF] hover:text-black transition-all rounded-lg text-[10.5px] font-black uppercase tracking-wider shrink-0 flex items-center justify-center gap-1.5"
                >
                  <span>{campaign.ctaText.split(' ')[0]}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* MINIMAL LAYOUT (Horizontal micro-ticker line) */}
            {adLayout === 'minimal' && (
              <div className="rounded-xl border border-[#00F2FF]/10 bg-[#00F2FF]/5 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-left gap-2 font-mono">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-[#00F2FF] bg-[#00F2FF]/10 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider border border-[#00F2FF]/20">Sponsored</span>
                  <span className="text-white/80 font-bold uppercase">{campaign.subtitle}:</span>
                  <span className="text-white/50 max-w-xl truncate">{campaign.description}</span>
                </div>
                <a
                  href={campaign.destinationUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleCampaignClick}
                  className="text-[#00F2FF] hover:underline tracking-wider font-extrabold uppercase flex items-center gap-1 shrink-0 bg-transparent py-0 px-1 ml-auto"
                >
                  <span>{campaign.ctaText}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* POP-UP SIMULATOR FEEDBACK OVERLAY */}
      <AnimatePresence>
        {justClicked && isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="absolute bottom-4 right-4 z-30 bg-emerald-900 border border-emerald-500 rounded-xl px-4 py-2.5 shadow-xl font-mono text-xs text-emerald-200 flex items-center gap-2"
          >
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-300" />
            <div>
              <p className="font-extrabold text-[10px] uppercase">Simulation Success!</p>
              <p className="text-[10px] text-emerald-300/80">Premium sponsor clicked. Ad Revenue (+₦120.00) credit accounted.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

