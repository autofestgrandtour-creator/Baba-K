export interface TicketTier {
  name: string;
  price: number;
  capacity: number;
  visibility: 'Public' | 'Invite Only';
  soldCount: number;
}

export interface AdCustomizerConfig {
  backgroundType: 'gradient' | 'color';
  backgroundValue: string; // gradient formula or hex color
  textColor: string;
  overlayText: string; // e.g. "Selling Fast", "Limited VIP Slots"
  promote: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  flyerUrl: string;
  ticketsConfig: TicketTier[];
  adCustomizer: AdCustomizerConfig;
  isPromoted: boolean;
  state: 'active' | 'disabled' | 'pending';
  organizerEmail: string;
  category: string;
}

export interface UserSession {
  email: string;
  fullName: string;
  role: 'Buyer' | 'Organizer' | 'Admin';
  isVerifiedOrganizer?: boolean;
  customLogoUrl?: string;
  isSuspended?: boolean;
}

export interface PurchasedTicket {
  id: string;
  eventId: string;
  ticketTierName: string;
  buyerName: string;
  buyerEmail: string;
  qrCode: string; // Unique simulation text or serial
  purchaseDate: string;
  pricePaid: number;
  feePaid: number;
  serialNumber: string;
  isReselling: boolean;
  resalePrice?: number;
  paymentGateway: string;
  isValidated?: boolean;
  validatedAt?: string;
}

export interface SystemSettings {
  flatFee: number; // in NGN (e.g. 250)
  promotionPrice: number; // in NGN (e.g. 5000)
  supportedGateways: {
    paystack: boolean;
    opay: boolean;
    alatpay: boolean;
  };
}

export interface PlatformStats {
  totalUsers: number;
  totalEvents: number;
  ticketsSold: number;
  revenue: number;
}

export interface ReviewItem {
  id: string;
  eventId: string;
  userEmail: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  timestamp: string;
}
