"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, LifeBuoy, MessageSquare, Navigation, Phone } from "lucide-react";
import { toast } from "sonner";
import { RouteStops } from "@/components/dashboard/primitives";
import { RouteMap } from "@/components/app/RouteMap";
import { Button, KeyValue, Modal, Notice, PageLoader, StatusBadge } from "@/components/app/ui";
import { errorMessage } from "@/lib/app/api";
import { formatDateTime, humanize, naira, riderDeliveryStatus, shortRef } from "@/lib/app/format";
import { directionsUrl } from "@/lib/app/maps";
import { useRider } from "@/lib/app/rider-runtime";
import { rider } from "@/lib/app/services";

export default function RiderDeliveryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { allDeliveries, deliveriesLoaded, refreshDeliveries, location } = useRider();
  const delivery = allDeliveries.find((d) => d._id === id) ?? null;
  const [acting, setActing] = useState(false);
  const [confirmStep, setConfirmStep] = useState<"pickup" | "deliver" | null>(null);
  const [rescueOpen, setRescueOpen] = useState(false);
  const [rescueReason, setRescueReason] = useState("");
  const [rescueDetails, setRescueDetails] = useState("");
  const [rescueBusy, setRescueBusy] = useState(false);
  const [rescueError, setRescueError] = useState<string | null>(null);
  const [rescueSent, setRescueSent] = useState(false);

  // Keep this delivery fresh while the page is open.
  useEffect(() => {
    refreshDeliveries();
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") refreshDeliveries();
    }, 10000);
    return () => window.clearInterval(t);
  }, [refreshDeliveries]);

  if (!delivery) {
    if (!deliveriesLoaded) return <PageLoader label="Loading delivery" />;
    return (
      <div className="mx-auto max-w-md py-10">
        <Notice tone="info">This delivery isn&apos;t assigned to you, or it has been closed.</Notice>
        <Link href="/app/rider/jobs" className="mt-4 inline-block text-sm text-brand-primary hover:underline">
          Back to jobs
        </Link>
      </div>
    );
  }

  const status = delivery.status;
  const meta = riderDeliveryStatus(status);
  const toPickup = status === "assigned" || status === "created";
  const inTransit = status === "picked_up";
  const done = ["delivered", "completed", "cancelled"].includes(status);
  const target = toPickup ? delivery.pickup : delivery.dropoff;
  const customerPhone = delivery.customerPhone || delivery.pickup?.phone;
  const dropoffPhone = delivery.dropoff?.phone || delivery.recipientPhone;

  const advance = async () => {
    setActing(true);
    try {
      if (toPickup) {
        await rider.start(delivery._id);
        toast.success("Marked as picked up. Head to the drop-off.");
      } else if (inTransit) {
        await rider.complete(delivery._id);
        toast.success("Delivery completed. The customer will confirm receipt.");
      }
      setConfirmStep(null);
      await refreshDeliveries();
    } catch (e) {
      toast.error(errorMessage(e, "We couldn't update this delivery."));
    } finally {
      setActing(false);
    }
  };

  const sendRescue = async () => {
    if (!rescueReason.trim()) return setRescueError("Tell us what happened.");
    setRescueBusy(true);
    setRescueError(null);
    try {
      const res = await rider.requestRescue(delivery._id, {
        reason: rescueReason.trim(),
        details: rescueDetails.trim() || undefined,
        currentLat: location?.lat,
        currentLng: location?.lng,
      });
      if (!res.success) throw new Error(res.message);
      setRescueSent(true);
      setRescueOpen(false);
      toast.success("Help requested. Your company has been notified.");
      refreshDeliveries();
    } catch (e) {
      setRescueError(errorMessage(e, "We couldn't send your request."));
    } finally {
      setRescueBusy(false);
    }
  };

  return (
    <>
      <div className="mb-5 flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className="dash-icon-btn -ml-1.5" aria-label="Back">
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold tracking-tight">Delivery #{shortRef(delivery._id)}</h1>
          <p className="text-[13px] text-brand-ink-muted">{formatDateTime(delivery.createdAt)}</p>
        </div>
        <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <RouteMap
          pickup={delivery.pickup}
          dropoff={delivery.dropoff}
          self={location}
          className="h-64 rounded-lg border border-brand-hairline sm:h-80 lg:h-[460px]"
        />

        <div className="space-y-5">
          {!done && target && (
            <div className="rounded-lg border border-brand-hairline p-4">
              <p className="dash-eyebrow">{toPickup ? "Next: pick up from" : "Next: deliver to"}</p>
              <p className="mt-1 text-sm font-medium">{target.address}</p>
              {target.name && <p className="text-[13px] text-brand-ink-muted">{target.name}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={directionsUrl(target.lat, target.lng)} target="_blank" rel="noreferrer" className="dash-btn dash-btn-secondary dash-btn-sm">
                  <Navigation aria-hidden className="size-3.5" />
                  Directions
                </a>
                {(toPickup ? customerPhone : dropoffPhone) && (
                  <a href={`tel:${toPickup ? customerPhone : dropoffPhone}`} className="dash-btn dash-btn-secondary dash-btn-sm">
                    <Phone aria-hidden className="size-3.5" />
                    Call
                  </a>
                )}
                <Link href={`/app/chat/${delivery._id}?name=Customer`} className="dash-btn dash-btn-secondary dash-btn-sm">
                  <MessageSquare aria-hidden className="size-3.5" />
                  Message customer
                </Link>
              </div>
              <Button className="mt-4" size="lg" block onClick={() => setConfirmStep(toPickup ? "pickup" : "deliver")}>
                {toPickup ? "I've picked it up" : "Mark as delivered"}
              </Button>
            </div>
          )}

          {done && (
            <Notice tone="success">
              <p className="font-medium">{status === "cancelled" ? "This delivery was cancelled." : "Delivered."}</p>
              {status === "delivered" && <p className="mt-0.5">Waiting for the customer to confirm receipt.</p>}
            </Notice>
          )}

          {status === "rescue_requested" && <Notice tone="warning">Help requested. Your company is arranging support.</Notice>}

          <div className="rounded-lg border border-brand-hairline p-4">
            <RouteStops pickup={delivery.pickup?.address} dropoff={delivery.dropoff?.address} />
            <div className="mt-3 divide-y divide-brand-hairline border-t border-brand-hairline">
              <KeyValue label="Customer">
                {delivery.customerName || delivery.pickup?.name || "—"}
                {customerPhone && (
                  <>
                    {" · "}
                    <a href={`tel:${customerPhone}`} className="text-brand-primary hover:underline">
                      {customerPhone}
                    </a>
                  </>
                )}
              </KeyValue>
              {dropoffPhone && (
                <KeyValue label="Recipient">
                  <a href={`tel:${dropoffPhone}`} className="text-brand-primary hover:underline">
                    {dropoffPhone}
                  </a>
                </KeyValue>
              )}
              {(delivery.itemType || delivery.itemDetails?.type) && <KeyValue label="Item">{delivery.itemType ?? delivery.itemDetails?.type}</KeyValue>}
              <KeyValue label="Payment">{delivery.payment?.method ? humanize(delivery.payment.method) : "—"}</KeyValue>
              <KeyValue label="Fare" strong>
                {naira(delivery.fare?.totalFare)}
              </KeyValue>
              {delivery.estimatedDistanceKm ? <KeyValue label="Distance">{delivery.estimatedDistanceKm.toFixed(1)} km</KeyValue> : null}
              {delivery.estimatedDurationMin ? <KeyValue label="Duration">{delivery.estimatedDurationMin} min</KeyValue> : null}
            </div>
          </div>

          {(toPickup || inTransit) && (
            <Button
              variant="secondary"
              block
              disabled={rescueSent}
              onClick={() => {
                setRescueReason("");
                setRescueDetails("");
                setRescueError(null);
                setRescueOpen(true);
              }}
            >
              {rescueSent ? <CheckCircle2 aria-hidden className="size-4 text-emerald-600" /> : <LifeBuoy aria-hidden className="size-4" />}
              {rescueSent ? "Help requested" : "Need help"}
            </Button>
          )}
        </div>
      </div>

      <Modal
        open={!!confirmStep}
        onClose={() => !acting && setConfirmStep(null)}
        title={confirmStep === "pickup" ? "Confirm pickup" : "Confirm delivery"}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmStep(null)} disabled={acting}>
              Not yet
            </Button>
            <Button onClick={advance} loading={acting}>
              {confirmStep === "pickup" ? "Picked up" : "Delivered"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-brand-ink-secondary">
          {confirmStep === "pickup"
            ? "Only confirm once you have the package with you."
            : "Only confirm once the package is with the recipient. The customer will be asked to confirm receipt."}
        </p>
        {confirmStep === "deliver" && delivery.payment?.method === "cash" && (
          <Notice tone="warning" className="mt-3">
            Collect {naira(delivery.fare?.totalFare)} in cash before confirming.
          </Notice>
        )}
      </Modal>

      <Modal
        open={rescueOpen}
        onClose={() => !rescueBusy && setRescueOpen(false)}
        title="Request help"
        description="We'll notify your company straight away."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRescueOpen(false)} disabled={rescueBusy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={sendRescue} loading={rescueBusy}>
              Send request
            </Button>
          </>
        }
      >
        <label htmlFor="rescue-reason" className="dash-label">
          What happened?
        </label>
        <input
          id="rescue-reason"
          className="dash-input"
          maxLength={100}
          placeholder="e.g. Flat tyre, accident, breakdown"
          value={rescueReason}
          onChange={(e) => setRescueReason(e.target.value)}
        />
        <label htmlFor="rescue-details" className="dash-label mt-4">
          Details <span className="font-normal text-brand-ink-faint">(optional)</span>
        </label>
        <textarea
          id="rescue-details"
          className="dash-input min-h-20 resize-y"
          maxLength={200}
          placeholder="A landmark near you, what you need"
          value={rescueDetails}
          onChange={(e) => setRescueDetails(e.target.value)}
        />
        {!location && <p className="mt-2 text-xs text-brand-ink-faint">Your location isn&apos;t available, so it won&apos;t be included.</p>}
        {rescueError && (
          <Notice tone="danger" className="mt-3">
            {rescueError}
          </Notice>
        )}
      </Modal>
    </>
  );
}
