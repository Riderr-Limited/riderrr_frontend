"use client";

import { EmptyState, PageHeader, Stat, StatStrip } from "@/components/dashboard/primitives";
import { BackLink } from "@/components/app/BackLink";
import { Notice } from "@/components/app/ui";
import { formatDate, naira } from "@/lib/app/format";
import { useResource } from "@/lib/app/hooks";
import { rider } from "@/lib/app/services";

export default function EarningsPage() {
  const { data, loading, error, reload } = useResource(rider.earnings);
  const summary = data?.summary ?? { totalEarnings: 0, totalDeliveries: 0, totalTips: 0, averageRating: 0 };
  const days = data?.dailyEarnings ?? [];

  return (
    <>
      <BackLink href="/app/profile" label="Profile" />
      <PageHeader title="Earnings" description="Paid weekly, every Monday, for the previous week." />

      {error && !data && (
        <Notice tone="danger" className="mb-5">
          {error}{" "}
          <button type="button" className="font-medium underline" onClick={() => reload()}>
            Retry
          </button>
        </Notice>
      )}

      <StatStrip className="mb-8 grid-cols-2 lg:grid-cols-4">
        <Stat label="Total earnings" value={naira(summary.totalEarnings)} loading={loading && !data} />
        <Stat label="Deliveries" value={summary.totalDeliveries ?? 0} loading={loading && !data} />
        <Stat label="Tips" value={naira(summary.totalTips)} loading={loading && !data} />
        <Stat label="Rating" value={summary.averageRating ? Number(summary.averageRating).toFixed(1) : "—"} loading={loading && !data} />
      </StatStrip>

      <h2 className="mb-3 text-sm font-semibold">Recent earnings</h2>
      {loading && !data ? (
        <div className="dash-skeleton h-40 rounded-lg" />
      ) : days.length === 0 ? (
        <div className="rounded-lg border border-brand-hairline">
          <EmptyState title="No earnings yet" description="Completed deliveries will show up here by day." />
        </div>
      ) : (
        <ul className="divide-y divide-brand-hairline overflow-hidden rounded-lg border border-brand-hairline">
          {days.map((d) => {
            const count = d.deliveries ?? d.count;
            return (
              <li key={d._id} className="flex items-center justify-between gap-4 px-4 py-3.5 text-sm">
                <span>
                  <span className="block">{formatDate(d._id) || d._id}</span>
                  {typeof count === "number" && (
                    <span className="block text-[13px] text-brand-ink-muted">
                      {count} deliver{count === 1 ? "y" : "ies"}
                    </span>
                  )}
                </span>
                <span className="font-medium tabular-nums">{naira(d.earnings)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
