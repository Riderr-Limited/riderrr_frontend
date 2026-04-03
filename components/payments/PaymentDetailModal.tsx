"use client";

import {
  IconX,
  IconDownload,
  IconCheck,
  IconClock,
  IconUser,
  IconMapPin,
} from "@tabler/icons-react";

export interface Payment {
  _id: string;
  amount: number;
  companyAmount: number;
  platformFee: number;
  status: string;
  escrowStatus: string;
  paidAt: string;
  settledAt?: string;
  paymentMethod: string;
  paystackReference: string;
  customer: { name: string; phone: string } | null;
  delivery: { referenceId: string; pickup: string; dropoff: string; status: string } | null;
  driver?: { name: string; phone: string };
}

const fmt = (n: number) => `₦${n.toLocaleString()}`;
const fmtDate = (d: string) =>
  new Date(d).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const escrowColors: Record<string, string> = {
  settled: "text-green-600 bg-green-50",
  pending: "text-orange-600 bg-orange-50",
  held: "text-blue-600 bg-blue-50",
};

function downloadReceipt(p: Payment) {
  const lines = [
    "RIDERRR PAYMENT RECEIPT",
    "========================",
    `Reference:    ${p.delivery.referenceId}`,
    `Paystack Ref: ${p.paystackReference}`,
    `Date:         ${fmtDate(p.paidAt)}`,
    "",
    "CUSTOMER",
    `Name:  ${p.customer.name}`,
    `Phone: ${p.customer.phone}`,
    "",
    "DELIVERY",
    `Pickup:  ${p.delivery.pickup}`,
    `Dropoff: ${p.delivery.dropoff}`,
    `Status:  ${p.delivery.status}`,
    "",
    "PAYMENT BREAKDOWN",
    `Total Amount:  ${fmt(p.amount)}`,
    `Platform Fee:  ${fmt(p.platformFee)}`,
    `Your Earnings: ${fmt(p.companyAmount)}`,
    "",
    `Settlement:    ${p.escrowStatus.toUpperCase()}`,
    p.settledAt ? `Settled At:    ${fmtDate(p.settledAt)}` : "",
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const blob = new Blob([lines], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt-${p.delivery.referenceId}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PaymentDetailModal({
  payment,
  onClose,
}: {
  payment: Payment;
  onClose: () => void;
}) {
  if (!payment.delivery || !payment.customer) return null;

  const steps = [
    { label: "Payment Received", date: payment.paidAt, done: true },
    {
      label: "Delivery Completed",
      date: payment.delivery.status === "completed" ? payment.paidAt : null,
      done: payment.delivery.status === "completed",
    },
    {
      label: "Funds in Escrow",
      date:
        payment.escrowStatus === "held" || payment.escrowStatus === "settled"
          ? payment.paidAt
          : null,
      done: payment.escrowStatus === "held" || payment.escrowStatus === "settled",
    },
    {
      label: "Settled to Account",
      date: payment.settledAt || null,
      done: payment.escrowStatus === "settled",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {payment.delivery.referenceId}
            </h2>
            <p className="text-sm text-gray-500">{fmtDate(payment.paidAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadReceipt(payment)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              <IconDownload className="h-4 w-4" />
              Receipt
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <IconX className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Commission Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Breakdown</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Charged</span>
              <span className="font-medium">{fmt(payment.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Platform Fee</span>
              <span className="text-red-600">− {fmt(payment.platformFee)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-semibold">
              <span>Your Earnings</span>
              <span className="text-green-600">{fmt(payment.companyAmount)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 pt-1">
              <span>Settlement Status</span>
              <span
                className={`px-2 py-0.5 rounded-full font-medium capitalize ${
                  escrowColors[payment.escrowStatus] || "text-gray-600 bg-gray-100"
                }`}
              >
                {payment.escrowStatus}
              </span>
            </div>
          </div>

          {/* Customer & Driver */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <IconUser className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Customer
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">{payment.customer.name}</p>
              <p className="text-xs text-gray-500">{payment.customer.phone}</p>
            </div>
            {payment.driver && (
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <IconUser className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Driver
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900">{payment.driver.name}</p>
                <p className="text-xs text-gray-500">{payment.driver.phone}</p>
              </div>
            )}
          </div>

          {/* Route */}
          <div className="border border-gray-200 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <IconMapPin className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="text-sm text-gray-900">{payment.delivery.pickup}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <IconMapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Dropoff</p>
                <p className="text-sm text-gray-900">{payment.delivery.dropoff}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Settlement Timeline</h3>
            <div>
              {steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        step.done ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      {step.done ? (
                        <IconCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <IconClock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={`w-0.5 h-6 ${step.done ? "bg-green-200" : "bg-gray-200"}`}
                      />
                    )}
                  </div>
                  <div className="pb-4">
                    <p
                      className={`text-sm font-medium ${
                        step.done ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-xs text-gray-500">{fmtDate(step.date)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
            <span>Payment Method</span>
            <span className="capitalize font-medium text-gray-700">
              {payment.paymentMethod}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
