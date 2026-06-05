"use client";

import React, { useState } from 'react';
import { usePlatform } from '@/context/PlatformContext';
import { Camera, Scan, X, AlertCircle, ShieldCheck, RefreshCw, KeyRound, Check, Ticket, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TicketScannerProps {
  onClose?: () => void;
}

export const TicketScanner: React.FC<TicketScannerProps> = ({ onClose }) => {
  const { tickets, events, validateTicket } = usePlatform();
  const [inputCode, setInputCode] = useState('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scanMessage, setScanMessage] = useState('');
  const [activeScannedTicket, setActiveScannedTicket] = useState<any>(null);

  // Filter out tickets that exist to allow easy shortcut scanning simulation
  const mockScanShortcuts = tickets.slice(0, 5); // display up to 5 tickets for swift sandbox testing

  const handleScanSubmit = (codeOrSerial: string) => {
    if (!codeOrSerial.trim()) return;
    
    setScanStatus('scanning');
    setActiveScannedTicket(null);
    setScanMessage('');

    // Simulate scanning camera latency of 900ms
    setTimeout(() => {
      const result = validateTicket(codeOrSerial);
      if (result.success) {
        setScanStatus('success');
        setScanMessage(result.message);
        setActiveScannedTicket(result.ticket);
      } else {
        setScanStatus('error');
        setScanMessage(result.message);
        if (result.ticket) {
          setActiveScannedTicket(result.ticket);
        }
      }
    }, 900);
  };

  const handleResetScanner = () => {
    setScanStatus('idle');
    setScanMessage('');
    setInputCode('');
    setActiveScannedTicket(null);
  };

  return (
    <div id="ticket-scanner" className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-zinc-100 max-w-xl mx-auto space-y-6">
      
      {/* Absolute top grid textures */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />
      
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest text-[#00F2FF] font-black uppercase">BABA-K GATE SENTRY VERIFIER</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="text-left">
        <h3 className="font-display text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
          <Camera className="h-5 w-5 text-neon-cyan animate-pulse" />
          <span>On-Site Ticket Validator</span>
        </h3>
        <p className="text-xs text-white/45 mt-1 font-sans">
          Verify digital passes instantly on the Nigeria ledger database. Simulates real hardware scan integration.
        </p>
      </div>

      {/* Grid container with Simulator viewport on left and control console on right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* VIEWPORT: SIMULATED HARDWARE LENS */}
        <div className="md:col-span-6 relative bg-black aspect-square md:aspect-auto md:h-64 rounded-2xl border border-white/5 overflow-hidden flex flex-col items-center justify-center p-4">
          
          {/* Corner cropping elements to simulate camera focal corners */}
          <div className="absolute top-4 left-4 h-5 w-5 border-t-2 border-l-2 border-neon-cyan/60 rounded-tl-md" />
          <div className="absolute top-4 right-4 h-5 w-5 border-t-2 border-r-2 border-neon-cyan/60 rounded-tr-md" />
          <div className="absolute bottom-4 left-4 h-5 w-5 border-b-2 border-l-2 border-neon-cyan/60 rounded-bl-md" />
          <div className="absolute bottom-4 right-4 h-5 w-5 border-b-2 border-r-2 border-neon-cyan/60 rounded-br-md" />

          {/* Grid lines to simulate camera sensor */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          <AnimatePresence mode="wait">
            
            {/* Status idle or scanning: Show scanning laser beam and HUD elements */}
            {(scanStatus === 'idle' || scanStatus === 'scanning') && (
              <div className="flex flex-col items-center justify-center relative w-full h-full">
                
                {/* Rolling Laser Sweep line */}
                <span className="absolute left-2 right-2 h-[2px] bg-red-500 shadow-[0_0_10px_#ef4444,0_0_20px_#ef4444] animate-[scanLaser_2.4s_infinite_ease-in-out] pointer-events-none z-10" style={{ top: '15%' }} />
                
                <Scan className={`h-12 w-12 text-zinc-700 ${scanStatus === 'scanning' ? 'animate-spin text-neon-cyan' : 'text-white/20'}`} />
                <span className="block text-[10px] font-mono tracking-widest text-[#00F2FF] uppercase mt-4 font-black">
                  {scanStatus === 'scanning' ? 'AUDITING LEDGER...' : 'LENS ACTIVE'}
                </span>
                <span className="text-[9px] text-white/30 font-mono mt-1">ALIGN QR OR SERIAL PASS</span>
              </div>
            )}

            {/* SCAN GRANTED: Success view */}
            {scanStatus === 'success' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="flex flex-col items-center text-center p-4 h-full justify-center space-y-3 z-20"
              >
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-black text-emerald-400 tracking-wider uppercase bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/20">ACCESS GRANTED</span>
                  <p className="text-xs text-white/40 font-mono mt-2">{activeScannedTicket?.serialNumber}</p>
                  <p className="text-xs font-bold text-zinc-100 leading-tight uppercase mt-0.5">{activeScannedTicket?.buyerName}</p>
                  <p className="text-[10px] font-mono text-neon-cyan uppercase mt-1">{activeScannedTicket?.ticketTierName}</p>
                </div>
              </motion.div>
            )}

            {/* SCAN EXPIRED / DENIED: Error view */}
            {scanStatus === 'error' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="flex flex-col items-center text-center p-4 h-full justify-center space-y-3 z-20"
              >
                <div className="h-14 w-14 rounded-full bg-red-500/10 border-2 border-red-500 text-red-400 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.2)]">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-black text-red-400 tracking-wider uppercase bg-red-500/15 px-2 py-0.5 rounded border border-red-500/20">ACCESS DENIED</span>
                  <p className="text-xs text-red-400 font-bold font-mono text-center mt-2 max-w-[180px] leading-tight text-red-400">{scanMessage}</p>
                  {activeScannedTicket && (
                    <div className="mt-1 text-center font-mono">
                      <p className="text-[9px] text-white/40">Registered Owner:</p>
                      <p className="text-[11px] font-bold text-white uppercase">{activeScannedTicket?.buyerName}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Reset button inside viewport */}
          {scanStatus !== 'idle' && (
            <button
              onClick={handleResetScanner}
              className="absolute bottom-3 py-1 px-3 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-mono uppercase tracking-widest text-zinc-300 transition-colors cursor-pointer flex items-center gap-1 border border-white/5"
            >
              <RefreshCw className="h-2.5 w-2.5" />
              <span>Reset Lens</span>
            </button>
          )}

        </div>

        {/* INPUTS & SHORTCUTS PANEL */}
        <div className="md:col-span-6 space-y-4">
          
          {/* Manual Entry Form */}
          <div className="space-y-2 text-left">
            <label className="block text-[10px] font-mono tracking-wider font-extrabold text-white/40 uppercase">Manual Code Entry</label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="e.g. NBK-193853-48"
                disabled={scanStatus === 'scanning'}
                className="flex-grow rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-neon-cyan font-mono font-semibold placeholder-white/25 focus:border-[#00F2FF] focus:outline-none"
              />
              <button
                onClick={() => handleScanSubmit(inputCode)}
                disabled={scanStatus === 'scanning' || !inputCode.trim()}
                className="px-4 bg-neon-cyan text-black rounded-xl text-xs font-bold transition-all hover:bg-[#00d6e0] disabled:bg-zinc-800 disabled:text-zinc-650 cursor-pointer flex items-center justify-center"
              >
                {scanStatus === 'scanning' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[9px] text-white/30 font-mono">Pasting a ticket serial code or unique QR string acts as an immediate laser match.</p>
          </div>

          {/* SIMULABLE PASS SHORTCUTS */}
          <div className="space-y-2 text-left pt-2 border-t border-white/5">
            <span className="block text-[10px] font-mono tracking-wider font-extrabold text-white/40 uppercase">Quick-simulate ticket scans</span>
            
            {mockScanShortcuts.length === 0 ? (
              <p className="text-[10px] text-white/30 italic font-mono">No active tickets available to check-in. Go purchase event passes as a buyer first!</p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 py-1">
                {mockScanShortcuts.map((tkt) => {
                  const event = events.find(e => e.id === tkt.eventId);
                  return (
                    <button
                      key={tkt.id}
                      onClick={() => {
                        setInputCode(tkt.serialNumber);
                        handleScanSubmit(tkt.serialNumber);
                      }}
                      disabled={scanStatus === 'scanning'}
                      className={`w-full text-left p-2 rounded-xl text-[11px] border flex justify-between items-center transition-all bg-black cursor-pointer hover:border-white/15 ${
                        tkt.isValidated 
                          ? 'border-emerald-500/20 text-emerald-500/80 bg-emerald-950/5' 
                          : 'border-white/5 text-zinc-300 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold uppercase truncate max-w-[150px] leading-tight">{tkt.buyerName}</p>
                        <p className="text-[9px] font-mono text-zinc-550 truncate max-w-[130px] mt-0.5">{event?.title || 'Unknown Event'}</p>
                        <p className="text-[8px] font-mono text-[#00F2FF]">{tkt.serialNumber}</p>
                      </div>

                      <div className="flex flex-col items-end shrink-0 pl-2">
                        {tkt.isValidated ? (
                          <span className="text-[8px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">Scanned</span>
                        ) : (
                          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wide">Click to Scan</span>
                        )}
                        <span className="text-[8.5px] text-zinc-450 font-mono mt-0.5 uppercase tracking-tighter">{tkt.ticketTierName}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

