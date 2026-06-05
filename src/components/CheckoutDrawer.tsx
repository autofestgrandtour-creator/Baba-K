"use client";

import React, { useState, useEffect } from 'react';
import { usePlatform } from '@/context/PlatformContext';
import { EventItem, TicketTier } from '@/types';
import { X, ShieldAlert, CreditCard, Wallet, Smartphone, Landmark, CheckCircle, Ticket, ArrowRight, Loader2 } from 'lucide-react';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  selectedTier: TicketTier | null;
  onSuccess: () => void;
}

export const CheckoutDrawer: React.FC<CheckoutDrawerProps> = ({ isOpen, onClose, event, selectedTier, onSuccess }) => {
  const { currentUser, settings, buyTicket } = usePlatform();
  const [qty, setQty] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [selectedGateway, setSelectedGateway] = useState<'paystack' | 'opay' | 'alatpay'>('paystack');
  const [error, setError] = useState('');
  
  // Payment Simulation states
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [processingStep, setProcessingStep] = useState('');
  const [soldTicketsSerials, setSoldTicketsSerials] = useState<string[]>([]);

  // Pre-fill fields if user is logged in
  useEffect(() => {
    if (currentUser) {
      setBuyerName(currentUser.fullName);
      setBuyerEmail(currentUser.email);
    } else {
      setBuyerName('');
      setBuyerEmail('');
    }
    setQty(1);
    setPaymentState('idle');
    setError('');
  }, [currentUser, isOpen]);

  if (!isOpen || !event || !selectedTier) return null;

  // Pricing calculations
  const totalTicketPrice = selectedTier.price * qty;
  const totalPlatformFees = settings.flatFee * qty;
  const grandTotal = totalTicketPrice + totalPlatformFees;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!buyerName || !buyerEmail) {
      setError('Please provide the Attendee Name and target Email.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(buyerEmail)) {
      setError('Attendee email format is incorrect.');
      return;
    }

    // Step 1: Transition to Processing Overlay
    setPaymentState('processing');
    setProcessingStep(`Initializing secure handshake with ${selectedGateway.toUpperCase()}...`);

    // Simulate Paystack / OPay / AlatPay processing states without leaving the page
    setTimeout(() => {
      setProcessingStep('Sending callback instructions to Paystack Webhook servers...');
    }, 1200);

    setTimeout(() => {
      setProcessingStep('Verifying platform transaction limits and ticket counts...');
    }, 2400);

    setTimeout(() => {
      try {
        const generated = buyTicket(
          event.id,
          selectedTier.name,
          qty,
          buyerName,
          buyerEmail,
          selectedGateway
        );
        
        setSoldTicketsSerials(generated.map(t => t.serialNumber));
        setPaymentState('success');
      } catch (err: any) {
        setError(err.message || 'Payment processor returned an issue. Please try again.');
        setPaymentState('idle');
      }
    }, 3800);
  };

  const handleCloseAndRefresh = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-all duration-300">
      
      {/* Background overlay click-off wrapper */}
      <div className="flex-grow" onClick={onClose} />

      {/* Drawer Container (Slides from right, takes complete screen context on mobile) */}
      <div className="w-full max-w-sm bg-[#0D0D0E] border-l border-white/10 p-6 flex flex-col justify-between h-screen overflow-y-auto relative shadow-2xl">
        
        {/* Header Close */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div>
            <h3 className="font-display text-lg font-black text-white uppercase tracking-tight">Ticket Selection</h3>
            <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">{event.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white rounded-full p-2 glass transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* FEEDBACK WARNINGS */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-950/40 border border-red-800/60 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* --- MAIN CHECKOUT / SELECTION SCENE --- */}
        {paymentState === 'idle' && (
          <form onSubmit={handlePay} className="flex-grow flex flex-col justify-between space-y-6">
            
            <div className="space-y-5">
              {/* Event card minimal view */}
              <div className="flex gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5">
                <img
                  src={event.flyerUrl}
                  alt={event.title}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover shrink-0 opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase truncate">{event.title}</h4>
                  <p className="text-[9px] sm:text-[10px] text-white/40 font-mono mt-0.5">{event.date} • {event.time}</p>
                  <p className="text-[11px] sm:text-xs text-neon-cyan font-mono mt-1 font-black uppercase">
                    {selectedTier.name} (₦{selectedTier.price.toLocaleString()})
                  </p>
                </div>
              </div>

              {/* Attendance Quantity selector */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-left">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Ticket Quantity</p>
                  <p className="text-[10px] text-white/40">Max limit of 5 passes per purchase</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white text-base font-bold border border-white/10 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-mono font-black text-white w-5 text-center">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(Math.min(5, qty + 1))}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white text-black text-base font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Personal Details fields */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-black uppercase tracking-widest text-white/30 text-left">Buyer Information</h4>
                
                <div className="text-left">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">Attendee Full Name</label>
                  <input
                    id="checkout-name"
                    type="text"
                    value={buyerName}
                    required
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g., Chioma Adebayo"
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-2 text-sm text-white focus:border-neon-cyan focus:outline-none"
                  />
                </div>

                <div className="text-left">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">Attendee Email (Delivery Target)</label>
                  <input
                    id="checkout-email"
                    type="email"
                    value={buyerEmail}
                    required
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="e.g., chioma@gmail.com"
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-2 text-sm text-white focus:border-neon-cyan focus:outline-none"
                  />
                </div>
              </div>

              {/* Zero-redirect payment provider selector */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-black uppercase tracking-widest text-white/30 text-left">Instant Local Payment Gateways</h4>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGateway('paystack')}
                    className={`flex flex-col items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedGateway === 'paystack'
                        ? 'border-neon-cyan bg-neon-cyan/5 text-neon-cyan shadow-[0_0_10px_rgba(0,242,255,0.1)] font-bold'
                        : 'border-white/10 bg-black text-white/40 hover:text-white'
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-400 shrink-0" />
                    <span className="text-[8px] sm:text-[9px] font-black font-mono break-all leading-tight">PAYSTACK</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGateway('opay')}
                    className={`flex flex-col items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedGateway === 'opay'
                        ? 'border-neon-cyan bg-neon-cyan/5 text-neon-cyan shadow-[0_0_10px_rgba(0,242,255,0.1)] font-bold'
                        : 'border-white/10 bg-black text-white/40 hover:text-white'
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neon-pink shrink-0" />
                    <span className="text-[8px] sm:text-[9px] font-black font-mono break-all leading-tight">OPAY</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGateway('alatpay')}
                    className={`flex flex-col items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedGateway === 'alatpay'
                        ? 'border-neon-cyan bg-neon-cyan/5 text-neon-cyan shadow-[0_0_10px_rgba(0,242,255,0.1)] font-bold'
                        : 'border-white/10 bg-black text-white/40 hover:text-white'
                    }`}
                  >
                    <Landmark className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400 shrink-0" />
                    <span className="text-[8px] sm:text-[9px] font-black font-mono break-all leading-tight">ALATPAY</span>
                  </button>
                </div>
                <p className="text-[9px] text-white/30 text-center font-mono">🔐 Settlement handled in NGN with end-to-end local hardware security protocols.</p>
              </div>
            </div>

            {/* Price display & action */}
            <div className="border-t border-white/10 pt-4 space-y-4">
              <div className="space-y-1.5 font-mono text-xs text-white/60 text-left">
                <div className="flex justify-between">
                  <span>Subtotal ({qty}x):</span>
                  <span className="text-white font-medium">₦{totalTicketPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee (Flat):</span>
                  <span className="text-white font-medium">₦{totalPlatformFees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white font-black text-base border-t border-white/5 pt-2">
                  <span>Total Grand Cost:</span>
                  <span className="text-[#00F2FF]">₦{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                id="checkout-pay-btn"
                className="w-full py-4 bg-[#00F2FF] text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-[#00F2FF]/20 hover:bg-[#00d6e0] transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Pay with {selectedGateway === 'paystack' ? 'Paystack' : selectedGateway === 'opay' ? 'OPay' : 'AlatPay'}</span>
                <ArrowRight className="h-4 w-4 shrink-0 font-bold" />
              </button>
            </div>

          </form>
        )}

        {/* --- PAYMENT PROCESSING ACTIVE OVERLAY SCREEN (ZERO REDIRECT) --- */}
        {paymentState === 'processing' && (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6 space-y-5">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-t-2 border-neon-cyan border-r-2 border-transparent animate-spin" />
              <Loader2 className="h-6 w-6 text-neon-cyan animate-pulse absolute top-5 left-5" />
            </div>
            <h4 className="font-display text-lg font-black text-white uppercase tracking-wide mt-4">Simulating Local Settlement</h4>
            <div className="text-xs font-mono text-white/60 bg-black px-4 py-3 rounded-xl border border-white/5 max-w-sm leading-relaxed">
              {processingStep}
            </div>
            <span className="text-[10px] text-white/30 font-mono tracking-wider">Please do not refresh, close, or leave. Handbook keys are rotating.</span>
          </div>
        )}

        {/* --- TRANSACTION COMPLETED SUCCESS OVERLAY SCREEN (ZERO REDIRECT) --- */}
        {paymentState === 'success' && (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6 space-y-6">
            <div className="h-16 w-16 rounded-full bg-neon-cyan/15 border-2 border-neon-cyan text-neon-cyan flex items-center justify-center animate-bounce">
              <CheckCircle className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-display text-xl font-black text-white uppercase tracking-wider">Pass Secured!</h4>
              <p className="text-xs text-white/50 leading-relaxed font-sans max-w-xs mx-auto">
                Payment synchronized with the Nigerian ledger. {qty} genuine serial codes registered under your profile.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#050505] border border-white/5 shadow-2xl w-full max-w-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-neon-cyan border-b border-white/5 pb-2">
                <Ticket className="h-4 w-4" />
                <span className="font-black uppercase tracking-widest text-[9px]">Verified Tickets Generated</span>
              </div>
              
              <div className="space-y-1.5 text-left font-mono text-[10.5px]">
                {soldTicketsSerials.map((serial, index) => (
                  <div key={index} className="flex justify-between text-white/60">
                    <span>Pass #{index + 1}:</span>
                    <span className="text-white font-black">{serial}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-white/5 pt-1.5 text-white/40 text-[10px]">
                  <span>Payment Gateway:</span>
                  <span className="text-[#00F2FF] uppercase font-bold">{selectedGateway}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-white/40 max-w-xs mx-auto leading-relaxed">
              Pass tokens are now live on Nigeria's cloud network. Click below to inspect your newly minted passes in your digital wallet.
            </p>

            <button
              onClick={handleCloseAndRefresh}
              className="w-full max-w-xs py-3.5 rounded-2xl bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xl"
            >
              <span>View Personal Wallet</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

