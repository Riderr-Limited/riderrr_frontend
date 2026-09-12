"use client";
import { useState, useEffect } from "react";
import { IconX, IconUser, IconAlertCircle } from "@tabler/icons-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <p className="text-xs text-gray-500 font-mono">{errand.referenceId}</p>
            <h3 className="font-semibold text-gray-900">Assign Rider</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <IconX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 space-y-1.5 text-sm">
          <div className="flex gap-2">
            <span className="text-gray-500 w-20 shrink-0">Type</span>
            <span className="font-medium text-gray-800">{errand.errandType}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-20 shrink-0">Customer</span>
            <span className="font-medium text-gray-800">{errand.customerName}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-20 shrink-0">Pickup</span>
            <span className="text-gray-700 line-clamp-1">{errand.pickupLocation?.address}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-20 shrink-0">Dropoff</span>
            <span className="text-gray-700 line-clamp-1">{errand.destination?.address}</span>
          </div>
          <div className="flex gap-4 pt-1">
            <span className="text-gray-500">
              Limit: <span className="font-semibold text-gray-800">₦{errand.spendingLimit?.toLocaleString()}</span>
            </span>
            <span className="text-gray-500">
              Advance: <span className="font-semibold text-gray-800">₦{errand.customerAdvance?.toLocaleString()}</span>
            </span>
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Available Riders</p>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">
              <IconAlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : drivers.length === 0 ? (
            <p className="text-center py-8 text-gray-500 text-sm">No available riders right now</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {drivers.map((driver) => (
                <div
                  key={driver._id}
                  className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#1E91D6]/10 rounded-full">
                      <IconUser className="h-4 w-4 text-[#1E91D6]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{driver.userId?.name}</p>
                      <p className="text-xs text-gray-500">
                        {driver.vehicle?.type} · {driver.vehicle?.plateNumber}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => assign(driver._id)}
                    disabled={!!assigning}
                    className="px-3 py-1.5 bg-[#1E91D6] hover:bg-[#0072BB] text-white text-sm rounded-lg transition-colors disabled:opacity-50 font-medium"
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
  );
}
