"use client";
import { useState, useEffect } from "react";
import { IconX, IconAlertCircle } from "@tabler/icons-react";
import { Field, RouteStops, Avatar } from "@/components/dashboard/primitives";
import { ApiClient } from "@/app/lib/api-client";
import { API_CONFIG } from "@/app/lib/config";

interface Driver {
  _id: string;
  userId: { name: string; phone: string };
  isOnline: boolean;
  isAvailable: boolean;
  vehicle?: { type: string; plateNumber: string };
}

export interface Errand {
  _id: string;
  referenceId: string;
  errandType: string;
  description: string;
  status: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: { address: string };
  destination: { address: string };
  spendingLimit: number;
  customerAdvance: number;
  serviceFee: number;
  paymentMethod: string;
  preferredTime?: string;
  createdAt: string;
}

interface Props {
  errand: Errand;
  onClose: () => void;
  onAssigned: () => void;
}

export default function ErrandAssignModal({ errand, onClose, onAssigned }: Props) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    ApiClient.get(ApiClient.buildUrl(API_CONFIG.ENDPOINTS.COMPANY.DRIVERS))
      .then((res) => {
        if (res.success) {
          setDrivers((res.data as Driver[]).filter((d) => d.isOnline && d.isAvailable));
        }
      })
      .catch(() => setError("Failed to load drivers"))
      .finally(() => setLoading(false));
  }, []);

  const assign = async (driverId: string) => {
    setAssigning(driverId);
    setError("");
    try {
      await ApiClient.post(ApiClient.buildUrl(`/errands/${errand._id}/assign`), { driverId });
      onAssigned();
    } catch (e: any) {
      setError(e.message || "Failed to assign rider");
      setAssigning(null);
    }
  };

  return (
    <div className="dash-overlay">
      <div className="dash-modal max-w-lg">
        <div className="dash-modal-header">
          <div className="min-w-0">
            <h3 className="dash-modal-title">Assign rider</h3>
            <p className="mt-0.5 font-mono text-[13px] text-brand-ink-muted">{errand.referenceId}</p>
          </div>
          <button onClick={onClose} className="dash-icon-btn -mr-1.5" aria-label="Close">
            <IconX className="size-[18px]" />
          </button>
        </div>

        <div className="dash-modal-body space-y-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
            <Field label="Type">{errand.errandType}</Field>
            <Field label="Customer">{errand.customerName}</Field>
            <div className="col-span-2">
              <p className="dash-eyebrow mb-1.5">Route</p>
              <RouteStops
                pickup={errand.pickupLocation?.address}
                dropoff={errand.destination?.address}
              />
            </div>
            <Field label="Spending limit">
              <span className="tabular-nums">₦{errand.spendingLimit?.toLocaleString()}</span>
            </Field>
            <Field label="Advance">
              <span className="tabular-nums">₦{errand.customerAdvance?.toLocaleString()}</span>
            </Field>
          </div>

          <div className="border-t border-brand-hairline pt-5">
            <p className="mb-2.5 text-sm font-semibold text-brand-ink">Available riders</p>

            {error && (
              <div className="dash-notice dash-notice-danger mb-3">
                <IconAlertCircle className="mt-0.5 size-4 shrink-0" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="dash-skeleton h-[52px] rounded-md" />
                ))}
              </div>
            ) : drivers.length === 0 ? (
              <p className="py-6 text-center text-sm text-brand-ink-muted">No available riders right now</p>
            ) : (
              <div className="max-h-60 divide-y divide-brand-hairline overflow-y-auto rounded-md border border-brand-hairline">
                {drivers.map((driver) => (
                  <div
                    key={driver._id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={driver.userId?.name} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-brand-ink">{driver.userId?.name}</p>
                        <p className="truncate text-xs text-brand-ink-muted">
                          {driver.vehicle?.type} · {driver.vehicle?.plateNumber}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => assign(driver._id)}
                      disabled={!!assigning}
                      className="dash-btn dash-btn-sm dash-btn-primary"
                    >
                      {assigning === driver._id ? "Assigning…" : "Assign"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
