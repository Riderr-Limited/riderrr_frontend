"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/primitives";
import { ListState } from "@/components/app/ListState";
import { RiderDeliveryRow } from "@/components/app/rider/RiderDeliveryRow";
import { RiderErrandList } from "@/components/app/rider/RiderErrandList";
import { Segmented, StatusBadge } from "@/components/app/ui";
import { cn } from "@/lib/utils";
import { naira, podStatus } from "@/lib/app/format";
import { useInterval, useQueryParam, useResource } from "@/lib/app/hooks";
import { useRider } from "@/lib/app/rider-runtime";
import { errands, pod } from "@/lib/app/services";

type Tab = "deliveries" | "errands" | "pod";

const ERRAND_ACTIVE = ["RIDER_ASSIGNED", "ACCEPTED", "IN_PROGRESS", "AT_PICKUP", "AWAITING_CONFIRMATION"];
const POD_ACTIVE = ["OUT_FOR_DELIVERY", "AWAITING_CUSTOMER"];
const POD_DONE = ["DELIVERED_PAID", "REJECTED_RETURN", "SETTLED"];

export default function RiderJobsPage() {
  const requested = useQueryParam("tab");
  const [chosen, setTab] = useState<Tab | null>(null);
  const tab: Tab = chosen ?? (requested === "errands" || requested === "pod" ? requested : "deliveries");
  const [sub, setSub] = useState<"active" | "done">("active");
  const { allDeliveries, deliveriesLoaded, refreshDeliveries } = useRider();

  useEffect(() => {
    refreshDeliveries();
  }, [refreshDeliveries]);

  const errandsRes = useResource(errands.list, { enabled: tab === "errands" });
  const podRes = useResource(pod.list, { enabled: tab === "pod" });

  const hasActiveErrand = (errandsRes.data ?? []).some((e) => ERRAND_ACTIVE.includes(e.status));
  useInterval(() => {
    if (document.visibilityState === "visible") errandsRes.reload(true);
  }, tab === "errands" && hasActiveErrand ? 12000 : null);

  const changeTab = (t: Tab) => {
    setTab(t);
    setSub("active");
    window.history.replaceState(null, "", `/app/rider/jobs?tab=${t}`);
  };

  const deliveries = allDeliveries.filter((d) =>
    sub === "active" ? ["created", "assigned", "picked_up", "rescue_requested"].includes(d.status) : ["delivered", "completed"].includes(d.status),
  );
  const errandList = (errandsRes.data ?? []).filter((e) => (sub === "active" ? ERRAND_ACTIVE.includes(e.status) : !ERRAND_ACTIVE.includes(e.status)));
  const podList = (podRes.data ?? []).filter((o) => (sub === "active" ? POD_ACTIVE.includes(o.status) : POD_DONE.includes(o.status)));

  return (
    <>
      <PageHeader title="Jobs" description="Deliveries, errands and pay-on-delivery orders assigned to you." />
      <Segmented
        label="Job type"
        value={tab}
        onChange={changeTab}
        className="mb-5"
        options={[
          { value: "deliveries", label: "Deliveries" },
          { value: "errands", label: "Errands" },
          { value: "pod", label: "Pay on delivery" },
        ]}
      />

      <div role="tablist" aria-label="Job status" className="mb-4 flex gap-5 border-b border-brand-hairline text-sm">
        {(
          [
            ["active", "Ongoing"],
            ["done", "Completed"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={sub === key}
            onClick={() => setSub(key)}
            className={cn(
              "-mb-px border-b-2 pb-2.5",
              sub === key ? "border-brand-primary font-medium text-brand-ink" : "border-transparent text-brand-ink-muted hover:text-brand-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "deliveries" && (
        <ListState
          loading={!deliveriesLoaded}
          error={null}
          onRetry={refreshDeliveries}
          empty={deliveries.length === 0}
          emptyTitle={sub === "active" ? "No ongoing deliveries" : "No completed deliveries"}
          emptyBody={sub === "active" ? "Go online from Home to receive requests." : undefined}
        >
          <ul className="divide-y divide-brand-hairline overflow-hidden rounded-lg border border-brand-hairline">
            {deliveries.map((d) => (
              <RiderDeliveryRow key={d._id} d={d} />
            ))}
          </ul>
        </ListState>
      )}

      {tab === "errands" && (
        <ListState
          loading={errandsRes.loading && !errandsRes.data}
          error={!errandsRes.data ? errandsRes.error : null}
          onRetry={() => errandsRes.reload()}
          empty={errandList.length === 0}
          emptyTitle={sub === "active" ? "No ongoing errands" : "No completed errands"}
          emptyBody={sub === "active" ? "Errands your company assigns to you appear here." : undefined}
        >
          <RiderErrandList items={errandList} onChanged={() => errandsRes.reload(true)} />
        </ListState>
      )}

      {tab === "pod" && (
        <ListState
          loading={podRes.loading && !podRes.data}
          error={!podRes.data ? podRes.error : null}
          onRetry={() => podRes.reload()}
          empty={podList.length === 0}
          emptyTitle={sub === "active" ? "No active orders" : "No completed orders"}
        >
          <ul className="divide-y divide-brand-hairline overflow-hidden rounded-lg border border-brand-hairline">
            {podList.map((o) => {
              const meta = podStatus(o.status);
              return (
                <li key={o._id}>
                  <Link href={`/app/rider/pod/${o._id}`} className="flex items-center gap-4 px-4 py-4 hover:bg-brand-canvas-soft/60 sm:px-5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{o.product?.name}</p>
                      <p className="mt-0.5 truncate text-[13px] text-brand-ink-muted">{o.dropoff?.address}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                      <span className="text-sm font-medium tabular-nums">{naira(o.amountToCollect)}</span>
                    </div>
                    <ChevronRight aria-hidden className="size-4 shrink-0 text-brand-ink-faint" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </ListState>
      )}
    </>
  );
}
