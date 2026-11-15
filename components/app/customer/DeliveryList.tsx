"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { RouteStops } from "@/components/dashboard/primitives";
import { errorMessage } from "@/lib/app/api";
import { deliveryStatus, formatDateTime, isPaymentSettled, naira } from "@/lib/app/format";
import { deliveries, payments } from "@/lib/app/services";
import type { Delivery } from "@/lib/app/types";
import { Button, ReasonModal, StatusBadge } from "../ui";
import { BankTransferModal } from "./BankTransfer";
import { ConfirmReceiptModal } from "./ConfirmReceiptModal";

/** A customer's deliveries with the same per-status actions as the mobile app. */
export function DeliveryList({ items, onChanged }: { items: Delivery[]; onChanged: () => void }) {
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [payId, setPayId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const verify = async (d: Delivery) => {
    setVerifyingId(d._id);
    try {
      const pay = await payments.forDelivery(d._id);
      const reference = pay.data?.reference;
      if (!reference) {
        toast.error("No payment found for this delivery yet.");
        return;
      }
      const res = await payments.verify(reference);
      if (res.success && res.data?.status === "successful") {
        toast.success("Payment confirmed.");
        onChanged();
      } else {
        toast.message("Payment not confirmed yet", { description: res.message || "Give it a minute and check again." });
      }
    } catch (e) {
      toast.error(errorMessage(e, "We couldn't check this payment."));
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <>
      <ul className="divide-y divide-brand-hairline overflow-hidden rounded-lg border border-brand-hairline">
        {items.map((d) => {
          const meta = deliveryStatus(d.status);
          const unpaid = !isPaymentSettled(d);
          const canPay = d.status === "created" && unpaid;
          const canVerify = unpaid && d.status !== "cancelled";
          const canCancel = d.status === "created" || d.status === "rescue_requested";
          const canConfirm = d.status === "delivered";
          const hasActions = canPay || canVerify || canCancel || canConfirm;

          return (
            <li key={d._id} className="bg-white">
              <Link
                href={`/app/deliveries/${d._id}`}
                className="flex items-start gap-4 px-4 py-4 transition-colors hover:bg-brand-canvas-soft/60 sm:px-5"
              >
                <RouteStops pickup={d.pickup?.address} dropoff={d.dropoff?.address} className="flex-1" />
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                  <span className="text-xs text-brand-ink-faint">{formatDateTime(d.createdAt)}</span>
                  {d.fare?.totalFare ? <span className="text-sm font-medium tabular-nums">{naira(d.fare.totalFare)}</span> : null}
                </div>
                <ChevronRight aria-hidden className="mt-0.5 hidden size-4 shrink-0 text-brand-ink-faint sm:block" />
              </Link>
              {hasActions && (
                <div className="flex flex-wrap gap-2 px-4 pb-4 sm:px-5">
                  {canConfirm && (
                    <Button size="sm" onClick={() => setConfirmId(d._id)}>
                      Confirm receipt
                    </Button>
                  )}
                  {canPay && (
                    <Button size="sm" onClick={() => setPayId(d._id)}>
                      Pay now
                    </Button>
                  )}
                  {canVerify && (
                    <Button size="sm" variant="secondary" loading={verifyingId === d._id} onClick={() => verify(d)}>
                      Check payment
                    </Button>
                  )}
                  {canCancel && (
                    <Button size="sm" variant="danger-outline" onClick={() => setCancelId(d._id)}>
                      Cancel
                    </Button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <ReasonModal
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Cancel delivery?"
        description="This can't be undone."
        confirmLabel="Cancel delivery"
        cancelLabel="Keep delivery"
        placeholder="Why are you cancelling?"
        onConfirm={async (reason) => {
          if (!cancelId) return;
          try {
            const res = await deliveries.cancel(cancelId, reason || "Cancelled by customer");
            if (!res.success) throw new Error(res.message || "We couldn't cancel this delivery.");
          } catch (e) {
            throw new Error(errorMessage(e, "We couldn't cancel this delivery."));
          }
          setCancelId(null);
          toast.success("Delivery cancelled.");
          onChanged();
        }}
      />

      <ConfirmReceiptModal
        deliveryId={confirmId}
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onDone={() => {
          setConfirmId(null);
          onChanged();
        }}
      />

      <BankTransferModal
        deliveryId={payId}
        open={!!payId}
        onClose={() => setPayId(null)}
        onPaid={() => {
          setPayId(null);
          toast.success("Payment received. We're finding you a rider.");
          onChanged();
        }}
      />
    </>
  );
}
