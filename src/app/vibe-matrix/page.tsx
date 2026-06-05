"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Terminal, 
  Cpu, 
  Activity, 
  Settings, 
  RotateCcw, 
  Lock, 
  Unlock, 
  Clock, 
  CheckCircle, 
  AlertOctagon, 
  Zap, 
  Sliders, 
  Play, 
  SlidersHorizontal,
  RefreshCw,
  Trash2,
  Database
} from 'lucide-react';

const CORRECT_PIN = '1337';

interface LogEntry {
  id: string;
  time: string;
  source: 'sys' | 'auth' | 'ledger' | 'net' | 'ads';
  message: string;
}

export const VibeMatrix: React.FC = () => {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [obscured, setObscured] = useState<boolean[]>([false, false, false, false]);
  const [attempts, setAttempts] = useState(0);
  const [errorState, setErrorState] = useState(false);
  
  // Custom auth states
  const [isAuthorized, setIsAuthorized] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('vibe_matrix_authorized') === 'true';
  });
  const [decrypting, setDecrypting] = useState(false);
  const [decryptProgress, setDecryptProgress] = useState(0);
  const [currentDecryptLine, setCurrentDecryptLine] = useState('');

  // Dashboard state controls
  const [perfMode, setPerfMode] = useState<'Normal' | 'Accelerated' | 'Overclocked'>('Overclocked');
  const [density, setDensity] = useState<'Sparse' | 'Balanced' | 'Holographic'>('Holographic');
  const [fluxSpeed, setFluxSpeed] = useState<number>(1.5);
  const [isAmapianoBass, setIsAmapianoBass] = useState(true);
  const [isTelemetry, setIsTelemetry] = useState(true);
  const [isAutoClear, setIsAutoClear] = useState(false);

  // Uptime state
  const [uptime, setUptime] = useState(161); // start at some value
  const [logTriggerCount, setLogTriggerCount] = useState(0);

  // Quick action states
  const [cacheClearing, setCacheClearing] = useState(false);
  const [syncingLedger, setSyncingLedger] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [actionTerminalLine, setActionTerminalLine] = useState('STATUS: ENCRYPTION CORES SYNCHRONIZED');

  // Interactive logs pool
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', time: '13:52:40', source: 'sys', message: 'Vibe core initialized successfully.' },
    { id: '2', time: '13:52:42', source: 'net', message: 'Host listening established at port 3000' },
    { id: '3', time: '13:53:11', source: 'ads', message: 'Google AdSense verified sponsor banner integrated.' },
    { id: '4', time: '13:53:15', source: 'ledger', message: 'Auto-auditing conveniency ledger models.' },
    { id: '5', time: '13:54:01', source: 'auth', message: 'Security handshakes assigned client-side.' }
  ]);

  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Real-time local digital clock
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // System Uptime counter
  useEffect(() => {
    if (!isAuthorized) return;
    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isAuthorized]);

  // Obscure input helper
  const triggerObscureDelay = (index: number) => {
    const newObscured = [...obscured];
    newObscured[index] = false;
    setObscured(newObscured);

    const timer = setTimeout(() => {
      setObscured(prev => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
    }, 600);

    return () => clearTimeout(timer);
  };

  // Focus input automatically on load
  useEffect(() => {
    if (!isAuthorized && !decrypting) {
      setTimeout(() => {
        pinRefs[0].current?.focus();
      }, 300);
    }
  }, [isAuthorized, decrypting]);

  // Handle number keyboard input
  const handlePinChange = (index: number, val: string) => {
    // Only allow single digit numbers
    const cleanVal = val.replace(/[^0-9]/g, '').slice(-1);
    if (!cleanVal) {
      const newPin = [...pin];
      newPin[index] = '';
      setPin(newPin);
      return;
    }

    const newPin = [...pin];
    newPin[index] = cleanVal;
    setPin(newPin);
    triggerObscureDelay(index);

    // Focus next box if applicable
    if (index < 3) {
      pinRefs[index + 1].current?.focus();
    }
  };

  // Backspace handler
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        // focus prior and clear it
        const newPin = [...pin];
        newPin[index - 1] = '';
        setPin(newPin);
        pinRefs[index - 1].current?.focus();
      } else {
        const newPin = [...pin];
        newPin[index] = '';
        setPin(newPin);
      }
    }
  };

  // Automatic decrypt lock simulator state triggers when full PIN entered
  useEffect(() => {
    const enteredCode = pin.join('');
    if (enteredCode.length === 4) {
      if (enteredCode === CORRECT_PIN) {
        // CORRECT KEY DECRYPTION SEQUENCE
        setDecrypting(true);
        setErrorState(false);
        setDecryptProgress(0);
        setCurrentDecryptLine('DECRYPTING MATRIX CORE...');

        // Step by step visual load sequences for premium futuristic feel
        const steps = [
          { p: 25, label: 'ESTABLISHING CYBER METRICS TUNNEL...' },
          { p: 55, label: 'HANDSHAKING ENCRYPTION HASHES...' },
          { p: 75, label: 'SYNCHRONIZING TELEMETRY LEDGERS...' },
          { p: 100, label: 'DECRYPTION COMPLETE. AUTHORIZED.' }
        ];

        steps.forEach((step, i) => {
          setTimeout(() => {
            setDecryptProgress(step.p);
            setCurrentDecryptLine(step.label);
            if (step.p === 100) {
              setTimeout(() => {
                setIsAuthorized(true);
                localStorage.setItem('vibe_matrix_authorized', 'true');
                setDecrypting(false);
                setPin(['', '', '', '']);
              }, 600);
            }
          }, (i + 1) * 600);
        });

      } else {
        // WRONG PIN ERROR FLOW
        setErrorState(true);
        setAttempts(prev => prev + 1);
        
        // Vibration (if mobile supported)
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }

        setTimeout(() => {
          setPin(['', '', '', '']);
          setErrorState(false);
          pinRefs[0].current?.focus();
        }, 1200);
      }
    }
  }, [pin]);

  // Auto scroll logs console to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Live Core Log Generator
  useEffect(() => {
    if (!isAuthorized) return;

    const logPool = [
      { src: 'sys' as const, msg: 'Telemetry speed optimized via Cyber Flux engine.' },
      { src: 'ledger' as const, msg: 'Syncing primary ticket records with local client.' },
      { src: 'net' as const, msg: 'Proxy check valid. All connection metrics stable.' },
      { src: 'ads' as const, msg: 'Google Ads Slot view counts refreshed (+1 impression).' },
      { src: 'sys' as const, msg: 'Amapiano Bass Enhancer output set to +12dB preset.' },
      { src: 'auth' as const, msg: 'Audit check. Zero discrepancies identified.' },
      { src: 'net' as const, msg: 'Request cleared: GET /vibe-matrix (200 OK)' }
    ];

    const logInterval = setInterval(() => {
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
      const timestamp = new Date().toTimeString().split(' ')[0];
      
      setLogs(prev => [
        ...prev.slice(-30), // caps history length smoothly
        {
          id: Date.now().toString(),
          time: timestamp,
          source: randomLog.src,
          message: randomLog.msg
        }
      ]);
      setLogTriggerCount(c => c + 1);
    }, Math.max(3000 / fluxSpeed, 1000));

    return () => clearInterval(logInterval);
  }, [isAuthorized, fluxSpeed]);

  // Sleek Lock Reset Deauthenticator
  const handleDeauthorize = () => {
    setIsAuthorized(false);
    localStorage.removeItem('vibe_matrix_authorized');
    setPin(['', '', '', '']);
    setObscured([false, false, false, false]);
  };

  // Vibe Action simulator triggers
  const handleClearCache = () => {
    if (cacheClearing) return;
    setCacheClearing(true);
    setActionTerminalLine('CLEAR RUNTIME CACHE: EXECUTING CACHE PURGE SEQUENCE...');
    
    setTimeout(() => {
      setCacheClearing(false);
      setActionTerminalLine('CACHE PURGED SUCCESSFULLY // DISK SPACE RECLAIMED: 4.8MB');
      
      // Inject terminal log
      const timestamp = new Date().toTimeString().split(' ')[0];
      setLogs(prev => [
        ...prev,
        { id: Date.now().toString(), time: timestamp, source: 'sys', message: 'Cache clean completed. Recovered 4.8MB transient variables.' }
      ]);
    }, 1500);
  };

  const handleSyncLedger = () => {
    if (syncingLedger) return;
    setSyncingLedger(true);
    setActionTerminalLine('FORCE SYNC: INJECTING SYNCHRONIZING TELEMETRY STACK...');
    
    setTimeout(() => {
      setSyncingLedger(false);
      setActionTerminalLine('LEDGER STATE CORES SYNCHRONIZED ACROSS PLATFORMS');
      
      const timestamp = new Date().toTimeString().split(' ')[0];
      setLogs(prev => [
        ...prev,
        { id: Date.now().toString(), time: timestamp, source: 'ledger', message: 'Telemetry cores reset. Synchronizing peer-to-peer state: ACTIVE.' }
      ]);
    }, 1800);
  };

  // Convert seconds to digital time duration
  const formatUptimeBySeconds = (secs: number) => {
    const hours = Math.floor(secs / 3600).toString().padStart(2, '0');
    const mins = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const remainSecs = (secs % 60).toString().padStart(2, '0');
    return `${hours}:${mins}:${remainSecs}`;
  };

  return (
    <div className="min-h-screen bg-[#060607] text-[#e4e4e7] font-sans selection:bg-[#00F2FF] selection:text-black relative overflow-hidden flex flex-col justify-between py-6">
      
      {/* Dynamic Cyber Ambient Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:25px_25px] pointer-events-none" />
      
      <div className="absolute -top-40 -right-40 h-[400px] w-[400px] bg-[#00F2FF]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] bg-[#FF00E5]/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER COLOURED STATUS STRIP */}
      <div className="max-w-7xl w-full mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center pb-4 border-b border-white/5 font-mono text-[10px] tracking-widest text-zinc-550">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isAuthorized ? 'bg-[#00F2FF] animate-pulse' : 'bg-red-500'} shrink-0`} />
            <span className="uppercase font-black text-zinc-300">HQ CORE DECRYPTION CORE // INTEL® PROMPT v5.2</span>
          </div>
          <span className="hidden sm:inline text-[#00F2FF]/70">{currentTime || 'BABA-K SYSTEM'}</span>
        </div>
      </div>

      <main className="flex-grow flex items-center justify-center max-w-7xl w-full mx-auto px-4 md:px-8 py-8 relative z-10">
        <AnimatePresence mode="wait">
          {!isAuthorized ? (
            
            /* ==============================================================
               PIN AUTHENTICATION GATEWAY
               ============================================================== */
            <motion.div
              key="auth-gateway"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md p-8 rounded-3xl border border-white/10 bg-[#0B0B0C] relative shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Outer top energy bar */}
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#FF00E5] via-[#00F2FF] to-[#FF00E5]" />
              
              <div className="space-y-6 text-center">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00F2FF]">
                  {decrypting ? (
                    <RefreshCw className="h-6 w-6 animate-spin text-[#00F2FF]" />
                  ) : (
                    <Shield className="h-6 w-6 text-[#FF00E5] animate-pulse" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-mono text-xs font-black uppercase tracking-widest text-[#00F2FF]">SYSTEM SECURITY INGRESS</h3>
                  <h2 className="font-display font-black text-2xl tracking-tight text-white uppercase">Access Key Required</h2>
                  <p className="text-xs text-zinc-500 font-mono leading-relaxed">
                    Provide the 4-digit decryptor PIN to authorize this console session.
                  </p>
                </div>

                {/* Simulated Decryption Loader View */}
                {decrypting ? (
                  <div className="space-y-4 py-8 font-mono">
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${decryptProgress}%` }}
                        transition={{ ease: 'easeInOut' }}
                        className="h-full bg-gradient-to-r from-[#FF00E5] to-[#00F2FF]"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span className="animate-pulse">{currentDecryptLine}</span>
                      <span>{decryptProgress}%</span>
                    </div>
                  </div>
                ) : (
                  /* Form View with the automatic jump input fields */
                  <div className="space-y-6 py-4">
                    <div className={`flex justify-center gap-3.5 ${errorState ? 'animate-bounce' : ''}`}>
                      {pin.map((digit, index) => (
                        <input
                          key={index}
                          ref={pinRefs[index]}
                          type="text"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={digit ? (obscured[index] ? '•' : digit) : ''}
                          onChange={(e) => handlePinChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className={`w-14 h-14 rounded-2xl bg-black border-2 text-center text-xl font-bold font-mono focus:outline-none transition-all ${
                            errorState 
                              ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] text-red-500' 
                              : digit 
                              ? 'border-[#00F2FF] shadow-[0_0_12px_rgba(0,242,255,0.15)] text-white' 
                              : 'border-white/10 text-neutral-400 focus:border-[#FF00E5] focus:shadow-[0_0_12px_rgba(255,0,229,0.15)]'
                          }`}
                          maxLength={1}
                          disabled={decrypting}
                        />
                      ))}
                    </div>

                    {/* Status output log */}
                    <div className="h-6 flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        {errorState ? (
                          <motion.p 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-[10px] uppercase font-mono text-red-400 font-extrabold tracking-widest flex items-center gap-1"
                          >
                            <AlertOctagon className="h-3 w-3 shrink-0" />
                            <span>INVALID PIN KEY // HARD REBOOT LOCKOUT ACTIVE</span>
                          </motion.p>
                        ) : attempts > 0 ? (
                          <p className="text-[10px] font-mono text-zinc-500 uppercase">
                            Failed Attempts: {attempts} // Hint: Developer Pin is 1337
                          </p>
                        ) : (
                          <p className="text-[9.5px] font-mono text-zinc-650 uppercase tracking-wide">
                            HINT: 1337 (ENCRYPTED CORRELATION PHRASE)
                          </p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-white/5 font-mono text-[9px] text-zinc-600 flex justify-between">
                  <span>TERMINAL: INACTIVE</span>
                  <span>ENCRYPTION DECRYPTION SHA-256</span>
                </div>

              </div>
            </motion.div>

          ) : (
            
            /* ==============================================================
               CORE ADMIN VIBE MATRIX DASHBOARD
               ============================================================== */
            <motion.div
              key="dashboard-hub"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full space-y-8"
            >
              
              {/* SYSTEM LEVEL STATUS HEADER PANEL */}
              <div className="p-6 rounded-3xl border border-white/10 bg-[#0B0B0C] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative shadow-xl overflow-hidden">
                <div className="absolute top-0 inset-y-0 left-0 w-[4px] bg-[#00F2FF]" />
                
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="font-mono text-[9.5px] bg-[#00F2FF]/10 text-[#00F2FF] px-2 py-0.5 rounded font-black border border-[#00F2FF]/20 uppercase tracking-widest">
                      SYSTEM STATUS: OPERATIONAL
                    </h4>
                    <span className="text-[10px] text-zinc-550 font-mono hidden sm:inline">Uptime: {formatUptimeBySeconds(uptime)}</span>
                  </div>
                  
                  <h2 className="font-display font-black text-2xl text-white tracking-tight uppercase leading-none">
                    Vibe Matrix Executive Interface
                  </h2>
                  <p className="text-xs text-zinc-500 max-w-xl font-sans">
                    Secure server-isolated dashboard managing client aesthetics, audio filters, transaction telemetry and system parameters.
                  </p>
                </div>

                {/* Right widgets + Lock deauthorizer */}
                <div className="flex flex-wrap items-center gap-4 shrink-0 font-mono text-xs w-full md:w-auto mt-2 md:mt-0">
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                    <Clock className="h-4.5 w-4.5 text-[#00F2FF]" />
                    <div className="text-left line-clamp-1">
                      <span className="text-[8px] block text-zinc-500 uppercase leading-none">REALTIME TIMECLOCK</span>
                      <span className="text-zinc-300 text-[11px] font-bold">{currentTime || 'SYS TIME CONNECTED'}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDeauthorize}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-950/40 border border-red-500/30 text-red-200 hover:bg-red-900 hover:text-white transition-all rounded-xl font-bold cursor-pointer uppercase text-[10px] tracking-widest"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>De-Authorize</span>
                  </button>
                </div>
              </div>

              {/* CORE DASHBOARD THREE COLUMN LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                
                {/* COLUMN 1: PROJECT PARAMETER VIBE CONTROLS (Col span 5) */}
                <div className="lg:col-span-5 space-y-6 flex flex-col h-full justify-between">
                  
                  <div className="flex-grow p-6 rounded-3xl border border-white/10 bg-[#0B0B0C] space-y-6 shadow-xl relative overflow-hidden">
                    <span className="absolute -top-12 -right-12 h-24 w-24 bg-[#00F2FF]/5 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="border-b border-white/5 pb-4.5 flex items-center gap-2.5">
                      <Sliders className="h-4.5 w-4.5 text-[#00F2FF]" />
                      <h3 className="font-mono text-xs font-black uppercase tracking-widest text-[#00F2FF]">Vibe Parameter Cores</h3>
                    </div>

                    {/* Mode buttons */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest">Performance Configuration Mode</label>
                        <div className="grid grid-cols-3 gap-2 bg-black p-1 rounded-xl border border-white/5 text-[10px] font-semibold tracking-wider uppercase font-mono">
                          {(['Normal', 'Accelerated', 'Overclocked'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => {
                                setPerfMode(mode);
                                setActionTerminalLine(`PERFORMANCE CORES SHIFTED TO [${mode.toUpperCase()}]`);
                              }}
                              className={`py-1.5 px-2.5 rounded-lg transition-all text-center cursor-pointer font-bold ${
                                perfMode === mode
                                  ? 'bg-[#00F2FF] text-black font-extrabold shadow-md shadow-[#00F2FF]/10'
                                  : 'text-zinc-500 hover:text-zinc-300'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Display densities */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest">Holographic Aesthetic Density</label>
                        <div className="grid grid-cols-3 gap-2 bg-black p-1 rounded-xl border border-white/5 text-[10px] font-semibold tracking-wider uppercase font-mono">
                          {(['Sparse', 'Balanced', 'Holographic'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => {
                                setDensity(mode);
                                setActionTerminalLine(`AESTHETIC SCHEMATICS COMPLETED: [${mode.toUpperCase()} MODE]`);
                              }}
                              className={`py-1.5 px-2.5 rounded-lg transition-all text-center cursor-pointer font-bold ${
                                density === mode
                                  ? 'bg-[#FF00E5] text-white font-extrabold shadow-md shadow-[#FF00E5]/10'
                                  : 'text-zinc-500 hover:text-zinc-300'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Slider Control */}
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                          <span>Cyber Flux Loop Frequency</span>
                          <span className="text-[#00F2FF] font-bold font-mono">{fluxSpeed.toFixed(1)}x cycles</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="4.0"
                          step="0.1"
                          value={fluxSpeed}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setFluxSpeed(val);
                            setActionTerminalLine(`CYBER FLUX TUNED TO ${val.toFixed(1)}x ENCRYPTION FREQUENCY`);
                          }}
                          className="w-full accent-[#00F2FF] bg-black h-1 rounded-full cursor-pointer appearance-none border border-white/5"
                        />
                      </div>

                      {/* Diagnostic toggles */}
                      <div className="space-y-2 pt-4 border-t border-white/5 text-xs font-mono">
                        <label className="flex items-center justify-between p-3 rounded-2xl bg-black border border-white/5 cursor-pointer hover:bg-neutral-950/20">
                          <span className="text-zinc-400 font-bold uppercase text-[9.5px]">Amapiano Bass Enhancer (+12dB)</span>
                          <input
                            type="checkbox"
                            checked={isAmapianoBass}
                            onChange={(e) => {
                              setIsAmapianoBass(e.target.checked);
                              setActionTerminalLine(`AMAPIANO MULTIPLEX FILTER: ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
                            }}
                            className="h-4 w-4 bg-[#0B0B0C] border-zinc-700 rounded text-[#00F2FF] focus:ring-[#00F2FF]"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3 rounded-2xl bg-black border border-white/5 cursor-pointer hover:bg-neutral-950/20">
                          <span className="text-zinc-400 font-bold uppercase text-[9.5px]">High-Freq Live Telemetry Loop</span>
                          <input
                            type="checkbox"
                            checked={isTelemetry}
                            onChange={(e) => {
                              setIsTelemetry(e.target.checked);
                              setActionTerminalLine(`HIGH FREQ EMITTED PORT BUFFERING: ${e.target.checked ? 'MONITORED' : 'RESTRICTED'}`);
                            }}
                            className="h-4 w-4 bg-[#0B0B0C] border-zinc-700 rounded text-[#FF00E5] focus:ring-[#FF00E5]"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3 rounded-2xl bg-black border border-white/5 cursor-pointer hover:bg-neutral-950/20">
                          <span className="text-zinc-400 font-bold uppercase text-[9.5px]">Automated Convenience Settlement</span>
                          <input
                            type="checkbox"
                            checked={isAutoClear}
                            onChange={(e) => {
                              setIsAutoClear(e.target.checked);
                              setActionTerminalLine(`CONVENIENCE SETTLEMENT: ${e.target.checked ? 'AUTO SYNC' : 'MANUAL CACHING'}`);
                            }}
                            className="h-4 w-4 bg-[#0B0B0C] border-zinc-700 rounded text-[#00F2FF] focus:ring-[#00F2FF]"
                          />
                        </label>
                      </div>

                    </div>
                  </div>

                </div>

                {/* COLUMN 2: RETRO TERM LOG CONSOLE (Col span 7) */}
                <div className="lg:col-span-7 space-y-6 flex flex-col h-full">
                  
                  {/* REALTIME SYSTEM ENGINE TERMINAL */}
                  <div className="flex-grow p-6 rounded-3xl border border-white/10 bg-[#0B0B0C] flex flex-col justify-between h-[340px] md:h-[390px] shadow-xl relative overflow-hidden">
                    <span className="absolute -bottom-10 -right-10 h-24 w-24 bg-[#FF00E5]/5 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Terminal className="h-4.5 w-4.5 text-[#FF00E5] animate-pulse" />
                        <h3 className="font-mono text-xs font-black uppercase tracking-widest text-[#FF00E5]">Vibe Live Terminal Log</h3>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-[9px] text-zinc-500 font-mono tracking-tighter uppercase font-bold pr-1">Listening Port 3000</span>
                      </div>
                    </div>

                    {/* Console body */}
                    <div className="flex-grow my-4 bg-black/60 rounded-2xl p-4 font-mono text-[10.5px] overflow-y-auto max-h-[200px] md:max-h-[250px] border border-white/5 text-[#a855f7]/80 space-y-2 scrollbar-none">
                      {logs.map((log) => {
                        let colorClass = 'text-purple-400';
                        if (log.source === 'sys') colorClass = 'text-amber-400';
                        if (log.source === 'ledger') colorClass = 'text-green-400';
                        if (log.source === 'net') colorClass = 'text-[#00F2FF]';
                        if (log.source === 'ads') colorClass = 'text-pink-400';
                        
                        return (
                          <div key={log.id} className="leading-relaxed hover:bg-white/[0.02] px-1 py-0.5 rounded transition-colors">
                            <span className="text-zinc-650">[{log.time}]</span>{' '}
                            <span className={`uppercase font-black text-[9px] ${colorClass}`}>[{log.source.padEnd(5)}]</span>{' '}
                            <span className="text-zinc-300">{log.message}</span>
                          </div>
                        );
                      })}
                      <div ref={terminalEndRef} />
                    </div>

                    {/* Console input diagnostic strip */}
                    <div className="bg-black border border-white/5 p-3 rounded-2xl flex items-center justify-between font-mono text-[10px]">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-[#00F2FF] font-black shrink-0 animate-pulse">&gt;</span>
                        <span className="text-zinc-300 truncate tracking-tight">{actionTerminalLine}</span>
                      </div>
                      <span className="text-[#00F2FF] shrink-0 font-extrabold font-mono text-[9px] tracking-wide uppercase px-1 px-1.5 py-0.5 bg-[#00F2FF]/10 rounded border border-[#00F2FF]/20 ml-2">CORE_READY</span>
                    </div>

                  </div>

                </div>

              </div>

              {/* ACTION COMMAND CENTER STRIP (Component Quick Actions) */}
              <div className="p-6 rounded-3xl border border-white/10 bg-[#0B0B0C] relative shadow-xl overflow-hidden text-left">
                <span className="absolute -top-16 -left-16 h-32 w-32 bg-[#00F2FF]/3 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4.5">
                  <div className="space-y-1">
                    <h3 className="font-mono text-xs font-black uppercase tracking-widest text-[#00F2FF] flex items-center gap-2">
                      <Cpu className="h-4.5 w-4.5" />
                      <span>Diagnostics Command Matrix</span>
                    </h3>
                    <p className="text-[11px] text-zinc-500">Inject dynamic operational updates directly into the running deployment environment.</p>
                  </div>

                  <span className="text-[9px] font-mono text-zinc-650 tracking-tighter select-none font-bold block uppercase border border-zinc-800 rounded px-2 py-0.5">Secure Tunnel Enabled</span>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                  {/* Action 1: Clear Cache */}
                  <button
                    disabled={cacheClearing}
                    onClick={handleClearCache}
                    className="p-4 rounded-2xl border border-white/5 bg-black hover:bg-[#0B0B0C]/40 hover:border-amber-500/20 text-zinc-300 hover:text-white transition-all cursor-pointer select-none text-left flex items-start gap-3 group relative overflow-hidden"
                  >
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform shrink-0">
                      <Trash2 className="h-4.5 w-4.5 shrink-0" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-extrabold text-[#00F2FF] uppercase text-[9.5px]">Clear Runtime Cache</p>
                      <p className="text-[9.5px] text-zinc-500 truncate leading-relaxed">
                        {cacheClearing ? 'Purging files...' : 'Reclaim system variable storage'}
                      </p>
                    </div>
                  </button>

                  {/* Action 2: Force Ledger Sync */}
                  <button
                    disabled={syncingLedger}
                    onClick={handleSyncLedger}
                    className="p-4 rounded-2xl border border-white/5 bg-black hover:bg-[#0B0B0C]/40 hover:border-[#00F2FF]/20 text-zinc-300 hover:text-white transition-all cursor-pointer select-none text-left flex items-start gap-3 group relative overflow-hidden"
                  >
                    <div className="h-8 w-8 rounded-lg bg-[#00F2FF]/10 border border-[#00F2FF]/25 flex items-center justify-center text-[#00F2FF] group-hover:scale-105 transition-transform shrink-0">
                      <RefreshCw className={`h-4.5 w-4.5 shrink-0 ${syncingLedger ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-extrabold text-[#00F2FF] uppercase text-[9.5px]">Force Ledger Sync</p>
                      <p className="text-[9.5px] text-zinc-500 truncate leading-relaxed">
                        {syncingLedger ? 'Syncing...' : 'Re-verify tickets and earnings'}
                      </p>
                    </div>
                  </button>

                  {/* Action 3: Maintenance Switch */}
                  <button
                    onClick={() => {
                      setMaintenanceMode(!maintenanceMode);
                      setActionTerminalLine(`MAINTENANCE OVERRIDE FLIP STATUS: ${!maintenanceMode ? 'ENABLED' : 'DISABLED'}`);
                      const timestamp = new Date().toTimeString().split(' ')[0];
                      setLogs(prev => [
                        ...prev,
                        { id: Date.now().toString(), time: timestamp, source: 'sys', message: `Maintenance mode state changed to ${!maintenanceMode ? 'ACTIVE' : 'INACTIVE'}` }
                      ]);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none text-left flex items-start gap-3 group relative overflow-hidden ${
                      maintenanceMode 
                        ? 'bg-red-950/15 border-red-500/30 text-white' 
                        : 'border-white/5 bg-black hover:bg-[#0B0B0C]/40 hover:border-red-500/20 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      maintenanceMode 
                        ? 'bg-red-500/20 border border-red-500/40 text-red-400' 
                        : 'bg-zinc-800/40 border border-zinc-700/30 text-zinc-400'
                    }`}>
                      <AlertOctagon className="h-4.5 w-4.5 shrink-0" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-extrabold text-[#00F2FF] uppercase text-[9.5px]">Maintenance Override</p>
                      <p className="text-[9.5px] text-zinc-500 truncate leading-relaxed">
                        {maintenanceMode ? 'STATUS: ACTIVE' : 'Enforce platform-wide lock'}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER CLADDING INSTRUCTIONS */}
      <div className="max-w-7xl w-full mx-auto px-4 md:px-8">
        <div className="pt-4 border-t border-white/5 font-mono text-[9px] text-zinc-600 flex flex-col sm:flex-row justify-between gap-2">
          <span>CODENAME: BABA-K VIBE MATRIX executive SECURE CONSOLE v5</span>
          <span className="text-zinc-500 flex items-center gap-1 justify-center sm:justify-start">
            <Unlock className="h-3 w-3 inline text-[#00F2FF]" /> SECURE ENCRYPTED ENVIRONMENT ACTIVE (SYS CORES OK)
          </span>
        </div>
      </div>

    </div>
  );
};



export default function VibeMatrixPage() {
  return <VibeMatrix />;
}
