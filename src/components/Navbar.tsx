"use client";

import React, { useState } from 'react';
import { usePlatform } from '@/context/PlatformContext';
import { Ticket, Wallet, PlusCircle, Shield, ShoppingCart, LogOut, LogIn, User, RefreshCw, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openAuthModal }) => {
  const { currentUser, logout } = usePlatform();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'explore', label: 'Discover', icon: Ticket, roles: ['Buyer', 'Organizer', 'Admin'] },
    { id: 'sell', label: 'Create Event', icon: PlusCircle, roles: ['Organizer', 'Admin'] },
    { id: 'wallet', label: 'Ticket Wallet', icon: Wallet, roles: ['Buyer', 'Organizer', 'Admin'] },
    { id: 'marketplace', label: 'P2P Tickets', icon: ShoppingCart, roles: ['Buyer', 'Organizer', 'Admin'] },
    { id: 'admin', label: 'HQ Terminal', icon: Shield, roles: ['Admin'] },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav id="nav-header" className="sticky top-0 z-40 w-full glass bg-[#050505]/40 backdrop-blur-md border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            
            {/* Logo & Platform Name */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavClick('explore')}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#00F2FF] to-[#FF00E5] shadow-lg shadow-neon-cyan/20 animate-pulse-slow shrink-0">
                <span className="font-display text-lg font-extrabold text-black tracking-tighter">B</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-sm sm:text-base font-bold tracking-tight text-white uppercase leading-none">
                  BABA-<span className="gradient-text font-black">K</span>
                </span>
                <span className="hidden sm:inline-block text-[8px] font-mono tracking-widest text-[#00F2FF] uppercase font-bold mt-0.5">Nigeria Ticketing</span>
              </div>
            </div>

            {/* Navigation Items - Elevated to lg breakpoint to prevent tablet wrapping */}
            <div className="hidden lg:flex items-center gap-1.5">
              {navItems.map((item) => {
                // Hide tabs based on user role authorization
                const isAllowed = currentUser 
                  ? item.roles.includes(currentUser.role)
                  : (item.id !== 'admin' && item.id !== 'sell');
                if (!isAllowed) return null;
                
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    id={`nav-btn-${item.id}`}
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-white/5 border border-neon-cyan/60 text-white shadow-[0_0_15px_rgba(0,242,255,0.15)] font-bold'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-neon-cyan' : 'text-white/40'}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Secondary Actions / Auth */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Auth / Account Trigger */}
              {currentUser ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="hidden xl:flex flex-col text-right">
                    <span className="text-xs font-medium text-zinc-200">{currentUser.fullName}</span>
                    <span className="text-[10px] font-mono text-white/40">{currentUser.email}</span>
                  </div>
                  <button
                    id="auth-logout-btn"
                    onClick={logout}
                    className="flex h-8.5 w-8.5 items-center justify-center rounded-lg glass bg-white/5 hover:bg-red-950/40 border border-white/10 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Logout Session"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  id="auth-login-trigger"
                  onClick={openAuthModal}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-neon-cyan hover:bg-[#00d6e0] text-black text-[11px] sm:text-xs font-bold font-display shadow-lg shadow-neon-cyan/25 transition-all cursor-pointer"
                >
                  <LogIn className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                  <span>Connect</span>
                </button>
              )}

              {/* Hamburger Button for Tablets/Mobile screens (shown on < lg) */}
              <button
                id="navbar-hamburger"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex lg:hidden h-8.5 w-8.5 items-center justify-center rounded-lg glass bg-white/5 border border-white/10 text-zinc-300 hover:text-white cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Slide-out Overlay drawer for mobile and tablets to provide native responsive experience */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-55 lg:hidden">
            {/* Backdrop wrapper */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Content Drawer panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-72 max-w-full bg-[#0d0d0f] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl z-50 h-full"
            >
              <div>
                {/* Header of Drawer */}
                <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#00F2FF] to-[#FF00E5]">
                      <span className="font-display text-sm font-extrabold text-black">B</span>
                    </div>
                    <span className="font-display text-sm font-bold tracking-tight text-white uppercase leading-none">
                      BABA-<span className="gradient-text font-black">K</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* User Info inside Drawer */}
                {currentUser && (
                  <div className="mb-6 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-neon-pink to-neon-cyan flex items-center justify-center text-[11px] font-bold text-black font-display">
                        {currentUser.fullName.charAt(0)}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-semibold text-zinc-100 truncate">{currentUser.fullName}</span>
                        <span className="text-[10px] font-mono text-zinc-400 truncate">{currentUser.email}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vertical menu navigation */}
                <div className="flex flex-col gap-2">
                  <p className="text-[9px] font-mono tracking-widest text-[#00F2FF]/60 uppercase ml-2 mb-1">NAVIGATION TERMINAL</p>
                  {navItems.map((item) => {
                    const isAllowed = currentUser 
                      ? item.roles.includes(currentUser.role)
                      : (item.id !== 'admin' && item.id !== 'sell');
                    if (!isAllowed) return null;
                    
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-neon-cyan/15 to-transparent border border-neon-cyan/50 text-white shadow-lg'
                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? 'text-neon-cyan' : 'text-zinc-500'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drawer footer containing details */}
              <div className="border-t border-white/5 pt-6 mt-6">
                <span className="block text-[8px] font-mono tracking-[0.2em] text-white/30 uppercase text-center">BABA-K Nigerian Ledgers © 2026</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};


