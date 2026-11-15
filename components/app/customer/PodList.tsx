"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RouteStops } from "@/components/dashboard/primitives";
import { errorMessage } from "@/lib/app/api";
import { POD_CANCELLABLE, formatDateTime, naira, podStatus } from "@/lib/app/format";
import { pod } from "@/lib/app/services";
import type { PodOrder } from "@/lib/app/types";
import { Button, Notice, ReasonModal, StatusBadge } from "../ui";
import { Detail, DetailGrid, ExpandableRow } from "../Expandable";

export function PodList({ items, onChanged }: { items: PodOrder[]; onChanged: () => void }) {
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);

  return (
    <>
      <ul className="divide-y divide-brand-hairline overflow-hidden rounded-lg border border-brand-hairline">
        {items.map((o) => {
          const meta = podStatus(o.status);
          const arrived = o.status === "AWAITING_CUSTOMER";
          const canReject = arrived && o.inspectionAllowed;
          const canCancel = POD_CANCELLABLE.includes(o.status);
          return (
            <ExpandableRow
              key={o._id}
              defaultOpen={arrived}
              summary={
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{o.product?.name}</p>
                    <p className="mt-0.5 truncate text-[13px] text-brand-ink-muted">
                      {o.companyId?.name ? `${o.companyId.name} · ` : ""}
                      {o.dropoff?.address}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                    <span className="text-sm font-medium tabular-nums">{naira(o.amountToCollect)}</span>
                  </div>
                </div>
              }
            >
              <RouteStops pickup={o.pickup?.address} dropoff={o.dropoff?.address} />
              <div className="mt-4">
                <DetailGrid>
                  <Detail label="Product">{o.product?.name}</Detail>
                  <Detail label="Amount to pay">{naira(o.amountToCollect)}</Detail>
                  {o.product?.description && <Detail label="Description" wide>{o.product.description}</Detail>}
                  {o.dropoff?.recipientName && (
                    <Detail label="Recipient">
                      {o.dropoff.recipientName}
                      {o.dropoff.recipientPhone ? ` · ${o.dropoff.recipientPhone}` : ""}
                    </Detail>
                  )}
                  {o.companyId?.name && (
                    <Detail label="Merchant">
                      {o.companyId.name}
                      {o.companyId.contactPhone && (
                        <>
                          {" · "}
                          <a href={`tel:${o.companyId.contactPhone}`} className="text-brand-primary hover:underline">
                            {o.companyId.contactPhone}
                          </a>
                        </>
                      )}
                    </Detail>
                  )}
                  <Detail label="Reference">{o.referenceId}</Detail>
                  <Detail label="Placed">{formatDateTime(o.createdAt)}</Detail>
                </DetailGrid>
              </div>

              {arrived && (
                <Notice tone="warning" className="mt-4">
                  Your rider has arrived. Inspect the product, then pay{" "}
                  <strong className="font-semibold">{naira(o.amountToCollect)}</strong> if you&apos;re happy with it.
                </Notice>
              )}

              {(canReject || canCancel) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {canReject && (
                    <Button size="sm" variant="danger-outline" onClick={() => setRejectId(o._id)}>
                      Reject product
                    </Button>
                  )}
                  {canCancel && (
                    <Button size="sm" variant="secondary" onClick={() => setCancelId(o._id)}>
                      Cancel order
                    </Button>
                  )}
                </div>
              )}
            </ExpandableRow>
          );
        })}
      </ul>

      <ReasonModal
        open={!!rejectId}
        onClose={() => setRejectId(null)}
        title="Reject product"
        description="Tell us why. The rider will return it to the merchant."
        placeholder="e.g. Wrong size, damaged"
        required
        confirmLabel="Reject product"
        cancelLabel="Keep it"
        onConfirm={async (reason) => {
          if (!rejectId) return;
          try {
            const res = await pod.reject(rejectId, reason);
            if (!res.success) throw new Error(res.message);
          } catch (e) {
            throw new Error(errorMessage(e, "We couldn't reject this product."));
          }
          setRejectId(null);
          toast.success("Product rejected.");
          onChanged();
        }}
      />

      <ReasonModal
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Cancel order?"
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        onConfirm={async (reason) => {
          if (!cancelId) return;
          try {
            const res = await pod.cancel(cancelId, reason || "Cancelled by customer");
            if (!res.success) throw new Error(res.message);
          } catch (e) {
            throw new Error(errorMessage(e, "We couldn't cancel this order."));
          }
          setCancelId(null);
          toast.success("Order cancelled.");
          onChanged();
        }}
      />
    </>
  );
}
