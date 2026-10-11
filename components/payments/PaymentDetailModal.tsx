"use client";

import { IconX, IconDownload, IconCheck } from "@tabler/icons-react";
import { Field, RouteStops } from "@/components/dashboard/primitives";

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
  settled: "dash-badge-success",
  pending: "dash-badge-warning",
  held: "dash-badge-info",
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
    <div className="dash-overlay" onClick={onClose}>
      <div
        className="dash-modal max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="dash-modal-header">
          <div className="min-w-0">
            <h2 className="dash-modal-title font-mono">
              {payment.delivery.referenceId}
            </h2>
            <p className="mt-0.5 text-[13px] text-brand-ink-muted">{fmtDate(payment.paidAt)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => downloadReceipt(payment)}
              className="dash-btn dash-btn-sm dash-btn-secondary"
            >
              <IconDownload className="size-4" stroke={1.75} />
              Receipt
            </button>
            <button onClick={onClose} className="dash-icon-btn -mr-1.5" aria-label="Close">
              <IconX className="size-[18px]" />
            </button>
          </div>
        </div>

        <div className="dash-modal-body space-y-6">
          {/* Commission Breakdown */}
          <section>
            <h3 className="mb-1.5 text-sm font-semibold text-brand-ink">Payment breakdown</h3>
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-brand-ink-muted">Total charged</span>
              <span className="text-brand-ink tabular-nums">{fmt(payment.amount)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-brand-ink-muted">Platform fee</span>
              <span className="text-brand-ink-secondary tabular-nums">− {fmt(payment.platformFee)}</span>
            </div>
            <div className="mt-1.5 flex justify-between border-t border-brand-hairline pt-2.5 text-sm font-semibold text-brand-ink">
              <span>Your earnings</span>
              <span className="tabular-nums">{fmt(payment.companyAmount)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-brand-ink-muted">Settlement status</span>
              <span className={`dash-badge capitalize ${escrowColors[payment.escrowStatus] || ""}`}>
                {payment.escrowStatus}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-brand-ink-muted">Payment method</span>
              <span className="text-brand-ink capitalize">{payment.paymentMethod}</span>
            </div>
          </section>

          {/* Customer & Driver */}
          <section className="grid grid-cols-2 gap-x-6 border-t border-brand-hairline pt-5">
            <Field label="Customer">
              <span className="font-medium">{payment.customer.name}</span>
              <span className="block text-[13px] text-brand-ink-muted tabular-nums">
                {payment.customer.phone}
              </span>
            </Field>
            {payment.driver && (
              <Field label="Driver">
                <span className="font-medium">{payment.driver.name}</span>
                <span className="block text-[13px] text-brand-ink-muted tabular-nums">
                  {payment.driver.phone}
                </span>
              </Field>
            )}
          </section>

          {/* Route */}
          <section className="border-t border-brand-hairline pt-5">
            <p className="dash-eyebrow mb-1.5">Route</p>
            <RouteStops pickup={payment.delivery.pickup} dropoff={payment.delivery.dropoff} />
          </section>

          {/* Timeline */}
          <section className="border-t border-brand-hairline pt-5">
            <h3 className="mb-3 text-sm font-semibold text-brand-ink">Settlement timeline</h3>
            <ol>
              {steps.map((step, i) => (
                <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < steps.length - 1 && (
                    <span
                      className={`absolute top-[18px] bottom-0 left-[8.5px] w-px ${
                        step.done ? "bg-emerald-200" : "bg-brand-hairline"
                      }`}
                    />
                  )}
                  <span
                    className={`relative flex size-[18px] shrink-0 items-center justify-center rounded-full ${
                      step.done
                        ? "bg-emerald-600 text-white"
                        : "border border-brand-hairline bg-white"
                    }`}
                  >
                    {step.done && <IconCheck className="size-3" stroke={3} />}
                  </span>
                  <div className="-mt-px">
                    <p
                      className={`text-sm ${
                        step.done ? "font-medium text-brand-ink" : "text-brand-ink-faint"
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-xs text-brand-ink-muted">{fmtDate(step.date)}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
