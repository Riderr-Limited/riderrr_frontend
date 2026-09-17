"use client";

import { useEffect, useState, useCallback } from "react";
import {
  IconRefresh,
  IconMapPin,
  IconPhone,
  IconClock,
  IconPackage,
  IconAlertCircle,
} from "@tabler/icons-react";
import { ApiClient } from "@/app/lib/api-client";
import ErrandAssignModal, { Errand } from "@/components/errand/ErrandAssignModal";

const TABS = [
  { key: "incoming", label: "Incoming", statuses: ["REQUESTED", "SEARCHING_RIDER"] },
  { key: "active", label: "Active", statuses: ["RIDER_ASSIGNED", "ACCEPTED", "IN_PROGRESS", "AT_PICKUP", "AWAITING_CONFIRMATION"] },
  { key: "done", label: "Done", statuses: ["COMPLETED", "CANCELLED", "FAILED"] },
];

const STATUS_STYLES: Record<string, string> = {
  REQUESTED: "bg-yellow-100 text-yellow-800",
  SEARCHING_RIDER: "bg-orange-100 text-orange-800",
  RIDER_ASSIGNED: "bg-blue-100 text-blue-800",
  ACCEPTED: "bg-indigo-100 text-indigo-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  AT_PICKUP: "bg-cyan-100 text-cyan-800",
  AWAITING_CONFIRMATION: "bg-teal-100 text-teal-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  FAILED: "bg-gray-100 text-gray-700",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default function ErrandPage() {
  const [tab, setTab] = useState("incoming");
  const [errands, setErrands] = useState<Errand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignTarget, setAssignTarget] = useState<Errand | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Errand | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchErrands = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ApiClient.get(ApiClient.buildUrl("/errands?limit=100"));
      if (res.success) setErrands(res.data);
    } catch (e: any) {
      setError(e.message || "Failed to load errands");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchErrands();
    const interval = setInterval(fetchErrands, 15000);
    return () => clearInterval(interval);
  }, [fetchErrands]);

  const currentStatuses = TABS.find((t) => t.key === tab)!.statuses;
  const filtered = errands.filter((e) => currentStatuses.includes(e.status));

  const handleCancel = async () => {
    if (!cancelTarget || !cancelReason.trim()) return;
    setCancelling(true);
    try {
      await ApiClient.patch(ApiClient.buildUrl(`/errands/${cancelTarget._id}/cancel`), {
        reason: cancelReason,
      });
      setCancelTarget(null);
      setCancelReason("");
      fetchErrands();
    } catch (e: any) {
      setError(e.message || "Failed to cancel errand");
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = (status: string) =>
    ["REQUESTED", "SEARCHING_RIDER", "RIDER_ASSIGNED", "ACCEPTED"].includes(status);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Errands</h1>
        <button
          onClick={fetchErrands}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <IconRefresh className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map((t) => {
          const count = errands.filter((e) => t.statuses.includes(e.status)).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                tab === t.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
              {count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    tab === t.key ? "bg-[#1E91D6] text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg border border-red-200">
          <IconAlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* List */}
      {loading && errands.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 animate-pulse rounded w-1/3" />
                <div className="h-4 bg-gray-100 animate-pulse rounded w-2/3" />
                <div className="h-4 bg-gray-100 animate-pulse rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <IconPackage className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No errands here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((errand) => (
            <div
              key={errand._id}
              className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden"
            >
              {/* Card top */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500">{errand.referenceId}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      STATUS_STYLES[errand.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {errand.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <IconClock className="h-3.5 w-3.5" />
                  {formatDate(errand.createdAt)}
                </div>
              </div>

              {/* Card body */}
              <div className="px-5 py-4 grid sm:grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Type</p>
                    <p className="text-sm font-medium text-gray-800">{errand.errandType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Description</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{errand.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <IconPhone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span>{errand.customerName}</span>
                    <span className="text-gray-400">·</span>
                    <span>{errand.customerPhone}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex gap-2">
                    <IconMapPin className="h-4 w-4 text-[#1E91D6] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Pickup</p>
                      <p className="text-sm text-gray-700">{errand.pickupLocation?.address}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <IconMapPin className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Dropoff</p>
                      <p className="text-sm text-gray-700">{errand.destination?.address}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm pt-1">
                    <span className="text-gray-500">
                      Limit: <span className="font-semibold text-gray-800">₦{errand.spendingLimit?.toLocaleString()}</span>
                    </span>
                    <span className="text-gray-500">
                      Fee: <span className="font-semibold text-gray-800">₦{errand.serviceFee?.toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {(tab === "incoming" || canCancel(errand.status)) && (
                <div className="px-5 py-3 border-t border-gray-100 flex gap-2 justify-end">
                  {canCancel(errand.status) && (
                    <button
                      onClick={() => setCancelTarget(errand)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                    >
                      Cancel
                    </button>
                  )}
                  {tab === "incoming" && (
                    <button
                      onClick={() => setAssignTarget(errand)}
                      className="px-4 py-1.5 text-sm bg-[#1E91D6] hover:bg-[#0072BB] text-white rounded-lg transition-colors font-medium"
                    >
                      Assign Rider
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {assignTarget && (
        <ErrandAssignModal
          errand={assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssigned={() => {
            setAssignTarget(null);
            fetchErrands();
          }}
        />
      )}

      {/* Cancel Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-xl p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Cancel Errand</h3>
            <p className="text-sm text-gray-500">
              Cancelling <span className="font-mono text-gray-700">{cancelTarget.referenceId}</span>
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation…"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1E91D6] focus:border-transparent resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setCancelTarget(null); setCancelReason(""); }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason.trim() || cancelling}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                {cancelling ? "Cancelling…" : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
