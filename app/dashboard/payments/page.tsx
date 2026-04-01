"use client";

import { useEffect, useState } from "react";
import { TokenUtils } from "@/lib/tokenUtils";
import { API_CONFIG } from "@/app/lib/config";
import { IconCash, IconClock, IconCheck, IconFilter, IconDownload } from "@tabler/icons-react";

interface Payment {
  _id: string;
  amount: number;
  companyAmount: number;
  platformFee: number;
  status: string;
  escrowStatus: string;
  paidAt: string;
  settledAt?: string;
  paymentMethod: string;
  paystackReference: string;
  customer: {
    name: string;
    phone: string;
    avatarUrl?: string;
  };
  delivery: {
    referenceId: string;
    pickup: string;
    dropoff: string;
    status: string;
  };
}

interface PaymentSummary {
  totalEarnings: number;
  totalFees: number;
  totalTransactions: number;
  settledAmount: number;
  pendingAmount: number;
  pendingSettlements: number;
}

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
  const [filters, setFilters] = useState({
    status: "all",
    settlementStatus: "all",
    page: 1,
  });

  const loadPayments = async (newFilters = filters) => {
    try {
      setLoading(true);
      const token = TokenUtils.getToken();
      const params = new URLSearchParams({
        page: newFilters.page.toString(),
        limit: "10",
        status: newFilters.status,
        settlementStatus: newFilters.settlementStatus,
      });

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/payments/company-payments?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPayments(data.data.payments);
          setSummary(data.data.summary);
        }
      }
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const getStatusBadge = (escrowStatus: string) => {
    switch (escrowStatus) {
      case "settled":
        return { label: "Settled", color: "green", icon: <IconCheck className="h-4 w-4" /> };
      case "pending":
        return { label: "Pending", color: "orange", icon: <IconClock className="h-4 w-4" /> };
      case "held":
        return { label: "In Escrow", color: "blue", icon: <IconCash className="h-4 w-4" /> };
      default:
        return { label: escrowStatus, color: "gray", icon: <IconClock className="h-4 w-4" /> };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{summary.totalEarnings.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">{summary.totalTransactions} transactions</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <IconCash className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Settled</p>
              <p className="text-2xl font-bold text-green-600">
                ₦{summary.settledAmount.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <IconCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">
                ₦{summary.pendingAmount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">{summary.pendingSettlements} awaiting confirmation</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <IconClock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <IconFilter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => {
              const newFilters = { ...filters, status: e.target.value, page: 1 };
              setFilters(newFilters);
              loadPayments(newFilters);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="successful">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={filters.settlementStatus}
            onChange={(e) => {
              const newFilters = { ...filters, settlementStatus: e.target.value, page: 1 };
              setFilters(newFilters);
              loadPayments(newFilters);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Settlements</option>
            <option value="settled">Settled</option>
            <option value="pending">Pending</option>
            <option value="held">In Escrow</option>
          </select>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="p-4 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))
          ) : payments.length === 0 ? (
            <div className="p-12 text-center">
              <IconCash className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No payments found</p>
            </div>
          ) : (
            payments.map((payment) => {
              const statusBadge = getStatusBadge(payment.escrowStatus);
              return (
                <div key={payment._id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {payment.delivery.referenceId}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(payment.paidAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-1">
                        {payment.customer.name}
                      </p>
                      
                      <p className="text-sm text-gray-500">
                        {payment.delivery.pickup} → {payment.delivery.dropoff}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₦{payment.amount.toLocaleString()}
                      </p>
                      
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        statusBadge.color === 'green' ? 'bg-green-100 text-green-800' :
                        statusBadge.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                        statusBadge.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {statusBadge.icon}
                        {statusBadge.label}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {payments.length > 0 && (
          <div className="p-4 border-t border-gray-200 text-center">
            <button
              onClick={() => {
                const newFilters = { ...filters, page: filters.page + 1 };
                setFilters(newFilters);
                loadPayments(newFilters);
              }}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}