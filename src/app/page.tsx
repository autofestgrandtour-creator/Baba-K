"use client"; // CRITICAL: Tells Next.js this UI has state and interactivity

import React, { useState } from 'react';
import { PlatformProvider, usePlatform } from '@/context/PlatformContext';
import { SplashScreen } from '@/components/SplashScreen';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { CheckoutDrawer } from '@/components/CheckoutDrawer';
import { Explore } from '@/views/Explore';
import { SellEvent } from '@/views/SellEvent';
import { WalletView } from '@/views/Wallet';
import { MarketplaceView } from '@/views/Marketplace';
import { AdminDashboard } from '@/views/Admin';
import { EventItem, TicketTier } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

function DashboardContent() {
  const { currentUser, login } = usePlatform();
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  // Checkout Drawer triggers
  const [checkoutEvent, setCheckoutEvent] = useState<EventItem | null>(null);
  const [checkoutTier, setCheckoutTier] = useState<TicketTier | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleInitiateCheckout = (evt: EventItem, tier: TicketTier) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setCheckoutEvent(evt);
    setCheckoutTier(tier);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    setActiveTab('wallet');
  };

  const handleCreateEventSuccess = () => {
    setActiveTab('explore');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans flex flex-col justify-between selection:bg-neon-cyan selection:text-black">
      <SplashScreen />
      
      <div className="bg-[#0c0c0e] border-b border-white/5 px-4 py-1.5 text-center text-[10.5px] font-mono tracking-wide text-white/40 select-none flex items-center justify-center gap-2">
        <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="tracking-widest uppercase">BABA-K INTEGRATED SANDBOX RUNNING IN NGN: ZERO-REDIRECTION</span>
      </div>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} openAuthModal={() => setIsAuthOpen(true)} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'explore' && <Explore onBuyTicket={handleInitiateCheckout} openAuthModal={() => setIsAuthOpen(true)} />}
            {activeTab === 'sell' && <SellEvent onSuccess={handleCreateEventSuccess} />}
            {activeTab === 'wallet' && <WalletView />}
            {activeTab === 'marketplace' && <MarketplaceView />}
            {activeTab === 'admin' && currentUser?.role === 'Admin' && <AdminDashboard />}
          </motion.div>
        </AnimatePresence>
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CheckoutDrawer isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} event={checkoutEvent} selectedTier={checkoutTier} onSuccess={handleCheckoutSuccess} />
    </div>
  );
}

// In Next.js, we export the default function to render the page, wrapped in the Provider
export default function Home() {
  return (
    <PlatformProvider>
      <DashboardContent />
    </PlatformProvider>
  );
}