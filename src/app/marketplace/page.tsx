"use client";

import React, { useState, useMemo } from 'react';
import { usePlatform } from '@/context/PlatformContext';
import { PurchasedTicket } from '@/types';
import { ShoppingCart, Calendar, MapPin, Tag, User, DollarSign, ArrowRight, Loader2, CheckCircle, RefreshCcw } from 'lucide-react';

export const MarketplaceView: React.FC = () => {
  const { tickets, events, currentUser, buyResaleTicket } = usePlatform();
  
  // Filtering & Selected Ticket tracker for resale purchase overlay
  const [selectedResaleId, setSelectedResaleId] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState(currentUser?.fullName || '');
  const [buyerEmail, setBuyerEmail] = useState(currentUser?.email || '');
  
  // Payment states
  const [payState, setPayState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [err, setErr] = useState('');

  // Collect all tickets currently marked for resale
  const listedTickets = useMemo(() => {
    return tickets.filter(t => t.isReselling && (!currentUser || t.buyerEmail.toLowerCase() !== currentUser.email.toLowerCase()));
  }, [tickets, currentUser]);

  const activeResaleItem = useMemo(() => {
    if (!selectedResaleId) return null;
    const ticket = tickets.find(t => t.id === selectedResaleId);
    if (!ticket) return null;
    const event = events.find(e => e.id === ticket.eventId);
    return { ticket, event };
  }, [tickets, events, selectedResaleId]);

  const handleBuyResale = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');

    if (!selectedResaleId) return;
    if (!buyerName || !buyerEmail) {
      setErr('Please provide delivery Name and Email address.');
      return;
    }

    setPayState('processing');

    try {
      await buyResaleTicket(selectedResaleId, buyerName, buyerEmail);
      setPayState('success');
    } catch (err: any) {
      setErr('Error clearing ownership registry.');
      setPayState('idle');
    }
  };

  const handleSuccessClose = () => {
    setPayState('idle');
    setSelectedResaleId(null);
  };

  return (
    <div id="marketplace-view" className="space-y-8 text-left">
      
      {/* 1. View Header */}
      <div>
        <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">Resale Market</h2>
        <p className="text-sm text-white/40">Safely acquire verified tickets sold by fellow attendees with instant electronic ownership transfer.</p>
      </div>

      {/* 2. Resale Items Grid */}
      {listedTickets.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10 bg-white/5">
          <ShoppingCart className="h-10 w-10 text-white/30 mx-auto mb-3" />
          <h4 className="font-display font-medium text-white/60 uppercase">No active peer listings</h4>
          <p className="text-xs text-white/40 max-w-sm mx-auto mt-1 leading-relaxed">There are no peer-to-peer ticket listings active currently. Create an event, purchase a ticket, then list it from your Digital Wallet to test this workflow!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listedTickets.map((tkt) => {
            const event = events.find(e => e.id === tkt.eventId);
            if (!event) return null;

            // Calculate price difference (profit / savings)
            const diff = (tkt.resalePrice || 0) - tkt.pricePaid;
            const percentage = Math.round((diff / tkt.pricePaid) * 100);

            return (
              <div
                key={tkt.id}
                className="group rounded-2xl glass p-4 transition-all hover:border-neon-cyan/55 duration-300 hover:scale-[1.01] hover:bg-white/10 shadow-2xl cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  
                  {/* Event Flyer header minimal wrapper */}
                  <div className="relative h-36 rounded-xl overflow-hidden bg-black border border-white/5">
                    <img src={event.flyerUrl} alt={event.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 duration-300" referrerPolicy="no-referrer" />
                    <div className="absolute top-2 right-2 glass bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono font-black text-[#00F2FF] border border-neon-cyan/20 uppercase tracking-widest">
                      Verified Listing
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1.5 text-left">
                    <h3 className="font-display text-sm font-black text-white uppercase truncate">{event.title}</h3>
                    <p className="text-[10px] text-white/40 font-mono flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-neon-pink" /> {event.date} • {event.time}
                    </p>
                    <p className="text-[10px] text-white/40 font-mono flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-neon-cyan" /> Tier: <strong className="text-white uppercase font-black">{tkt.ticketTierName}</strong>
                    </p>
                  </div>

                  {/* Pricing Comparison panel */}
                  <div className="bg-black border border-white/5 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
                    <div className="text-left">
                      <span className="block text-[8px] text-white/30 uppercase tracking-wider">Original Base</span>
                      <span className="text-white/45 text-[11px] line-through">₦{tkt.pricePaid.toLocaleString()}</span>
                    </div>

                    <div className="text-right">
                      <span className="block text-[8px] text-neon-pink uppercase tracking-wider font-extrabold">Peer Ask</span>
                      <span className="text-[#00F2FF] text-sm font-black">₦{(tkt.resalePrice || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Seller name indicators */}
                  <p className="text-[9.5px] text-white/30 font-mono flex items-center gap-1.5 text-left">
                    <User className="h-3.5 w-3.5 text-white/30" /> Owner Address: <span className="text-white/50 font-black">{tkt.buyerName.split(' ')[0]}</span>
                  </p>

                </div>

                <button
                  onClick={() => {
                    setBuyerName(currentUser?.fullName || '');
                    setBuyerEmail(currentUser?.email || '');
                    setSelectedResaleId(tkt.id);
                  }}
                  className="w-full py-3 bg-[#00F2FF] hover:bg-[#00d6e0] text-black rounded-xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer mt-4 shadow-lg shadow-neon-cyan/10"
                >
                  Acquire Pass
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* --- P2P INSTANT TRANSACTION MODAL OVERLAY (ZERO REDIRECTS) --- */}
      {activeResaleItem && activeResaleItem.event && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0D0D0E]/95 p-6 shadow-2xl space-y-6">
            
            <button
              onClick={() => setSelectedResaleId(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white rounded-full p-2 glass cursor-pointer"
            >
              <XIcon />
            </button>

            {err && (
              <div className="rounded-lg bg-red-950/40 border border-red-800/60 p-2 text-xs text-red-500">
                {err}
              </div>
            )}

            {/* --- IDLE checkout form details --- */}
            {payState === 'idle' && (
              <form onSubmit={handleBuyResale} className="space-y-4 text-left">
                
                <div className="text-center">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neon-pink/15 text-neon-pink border border-neon-pink/30">
                    <ShoppingCart className="h-5 w-5" />
                  </span>
                  <h3 className="font-display font-black uppercase text-white text-base mt-2 tracking-tight">P2P Peer Settlement</h3>
                  <p className="text-xs text-white/40 mt-1">This ticket serial is digitally tracked and instantly reassigned.</p>
                </div>

                <div className="p-3.5 bg-black border border-white/5 rounded-xl space-y-2 text-xs">
                  <p className="font-black text-white leading-snug uppercase tracking-wide">{activeResaleItem.event.title}</p>
                  <p className="text-white/40 font-mono text-[10.5px]">Serial Code: {activeResaleItem.ticket.serialNumber}</p>
                  
                  <div className="flex justify-between font-mono text-white/40 border-t border-white/5 pt-2 text-[11px]">
                    <span>Initial List Cost:</span>
                    <span>₦{activeResaleItem.ticket.pricePaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-mono font-black text-neon-cyan text-sm">
                    <span>Acquiring Asking Cost:</span>
                    <span>₦{(activeResaleItem.ticket.resalePrice || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3 font-sans">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">Buyer Full Name</label>
                    <input
                      type="text"
                      value={buyerName}
                      required
                      placeholder="e.g. Chioma Adebayo"
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs text-white focus:border-neon-cyan focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">Registered Email Deliverable</label>
                    <input
                      type="email"
                      value={buyerEmail}
                      required
                      placeholder="e.g. chioma@gmail.com"
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs text-white focus:border-neon-cyan focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-neon-pink hover:bg-opacity-95 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Authorize P2P Transfer</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

              </form>
            )}

            {/* --- PROCESSING overlays --- */}
            {payState === 'processing' && (
              <div className="flex-grow flex flex-col items-center justify-center text-center py-8 space-y-4">
                <div className="relative">
                  <div className="h-14 w-14 rounded-full border-t-2 border-neon-pink border-r-2 border-transparent animate-spin" />
                  <Loader2 className="h-5 w-5 text-neon-pink animate-pulse absolute top-4.5 left-4.5" />
                </div>
                <h4 className="font-display font-black uppercase text-sm text-white mt-4 tracking-wider">Verifying Peer Cryptographic Keys</h4>
                <p className="text-[10px] font-mono text-white/40">Cancelling old digital serials | Registering fresh verification blocks...</p>
              </div>
            )}

            {/* --- SUCCESS OVERLAYS --- */}
            {payState === 'success' && (
              <div className="flex-grow flex flex-col items-center justify-center text-center py-6 space-y-5 text-sans">
                <div className="h-12 w-12 rounded-full bg-neon-cyan/15 border-2 border-neon-cyan text-neon-cyan flex items-center justify-center animate-bounce">
                  <CheckCircle className="h-6 w-6" />
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-display font-black uppercase text-white text-base tracking-wider">Ownership Transferred!</h4>
                  <p className="text-xs text-white/50 leading-relaxed max-w-xs mx-auto">
                    The electronic ticket database is updated. Genuine event tokens are now stored inside {buyerEmail}'s personal ticket wallet.
                  </p>
                </div>

                <button
                  onClick={handleSuccessClose}
                  className="w-full py-3.5 bg-white text-black text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-xl hover:bg-neutral-200"
                >
                  Browse remaining listings
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

const XIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4.5 w-4.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function MarketplacePage() {
  return <MarketplaceView />;
}
