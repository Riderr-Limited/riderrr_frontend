"use client";

import { useEffect, useState } from "react";
import { TokenUtils } from "@/lib/tokenUtils";
import { API_CONFIG } from "@/app/lib/config";
import { PageHeader, StatStrip, Stat, EmptyState } from "@/components/dashboard/primitives";
import PaymentDetailModal, {
  Payment,
} from "@/components/payments/PaymentDetailModal";

interface PaymentSummary {
  totalEarnings: number;
  totalFees: number;
  totalTransactions: number;
  settledAmount: number;
  pendingAmount: number;
  pendingSettlements: number;
}

const escrowBadge = (status: string) => {
  switch (status) {
    case "settled":
      return { label: "Settled", cls: "dash-badge-success" };
    case "held":
      return { label: "In escrow", cls: "dash-badge-info" };
    default:
      return { label: "Pending", cls: "dash-badge-warning" };
  }
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    totalEarnings: 0,
    totalFees: 0,
    totalTransactions: 0,
    settledAmount: 0,
    pendingAmount: 0,
    pendingSettlements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [filters, setFilters] = useState({
    status: "all",
    settlementStatus: "all",
    dateFrom: "",
    dateTo: "",
    page: 1,
  });

  const loadPayments = async (f = filters) => {
    try {
      setLoading(true);
      const token = TokenUtils.getToken();
      const params = new URLSearchParams({ page: f.page.toString(), limit: "10" });
      if (f.status !== "all") params.set("status", f.status);
      if (f.settlementStatus !== "all") params.set("settlementStatus", f.settlementStatus);
      if (f.dateFrom) params.set("dateFrom", f.dateFrom);
      if (f.dateTo) params.set("dateTo", f.dateTo);

      const res = await fetch(
        `${API_CONFIG.BASE_URL}/payments/company-payments?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPayments(data.data.payments);
          setSummary(data.data.summary);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPayments(); }, []);

  const applyFilter = (patch: Partial<typeof filters>) => {
    const next = { ...filters, ...patch, page: 1 };
    setFilters(next);
    loadPayments(next);
  };

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Earnings, settlements and payment history."
      />

      <div className="space-y-5">
        {/* Summary */}
        <StatStrip className="grid-cols-1 sm:grid-cols-3">
          <Stat
            label="Total earnings"
            value={`₦${summary.totalEarnings.toLocaleString()}`}
            hint={`${summary.totalTransactions} transactions`}
          />
          <Stat
            label="Settled"
            value={`₦${summary.settledAmount.toLocaleString()}`}
            hint="Paid out to your account"
          />
          <Stat
            label="Pending"
            value={`₦${summary.pendingAmount.toLocaleString()}`}
            hint={`${summary.pendingSettlements} awaiting settlement`}
          />
        </StatStrip>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.status}
            onChange={(e) => applyFilter({ status: e.target.value })}
            className="dash-input w-full sm:w-40"
            aria-label="Payment status"
          >
            <option value="all">All statuses</option>
            <option value="successful">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={filters.settlementStatus}
            onChange={(e) => applyFilter({ settlementStatus: e.target.value })}
            className="dash-input w-full sm:w-44"
            aria-label="Settlement status"
          >
            <option value="all">All settlements</option>
            <option value="settled">Settled</option>
            <option value="pending">Pending</option>
            <option value="held">In escrow</option>
          </select>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => applyFilter({ dateFrom: e.target.value })}
              className="dash-input sm:w-40"
              aria-label="From date"
            />
            <span className="text-sm text-brand-ink-faint">to</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => applyFilter({ dateTo: e.target.value })}
              className="dash-input sm:w-40"
              aria-label="To date"
            />
          </div>

          {(filters.dateFrom || filters.dateTo || filters.status !== "all" || filters.settlementStatus !== "all") && (
            <button
              onClick={() => applyFilter({ status: "all", settlementStatus: "all", dateFrom: "", dateTo: "" })}
              className="dash-btn dash-btn-ghost"
            >
              Clear
            </button>
          )}
        </div>

        {/* Payments List */}
        <section className="dash-card overflow-hidden">
          <div className="border-b border-brand-hairline px-5 py-3.5">
            <h2 className="text-sm font-semibold text-brand-ink">Payment history</h2>
          </div>

          <div className="divide-y divide-brand-hairline">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between gap-6 px-5 py-4">
                  <div className="flex-1 space-y-2">
                    <div className="dash-skeleton h-3.5 w-1/4" />
                    <div className="dash-skeleton h-3 w-1/2" />
                  </div>
                  <div className="dash-skeleton h-3.5 w-20" />
                </div>
              ))
            ) : payments.length === 0 ? (
              <EmptyState
                title="No payments found"
                description="Payments for completed deliveries will appear here."
              />
            ) : (
              payments.map((payment) => {
                if (!payment.delivery || !payment.customer) return null;
                const badge = escrowBadge(payment.escrowStatus);
                return (
                  <div
                    key={payment._id}
                    className="cursor-pointer px-5 py-3.5 transition-colors hover:bg-brand-canvas-soft/60"
                    onClick={() => setSelected(payment)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                          <h3 className="font-mono text-[13px] font-medium text-brand-ink">
                            {payment.delivery.referenceId}
                          </h3>
                          <span className="text-xs text-brand-ink-muted">{fmtDate(payment.paidAt)}</span>
                        </div>
                        <p className="mt-1 text-sm text-brand-ink-secondary">{payment.customer.name}</p>
                        <p className="mt-0.5 truncate text-[13px] text-brand-ink-muted">
                          {payment.delivery.pickup} → {payment.delivery.dropoff}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-brand-ink tabular-nums">
                          ₦{payment.amount.toLocaleString()}
                        </p>
                        <span className={`dash-badge mt-1.5 ${badge.cls}`}>{badge.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {payments.length > 0 && (
            <div className="border-t border-brand-hairline px-5 py-3 text-center">
              <button
                onClick={() => {
                  const next = { ...filters, page: filters.page + 1 };
                  setFilters(next);
                  loadPayments(next);
                }}
                className="dash-btn dash-btn-sm dash-btn-secondary"
              >
                Load more
              </button>
            </div>
          )}
        </section>
      </div>

      {selected && (
        <PaymentDetailModal payment={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
