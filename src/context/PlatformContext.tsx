"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { EventItem, PurchasedTicket, SystemSettings, UserSession, TicketTier, ReviewItem } from '@/types';
import { INITIAL_SETTINGS } from '@/mockData';

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
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string, role: 'Buyer' | 'Organizer' | 'Admin') => Promise<void>;
  logout: () => void;
  addEvent: (newEvent: Omit<EventItem, 'id' | 'organizerEmail' | 'ticketsSold' | 'revenue' | 'state'>) => Promise<EventItem>;
  initializeCheckout: (eventId: string, ticketTierName: string, ticketTypeId?: string) => Promise<{ authorization_url: string; reference: string }>;
  toggleEventState: (id: string) => Promise<void>;
  listTicketForResale: (ticketId: string, price: number) => Promise<void>;
  cancelResale: (ticketId: string) => Promise<void>;
  buyResaleTicket: (ticketId: string, buyerName: string, buyerEmail: string) => Promise<void>;
  transferTicket: (ticketId: string, recipientName: string, recipientEmail: string) => Promise<void>;
  toggleUserSuspension: (email: string) => Promise<void>;
  verifyOrganizerEmail: (email: string) => Promise<void>;
  addReview: (eventId: string, rating: number, comment: string) => Promise<void>;
  validateTicket: (qrCodeOrSerial: string) => Promise<{ success: boolean; message: string; ticket?: PurchasedTicket }>;
  refreshTickets: () => Promise<void>;
  ticketRefreshVersion: number;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

const normalizeRole = (role: string | null | undefined): 'Buyer' | 'Organizer' | 'Admin' => {
  if (!role) return 'Buyer';
  const normalized = role.toString().toLowerCase();
  if (normalized === 'admin') return 'Admin';
  if (normalized === 'organizer') return 'Organizer';
  return 'Buyer';
};

const normalizeUser = (row: any): UserSession => ({
  id: row?.id?.toString?.() || undefined,
  email: row?.email || '',
  fullName: row?.full_name || row?.fullName || row?.name || '',
  role: normalizeRole(row?.role),
  isVerifiedOrganizer: row?.is_verified ?? row?.isVerified ?? false,
  isSuspended: row?.is_suspended ?? row?.isSuspended ?? false,
});

const mapTicketTier = (tier: any): TicketTier => ({
  id: tier?.id?.toString?.(),
  name: tier?.name || 'General Admission',
  price: Number(tier?.price ?? 0),
  capacity: Number(tier?.capacity ?? 0),
  visibility: tier?.visibility === 'Invite Only' ? 'Invite Only' : 'Public',
  soldCount: Number(tier?.sold_count ?? tier?.soldCount ?? 0)
});

const mapEventRow = (row: any): EventItem => ({
  id: row.id?.toString() ?? `evt-${Date.now()}`,
  title: row.title || 'Untitled Event',
  description: row.description || '',
  date: row.event_date ? row.event_date.split('T')[0] : (row.date || ''),
  time: row.event_date ? new Date(row.event_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : (row.time || '19:00'),
  venue: row.location || row.venue || '',
  flyerUrl: row.flyer_url || row.flyerUrl || '',
  ticketsConfig: Array.isArray(row.ticket_types) ? row.ticket_types.map(mapTicketTier) : [],
  adCustomizer: {
    backgroundType: row.adCustomizer?.backgroundType || 'gradient',
    backgroundValue: row.adCustomizer?.backgroundValue || row.backgroundValue || '#000000',
    textColor: row.adCustomizer?.textColor || '#ffffff',
    overlayText: row.adCustomizer?.overlayText || '',
    promote: row.is_promoted ?? false
  },
  isPromoted: row.is_promoted ?? false,
  state: row.state || 'active',
  organizerEmail: row.organizer_email || row.organizerEmail || row.organizer_id || '',
  category: row.category || 'General'
});

const mapPurchasedTicket = (purchase: any, transaction: any, buyer: any, ticketType: any): PurchasedTicket => ({
  id: purchase.id?.toString() ?? `tkt-${Date.now()}`,
  eventId: transaction?.event_id?.toString() ?? '',
  ticketTierName: ticketType?.name || 'General Admission',
  buyerName: buyer?.full_name || buyer?.fullName || buyer?.email || 'Guest User',
  buyerEmail: buyer?.email || 'guest@babak.com',
  qrCode: purchase.qr_code_hash || purchase.qrCode || '',
  purchaseDate: purchase.created_at?.split('T')[0] || purchase.purchase_date || new Date().toISOString().split('T')[0],
  pricePaid: Number(ticketType?.price ?? (transaction?.amount ?? 0) - (transaction?.platform_fee ?? 0)),
  feePaid: Number(transaction?.platform_fee ?? 0),
  serialNumber: purchase.serial_number || purchase.serialNumber || '',
  isReselling: Boolean(purchase.is_reselling ?? purchase.isReselling ?? false),
  resalePrice: purchase.resale_price ?? purchase.resalePrice ?? undefined,
  paymentGateway: transaction?.payment_gateway || transaction?.paymentGateway || 'paystack',
  isValidated: Boolean(purchase.is_validated ?? purchase.isValidated ?? false),
  validatedAt: purchase.validated_at ?? purchase.validatedAt ?? undefined
});

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserVal] = useState<UserSession | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('babak_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<UserSession[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [ticketRefreshVersion, setTicketRefreshVersion] = useState(0);
  const [settings, setSettingsVal] = useState<SystemSettings>(() => {
    if (typeof window === 'undefined') return INITIAL_SETTINGS;
    const saved = localStorage.getItem('babak_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const setCurrentUser = (user: UserSession | null) => {
    setCurrentUserVal(user);
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('babak_current_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('babak_current_user');
      }
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const setSettings = (newSettings: SystemSettings) => {
    setSettingsVal(newSettings);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('babak_settings', JSON.stringify(settings));
  }, [settings]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id,email,full_name,role,is_verified,is_suspended');

      if (error) {
        console.error('Failed to fetch users', error);
        return;
      }

      const normalized = (data || []).map(normalizeUser);
      setUsers(normalized);

      if (currentUser?.email && !currentUser.id) {
        const matching = normalized.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (matching) {
          setCurrentUser(matching);
        }
      }
    } catch (error) {
      console.error('users load error', error);
    }
  };

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id,title,description,location,event_date,flyer_url,is_promoted,state,category,organizer_id,ticket_types(id,name,price,capacity,sold_count,visibility)');

      if (error) {
        console.error('Failed to fetch events', error);
        setEvents([]);
        return;
      }

      const items = (data || []).map(mapEventRow);
      setEvents(items);
    } catch (error) {
      console.error('events load error', error);
      setEvents([]);
    }
  };

  const loadTickets = async () => {
    try {
      const { data: purchases, error: purchaseError } = await supabase
        .from('purchased_tickets')
        .select('id,qr_code_hash,serial_number,is_validated,validated_at,created_at,transaction_id,ticket_type_id,is_reselling,resale_price');

      if (purchaseError) {
        console.error('Failed to fetch purchased tickets', purchaseError);
        setTickets([]);
        return;
      }

      const purchaseRows = purchases || [];
      const transactionIds = purchaseRows.map((purchase: any) => purchase.transaction_id).filter(Boolean);
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('id,buyer_id,event_id,amount,platform_fee,payment_gateway')
        .in('id', transactionIds);

      if (txError) {
        console.error('Failed to fetch transactions', txError);
      }

      const ticketTypeIds = purchaseRows.map((purchase: any) => purchase.ticket_type_id).filter(Boolean);
      const { data: ticketTypes, error: typesError } = await supabase
        .from('ticket_types')
        .select('id,name,price,capacity')
        .in('id', ticketTypeIds);

      if (typesError) {
        console.error('Failed to fetch ticket types', typesError);
      }

      const buyerIds = (transactions || []).map((tx: any) => tx.buyer_id).filter(Boolean);
      const { data: usersById, error: usersError } = await supabase
        .from('users')
        .select('id,email,full_name')
        .in('id', buyerIds);

      if (usersError) {
        console.error('Failed to fetch ticket buyers', usersError);
      }

      const txMap = new Map((transactions || []).map((tx: any) => [tx.id, tx]));
      const userMap = new Map((usersById || []).map((user: any) => [user.id, user]));
      const typeMap = new Map((ticketTypes || []).map((type: any) => [type.id, type]));

      const records = purchaseRows
        .map((purchase: any) => {
          const transaction = txMap.get(purchase.transaction_id);
          if (!transaction) return null;
          const buyer = userMap.get(transaction.buyer_id);
          const ticketType = typeMap.get(purchase.ticket_type_id);
          return mapPurchasedTicket(purchase, transaction, buyer, ticketType);
        })
        .filter((ticket: PurchasedTicket | null): ticket is PurchasedTicket => ticket !== null);

      setTickets(records);
    } catch (error) {
      console.error('tickets load error', error);
      setTickets([]);
    }
  };

  const loadReviews = async () => {
    const tryTables = ['reviews', 'event_reviews'];
    for (const table of tryTables) {
      try {
        const { data, error } = await supabase.from(table).select('*');
        if (!error && data) {
          const mapped = data.map((row: any) => ({
            id: row.id?.toString() ?? `rev-${Date.now()}`,
            eventId: row.event_id || row.eventId || '',
            userEmail: row.user_email || row.userEmail || '',
            userName: row.user_name || row.userName || '',
            rating: Number(row.rating ?? 0),
            comment: row.comment || '',
            timestamp: row.timestamp?.split('T')[0] || row.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
          }));
          setReviews(mapped);
          return;
        }
      } catch (err) {
        console.error(`Failed to fetch reviews from table ${table}`, err);
      }
    }
    setReviews([]);
  };

  const refreshPlatformData = async () => {
    await loadUsers();
    await loadEvents();
    await loadTickets();
    await loadReviews();
  };

  const refreshTickets = async () => {
    await loadTickets();
    setTicketRefreshVersion(prev => prev + 1);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    refreshPlatformData();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'Login failed.');
    }

    const normalized = normalizeUser(payload.user);
    setUsers(prev => {
      const existing = prev.find(u => u.email.toLowerCase() === normalized.email.toLowerCase());
      if (existing) {
        return prev.map(u => u.email.toLowerCase() === normalized.email.toLowerCase() ? normalized : u);
      }
      return [normalized, ...prev];
    });
    setCurrentUser(normalized);
    await refreshPlatformData();
  };

  const signup = async (fullName: string, email: string, password: string, role: 'Buyer' | 'Organizer' | 'Admin') => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName, role: role.toLowerCase() })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'Account creation failed.');
    }

    const normalized = normalizeUser(payload.user);
    setUsers(prev => [normalized, ...prev]);
    setCurrentUser(normalized);
    await refreshPlatformData();
  };

  const addEvent = async (newEvent: Omit<EventItem, 'id' | 'organizerEmail' | 'ticketsSold' | 'revenue' | 'state'>) => {
    if (!currentUser?.id) {
      throw new Error('You must be signed in to create events.');
    }

    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizerId: currentUser.id,
        title: newEvent.title,
        description: newEvent.description,
        location: newEvent.venue,
        eventDate: newEvent.date,
        time: newEvent.time,
        flyerUrl: newEvent.flyerUrl,
        category: newEvent.category,
        isPromoted: newEvent.adCustomizer.promote,
        ticketTiers: newEvent.ticketsConfig.map((tier) => ({
          name: tier.name,
          price: tier.price,
          capacity: tier.capacity,
          visibility: tier.visibility,
          soldCount: tier.soldCount ?? 0,
        }))
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'Failed to create event.');
    }

    await loadEvents();
    const createdEvent = events.find(evt => evt.id === payload.event_id) || {
      ...newEvent,
      id: payload.event_id,
      organizerEmail: currentUser.email,
      state: 'active',
      isPromoted: newEvent.adCustomizer.promote
    };

    return createdEvent;
  };

  const initializeCheckout = async (eventId: string, ticketTierName: string, ticketTypeId?: string) => {
    if (!currentUser?.id) {
      throw new Error('You must be signed in to purchase tickets.');
    }

    const response = await fetch('/api/checkout/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyer_id: currentUser.id,
        email: currentUser.email,
        event_id: eventId,
        ticket_type_id: ticketTypeId,
        ticket_type_name: ticketTierName
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'Failed to initialize checkout.');
    }

    return {
      authorization_url: payload.authorization_url,
      reference: payload.reference
    };
  };

  const toggleEventState = async (id: string) => {
    try {
      const event = events.find(evt => evt.id === id);
      if (!event) return;
      const nextState = event.state === 'active' ? 'disabled' : 'active';
      const { error } = await supabase.from('events').update({ state: nextState }).eq('id', id);
      if (error) {
        console.error('Failed to toggle event state', error);
        return;
      }
      setEvents(prev => prev.map(evt => evt.id === id ? { ...evt, state: nextState } : evt));
    } catch (error) {
      console.error('toggleEventState error', error);
    }
  };

  const listTicketForResale = async (ticketId: string, price: number) => {
    try {
      const { error } = await supabase.from('purchased_tickets').update({ is_reselling: true, resale_price: price }).eq('id', ticketId);
      if (error) {
        console.error('Failed to list ticket for resale', error);
        return;
      }
      await loadTickets();
    } catch (error) {
      console.error('listTicketForResale error', error);
    }
  };

  const cancelResale = async (ticketId: string) => {
    try {
      const { error } = await supabase.from('purchased_tickets').update({ is_reselling: false, resale_price: null }).eq('id', ticketId);
      if (error) {
        console.error('Failed to cancel resale', error);
        return;
      }
      await loadTickets();
    } catch (error) {
      console.error('cancelResale error', error);
    }
  };

  const buyResaleTicket = async (ticketId: string, buyerName: string, buyerEmail: string) => {
    try {
      const userEmail = buyerEmail.trim().toLowerCase();
      const { data: buyer, error: buyerError } = await supabase.from('users').select('id').eq('email', userEmail).single();
      if (buyerError || !buyer) {
        throw new Error('Buyer must have a registered account to complete resale purchase.');
      }

      const { error } = await supabase
        .from('purchased_tickets')
        .update({ buyer_id: buyer.id, is_reselling: false, resale_price: null })
        .eq('id', ticketId);

      if (error) {
        console.error('Failed to transfer resale ticket', error);
        return;
      }

      await loadTickets();
    } catch (error) {
      console.error('buyResaleTicket error', error);
    }
  };

  const transferTicket = async (ticketId: string, recipientName: string, recipientEmail: string) => {
    try {
      const email = recipientEmail.trim().toLowerCase();
      const { data: recipient, error: recipientError } = await supabase.from('users').select('id').eq('email', email).single();
      if (recipientError || !recipient) {
        throw new Error('Recipient must be a registered platform user.');
      }

      const { error } = await supabase
        .from('purchased_tickets')
        .update({ buyer_id: recipient.id, is_reselling: false, resale_price: null })
        .eq('id', ticketId);

      if (error) {
        console.error('Failed to transfer ticket', error);
        return;
      }

      await loadTickets();
    } catch (error) {
      console.error('transferTicket error', error);
    }
  };

  const toggleUserSuspension = async (email: string) => {
    try {
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) return;
      const nextSuspended = !user.isSuspended;
      const { error } = await supabase.from('users').update({ is_suspended: nextSuspended }).eq('email', email);
      if (error) {
        console.error('Failed to toggle suspension', error);
        return;
      }
      setUsers(prev => prev.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, isSuspended: nextSuspended } : u));
      if (nextSuspended && currentUser?.email.toLowerCase() === email.toLowerCase()) {
        logout();
      }
    } catch (error) {
      console.error('toggleUserSuspension error', error);
    }
  };

  const verifyOrganizerEmail = async (email: string) => {
    try {
      const { error } = await supabase.from('users').update({ is_verified: true }).eq('email', email);
      if (error) {
        console.error('Failed to verify organizer', error);
        return;
      }
      setUsers(prev => prev.map(u => {
        if (u.email.toLowerCase() === email.toLowerCase()) {
          return { ...u, isVerifiedOrganizer: true };
        }
        return u;
      }));
    } catch (error) {
      console.error('verifyOrganizerEmail error', error);
    }
  };

  const addReview = async (eventId: string, rating: number, comment: string) => {
    const reviewPayload = {
      event_id: eventId,
      user_email: currentUser?.email || 'guest@babak.com',
      user_name: currentUser?.fullName || 'Guest User',
      rating,
      comment,
      timestamp: new Date().toISOString().split('T')[0]
    };

    try {
      const { data, error } = await supabase.from('reviews').insert([reviewPayload]).select('*').single();
      if (error || !data) {
        console.error('Failed to save review into the database', error);
        throw new Error('Review save failed.');
      }

      const savedReview: ReviewItem = {
        id: data.id?.toString() ?? `rev-${Date.now()}`,
        eventId: data.event_id,
        userEmail: data.user_email,
        userName: data.user_name,
        rating: Number(data.rating),
        comment: data.comment,
        timestamp: data.timestamp || data.created_at?.split('T')[0] || reviewPayload.timestamp
      };
      setReviews(prev => [savedReview, ...prev]);
    } catch (error) {
      console.error('addReview error', error);
      const localReview: ReviewItem = {
        id: `rev-${Date.now()}`,
        eventId,
        userEmail: reviewPayload.user_email,
        userName: reviewPayload.user_name,
        rating,
        comment,
        timestamp: reviewPayload.timestamp
      };
      setReviews(prev => [localReview, ...prev]);
    }
  };

  const validateTicket = async (qrCodeOrSerial: string) => {
    const code = qrCodeOrSerial.trim().toUpperCase();

    try {
      const { data: ticket, error } = await supabase
        .from('purchased_tickets')
        .select('*, transaction_id, serial_number, qr_code_hash, is_validated, validated_at, ticket_type_id, created_at')
        .or(`qr_code_hash.eq.${code},serial_number.eq.${code}`)
        .single();

      if (error || !ticket) {
        return { success: false, message: 'Ticket not found in ledger. Access Denied.' };
      }

      if (ticket.is_validated) {
        return {
          success: false,
          message: `Already Checked-In! Verified at ${ticket.validated_at ? new Date(ticket.validated_at).toLocaleTimeString() : 'N/A'}. Access Denied.`,
          ticket: {
            id: ticket.id?.toString() ?? '',
            eventId: ticket.event_id || '',
            ticketTierName: ticket.ticket_tier_name || 'General',
            buyerName: ticket.buyer_name || 'Owner',
            buyerEmail: ticket.buyer_email || 'owner@babak.com',
            qrCode: ticket.qr_code_hash || '',
            purchaseDate: ticket.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            pricePaid: Number(ticket.price_paid ?? 0),
            feePaid: Number(ticket.fee_paid ?? 0),
            serialNumber: ticket.serial_number || '',
            isReselling: Boolean(ticket.is_reselling ?? false),
            paymentGateway: ticket.payment_gateway || 'paystack',
            isValidated: true,
            validatedAt: ticket.validated_at
          }
        };
      }

      const { error: updateError } = await supabase
        .from('purchased_tickets')
        .update({ is_validated: true, validated_at: new Date().toISOString() })
        .eq('id', ticket.id);

      if (updateError) {
        console.error('Failed to mark ticket validated', updateError);
        return { success: false, message: 'Unable to validate ticket at this time.' };
      }

      await loadTickets();

      return {
        success: true,
        message: 'Scan Successful! Welcome to Baba-K elite gathering.',
        ticket: {
          id: ticket.id?.toString() ?? '',
          eventId: ticket.event_id || '',
          ticketTierName: ticket.ticket_tier_name || 'General',
          buyerName: ticket.buyer_name || 'Owner',
          buyerEmail: ticket.buyer_email || 'owner@babak.com',
          qrCode: ticket.qr_code_hash || '',
          purchaseDate: ticket.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          pricePaid: Number(ticket.price_paid ?? 0),
          feePaid: Number(ticket.fee_paid ?? 0),
          serialNumber: ticket.serial_number || '',
          isReselling: Boolean(ticket.is_reselling ?? false),
          paymentGateway: ticket.payment_gateway || 'paystack',
          isValidated: true,
          validatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('validateTicket error', error);
      return { success: false, message: 'Unable to validate ticket right now. Try again later.' };
    }
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
      initializeCheckout,
      toggleEventState,
      listTicketForResale,
      cancelResale,
      buyResaleTicket,
      transferTicket,
      toggleUserSuspension,
      verifyOrganizerEmail,
      addReview,
      validateTicket,
      refreshTickets,
      ticketRefreshVersion
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
