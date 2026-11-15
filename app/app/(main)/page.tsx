"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Banknote, ClipboardList, MapPin, Package } from "lucide-react";
import { EmptyState } from "@/components/dashboard/primitives";
import { DeliveryList } from "@/components/app/customer/DeliveryList";
import { useMyDeliveries } from "@/components/app/customer/useMyDeliveries";
import { Notice, Section } from "@/components/app/ui";
import { DELIVERY_DONE, greeting, isDeliveryActive } from "@/lib/app/format";
import { getCurrentPosition, reverseGeocode } from "@/lib/app/maps";
import { useSession } from "@/lib/app/session";

const SERVICES = [
  {
    type: "delivery",
    title: "Send a package",
    body: "Upfront fare, a nearby rider and live tracking.",
    icon: Package,
  },
  {
    type: "errand",
    title: "Run an errand",
    body: "Have a rider buy, collect or drop something off.",
    icon: ClipboardList,
  },
  {
    type: "pod",
    title: "Pay on delivery",
    body: "Order from a merchant and pay when it arrives.",
    icon: Banknote,
  },
] as const;

export default function CustomerHome() {
  const user = useSession((s) => s.user);
  const { data, loading, error, reload } = useMyDeliveries();
  const [area, setArea] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const locate = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      const geo = await reverseGeocode(pos.lat, pos.lng);
      setArea(geo?.area ?? "Location found");
    } catch {
      setArea(null);
    } finally {
      setLocating(false);
    }
  };

  // Only look the location up silently when the browser already allows it.
  useEffect(() => {
    navigator.permissions
      ?.query({ name: "geolocation" as PermissionName })
      .then((p) => {
        if (p.state === "granted") locate();
      })
      .catch(() => {});
  }, []);

  const list = useMemo(() => data ?? [], [data]);
  const ongoing = list.filter((d) => isDeliveryActive(d.status) || d.status === "delivered");
  const shown = (ongoing.length ? ongoing : list.filter((d) => DELIVERY_DONE.includes(d.status))).slice(0, 3);
  const firstName = user?.name?.split(" ")[0];

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-brand-ink-muted">{greeting()}{firstName ? `, ${firstName}` : ""}</p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">What are you sending today?</h1>
        </div>
        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className="inline-flex h-8 w-fit items-center gap-1.5 rounded-md border border-brand-hairline px-2.5 text-[13px] text-brand-ink-secondary hover:bg-brand-canvas-soft"
        >
          <MapPin aria-hidden className="size-3.5 text-brand-primary" />
          {locating ? "Finding you…" : area ?? "Use my location"}
        </button>
      </div>

      <Link
        href="/app/send"
        className="mb-4 flex h-12 items-center gap-3 rounded-lg border border-brand-hairline bg-white px-4 text-sm text-brand-ink-faint shadow-soft transition-colors hover:border-brand-primary/40"
      >
        <MapPin aria-hidden className="size-4 text-brand-primary" />
        <span className="flex-1">Where should we deliver to?</span>
        <span className="inline-flex size-7 items-center justify-center rounded-md bg-brand-primary text-white">
          <ArrowRight aria-hidden className="size-4" />
        </span>
      </Link>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {SERVICES.map((s) => (
          <Link
            key={s.type}
            href={`/app/send?type=${s.type}`}
            className="group rounded-lg border border-brand-hairline p-4 transition-colors hover:bg-brand-canvas-soft/60"
          >
            <s.icon aria-hidden className="size-5 text-brand-primary" />
            <p className="mt-3 text-sm font-medium text-brand-ink">{s.title}</p>
            <p className="mt-0.5 text-[13px] leading-5 text-brand-ink-muted">{s.body}</p>
          </Link>
        ))}
      </div>

      <Section
        title={ongoing.length ? "Ongoing" : "Recent deliveries"}
        action={
          <Link href="/app/deliveries" className="text-[13px] font-medium text-brand-primary hover:underline">
            View all
          </Link>
        }
      >
        {loading && !data ? (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="dash-skeleton h-20 rounded-lg" />
            ))}
          </div>
        ) : error && !data ? (
          <Notice tone="danger">
            {error}{" "}
            <button type="button" className="font-medium underline" onClick={() => reload()}>
              Retry
            </button>
          </Notice>
        ) : shown.length === 0 ? (
          <div className="rounded-lg border border-brand-hairline">
            <EmptyState title="No deliveries yet" description="Send your first package and it will show up here." />
          </div>
        ) : (
          <DeliveryList items={shown} onChanged={() => reload(true)} />
        )}
      </Section>
    </>
  );
}
