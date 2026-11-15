"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RouteStops } from "@/components/dashboard/primitives";
import { errorMessage } from "@/lib/app/api";
import { ERRAND_CANCELLABLE, ERRAND_TERMINAL, errandStatus, formatDateTime, humanize, naira } from "@/lib/app/format";
import { errands } from "@/lib/app/services";
import type { Errand } from "@/lib/app/types";
import { Button, Modal, Notice, ReasonModal, StatusBadge } from "../ui";
import { Detail, DetailGrid, ExpandableRow } from "../Expandable";

export function ErrandList({ items, onChanged }: { items: Errand[]; onChanged: () => void }) {
  const [confirming, setConfirming] = useState<Errand | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [disputeId, setDisputeId] = useState<string | null>(null);

  const confirm = async () => {
    if (!confirming) return;
    setConfirmBusy(true);
    setConfirmError(null);
    try {
      const res = await errands.confirmCompletion(confirming._id);
      if (!res.success) throw new Error(res.message);
      setConfirming(null);
      toast.success("Errand completed.");
      onChanged();
    } catch (e) {
      setConfirmError(errorMessage(e, "We couldn't confirm this errand."));
    } finally {
      setConfirmBusy(false);
    }
  };

  return (
    <>
      <ul className="divide-y divide-brand-hairline overflow-hidden rounded-lg border border-brand-hairline">
        {items.map((e) => {
          const meta = errandStatus(e.status);
          const canConfirm = e.status === "AWAITING_CONFIRMATION";
          const canCancel = ERRAND_CANCELLABLE.includes(e.status);
          const canDispute = !ERRAND_TERMINAL.includes(e.status) && !e.disputeRaised;
          return (
            <ExpandableRow
              key={e._id}
              defaultOpen={canConfirm}
              summary={
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.description}</p>
                    <p className="mt-0.5 truncate text-[13px] text-brand-ink-muted">
                      {humanize(e.errandType)} · {e.pickupLocation?.address}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                    <span className="text-xs text-brand-ink-faint">{formatDateTime(e.createdAt)}</span>
                  </div>
                </div>
              }
            >
              <RouteStops pickup={e.pickupLocation?.address} dropoff={e.destination?.address ?? "No delivery destination"} />
              <div className="mt-4">
                <DetailGrid>
                  <Detail label="Task" wide>
                    {e.description}
                  </Detail>
                  {e.specialInstructions && <Detail label="Notes" wide>{e.specialInstructions}</Detail>}
                  {e.companyId?.name && <Detail label="Company">{e.companyId.name}</Detail>}
                  <Detail label="Reference">{e.referenceId}</Detail>
                  {e.spendingLimit ? <Detail label="Spending limit">{naira(e.spendingLimit)}</Detail> : null}
                  {e.customerAdvance ? <Detail label="Cash advance">{naira(e.customerAdvance)}</Detail> : null}
                  {e.actualSpend ? <Detail label="Actually spent">{naira(e.actualSpend)}</Detail> : null}
                  {e.balanceReturned ? <Detail label="Change to collect">{naira(e.balanceReturned)}</Detail> : null}
                  {e.serviceFee ? <Detail label="Service fee">{naira(e.serviceFee)}</Detail> : null}
                  {e.paymentMethod && <Detail label="Payment">{humanize(e.paymentMethod)}</Detail>}
                </DetailGrid>
              </div>

              {canConfirm && (
                <Notice tone="info" className="mt-4">
                  The rider has finished the task.
                  {e.balanceReturned ? ` Collect ${naira(e.balanceReturned)} change before confirming.` : " Confirm to close the errand."}
                </Notice>
              )}
              {e.disputeRaised && (
                <Notice tone="danger" className="mt-4">
                  Dispute raised — our support team is reviewing it.
                </Notice>
              )}

              {(canConfirm || canCancel || canDispute) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {canConfirm && (
                    <Button size="sm" onClick={() => { setConfirmError(null); setConfirming(e); }}>
                      Confirm completion
                    </Button>
                  )}
                  {canCancel && (
                    <Button size="sm" variant="secondary" onClick={() => setCancelId(e._id)}>
                      Cancel errand
                    </Button>
                  )}
                  {canDispute && (
                    <Button size="sm" variant="danger-outline" onClick={() => setDisputeId(e._id)}>
                      Report a problem
                    </Button>
                  )}
                </div>
              )}
            </ExpandableRow>
          );
        })}
      </ul>

      <Modal
        open={!!confirming}
        onClose={() => setConfirming(null)}
        title="Confirm completion"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirming(null)} disabled={confirmBusy}>
              Not yet
            </Button>
            <Button onClick={confirm} loading={confirmBusy}>
              Yes, confirm
            </Button>
          </>
        }
      >
        <p className="text-sm text-brand-ink-secondary">Has the rider completed the errand?</p>
        {confirming?.balanceReturned ? (
          <p className="mt-2 text-sm text-brand-ink-secondary">
            Make sure you received <strong className="font-medium text-brand-ink">{naira(confirming.balanceReturned)}</strong> in change.
          </p>
        ) : null}
        {confirmError && (
          <Notice tone="danger" className="mt-3">
            {confirmError}
          </Notice>
        )}
      </Modal>

      <ReasonModal
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Cancel errand?"
        confirmLabel="Cancel errand"
        cancelLabel="Keep errand"
        onConfirm={async (reason) => {
          if (!cancelId) return;
          try {
            const res = await errands.cancel(cancelId, reason || "Cancelled by customer");
            if (!res.success) throw new Error(res.message);
          } catch (e) {
            throw new Error(errorMessage(e, "We couldn't cancel this errand."));
          }
          setCancelId(null);
          toast.success("Errand cancelled.");
          onChanged();
        }}
      />

      <ReasonModal
        open={!!disputeId}
        onClose={() => setDisputeId(null)}
        title="Report a problem"
        description="Tell us what went wrong and our support team will review it."
        placeholder="e.g. The rider didn't return my change"
        required
        maxLength={500}
        confirmLabel="Submit"
        cancelLabel="Cancel"
        onConfirm={async (details) => {
          if (!disputeId) return;
          try {
            const res = await errands.dispute(disputeId, details);
            if (!res.success) throw new Error(res.message);
          } catch (e) {
            throw new Error(errorMessage(e, "We couldn't submit your report."));
          }
          setDisputeId(null);
          toast.success("Thanks — support will review this.");
          onChanged();
        }}
      />
    </>
  );
}
