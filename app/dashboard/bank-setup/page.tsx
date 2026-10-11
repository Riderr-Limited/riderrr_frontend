"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconLoader2,
  IconLock,
  IconEdit,
  IconTrash,
  IconX,
  IconChevronDown,
} from "@tabler/icons-react";
import { PageHeader, Field } from "@/components/dashboard/primitives";
import { API_CONFIG } from "@/app/lib/config";
import { TokenUtils } from "@/lib/tokenUtils";

interface Bank {
  code: string;
  name: string;
}

interface BankAccount {
  accountNumber: string;
  accountNumberFull: string;
  accountName: string;
  bankCode: string;
  bankName: string;
  verified: boolean;
  verifiedAt: string | null;
}

type SetupStatus = "not_setup" | "saved_unverified" | "verified";

interface BankAccountData {
  isSetup: boolean;
  bankAccount: BankAccount | null;
  setupStatus: SetupStatus;
  message: string;
}

const getToken = () => TokenUtils.getToken();

export default function BankSetupPage() {
  const router = useRouter();

  // Current account state
  const [bankData, setBankData] = useState<BankAccountData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [bankSearch, setBankSearch] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const bankRef = useRef<HTMLDivElement>(null);

  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bankRef.current && !bankRef.current.contains(e.target as Node))
        setShowBankDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load current bank account
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await fetch(
          API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.COMPANY_BANK_ACCOUNT),
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        const data = await res.json();
        if (data.success) {
          setBankData(data.data);
          if (!data.data.isSetup) setShowForm(true);
        } else {
          setPageError(data.message || "Failed to load bank account.");
        }
      } catch {
        setPageError("Failed to load bank account.");
      } finally {
        setPageLoading(false);
      }
    };
    fetchAccount();
  }, []);

  // Load banks list
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await fetch(
          API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.BANKS),
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        const data = await res.json();
        if (data.success) setBanks(data.data);
      } catch {
        // silently fail
      } finally {
        setBanksLoading(false);
      }
    };
    fetchBanks();
  }, []);

  // Auto-verify when 10 digits + bank selected
  useEffect(() => {
    if (accountNumber.length !== 10 || !selectedBank) return;
    const verify = async () => {
      setVerifying(true);
      setVerifyError("");
      setAccountName("");
      setVerified(false);
      try {
        const res = await fetch(
          API_CONFIG.buildUrl(
            `${API_CONFIG.ENDPOINTS.PAYMENTS.VERIFY_ACCOUNT}?accountNumber=${accountNumber}&bankCode=${selectedBank.code}`
          ),
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        const data = await res.json();
        if (data.success) {
          setAccountName(data.data.accountName);
          setVerified(true);
        } else {
          setVerifyError(data.message || "Account not found. Check number and bank.");
        }
      } catch {
        setVerifyError("Verification failed. Please try again.");
      } finally {
        setVerifying(false);
      }
    };
    verify();
  }, [accountNumber, selectedBank]);

  const resetForm = () => {
    setAccountNumber("");
    setAccountName("");
    setVerified(false);
    setVerifyError("");
    setSaveError("");
    setSelectedBank(null);
    setBankSearch("");
  };

  const handleOpenEdit = () => {
    const acc = bankData?.bankAccount;
    if (acc) {
      setAccountNumber(acc.accountNumberFull);
      setAccountName(acc.accountName);
      setVerified(true);
      const match = banks.find((b) => b.code === acc.bankCode);
      if (match) setSelectedBank(match);
    }
    setIsEditing(true);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    resetForm();
    setShowForm(bankData?.isSetup === false);
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verified) {
      setSaveError("Please verify your account number first.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const endpoint = isEditing
        ? API_CONFIG.ENDPOINTS.PAYMENTS.COMPANY_BANK_ACCOUNT
        : API_CONFIG.ENDPOINTS.PAYMENTS.SETUP_BANK_ACCOUNT;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(API_CONFIG.buildUrl(endpoint), {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          accountNumber,
          accountName,
          bankCode: selectedBank!.code,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh account data
        const refreshRes = await fetch(
          API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.COMPANY_BANK_ACCOUNT),
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        const refreshData = await refreshRes.json();
        if (refreshData.success) setBankData(refreshData.data);
        resetForm();
        setShowForm(false);
        setIsEditing(false);
        if (!isEditing) setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setSaveError(data.message || "Failed to save bank account.");
      }
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(
        API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.COMPANY_BANK_ACCOUNT),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setBankData({ isSetup: false, bankAccount: null, setupStatus: "not_setup", message: "" });
        setShowDeleteConfirm(false);
        setShowForm(true);
        resetForm();
        setIsEditing(false);
      } else {
        setPageError(data.message || "Failed to remove bank account.");
        setShowDeleteConfirm(false);
      }
    } catch {
      setPageError("Failed to remove bank account.");
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const statusLabel: Record<SetupStatus, { text: string; className: string }> = {
    not_setup: { text: "Not set up", className: "" },
    saved_unverified: { text: "Pending verification", className: "dash-badge-warning" },
    verified: { text: "Verified", className: "dash-badge-success" },
  };

  if (pageLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <IconLoader2 className="size-5 animate-spin text-brand-ink-muted" />
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <PageHeader
        title="Bank account"
        description="Delivery payments will be sent to this account."
      />

      <div className="dash-card">
        <div className="space-y-5 p-5">
          {pageError && (
            <div className="dash-notice dash-notice-danger">
              <IconAlertTriangle className="mt-0.5 size-4 shrink-0" />
              {pageError}
            </div>
          )}

          {/* Current account display */}
          {bankData?.isSetup && !showForm && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-brand-ink">Current account</span>
                <span className={`dash-badge ${statusLabel[bankData.setupStatus].className}`}>
                  {statusLabel[bankData.setupStatus].text}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="Account name" className="col-span-2">
                  <span className="font-medium">{bankData.bankAccount?.accountName}</span>
                </Field>
                <Field label="Account number">
                  <span className="font-mono">{bankData.bankAccount?.accountNumber}</span>
                </Field>
                <Field label="Bank">{bankData.bankAccount?.bankName}</Field>
              </div>

              {bankData.message && (
                <p className="border-t border-brand-hairline pt-4 text-[13px] text-brand-ink-muted">
                  {bankData.message}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="dash-btn dash-btn-primary"
                >
                  <IconEdit className="size-4" stroke={1.75} /> Edit account
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="dash-btn dash-btn-danger-outline"
                >
                  <IconTrash className="size-4" stroke={1.75} /> Remove
                </button>
              </div>
            </div>
          )}

          {/* Delete confirm */}
          {showDeleteConfirm && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">Remove bank account?</p>
              <p className="mt-0.5 text-[13px] text-red-700">
                You won&apos;t receive payments until you add a new account.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="dash-btn dash-btn-sm dash-btn-danger"
                >
                  {deleting ? <IconLoader2 className="size-4 animate-spin" /> : "Yes, remove"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="dash-btn dash-btn-sm dash-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Add / Edit form */}
          {showForm && (
            <form onSubmit={handleSave} className="space-y-5">
              {isEditing && (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-brand-ink">Edit bank account</p>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="dash-icon-btn -mr-1.5"
                    aria-label="Cancel editing"
                  >
                    <IconX className="size-[18px]" />
                  </button>
                </div>
              )}

              {/* Bank dropdown */}
              <div ref={bankRef}>
                <label className="dash-label">Bank</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={banksLoading ? "Loading banks..." : "Search or select bank"}
                    value={selectedBank ? selectedBank.name : bankSearch}
                    disabled={banksLoading}
                    onFocus={() => {
                      setShowBankDropdown(true);
                      if (selectedBank) {
                        setBankSearch("");
                        setSelectedBank(null);
                        setAccountName("");
                        setVerified(false);
                        setVerifyError("");
                      }
                    }}
                    onChange={(e) => {
                      setBankSearch(e.target.value);
                      setShowBankDropdown(true);
                    }}
                    className="dash-input pr-9"
                  />
                  <IconChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-brand-ink-faint" />
                  {showBankDropdown && !banksLoading && (
                    <div className="absolute z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-brand-hairline bg-white p-1 shadow-elevated">
                      {filteredBanks.length === 0 ? (
                        <p className="px-2.5 py-2 text-sm text-brand-ink-muted">No banks found</p>
                      ) : (
                        filteredBanks.map((bank) => (
                          <button
                            key={bank.code}
                            type="button"
                            onClick={() => {
                              setSelectedBank(bank);
                              setBankSearch("");
                              setShowBankDropdown(false);
                              setAccountName("");
                              setVerified(false);
                              setVerifyError("");
                            }}
                            className="w-full cursor-pointer rounded px-2.5 py-2 text-left text-sm text-brand-ink-secondary transition-colors hover:bg-brand-canvas-soft hover:text-brand-ink"
                          >
                            {bank.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="dash-label">Account number</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit account number"
                    value={accountNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setAccountNumber(val);
                      if (val !== accountNumber) {
                        setAccountName("");
                        setVerified(false);
                        setVerifyError("");
                      }
                    }}
                    className="dash-input pr-9 font-mono"
                  />
                  {verifying && <IconLoader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-brand-ink-muted" />}
                  {verified && !verifying && <IconCircleCheck className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-emerald-600" />}
                </div>
                {verifying && <p className="mt-1.5 text-xs text-brand-ink-muted">Verifying account...</p>}
                {verifyError && <p className="mt-1.5 text-xs text-red-600">{verifyError}</p>}
              </div>

              {/* Account Name — read-only */}
              <div>
                <label className="dash-label">Account name</label>
                <input
                  type="text"
                  readOnly
                  placeholder="Filled in after verification"
                  value={accountName}
                  className={`dash-input bg-brand-canvas-soft focus:border-brand-hairline focus:ring-0 ${
                    verified ? "font-medium text-brand-ink" : "text-brand-ink-faint"
                  }`}
                />
                {verified && (
                  <p className="mt-1.5 text-xs text-emerald-700">Verified by your bank</p>
                )}
              </div>

              {saveError && (
                <div className="dash-notice dash-notice-danger">
                  <IconAlertTriangle className="mt-0.5 size-4 shrink-0" />
                  {saveError}
                </div>
              )}

              <button
                type="submit"
                disabled={saving || !verified}
                className="dash-btn dash-btn-primary h-10 w-full"
              >
                {saving ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin" /> Saving...
                  </>
                ) : isEditing ? "Update bank account" : "Save bank account"}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-xs text-brand-ink-muted">
                <IconLock className="size-3.5" stroke={1.75} />
                Your account details are encrypted and secure.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
