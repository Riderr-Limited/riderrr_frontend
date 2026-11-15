import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { RouteStops } from "@/components/dashboard/primitives";
import { formatDateTime, naira, riderDeliveryStatus } from "@/lib/app/format";
import type { Delivery } from "@/lib/app/types";
import { StatusBadge } from "../ui";

export function RiderDeliveryRow({ d }: { d: Delivery }) {
  const meta = riderDeliveryStatus(d.status);
  return (
    <li className="bg-white">
      <Link href={`/app/rider/deliveries/${d._id}`} className="flex items-start gap-4 px-4 py-4 transition-colors hover:bg-brand-canvas-soft/60 sm:px-5">
        <RouteStops pickup={d.pickup?.address} dropoff={d.dropoff?.address} className="flex-1" />
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
          <span className="text-xs text-brand-ink-faint">{formatDateTime(d.createdAt)}</span>
          {d.fare?.totalFare ? <span className="text-sm font-medium tabular-nums">{naira(d.fare.totalFare)}</span> : null}
        </div>
        <ChevronRight aria-hidden className="mt-0.5 hidden size-4 shrink-0 text-brand-ink-faint sm:block" />
      </Link>
    </li>
  );
}
