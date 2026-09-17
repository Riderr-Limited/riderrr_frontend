"use client";

import { useEffect, useState, useCallback } from "react";
import { IconRefresh } from "@tabler/icons-react";
import { API_CONFIG } from "@/app/lib/config";
import { TokenUtils } from "@/lib/tokenUtils";
import { useAuth } from "@/contexts/AuthContext";
import PODOrderCard, { PODOrder } from "@/components/pod/PODOrderCard";
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
    const btn = (label: string, onClick: () => void, cls = "bg-blue-600 hover:bg-blue-700 text-white") => (
      <button
        key={label}
        onClick={onClick}
        disabled={busy}
        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${cls}`}
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
            {btn("Cancel", () => patchOrder(order._id, "cancel", { reason: "Declined by company" }), "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200")}
          </>
        );
      }
      case "CONFIRMED":
        return (
          <>
            {btn("Mark Ready", () => patchOrder(order._id, "ready"))}
            {btn("Assign Driver", () => setAssignModal(order._id), "bg-purple-600 hover:bg-purple-700 text-white")}
          </>
        );
      case "READY_FOR_DELIVERY":
        return btn("Assign Driver", () => setAssignModal(order._id), "bg-purple-600 hover:bg-purple-700 text-white");
      case "DELIVERED_PAID":
        return btn("Settle Merchant", () => setSettleModal({ id: order._id, amount: order.productAmount }), "bg-green-600 hover:bg-green-700 text-white");
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Payment on Delivery</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage POD orders from request to settlement</p>
        </div>
        <button
          onClick={() => fetchOrders(tab)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <IconRefresh className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 bg-white rounded-xl border border-gray-200 animate-pulse" />
          ))
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No {tab} orders</p>
          </div>
        ) : (
          orders.map((order) => (
            <PODOrderCard key={order._id} order={order} actions={getActions(order)} />
          ))
        )}
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
