"use client";

import { IconX, IconMapPin } from "@tabler/icons-react";
import { StatusBadge } from "@/components/ui/status-badge";

interface DeliveryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: {
    _id: string;
    referenceId: string;
    pickup: { address: string; lat: number; lng: number; name: string };
    dropoff: { address: string; lat: number; lng: number; name: string };
    status: string;
    statusDisplay?: string;
    fare: {
      amount?: number;
      totalFare?: number;
      baseFare?: number;
      distanceFare?: number;
      currency: string;
    };
    payment: { status: string; method: string };
    createdAt: string;
    updatedAt?: string;
    assignedAt?: string;
    pickedUpAt?: string;
    deliveredAt?: string;
    customerName?: string;
    recipientName?: string;
    itemDetails?: {
      type: string;
      description?: string;
      weight: number;
      value: number;
    };
    estimatedDistanceKm?: number;
    estimatedDurationMin?: number;
    driverDetails?: {
      name: string;
      phone?: string;
      rating?: number;
      vehicle?: {
        type: string;
        make: string;
        model: string;
        plateNumber: string;
      };
      currentLocation?: {
        lat: number;
        lng: number;
        updatedAt: string;
      };
    };
  };
  onViewLocation?: (lat: number, lng: number, title: string, address?: string, updatedAt?: string) => void;
}

export default function DeliveryDetailsModal({
  isOpen,
  onClose,
  delivery,
  onViewLocation,
}: DeliveryDetailsModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-brand-ink-muted">{label}</span>
      <span className="text-right text-brand-ink">{value}</span>
    </div>
  );

  const timeline = [
    { label: "Created", date: delivery.createdAt },
    { label: "Assigned", date: delivery.assignedAt },
    { label: "Picked up", date: delivery.pickedUpAt },
    { label: "Delivered", date: delivery.deliveredAt },
  ].filter((step) => step.date);

  return (
    <div className="dash-overlay">
      <div className="dash-modal max-w-2xl">
        {/* Modal Header */}
        <div className="dash-modal-header">
          <div className="min-w-0">
            <h2 className="dash-modal-title">Delivery details</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="font-mono text-[13px] text-brand-ink-muted">
                #{delivery.referenceId}
              </span>
              <StatusBadge status={delivery.status} />
              {delivery.payment.method.toLowerCase() !== "cash" && (
                <span className="text-[13px] text-brand-ink-muted">
                  Payment: {delivery.payment.status}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="dash-icon-btn -mr-1.5"
            aria-label="Close"
          >
            <IconX className="size-[18px]" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="dash-modal-body space-y-6">
          {/* Pickup & Dropoff Locations */}
          <section>
            <h3 className="mb-2.5 text-sm font-semibold text-brand-ink">Route</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="dash-eyebrow">Pickup location</p>
                <p className="mt-0.5 text-sm text-brand-ink">{delivery.pickup.address}</p>
              </div>
              <div>
                <p className="dash-eyebrow">Dropoff location</p>
                <p className="mt-0.5 text-sm text-brand-ink">{delivery.dropoff.address}</p>
              </div>
            </div>
          </section>

          {/* Item & Fare Details */}
          <div className="grid gap-x-8 gap-y-6 border-t border-brand-hairline pt-5 sm:grid-cols-2">
            {delivery.itemDetails && (
              <section>
                <h3 className="mb-1.5 text-sm font-semibold text-brand-ink">Item</h3>
                {row("Type", delivery.itemDetails.type)}
                {delivery.itemDetails.description &&
                  row("Description", delivery.itemDetails.description)}
                {row("Weight", `${delivery.itemDetails.weight} kg`)}
                {delivery.estimatedDistanceKm &&
                  row("Distance", `${delivery.estimatedDistanceKm.toFixed(2)} km`)}
                {delivery.estimatedDurationMin &&
                  row("Duration", `${delivery.estimatedDurationMin} mins`)}
              </section>
            )}

            <section>
              <h3 className="mb-1.5 text-sm font-semibold text-brand-ink">Fare</h3>
              {delivery.fare.baseFare &&
                row(
                  "Base fare",
                  <span className="tabular-nums">
                    {delivery.fare.currency}{" "}
                    {delivery.fare.baseFare?.toLocaleString() || "0"}
                  </span>,
                )}
              {delivery.fare.distanceFare &&
                row(
                  "Distance fare",
                  <span className="tabular-nums">
                    {delivery.fare.currency}{" "}
                    {delivery.fare.distanceFare?.toFixed(2) || "0"}
                  </span>,
                )}
              {row("Method", delivery.payment.method)}
              {delivery.payment.method.toLowerCase() !== "cash" &&
                row("Status", delivery.payment.status)}
              <div className="mt-1.5 flex justify-between gap-4 border-t border-brand-hairline pt-2.5 text-sm font-semibold text-brand-ink">
                <span>Total fare</span>
                <span className="tabular-nums">
                  {delivery.fare.currency}{" "}
                  {(
                    delivery.fare.totalFare || delivery.fare.amount
                  )?.toLocaleString() || "0"}
                </span>
              </div>
            </section>
          </div>

          {/* Rider Info (if assigned) */}
          {delivery.driverDetails && (
            <section className="border-t border-brand-hairline pt-5">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-brand-ink">Rider</h3>
                {delivery.driverDetails.currentLocation && onViewLocation && (
                  <button
                    onClick={() =>
                      onViewLocation(
                        delivery.driverDetails!.currentLocation!.lat,
                        delivery.driverDetails!.currentLocation!.lng,
                        "Rider Location",
                        `${delivery.driverDetails!.name}'s current location`,
                        delivery.driverDetails!.currentLocation!.updatedAt,
                      )
                    }
                    className="dash-btn dash-btn-sm dash-btn-secondary"
                  >
                    <IconMapPin className="size-4" stroke={1.75} />
                    View location
                  </button>
                )}
              </div>
              <div className="grid gap-x-8 sm:grid-cols-2">
                <div>
                  {row("Name", delivery.driverDetails.name)}
                  {delivery.driverDetails.phone &&
                    row("Phone", <span className="tabular-nums">{delivery.driverDetails.phone}</span>)}
                  {delivery.driverDetails.rating !== undefined &&
                    row("Rating", `${delivery.driverDetails.rating} / 5`)}
                </div>
                {delivery.driverDetails.vehicle && (
                  <div>
                    {row(
                      "Vehicle",
                      `${delivery.driverDetails.vehicle.make} ${delivery.driverDetails.vehicle.model}`,
                    )}
                    {row(
                      "Plate",
                      <span className="font-mono">{delivery.driverDetails.vehicle.plateNumber}</span>,
                    )}
                    {row("Type", delivery.driverDetails.vehicle.type)}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Timeline */}
          <section className="border-t border-brand-hairline pt-5">
            <h3 className="mb-3 text-sm font-semibold text-brand-ink">Timeline</h3>
            <ol>
              {timeline.map((step, i) => (
                <li key={step.label} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < timeline.length - 1 && (
                    <span className="absolute top-3 bottom-0 left-[3.5px] w-px bg-brand-hairline" />
                  )}
                  <span className="relative mt-[5px] size-2 shrink-0 rounded-full bg-brand-ink-faint" />
                  <div className="-mt-px">
                    <p className="text-sm font-medium text-brand-ink">{step.label}</p>
                    <p className="text-xs text-brand-ink-muted">{formatDate(step.date!)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="dash-modal-footer">
          <button onClick={onClose} className="dash-btn dash-btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
