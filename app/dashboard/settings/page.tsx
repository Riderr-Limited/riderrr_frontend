"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/primitives";
import { API_CONFIG } from "../../lib/config";
import { ApiClient } from "../../lib/api-client";

export default function CompanySettingsPage() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChangePassword = async () => {
    try {
      if (!passwordForm.currentPassword || !passwordForm.newPassword) {
        setError("Please fill in all password fields");
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError("New passwords do not match");
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Using centralized config
      const url = ApiClient.buildUrl(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD);

      const data = await ApiClient.post(url, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (data.success) {
        setSuccessMessage("Password changed successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: unknown) {
      console.error("Error changing password:", err);
      setError(
        err instanceof Error ? err.message : "Failed to change password",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (
      !confirm(
        "Are you sure you want to logout from all devices? You will need to login again.",
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Using centralized config
      const url = ApiClient.buildUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);

      const data = await ApiClient.post(url, {});

      if (data.success) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    } catch (err: unknown) {
      console.error("Error logging out:", err);
      setError(err instanceof Error ? err.message : "Failed to logout");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Settings"
        description="Password and session security for your account."
      />

      {/* Success Message */}
      {successMessage && (
        <div className="dash-notice dash-notice-success mb-5">
          <CheckCircle className="mt-0.5 size-4 shrink-0" />
          <p className="flex-1">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage(null)}
            className="cursor-pointer opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="dash-notice dash-notice-danger mb-5">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p className="flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="cursor-pointer opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="space-y-5">
        {/* Change Password */}
        <section className="dash-card overflow-hidden">
          <div className="border-b border-brand-hairline px-5 py-3.5">
            <h2 className="text-sm font-semibold text-brand-ink">Change password</h2>
            <p className="mt-0.5 text-[13px] text-brand-ink-muted">
              Use at least 6 characters.
            </p>
          </div>

          <div className="max-w-md space-y-4 p-5">
            <div>
              <label className="dash-label">Current password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="dash-input pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      current: !prev.current,
                    }))
                  }
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-brand-ink-faint hover:text-brand-ink-muted"
                  aria-label={showPasswords.current ? "Hide password" : "Show password"}
                >
                  {showPasswords.current ? (
                    <EyeOff className="size-[18px]" strokeWidth={1.75} />
                  ) : (
                    <Eye className="size-[18px]" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="dash-label">New password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="dash-input pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      new: !prev.new,
                    }))
                  }
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-brand-ink-faint hover:text-brand-ink-muted"
                  aria-label={showPasswords.new ? "Hide password" : "Show password"}
                >
                  {showPasswords.new ? (
                    <EyeOff className="size-[18px]" strokeWidth={1.75} />
                  ) : (
                    <Eye className="size-[18px]" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="dash-label">Confirm new password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="dash-input pr-10"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      confirm: !prev.confirm,
                    }))
                  }
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-brand-ink-faint hover:text-brand-ink-muted"
                  aria-label={showPasswords.confirm ? "Hide password" : "Show password"}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="size-[18px]" strokeWidth={1.75} />
                  ) : (
                    <Eye className="size-[18px]" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={saving}
              className="dash-btn dash-btn-primary"
            >
              {saving ? "Changing..." : "Change password"}
            </button>
          </div>
        </section>

        {/* Session Management */}
        <section className="dash-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-brand-ink">
              Log out of all devices
            </h2>
            <p className="mt-0.5 text-[13px] text-brand-ink-muted">
              Ends every active session. You&apos;ll need to log in again on
              each device.
            </p>
          </div>
          <button
            onClick={handleLogoutAllDevices}
            disabled={saving}
            className="dash-btn dash-btn-danger-outline"
          >
            <LogOut className="size-4" strokeWidth={1.75} />
            {saving ? "Logging out..." : "Log out everywhere"}
          </button>
        </section>
      </div>
    </div>
  );
}
