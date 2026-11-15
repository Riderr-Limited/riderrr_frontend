"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/primitives";
import { ListState } from "@/components/app/ListState";
import { DeliveryList } from "@/components/app/customer/DeliveryList";
import { ErrandList } from "@/components/app/customer/ErrandList";
import { PodList } from "@/components/app/customer/PodList";
import { useMyDeliveries } from "@/components/app/customer/useMyDeliveries";
import { Segmented } from "@/components/app/ui";
import { ERRAND_ACTIVE, POD_ACTIVE, isDeliveryActive } from "@/lib/app/format";
import { useQueryParam, useResource } from "@/lib/app/hooks";
import { errands, pod } from "@/lib/app/services";

type Tab = "deliveries" | "errands" | "pod";
type DeliveryFilter = "active" | "done" | "cancelled";

export default function DeliveriesPage() {
  const requested = useQueryParam("tab");
  const [chosen, setTab] = useState<Tab | null>(null);
  const tab: Tab = chosen ?? (requested === "errands" || requested === "pod" ? requested : "deliveries");
  const [filter, setFilter] = useState<DeliveryFilter>("active");

  const changeTab = (t: Tab) => {
    setTab(t);
    window.history.replaceState(null, "", `/app/deliveries?tab=${t}`);
  };

  const deliveriesRes = useMyDeliveries();
  const errandsRes = useResource(errands.list, { enabled: tab === "errands" });
  const podRes = useResource(pod.list, { enabled: tab === "pod" });

  const errandActive = (errandsRes.data ?? []).some((e) => ERRAND_ACTIVE.includes(e.status));
  const podActive = (podRes.data ?? []).some((o) => POD_ACTIVE.includes(o.status));
  const reloadErrands = errandsRes.reload;
  const reloadPod = podRes.reload;
  // Same 12s refresh the mobile app uses while an errand or order is in motion.
  useEffect(() => {
    if (!(tab === "errands" && errandActive) && !(tab === "pod" && podActive)) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (tab === "errands") reloadErrands(true);
      else reloadPod(true);
    }, 12000);
    return () => window.clearInterval(id);
  }, [tab, errandActive, podActive, reloadErrands, reloadPod]);

  const all = deliveriesRes.data ?? [];
  const groups = {
    active: all.filter((d) => isDeliveryActive(d.status) || d.status === "delivered"),
    done: all.filter((d) => d.status === "completed"),
    cancelled: all.filter((d) => d.status === "cancelled" || d.status === "failed"),
  };

  const newHref = tab === "errands" ? "/app/send?type=errand" : tab === "pod" ? "/app/send?type=pod" : "/app/send";
  const newLabel = tab === "errands" ? "New errand" : tab === "pod" ? "New order" : "New delivery";

  return (
    <>
      <PageHeader title="Deliveries" description="Track and manage everything you've sent.">
        <Link href={newHref} className="dash-btn dash-btn-primary">
          <Plus aria-hidden className="size-4" />
          {newLabel}
        </Link>
      </PageHeader>

      <Segmented
        label="Request type"
        value={tab}
        onChange={changeTab}
        className="mb-5"
        options={[
          { value: "deliveries", label: "Deliveries" },
          { value: "errands", label: "Errands" },
          { value: "pod", label: "Pay on delivery" },
        ]}
      />

      {tab === "deliveries" && (
        <>
          <div role="tablist" aria-label="Delivery status" className="mb-4 flex gap-5 border-b border-brand-hairline text-sm">
            {(
              [
                ["active", "In progress"],
                ["done", "Completed"],
                ["cancelled", "Cancelled"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                onClick={() => setFilter(key)}
                className={
                  filter === key
                    ? "-mb-px border-b-2 border-brand-primary pb-2.5 font-medium text-brand-ink"
                    : "-mb-px border-b-2 border-transparent pb-2.5 text-brand-ink-muted hover:text-brand-ink"
                }
              >
                {label}
                {groups[key].length > 0 && <span className="ml-1.5 text-xs text-brand-ink-faint tabular-nums">{groups[key].length}</span>}
              </button>
            ))}
          </div>
          <ListState
            loading={deliveriesRes.loading && !deliveriesRes.data}
            error={!deliveriesRes.data ? deliveriesRes.error : null}
            onRetry={() => deliveriesRes.reload()}
            empty={groups[filter].length === 0}
            emptyTitle={filter === "active" ? "Nothing in progress" : filter === "done" ? "No completed deliveries" : "No cancelled deliveries"}
            emptyBody={filter === "active" ? "Deliveries you send will appear here while they're on the way." : undefined}
          >
            <DeliveryList items={groups[filter]} onChanged={() => deliveriesRes.reload(true)} />
          </ListState>
        </>
      )}

      {tab === "errands" && (
        <ListState
          loading={errandsRes.loading && !errandsRes.data}
          error={!errandsRes.data ? errandsRes.error : null}
          onRetry={() => errandsRes.reload()}
          empty={(errandsRes.data ?? []).length === 0}
          emptyTitle="No errands yet"
          emptyBody="Send a rider on an errand and track it here."
        >
          <ErrandList items={errandsRes.data ?? []} onChanged={() => errandsRes.reload(true)} />
        </ListState>
      )}

      {tab === "pod" && (
        <ListState
          loading={podRes.loading && !podRes.data}
          error={!podRes.data ? podRes.error : null}
          onRetry={() => podRes.reload()}
          empty={(podRes.data ?? []).length === 0}
          emptyTitle="No orders yet"
          emptyBody="Place a pay-on-delivery order and track it here."
        >
          <PodList items={podRes.data ?? []} onChanged={() => podRes.reload(true)} />
        </ListState>
      )}
    </>
  );
}
