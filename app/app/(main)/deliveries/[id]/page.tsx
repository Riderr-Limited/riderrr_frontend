"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MessageSquare, Phone, RefreshCw, Star } from "lucide-react";
import { toast } from "sonner";
import { RouteStops } from "@/components/dashboard/primitives";
import { BankTransferModal } from "@/components/app/customer/BankTransfer";
import { ConfirmReceiptModal } from "@/components/app/customer/ConfirmReceiptModal";
import { RouteMap } from "@/components/app/RouteMap";
import { Button, KeyValue, Notice, PageLoader, ReasonModal, Spinner, StatusBadge } from "@/components/app/ui";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/lib/app/api";
import { deliveryStatus, formatDateTime, humanize, initials, isPaymentSettled, naira, shortRef } from "@/lib/app/format";
import { useInterval } from "@/lib/app/hooks";
import { deliveries } from "@/lib/app/services";
import type { Delivery } from "@/lib/app/types";

const STEPS = [
  { key: "created", label: "Confirmed" },
  { key: "assigned", label: "Rider assigned" },
  { key: "picked_up", label: "Picked up" },
  { key: "delivered", label: "Delivered" },
];

function stepIndex(status: string) {
  if (status === "completed") return 3;
  if (status === "rescue_requested") return 2;
  const i = STEPS.findIndex((s) => s.key === status);
  return i < 0 ? 0 : i;
}

const RETRY_SEARCH_MS = 30000;

export default function TrackDeliveryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const [retrying, setRetrying] = useState(false);
  const lastStatus = useRef<string | null>(null);

  const load = async (spinner = false) => {
    if (spinner) setRefreshing(true);
    try {
      let d: Delivery | null = null;
      try {
        d = await deliveries.get(id);
      } catch (e) {
        // Fall back to the active-delivery endpoint the mobile "finding a rider" screen uses.
        const active = await deliveries.customerActive().catch(() => null);
        if (active?._id === id) d = active;
        else throw e;
      }
      if (d) {
        if (lastStatus.current === "created" && d.status === "assigned") toast.success("A rider accepted your delivery.");
        lastStatus.current = d.status;
        setDelivery(d);
        setLoadError(null);
      }
    } catch (e) {
      if (!delivery) setLoadError(errorMessage(e, "We couldn't load this delivery."));
    } finally {
      if (spinner) setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const status = delivery?.status ?? "";
  const live = ["created", "assigned", "picked_up", "rescue_requested", "delivered"].includes(status);
  useInterval(() => {
    if (document.visibilityState === "visible") load();
  }, live ? 5000 : null);

  // While nobody has accepted, widen the search every 30 seconds, as the app does.
  useEffect(() => {
    if (status !== "created") return;
    const t = window.setTimeout(async () => {
      setRetrying(true);
      try {
        await deliveries.retrySearch(id);
        setAttempt((a) => a + 1);
      } catch {
        // Next poll will try again.
      } finally {
        setRetrying(false);
      }
    }, RETRY_SEARCH_MS);
    return () => window.clearTimeout(t);
  }, [status, attempt, id]);

  if (loadError && !delivery) {
    return (
      <div className="mx-auto max-w-md py-10">
        <Notice tone="danger">
          {loadError}{" "}
          <button type="button" className="font-medium underline" onClick={() => load(true)}>
            Retry
          </button>
        </Notice>
        <Link href="/app/deliveries" className="mt-4 inline-block text-sm text-brand-primary hover:underline">
          Back to deliveries
        </Link>
      </div>
    );
  }

  if (!delivery) return <PageLoader label="Loading your delivery" />;

  const meta = deliveryStatus(status);
  const idx = stepIndex(status);
  const driver = delivery.driverDetails;
  const hasRider = !!driver?.name && status !== "created";
  const unpaid = !isPaymentSettled(delivery);
  const canCancel = ["created", "assigned", "picked_up", "rescue_requested"].includes(status);
  const finished = status === "completed" || status === "cancelled";
  const eta = delivery.estimatedDurationMin || delivery.estimatedTime;

  return (
    <>
      <div className="mb-5 flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className="dash-icon-btn -ml-1.5" aria-label="Back">
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold tracking-tight">{finished ? "Delivery details" : "Track delivery"}</h1>
          <p className="text-[13px] text-brand-ink-muted">Order #{shortRef(delivery._id)} · {formatDateTime(delivery.createdAt)}</p>
        </div>
        {!finished && (
          <button type="button" onClick={() => load(true)} disabled={refreshing} className="dash-icon-btn" aria-label="Refresh status">
            {refreshing ? <Spinner /> : <RefreshCw className="size-4" />}
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="relative">
          <RouteMap
            pickup={delivery.pickup}
            dropoff={delivery.dropoff}
            rider={driver?.currentLocation}
            className="h-64 rounded-lg border border-brand-hairline sm:h-80 lg:h-[460px]"
          />
          <div className="absolute top-3 left-3">
            <StatusBadge tone={meta.tone} className="bg-white shadow-soft">
              {meta.label}
            </StatusBadge>
          </div>
        </div>

        <div className="space-y-5">
          {status === "created" && (
            <div className="rounded-lg border border-brand-hairline p-5">
              <div className="flex items-center gap-2">
                <Spinner className="text-brand-primary" />
                <p className="text-sm font-medium">Finding a rider near you</p>
              </div>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-brand-canvas-soft">
                <div className="h-full w-1/3 animate-[searching_1.6s_ease-in-out_infinite] rounded-full bg-brand-primary" />
              </div>
              <p className="mt-2 text-xs text-brand-ink-muted">
                {retrying ? `Widening the search (attempt ${attempt + 1})` : `Searching · attempt ${attempt}`} · usually 2–5 minutes
              </p>
              {unpaid && delivery.payment?.method === "transfer" && (
                <Notice tone="warning" className="mt-4">
                  We start matching riders once your transfer is received.{" "}
                  <button type="button" onClick={() => setPayOpen(true)} className="font-medium underline">
                    Pay now
                  </button>
                </Notice>
              )}
            </div>
          )}

          {!finished && status !== "created" && (
            <div>
              <div className="h-1 overflow-hidden rounded-full bg-brand-canvas-soft">
                <div className="h-full rounded-full bg-brand-primary transition-[width]" style={{ width: `${((idx + 1) / STEPS.length) * 100}%` }} />
              </div>
              <ol className="mt-2 grid grid-cols-4 gap-1 text-[11px] sm:text-xs">
                {STEPS.map((s, i) => (
                  <li key={s.key} className={cn(i <= idx ? "font-medium text-brand-ink" : "text-brand-ink-faint", i === 3 && "text-right", i > 0 && i < 3 && "text-center")}>
                    {s.label}
                  </li>
                ))}
              </ol>
              {eta && status !== "delivered" && (
                <p className="mt-3 text-sm text-brand-ink-muted">
                  Arriving in about <span className="font-medium text-brand-ink">{eta} min</span>
                </p>
              )}
            </div>
          )}

          {status === "rescue_requested" && (
            <Notice tone="warning">We&apos;re moving your delivery to another rider. This won&apos;t take long.</Notice>
          )}

          {hasRider && !finished && (
            <div className="rounded-lg border border-brand-hairline p-4">
              <p className="dash-eyebrow mb-3">Your rider</p>
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-canvas-soft text-sm font-medium ring-1 ring-brand-hairline ring-inset">
                  {initials(driver?.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{driver?.name}</p>
                  <p className="truncate text-[13px] text-brand-ink-muted">
                    {driver?.rating ? (
                      <span className="mr-2 inline-flex items-center gap-0.5">
                        <Star aria-hidden className="size-3 fill-amber-400 text-amber-400" />
                        {driver.rating.toFixed(1)}
                      </span>
                    ) : null}
                    {driver?.vehicle && [driver.vehicle.make, driver.vehicle.model, driver.vehicle.plateNumber].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {driver?.phone ? (
                  <a href={`tel:${driver.phone}`} className="dash-btn dash-btn-secondary">
                    <Phone aria-hidden className="size-4" />
                    Call
                  </a>
                ) : (
                  <Button variant="secondary" disabled>
                    <Phone aria-hidden className="size-4" />
                    Call
                  </Button>
                )}
                <Link
                  href={`/app/chat/${delivery._id}?name=${encodeURIComponent(driver?.name ?? "Rider")}`}
                  className="dash-btn dash-btn-secondary"
                >
                  <MessageSquare aria-hidden className="size-4" />
                  Message
                </Link>
              </div>
            </div>
          )}

          {status === "delivered" && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
              <p className="text-sm font-medium text-emerald-800">Your package has been delivered.</p>
              <p className="mt-0.5 text-[13px] text-emerald-800/80">Confirm once you have it so the rider gets paid.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => setConfirmOpen(true)}>Confirm receipt</Button>
                <Link href="/app/support/report?category=delivery%20problems" className="dash-btn dash-btn-danger-outline">
                  I didn&apos;t receive it
                </Link>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-brand-hairline p-4">
            <RouteStops pickup={delivery.pickup?.address} dropoff={delivery.dropoff?.address} />
            <div className="mt-3 divide-y divide-brand-hairline border-t border-brand-hairline">
              {(delivery.itemType || delivery.itemDetails?.type) && <KeyValue label="Item">{delivery.itemType ?? delivery.itemDetails?.type}</KeyValue>}
              {delivery.recipientPhone && <KeyValue label="Recipient">{delivery.recipientPhone}</KeyValue>}
              {delivery.fare?.totalFare ? <KeyValue label="Fare">{naira(delivery.fare.totalFare)}</KeyValue> : null}
              {delivery.payment?.method && (
                <KeyValue label="Payment">
                  {humanize(delivery.payment.method)}
                  {delivery.payment.status ? ` · ${humanize(delivery.payment.status)}` : ""}
                </KeyValue>
              )}
              <KeyValue label="Status">{meta.label}</KeyValue>
            </div>
          </div>

          {canCancel && (
            <Button variant="danger-outline" block onClick={() => setCancelOpen(true)}>
              Cancel delivery
            </Button>
          )}
        </div>
      </div>

      <ReasonModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel delivery?"
        description="This can't be undone."
        confirmLabel="Cancel delivery"
        cancelLabel="Keep delivery"
        onConfirm={async (reason) => {
          try {
            const res = await deliveries.cancel(delivery._id, reason || "Cancelled by customer");
            if (!res.success) throw new Error(res.message);
          } catch (e) {
            throw new Error(errorMessage(e, "We couldn't cancel this delivery."));
          }
          setCancelOpen(false);
          toast.success("Delivery cancelled.");
          router.replace("/app");
        }}
      />

      <ConfirmReceiptModal
        deliveryId={delivery._id}
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onDone={() => {
          setConfirmOpen(false);
          load();
        }}
      />

      <BankTransferModal
        deliveryId={delivery._id}
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onPaid={() => {
          setPayOpen(false);
          toast.success("Payment received.");
          load();
        }}
      />
    </>
  );
}
