"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { LocateFixed, Radio } from "lucide-react";
import { EmptyState } from "@/components/dashboard/primitives";
import { RiderDeliveryRow } from "@/components/app/rider/RiderDeliveryRow";
import { Notice, Section, Spinner } from "@/components/app/ui";
import { cn } from "@/lib/utils";
import { greeting } from "@/lib/app/format";
import { useRider } from "@/lib/app/rider-runtime";
import { useSession } from "@/lib/app/session";

export default function RiderHome() {
  const user = useSession((s) => s.user);
  const { isOnline, toggling, setOnline, location, locationError, activeDeliveries, deliveriesLoaded } = useRider();
  const [confirmOffline, setConfirmOffline] = useState(false);

  const toggle = async () => {
    try {
      await setOnline(!isOnline);
      setConfirmOffline(false);
      toast.success(isOnline ? "You're offline." : "You're online. New requests will appear here.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "We couldn't update your status.");
    }
  };

  const firstName = user?.name?.split(" ")[0];
  const busy = activeDeliveries.length > 0;

  return (
    <>
      <div className="mb-6">
        <p className="text-sm text-brand-ink-muted">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </p>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">{isOnline ? "You're online" : "You're offline"}</h1>
      </div>

      <div className="mb-8 rounded-lg border border-brand-hairline p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={cn("size-2.5 rounded-full", isOnline ? "bg-emerald-500" : "bg-brand-ink-faint")} />
            <div>
              <p className="text-sm font-medium">{isOnline ? "Accepting requests" : "Not accepting requests"}</p>
              <p className="text-[13px] text-brand-ink-muted">
                {busy
                  ? "Finish your current delivery to get new requests."
                  : isOnline
                    ? "Keep this tab open — requests arrive here."
                    : "Go online to start receiving delivery requests."}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isOnline}
            aria-label={isOnline ? "Go offline" : "Go online"}
            disabled={toggling}
            onClick={() => (isOnline ? setConfirmOffline(true) : toggle())}
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-60",
              isOnline ? "bg-emerald-500" : "bg-brand-hairline",
            )}
          >
            <span className={cn("absolute top-1 size-5 rounded-full bg-white shadow transition-[left]", isOnline ? "left-6" : "left-1")} />
          </button>
        </div>

        {confirmOffline && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-brand-canvas-soft px-3 py-2.5 text-sm">
            <span>Stop receiving requests?</span>
            <span className="flex gap-2">
              <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm" onClick={() => setConfirmOffline(false)}>
                Stay online
              </button>
              <button type="button" className="dash-btn dash-btn-primary dash-btn-sm" onClick={toggle} disabled={toggling}>
                Go offline
              </button>
            </span>
          </div>
        )}

        {isOnline && (
          <div className="mt-4 flex items-center gap-2 border-t border-brand-hairline pt-4 text-[13px] text-brand-ink-muted">
            {locationError ? null : location ? (
              <>
                <LocateFixed aria-hidden className="size-4 text-emerald-600" />
                Sharing your location{location.accuracy ? ` (±${Math.round(location.accuracy)} m)` : ""}
              </>
            ) : (
              <>
                <Spinner /> Finding your location
              </>
            )}
            {!busy && location && !locationError && (
              <span className="ml-auto inline-flex items-center gap-1.5">
                <Radio aria-hidden className="size-4 text-brand-primary" />
                Looking for requests
              </span>
            )}
          </div>
        )}
        {isOnline && locationError && (
          <Notice tone="warning" className="mt-4">
            {locationError}
          </Notice>
        )}
      </div>

      <Section
        title="Current deliveries"
        action={
          <Link href="/app/rider/jobs" className="text-[13px] font-medium text-brand-primary hover:underline">
            All jobs
          </Link>
        }
      >
        {!deliveriesLoaded ? (
          <div className="dash-skeleton h-20 rounded-lg" />
        ) : activeDeliveries.length === 0 ? (
          <div className="rounded-lg border border-brand-hairline">
            <EmptyState
              title={isOnline ? "No active deliveries" : "You're offline"}
              description={isOnline ? "Accepted requests will show up here." : "Go online above to start receiving requests."}
            />
          </div>
        ) : (
          <ul className="divide-y divide-brand-hairline overflow-hidden rounded-lg border border-brand-hairline">
            {activeDeliveries.map((d) => (
              <RiderDeliveryRow key={d._id} d={d} />
            ))}
          </ul>
        )}
      </Section>

      <p className="text-xs text-brand-ink-faint">
        Browsers slow down background tabs. For the most reliable alerts while riding, install Riderr on your phone or keep this tab in front.
      </p>
    </>
  );
}
