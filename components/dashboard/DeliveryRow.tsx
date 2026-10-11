import { RouteStops } from "@/components/dashboard/primitives";
import { StatusBadge } from "@/components/ui/status-badge";

interface DeliveryRowProps {
  pickup: string;
  dropoff: string;
  rider?: string;
  amount: string;
  status: string;
  onView: () => void;
}

export function DeliveryRow({
  pickup,
  dropoff,
  rider,
  amount,
  status,
  onView,
}: DeliveryRowProps) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_160px_150px_auto] md:items-center">
      <RouteStops pickup={pickup} dropoff={dropoff} className="col-span-2 md:col-span-1" />

      <div className="min-w-0">
        <p className="dash-eyebrow">Rider</p>
        <p
          className={`mt-0.5 truncate text-sm ${
            rider ? "text-brand-ink" : "text-brand-ink-faint"
          }`}
        >
          {rider || "Not assigned"}
        </p>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-brand-ink tabular-nums">{amount}</p>
        <StatusBadge status={status} className="mt-1" />
      </div>

      <button
        onClick={onView}
        className="dash-btn dash-btn-sm dash-btn-secondary col-span-2 md:col-span-1"
      >
        Details
      </button>
    </div>
  );
}

export function DeliveryRowSkeleton() {
  return (
    <div className="space-y-2.5 px-5 py-4">
      <div className="dash-skeleton h-3.5 w-3/5" />
      <div className="dash-skeleton h-3.5 w-2/5" />
    </div>
  );
}
