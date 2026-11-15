"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Banknote, Bike, Clock, Landmark, Navigation } from "lucide-react";
import { RouteStops } from "@/components/dashboard/primitives";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/lib/app/api";
import { PHONE_HINT, isValidNigerianPhone, naira, normalizeNigerianPhone } from "@/lib/app/format";
import { getCurrentPosition, reverseGeocode } from "@/lib/app/maps";
import { deliveries } from "@/lib/app/services";
import { useSession } from "@/lib/app/session";
import type { FareQuote, Place } from "@/lib/app/types";
import { Button, Notice, Spinner, Stepper } from "../ui";
import { PlaceInput } from "../PlaceInput";
import { RouteMap } from "../RouteMap";
import { BankTransferPanel } from "./BankTransfer";

const STEPS = ["Route", "Details", "Payment"];

type Quote = FareQuote & { drivers: number; eta: string };

export function DeliveryFlow() {
  const router = useRouter();
  const user = useSession((s) => s.user);
  const [step, setStep] = useState(0);
  const [pickup, setPickup] = useState<Place | null>(null);
  const [dropoff, setDropoff] = useState<Place | null>(null);
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const [recent, setRecent] = useState<Place[]>([]);
  const [phone, setPhone] = useState("");
  const [item, setItem] = useState("");
  const [method, setMethod] = useState<"transfer" | "cash">("transfer");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteState, setQuoteState] = useState<"idle" | "loading" | "error">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingPayment, setAwaitingPayment] = useState<string | null>(null);

  // Recent addresses from past deliveries, like the mobile app's "Recent" list.
  useEffect(() => {
    deliveries
      .mine()
      .then((list) => {
        const seen = new Map<string, Place>();
        for (const d of list) {
          for (const s of [d.dropoff, d.pickup]) {
            if (s?.address && s.lat && !seen.has(s.address)) seen.set(s.address, { address: s.address, lat: s.lat, lng: s.lng });
          }
        }
        setRecent(Array.from(seen.values()).slice(0, 8));
      })
      .catch(() => {});
  }, []);

  // Pre-fill pickup with the current location when the browser already allows it.
  useEffect(() => {
    navigator.permissions
      ?.query({ name: "geolocation" as PermissionName })
      .then(async (p) => {
        if (p.state !== "granted") return;
        const pos = await getCurrentPosition();
        setMe({ lat: pos.lat, lng: pos.lng });
        const geo = await reverseGeocode(pos.lat, pos.lng);
        setPickup((current) => current ?? { address: geo?.address ?? "Current location", lat: pos.lat, lng: pos.lng });
      })
      .catch(() => {});
  }, []);

  const loadQuote = async () => {
    if (!pickup || !dropoff) return;
    setQuoteState("loading");
    setQuote(null);
    try {
      const [q, drivers] = await Promise.all([
        deliveries.quote({
          pickupLat: pickup.lat,
          pickupLng: pickup.lng,
          dropoffLat: dropoff.lat,
          dropoffLng: dropoff.lng,
          itemType: item.trim(),
          itemWeight: 2,
        }),
        deliveries.nearbyDrivers(pickup.lat, pickup.lng).catch(() => null),
      ]);
      if (!q.success) throw new Error();
      setQuote({
        ...q.data,
        drivers: drivers?.data?.summary?.total ?? 0,
        eta: drivers?.data?.summary?.closestDriver?.eta?.text ?? "",
      });
      setQuoteState("idle");
    } catch {
      setQuoteState("error");
    }
  };

  const next = () => {
    setError(null);
    if (step === 0) {
      if (!pickup || !dropoff) return setError("Choose both a pickup and a drop-off address from the suggestions.");
      if (pickup.address === dropoff.address) return setError("Pickup and drop-off can't be the same place.");
      setStep(1);
    } else if (step === 1) {
      if (!isValidNigerianPhone(phone)) return setError(`Recipient's phone: ${PHONE_HINT}`);
      if (!item.trim()) return setError("Describe what you're sending.");
      setStep(2);
      loadQuote();
    }
  };

  const total = quote?.fare?.totalFare ?? 0;

  const submit = async () => {
    if (!pickup || !dropoff || !user) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await deliveries.request({
        pickupAddress: pickup.address,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        pickupName: user.name ?? "",
        pickupPhone: user.phone ?? "",
        dropoffAddress: dropoff.address,
        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,
        recipientName: user.name ?? "",
        recipientPhone: normalizeNigerianPhone(phone),
        companyId: user.companyId ?? undefined,
        itemWeight: 2,
        itemValue: 5000,
        itemType: item.trim(),
        paymentMethod: method,
        quoteId: quote?.quoteId,
        expectedFare: total,
      });
      const { delivery, requiresPayment, payment } = res.data ?? ({} as typeof res.data);
      if (!delivery?._id) throw new Error(res.message || "We couldn't create your delivery.");
      if (requiresPayment && payment?.nextAction === "show_bank_details") {
        setAwaitingPayment(delivery._id);
      } else if (requiresPayment) {
        throw new Error("Payment couldn't be started. Please try again.");
      } else {
        router.push(`/app/deliveries/${delivery._id}`);
      }
    } catch (e) {
      setError(errorMessage(e, "We couldn't send your request."));
    } finally {
      setSubmitting(false);
    }
  };

  const summary = useMemo(
    () => (
      <div className="rounded-lg border border-brand-hairline p-4">
        <RouteStops pickup={pickup?.address} dropoff={dropoff?.address} />
        {step >= 2 && (
          <p className="mt-3 border-t border-brand-hairline pt-3 text-sm text-brand-ink-muted">
            {item} · to {phone}
          </p>
        )}
      </div>
    ),
    [pickup, dropoff, step, item, phone],
  );

  if (awaitingPayment) {
    return (
      <div className="mx-auto max-w-md">
        <h2 className="text-lg font-semibold">Pay by bank transfer</h2>
        <p className="mt-1 mb-5 text-sm text-brand-ink-muted">
          Your request is saved. We start looking for a rider as soon as your transfer arrives.
        </p>
        <BankTransferPanel
          deliveryId={awaitingPayment}
          fallbackAmount={total}
          onPaid={() => router.push(`/app/deliveries/${awaitingPayment}`)}
        />
        <button
          type="button"
          className="mt-4 w-full text-center text-sm text-brand-ink-muted hover:text-brand-ink"
          onClick={() => router.push(`/app/deliveries/${awaitingPayment}`)}
        >
          I&apos;ll pay later
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <div>
        <Stepper steps={STEPS} current={step} />

        {step === 0 && (
          <div className="space-y-4">
            <PlaceInput label="Pickup" marker="pickup" value={pickup} onChange={setPickup} placeholder="Where should the rider collect it?" bias={me} recent={recent} />
            <PlaceInput label="Drop-off" marker="dropoff" value={dropoff} onChange={setDropoff} placeholder="Where is it going?" bias={me ?? pickup} recent={recent} />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {summary}
            <div>
              <label htmlFor="recipient-phone" className="dash-label">
                Recipient&apos;s phone
              </label>
              <div className="flex gap-2">
                <input
                  id="recipient-phone"
                  type="tel"
                  autoComplete="tel"
                  className="dash-input h-11"
                  placeholder="08012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {user?.phone && (
                  <Button variant="secondary" className="h-11" onClick={() => setPhone(user.phone ?? "")}>
                    Use mine
                  </Button>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="item" className="dash-label">
                What are you sending?
              </label>
              <input
                id="item"
                className="dash-input h-11"
                placeholder="e.g. Documents, a phone, clothes"
                value={item}
                maxLength={100}
                onChange={(e) => setItem(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="rounded-lg border border-brand-hairline p-5">
              {quoteState === "loading" ? (
                <div className="flex items-center gap-2 text-sm text-brand-ink-muted">
                  <Spinner /> Calculating your fare
                </div>
              ) : quoteState === "error" ? (
                <div>
                  <p className="text-sm font-medium text-red-700">Delivery isn&apos;t available for this route yet.</p>
                  <button type="button" onClick={loadQuote} className="mt-1 text-sm text-brand-primary hover:underline">
                    Try again
                  </button>
                </div>
              ) : quote ? (
                <>
                  <p className="text-[13px] text-brand-ink-muted">Estimated fare</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{quote.fare?.formatted ?? naira(total)}</p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-brand-ink-muted">
                    {quote.distance?.formatted && (
                      <span className="inline-flex items-center gap-1.5">
                        <Navigation aria-hidden className="size-3.5" />
                        {quote.distance.formatted}
                      </span>
                    )}
                    {quote.estimatedDuration?.formatted && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock aria-hidden className="size-3.5" />
                        {quote.estimatedDuration.formatted}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Bike aria-hidden className="size-3.5" />
                      {quote.drivers > 0
                        ? `${quote.drivers} rider${quote.drivers === 1 ? "" : "s"} nearby${quote.eta ? ` · ${quote.eta}` : ""}`
                        : "No riders nearby yet — your request will be queued"}
                    </span>
                  </div>
                </>
              ) : null}
            </div>

            <fieldset>
              <legend className="dash-label">Payment method</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    { id: "transfer", label: "Bank transfer", hint: "Pay now, held until delivery", icon: Landmark },
                    { id: "cash", label: "Cash on delivery", hint: "Pay the rider in cash", icon: Banknote },
                  ] as const
                ).map((m) => (
                  <label
                    key={m.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 text-sm transition-colors",
                      method === m.id ? "border-brand-primary bg-brand-primary/[0.04]" : "border-brand-hairline hover:bg-brand-canvas-soft/60",
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={method === m.id}
                      onChange={() => setMethod(m.id)}
                      className="mt-0.5 accent-brand-primary"
                    />
                    <span>
                      <span className="flex items-center gap-1.5 font-medium text-brand-ink">
                        <m.icon aria-hidden className="size-4 text-brand-ink-muted" />
                        {m.label}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-brand-ink-muted">{m.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {summary}
          </div>
        )}

        {error && (
          <Notice tone="danger" className="mt-4">
            {error}
          </Notice>
        )}

        <div className="mt-6 flex gap-2">
          {step > 0 && (
            <Button variant="secondary" size="lg" onClick={() => { setError(null); setStep((s) => s - 1); }} disabled={submitting}>
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button size="lg" className="flex-1" onClick={next}>
              Continue
            </Button>
          ) : (
            <Button
              size="lg"
              className="flex-1"
              onClick={submit}
              loading={submitting}
              disabled={quoteState !== "idle" || !quote}
            >
              {quote ? `Request rider · ${quote.fare?.formatted ?? naira(total)}` : "Request rider"}
            </Button>
          )}
        </div>
      </div>

      <RouteMap pickup={pickup} dropoff={dropoff} className="hidden h-[420px] rounded-lg border border-brand-hairline lg:block" />
    </div>
  );
}
