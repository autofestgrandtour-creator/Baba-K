"use client";

import React, { useState, useMemo } from 'react';
import { CowrieRating } from './CowrieRating';
import { ReviewItem } from '@/types';
import { usePlatform } from '@/context/PlatformContext';
import { MessageSquare, Star, Sparkles, User, Calendar, CheckSquare, PlusCircle } from 'lucide-react';

interface EventReviewsSectionProps {
  eventId: string;
  onOpenAuth?: () => void;
  className?: string;
  id?: string;
}

export const EventReviewsSection: React.FC<EventReviewsSectionProps> = ({
  eventId,
  onOpenAuth,
  className = '',
  id = 'event-reviews-section',
}) => {
  const { currentUser, reviews, addReview } = usePlatform();

  // Selected event reviews
  const eventReviews = useMemo(() => {
    return reviews.filter((r) => r.eventId === eventId);
  }, [reviews, eventId]);

  // Calculations for Summary block
  const totalCount = eventReviews.length;
  
  const avgRating = useMemo(() => {
    if (totalCount === 0) return 5; // Default standard vibe for unreviewed events
    const sum = eventReviews.reduce((acc, curr) => acc + curr.rating, 0);
    return Math.round((sum / totalCount) * 10) / 10;
  }, [eventReviews, totalCount]);

  const highVibePercentage = useMemo(() => {
    if (totalCount === 0) return 100;
    const highCount = eventReviews.filter((r) => r.rating >= 4).length;
    return Math.round((highCount / totalCount) * 100);
  }, [eventReviews, totalCount]);

  // Breakdown of ratings (5 to 1)
  const breakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    eventReviews.forEach((r) => {
      const ratingKey = r.rating as 5 | 4 | 3 | 2 | 1;
      if (counts[ratingKey] !== undefined) {
        counts[ratingKey]++;
      }
    });

    return [5, 4, 3, 2, 1].map((ratingLevel) => {
      const count = counts[ratingLevel as 5 | 4 | 3 | 2 | 1] || 0;
      const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
      return {
        level: ratingLevel,
        count,
        percentage,
      };
    });
  }, [eventReviews, totalCount]);

  // Interactive Form State
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>('');
  const [reviewTitleInput, setReviewTitleInput] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (ratingInput < 1 || ratingInput > 5) {
      setErrorMsg('Please select a valid cowrie shell rating value (1-5).');
      return;
    }

    if (!commentInput.trim()) {
      setErrorMsg('Please write an authentic feedback description.');
      return;
    }

    // Prepare full formatted review content (combining title & comment seamlessly)
    const displayTitle = reviewTitleInput.trim() ? `[${reviewTitleInput.trim()}] ` : '';
    const fullComment = `${displayTitle}${commentInput.trim()}`;

    addReview(eventId, ratingInput, fullComment);

    setCommentInput('');
    setReviewTitleInput('');
    setRatingInput(5);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 4000);
  };

  // Helper to generate initials for avatar placeholder
  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const split = name.split(' ');
    if (split.length > 1) {
      return (split[0][0] + split[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Human-readable review title extractor if it has bracket title
  const parseReviewContent = (fullText: string): { title: string; body: string } => {
    const match = fullText.match(/^\[(.*?)\]\s*(.*)$/);
    if (match) {
      return {
        title: match[1],
        body: match[2],
      };
    }
    return {
      title: '',
      body: fullText,
    };
  };

  return (
    <div id={id} className={`space-y-8 ${className}`}>
      
      {/* SUCCESS POPUP OR ERROR OVERVIEW */}
      {showSuccess && (
        <div className="rounded-2xl p-4 bg-emerald-950/20 border-2 border-neon-cyan/40 text-left text-neon-cyan flex items-start gap-3 animate-fade-in">
          <div className="h-8 w-8 rounded-full bg-neon-cyan/10 border border-neon-cyan flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h5 className="font-bold text-white uppercase text-xs tracking-wider">Review Ledger Updated!</h5>
            <p className="text-[11px] text-white/70 mt-0.5">Your cultural cowrie rating feedback has been recorded safely in the real-time Baba-K platform database.</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-2xl p-4 bg-red-950/30 border border-red-500/30 text-left text-red-400 text-xs font-mono">
          🛈 ERROR: {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: OVERALL SUMMARY BLOCK + WRITE REVIEW PREPARATION CARD */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Summary Card with Rating Level Stats – Centered and compact to prevent nested column layout squeeze and overflow */}
          <div className="bg-[#0c0c0e]/95 border border-white/10 rounded-3xl p-5 shadow-xl text-center space-y-5 overflow-hidden">
            <div className="flex items-center justify-center gap-2 border-b border-white/5 pb-3">
              <Sparkles className="h-3.5 w-3.5 text-neon-cyan shrink-0" />
              <span className="text-[9px] font-mono font-black tracking-widest uppercase text-white/80">Vibe Quality Metrics</span>
            </div>
            
            <div className="bg-white/2 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-3 space-y-1">
              <div className="text-4xl sm:text-5xl font-display font-black text-[#00F2FF] tracking-tight">
                {avgRating.toFixed(1)}
              </div>
              
              <div className="flex justify-center max-w-full overflow-hidden">
                <CowrieRating rating={Math.round(avgRating)} size={16} id={`${id}-avg-display`} />
              </div>
              
              <div className="text-center pt-1 min-w-0 max-w-full">
                <h6 className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-white font-bold leading-tight truncate">
                  {avgRating >= 4.5 ? 'Elite Vibe Master' : avgRating >= 4.0 ? 'Highly Recommended' : avgRating >= 3.0 ? 'Positive Energy' : 'Mixed Vibe Code'}
                </h6>
                <p className="text-[9px] font-mono text-white/40 mt-1 uppercase tracking-wider">
                  Lagos Crowd Rating Level
                </p>
              </div>
            </div>

            {/* Premium Dynamic metrics grid - Centered stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-white/2 rounded-2xl border border-white/5 text-center space-y-1">
                <p className="text-[8px] font-mono uppercase tracking-widest text-[#FF00E5] font-black">Lagos Approval</p>
                <div className="text-lg sm:text-xl font-display font-black text-white">{highVibePercentage}%</div>
                <p className="text-[9px] font-mono text-white/40 leading-tight">rated 4+ shells</p>
              </div>

              <div className="p-3.5 bg-white/2 rounded-2xl border border-white/5 text-center space-y-1">
                <p className="text-[8px] font-mono uppercase tracking-widest text-[#00F2FF] font-black">Ledger Vol</p>
                <div className="text-lg sm:text-xl font-display font-black text-white">{totalCount}</div>
                <p className="text-[9px] font-mono text-white/40 leading-tight">verified checkins</p>
              </div>
            </div>

            <div className="text-[9.5px] text-white/45 font-mono leading-relaxed border-t border-white/5 pt-3 flex items-center gap-1.5 justify-center">
              <span>🐚</span>
              <span>Cowrie system displays decentralized feedback.</span>
            </div>

          </div>

          {/* Interactive Form card: Write a Review */}
          <div className="bg-[#0c0c0e]/90 border border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <h5 className="font-display text-xs font-black uppercase tracking-wider text-[#00F2FF]">
                Write an Event Review
              </h5>
              <span className="text-[9px] font-mono text-white/30 uppercase">Ledger node</span>
            </div>

            {currentUser ? (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                
                {/* 1. Cowrie Shell input selector */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-white/40">
                    Vibe checkout score *
                  </label>
                  <div className="bg-black/60 p-2 sm:p-2.5 rounded-xl border border-white/5 w-full sm:w-fit max-w-full overflow-hidden">
                    <CowrieRating
                      rating={ratingInput}
                      interactive={true}
                      onChange={(r) => setRatingInput(r)}
                      size={18}
                      id={`${id}-user-interactor`}
                    />
                  </div>
                </div>

                {/* 2. Review summary header title (optional) */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-white/40">
                    One-line Headline (optional)
                  </label>
                  <input
                    type="text"
                    value={reviewTitleInput}
                    onChange={(e) => setReviewTitleInput(e.target.value)}
                    placeholder="e.g. Pure Afrobeat Heaven! or Best lounge vibes in Lagos!"
                    className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-[#FF00E5] focus:outline-none"
                  />
                </div>

                {/* 3. Detailed feedback commentary */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-white/40">
                    Detailed Review details *
                  </label>
                  <textarea
                    required
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="We want your authentic opinion! Note details about dynamic entry queues, sound level balances, artist performance flow, and bar service..."
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-black p-3.5 text-xs text-white placeholder-white/20 focus:border-[#FF00E5] focus:outline-none"
                  />
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  disabled={ratingInput === 0}
                  className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                    ratingInput === 0
                      ? 'bg-neutral-800 text-white/30 border border-white/5 cursor-not-allowed'
                      : 'bg-[#FF00E5] hover:bg-opacity-95 text-white shadow-lg shadow-neon-pink/15'
                  }`}
                >
                  Publish Verified Review
                </button>

              </form>
            ) : (
              <div className="py-6 px-4 bg-black/40 rounded-2xl border border-dashed border-white/5 text-center space-y-3.5">
                <p className="text-[11.5px] text-white/45 font-mono leading-relaxed">
                  Only authorized platform attendees and verified wallet hosts can log event reviews.
                </p>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-5 py-2.5 bg-neon-cyan/15 hover:bg-neon-cyan/25 text-neon-cyan border border-neon-cyan/35 text-[10px] font-black uppercase tracking-widest rounded-full transition-all cursor-pointer"
                >
                  Authorize System Credentials
                </button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: DETAILED SCROLLABLE REVIEW FEED */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <h4 className="font-display text-sm font-black uppercase tracking-widest text-[#FF00E5] flex items-center gap-2">
              <MessageSquare className="h-4 w-4 shrink-0 text-[#FF00E5]" />
              <span>Attendee Feed Ledger ({totalCount})</span>
            </h4>
            <span className="text-xs font-mono text-white/40 uppercase">Real-Time Sync</span>
          </div>

          {eventReviews.length === 0 ? (
            <div className="p-8 bg-[#0c0c0e]/40 border border-dashed border-white/10 rounded-3xl text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mx-auto text-white/20">
                <MessageSquare className="h-5 w-5" />
              </div>
              <p className="text-xs text-white/40 font-mono italic">
                No active community vibe evaluations recorded for this amapiano gathering yet. Use the interactive form to launch the first cultural ledger entry!
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[350px] lg:max-h-[500px] xl:max-h-[580px] overflow-y-auto pr-3 text-left scroll-smooth">
              {eventReviews.map((item) => {
                const parsed = parseReviewContent(item.comment);
                const initials = getInitials(item.userName);
                
                // Color variation for avatar tags
                const avatarBgs = [
                  'bg-neon-cyan/10 border-neon-cyan/40 text-neon-cyan',
                  'bg-neon-pink/10 border-neon-pink/40 text-neon-pink',
                  'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
                  'bg-purple-500/10 border-purple-500/40 text-purple-500',
                ];
                // Hash picker based on name code
                const avatarBg = avatarBgs[item.userName.charCodeAt(0) % avatarBgs.length];

                return (
                  <div
                    key={item.id}
                    id={`review-card-${item.id}`}
                    className="p-5 bg-[#0c0c0e]/75 hover:bg-[#0c0c0e]/95 border border-white/5 hover:border-white/15 rounded-2xl transition-all duration-300 space-y-3 text-left"
                  >
                    {/* User profile line info */}
                    <div className="flex items-start md:items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`h-9 w-9 rounded-xl border flex items-center justify-center text-xs font-black font-sans shrink-0 uppercase tracking-widest ${avatarBg}`}>
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h6 className="font-sans font-extrabold text-white text-xs uppercase leading-none truncate" title={item.userName}>
                            {item.userName}
                          </h6>
                          <span className="text-[9px] font-mono text-white/35 truncate block mt-1" title={item.userEmail}>
                            {item.userEmail}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/40 bg-white/2 px-2.5 py-1 rounded-full border border-white/5 shrink-0 ml-auto sm:ml-0">
                        <Calendar className="h-3 w-3" />
                        <span>{item.timestamp}</span>
                      </div>
                    </div>

                    {/* Vibe Rating stars details */}
                    <div className="flex items-center gap-2">
                      <CowrieRating rating={item.rating} size={15} id={`card-${item.id}`} />
                      <span className="text-[10px] text-neon-cyan font-mono font-bold">
                        Vibe level: {item.rating}/5
                      </span>
                    </div>

                    {/* Feed Content body */}
                    <div className="space-y-1 pl-1 border-l-2 border-white/5 break-words max-w-full">
                      {parsed.title && (
                        <h5 className="text-[11px] font-black uppercase text-[#00F2FF] tracking-wide break-words">
                          {parsed.title}
                        </h5>
                      )}
                      <p className="text-xs text-white/70 font-sans leading-relaxed break-words">
                        "{parsed.body}"
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

