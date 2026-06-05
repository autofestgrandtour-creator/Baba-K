"use client"; // CRITICAL: Tells Next.js this UI has state and interactivity

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Key } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  
  const inputsRef = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setError(false);
      setShake(false);
      // Auto-focus first input
      setTimeout(() => {
        inputsRef[0].current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '').slice(-1);
    if (!numericValue) {
      const copy = [...pin];
      copy[index] = '';
      setPin(copy);
      return;
    }

    const copy = [...pin];
    copy[index] = numericValue;
    setPin(copy);

    // Auto-focus next input
    if (index < 3) {
      inputsRef[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        const copy = [...pin];
        copy[index - 1] = '';
        setPin(copy);
        inputsRef[index - 1].current?.focus();
      } else {
        const copy = [...pin];
        copy[index] = '';
        setPin(copy);
      }
    }
  };

  useEffect(() => {
    const enteredCode = pin.join('');
    if (enteredCode.length === 4) {
      if (enteredCode === '1337') {
        onSuccess();
        onClose();
      } else {
        setError(true);
        setShake(true);
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
        setTimeout(() => {
          setPin(['', '', '', '']);
          setShake(false);
          inputsRef[0].current?.focus();
        }, 1000);
      }
    }
  }, [pin, onClose, onSuccess]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={`relative w-full max-w-sm rounded-2xl border ${
              error ? 'border-red-500/50' : 'border-zinc-800'
            } bg-zinc-950 p-6 md:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.85)] z-10 text-center overflow-hidden`}
          >
            {/* Visual Header Accent Strip */}
            <div className={`absolute top-0 inset-x-0 h-1 ${error ? 'bg-red-500' : 'bg-[#00F2FF]'}`} />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-6">
              {/* Graphic Icon Header */}
              <div className="mx-auto h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center">
                {error ? (
                  <ShieldAlert className="h-5 w-5 text-red-500 animate-pulse" />
                ) : (
                  <Key className="h-5 w-5 text-[#00F2FF]" />
                )}
              </div>

              {/* Title texts */}
              <div className="space-y-1.5">
                <h3 className="font-sans text-[10px] font-black uppercase tracking-widest text-[#00F2FF]">
                  HQ CENTRAL GATEWAY
                </h3>
                <h2 className="font-sans font-black text-lg text-white uppercase tracking-tight">
                  Enter decryption code
                </h2>
                <p className="text-xs text-zinc-500 font-sans font-medium">
                  Enter the 4-digit security PIN to unlock the master console. <br />
                  <span className="text-zinc-600 block mt-1">(Hint: 1337)</span>
                </p>
              </div>

              {/* Secure input fields with optional shake animation on error */}
              <motion.div
                animate={shake ? { x: [-10, 10, -8, 8, -5, 5, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center gap-3 py-2"
              >
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputsRef[idx]}
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={digit ? '•' : ''}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-12 h-12 rounded-xl text-center text-lg font-bold font-sans focus:outline-none transition-all ${
                      error
                        ? 'border-2 border-red-500/80 bg-red-950/10 text-red-500'
                        : digit
                        ? 'border-2 border-[#00F2FF] bg-zinc-900 text-white shadow-[0_0_12px_rgba(0,242,255,0.1)]'
                        : 'border border-zinc-800 bg-zinc-900 text-transparent focus:border-[#00F2FF] focus:bg-zinc-850'
                    }`}
                    maxLength={1}
                  />
                ))}
              </motion.div>

              {/* Action State text footer */}
              <div className="h-4 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-[9px] font-sans font-black uppercase text-red-500 tracking-wider"
                    >
                      Security Denied // Code Invalidation
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};