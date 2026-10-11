"use client";

import { useEffect, useState, useCallback } from "react";
import { IconRefresh, IconAlertCircle } from "@tabler/icons-react";
import {
  PageHeader,
  EmptyState,
  Field,
  RouteStops,
  humanize,
} from "@/components/dashboard/primitives";
import { ApiClient } from "@/app/lib/api-client";
import ErrandAssignModal, { Errand } from "@/components/errand/ErrandAssignModal";

const TABS = [
  { key: "incoming", label: "Incoming", statuses: ["REQUESTED", "SEARCHING_RIDER"] },
  { key: "active", label: "Active", statuses: ["RIDER_ASSIGNED", "ACCEPTED", "IN_PROGRESS", "AT_PICKUP", "AWAITING_CONFIRMATION"] },
  { key: "done", label: "Done", statuses: ["COMPLETED", "CANCELLED", "FAILED"] },
];

const STATUS_STYLES: Record<string, string> = {
  REQUESTED: "dash-badge-warning",
  SEARCHING_RIDER: "dash-badge-warning",
  RIDER_ASSIGNED: "dash-badge-info",
  ACCEPTED: "dash-badge-info",
  IN_PROGRESS: "dash-badge-info",
  AT_PICKUP: "dash-badge-info",
  AWAITING_CONFIRMATION: "dash-badge-warning",
  COMPLETED: "dash-badge-success",
  CANCELLED: "dash-badge-danger",
  FAILED: "dash-badge-danger",
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
    <div>
      <PageHeader
        title="Errands"
        description="Assign riders to errand requests and follow their progress."
      >
        <button
          onClick={fetchErrands}
          disabled={loading}
          className="dash-btn dash-btn-secondary"
        >
          <IconRefresh className={`size-4 ${loading ? "animate-spin" : ""}`} stroke={1.75} />
          Refresh
        </button>
      </PageHeader>

      <div className="space-y-5">
        {/* Tabs */}
        <div className="dash-tabs" role="tablist">
          {TABS.map((t) => {
            const count = errands.filter((e) => t.statuses.includes(e.status)).length;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className="dash-tab"
              >
                {t.label}
                {count > 0 && (
                  <span
                    className={`text-xs tabular-nums ${
                      tab === t.key ? "text-brand-ink-muted" : "text-brand-ink-faint"
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
          <div className="dash-notice dash-notice-danger">
            <IconAlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        )}

        {/* List */}
        {loading && errands.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="dash-card space-y-2.5 px-5 py-4">
                <div className="dash-skeleton h-3.5 w-1/3" />
                <div className="dash-skeleton h-3.5 w-2/3" />
                <div className="dash-skeleton h-3.5 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="dash-card">
            <EmptyState title="No errands here" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((errand) => (
              <div key={errand._id} className="dash-card overflow-hidden">
                {/* Card top */}
                <div className="flex items-center justify-between gap-3 border-b border-brand-hairline px-5 py-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-mono text-[13px] font-medium text-brand-ink">
                      {errand.referenceId}
                    </span>
                    <span className={`dash-badge ${STATUS_STYLES[errand.status] || ""}`}>
                      {humanize(errand.status)}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-brand-ink-muted">
                    {formatDate(errand.createdAt)}
                  </span>
                </div>

                {/* Card body */}
                <div className="grid gap-5 px-5 py-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <Field label="Type">{errand.errandType}</Field>
                    <Field label="Description">
                      <span className="line-clamp-2 text-brand-ink-secondary">
                        {errand.description}
                      </span>
                    </Field>
                    <Field label="Customer">
                      {errand.customerName}
                      <span className="text-brand-ink-faint"> · </span>
                      <span className="text-brand-ink-secondary tabular-nums">
                        {errand.customerPhone}
                      </span>
                    </Field>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="dash-eyebrow mb-1.5">Route</p>
                      <RouteStops
                        pickup={errand.pickupLocation?.address}
                        dropoff={errand.destination?.address}
                      />
                    </div>
                    <div className="flex gap-8">
                      <Field label="Spending limit">
                        <span className="tabular-nums">
                          ₦{errand.spendingLimit?.toLocaleString()}
                        </span>
                      </Field>
                      <Field label="Service fee">
                        <span className="tabular-nums">
                          ₦{errand.serviceFee?.toLocaleString()}
                        </span>
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {(tab === "incoming" || canCancel(errand.status)) && (
                  <div className="flex justify-end gap-2 border-t border-brand-hairline px-5 py-3">
                    {canCancel(errand.status) && (
                      <button
                        onClick={() => setCancelTarget(errand)}
                        className="dash-btn dash-btn-sm dash-btn-secondary"
                      >
                        Cancel
                      </button>
                    )}
                    {tab === "incoming" && (
                      <button
                        onClick={() => setAssignTarget(errand)}
                        className="dash-btn dash-btn-sm dash-btn-primary"
                      >
                        Assign rider
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
        <div className="dash-overlay">
          <div className="dash-modal max-w-sm">
            <div className="dash-modal-body space-y-4">
              <div>
                <h3 className="dash-modal-title">Cancel errand</h3>
                <p className="mt-1 text-sm text-brand-ink-muted">
                  Cancelling{" "}
                  <span className="font-mono text-brand-ink-secondary">
                    {cancelTarget.referenceId}
                  </span>
                  . This can&apos;t be undone.
                </p>
              </div>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation"
                rows={3}
                className="dash-input resize-none"
              />
            </div>
            <div className="dash-modal-footer">
              <button
                onClick={() => { setCancelTarget(null); setCancelReason(""); }}
                className="dash-btn dash-btn-secondary"
              >
                Back
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason.trim() || cancelling}
                className="dash-btn dash-btn-danger"
              >
                {cancelling ? "Cancelling…" : "Cancel errand"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
