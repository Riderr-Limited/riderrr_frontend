export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export function naira(value?: number | string | null): string {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "₦0";
  return `₦${n.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

export function shortRef(id?: string, length = 6): string {
  return id ? id.slice(-length).toUpperCase() : "";
}

export function formatDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTime(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });
}

export function timeAgo(value?: string): string {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return formatDate(value);
}

export function initials(name?: string, fallback = "R"): string {
  if (!name) return fallback;
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || fallback
  );
}

export function humanize(value?: string): string {
  if (!value) return "";
  const text = value.replace(/[_-]/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/* ----------------------------- Statuses ----------------------------- */

type StatusMeta = { label: string; tone: Tone };

const DELIVERY_STATUS: Record<string, StatusMeta> = {
  created: { label: "Finding a rider", tone: "warning" },
  assigned: { label: "Rider on the way", tone: "info" },
  picked_up: { label: "In transit", tone: "info" },
  "in-transit": { label: "In transit", tone: "info" },
  rescue_requested: { label: "Reassigning rider", tone: "warning" },
  delivered: { label: "Delivered", tone: "success" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  failed: { label: "Failed", tone: "danger" },
};

export function deliveryStatus(status: string): StatusMeta {
  return DELIVERY_STATUS[status] ?? { label: humanize(status), tone: "neutral" };
}

export const DELIVERY_ACTIVE = ["created", "assigned", "picked_up", "in-transit", "rescue_requested"];
export const DELIVERY_DONE = ["delivered", "completed"];

export function isDeliveryActive(status: string) {
  return DELIVERY_ACTIVE.includes(status);
}

/** Rider-facing wording for the same delivery statuses. */
export function riderDeliveryStatus(status: string): StatusMeta {
  switch (status) {
    case "created":
    case "assigned":
      return { label: "Head to pickup", tone: "info" };
    case "picked_up":
      return { label: "Deliver package", tone: "warning" };
    case "rescue_requested":
      return { label: "Help requested", tone: "warning" };
    default:
      return deliveryStatus(status);
  }
}

const ERRAND_STATUS: Record<string, StatusMeta> = {
  REQUESTED: { label: "Waiting for assignment", tone: "neutral" },
  SEARCHING_RIDER: { label: "Finding a rider", tone: "warning" },
  RIDER_ASSIGNED: { label: "Rider assigned", tone: "info" },
  ACCEPTED: { label: "Rider on the way", tone: "info" },
  IN_PROGRESS: { label: "In progress", tone: "info" },
  AT_PICKUP: { label: "Rider at pickup", tone: "info" },
  AWAITING_CONFIRMATION: { label: "Confirm completion", tone: "warning" },
  COMPLETED: { label: "Completed", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
  FAILED: { label: "Failed", tone: "danger" },
};

const RIDER_ERRAND_STATUS: Record<string, StatusMeta> = {
  RIDER_ASSIGNED: { label: "Accept required", tone: "warning" },
  ACCEPTED: { label: "Start when ready", tone: "info" },
  IN_PROGRESS: { label: "In progress", tone: "info" },
  AT_PICKUP: { label: "At pickup", tone: "info" },
  AWAITING_CONFIRMATION: { label: "Awaiting customer", tone: "neutral" },
  COMPLETED: { label: "Completed", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

export function errandStatus(status: string, forRider = false): StatusMeta {
  const map = forRider ? RIDER_ERRAND_STATUS : ERRAND_STATUS;
  return map[status] ?? ERRAND_STATUS[status] ?? { label: humanize(status), tone: "neutral" };
}

export const ERRAND_ACTIVE = ["REQUESTED", "SEARCHING_RIDER", "RIDER_ASSIGNED", "ACCEPTED", "IN_PROGRESS", "AT_PICKUP", "AWAITING_CONFIRMATION"];
export const ERRAND_CANCELLABLE = ["REQUESTED", "SEARCHING_RIDER", "RIDER_ASSIGNED", "ACCEPTED"];
export const ERRAND_TERMINAL = ["COMPLETED", "CANCELLED", "FAILED"];

export const ERRAND_TYPES = [
  { key: "PURCHASE", label: "Purchase" },
  { key: "PICKUP_DELIVERY", label: "Pickup & deliver" },
  { key: "DOCUMENT_COLLECTION", label: "Documents" },
  { key: "STOCK_MOVEMENT", label: "Stock move" },
  { key: "CUSTOM", label: "Custom" },
] as const;

const POD_STATUS: Record<string, StatusMeta> = {
  POD_REQUESTED: { label: "Awaiting confirmation", tone: "neutral" },
  CONFIRMED: { label: "Order confirmed", tone: "info" },
  READY_FOR_DELIVERY: { label: "Finding a rider", tone: "warning" },
  OUT_FOR_DELIVERY: { label: "Rider on the way", tone: "info" },
  AWAITING_CUSTOMER: { label: "Rider has arrived", tone: "warning" },
  DELIVERED_PAID: { label: "Complete", tone: "success" },
  REJECTED_RETURN: { label: "Being returned", tone: "danger" },
  SETTLED: { label: "Settled", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

export function podStatus(status: string): StatusMeta {
  return POD_STATUS[status] ?? { label: humanize(status), tone: "neutral" };
}

export const POD_ACTIVE = ["POD_REQUESTED", "CONFIRMED", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "AWAITING_CUSTOMER"];
export const POD_CANCELLABLE = ["POD_REQUESTED", "CONFIRMED", "READY_FOR_DELIVERY"];

export function ticketTone(status: string): Tone {
  switch (status?.toLowerCase()) {
    case "open":
      return "info";
    case "in_progress":
    case "in-progress":
    case "pending":
      return "warning";
    case "resolved":
    case "closed":
      return "success";
    default:
      return "neutral";
  }
}

/** Delivery has been paid for, or doesn't need online payment. */
export function isPaymentSettled(d: { payment?: { method?: string; status?: string } }) {
  const method = d.payment?.method;
  const status = d.payment?.status;
  return method === "cash" || status === "paid" || status === "successful";
}

/* ------------------------------- Phone ------------------------------ */

/**
 * The backend accepts Nigerian numbers only as 08012345678 or +2348012345678.
 * Tidy what people actually type ("0801 234 5678", "234801…", "801…") into that shape.
 */
export function normalizeNigerianPhone(input: string): string {
  const raw = input.trim();
  const digits = raw.replace(/\D/g, "");
  if (/^234\d{10}$/.test(digits)) return `+${digits}`;
  if (/^0\d{10}$/.test(digits)) return digits;
  if (/^[789]\d{9}$/.test(digits)) return `0${digits}`;
  return raw.replace(/[\s()-]/g, "");
}

export function isValidNigerianPhone(input: string): boolean {
  return /^(0\d{10}|\+234\d{10})$/.test(normalizeNigerianPhone(input));
}

export const PHONE_HINT = "Enter a Nigerian number, e.g. 08012345678 or +2348012345678.";
