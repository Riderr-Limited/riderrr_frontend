// Every backend call the web app makes, mirroring the mobile app's services.
import { api } from "./api";
import type {
  AppNotification,
  ChatMessage,
  Company,
  Delivery,
  DriverRequest,
  EarningsData,
  Errand,
  FareQuote,
  PodOrder,
  Settlement,
  SupportChatMessage,
  SupportTicket,
  TicketMessage,
  TransferInit,
} from "./types";

type Envelope<T> = { success: boolean; message?: string; data: T };

/* ---------------------------- Deliveries ---------------------------- */

export interface DeliveryRequestPayload {
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  pickupName: string;
  pickupPhone: string;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  recipientName: string;
  recipientPhone: string;
  companyId?: string | null;
  itemWeight: number;
  itemValue: number;
  itemType: string;
  paymentMethod: "cash" | "transfer";
  quoteId?: string;
  expectedFare?: number;
}

export const deliveries = {
  mine: async () => (await api.get<Envelope<Delivery[]>>("/deliveries/my")).data.data ?? [],
  get: async (id: string) => (await api.get<Envelope<Delivery>>(`/deliveries/${id}`)).data.data,
  customerActive: async () =>
    (await api.get<Envelope<Delivery | null>>("/deliveries/customer/active")).data.data,
  quote: async (payload: {
    pickupLat: number;
    pickupLng: number;
    dropoffLat: number;
    dropoffLng: number;
    itemType: string;
    itemWeight: number;
  }) => (await api.post<Envelope<FareQuote>>("/deliveries/calculate-fare", payload)).data,
  nearbyDrivers: async (lat: number, lng: number, radius = 5) =>
    (
      await api.get("/deliveries/nearby-drivers", { params: { lat, lng, radius } })
    ).data as { data?: { summary?: { total?: number; closestDriver?: { eta?: { text?: string } } } } },
  request: async (payload: DeliveryRequestPayload) =>
    (await api.post("/deliveries/request", payload)).data as Envelope<{
      delivery: Delivery;
      requiresPayment?: boolean;
      payment?: { nextAction?: string; reference?: string };
    }>,
  cancel: async (id: string, reason: string) =>
    (await api.post<Envelope<unknown>>(`/deliveries/${id}/cancel`, { cancelledBy: "customer", reason })).data,
  retrySearch: async (id: string) => (await api.post(`/deliveries/${id}/retry-search`)).data,
};

/* ----------------------------- Payments ----------------------------- */

export const payments = {
  initializeTransfer: async (deliveryId: string) =>
    (await api.post<Envelope<TransferInit>>("/payments/initialize", { deliveryId, paymentType: "transfer" })).data,
  verify: async (reference: string) =>
    (await api.get<Envelope<{ status: string; reference: string }>>(`/payments/verify/${reference}`)).data,
  forDelivery: async (deliveryId: string) =>
    (await api.get<Envelope<{ reference?: string; status?: string }>>(`/payments/for-delivery/${deliveryId}`)).data,
  completeAndSettle: async (deliveryId: string, review?: string, rating?: number) =>
    (
      await api.post<Envelope<Settlement>>(`/payments/complete-and-settle/${deliveryId}`, {
        verified: true,
        review,
        ...(rating ? { rating } : {}),
      })
    ).data,
};

/* ------------------------------ Errands ----------------------------- */

export const errands = {
  list: async () =>
    (await api.get<Envelope<Errand[]>>("/errands", { params: { status: "all", limit: 50 } })).data.data ?? [],
  create: async (body: Record<string, unknown>) => (await api.post<Envelope<Errand>>("/errands", body)).data,
  cancel: async (id: string, reason: string) => (await api.patch<Envelope<unknown>>(`/errands/${id}/cancel`, { reason })).data,
  confirmCompletion: async (id: string) => (await api.patch<Envelope<unknown>>(`/errands/${id}/confirm-completion`)).data,
  dispute: async (id: string, details: string) => (await api.post<Envelope<unknown>>(`/errands/${id}/dispute`, { details })).data,
  // Rider actions
  accept: async (id: string) => (await api.patch<Envelope<unknown>>(`/errands/${id}/accept`)).data,
  start: async (id: string) => (await api.patch<Envelope<unknown>>(`/errands/${id}/start`)).data,
  atPickup: async (id: string) => (await api.patch<Envelope<unknown>>(`/errands/${id}/at-pickup`)).data,
  recordExpense: async (id: string, body: { actualSpend: number; note?: string }) =>
    (await api.post<Envelope<{ balanceReturned?: number }>>(`/errands/${id}/expense`, body)).data,
  complete: async (id: string, body: { note?: string }) => (await api.patch<Envelope<unknown>>(`/errands/${id}/complete`, body)).data,
};

/* -------------------------- Pay on delivery ------------------------- */

export const pod = {
  list: async () =>
    (await api.get<Envelope<PodOrder[]>>("/pod", { params: { status: "all", limit: 50 } })).data.data ?? [],
  get: async (id: string) => (await api.get<Envelope<PodOrder>>(`/pod/${id}`)).data.data,
  create: async (body: Record<string, unknown>) => (await api.post<Envelope<PodOrder>>("/pod", body)).data,
  cancel: async (id: string, reason: string) => (await api.patch<Envelope<unknown>>(`/pod/${id}/cancel`, { reason })).data,
  reject: async (id: string, reason: string) => (await api.post<Envelope<unknown>>(`/pod/${id}/reject`, { reason })).data,
  // Rider actions
  markAwaiting: async (id: string) => (await api.patch<Envelope<unknown>>(`/pod/${id}/awaiting`)).data,
  recordPayment: async (id: string, note?: string) => (await api.post<Envelope<unknown>>(`/pod/${id}/payment`, { note })).data,
};

export const companies = {
  list: async () => (await api.get<Envelope<Company[]>>("/companies")).data.data ?? [],
};

/* ------------------------------- Chat ------------------------------- */

export const chat = {
  messages: async (deliveryId: string) =>
    (await api.get<Envelope<ChatMessage[]>>(`/chat/${deliveryId}/messages`, { params: { page: 1, limit: 50 } })).data.data ?? [],
  send: async (deliveryId: string, message: string) =>
    (await api.post<Envelope<ChatMessage>>(`/chat/${deliveryId}/message`, { message })).data,
};

/* ------------------------------ Support ----------------------------- */

export const support = {
  tickets: async () =>
    (await api.get<Envelope<SupportTicket[]>>("/v1/support/tickets", { params: { status: "open" } })).data.data ?? [],
  ticket: async (id: string) => (await api.get<Envelope<SupportTicket>>(`/v1/support/tickets/${id}`)).data.data,
  ticketMessages: async (id: string) =>
    (await api.get<Envelope<TicketMessage[]>>(`/v1/support/tickets/${id}/messages`)).data.data ?? [],
  createTicket: async (body: { issueType: string; title: string; description: string }) =>
    (await api.post<Envelope<SupportTicket>>("/v1/support/tickets", body)).data,
  chatHistory: async () =>
    (await api.get<Envelope<SupportChatMessage[]>>("/admin-chat/messages", { params: { limit: 50 } })).data.data ?? [],
};

/* --------------------------- Notifications -------------------------- */

export const notifications = {
  list: async (page = 1, limit = 20) =>
    (await api.get("/notifications", { params: { page, limit } })).data as {
      data: AppNotification[];
      pagination?: { total?: number; unreadCount?: number; pages?: number };
    },
  markRead: async (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: async () => api.put("/notifications/read-all"),
  remove: async (id: string) => api.delete(`/notifications/${id}`),
  clearRead: async () => api.delete("/notifications/clear-read"),
  preferences: async () =>
    ((await api.get("/users/preferences")).data?.data?.notifications ?? {}) as {
      push?: boolean;
      email?: boolean;
      sms?: boolean;
    },
  savePreferences: async (prefs: { push: boolean; email: boolean; sms: boolean }) =>
    api.put("/users/preferences", { notifications: prefs }),
};

/* ------------------------------ Account ----------------------------- */

export const account = {
  updateProfile: async (body: { name: string; phone: string }) => (await api.put("/auth/profile", body)).data,
  changePassword: async (currentPassword: string, newPassword: string) =>
    (await api.post("/auth/change-password", { currentPassword, newPassword })).data,
};

/* ------------------------------- Rider ------------------------------ */

export const rider = {
  myDeliveries: async () =>
    (await api.get<Envelope<Delivery[]>>("/deliveries/driver/my-deliveries")).data.data ?? [],
  requests: async (lat: number, lng: number) =>
    (await api.get("/driver/requests", { params: { lat, lng } })).data as { count?: number; data?: DriverRequest[] },
  accept: async (id: string) => (await api.post(`/deliveries/${id}/accept`)).data,
  reject: async (id: string) => (await api.post(`/deliveries/${id}/reject`, {})).data,
  start: async (id: string) => (await api.post(`/driver/deliveries/start/${id}`)).data,
  complete: async (id: string) => (await api.post(`/driver/deliveries/complete/${id}`)).data,
  setOnline: async (isOnline: boolean) => {
    await api.post("/driver/online-status", { isOnline });
    if (isOnline) await api.post("/driver/availability", { isAvailable: true });
  },
  updateLocation: async (coords: { lat: number; lng: number; accuracy?: number | null; heading?: number | null; speed?: number | null }) =>
    api.post("/driver/location", coords),
  earnings: async () => (await api.get<Envelope<EarningsData>>("/driver/earnings")).data.data,
  requestRescue: async (id: string, body: { reason: string; details?: string; currentLat?: number; currentLng?: number }) =>
    (await api.post<Envelope<unknown>>(`/rescue/deliveries/${id}/request-help`, body)).data,
};
