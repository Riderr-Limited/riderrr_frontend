"use client";

import { useState, useEffect } from "react";
import {
  IconPlus,
  IconUser,
  IconPhone,
  IconCar,
  IconCheck,
  IconX,
  IconEye,
  IconRefresh,
  IconPackage,
  IconCash,
  IconMapPin,
  IconId,
  IconCalendar,
  IconCarCrash,
  IconMail,
} from "@tabler/icons-react";
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

  const bgColor = {
    success: "bg-green-100 border-green-300 text-green-800",
    error: "bg-red-100 border-red-300 text-red-800",
    info: "bg-blue-100 border-blue-300 text-blue-800",
    warning: "bg-yellow-100 border-yellow-300 text-yellow-800",
  }[toast.type];

  const icon = {
    success: <IconCheck className="w-5 h-5 text-green-600" />,
    error: <IconX className="w-5 h-5 text-red-600" />,
    info: <IconMail className="w-5 h-5 text-blue-600" />,
    warning: <IconX className="w-5 h-5 text-yellow-600" />,
  }[toast.type];

  return (
    <div
      className={`flex items-center p-4 mb-2 rounded-lg border ${bgColor} shadow-lg animate-slideIn`}
    >
      <div className="mr-3">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-4 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <IconX className="w-4 h-4" />
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
    <div className="fixed top-4 right-4 z-100 max-w-md w-full">
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
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slideIn {
      animation: slideIn 0.3s ease-out;
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
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          <IconX className="w-3 h-3 mr-1" />
          Inactive
        </span>
      );
    }

    if (driver.isOnline) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          <IconCheck className="w-3 h-3 mr-1" />
          Online
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
        Offline
      </span>
    );
  };

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading riders...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchDrivers();
                showToast("Refreshing drivers list...", "info");
              }}
              className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow"
            >
              <IconRefresh className="w-4 h-4 mr-2" />
              Refresh
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <IconPlus className="w-4 h-4 mr-2" />
              Add Rider
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, phone, or plate number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <IconUser className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "online" | "offline",
                  )
                }
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-xl">
                <IconUser className="w-7 h-7 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Riders
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {drivers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-xl">
                <IconCheck className="w-7 h-7 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Online Now</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {drivers.filter((d) => d.isOnline && d.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-50 rounded-xl">
                <IconCar className="w-7 h-7 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Vehicles
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {drivers.filter((d) => d.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 rounded-xl">
                <IconPackage className="w-7 h-7 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Deliveries
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {drivers.reduce(
                    (sum, driver) => sum + (driver.stats?.totalDeliveries || 0),
                    0,
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Drivers Grid */}
        {filteredDrivers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <IconUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-600">No riders found</p>
            {searchTerm && (
              <p className="text-sm text-gray-500 mt-2">
                Try changing your search criteria
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrivers.map((driver) => (
              <div
                key={driver._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    {getStatusBadge(driver)}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-blue-600 font-bold text-2xl">
                        {driver.userId.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg truncate">
                        {driver.userId.name}
                      </h3>
                      <p className="text-blue-100 text-sm font-medium truncate">
                        {driver.userId.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Contact Info */}
                  <div className="flex items-center text-gray-700">
                    <IconPhone className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-sm font-medium">{driver.userId.phone}</span>
                  </div>

                  {/* Vehicle Info */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <IconCar className="w-5 h-5 mr-2 text-gray-500" />
                        <span className="text-sm font-semibold">
                          {driver.vehicleMake} {driver.vehicleModel}
                        </span>
                      </div>
                      <div
                        className="w-5 h-5 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: driver.vehicleColor.toLowerCase() }}
                        title={driver.vehicleColor}
                      />
                    </div>
                    <div className="flex items-center text-gray-600">
                      <IconId className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-xs font-mono font-semibold">
                        {driver.plateNumber}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <IconPackage className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {driver.stats?.totalDeliveries || 0}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">Deliveries</p>
                    </div>
                    <div className="text-center border-x border-gray-200">
                      <div className="flex items-center justify-center mb-1">
                        <IconCash className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        ₦{((driver.stats?.totalEarnings || 0) / 1000).toFixed(0)}k
                      </p>
                      <p className="text-xs text-gray-500 font-medium">Earnings</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <IconUser className="w-4 h-4 text-yellow-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {driver.rating?.average || 0}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">Rating</p>
                    </div>
                  </div>

                  {/* Approval Status */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">Status:</span>
                    {getApprovalStatusBadge(driver.approvalStatus)}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => handleViewProfile(driver)}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md group-hover:scale-[1.02]"
                  >
                    <IconEye className="w-4 h-4 mr-2" />
                    View Full Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Driver Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50">
            {/* No overlay/backdrop - just the modal positioned absolutely */}
            <div className="absolute inset-0">
              <div className="relative w-full h-full">
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Add New Rider
                      </h2>
                      <button
                        onClick={() => setShowAddModal(false)}
                        className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <IconX className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleAddDriver}>
                      <div className="space-y-6">
                        {/* Personal Information */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <IconUser className="w-5 h-5 mr-2 text-blue-600" />
                            Personal Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                minLength={2}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="John Doe"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address *
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="john.doe@example.com"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone Number *
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="+2348012345678"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                  Password *
                                </label>
                                <button
                                  type="button"
                                  onClick={generateRandomPassword}
                                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  Generate Strong Password
                                </button>
                              </div>
                              <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                minLength={6}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="SecurePass123!"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirm Password *
                              </label>
                              <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="Confirm password"
                              />
                              {passwordError && (
                                <p className="text-red-600 text-sm mt-2 font-medium">
                                  {passwordError}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Vehicle Information */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <IconCar className="w-5 h-5 mr-2 text-blue-600" />
                            Vehicle Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vehicle Type *
                              </label>
                              <select
                                name="vehicleType"
                                value={formData.vehicleType}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="bike">Bike</option>
                                <option value="car">Car</option>
                                <option value="van">Van</option>
                                <option value="truck">Truck</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vehicle Color *
                              </label>
                              <input
                                type="text"
                                name="vehicleColor"
                                value={formData.vehicleColor}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Black"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Plate Number *
                              </label>
                              <input
                                type="text"
                                name="plateNumber"
                                value={formData.plateNumber}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                                placeholder="ABC-123-XY"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Will be automatically converted to uppercase
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800 font-medium">
                            <strong className="font-bold">Note:</strong> After
                            creating the account, you&apos;ll need to verify the
                            driver&apos;s email address. A verification code
                            will be sent to their email.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setShowAddModal(false)}
                          className="px-5 py-2.5 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                        >
                          {isSubmitting ? "Adding..." : "Add Rider"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Verification Modal */}
        {showVerificationModal && verificationData && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0">
              <div className="relative w-full h-full">
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Verify Driver Email
                      </h2>
                      <button
                        onClick={() => setShowVerificationModal(false)}
                        className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <IconX className="w-6 h-6" />
                      </button>
                    </div>

                    {verificationSuccess ? (
                      <div className="text-center py-8">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                          <IconCheck className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Email Verified!
                        </h3>
                        <p className="text-gray-600 font-medium">
                          Driver&apos;s email has been verified successfully.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="text-center mb-6">
                          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                            <IconMail className="h-8 w-8 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Check Driver&apos;s Email
                          </h3>
                          <p className="text-gray-600 font-medium">
                            A 6-digit verification code has been sent to:
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {verificationData.email}
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Enter Verification Code
                            </label>
                            <input
                              type="text"
                              value={verificationCode}
                              onChange={handleVerificationCodeChange}
                              placeholder="000000"
                              maxLength={6}
                              className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                            {verificationError && (
                              <p className="text-red-600 text-sm mt-2 font-medium">
                                {verificationError}
                              </p>
                            )}
                          </div>

                          <div className="text-sm text-gray-600 space-y-2 font-medium">
                            <p>• Code expires in 10 minutes</p>
                            <p>• Check spam folder if not received</p>
                            <p>• Driver needs this verification to log in</p>
                          </div>

                          <div className="flex flex-col gap-3 pt-4">
                            <button
                              onClick={handleVerifyEmail}
                              disabled={
                                verificationLoading ||
                                verificationCode.length !== 6
                              }
                              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                            >
                              {verificationLoading
                                ? "Verifying..."
                                : "Verify Email"}
                            </button>

                            <button
                              onClick={handleResendVerification}
                              disabled={resendLoading}
                              className="w-full py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
                            >
                              {resendLoading ? "Sending..." : "Resend Code"}
                            </button>

                            <button
                              onClick={handleVerifyLater}
                              className="w-full py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                            >
                              Verify Later
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Profile Modal */}
        {showProfileModal && selectedDriver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
              {/* Header with Gradient */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 relative">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                >
                  <IconX className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-6">
                  <div className="h-24 w-24 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-blue-600 text-4xl font-bold">
                      {selectedDriver.userId.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-1">
                      {selectedDriver.userId.name}
                    </h2>
                    <p className="text-blue-100 font-medium mb-3">
                      {selectedDriver.userId.email}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDriver.isOnline ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-400 text-white">
                          <IconCheck className="w-3 h-3 mr-1" />
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-400 text-white">
                          Offline
                        </span>
                      )}
                      {selectedDriver.isVerified && (
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-white/20 text-white backdrop-blur-sm">
                          ✓ Verified
                        </span>
                      )}
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        selectedDriver.approvalStatus === 'approved' ? 'bg-green-400 text-white' :
                        selectedDriver.approvalStatus === 'rejected' ? 'bg-red-400 text-white' :
                        'bg-yellow-400 text-white'
                      }`}>
                        {selectedDriver.approvalStatus.charAt(0).toUpperCase() + selectedDriver.approvalStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-8">
                <div className="space-y-8">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                      <IconPackage className="w-8 h-8 text-purple-600 mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedDriver.stats?.totalDeliveries || 0}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">Total Deliveries</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                      <IconCash className="w-8 h-8 text-green-600 mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        ₦{(selectedDriver.stats?.totalEarnings || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">Total Earnings</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-xl border border-yellow-200">
                      <IconUser className="w-8 h-8 text-yellow-600 mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedDriver.rating?.average || 0}/5
                      </p>
                      <p className="text-sm text-gray-600 font-medium">Average Rating</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                      <IconCheck className="w-8 h-8 text-blue-600 mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedDriver.stats?.acceptanceRate || 0}%
                      </p>
                      <p className="text-sm text-gray-600 font-medium">Acceptance Rate</p>
                    </div>
                  </div>

                  {/* Information Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <IconPhone className="w-5 h-5 mr-2 text-blue-600" />
                        Contact Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Phone Number</p>
                          <p className="text-gray-900 font-semibold text-lg">{selectedDriver.userId.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">License Number</p>
                          <p className="text-gray-900 font-semibold">{selectedDriver.licenseNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">License Expiry</p>
                          <p className="text-gray-900 font-semibold">{formatDate(selectedDriver.licenseExpiry)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Information */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <IconCar className="w-5 h-5 mr-2 text-blue-600" />
                        Vehicle Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Vehicle</p>
                          <p className="text-gray-900 font-semibold text-lg">
                            {selectedDriver.vehicleMake} {selectedDriver.vehicleModel}
                          </p>
                          <p className="text-sm text-gray-600">Year: {selectedDriver.vehicleYear}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Plate Number</p>
                          <p className="text-gray-900 font-bold text-lg font-mono">{selectedDriver.plateNumber}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Color</p>
                            <p className="text-gray-900 font-semibold capitalize">{selectedDriver.vehicleColor}</p>
                          </div>
                          <div
                            className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                            style={{ backgroundColor: selectedDriver.vehicleColor.toLowerCase() }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity & Bank Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <IconMapPin className="w-5 h-5 mr-2 text-blue-600" />
                        Activity
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Last Online</p>
                          <p className="text-gray-900 font-semibold">{formatDate(selectedDriver.lastOnlineAt)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Member Since</p>
                          <p className="text-gray-900 font-semibold">{formatDate(selectedDriver.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    {selectedDriver.bankDetails && (
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <IconCash className="w-5 h-5 mr-2 text-blue-600" />
                          Bank Details
                        </h3>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold ${
                            selectedDriver.bankDetails.verified
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                          }`}>
                            {selectedDriver.bankDetails.verified ? (
                              <><IconCheck className="w-4 h-4 mr-2" /> Verified</>
                            ) : (
                              "Not Verified"
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-100 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => showToast("Edit functionality coming soon!", "info")}
                  className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
