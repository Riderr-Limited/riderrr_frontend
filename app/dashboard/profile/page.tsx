"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Edit2,
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  ArrowRight,
} from "lucide-react";
import { PageHeader, EmptyState } from "@/components/dashboard/primitives";
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
      <label className="dash-label">{label}</label>
      {editing ? (
        <input
          type={type}
          value={formData[key]}
          onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))}
          className="dash-input"
        />
      ) : (
        <p className="text-sm text-brand-ink">{(profile as unknown as Record<string, string>)?.[key] || "—"}</p>
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
      <div aria-busy="true">
        <PageHeader
          title="Profile"
          description="Your company information, bank account and password."
        />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="dash-skeleton h-96 rounded-lg" />
            <div className="dash-skeleton h-44 rounded-lg" />
          </div>
          <div className="dash-skeleton h-60 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <PageHeader title="Profile" />
        <div className="dash-card">
          <EmptyState
            title="No company profile found"
            description={error || "Please contact support."}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Your company information, bank account and password."
      >
        <button
          onClick={fetchProfile}
          disabled={loading}
          className="dash-icon-btn size-9 border border-brand-hairline"
          aria-label="Refresh"
          title="Refresh"
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} strokeWidth={1.75} />
        </button>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="dash-btn dash-btn-primary"
          >
            <Edit2 className="size-4" strokeWidth={1.75} />
            Edit profile
          </button>
        ) : (
          <>
            <button
              onClick={() => { setEditing(false); fetchProfile(); }}
              className="dash-btn dash-btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="dash-btn dash-btn-primary"
            >
              <Save className="size-4" strokeWidth={1.75} />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </>
        )}
      </PageHeader>

      {/* Alerts */}
      {successMessage && (
        <div className="dash-notice dash-notice-success mb-5">
          <CheckCircle className="mt-0.5 size-4 shrink-0" />
          <p className="flex-1">{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} className="cursor-pointer opacity-70 hover:opacity-100" aria-label="Dismiss">
            <X className="size-4" />
          </button>
        </div>
      )}
      {error && (
        <div className="dash-notice dash-notice-danger mb-5">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p className="flex-1">{error}</p>
          <button onClick={() => setError(null)} className="cursor-pointer opacity-70 hover:opacity-100" aria-label="Dismiss">
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-5 lg:col-span-2">
          {/* Company Information */}
          <section className="dash-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-brand-hairline px-5 py-3.5">
              <h2 className="text-sm font-semibold text-brand-ink">Company information</h2>
              <StatusBadge status={profile.status} />
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-5 md:grid-cols-2">
              {field("Company Name", "name")}
              {field("Business License", "businessLicense")}
              {field("Tax ID", "taxId")}

              <div>
                <label className="dash-label">Member Since</label>
                <p className="text-sm text-brand-ink">{formatDate(profile.createdAt)}</p>
              </div>

              {field("Street Address", "address", "text", true)}
              {field("City", "city")}
              {field("State", "state")}
              {field("LGA", "lga")}

              <div>
                <label className="dash-label">Contact Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))}
                    className="dash-input"
                  />
                ) : (
                  <p className="text-sm text-brand-ink tabular-nums">{profile.contactPhone}</p>
                )}
              </div>

              <div>
                <label className="dash-label">Contact Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                    className="dash-input"
                  />
                ) : (
                  <p className="text-sm break-all text-brand-ink">{profile.contactEmail}</p>
                )}
              </div>

              <div>
                <label className="dash-label">Website</label>
                {editing ? (
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                    className="dash-input"
                    placeholder="https://"
                  />
                ) : (
                  <p className="text-sm break-all text-brand-ink">{profile.website || "—"}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="dash-label">Description</label>
                {editing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="dash-input"
                    placeholder="About your company"
                  />
                ) : (
                  <p className="text-sm text-brand-ink">{profile.description || "—"}</p>
                )}
              </div>
            </div>
          </section>

          {/* Bank Account */}
          <section className="dash-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-brand-hairline px-5 py-3.5">
              <h2 className="text-sm font-semibold text-brand-ink">Bank account</h2>
              {profile.bankAccount?.verified ? (
                <span className="dash-badge dash-badge-success">Verified</span>
              ) : (
                <span className="dash-badge dash-badge-warning">Pending verification</span>
              )}
            </div>

            {profile.bankAccount?.accountNumber ? (
              <div className="space-y-5 p-5">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  <div>
                    <label className="dash-label">Account Name</label>
                    <p className="text-sm text-brand-ink">{profile.bankAccount.accountName}</p>
                  </div>
                  <div>
                    <label className="dash-label">Account Number</label>
                    <p className="font-mono text-sm text-brand-ink">{profile.bankAccount.accountNumber}</p>
                  </div>
                  <div>
                    <label className="dash-label">Bank Name</label>
                    <p className="text-sm text-brand-ink">{profile.bankAccount.bankName}</p>
                  </div>
                  <div>
                    <label className="dash-label">Bank Code</label>
                    <p className="font-mono text-sm text-brand-ink">{profile.bankAccount.bankCode}</p>
                  </div>
                </div>
                <Link href="/dashboard/bank-setup" className="dash-btn dash-btn-secondary">
                  Manage bank account
                  <ArrowRight className="size-4" strokeWidth={1.75} />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-brand-ink-muted">No bank account set up yet.</p>
                <Link href="/dashboard/bank-setup" className="dash-btn dash-btn-primary">
                  Set up bank account
                  <ArrowRight className="size-4" strokeWidth={1.75} />
                </Link>
              </div>
            )}
          </section>

          {/* Change Password */}
          <section className="dash-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5">
              <h2 className="text-sm font-semibold text-brand-ink">Password</h2>
              <button
                onClick={() => setShowPasswordForm((v) => !v)}
                className="dash-btn dash-btn-sm dash-btn-secondary"
              >
                {showPasswordForm ? "Cancel" : "Change"}
              </button>
            </div>
            {showPasswordForm && (
              <div className="max-w-md space-y-4 border-t border-brand-hairline p-5">
                {(["currentPassword", "newPassword", "confirmPassword"] as const).map((key) => (
                  <div key={key}>
                    <label className="dash-label">
                      {key === "currentPassword" ? "Current Password" : key === "newPassword" ? "New Password" : "Confirm New Password"}
                    </label>
                    <input
                      type="password"
                      value={passwordData[key]}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="dash-input"
                    />
                  </div>
                ))}
                <button
                  onClick={handleChangePassword}
                  disabled={passwordSaving}
                  className="dash-btn dash-btn-primary"
                >
                  {passwordSaving ? "Saving..." : "Update password"}
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Right Column — Stats */}
        <div className="space-y-5">
          <section className="dash-card overflow-hidden">
            <div className="border-b border-brand-hairline px-5 py-3.5">
              <h2 className="text-sm font-semibold text-brand-ink">Business overview</h2>
            </div>
            <dl className="divide-y divide-brand-hairline">
              <div className="px-5 py-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-brand-ink-secondary">Total drivers</dt>
                  <dd className="text-base font-semibold text-brand-ink tabular-nums">{profile.stats?.totalDrivers ?? 0}</dd>
                </div>
                <p className="mt-0.5 text-xs text-brand-ink-muted">{profile.stats?.onlineDrivers ?? 0} currently online</p>
              </div>

              <div className="px-5 py-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-brand-ink-secondary">Total deliveries</dt>
                  <dd className="text-base font-semibold text-brand-ink tabular-nums">{profile.stats?.totalDeliveries ?? 0}</dd>
                </div>
                <p className="mt-0.5 text-xs text-brand-ink-muted">Lifetime completed deliveries</p>
              </div>

              <div className="px-5 py-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-brand-ink-secondary">Total earnings</dt>
                  <dd className="text-base font-semibold text-brand-ink tabular-nums">{formatCurrency(profile.stats?.totalEarnings ?? 0)}</dd>
                </div>
                <p className="mt-0.5 text-xs text-brand-ink-muted">Lifetime revenue generated</p>
              </div>
            </dl>
          </section>

          {/* Account Info */}
          <section className="dash-card overflow-hidden">
            <div className="border-b border-brand-hairline px-5 py-3.5">
              <h2 className="text-sm font-semibold text-brand-ink">Account</h2>
            </div>
            <div className="space-y-3 p-5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-brand-ink-muted">Status</span>
                <StatusBadge status={profile.status} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-brand-ink-muted">Active</span>
                <span className="text-brand-ink">{profile.isActive ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-brand-ink-muted">Bank verified</span>
                <span className="text-brand-ink">{profile.bankAccount?.verified ? "Yes" : "Not yet"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-brand-ink-muted">Slug</span>
                <span className="font-mono text-xs text-brand-ink-secondary">{profile.slug}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
