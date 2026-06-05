"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventItem, PurchasedTicket, SystemSettings, UserSession, TicketTier, ReviewItem } from '@/types';
import { INITIAL_EVENTS, INITIAL_TICKETS, INITIAL_SETTINGS, MOCK_USERS, INITIAL_REVIEWS } from '@/mockData';

interface PlatformContextType {
  currentUser: UserSession | null;
  setCurrentUser: (user: UserSession | null) => void;
  users: UserSession[];
  setUsers: React.Dispatch<React.SetStateAction<UserSession[]>>;
  events: EventItem[];
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  tickets: PurchasedTicket[];
  setTickets: React.Dispatch<React.SetStateAction<PurchasedTicket[]>>;
  reviews: ReviewItem[];
  setReviews: React.Dispatch<React.SetStateAction<ReviewItem[]>>;
  settings: SystemSettings;
  setSettings: (settings: SystemSettings) => void;
  login: (email: string, role: 'Buyer' | 'Organizer' | 'Admin') => boolean;
  signup: (fullName: string, email: string, role: 'Buyer' | 'Organizer' | 'Admin') => void;
  logout: () => void;
  addEvent: (newEvent: Omit<EventItem, 'id' | 'organizerEmail' | 'ticketsSold' | 'revenue' | 'state'>) => EventItem;
  toggleEventState: (id: string) => void;
  buyTicket: (eventId: string, ticketTierName: string, qty: number, buyerName: string, buyerEmail: string, gateway: string) => PurchasedTicket[];
  listTicketForResale: (ticketId: string, price: number) => void;
  cancelResale: (ticketId: string) => void;
  buyResaleTicket: (ticketId: string, buyerName: string, buyerEmail: string) => void;
  toggleUserSuspension: (email: string) => void;
  verifyOrganizerEmail: (email: string) => void;
  addReview: (eventId: string, rating: number, comment: string) => void;
  validateTicket: (qrCodeOrSerial: string) => { success: boolean; message: string; ticket?: PurchasedTicket };
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try loading from localStorage first to guarantee durable persistence requested by PRD and guidelines.
  const [currentUser, setCurrentUserVal] = useState<UserSession | null>(() => {
    if (typeof window === 'undefined') return MOCK_USERS[0];
    const saved = localStorage.getItem('babak_current_user');
    return saved ? JSON.parse(saved) : MOCK_USERS[0]; // Default to Chioma
  });

  const [users, setUsers] = useState<UserSession[]>(() => {
    if (typeof window === 'undefined') return MOCK_USERS;
    const saved = localStorage.getItem('babak_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    if (typeof window === 'undefined') return INITIAL_EVENTS;
    const saved = localStorage.getItem('babak_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [tickets, setTickets] = useState<PurchasedTicket[]>(() => {
    if (typeof window === 'undefined') return INITIAL_TICKETS;
    const saved = localStorage.getItem('babak_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    if (typeof window === 'undefined') return INITIAL_REVIEWS;
    const saved = localStorage.getItem('babak_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [settings, setSettingsVal] = useState<SystemSettings>(() => {
    if (typeof window === 'undefined') return INITIAL_SETTINGS;
    const saved = localStorage.getItem('babak_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Track state in local storage
  const setCurrentUser = (user: UserSession | null) => {
    setCurrentUserVal(user);
    if (user) {
      localStorage.setItem('babak_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('babak_current_user');
    }
  };

  useEffect(() => {
    localStorage.setItem('babak_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('babak_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('babak_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('babak_reviews', JSON.stringify(reviews));
  }, [reviews]);

  const setSettings = (newSettings: SystemSettings) => {
    setSettingsVal(newSettings);
    localStorage.setItem('babak_settings', JSON.stringify(newSettings));
  };

  const login = (email: string, role: 'Buyer' | 'Organizer' | 'Admin'): boolean => {
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      if (existing.isSuspended) {
        throw new Error('Your account is currently suspended by administrators.');
      }
      // Update role if they switch it, for easy demoing
      const updatedUser = { ...existing, role };
      setUsers(prev => prev.map(u => u.email.toLowerCase() === email.toLowerCase() ? updatedUser : u));
      setCurrentUser(updatedUser);
      return true;
    } else {
      // Auto-signup logic in login screen if user doesn't exist to make exploration trivial
      const name = email.split('@')[0];
      const normalizedName = name.charAt(0).toUpperCase() + name.slice(1);
      const newUser: UserSession = {
        email,
        fullName: normalizedName,
        role,
        isVerifiedOrganizer: role === 'Organizer'
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      return true;
    }
  };

  const signup = (fullName: string, email: string, role: 'Buyer' | 'Organizer' | 'Admin') => {
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Email already registered. Please proceed to login instead.');
    }
    const newUser: UserSession = {
      email,
      fullName,
      role,
      isVerifiedOrganizer: role === 'Organizer'
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addEvent = (newEvent: Omit<EventItem, 'id' | 'organizerEmail' | 'ticketsSold' | 'revenue' | 'state'>) => {
    const freshEvent: EventItem = {
      ...newEvent,
      id: `evt-${Date.now()}`,
      organizerEmail: currentUser?.email || 'unregistered@babak.com',
      state: 'active',
      isPromoted: newEvent.adCustomizer.promote
    };
    setEvents(prev => [freshEvent, ...prev]);
    return freshEvent;
  };

  const toggleEventState = (id: string) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === id) {
        const nextState = evt.state === 'active' ? 'disabled' : 'active';
        return { ...evt, state: nextState };
      }
      return evt;
    }));
  };

  const buyTicket = (
    eventId: string,
    ticketTierName: string,
    qty: number,
    buyerName: string,
    buyerEmail: string,
    gateway: string
  ): PurchasedTicket[] => {
    const event = events.find(e => e.id === eventId);
    if (!event) throw new Error('Event not found');

    const tierIndex = event.ticketsConfig.findIndex(t => t.name === ticketTierName);
    if (tierIndex === -1) throw new Error('Selected ticket tier not available');

    const tier = event.ticketsConfig[tierIndex];
    if (tier.soldCount + qty > tier.capacity) {
      throw new Error(`Insufficient tickets. Only ${tier.capacity - tier.soldCount} left.`);
    }

    // Generate ticket structures
    const newTickets: PurchasedTicket[] = [];
    const now = new Date().toISOString().split('T')[0];

    for (let i = 0; i < qty; i++) {
      const serial = `NBK-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(10 + Math.random() * 89)}`;
      const purchase: PurchasedTicket = {
        id: `tkt-${Date.now()}-${i}`,
        eventId,
        ticketTierName,
        buyerName,
        buyerEmail,
        qrCode: `BABAK_TKT_${eventId.split('-')[1] || 'EVT'}_${serial}`,
        purchaseDate: now,
        pricePaid: tier.price,
        feePaid: settings.flatFee,
        serialNumber: serial,
        isReselling: false,
        paymentGateway: gateway
      };
      newTickets.push(purchase);
    }

    // Update tickets array
    setTickets(prev => [...newTickets, ...prev]);

    // Update events config to indicate sold counts
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        const updatedConfig = e.ticketsConfig.map(t => {
          if (t.name === ticketTierName) {
            return { ...t, soldCount: t.soldCount + qty };
          }
          return t;
        });
        return { ...e, ticketsConfig: updatedConfig };
      }
      return e;
    }));

    return newTickets;
  };

  const listTicketForResale = (ticketId: string, price: number) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, isReselling: true, resalePrice: price };
      }
      return t;
    }));
  };

  const cancelResale = (ticketId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, isReselling: false, resalePrice: undefined };
      }
      return t;
    }));
  };

  const buyResaleTicket = (ticketId: string, buyerName: string, buyerEmail: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          buyerName,
          buyerEmail,
          isReselling: false,
          resalePrice: undefined,
          purchaseDate: new Date().toISOString().split('T')[0]
        };
      }
      return t;
    }));
  };

  const toggleUserSuspension = (email: string) => {
    setUsers(prev => prev.map(u => {
      if (u.email === email) {
        const suspended = !u.isSuspended;
        // If they suspended current logged in user, log them out
        if (suspended && currentUser?.email === email) {
          setTimeout(() => logout(), 100);
        }
        return { ...u, isSuspended: suspended };
      }
      return u;
    }));
  };

  const verifyOrganizerEmail = (email: string) => {
    setUsers(prev => prev.map(u => {
      if (u.email === email) {
        return { ...u, isVerifiedOrganizer: true };
      }
      return u;
    }));
  };

  const addReview = (eventId: string, rating: number, comment: string) => {
    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      eventId,
      userEmail: currentUser?.email || 'guest@babak.com',
      userName: currentUser?.fullName || 'Guest User',
      rating,
      comment,
      timestamp: new Date().toISOString().split('T')[0]
    };
    setReviews(prev => [newReview, ...prev]);
  };

  const validateTicket = (qrCodeOrSerial: string): { success: boolean; message: string; ticket?: PurchasedTicket } => {
    const code = qrCodeOrSerial.trim().toUpperCase();
    const tktIndex = tickets.findIndex(t => t.qrCode.toUpperCase() === code || t.serialNumber.toUpperCase() === code);
    
    if (tktIndex === -1) {
      return { success: false, message: 'Ticket not found in ledger. Access Denied.' };
    }

    const ticket = tickets[tktIndex];
    if (ticket.isValidated) {
      return { 
        success: false, 
        message: `Already Checked-In! Verified at ${ticket.validatedAt ? new Date(ticket.validatedAt).toLocaleTimeString() : 'N/A'}. Access Denied.`, 
        ticket 
      };
    }

    const updatedTicket = {
      ...ticket,
      isValidated: true,
      validatedAt: new Date().toISOString()
    };

    setTickets(prev => prev.map(t => t.id === ticket.id ? updatedTicket : t));
    return { success: true, message: 'Scan Successful! Welcome to Baba-K elite gathering.', ticket: updatedTicket };
  };

  return (
    <PlatformContext.Provider value={{
      currentUser,
      setCurrentUser,
      users,
      setUsers,
      events,
      setEvents,
      tickets,
      setTickets,
      reviews,
      setReviews,
      settings,
      setSettings,
      login,
      signup,
      logout,
      addEvent,
      toggleEventState,
      buyTicket,
      listTicketForResale,
      cancelResale,
      buyResaleTicket,
      toggleUserSuspension,
      verifyOrganizerEmail,
      addReview,
      validateTicket
    }}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) throw new Error('usePlatform must be used within a PlatformProvider');
  return context;
};

