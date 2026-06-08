"use client";

import React, { useState, useMemo } from 'react';
import { usePlatform } from '@/context/PlatformContext';
import { EventItem, TicketTier } from '@/types';
import { CowrieRating } from '@/components/CowrieRating';
import { EventReviewsSection } from '@/components/EventReviewsSection';
import { CATEGORIES } from '@/mockData';
import { GoogleAdsCard } from '@/components/GoogleAdsCard';
import { AuthModal } from '@/components/AuthModal';
import { CheckoutDrawer } from '@/components/CheckoutDrawer';
import { Search, Calendar, MapPin, Tag, Sparkles, SlidersHorizontal, ChevronRight, Zap, Info, Clock, MessageSquare, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExploreProps {
  onBuyTicket: (event: EventItem, tier: TicketTier) => void;
  openAuthModal: () => void;
}

export const Explore: React.FC<ExploreProps> = ({ onBuyTicket, openAuthModal }) => {
  const { events, currentUser, reviews, addReview } = usePlatform();
  
  // Filtering parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<'All' | 'Soon' | 'Later'>('All');
  
  // Selected Event Details modal tracker inside explore view (Zero redirection!)
  const [detailEventId, setDetailEventId] = useState<string | null>(null);

  // Vibe rating dynamic states
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  const handleAddReviewSubmit = (e: React.FormEvent, eventId: string) => {
    e.preventDefault();
    if (!userComment.trim()) return;
    addReview(eventId, userRating, userComment);
    setUserComment('');
    setUserRating(5);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 2000);
  };

  // Dynamic filter lists
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      // Must be active and not banned by admins
      if (evt.state !== 'active') return false;

      // Category match
      if (selectedCategory !== 'All' && evt.category !== selectedCategory) return false;

      // Text match (Search title, venue, or description)
      const query = searchQuery.toLowerCase();
      const matchText = 
        evt.title.toLowerCase().includes(query) || 
        evt.venue.toLowerCase().includes(query) || 
        evt.description.toLowerCase().includes(query);
      if (searchQuery && !matchText) return false;

      // Time match
      const eventDate = new Date(evt.date);
      const today = new Date();
      if (dateFilter === 'Soon') {
        const nextMonth = new Date();
        nextMonth.setDate(today.getDate() + 30);
        if (eventDate > nextMonth || eventDate < today) return false;
      } else if (dateFilter === 'Later') {
        const nextMonth = new Date();
        nextMonth.setDate(today.getDate() + 30);
        if (eventDate <= nextMonth) return false;
      }

      return true;
    });
  }, [events, selectedCategory, searchQuery, dateFilter]);

  // Promote Event Carousel highlights (Featured Promotions)
  const promotedEvents = useMemo(() => {
    return events.filter(evt => evt.isPromoted && evt.state === 'active');
  }, [events]);

  const activeDetailEvent = useMemo(() => {
    return events.find(e => e.id === detailEventId) || null;
  }, [events, detailEventId]);

  return (
    <div id="explore-view" className="space-y-12 pb-20">
      
      {/* 1. PROMOTED HERO CAROUSEL AD PREVIEWS (Sleek Theme Design) */}
      {promotedEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          id="promoted-banner"
          className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-zinc-850 bg-[#121214] shadow-2xl"
        >
          <div className="relative rounded-3xl bg-[#121214] p-6 sm:p-8 md:p-10 flex flex-col lg:flex-row items-center gap-8 justify-between">
            {/* Carousel Content */}
            <div className="space-y-5 max-w-xl text-left z-10 w-full">
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 border border-zinc-750 text-xs font-bold text-neon-cyan">
                <Sparkles className="h-3.5 w-3.5 text-neon-cyan" />
                <span className="uppercase tracking-widest text-[9px] font-black font-sans text-white">Featured Promotion</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none uppercase">
                {promotedEvents[0].title}
              </h1>

              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-sans">
                {promotedEvents[0].description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-neon-pink" /> {promotedEvents[0].date}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-neon-cyan" /> {promotedEvents[0].venue.split(',')[0]}</span>
              </div>

              <div className="pt-2 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setDetailEventId(promotedEvents[0].id)}
                  className="px-6 py-3.5 rounded-xl bg-[#00F2FF] hover:bg-[#00d6e0] text-black font-black text-xs uppercase tracking-widest shadow-lg transition-colors cursor-pointer w-full sm:w-auto text-center font-sans font-extrabold"
                >
                  Inspect Tickets
                </motion.button>
              </div>
            </div>

            {/* Simulated interactive image with solid border card */}
            <div className="relative w-full lg:w-96 h-56 sm:h-64 md:h-80 shrink-0 z-10 group overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090B]/60 to-transparent z-10" />
              <img
                src={promotedEvents[0].flyerUrl}
                alt={promotedEvents[0].title}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 bg-zinc-950 px-3 py-1.5 rounded-lg z-20 text-[9px] font-sans text-neon-cyan font-black tracking-wider uppercase border border-zinc-850">
                ⭐ Live Promo
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. MAIN BROWSE EVENTS & METALLIC CATALOG FILTERS */}
      <div className="space-y-6 text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">Upcoming Events</h2>
            <p className="text-sm text-white/40 font-medium">Search and filter active events across Lagos, Abuja, and wider zones.</p>
          </div>
          
          {/* Main text search bar */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, venue, keywords..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs text-white placeholder-white/30 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
            />
          </div>
        </div>

        {/* Categories Scroller Tabs */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full sm:w-auto">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory('All')}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-neon-cyan text-black font-black border border-neon-cyan'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5'
                }`}
              >
                All Events
              </motion.button>
              {CATEGORIES.map((cat) => (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-neon-cyan text-black font-black border border-neon-cyan'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5'
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>

            {/* Time filter widgets */}
            <div className="flex items-center gap-1 bg-zinc-900 p-1.5 rounded-xl border border-white/5 shrink-0">
              {(['All', 'Soon', 'Later'] as const).map((filter) => (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`px-3 py-2 rounded-lg text-[10.5px] font-sans uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                    dateFilter === filter
                      ? 'bg-white/10 text-neon-cyan font-black'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {filter === 'All' ? 'Any Date' : filter === 'Soon' ? 'Next 30 Days' : 'Distant Future'}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. EVENT GRID LISTINGS */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-white/10 bg-zinc-900">
            <SlidersHorizontal className="h-8 w-8 text-white/30 mx-auto mb-3" />
            <h4 className="font-display font-bold text-white/60 uppercase">No Matching Events Found</h4>
            <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto">Try loosening your search keywords or choosing a different category path configuration.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setDateFilter('All');
              }}
              className="mt-4 text-xs font-black text-neon-cyan uppercase tracking-wider hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredEvents.map((evt, idx) => {
              // Find cheapest ticket price
              const prices = evt.ticketsConfig.map(t => t.price);
              const minPrice = Math.min(...prices);

              // Calculate active event ratings mapping
              const eventReviews = reviews.filter(r => r.eventId === evt.id);
              const avgRating = eventReviews.length > 0
                ? Math.round(eventReviews.reduce((acc, curr) => acc + curr.rating, 0) / eventReviews.length)
                : 5; // Default standard Cowrie fallback for historic promos

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, type: 'spring', stiffness: 220, damping: 20 }}
                  whileHover={{ y: -5, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.98 }}
                  key={evt.id}
                  onClick={() => setDetailEventId(evt.id)}
                  className="group rounded-2xl bg-zinc-900/90 hover:bg-zinc-900 border border-white/5 hover:border-neon-cyan/80 p-4 transition-all duration-200 shadow-2xl cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Event Flyer with badge */}
                    <div className="relative h-44 rounded-xl overflow-hidden bg-zinc-950 border border-white/5">
                      <img
                        src={evt.flyerUrl}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-black/80 px-2.5 py-1 rounded-md text-[9px] font-sans text-[#00F2FF] font-black uppercase tracking-wider border border-white/5">
                        {evt.category}
                      </div>
                      
                      {evt.isPromoted && (
                        <div className="absolute bottom-2.5 left-2.5 bg-[#FF00E5] text-white px-2.5 py-0.5 rounded text-[8px] font-sans font-black uppercase tracking-wider shadow">
                          ⭐ PROMOTED
                        </div>
                      )}
                    </div>

                    {/* Metadata summary */}
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center text-[10.5px] text-zinc-400 font-sans font-medium uppercase tracking-wider">
                        <Calendar className="h-3.5 w-3.5 text-neon-pink" />
                        <span>{evt.date} • {evt.time} WAT</span>
                      </div>

                      {/* Cowrie Rating summary on card */}
                      <div className="flex items-center gap-1.5 py-0.5">
                        <CowrieRating rating={avgRating} size={15} />
                        {eventReviews.length > 0 ? (
                          <span className="text-[9.5px] font-sans text-neon-cyan/90 font-black uppercase tracking-wider">
                            {avgRating}/5 ({eventReviews.length} Vibe{eventReviews.length > 1 ? 's' : ''})
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-sans text-zinc-500 uppercase tracking-widest font-black">Historical Grade</span>
                        )}
                      </div>

                      <h3 className="font-display font-bold text-white text-base leading-snug tracking-tight uppercase line-clamp-1 group-hover:text-neon-cyan transition-colors">
                        {evt.title}
                      </h3>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions & pricing bottom */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4">
                    <div>
                      <p className="text-[10px] text-zinc-500 font-sans font-bold uppercase tracking-wider">Prices from</p>
                      <p className="text-sm font-sans font-black text-[#00F2FF]">₦{minPrice.toLocaleString()}</p>
                    </div>

                    <span className="flex items-center gap-1 text-xs text-neon-cyan font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                      <span>Reserve Pass</span>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* 3. COOP ADVERTISING SPONSOR: GOOGLE ADS SLOT */}
      <div id="explore-google-ads-container" className="pt-4 border-t border-white/5">
        <GoogleAdsCard />
      </div>

      {/* 4. DETAILS DRAWER / MODAL POP-UP (ZERO REDIRECTION VIEW FOR EVENT TICKET SELECTION & RATING EXPERIENCE) */}
      {activeDetailEvent && (() => {
        const eventReviews = reviews.filter(r => r.eventId === activeDetailEvent.id);
        const avgRating = eventReviews.length > 0
          ? Math.round(eventReviews.reduce((acc, curr) => acc + curr.rating, 0) / eventReviews.length)
          : 5;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-6xl bg-[#09090b] rounded-3xl border border-white/10 overflow-y-auto lg:overflow-hidden shadow-2xl flex flex-col lg:flex-row relative my-8 max-h-[90vh]">
              
              {/* Close trigger */}
              <button
                onClick={() => setDetailEventId(null)}
                className="absolute top-4 right-4 z-20 text-white rounded-full p-2 bg-black/90 hover:bg-neutral-800 transition-colors border border-white/10 cursor-pointer"
                aria-label="Close details"
              >
                <XIcon className="h-4.5 w-4.5" />
              </button>

              {/* LEFT SIDE: EVENT METADATA, FLYER AND TRANSACTION PASS TIER SELECTOR */}
              <div className="w-full lg:w-5/12 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col overflow-y-visible lg:overflow-y-auto max-h-none lg:max-h-[90vh] p-6 lg:p-8 space-y-6 no-scrollbar bg-black/20">
                
                {/* Event Flyer with gradient bottom */}
                <div className="relative rounded-2xl overflow-hidden bg-black shrink-0 border border-white/5 shadow-lg">
                  <img
                    src={activeDetailEvent.flyerUrl}
                    alt={activeDetailEvent.title}
                    className="w-full h-44 lg:h-52 object-cover opacity-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-80" />
                </div>

                {/* Header Title Metadata */}
                <div className="space-y-4 text-left">
                  <span className="text-[9px] font-mono glass bg-white/5 text-neon-cyan font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                    {activeDetailEvent.category} Category Code
                  </span>
                  
                  <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white leading-tight">
                    {activeDetailEvent.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-white/70 font-mono border-y border-white/5 py-3 font-bold">
                    <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-neon-pink" /> <strong>DATE/TIME:</strong> {activeDetailEvent.date} @ {activeDetailEvent.time} WAT</p>
                    <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-neon-cyan" /> <strong>VENUE:</strong> {activeDetailEvent.venue}</p>
                  </div>

                  <div className="text-xs text-white/50 max-h-36 overflow-y-auto leading-relaxed pt-1 font-sans">
                    {activeDetailEvent.description}
                  </div>
                </div>

                {/* TICKET TIER SELECTIONS LIST */}
                <div className="space-y-3 pt-2 text-left shrink-0">
                  <h4 className="text-xs font-mono font-black uppercase tracking-widest text-[#00F2FF] border-b border-white/5 pb-2">Select Reserve Priority Option</h4>
                  
                  <div className="space-y-2">
                    {activeDetailEvent.ticketsConfig.map((tier) => {
                      const isSoldOut = tier.soldCount >= tier.capacity;
                      if (tier.visibility === 'Invite Only' && (!currentUser || currentUser.role !== 'Admin')) {
                        return null; // hide invite only tiers for regular users
                      }

                      return (
                        <div
                          key={tier.name}
                          className={`flex items-center justify-between p-3.5 rounded-xl border text-xs transition-all ${
                            isSoldOut
                              ? 'border-white/5 bg-black/40 opacity-40 text-white/30'
                              : 'border-white/10 bg-white/5 hover:border-neon-cyan text-white'
                          }`}
                        >
                          <div>
                            <p className="font-black uppercase flex items-center gap-1.5 text-xs text-white leading-none">
                              <span>{tier.name}</span>
                              {tier.visibility === 'Invite Only' && (
                                <span className="text-[8px] bg-neon-pink/20 text-neon-pink font-mono px-1 py-0.2 rounded font-black uppercase tracking-wider">Invite Only</span>
                              )}
                            </p>
                            <p className="text-[10px] text-white/40 font-mono mt-1">
                              Volume: {tier.soldCount} sold / {tier.capacity} max
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono font-black text-white text-xs pr-1">
                              ₦{tier.price.toLocaleString()}
                            </span>
                            
                            {isSoldOut ? (
                              <span className="text-[10px] text-neon-pink font-mono font-black uppercase">SOLD OUT</span>
                            ) : (
                              <button
                                onClick={() => {
                                  setDetailEventId(null);
                                  onBuyTicket(activeDetailEvent, tier);
                                }}
                                className="px-4 py-2 bg-neon-cyan hover:bg-[#00d6e0] text-black text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer font-bold duration-300"
                              >
                                Reserve
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* RIGHT SIDE: CUSTOM RATINGS AND LIVE ATTENDEE EVALUATIONS SECTION */}
              <div className="w-full lg:w-7/12 p-6 lg:p-8 flex flex-col justify-between text-left overflow-y-visible lg:overflow-y-auto max-h-none lg:max-h-[90vh] bg-black/40">
                <EventReviewsSection
                  eventId={activeDetailEvent.id}
                  onOpenAuth={() => {
                    setDetailEventId(null);
                    openAuthModal();
                  }}
                  id="modal-reviews-section"
                />
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};

// Help helper icon component
const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function ExplorePageWrapper() {
  const { currentUser, refreshTickets } = usePlatform();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{ event: EventItem; tier: TicketTier } | null>(null);

  const handleBuyTicket = (event: EventItem, tier: TicketTier) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    // Open checkout drawer with event and tier
    setCheckoutData({ event, tier });
    setCheckoutOpen(true);
  };

  const handleOpenAuthModal = () => {
    setAuthModalOpen(true);
  };

  const handleCheckoutSuccess = async () => {
    try {
      await refreshTickets();
    } catch (error) {
      console.error('Unable to refresh tickets after purchase:', error);
    }
    setCheckoutOpen(false);
    setCheckoutData(null);
  };

  return (
    <>
      <Explore onBuyTicket={handleBuyTicket} openAuthModal={handleOpenAuthModal} />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <CheckoutDrawer
        isOpen={checkoutOpen}
        onClose={() => {
          setCheckoutOpen(false);
          setCheckoutData(null);
        }}
        event={checkoutData?.event || null}
        selectedTier={checkoutData?.tier || null}
        onSuccess={handleCheckoutSuccess}
      />
    </>
  );
}

export default function ExplorePage() {
  return <ExplorePageWrapper />;
}
