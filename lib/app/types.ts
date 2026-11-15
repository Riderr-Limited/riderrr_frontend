export type AppRole = "customer" | "driver";

export interface DriverProfile {
  licenseNumber?: string;
  licenseExpiry?: string;
  vehicleType?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number | string;
  vehicleColor?: string;
  plateNumber?: string;
  approvalStatus?: string;
  isOnline?: boolean;
  isAvailable?: boolean;
  rating?: { average?: number; totalRatings?: number };
}

export interface AppUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: AppRole | "company_admin" | "admin";
  isVerified?: boolean;
  companyId?: string | null;
  avatarUrl?: string | null;
  driverProfile?: DriverProfile | null;
}

export interface Place {
  address: string;
  lat: number;
  lng: number;
}

export interface Stop {
  address: string;
  name?: string;
  phone?: string;
  lat: number;
  lng: number;
  instructions?: string;
}

export interface Delivery {
  _id: string;
  status: string;
  pickup: Stop;
  dropoff: Stop;
  createdAt: string;
  updatedAt?: string;
  itemType?: string;
  itemDetails?: { type?: string; description?: string };
  customerName?: string;
  customerPhone?: string;
  recipientName?: string;
  recipientPhone?: string;
  fare?: { totalFare?: number; currency?: string; formatted?: string };
  payment?: { status?: string; method?: string; reference?: string };
  paymentStatus?: string;
  paymentMethod?: string;
  estimatedDistanceKm?: number;
  estimatedDurationMin?: number;
  estimatedTime?: number;
  driverDetails?: {
    name?: string;
    phone?: string;
    rating?: number;
    currentLocation?: { lat: number; lng: number };
    vehicle?: { type?: string; make?: string; model?: string; plateNumber?: string };
  };
}

export interface FareQuote {
  quoteId?: string;
  fare?: { totalFare?: number; formatted?: string };
  distance?: { formatted?: string };
  estimatedDuration?: { formatted?: string };
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  narration?: string;
}

export interface TransferInit {
  paymentId: string;
  reference: string;
  amount: number;
  amountFormatted: string;
  status: string;
  bankAccount: BankDetails;
}

export interface Settlement {
  deliveryId: string;
  paymentId: string;
  status: string;
  settlement?: {
    success: boolean;
    companyReceived: string;
    platformFee: string;
    transferStatus: string;
  };
}

export interface Company {
  _id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface Errand {
  _id: string;
  referenceId: string;
  status: string;
  errandType: string;
  description: string;
  specialInstructions?: string;
  spendingLimit?: number;
  customerAdvance?: number;
  actualSpend?: number;
  balanceReturned?: number;
  serviceFee?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  pickupLocation: { address: string; instructions?: string };
  destination?: { address: string };
  companyId?: { name: string } | null;
  customerId?: { name: string; phone?: string } | null;
  disputeRaised?: boolean;
  createdAt: string;
}

export interface PodOrder {
  _id: string;
  referenceId: string;
  status: string;
  amountToCollect: number;
  inspectionAllowed: boolean;
  product: { name: string; description?: string; quantity?: number };
  pickup: { address: string; instructions?: string };
  dropoff: {
    address: string;
    recipientName?: string;
    recipientPhone?: string;
    instructions?: string;
  };
  companyId?: { name: string; contactPhone?: string } | null;
  paymentStatus?: string;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  deliveryId: string;
  senderId: { _id: string; role?: string; name?: string; fullName?: string };
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  ticketId: string;
  title: string;
  description?: string;
  issueType: string;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
}

export interface TicketMessage {
  _id?: string;
  senderId?: { name?: string; email?: string };
  text: string;
  timestamp: string;
}

export interface SupportChatMessage {
  _id: string;
  senderId: { _id: string; name: string; role?: string };
  message: string;
  isAdminMessage?: boolean;
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface DriverRequest extends Delivery {
  estimatedDistanceKm?: number;
  estimatedDurationMin?: number;
}

export interface EarningsData {
  summary: {
    totalEarnings: number;
    totalDeliveries: number;
    totalTips?: number;
    averageRating?: number;
  };
  dailyEarnings: { _id: string; earnings: number; deliveries?: number; count?: number }[];
  currency?: string;
}
