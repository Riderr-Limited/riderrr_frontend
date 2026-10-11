"use client";

import { useEffect, useState, useCallback } from "react";
import { IconRefresh } from "@tabler/icons-react";
import { API_CONFIG } from "@/app/lib/config";
import { TokenUtils } from "@/lib/tokenUtils";
import { useAuth } from "@/contexts/AuthContext";
import PODOrderCard, { PODOrder } from "@/components/pod/PODOrderCard";
import { PageHeader, EmptyState } from "@/components/dashboard/primitives";
import AssignDriverModal from "@/components/pod/AssignDriverModal";
import SettleModal from "@/components/pod/SettleModal";

type Tab = "incoming" | "active" | "completed";

const INCOMING_STATUSES = ["POD_REQUESTED"];
const ACTIVE_STATUSES = ["CONFIRMED", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "AWAITING_CUSTOMER"];
const COMPLETED_STATUSES = ["DELIVERED_PAID", "SETTLED", "CANCELLED", "REJECTED_RETURN"];

const TAB_STATUS_MAP: Record<Tab, string[]> = {
  incoming: INCOMING_STATUSES,
  active: ACTIVE_STATUSES,
  completed: COMPLETED_STATUSES,
};

export default function PaymentOnDeliveryPage() {
  const { user } = useAuth();
  const companyId = user?.companyId;
  const [tab, setTab] = useState<Tab>("incoming");
  const [orders, setOrders] = useState<PODOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [assignModal, setAssignModal] = useState<string | null>(null);
  const [settleModal, setSettleModal] = useState<{ id: string; amount: number } | null>(null);

  const fetchOrders = useCallback(async (currentTab: Tab) => {
    setLoading(true);
    try {
      const token = TokenUtils.getToken();
      const statuses = TAB_STATUS_MAP[currentTab];
      const results: PODOrder[] = [];

      for (const status of statuses) {
        const params = new URLSearchParams({ status, limit: "50" });
        if (companyId) params.set("companyId", companyId);
        const res = await fetch(`${API_CONFIG.BASE_URL}/pod?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data) results.push(...data.data);
      }

      setOrders(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchOrders(tab);
    let interval: NodeJS.Timeout | undefined;
    if (tab === "incoming") {
      interval = setInterval(() => fetchOrders("incoming"), 15000);
    }
    return () => clearInterval(interval);
  }, [tab, fetchOrders]);

  const patchOrder = async (podId: string, endpoint: string, body?: object) => {
    setActionLoading(podId);
    try {
      const token = TokenUtils.getToken();
      const res = await fetch(`${API_CONFIG.BASE_URL}/pod/${podId}/${endpoint}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        ...(body && { body: JSON.stringify(body) }),
      });
      const data = await res.json();
      if (data.success) fetchOrders(tab);
      else console.error("POD action error:", data);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const getActions = (order: PODOrder) => {
    const busy = actionLoading === order._id;
    const btn = (label: string, onClick: () => void, cls = "dash-btn-primary") => (
      <button
        key={label}
        onClick={onClick}
        disabled={busy}
        className={`dash-btn dash-btn-sm flex-1 sm:flex-none ${cls}`}
      >
        {busy ? "..." : label}
      </button>
    );

    switch (order.status) {
      case "POD_REQUESTED": {
        const isMyOrder = !order.company || order.company === companyId || (order.company as any)?._id === companyId;
        if (!isMyOrder) return null;
        return (
          <>
            {btn("Confirm", () => patchOrder(order._id, "confirm"))}
            {btn("Cancel", () => patchOrder(order._id, "cancel", { reason: "Declined by company" }), "dash-btn-danger-outline")}
          </>
        );
      }
      case "CONFIRMED":
        return (
          <>
            {btn("Mark Ready", () => patchOrder(order._id, "ready"))}
            {btn("Assign Driver", () => setAssignModal(order._id), "dash-btn-secondary")}
          </>
        );
      case "READY_FOR_DELIVERY":
        return btn("Assign Driver", () => setAssignModal(order._id));
      case "DELIVERED_PAID":
        return btn("Settle Merchant", () => setSettleModal({ id: order._id, amount: order.productAmount }));
      default:
        return null;
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "incoming", label: "Incoming" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div>
      <PageHeader
        title="Payment on Delivery"
        description="Manage POD orders from request to settlement."
      >
        <button
          onClick={() => fetchOrders(tab)}
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
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className="dash-tab"
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="dash-card space-y-2.5 px-5 py-4">
                <div className="dash-skeleton h-3.5 w-1/3" />
                <div className="dash-skeleton h-3.5 w-2/3" />
                <div className="dash-skeleton h-3.5 w-1/2" />
              </div>
            ))
          ) : orders.length === 0 ? (
            <div className="dash-card">
              <EmptyState title={`No ${tab} orders`} />
            </div>
          ) : (
            orders.map((order) => (
              <PODOrderCard key={order._id} order={order} actions={getActions(order)} />
            ))
          )}
        </div>
      </div>

      {assignModal && (
        <AssignDriverModal
          podId={assignModal}
          onClose={() => setAssignModal(null)}
          onAssigned={() => { setAssignModal(null); fetchOrders(tab); }}
        />
      )}

      {settleModal && (
        <SettleModal
          podId={settleModal.id}
          productAmount={settleModal.amount}
          onClose={() => setSettleModal(null)}
          onSettled={() => { setSettleModal(null); fetchOrders(tab); }}
        />
      )}
    </div>
  );
}
