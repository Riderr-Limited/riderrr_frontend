"use client";

import { useEffect, useState, useCallback } from "react";
import {
  IconPlus,
  IconRefresh,
  IconSearch,
  IconEdit,
  IconTrash,
  IconX,
  IconLoader2,
} from "@tabler/icons-react";
import {
  PageHeader,
  StatStrip,
  Stat,
  EmptyState,
  Field,
  RouteStops,
  humanize,
} from "@/components/dashboard/primitives";
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
  PAID: "dash-badge-success",
  PARTIAL: "dash-badge-warning",
  UNPAID: "dash-badge-danger",
};

const statusBadge: Record<RecordStatus, string> = {
  COMPLETED: "dash-badge-success",
  PENDING: "dash-badge-warning",
  CANCELLED: "dash-badge-danger",
  FAILED: "dash-badge-danger",
};

const inputCls = "dash-input";

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
        <div className="dash-notice dash-notice-danger">{error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="dash-label">Service Type *</label>
          <select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value as ServiceType })} className={inputCls}>
            {["DELIVERY", "ERRAND", "PAY_ON_DELIVERY", "RIDE", "OTHER"].map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
          </select>
        </div>
        {form.serviceType === "OTHER" && (
          <div>
            <label className="dash-label">Custom Label *</label>
            <input value={form.customServiceLabel} onChange={(e) => setForm({ ...form, customServiceLabel: e.target.value })} className={inputCls} placeholder="e.g. Laundry pickup" />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="dash-label">Description *</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputCls} placeholder="Brief description of the service" />
        </div>
        <div className="sm:col-span-2">
          <label className="dash-label">Assign Driver</label>
          <select value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} className={inputCls}>
            <option value="">No driver</option>
            {drivers.map((d) => <option key={d._id} value={d._id}>{d.name} · {d.plateNumber} · {d.vehicleType}</option>)}
          </select>
        </div>
        <div>
          <label className="dash-label">Customer Name</label>
          <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className={inputCls} placeholder="John Doe" />
        </div>
        <div>
          <label className="dash-label">Customer Phone</label>
          <input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className={inputCls} placeholder="08012345678" />
        </div>
        <div>
          <label className="dash-label">Pickup Address</label>
          <input value={form.pickupAddress} onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className="dash-label">Dropoff Address</label>
          <input value={form.dropoffAddress} onChange={(e) => setForm({ ...form, dropoffAddress: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className="dash-label">Delivery Fee (₦)</label>
          <input type="number" min="0" value={form.deliveryFee} onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })} className={inputCls} placeholder="0" />
        </div>
        <div>
          <label className="dash-label">Amount Paid (₦)</label>
          <input type="number" min="0" value={form.amountPaid} onChange={(e) => setForm({ ...form, amountPaid: e.target.value })} className={inputCls} placeholder="0" />
        </div>
        <div>
          <label className="dash-label">Payment Method</label>
          <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })} className={inputCls}>
            {["CASH", "TRANSFER", "POS", "CREDIT", "OTHER"].map((m) => <option key={m} value={m}>{humanize(m)}</option>)}
          </select>
        </div>
        <div>
          <label className="dash-label">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as RecordStatus })} className={inputCls}>
            {["COMPLETED", "PENDING", "CANCELLED", "FAILED"].map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
          </select>
        </div>
        <div>
          <label className="dash-label">Delivery Date</label>
          <input type="date" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="dash-label">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={inputCls} placeholder="Optional notes" />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Manual Records"
        description="Track services not captured automatically."
      >
        <button onClick={() => { fetchRecords(1); fetchSummary(); }} className="dash-btn dash-btn-secondary">
          <IconRefresh className={`size-4 ${loading ? "animate-spin" : ""}`} stroke={1.75} /> Refresh
        </button>
        <button onClick={() => { setForm(EMPTY_FORM); setError(""); setShowCreate(true); }} className="dash-btn dash-btn-primary">
          <IconPlus className="size-4" /> New record
        </button>
      </PageHeader>

      <div className="space-y-5">
        {/* Summary */}
        {summaryLoading ? (
          <StatStrip className="grid-cols-2 lg:grid-cols-4">
            {["Total records", "Total amount", "Total paid", "Outstanding"].map((label) => (
              <Stat key={label} label={label} value="" loading />
            ))}
          </StatStrip>
        ) : summary ? (
          <StatStrip className="grid-cols-2 lg:grid-cols-4">
            <Stat label="Total records" value={summary.byType.reduce((a, b) => a + b.count, 0)} />
            <Stat label="Total amount" value={fmt(summary.byType.reduce((a, b) => a + b.totalAmount, 0))} />
            <Stat label="Total paid" value={fmt(summary.byPayment.find((p) => p._id === "PAID")?.totalAmount || 0)} />
            <Stat label="Outstanding" value={fmt(summary.byType.reduce((a, b) => a + b.totalAmount - b.totalPaid, 0))} />
          </StatStrip>
        ) : null}

        {/* Filters */}
        <div className="flex flex-col gap-2 lg:flex-row">
          <div className="relative flex-1">
            <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brand-ink-faint" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search description, customer or driver" className="dash-input pl-9" />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex">
            <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="dash-input lg:w-44" aria-label="Service type">
              <option value="all">All services</option>
              {["DELIVERY", "ERRAND", "PAY_ON_DELIVERY", "RIDE", "OTHER"].map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
            </select>
            <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className="dash-input lg:w-40" aria-label="Payment status">
              <option value="all">All payments</option>
              {["PAID", "PARTIAL", "UNPAID"].map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="dash-input lg:w-40" aria-label="Record status">
              <option value="all">All statuses</option>
              {["COMPLETED", "PENDING", "CANCELLED", "FAILED"].map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
            </select>
          </div>
        </div>

        {/* Records List */}
        <div className="dash-card overflow-hidden">
          <div className="divide-y divide-brand-hairline">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2.5 px-5 py-4">
                  <div className="dash-skeleton h-3.5 w-3/5" /><div className="dash-skeleton h-3.5 w-2/5" />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <EmptyState title="No records found" description="Create a record or adjust your filters." />
            ) : (
              filtered.map((r) => (
                <div key={r._id} className="px-5 py-4">
                  {/* Top line — badges + actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <span className="mr-1 text-sm font-medium text-brand-ink">
                        {r.serviceType === "OTHER" ? r.customServiceLabel || "Other" : humanize(r.serviceType)}
                      </span>
                      <span className={`dash-badge ${statusBadge[r.status]}`}>{humanize(r.status)}</span>
                      <span className={`dash-badge ${paymentBadge[r.paymentStatus]}`}>{humanize(r.paymentStatus)}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button onClick={() => setViewRecord(r)} className="dash-btn dash-btn-sm dash-btn-secondary mr-1">
                        Details
                      </button>
                      <button onClick={() => openEdit(r)} className="dash-icon-btn" title="Edit" aria-label="Edit"><IconEdit className="size-4" stroke={1.75} /></button>
                      <button onClick={() => setDeleteId(r._id)} className="dash-icon-btn hover:bg-red-50 hover:text-red-600" title="Delete" aria-label="Delete"><IconTrash className="size-4" stroke={1.75} /></button>
                    </div>
                  </div>

                  {/* Route, rider and amounts */}
                  <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-[minmax(0,1fr)_150px_130px_130px]">
                    <RouteStops pickup={r.pickupAddress} dropoff={r.dropoffAddress} className="col-span-2 md:col-span-1" />
                    <Field label="Rider" className="col-span-2 md:col-span-1">
                      <span className={r.driverName ? "" : "text-brand-ink-faint"}>{r.driverName || "Not assigned"}</span>
                    </Field>
                    <Field label="Total amount">
                      <span className="font-medium tabular-nums">{fmt(r.totalAmount)}</span>
                    </Field>
                    <Field label="Balance">
                      <span className={`font-medium tabular-nums ${r.balance > 0 ? "text-red-600" : "text-emerald-700"}`}>{fmt(r.balance)}</span>
                    </Field>
                  </div>
                </div>
              ))
            )}
          </div>

          {!loading && pagination.pages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-brand-hairline px-5 py-3">
              <p className="text-[13px] text-brand-ink-muted tabular-nums">
                Page {pagination.page} of {pagination.pages}
                <span className="hidden sm:inline"> · {pagination.total} total</span>
              </p>
              <div className="flex gap-2">
                <button onClick={() => fetchRecords(pagination.page - 1)} disabled={pagination.page === 1} className="dash-btn dash-btn-sm dash-btn-secondary">Previous</button>
                <button onClick={() => fetchRecords(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="dash-btn dash-btn-sm dash-btn-secondary">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="dash-overlay">
          <div className="dash-modal max-w-2xl">
            <div className="dash-modal-header">
              <h2 className="dash-modal-title">New manual record</h2>
              <button onClick={() => { setShowCreate(false); setError(""); }} className="dash-icon-btn -mr-1.5" aria-label="Close"><IconX className="size-[18px]" /></button>
            </div>
            <div className="dash-modal-body">{recordForm}</div>
            <div className="dash-modal-footer">
              <button onClick={() => { setShowCreate(false); setError(""); }} className="dash-btn dash-btn-secondary">Cancel</button>
              <button onClick={handleCreate} disabled={submitting} className="dash-btn dash-btn-primary">
                {submitting && <IconLoader2 className="size-4 animate-spin" />} Create record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editRecord && (
        <div className="dash-overlay">
          <div className="dash-modal max-w-2xl">
            <div className="dash-modal-header">
              <h2 className="dash-modal-title">Edit record</h2>
              <button onClick={() => { setEditRecord(null); setError(""); }} className="dash-icon-btn -mr-1.5" aria-label="Close"><IconX className="size-[18px]" /></button>
            </div>
            <div className="dash-modal-body">{recordForm}</div>
            <div className="dash-modal-footer">
              <button onClick={() => { setEditRecord(null); setError(""); }} className="dash-btn dash-btn-secondary">Cancel</button>
              <button onClick={handleUpdate} disabled={submitting} className="dash-btn dash-btn-primary">
                {submitting && <IconLoader2 className="size-4 animate-spin" />} Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewRecord && (
        <div className="dash-overlay">
          <div className="dash-modal max-w-lg">
            <div className="dash-modal-header">
              <div className="min-w-0">
                <h2 className="dash-modal-title">Record details</h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="dash-badge dash-badge-info">
                    {viewRecord.serviceType === "OTHER" ? viewRecord.customServiceLabel || "Other" : humanize(viewRecord.serviceType)}
                  </span>
                  <span className={`dash-badge ${statusBadge[viewRecord.status]}`}>{humanize(viewRecord.status)}</span>
                  <span className={`dash-badge ${paymentBadge[viewRecord.paymentStatus]}`}>{humanize(viewRecord.paymentStatus)}</span>
                </div>
              </div>
              <button onClick={() => setViewRecord(null)} className="dash-icon-btn -mr-1.5" aria-label="Close"><IconX className="size-[18px]" /></button>
            </div>
            <div className="dash-modal-body">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
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
                  ["Payment Method", humanize(viewRecord.paymentMethod)],
                  ["Date", fmtDate(viewRecord.deliveryDate || viewRecord.createdAt)],
                  ["Recorded By", viewRecord.recordedBy?.name || "—"],
                ] as [string, string][]).map(([label, value]) => (
                  <Field key={label} label={label}>{value}</Field>
                ))}
                {viewRecord.notes && (
                  <Field label="Notes" className="col-span-2">
                    <span className="text-brand-ink-secondary">{viewRecord.notes}</span>
                  </Field>
                )}
              </div>
            </div>
            <div className="dash-modal-footer">
              <button onClick={() => setViewRecord(null)} className="dash-btn dash-btn-secondary">Close</button>
              <button onClick={() => { openEdit(viewRecord); setViewRecord(null); }} className="dash-btn dash-btn-primary">
                <IconEdit className="size-4" stroke={1.75} /> Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="dash-overlay">
          <div className="dash-modal max-w-sm">
            <div className="dash-modal-body">
              <h2 className="dash-modal-title">Delete record?</h2>
              <p className="mt-1 text-sm text-brand-ink-muted">This action is permanent and cannot be undone.</p>
            </div>
            <div className="dash-modal-footer">
              <button onClick={() => setDeleteId(null)} className="dash-btn dash-btn-secondary">Cancel</button>
              <button onClick={handleDelete} disabled={submitting} className="dash-btn dash-btn-danger">
                {submitting && <IconLoader2 className="size-4 animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
