"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building,
  Phone,
  Mail,
  Calendar,
  Edit2,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Package,
  DollarSign,
  CreditCard,
  RefreshCw,
  X,
  Lock,
  Globe,
  FileText,
  ArrowRight,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/libs/utils";
import { useAuth } from "@/contexts/AuthContext";
import { API_CONFIG } from "../../lib/config";
import { ApiClient } from "../../lib/api-client";

interface BankAccount {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName: string;
  verified: boolean;
}

interface CompanySettings {
  autoAccept: boolean;
  commissionRate: number;
  notificationChannels: string[];
  operatingHours: { start: string; end: string };
}

interface CompanyStats {
  totalDrivers: number;
  onlineDrivers: number;
  totalDeliveries: number;
  totalEarnings: number;
}

interface CompanyProfile {
  _id: string;
  name: string;
  slug: string;
  businessLicense: string;
  taxId: string;
  address: string;
  city: string;
  state: string;
  lga: string;
  contactPhone: string;
  contactEmail: string;
  logoUrl: string | null;
  status: string;
  isActive: boolean;
  description?: string;
  website?: string;
  bankAccount: BankAccount;
  settings: CompanySettings;
  stats: CompanyStats;
  createdAt: string;
}

const emptyForm = {
  name: "",
  address: "",
  city: "",
  state: "",
  lga: "",
  contactPhone: "",
  contactEmail: "",
  description: "",
  website: "",
  businessLicense: "",
  taxId: "",
};

export default function CompanyProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  // Change password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = ApiClient.buildUrl(API_CONFIG.ENDPOINTS.COMPANY.PROFILE);
      const data = await ApiClient.get(url);
      if (data.success && data.data) {
        const p: CompanyProfile = data.data;
        setProfile(p);
        setFormData({
          name: p.name || "",
          address: p.address || "",
          city: p.city || "",
          state: p.state || "",
          lga: p.lga || "",
          contactPhone: p.contactPhone || "",
          contactEmail: p.contactEmail || "",
          description: p.description || "",
          website: p.website || "",
          businessLicense: p.businessLicense || "",
          taxId: p.taxId || "",
        });
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load company profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "company_admin") {
      fetchProfile();
    } else {
      setError("Only company administrators can access this page");
      setLoading(false);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const url = ApiClient.buildUrl(API_CONFIG.ENDPOINTS.COMPANY.PROFILE);
      const data = await ApiClient.put(url, formData);
      if (data.success) {
        await fetchProfile();
        setEditing(false);
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    try {
      setPasswordSaving(true);
      setError(null);
      const url = ApiClient.buildUrl(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD);
      const data = await ApiClient.post(url, passwordData);
      if (data.success) {
        setSuccessMessage("Password changed successfully!");
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  const field = (
    label: string,
    key: keyof typeof emptyForm,
    type = "text",
    colSpan = false
  ) => (
    <div className={colSpan ? "md:col-span-2" : ""}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {editing ? (
        <input
          type={type}
          value={formData[key]}
          onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      ) : (
        <p className="text-gray-900">{(profile as unknown as Record<string, string>)?.[key] || "—"}</p>
      )}
    </div>
  );

  const formatCurrency = (amount: number) =>
    `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

  const formatDate = (dateString: string) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : "N/A";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-gray-200 rounded-xl" />
              <div className="h-48 bg-gray-200 rounded-xl" />
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Company Profile Found</h2>
          <p className="text-gray-600">{error || "Please contact support."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={fetchProfile}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
          </button>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setEditing(false); fetchProfile(); }}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3 shrink-0" />
            <p className="text-green-700 flex-1">{successMessage}</p>
            <button onClick={() => setSuccessMessage(null)}><XCircle className="h-5 w-5 text-green-500" /></button>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 shrink-0" />
            <p className="text-red-700 flex-1">{error}</p>
            <button onClick={() => setError(null)}><XCircle className="h-5 w-5 text-red-500" /></button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-600" />
                  Company Information
                </h2>
                <StatusBadge status={profile.status} />
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {field("Company Name", "name")}
                {field("Business License", "businessLicense")}
                {field("Tax ID", "taxId")}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(profile.createdAt)}
                  </div>
                </div>

                {field("Street Address", "address", "text", true)}
                {field("City", "city")}
                {field("State", "state")}
                {field("LGA", "lga")}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {profile.contactPhone}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {profile.contactEmail}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  {editing ? (
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Globe className="h-4 w-4 mr-2 text-gray-400" />
                      {profile.website || "—"}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  {editing ? (
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="About your company..."
                    />
                  ) : (
                    <div className="flex items-start text-gray-900">
                      <FileText className="h-4 w-4 mr-2 mt-0.5 text-gray-400 shrink-0" />
                      {profile.description || "—"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bank Account */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-emerald-600" />
                  Bank Account
                </h2>
                {profile.bankAccount?.verified ? (
                  <span className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center text-sm text-yellow-600">
                    <AlertCircle className="h-4 w-4 mr-1" /> Pending Verification
                  </span>
                )}
              </div>

              {profile.bankAccount?.accountNumber ? (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                      <p className="text-gray-900">{profile.bankAccount.accountName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                      <p className="text-gray-900">{profile.bankAccount.accountNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                      <p className="text-gray-900">{profile.bankAccount.bankName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Code</label>
                      <p className="text-gray-900">{profile.bankAccount.bankCode}</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/bank-setup"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-medium"
                  >
                    <CreditCard className="h-4 w-4" />
                    Manage Bank Account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="p-6 flex flex-col items-center text-center gap-3">
                  <CreditCard className="h-10 w-10 text-gray-300" />
                  <p className="text-sm text-gray-500">No bank account set up yet.</p>
                  <Link
                    href="/dashboard/bank-setup"
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                  >
                    <CreditCard className="h-4 w-4" />
                    Set Up Bank Account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-gray-600" />
                  Change Password
                </h2>
                <button
                  onClick={() => setShowPasswordForm((v) => !v)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showPasswordForm ? "Cancel" : "Change"}
                </button>
              </div>
              {showPasswordForm && (
                <div className="p-6 space-y-4">
                  {(["currentPassword", "newPassword", "confirmPassword"] as const).map((key) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {key === "currentPassword" ? "Current Password" : key === "newPassword" ? "New Password" : "Confirm New Password"}
                      </label>
                      <input
                        type="password"
                        value={passwordData[key]}
                        onChange={(e) => setPasswordData((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  ))}
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordSaving}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {passwordSaving ? "Saving..." : "Update Password"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column — Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Business Overview</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Total Drivers</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{profile.stats?.totalDrivers ?? 0}</span>
                  </div>
                  <p className="text-xs text-gray-500">{profile.stats?.onlineDrivers ?? 0} currently online</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-purple-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Total Deliveries</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{profile.stats?.totalDeliveries ?? 0}</span>
                  </div>
                  <p className="text-xs text-gray-500">Lifetime completed deliveries</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-emerald-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Total Earnings</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{formatCurrency(profile.stats?.totalEarnings ?? 0)}</span>
                  </div>
                  <p className="text-xs text-gray-500">Lifetime revenue generated</p>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Account Info</h2>
              </div>
              <div className="p-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <StatusBadge status={profile.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Active</span>
                  {profile.isActive
                    ? <CheckCircle className="h-5 w-5 text-green-500" />
                    : <XCircle className="h-5 w-5 text-red-500" />}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bank Verified</span>
                  {profile.bankAccount?.verified
                    ? <CheckCircle className="h-5 w-5 text-green-500" />
                    : <AlertCircle className="h-5 w-5 text-yellow-500" />}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Slug</span>
                  <span className="text-gray-700 font-mono text-xs">{profile.slug}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
