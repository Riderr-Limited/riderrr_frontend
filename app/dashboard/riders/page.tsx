"use client";

import { useState, useEffect } from "react";
import {
  IconPlus,
  IconCheck,
  IconX,
  IconEye,
  IconEyeOff,
  IconRefresh,
  IconSearch,
  IconInfoCircle,
  IconAlertTriangle,
} from "@tabler/icons-react";
import {
  PageHeader,
  StatStrip,
  Stat,
  EmptyState,
  Field,
  Avatar,
} from "@/components/dashboard/primitives";
import { formatDate } from "../../lib/utils";
import { API_CONFIG } from "../../lib/config";
import { ApiClient } from "../../lib/api-client";

interface Driver {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    fullName: string;
    avatarUrl?: string;
  };
  licenseNumber: string;
  licenseExpiry: string;
  vehicleType: "car" | "bike" | "truck";
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  plateNumber: string;
  isAvailable: boolean;
  isOnline: boolean;
  isActive: boolean;
  isVerified: boolean;
  currentStatus: "online" | "offline" | "busy";
  approvalStatus: "pending" | "approved" | "rejected";
  stats: {
    totalDeliveries: number;
    totalEarnings: number;
    acceptanceRate: number;
  };
  rating: {
    average: number;
    totalRatings: number;
  };
  lastOnlineAt: string;
  createdAt: string;
  location?: {
    coordinates: [number, number];
    lastUpdated: string;
  };
  bankDetails?: {
    verified: boolean;
  };
}

interface AddDriverFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  vehicleType: "car" | "bike" | "van" | "truck";
  vehicleColor: string;
  plateNumber: string;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

// Toast Component
const Toast = ({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icon = {
    success: <IconCheck className="size-[18px] text-emerald-600" />,
    error: <IconAlertTriangle className="size-[18px] text-red-600" stroke={1.75} />,
    info: <IconInfoCircle className="size-[18px] text-brand-primary" stroke={1.75} />,
    warning: <IconAlertTriangle className="size-[18px] text-amber-600" stroke={1.75} />,
  }[toast.type];

  return (
    <div
      role="status"
      className="animate-slideIn mb-2 flex items-start gap-2.5 rounded-lg border border-brand-hairline bg-white py-3 pr-2.5 pl-3.5 shadow-elevated"
    >
      <div className="mt-px shrink-0">{icon}</div>
      <p className="min-w-0 flex-1 text-sm text-brand-ink">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 cursor-pointer rounded p-0.5 text-brand-ink-faint transition-colors hover:text-brand-ink"
        aria-label="Dismiss"
      >
        <IconX className="size-4" />
      </button>
    </div>
  );
};

// Toast Container Component
const ToastContainer = ({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-[68px] right-4 z-100 w-[calc(100%-2rem)] max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

// Add CSS animation
const addToastStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("toast-styles")) return;

  const style = document.createElement("style");
  style.id = "toast-styles";
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateY(-6px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    .animate-slideIn {
      animation: slideIn 0.18s ease-out;
    }
  `;
  document.head.appendChild(style);
};

export default function RidersPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "online" | "offline"
  >("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [verificationData, setVerificationData] = useState<{
    email: string;
    name: string;
    driverId?: string;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<AddDriverFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    vehicleType: "car",
    vehicleColor: "",
    plateNumber: "",
  });

  // Add toast styles on mount
  useEffect(() => {
    addToastStyles();
  }, []);

  const showToast = (message: string, type: Toast["type"] = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const fetchDrivers = async () => {
    try {
      setLoading(true);

      // Using centralized config
      const url = ApiClient.buildUrl(API_CONFIG.ENDPOINTS.COMPANY.DRIVERS);

      const data = await ApiClient.get(url);

      if (data.success) {
        setDrivers(data.data || []);
      }
    } catch (error) {
      showToast(`Failed to load riders: ${(error as Error).message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      showToast("Passwords do not match", "error");
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setPasswordError("");
    setIsSubmitting(true);

    try {
      // Using centralized config
      const url = ApiClient.buildUrl(
        API_CONFIG.ENDPOINTS.AUTH.SIGNUP_COMPANY_DRIVER,
      );

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        vehicleType: formData.vehicleType,
        vehicleColor: formData.vehicleColor,
        plateNumber: formData.plateNumber.toUpperCase(),
      };

      console.log("Sending payload:", payload);

      const result = await ApiClient.post(url, payload);

      if (!result.success) {
        throw new Error(result.message || "Failed to create driver account");
      }

      // Set verification data and show verification modal
      setVerificationData({
        email: formData.email,
        name: formData.name,
        driverId: result.data?.user?._id,
      });

      // Reset form and close add modal
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        vehicleType: "car",
        vehicleColor: "",
        plateNumber: "",
      });

      setShowAddModal(false);
      setShowVerificationModal(true);

      showToast(
        "Driver account created! Please verify their email.",
        "success",
      );
    } catch (error: unknown) {
      showToast(
        (error as Error).message || "Failed to add driver. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationData || !verificationCode) {
      setVerificationError("Please enter the verification code");
      showToast("Please enter the verification code", "error");
      return;
    }

    if (verificationCode.length !== 6) {
      setVerificationError("Verification code must be 6 digits");
      showToast("Verification code must be 6 digits", "error");
      return;
    }

    setVerificationError("");
    setVerificationLoading(true);

    try {
      // Using centralized config
      const url = ApiClient.buildUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL);

      const result = await ApiClient.post(url, {
        email: verificationData.email,
        token: verificationCode,
      });

      if (!result.success) {
        throw new Error(result.message || "Verification failed");
      }

      setVerificationSuccess(true);
      showToast(
        "Email verified successfully! Driver can now log in.",
        "success",
      );

      // Show success message
      setTimeout(() => {
        setShowVerificationModal(false);
        setVerificationCode("");
        setVerificationData(null);
        setVerificationSuccess(false);

        // Refresh drivers list
        fetchDrivers();
      }, 2000);
    } catch (error: unknown) {
      showToast((error as Error).message || "Failed to verify email", "error");
      setVerificationError(
        (error as Error).message || "Failed to verify email",
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationData) return;

    setResendLoading(true);
    setVerificationError("");

    try {
      // Using centralized config
      const url = ApiClient.buildUrl(
        API_CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION,
      );

      const result = await ApiClient.post(url, {
        email: verificationData.email,
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to resend verification code");
      }

      showToast(
        "Verification code has been resent to the driver's email!",
        "success",
      );
    } catch (error: unknown) {
      showToast(
        (error as Error).message || "Failed to resend verification code",
        "error",
      );
      setVerificationError((error as Error).message || "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyLater = () => {
    setShowVerificationModal(false);
    setVerificationCode("");
    setVerificationData(null);
    setVerificationError("");

    // Refresh drivers list
    fetchDrivers();

    showToast(
      "Driver added successfully! They can verify their email later.",
      "info",
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear password error when user types
    if (name.includes("password")) {
      setPasswordError("");
    }
  };

  const handleVerificationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(value);
    if (verificationError) setVerificationError("");
  };

  const handleViewProfile = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowProfileModal(true);
  };

  // Filter drivers based on search and status
  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.userId.phone.includes(searchTerm) ||
      driver.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "online" && driver.isOnline) ||
      (statusFilter === "offline" && !driver.isOnline);

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (driver: Driver) => {
    if (!driver.isActive) {
      return (
        <span className="dash-badge dash-badge-danger">Inactive</span>
      );
    }

    if (driver.isOnline) {
      return (
        <span className="dash-badge dash-badge-success">Online</span>
      );
    }

    return (
      <span className="dash-badge">Offline</span>
    );
  };

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="dash-badge dash-badge-success">Approved</span>
        );
      case "rejected":
        return (
          <span className="dash-badge dash-badge-danger">Rejected</span>
        );
      default:
        return (
          <span className="dash-badge dash-badge-warning">Pending</span>
        );
    }
  };

  const generateRandomPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({
      ...prev,
      password: password,
      confirmPassword: password,
    }));
    setPasswordError("");
    showToast("Strong password generated", "info");
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Riders"
          description="Manage and monitor the riders in your fleet."
        />
        <div className="dash-card divide-y divide-brand-hairline" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <div className="dash-skeleton size-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="dash-skeleton h-3 w-40" />
                <div className="dash-skeleton h-3 w-56" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div>
        <PageHeader
          title="Riders"
          description="Manage and monitor the riders in your fleet."
        >
          <button
            onClick={() => {
              fetchDrivers();
              showToast("Refreshing drivers list...", "info");
            }}
            className="dash-btn dash-btn-secondary"
          >
            <IconRefresh className="size-4" stroke={1.75} />
            Refresh
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="dash-btn dash-btn-primary"
          >
            <IconPlus className="size-4" />
            Add rider
          </button>
        </PageHeader>

        <div className="space-y-5">
          {/* Stats Summary */}
          <StatStrip className="grid-cols-2 lg:grid-cols-4">
            <Stat label="Total riders" value={drivers.length} />
            <Stat
              label="Online now"
              value={drivers.filter((d) => d.isOnline && d.isActive).length}
            />
            <Stat
              label="Active vehicles"
              value={drivers.filter((d) => d.isActive).length}
            />
            <Stat
              label="Total deliveries"
              value={drivers.reduce(
                (sum, driver) => sum + (driver.stats?.totalDeliveries || 0),
                0,
              )}
            />
          </StatStrip>

          {/* Filters */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1 sm:max-w-sm">
              <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brand-ink-faint" />
              <input
                type="text"
                placeholder="Search by name, phone or plate number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dash-input pl-9"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | "online" | "offline",
                )
              }
              className="dash-input sm:w-40"
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* Riders */}
          {filteredDrivers.length === 0 ? (
            <div className="dash-card">
              <EmptyState
                title="No riders found"
                description={
                  searchTerm ? "Try changing your search criteria." : undefined
                }
              />
            </div>
          ) : (
            <div className="dash-card overflow-hidden">
              {/* Wide screens: table */}
              <table className="hidden w-full text-left text-sm xl:table">
                <thead>
                  <tr className="border-b border-brand-hairline text-xs text-brand-ink-muted">
                    <th className="px-5 py-2.5 font-medium">Rider</th>
                    <th className="px-3 py-2.5 font-medium">Phone</th>
                    <th className="px-3 py-2.5 font-medium">Vehicle</th>
                    <th className="px-3 py-2.5 text-right font-medium">Deliveries</th>
                    <th className="px-3 py-2.5 text-right font-medium">Earnings</th>
                    <th className="px-3 py-2.5 text-right font-medium">Rating</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-hairline">
                  {filteredDrivers.map((driver) => (
                    <tr key={driver._id} className="transition-colors hover:bg-brand-canvas-soft/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={driver.userId.name} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-brand-ink">
                              {driver.userId.name}
                            </p>
                            <p className="truncate text-xs text-brand-ink-muted">
                              {driver.userId.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-brand-ink-secondary tabular-nums">
                        {driver.userId.phone}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
                            style={{
                              backgroundColor: driver.vehicleColor.toLowerCase(),
                            }}
                            title={driver.vehicleColor}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-brand-ink-secondary">
                              {driver.vehicleMake} {driver.vehicleModel}
                            </p>
                            <p className="font-mono text-xs text-brand-ink-muted">
                              {driver.plateNumber}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right text-brand-ink-secondary tabular-nums">
                        {driver.stats?.totalDeliveries || 0}
                      </td>
                      <td className="px-3 py-3 text-right text-brand-ink-secondary tabular-nums">
                        ₦
                        {((driver.stats?.totalEarnings || 0) / 1000).toFixed(0)}
                        k
                      </td>
                      <td className="px-3 py-3 text-right text-brand-ink-secondary tabular-nums">
                        {driver.rating?.average || 0}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {getStatusBadge(driver)}
                          {getApprovalStatusBadge(driver.approvalStatus)}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleViewProfile(driver)}
                          className="dash-btn dash-btn-sm dash-btn-secondary"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Narrow screens: stacked rows */}
              <div className="divide-y divide-brand-hairline xl:hidden">
                {filteredDrivers.map((driver) => (
                  <div key={driver._id} className="px-4 py-4 sm:px-5">
                    <div className="flex items-start gap-3">
                      <Avatar name={driver.userId.name} className="size-9" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-brand-ink">
                          {driver.userId.name}
                        </p>
                        <p className="truncate text-xs text-brand-ink-muted">
                          {driver.userId.email}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewProfile(driver)}
                        className="dash-btn dash-btn-sm dash-btn-secondary"
                      >
                        View
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {getStatusBadge(driver)}
                      {getApprovalStatusBadge(driver.approvalStatus)}
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm sm:grid-cols-4">
                      <div className="min-w-0">
                        <dt className="dash-eyebrow">Phone</dt>
                        <dd className="truncate text-brand-ink-secondary tabular-nums">
                          {driver.userId.phone}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="dash-eyebrow">Vehicle</dt>
                        <dd className="flex items-center gap-1.5 text-brand-ink-secondary">
                          <span
                            className="size-2 shrink-0 rounded-full ring-1 ring-black/10"
                            style={{
                              backgroundColor: driver.vehicleColor.toLowerCase(),
                            }}
                            title={driver.vehicleColor}
                          />
                          <span className="truncate font-mono text-xs">
                            {driver.plateNumber}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="dash-eyebrow">Deliveries</dt>
                        <dd className="text-brand-ink-secondary tabular-nums">
                          {driver.stats?.totalDeliveries || 0}
                        </dd>
                      </div>
                      <div>
                        <dt className="dash-eyebrow">Earnings · Rating</dt>
                        <dd className="text-brand-ink-secondary tabular-nums">
                          ₦
                          {((driver.stats?.totalEarnings || 0) / 1000).toFixed(0)}
                          k · {driver.rating?.average || 0}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Driver Modal */}
        {showAddModal && (
          <div className="dash-overlay">
            <div className="dash-modal max-w-xl">
              <div className="dash-modal-header">
                <div>
                  <h2 className="dash-modal-title">Add rider</h2>
                  <p className="mt-0.5 text-[13px] text-brand-ink-muted">
                    A verification code is emailed to the rider once the
                    account is created.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="dash-icon-btn -mr-1.5"
                  aria-label="Close"
                >
                  <IconX className="size-[18px]" />
                </button>
              </div>

              <form onSubmit={handleAddDriver} className="flex min-h-0 flex-1 flex-col">
                <div className="dash-modal-body space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-brand-ink">
                      Personal information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="dash-label">Full name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          minLength={2}
                          className="dash-input"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="dash-label">Email address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="dash-input"
                          placeholder="john.doe@example.com"
                        />
                      </div>

                      <div>
                        <label className="dash-label">Phone number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="dash-input"
                          placeholder="+2348012345678"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <div className="mb-1.5 flex items-center justify-between">
                          <label className="dash-label mb-0">Password</label>
                          <button
                            type="button"
                            onClick={generateRandomPassword}
                            className="cursor-pointer text-[13px] font-medium text-brand-primary hover:text-brand-primary-active"
                          >
                            Generate password
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            minLength={6}
                            className="dash-input pr-10"
                            placeholder="At least 6 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-brand-ink-faint hover:text-brand-ink-muted"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <IconEyeOff className="size-[18px]" stroke={1.75} />
                            ) : (
                              <IconEye className="size-[18px]" stroke={1.75} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="dash-label">Confirm password</label>
                        <div className="relative">
                          <input
                            type={
                              showConfirmPassword ? "text" : "password"
                            }
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                            className="dash-input pr-10"
                            placeholder="Repeat the password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-brand-ink-faint hover:text-brand-ink-muted"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            {showConfirmPassword ? (
                              <IconEyeOff className="size-[18px]" stroke={1.75} />
                            ) : (
                              <IconEye className="size-[18px]" stroke={1.75} />
                            )}
                          </button>
                        </div>
                        {passwordError && (
                          <p className="mt-1.5 text-[13px] text-red-600">
                            {passwordError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div className="border-t border-brand-hairline pt-5">
                    <h3 className="mb-3 text-sm font-semibold text-brand-ink">
                      Vehicle information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="dash-label">Vehicle type</label>
                        <select
                          name="vehicleType"
                          value={formData.vehicleType}
                          onChange={handleInputChange}
                          required
                          className="dash-input"
                        >
                          <option value="bike">Bike</option>
                          <option value="car">Car</option>
                          <option value="van">Van</option>
                          <option value="truck">Truck</option>
                        </select>
                      </div>

                      <div>
                        <label className="dash-label">Vehicle color</label>
                        <input
                          type="text"
                          name="vehicleColor"
                          value={formData.vehicleColor}
                          onChange={handleInputChange}
                          required
                          className="dash-input"
                          placeholder="Black"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="dash-label">Plate number</label>
                        <input
                          type="text"
                          name="plateNumber"
                          value={formData.plateNumber}
                          onChange={handleInputChange}
                          required
                          className="dash-input uppercase placeholder:normal-case"
                          placeholder="ABC-123-XY"
                        />
                        <p className="mt-1.5 text-xs text-brand-ink-muted">
                          Saved in uppercase.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dash-modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="dash-btn dash-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="dash-btn dash-btn-primary"
                  >
                    {isSubmitting ? "Adding..." : "Add rider"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Email Verification Modal */}
        {showVerificationModal && verificationData && (
          <div className="dash-overlay">
            <div className="dash-modal max-w-sm">
              <div className="dash-modal-header">
                <h2 className="dash-modal-title">Verify rider email</h2>
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="dash-icon-btn -mr-1.5"
                  aria-label="Close"
                >
                  <IconX className="size-[18px]" />
                </button>
              </div>

              <div className="dash-modal-body">
                {verificationSuccess ? (
                  <div className="py-6 text-center">
                    <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <IconCheck className="size-5" />
                    </span>
                    <h3 className="mt-3 text-sm font-semibold text-brand-ink">
                      Email verified
                    </h3>
                    <p className="mt-1 text-sm text-brand-ink-muted">
                      The rider can now log in.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-brand-ink-muted">
                      Enter the 6-digit code sent to{" "}
                      <span className="font-medium break-all text-brand-ink">
                        {verificationData.email}
                      </span>
                      . The rider needs this to log in.
                    </p>

                    <div>
                      <label className="dash-label">Verification code</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={verificationCode}
                        onChange={handleVerificationCodeChange}
                        placeholder="000000"
                        maxLength={6}
                        className="dash-input h-12 text-center font-mono text-xl tracking-[0.4em]"
                      />
                      {verificationError ? (
                        <p className="mt-1.5 text-[13px] text-red-600">
                          {verificationError}
                        </p>
                      ) : (
                        <p className="mt-1.5 text-xs text-brand-ink-muted">
                          The code expires in 10 minutes. Ask the rider to
                          check spam if it hasn&apos;t arrived.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      <button
                        onClick={handleVerifyEmail}
                        disabled={
                          verificationLoading ||
                          verificationCode.length !== 6
                        }
                        className="dash-btn dash-btn-primary w-full"
                      >
                        {verificationLoading
                          ? "Verifying..."
                          : "Verify email"}
                      </button>

                      <button
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                        className="dash-btn dash-btn-secondary w-full"
                      >
                        {resendLoading ? "Sending..." : "Resend code"}
                      </button>

                      <button
                        onClick={handleVerifyLater}
                        className="dash-btn dash-btn-ghost w-full"
                      >
                        Verify later
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View Profile Modal */}
        {showProfileModal && selectedDriver && (
          <div className="dash-overlay">
            <div className="dash-modal max-w-2xl">
              <div className="dash-modal-header">
                <div className="flex min-w-0 items-center gap-3.5">
                  <Avatar name={selectedDriver.userId.name} className="size-11 text-base" />
                  <div className="min-w-0">
                    <h2 className="dash-modal-title truncate">
                      {selectedDriver.userId.name}
                    </h2>
                    <p className="truncate text-[13px] text-brand-ink-muted">
                      {selectedDriver.userId.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="dash-icon-btn -mr-1.5"
                  aria-label="Close"
                >
                  <IconX className="size-[18px]" />
                </button>
              </div>

              <div className="dash-modal-body space-y-6">
                <div className="flex flex-wrap gap-1.5">
                  {selectedDriver.isOnline ? (
                    <span className="dash-badge dash-badge-success">Online</span>
                  ) : (
                    <span className="dash-badge">Offline</span>
                  )}
                  {selectedDriver.isVerified && (
                    <span className="dash-badge dash-badge-info">Verified</span>
                  )}
                  <span
                    className={`dash-badge ${
                      selectedDriver.approvalStatus === "approved"
                        ? "dash-badge-success"
                        : selectedDriver.approvalStatus === "rejected"
                          ? "dash-badge-danger"
                          : "dash-badge-warning"
                    }`}
                  >
                    {selectedDriver.approvalStatus.charAt(0).toUpperCase() +
                      selectedDriver.approvalStatus.slice(1)}
                  </span>
                </div>

                <StatStrip className="grid-cols-2 sm:grid-cols-4">
                  <Stat
                    label="Deliveries"
                    value={selectedDriver.stats?.totalDeliveries || 0}
                    compact
                  />
                  <Stat
                    label="Earnings"
                    value={`₦${(
                      selectedDriver.stats?.totalEarnings || 0
                    ).toLocaleString()}`}
                    compact
                  />
                  <Stat
                    label="Rating"
                    value={`${selectedDriver.rating?.average || 0}/5`}
                    compact
                  />
                  <Stat
                    label="Acceptance"
                    value={`${selectedDriver.stats?.acceptanceRate || 0}%`}
                    compact
                  />
                </StatStrip>

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-brand-ink">
                    Contact and licence
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                    <Field label="Phone number">{selectedDriver.userId.phone}</Field>
                    <Field label="License number">
                      {selectedDriver.licenseNumber || "—"}
                    </Field>
                    <Field label="License expiry">
                      {formatDate(selectedDriver.licenseExpiry)}
                    </Field>
                  </div>
                </section>

                <section className="border-t border-brand-hairline pt-5">
                  <h3 className="mb-3 text-sm font-semibold text-brand-ink">
                    Vehicle
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                    <Field label="Vehicle">
                      {selectedDriver.vehicleMake}{" "}
                      {selectedDriver.vehicleModel}
                      <span className="block text-xs text-brand-ink-muted">
                        Year: {selectedDriver.vehicleYear}
                      </span>
                    </Field>
                    <Field label="Plate number">
                      <span className="font-mono">{selectedDriver.plateNumber}</span>
                    </Field>
                    <Field label="Color">
                      <span className="flex items-center gap-2 capitalize">
                        <span
                          className="size-3 shrink-0 rounded-full ring-1 ring-black/10"
                          style={{
                            backgroundColor:
                              selectedDriver.vehicleColor.toLowerCase(),
                          }}
                        />
                        {selectedDriver.vehicleColor}
                      </span>
                    </Field>
                  </div>
                </section>

                <section className="border-t border-brand-hairline pt-5">
                  <h3 className="mb-3 text-sm font-semibold text-brand-ink">
                    Activity
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                    <Field label="Last online">
                      {formatDate(selectedDriver.lastOnlineAt)}
                    </Field>
                    <Field label="Member since">
                      {formatDate(selectedDriver.createdAt)}
                    </Field>
                    {selectedDriver.bankDetails && (
                      <Field label="Bank details">
                        <span
                          className={`dash-badge mt-0.5 ${
                            selectedDriver.bankDetails.verified
                              ? "dash-badge-success"
                              : "dash-badge-warning"
                          }`}
                        >
                          {selectedDriver.bankDetails.verified
                            ? "Verified"
                            : "Not verified"}
                        </span>
                      </Field>
                    )}
                  </div>
                </section>
              </div>

              <div className="dash-modal-footer">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="dash-btn dash-btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() =>
                    showToast("Edit functionality coming soon!", "info")
                  }
                  className="dash-btn dash-btn-primary"
                >
                  Edit profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
