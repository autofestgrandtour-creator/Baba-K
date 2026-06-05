"use client";

import React, { useState, useMemo } from 'react';
import { usePlatform } from '@/context/PlatformContext';
import { PremiumTicket } from '@/components/PremiumTicket';
import { PurchasedTicket } from '@/types';
import { Wallet as WalletIcon, Smartphone, Sliders, ChevronRight, X, AlertTriangle, ArrowRight, DollarSign, Download, BadgeCheck } from 'lucide-react';
import { TicketScanner } from '@/components/TicketScanner';
import { motion, AnimatePresence } from 'framer-motion';

export const WalletView: React.FC = () => {
  const { currentUser, tickets, events, listTicketForResale, cancelResale } = usePlatform();
  
  // Track selected active ticket for details modal / secondary inspection
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Track scanner panel visibility state
  const [showScanner, setShowScanner] = useState(false);

  // Resale Drawer parameters
  const [resaleTicketId, setResaleTicketId] = useState<string | null>(null);
  const [resalePrice, setResalePrice] = useState('');
  const [resaleError, setResaleError] = useState('');
  const [resaleSuccess, setResaleSuccess] = useState(false);

  // Filter tickets to only show those owned by the active user session!
  const userTickets = useMemo(() => {
    if (!currentUser) return [];
    return tickets.filter(tkt => tkt.buyerEmail.toLowerCase() === currentUser.email.toLowerCase());
  }, [tickets, currentUser]);

  const activeTicketInfo = useMemo(() => {
    if (!selectedTicketId) return null;
    const ticket = tickets.find(t => t.id === selectedTicketId);
    if (!ticket) return null;
    const event = events.find(e => e.id === ticket.eventId);
    return { ticket, event };
  }, [tickets, events, selectedTicketId]);

  const resaleTicketDetails = useMemo(() => {
    if (!resaleTicketId) return null;
    const ticket = tickets.find(t => t.id === resaleTicketId);
    if (!ticket) return null;
    const event = events.find(e => e.id === ticket.eventId);
    return { ticket, event };
  }, [tickets, events, resaleTicketId]);

  const handleListResale = (e: React.FormEvent) => {
    e.preventDefault();
    setResaleError('');

    if (!resaleTicketId) return;
    const priceNum = Math.abs(Number(resalePrice));
    
    if (isNaN(priceNum) || priceNum <= 0) {
      setResaleError('Please specify a positive price configuration.');
      return;
    }

    listTicketForResale(resaleTicketId, priceNum);
    setResaleSuccess(true);
    setTimeout(() => {
      setResaleSuccess(false);
      setResaleTicketId(null);
      setResalePrice('');
    }, 1800);
  };

  const handleSimulateDownload = () => {
    alert('Simulating PDF Ticket Pass download using local client resources. Printed QR Ticket code: ' + activeTicketInfo?.ticket.qrCode);
  };

  return (
    <div id="wallet-view" className="space-y-8 text-left">
      
      {/* 1. Header identity title */}
      <div>
        <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">Your Wallet</h2>
        <p className="text-sm text-white/40">Access verified ticket QR codes for scanning gates, and configure resale listings.</p>
      </div>

      {/* 2. SENTRY DOOR SCANNER FOR ORGANIZERS / ADMINS */}
      {currentUser && (currentUser.role === 'Organizer' || currentUser.role === 'Admin') && (
        <div className="space-y-6">
          <div className="bg-[#09090b] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-left">
              <h4 className="text-xs font-mono font-black text-neon-cyan uppercase tracking-widest flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-neon-cyan animate-ping shrink-0" />
                <span>Sentry Gate Controller Active</span>
              </h4>
              <p className="text-xs text-white/45 mt-1 max-w-xl">
                As an Authorized {currentUser.role}, you have secure access to validate digital ticket QR passes on-site. Touch code buttons to quick-simulate real reader events.
              </p>
            </div>
            <button
              onClick={() => setShowScanner(!showScanner)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                showScanner 
                  ? 'bg-red-950/20 text-red-450 border border-red-900/40 shadow-sm' 
                  : 'bg-white/5 border border-white/10 text-white hover:border-neon-cyan hover:bg-white/10'
              }`}
            >
              {showScanner ? 'Close Gate Scanner' : 'Launch Gate Scanner (Camera)'}
            </button>
          </div>

          {showScanner && (
            <div className="animate-fade-in">
              <TicketScanner onClose={() => setShowScanner(false)} />
            </div>
          )}
        </div>
      )}

      {!currentUser ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10 bg-white/5">
          <WalletIcon className="h-10 w-10 text-white/30 mx-auto mb-3" />
          <h4 className="font-display font-medium text-white/60 uppercase">Device Wallet Locked</h4>
          <p className="text-xs text-white/40 max-w-sm mx-auto mt-1">Please sign in and authorize sandbox credentials to access verified event ticket items.</p>
        </div>
      ) : userTickets.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10 bg-white/5">
          <WalletIcon className="h-10 w-10 text-white/30 mx-auto mb-3" />
          <h4 className="font-display font-medium text-white/60 uppercase">Device Empty</h4>
          <p className="text-xs text-white/40 max-w-sm mx-auto mt-1">You do not own any digital event passes currently. Browse events tab or switch roles to test purchases!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* LEFT LIST: VERIFIED TICKETS LIST */}
          <div className="md:col-span-6 space-y-4">
            <h3 className="text-xs font-sans font-black uppercase tracking-widest text-[#00F2FF]">Verified event passes ({userTickets.length})</h3>
            
            <div className="space-y-3">
              {userTickets.map((tkt, idx) => {
                const event = events.find(e => e.id === tkt.eventId);
                if (!event) return null;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, type: 'spring', stiffness: 220, damping: 20 }}
                    whileTap={{ scale: 0.985 }}
                    key={tkt.id}
                    onClick={() => setSelectedTicketId(tkt.id)}
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 ${
                      selectedTicketId === tkt.id
                        ? 'border-neon-cyan bg-zinc-850 font-bold'
                        : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-850'
                    }`}
                  >
                    <div className="flex gap-3 items-center min-w-0 w-full sm:w-auto">
                      <img src={event.flyerUrl} alt={event.title} className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover shrink-0 opacity-80" referrerPolicy="no-referrer" />
                      <div className="text-left min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-sans font-extrabold text-white uppercase truncate max-w-[130px] sm:max-w-[200px]">{event.title}</h4>
                        <p className="text-[10px] sm:text-xs text-zinc-400 font-sans font-medium mt-0.5">{event.date} • {tkt.ticketTierName}</p>
                        
                        {tkt.isReselling && (
                          <span className="inline-block mt-1 text-[9px] font-sans text-neon-pink font-black bg-neon-pink/10 px-1.5 py-0.5 rounded border border-neon-pink/20 uppercase tracking-wider">
                            P2P RESALE RUNNING (₦{(tkt.resalePrice || 0).toLocaleString()})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t border-white/5 sm:border-0 pt-2 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="block text-[10px] font-sans font-bold text-zinc-500 uppercase">{tkt.serialNumber.split('-')[1]}</span>
                        <span className="text-[10px] text-neon-cyan font-sans font-extrabold uppercase">Active PASS</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/30 hidden sm:block" />
                    </div>

                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* RIGHT CONTAINER: PREMIUM TICKET HOVER EXPANSION */}
          <div className="md:col-span-6 space-y-6">
            <h3 className="text-xs font-mono font-black uppercase tracking-widest text-neon-pink">Interactive Visualization</h3>

            {activeTicketInfo && activeTicketInfo.event ? (
              <div className="rounded-3xl border border-white/10 p-6 bg-[#0D0D0E] flex flex-col items-center shadow-2xl">
                
                {/* 3D Holographic Model rendering */}
                <PremiumTicket
                  ticket={activeTicketInfo.ticket}
                  event={activeTicketInfo.event}
                />

                {/* Event Actions structure below graphic */}
                <div className="w-full mt-6 border-t border-white/10 pt-4 space-y-3">
                  <div className="flex gap-2.5">
                    
                    <button
                      onClick={handleSimulateDownload}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 text-white/60" />
                      <span>Download PDF</span>
                    </button>

                    {activeTicketInfo.ticket.isReselling ? (
                      <button
                        onClick={() => cancelResale(activeTicketInfo.ticket.id)}
                        className="flex-1 py-3 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/40 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Cancel Resale</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setResaleTicketId(activeTicketInfo.ticket.id)}
                        className="flex-1 py-3 bg-neon-pink text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-neon-pink/10 hover:shadow-neon-pink/30 hover:bg-opacity-90"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>List for Resale</span>
                      </button>
                    )}

                  </div>
                  
                  <div className="rounded-xl p-3 bg-white/5 border border-white/5 flex items-center gap-2 text-[10px] text-white/40 font-mono leading-relaxed text-left">
                    <Smartphone className="h-4 w-4 text-neon-cyan shrink-0 animate-bounce duration-1000" />
                    <span>Holographic card shifts with user mouse coordinate vectors simulating smartphone axis gyroscopes.</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 bg-white/5 rounded-3xl text-center">
                <Smartphone className="h-8 w-8 text-white/20 animate-pulse mb-3" />
                <p className="text-xs text-white/40 max-w-xs leading-relaxed font-mono">Pick a ticket pass from your left gallery to load 3D holographic rendering vectors.</p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* --- INLINE RESALE MARKETPLACE SETUP DRAWER (ZERO REDIRECTS) --- */}
      {resaleTicketDetails && resaleTicketDetails.event && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0D0D0E]/95 p-6 shadow-2xl space-y-6">
            
            {/* Header X */}
            <button
              onClick={() => setResaleTicketId(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white rounded-full p-2 glass cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-1">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neon-pink/10 text-neon-pink border border-neon-pink/20">
                <DollarSign className="h-5 w-5" />
              </span>
              <h3 className="font-display text-lg font-black uppercase text-white tracking-tight leading-none mt-2">P2P Peer Market</h3>
              <p className="text-xs text-white/40">Setup an asking price. Ownership matches immediate digital state transfer upon sale.</p>
            </div>

            {/* Error alerts */}
            {resaleError && (
              <div className="rounded-lg bg-red-950/40 border border-red-800/60 p-2.5 text-xs text-red-500">
                {resaleError}
              </div>
            )}
            {resaleSuccess && (
              <div className="rounded-lg bg-emerald-950/40 border border-emerald-800/60 p-2.5 text-xs text-emerald-400 flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4" />
                <span>Ticket listed successfully!</span>
              </div>
            )}

            <form onSubmit={handleListResale} className="space-y-4">
              
              <div className="p-3.5 bg-black rounded-xl border border-white/5 text-xs text-left">
                <p className="font-extrabold text-white leading-snug uppercase tracking-wide">{resaleTicketDetails.event.title}</p>
                <p className="text-white/40 font-mono mt-0.5">Tier: {resaleTicketDetails.ticket.ticketTierName}</p>
                <div className="flex justify-between mt-3 font-mono text-[10.5px] text-white/40 border-t border-white/5 pt-3">
                  <span>Purchased Price Paid:</span>
                  <span className="text-white font-bold">₦{resaleTicketDetails.ticket.pricePaid.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-white/40 mb-1">Set Asking Price (₦ - NGN)</label>
                <input
                  type="number"
                  value={resalePrice}
                  required
                  onChange={(e) => setResalePrice(e.target.value)}
                  placeholder="e.g. 12000"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-neon-cyan font-mono font-bold focus:border-[#00F2FF] focus:outline-none"
                />
                <p className="text-[10px] text-white/30 font-mono mt-1 leading-snug">Sellers are responsible for fair local pricing scales.</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#FF00E5] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg hover:bg-opacity-90 transition-colors cursor-pointer"
              >
                Publish Listing Instantly
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};



export default function WalletPage() {
  return <WalletView />;
}
