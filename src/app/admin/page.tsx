"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePlatform } from '@/context/PlatformContext';
import { AlertTriangle, Users, Ticket, TrendingUp, Sliders, Shield, ShieldCheck, Ban, Check, Sparkles, HelpCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    events,
    tickets,
    users,
    settings,
    setSettings,
    toggleEventState,
    verifyOrganizerEmail,
    toggleUserSuspension
  } = usePlatform();

  // Settings form local state
  const [flatFeeLocal, setFlatFeeLocal] = useState(settings.flatFee.toString());
  const [promoPriceLocal, setPromoPriceLocal] = useState(settings.promotionPrice.toString());
  const [gatewayPaystack, setGatewayPaystack] = useState(settings.supportedGateways.paystack);
  const [gatewayOpay, setGatewayOpay] = useState(settings.supportedGateways.opay);
  const [gatewayAlatpay, setGatewayAlatpay] = useState(settings.supportedGateways.alatpay);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Active sub-sections
  const [adminTab, setAdminTab] = useState<'metrics' | 'events' | 'users' | 'configs'>('metrics');

  // Compute live admin statistics
  const liveStats = useMemo(() => {
    // Cumulative tickets sold
    const totalSold = events.reduce((acc, curr) => {
      const soldThisEvt = curr.ticketsConfig.reduce((tAcc, t) => tAcc + t.soldCount, 0);
      return acc + soldThisEvt;
    }, 0);

    // Compute total platform convenience revenue = sold ticket units * platform flat fee
    const platformRevenue = totalSold * settings.flatFee;

    return {
      usersCount: users.length,
      eventsCount: events.length,
      ticketsSold: totalSold,
      revenueNGN: platformRevenue
    };
  }, [events, tickets, users, settings]);

  const handleApplySettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    setSettings({
      flatFee: Math.abs(Number(flatFeeLocal)) || 250,
      promotionPrice: Math.abs(Number(promoPriceLocal)) || 5000,
      supportedGateways: {
        paystack: gatewayPaystack,
        opay: gatewayOpay,
        alatpay: gatewayAlatpay
      }
    });

    setConfigSuccess(true);
    setTimeout(() => {
      setConfigSuccess(false);
    }, 2000);
  };

  return (
    <div id="admin-view" className="space-y-10 text-left">
      
      {/* Admin Title Branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-neon-pink shrink-0 animate-pulse" />
            <span>HQ Platform Terminal</span>
          </h2>
          <p className="text-sm text-white/45">Configure global Nigerian flat-fees, auditing users, and enforce platform-wide event controls.</p>
          <div className="mt-3 flex">
            <Link
              href="/vibe-matrix"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-[#FF00E5]/10 border border-[#FF00E5]/30 hover:border-[#FF00E5]/80 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              <Sliders className="h-3.5 w-3.5 text-neon-pink" />
              <span>Launch Cyber-Minimalist Vibe Matrix Overlord Console</span>
            </Link>
          </div>
        </div>

        {/* Sub-navigation buttons */}
        <div className="flex flex-wrap gap-1 bg-black p-1 rounded-xl sm:rounded-full border border-white/10 w-fit">
          {(['metrics', 'events', 'users', 'configs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setAdminTab(tab)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                adminTab === tab
                  ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              {tab === 'configs' ? 'Settings' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* --- SUBTAB 1: DENSE KPI COUNTERS --- */}
      {adminTab === 'metrics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* KPI: Platform users */}
            <div className="p-5 rounded-3xl bg-[#0D0D0E]/95 border border-white/10 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-mono tracking-widest text-white/40 font-bold">Total Users</p>
                <h4 className="text-xl font-display font-black text-white mt-0.5">{liveStats.usersCount}</h4>
                <span className="text-[9px] text-white/30 font-mono">Verified + guests</span>
              </div>
            </div>

            {/* KPI: Active event listings */}
            <div className="p-5 rounded-3xl bg-[#0D0D0E]/95 border border-white/10 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#FF00E5]/10 border border-[#FF00E5]/20 text-[#FF00E5] flex items-center justify-center">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-mono tracking-widest text-white/40 font-bold">Total Events</p>
                <h4 className="text-xl font-display font-black text-white mt-0.5">{liveStats.eventsCount}</h4>
                <span className="text-[9px] text-white/30 font-mono">Nigerians hosted</span>
              </div>
            </div>

            {/* KPI: Total Tickets sold */}
            <div className="p-5 rounded-3xl bg-[#0D0D0E]/95 border border-white/10 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan flex items-center justify-center">
                <TrendingUp className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-mono tracking-widest text-white/40 font-bold">Tickets Sold</p>
                <h4 className="text-xl font-display font-black text-white mt-0.5">{liveStats.ticketsSold}</h4>
                <span className="text-[9px] text-white/30 font-mono">P2P and Primary</span>
              </div>
            </div>

            {/* KPI: Platform Platform fee Revenue */}
            <div className="p-5 rounded-3xl bg-[#0D0D0E]/95 border border-[#FF00E5]/20 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#FF00E5]/15 border border-[#FF00E5]/35 text-white flex items-center justify-center">
                <span className="font-sans font-extrabold text-base text-neon-pink">₦</span>
              </div>
              <div>
                <p className="text-[9px] uppercase font-mono tracking-widest text-white/40 font-bold">HQ Revenue</p>
                <h4 className="text-xl font-display font-black text-neon-cyan mt-0.5">₦{liveStats.revenueNGN.toLocaleString()}</h4>
                <span className="text-[9px] text-white/30 font-mono">Based on ₦{settings.flatFee} fee</span>
              </div>
            </div>

          </div>

          {/* Core instructions panel */}
          <div className="p-5 bg-gradient-to-r from-black via-[#0D0D0E] to-black rounded-3xl border border-white/10 text-xs text-white/55 leading-relaxed text-left flex gap-4">
            <ShieldCheck className="h-6 w-6 text-neon-cyan shrink-0" />
            <div className="space-y-1">
              <h5 className="font-black text-white uppercase tracking-wider">Nigeria Platform Verification Keys</h5>
              <p>Ticketing configurations use synchronous client database listeners. Any dynamic additions or edits inside this board instantly override public discovery states in real-time. Review suspensions closely to avoid platform lockout.</p>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 2: EVENT BANS & PROMOTION CHECKS --- */}
      {adminTab === 'events' && (
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-black uppercase tracking-widest text-neon-pink">Live events management ({events.length})</h3>
          
          <div className="space-y-3">
            {events.map((evt) => (
              <div key={evt.id} className="p-4 rounded-2xl border border-white/10 bg-[#0D0D0E]/85 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans">
                
                <div className="flex gap-3 items-center">
                  <img src={evt.flyerUrl} alt={evt.title} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/5" referrerPolicy="no-referrer" />
                  <div className="text-left">
                    <h4 className="text-sm font-black text-white truncate max-w-[200px] uppercase">{evt.title}</h4>
                    <p className="text-white/40 font-mono text-[10px] uppercase mt-0.5">{evt.venue.split(',')[0]} • {evt.category}</p>
                    
                    {evt.isPromoted && (
                      <span className="inline-block mt-1 text-[9px] font-mono text-neon-cyan bg-neon-cyan/10 px-1.5 rounded font-black uppercase tracking-wider border border-neon-cyan/25">Promoted Banner Active</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left sm:text-right">
                    <p className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Total Capacity Configs:</p>
                    <p className="text-[11px] font-mono text-white">
                      {evt.ticketsConfig.reduce((acc, curr) => acc + curr.capacity, 0)} slots available
                    </p>
                  </div>

                  {evt.state === 'active' ? (
                    <button
                      onClick={() => toggleEventState(evt.id)}
                      className="px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500 text-white/55 hover:text-red-400 transition-all font-black uppercase tracking-wider text-[10px] cursor-pointer flex items-center gap-1.5"
                    >
                      <Ban className="h-3 w-3" />
                      <span>Disable Event</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleEventState(evt.id)}
                      className="px-3.5 py-2 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 hover:text-white transition-all font-black uppercase tracking-wider text-[10px] cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="h-3 w-3" />
                      <span>Re-Enable Event</span>
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SUBTAB 3: USER SUSPENSION & BADGE MANAGEMENT --- */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#00F2FF]">Sandbox user directory ({users.length})</h3>
          
          <div className="space-y-3">
            {users.map((usr) => (
              <div key={usr.email} className="p-4 rounded-2xl border border-white/10 bg-[#0D0D0E]/85 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-white text-sm uppercase tracking-wide">{usr.fullName}</h4>
                    <span className="px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-widest bg-black border border-white/5 font-black text-white/40">
                      {usr.role}
                    </span>
                    
                    {usr.isVerifiedOrganizer && (
                      <span className="text-[10px] text-neon-cyan font-black tracking-widest select-none font-mono uppercase" title="Verified Badge">✓ VIP</span>
                    )}
                  </div>
                  <p className="text-white/40 font-mono text-[10px] mt-1">{usr.email}</p>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Badge switcher */}
                  {usr.role === 'Organizer' && !usr.isVerifiedOrganizer && (
                    <button
                      onClick={() => verifyOrganizerEmail(usr.email)}
                      className="px-3.5 py-2 bg-[#00F2FF]/15 hover:bg-[#00F2FF]/25 border border-[#00F2FF]/30 text-[#00F2FF] rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      Verify Badge
                    </button>
                  )}

                  {/* Suspension audits */}
                  <button
                    onClick={() => toggleUserSuspension(usr.email)}
                    className={`px-3.5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                      usr.isSuspended
                        ? 'bg-[#FF00E5] text-white shadow-lg shadow-[#FF00E5]/15'
                        : 'bg-black hover:bg-neutral-900 border border-white/10 hover:border-red-500 text-white/55 hover:text-red-400'
                    }`}
                  >
                    {usr.isSuspended ? 'Lift Suspension' : 'Suspend Account'}
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SUBTAB 4: CONFIGURATION CONTROLS (PLATFORM FLATE FEES) --- */}
      {adminTab === 'configs' && (
        <form onSubmit={handleApplySettings} className="bg-[#0D0D0E]/95 border border-white/10 p-6 md:p-8 rounded-3xl max-w-xl space-y-6 shadow-2xl text-left">
          <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#00F2FF]">Update system wide parameters</h3>

          {/* Success messages */}
          {configSuccess && (
            <div className="rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 p-3.5 text-xs text-neon-cyan flex items-center gap-1.5 font-mono">
              <Check className="h-4 w-4" />
              <span>Settings updated successfully! Changes apply to active checkouts instantly.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-white/40 mb-1.5">Ticket Flat platform Fee (₦)</label>
              <input
                type="number"
                value={flatFeeLocal}
                onChange={(e) => setFlatFeeLocal(e.target.value)}
                placeholder="250"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs text-white focus:border-neon-cyan focus:outline-none font-mono"
              />
              <p className="text-[10px] text-white/30 font-mono mt-1 leading-snug">Convenience cost added to every single purchased ticket.</p>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-white/40 mb-1.5">Sponsor Promo pricing (₦)</label>
              <input
                type="number"
                value={promoPriceLocal}
                onChange={(e) => setPromoPriceLocal(e.target.value)}
                placeholder="5000"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs text-white focus:border-neon-cyan focus:outline-none font-mono"
              />
              <p className="text-[10px] text-white/30 font-mono mt-1 leading-snug">Cost required for hosting main banner search sliders.</p>
            </div>
          </div>

          {/* Gateway configurations */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-black uppercase tracking-wider text-white/40">Supported Instant Payment Providers</h4>
            
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-black text-xs font-sans font-semibold cursor-pointer">
                <span className="text-white/70 uppercase text-[10px] tracking-wide font-black">Allow Paystack Checkout Services</span>
                <input
                  type="checkbox"
                  checked={gatewayPaystack}
                  onChange={(e) => setGatewayPaystack(e.target.checked)}
                  className="h-4 w-4 text-neon-cyan border-white/15 rounded bg-[#0D0D0E] focus:ring-neon-cyan"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-black text-xs font-sans font-semibold cursor-pointer">
                <span className="text-white/70 uppercase text-[10px] tracking-wide font-black">Allow OPay Instant Wallet Routes</span>
                <input
                  type="checkbox"
                  checked={gatewayOpay}
                  onChange={(e) => setGatewayOpay(e.target.checked)}
                  className="h-4 w-4 text-neon-cyan border-white/15 rounded bg-[#0D0D0E] focus:ring-neon-cyan"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-black text-xs font-sans font-semibold cursor-pointer">
                <span className="text-white/70 uppercase text-[10px] tracking-wide font-black">Allow AlatPay Digital Banking Interfaces</span>
                <input
                  type="checkbox"
                  checked={gatewayAlatpay}
                  onChange={(e) => setGatewayAlatpay(e.target.checked)}
                  className="h-4 w-4 text-neon-cyan border-white/15 rounded bg-[#0D0D0E] focus:ring-neon-cyan"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-neon-pink text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-opacity-95 shadow-lg shadow-neon-pink/15 transition-all cursor-pointer"
          >
            Apply Configuration Overrides
          </button>
        </form>
      )}

    </div>
  );
};

export default function AdminPage() {
  return <AdminDashboard />;
}


