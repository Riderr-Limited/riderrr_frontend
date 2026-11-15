"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { errorMessage } from "@/lib/app/api";
import { payments } from "@/lib/app/services";
import type { Settlement } from "@/lib/app/types";
import { Button, KeyValue, Modal, Notice, StarRating } from "../ui";

type Props = {
  deliveryId: string | null;
  open: boolean;
  onClose: () => void;
  onDone: () => void;
};

/** "Did you receive your package?" — releases payment to the company and closes the delivery. */
export function ConfirmReceiptModal(props: Props) {
  return props.open && props.deliveryId ? <ConfirmReceiptBody key={props.deliveryId} {...props} /> : null;
}

function ConfirmReceiptBody({
  deliveryId,
  open,
  onClose,
  onDone,
}: Props) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Settlement | null>(null);

  const confirm = async () => {
    if (!deliveryId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await payments.completeAndSettle(deliveryId, review.trim() || undefined, rating || undefined);
      if (res.success) setResult(res.data ?? ({} as Settlement));
      else setError(res.message || "We couldn't confirm this delivery.");
    } catch (e) {
      setError(errorMessage(e, "We couldn't confirm this delivery."));
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    const s = result.settlement;
    const transfer =
      s?.transferStatus === "SUCCESSFUL" ? "Completed" : s?.transferStatus === "FAILED" ? "Failed — support will follow up" : "Processing";
    return (
      <Modal
        open={open}
        onClose={onDone}
        title="Delivery complete"
        size="sm"
        footer={
          <Button block onClick={onDone}>
            Done
          </Button>
        }
      >
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 aria-hidden className="size-10 text-emerald-600" />
          <p className="mt-3 text-sm text-brand-ink-secondary">Thanks for confirming. Your delivery is closed.</p>
        </div>
        {s && (
          <div className="mt-5 rounded-lg border border-brand-hairline px-4 py-1">
            <KeyValue label="Company receives">{s.companyReceived}</KeyValue>
            <KeyValue label="Platform fee">{s.platformFee}</KeyValue>
            <KeyValue label="Transfer">{transfer}</KeyValue>
          </div>
        )}
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title="Confirm delivery"
      description="Only confirm once you have your package."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Not yet
          </Button>
          <Button onClick={confirm} loading={busy}>
            I received it
          </Button>
        </>
      }
    >
      <p className="dash-label">Rate your experience</p>
      <StarRating value={rating} onChange={setRating} />
      <label htmlFor="review" className="dash-label mt-5">
        Review <span className="font-normal text-brand-ink-faint">(optional)</span>
      </label>
      <textarea
        id="review"
        className="dash-input min-h-20 resize-y"
        maxLength={200}
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="How was your delivery?"
      />
      {error && (
        <Notice tone="danger" className="mt-3">
          {error}
        </Notice>
      )}
    </Modal>
  );
}
