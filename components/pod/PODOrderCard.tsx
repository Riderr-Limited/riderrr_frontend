"use client";

import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { RouteStops } from "@/components/dashboard/primitives";
import { useState } from "react";

export interface PODOrder {
  _id: string;
  referenceId: string;
  status: string;
  customerName: string;
  customerPhone: string;
  product: { name: string; description?: string; quantity: number };
  pickup?: { address: string };
  dropoff?: { address: string; recipientName?: string; recipientPhone?: string };
  productAmount: number;
  deliveryFee: number;
  handlingFee: number;
  amountToCollect: number;
  inspectionAllowed: boolean;
  company?: string | { _id: string };
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  POD_REQUESTED: "dash-badge-warning",
  CONFIRMED: "dash-badge-info",
  READY_FOR_DELIVERY: "dash-badge-info",
  OUT_FOR_DELIVERY: "dash-badge-info",
  AWAITING_CUSTOMER: "dash-badge-warning",
  DELIVERED_PAID: "dash-badge-success",
  SETTLED: "dash-badge-success",
  CANCELLED: "dash-badge-danger",
  REJECTED_RETURN: "dash-badge-danger",
};

const STATUS_LABELS: Record<string, string> = {
  POD_REQUESTED: "Requested",
  CONFIRMED: "Confirmed",
  READY_FOR_DELIVERY: "Ready",
  OUT_FOR_DELIVERY: "Out for Delivery",
  AWAITING_CUSTOMER: "Awaiting Customer",
  DELIVERED_PAID: "Delivered & Paid",
  SETTLED: "Settled",
  CANCELLED: "Cancelled",
  REJECTED_RETURN: "Rejected",
};

interface Props {
  order: PODOrder;
  actions?: React.ReactNode;
}

export default function PODOrderCard({ order, actions }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="dash-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-brand-hairline px-5 py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono text-[13px] font-medium text-brand-ink">{order.referenceId}</span>
          <span className={`dash-badge ${STATUS_STYLES[order.status] || ""}`}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="dash-icon-btn -mr-1.5 size-7"
          aria-expanded={expanded}
          aria-label={expanded ? "Hide details" : "Show details"}
        >
          {expanded ? <IconChevronUp className="size-4" /> : <IconChevronDown className="size-4" />}
        </button>
      </div>

      <div className="space-y-3.5 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-brand-ink">{order.product.name}</p>
            {order.product.description && (
              <p className="mt-0.5 text-[13px] text-brand-ink-muted">{order.product.description}</p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-semibold text-brand-ink tabular-nums">
              ₦{order.amountToCollect.toLocaleString()}
            </p>
            <p className="text-xs text-brand-ink-muted">to collect</p>
          </div>
        </div>

        {(order.pickup?.address || order.dropoff?.address) && (
          <RouteStops pickup={order.pickup?.address} dropoff={order.dropoff?.address} />
        )}

        {expanded && (
          <dl className="space-y-2 border-t border-brand-hairline pt-3.5 text-[13px]">
            <div className="flex justify-between gap-4">
              <dt className="text-brand-ink-muted">Customer</dt>
              <dd className="text-right text-brand-ink">
                {order.customerName} · {order.customerPhone}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brand-ink-muted">Recipient</dt>
              <dd className="text-right text-brand-ink">{order.dropoff?.recipientName} · {order.dropoff?.recipientPhone}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brand-ink-muted">Product amount</dt>
              <dd className="text-brand-ink tabular-nums">₦{order.productAmount.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brand-ink-muted">Delivery fee</dt>
              <dd className="text-brand-ink tabular-nums">₦{order.deliveryFee.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brand-ink-muted">Inspection allowed</dt>
              <dd className="text-brand-ink">
                {order.inspectionAllowed ? "Yes" : "No"}
              </dd>
            </div>
          </dl>
        )}

        {actions && (
          <div className="flex gap-2 border-t border-brand-hairline pt-3.5 sm:justify-end">{actions}</div>
        )}
      </div>
    </div>
  );
}
