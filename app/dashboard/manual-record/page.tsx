"use client";

import { useEffect, useState, useCallback } from "react";
import {
  IconPlus,
  IconRefresh,
  IconSearch,
  IconEye,
  IconEdit,
  IconTrash,
  IconX,
  IconLoader2,
  IconClipboardList,
  IconMapPin,
  IconCash,
  IconTruck,
} from "@tabler/icons-react";
import { ApiClient } from "../../lib/api-client";
import { API_CONFIG } from "../../lib/config";

type ServiceType = "DELIVERY" | "ERRAND" | "PAY_ON_DELIVERY" | "RIDE" | "OTHER";
type PaymentMethod = "CASH" | "TRANSFER" | "POS" | "CREDIT" | "OTHER";
type RecordStatus = "COMPLETED" | "PENDING" | "CANCELLED" | "FAILED";
type PaymentStatus = "PAID" | "PARTIAL" | "UNPAID";

interface DriverPopulated {
  _id: string;
  plateNumber: string;
  vehicleType: string;
  vehicleColor?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  approvalStatus: string;
  isOnline?: boolean;
  userId: {
    _id: string;
    name: string;
    phone: string;
    email: string;
    avatarUrl?: string | null;
  };
}

interface ManualRecord {
  _id: string;
  referenceId?: string;
  serviceType: ServiceType;
  customServiceLabel?: string;
  description: string;
  driverId?: DriverPopulated;
  driverName?: string;
  driverPhone?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryFee: number;
  amountPaid: number;
  totalAmount: number;
  balance: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: RecordStatus;
  deliveryDate: string;
  notes?: string | null;
  recordedBy?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

interface Driver {
  _id: string;
  name: string;
  phone: string;
  plateNumber: string;
  vehicleType: string;
  approvalStatus: string;
}

interface Summary {
  byType: { _id: string; count: number; totalAmount: number; totalPaid: number }[];
  byPayment: { _id: string; count: number; totalAmount: number }[];
  topDrivers: { _id: string; count: number; totalAmount: number; driverName: string }[];
}

interface FormState {
  serviceType: ServiceType;
  customServiceLabel: string;
  description: string;
  driverId: string;
  pickupAddress: string;
  dropoffAddress: string;
  customerName: string;
  customerPhone: string;
  deliveryFee: string;
  amountPaid: string;
  paymentMethod: PaymentMethod;
  status: RecordStatus;
  deliveryDate: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  serviceType: "DELIVERY",
  customServiceLabel: "",
  description: "",
  driverId: "",
  pickupAddress: "",
  dropoffAddress: "",
  customerName: "",
  customerPhone: "",
  deliveryFee: "",
  amountPaid: "",
  paymentMethod: "CASH",
  status: "COMPLETED",
  deliveryDate: "",
  notes: "",
};

const BASE = API_CONFIG.ENDPOINTS.MANUAL_RECORDS.BASE;
const SUMMARY_URL = API_CONFIG.ENDPOINTS.MANUAL_RECORDS.SUMMARY;
const DRIVERS_URL = API_CONFIG.ENDPOINTS.MANUAL_RECORDS.DRIVERS;

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const paymentBadge: Record<PaymentStatus, string> = {
  PAID: "bg-green-100 text-green-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
  UNPAID: "bg-red-100 text-red-700",
};

const statusBadge: Record<RecordStatus, string> = {
  COMPLETED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-700",
  FAILED: "bg-red-100 text-red-700",
};

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent";

export default function ManualRecordPage() {
  const [records, setRecords] = useState<ManualRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterService, setFilterService] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 0 });

  const [showCreate, setShowCreate] = useState(false);
  const [viewRecord, setViewRecord] = useState<ManualRecord | null>(null);
  const [editRecord, setEditRecord] = useState<ManualRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // form state lives here — NOT inside a child component — to fix the focus bug
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (filterService !== "all") params.set("serviceType", filterService);
      if (filterPayment !== "all") params.set("paymentStatus", filterPayment);
      if (filterStatus !== "all") params.set("status", filterStatus);
      const data = await ApiClient.get(ApiClient.buildUrl(BASE) + "?" + params.toString());
      if (data.success) {
        const sorted = [...data.data].sort((a: ManualRecord, b: ManualRecord) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecords(sorted);
        setPagination(data.pagination);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load records");
    } finally { setLoading(false); }
  }, [filterService, filterPayment, filterStatus]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const data = await ApiClient.get(ApiClient.buildUrl(SUMMARY_URL));
      if (data.success) setSummary(data.data);
    } catch { /* non-critical */ } finally { setSummaryLoading(false); }
  }, []);

  const fetchDrivers = useCallback(async () => {
    try {
      const data = await ApiClient.get(ApiClient.buildUrl(DRIVERS_URL));
      if (data.success) setDrivers(data.data);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { fetchRecords(1); }, [fetchRecords]);
  useEffect(() => { fetchSummary(); }, [fetchSummary]);
  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const buildPayload = (f: FormState) => ({
    serviceType: f.serviceType,
    description: f.description,
    ...(f.serviceType === "OTHER" && { customServiceLabel: f.customServiceLabel }),
    ...(f.driverId && { driverId: f.driverId }),
    ...(f.pickupAddress && { pickupAddress: f.pickupAddress }),
    ...(f.dropoffAddress && { dropoffAddress: f.dropoffAddress }),
    ...(f.customerName && { customerName: f.customerName }),
    ...(f.customerPhone && { customerPhone: f.customerPhone }),
    deliveryFee: Number(f.deliveryFee) || 0,
    amountPaid: Number(f.amountPaid) || 0,
    paymentMethod: f.paymentMethod,
    status: f.status,
    ...(f.deliveryDate && { deliveryDate: f.deliveryDate }),
    ...(f.notes && { notes: f.notes }),
  });

  const handleCreate = async () => {
    if (!form.description.trim()) { setError("Description is required"); return; }
    if (form.serviceType === "OTHER" && !form.customServiceLabel.trim()) {
      setError("Custom service label is required for OTHER"); return;
    }
    setSubmitting(true); setError("");
    try {
      await ApiClient.post(ApiClient.buildUrl(BASE), buildPayload(form));
      setShowCreate(false); setForm(EMPTY_FORM);
      fetchRecords(1); fetchSummary();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create record");
    } finally { setSubmitting(false); }
  };

  const handleUpdate = async () => {
    if (!editRecord) return;
    if (!form.description.trim()) { setError("Description is required"); return; }
    setSubmitting(true); setError("");
    try {
      await ApiClient.patch(ApiClient.buildUrl(`${BASE}/${editRecord._id}`), buildPayload(form));
      setEditRecord(null); setForm(EMPTY_FORM);
      fetchRecords(pagination.page); fetchSummary();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update record");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await ApiClient.delete(ApiClient.buildUrl(`${BASE}/${deleteId}`));
      setDeleteId(null); fetchRecords(pagination.page); fetchSummary();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete record");
    } finally { setSubmitting(false); }
  };

  const openEdit = (r: ManualRecord) => {
    setForm({
      serviceType: r.serviceType,
      customServiceLabel: r.customServiceLabel || "",
      description: r.description,
      driverId: r.driverId?._id || "",
      pickupAddress: r.pickupAddress || "",
      dropoffAddress: r.dropoffAddress || "",
      customerName: r.customerName || "",
      customerPhone: r.customerPhone || "",
      deliveryFee: String(r.deliveryFee),
      amountPaid: String(r.amountPaid),
      paymentMethod: r.paymentMethod,
      status: r.status,
      deliveryDate: r.deliveryDate ? r.deliveryDate.slice(0, 10) : "",
      notes: r.notes || "",
    });
    setEditRecord(r); setError("");
  };

  const filtered = records.filter((r) =>
    search === "" ||
    r.description.toLowerCase().includes(search.toLowerCase()) ||
    r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    (r.driverName || "").toLowerCase().includes(search.toLowerCase())
  );

  // Inline form JSX — defined as a variable, NOT a nested component,
  // so React never unmounts/remounts it on state change (fixes the focus bug).
  const recordForm = (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm">{error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Service Type *</label>
          <select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value as ServiceType })} className={inputCls}>
            {["DELIVERY", "ERRAND", "PAY_ON_DELIVERY", "RIDE", "OTHER"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {form.serviceType === "OTHER" && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Custom Label *</label>
            <input value={form.customServiceLabel} onChange={(e) => setForm({ ...form, customServiceLabel: e.target.value })} className={inputCls} placeholder="e.g. Laundry pickup" />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Description *</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputCls} placeholder="Brief description of the service" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Assign Driver</label>
          <select value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} className={inputCls}>
            <option value="">— No driver —</option>
            {drivers.map((d) => <option key={d._id} value={d._id}>{d.name} · {d.plateNumber} · {d.vehicleType}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name</label>
          <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className={inputCls} placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Customer Phone</label>
          <input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className={inputCls} placeholder="08012345678" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Pickup Address</label>
          <input value={form.pickupAddress} onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Dropoff Address</label>
          <input value={form.dropoffAddress} onChange={(e) => setForm({ ...form, dropoffAddress: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Delivery Fee (₦)</label>
          <input type="number" min="0" value={form.deliveryFee} onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })} className={inputCls} placeholder="0" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Amount Paid (₦)</label>
          <input type="number" min="0" value={form.amountPaid} onChange={(e) => setForm({ ...form, amountPaid: e.target.value })} className={inputCls} placeholder="0" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
          <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })} className={inputCls}>
            {["CASH", "TRANSFER", "POS", "CREDIT", "OTHER"].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as RecordStatus })} className={inputCls}>
            {["COMPLETED", "PENDING", "CANCELLED", "FAILED"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Delivery Date</label>
          <input type="date" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={inputCls} placeholder="Optional notes" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manual Records</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track services not captured automatically</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { fetchRecords(1); fetchSummary(); }} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <IconRefresh className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => { setForm(EMPTY_FORM); setError(""); setShowCreate(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <IconPlus className="h-4 w-4" /> New Record
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" /><div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
          ))
        ) : summary ? (
          <>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{summary.byType.reduce((a, b) => a + b.count, 0)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Total Amount</p>
              <p className="text-xl font-bold text-gray-900">{fmt(summary.byType.reduce((a, b) => a + b.totalAmount, 0))}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Total Paid</p>
              <p className="text-xl font-bold text-green-600">{fmt(summary.byPayment.find((p) => p._id === "PAID")?.totalAmount || 0)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Outstanding</p>
              <p className="text-xl font-bold text-red-500">{fmt(summary.byType.reduce((a, b) => a + b.totalAmount - b.totalPaid, 0))}</p>
            </div>
          </>
        ) : null}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search description, customer, driver..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
          <option value="all">All Services</option>
          {["DELIVERY", "ERRAND", "PAY_ON_DELIVERY", "RIDE", "OTHER"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
          <option value="all">All Payments</option>
          {["PAID", "PARTIAL", "UNPAID"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
          <option value="all">All Statuses</option>
          {["COMPLETED", "PENDING", "CANCELLED", "FAILED"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <IconClipboardList className="h-14 w-14 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No records found</p>
          </div>
        ) : (
          filtered.map((r) => (
            <div key={r._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden">

              {/* Header — amount + actions */}
              <div className="bg-linear-to-r from-blue-50 to-purple-50 px-4 md:px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <IconCash className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Amount</p>
                    <p className="text-lg font-bold text-gray-900">{fmt(r.totalAmount)}</p>
                  </div>
                  <div className="flex gap-1.5 ml-2">
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {r.serviceType === "OTHER" ? r.customServiceLabel || "OTHER" : r.serviceType}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusBadge[r.status]}`}>{r.status}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${paymentBadge[r.paymentStatus]}`}>{r.paymentStatus}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setViewRecord(r)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm">
                    <IconEye className="h-4 w-4" /><span className="hidden sm:inline">Details</span>
                  </button>
                  <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-white rounded-lg transition-colors" title="Edit"><IconEdit className="h-4 w-4 text-blue-600" /></button>
                  <button onClick={() => setDeleteId(r._id)} className="p-1.5 hover:bg-white rounded-lg transition-colors" title="Delete"><IconTrash className="h-4 w-4 text-red-500" /></button>
                </div>
              </div>

              {/* Body — route + rider */}
              <div className="p-4 md:p-5 space-y-4">
                <div className="space-y-3">
                  {/* Pickup */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-blue-100 rounded-full"><IconMapPin className="h-4 w-4 text-blue-600" /></div>
                      <div className="w-0.5 h-full bg-gray-300 my-1" />
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-xs font-semibold text-blue-600 mb-1">PICKUP</p>
                      <p className="text-sm text-gray-900 font-medium">{r.pickupAddress || "—"}</p>
                    </div>
                  </div>
                  {/* Dropoff */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-green-100 rounded-full"><IconMapPin className="h-4 w-4 text-green-600" /></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-green-600 mb-1">DROPOFF</p>
                      <p className="text-sm text-gray-900 font-medium">{r.dropoffAddress || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Rider + balance */}
                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 rounded-lg"><IconTruck className="h-5 w-5 text-purple-600" /></div>
                    <div>
                      <p className="text-xs text-gray-500">Assigned Rider</p>
                      <p className="text-sm font-semibold text-gray-900">{r.driverName || "Not Assigned"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className={`text-sm font-bold ${r.balance > 0 ? "text-red-500" : "text-green-600"}`}>{fmt(r.balance)}</p>
                  </div>
                </div>
              </div>

            </div>
          ))
        )}

        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages} ({pagination.total} total)</p>
            <div className="flex gap-2">
              <button onClick={() => fetchRecords(pagination.page - 1)} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              <button onClick={() => fetchRecords(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">New Manual Record</h2>
              <button onClick={() => { setShowCreate(false); setError(""); }} className="p-1 hover:bg-gray-100 rounded-lg"><IconX className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="overflow-y-auto p-6 flex-1">{recordForm}</div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => { setShowCreate(false); setError(""); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} disabled={submitting} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
                {submitting && <IconLoader2 className="h-4 w-4 animate-spin" />} Create Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Edit Record</h2>
              <button onClick={() => { setEditRecord(null); setError(""); }} className="p-1 hover:bg-gray-100 rounded-lg"><IconX className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="overflow-y-auto p-6 flex-1">{recordForm}</div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => { setEditRecord(null); setError(""); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleUpdate} disabled={submitting} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
                {submitting && <IconLoader2 className="h-4 w-4 animate-spin" />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Record Details</h2>
              <button onClick={() => setViewRecord(null)} className="p-1 hover:bg-gray-100 rounded-lg"><IconX className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {viewRecord.serviceType === "OTHER" ? viewRecord.customServiceLabel || "OTHER" : viewRecord.serviceType}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusBadge[viewRecord.status]}`}>{viewRecord.status}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${paymentBadge[viewRecord.paymentStatus]}`}>{viewRecord.paymentStatus}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {([
                  ["Description", viewRecord.description],
                  ["Customer", viewRecord.customerName || "—"],
                  ["Phone", viewRecord.customerPhone || "—"],
                  ["Driver", viewRecord.driverName || "—"],
                  ["Driver Phone", viewRecord.driverPhone || "—"],
                  ["Plate", viewRecord.driverId?.plateNumber || "—"],
                  ["Vehicle", viewRecord.driverId ? `${viewRecord.driverId.vehicleMake || ""} ${viewRecord.driverId.vehicleModel || ""} (${viewRecord.driverId.vehicleType})`.trim() : "—"],
                  ["Pickup", viewRecord.pickupAddress || "—"],
                  ["Dropoff", viewRecord.dropoffAddress || "—"],
                  ["Delivery Fee", fmt(viewRecord.deliveryFee)],
                  ["Total Amount", fmt(viewRecord.totalAmount)],
                  ["Amount Paid", fmt(viewRecord.amountPaid)],
                  ["Balance", fmt(viewRecord.balance)],
                  ["Payment Method", viewRecord.paymentMethod],
                  ["Date", fmtDate(viewRecord.deliveryDate || viewRecord.createdAt)],
                  ["Recorded By", viewRecord.recordedBy?.name || "—"],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label}><p className="text-xs text-gray-500">{label}</p><p className="font-medium text-gray-900">{value}</p></div>
                ))}
                {viewRecord.notes && (
                  <div className="col-span-2"><p className="text-xs text-gray-500">Notes</p><p className="text-gray-700">{viewRecord.notes}</p></div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => { openEdit(viewRecord); setViewRecord(null); }} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                <IconEdit className="h-4 w-4" /> Edit
              </button>
              <button onClick={() => setViewRecord(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Delete Record?</h2>
            <p className="text-sm text-gray-500">This action is permanent and cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={submitting} className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50">
                {submitting && <IconLoader2 className="h-4 w-4 animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
