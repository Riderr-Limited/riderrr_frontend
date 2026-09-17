"use client";

import { IconMapPin, IconPhone, IconPackage, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
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
  POD_REQUESTED: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  READY_FOR_DELIVERY: "bg-indigo-100 text-indigo-800",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800",
  AWAITING_CUSTOMER: "bg-orange-100 text-orange-800",
  DELIVERED_PAID: "bg-teal-100 text-teal-800",
  SETTLED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REJECTED_RETURN: "bg-red-100 text-red-800",
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{order.referenceId}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[order.status] || "bg-gray-100 text-gray-700"}`}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          {expanded ? <IconChevronUp className="h-4 w-4 text-gray-500" /> : <IconChevronDown className="h-4 w-4 text-gray-500" />}
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg mt-0.5">
            <IconPackage className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{order.product.name}</p>
            {order.product.description && (
              <p className="text-xs text-gray-500">{order.product.description}</p>
            )}
          </div>
          <p className="text-sm font-bold text-gray-900">₦{order.amountToCollect.toLocaleString()}</p>
        </div>

        <div className="space-y-2">
          {order.pickup?.address && (
            <div className="flex gap-2 text-sm">
              <IconMapPin className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <span className="text-gray-600 text-xs">{order.pickup.address}</span>
            </div>
          )}
          {order.dropoff?.address && (
            <div className="flex gap-2 text-sm">
              <IconMapPin className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span className="text-gray-600 text-xs">{order.dropoff.address}</span>
            </div>
          )}
        </div>

        {expanded && (
          <div className="pt-2 border-t border-gray-100 space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Customer</span>
              <span className="font-medium text-gray-900 flex items-center gap-1">
                <IconPhone className="h-3 w-3" /> {order.customerName} · {order.customerPhone}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Recipient</span>
              <span className="font-medium text-gray-900">{order.dropoff?.recipientName} · {order.dropoff?.recipientPhone}</span>
            </div>
            <div className="flex justify-between">
              <span>Product Amount</span>
              <span className="font-medium text-gray-900">₦{order.productAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-medium text-gray-900">₦{order.deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Inspection Allowed</span>
              <span className={`font-medium ${order.inspectionAllowed ? "text-green-600" : "text-red-500"}`}>
                {order.inspectionAllowed ? "Yes" : "No"}
              </span>
            </div>
          </div>
        )}

        {actions && <div className="pt-2 border-t border-gray-100 flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}
