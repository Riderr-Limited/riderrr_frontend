"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  IconBuildingBank,
  IconAlertTriangle,
  IconCircleCheck,
  IconLoader2,
  IconLock,
  IconEdit,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
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
    not_setup: { text: "Not Set Up", className: "text-gray-500" },
    saved_unverified: { text: "Saved — Pending Verification", className: "text-yellow-600" },
    verified: { text: "Verified", className: "text-green-600" },
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <IconLoader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <IconBuildingBank className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Bank Account</h1>
              <p className="text-blue-100 text-sm mt-0.5">
                Delivery payments will be sent to this account.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {pageError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              <IconAlertTriangle className="h-4 w-4 shrink-0" />
              {pageError}
            </div>
          )}

          {/* Current account display */}
          {bankData?.isSetup && !showForm && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Account</span>
                  <span className={`text-xs font-medium ${statusLabel[bankData.setupStatus].className}`}>
                    {statusLabel[bankData.setupStatus].text}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Name</p>
                  <p className="font-semibold text-gray-900">{bankData.bankAccount?.accountName}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="font-medium text-gray-900">{bankData.bankAccount?.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bank</p>
                    <p className="font-medium text-gray-900">{bankData.bankAccount?.bankName}</p>
                  </div>
                </div>
                {bankData.message && (
                  <p className="text-xs text-gray-500 border-t border-gray-200 pt-3">{bankData.message}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={handleOpenEdit}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white h-10"
                >
                  <IconEdit className="h-4 w-4" /> Edit Account
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 h-10 px-4"
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Delete confirm */}
          {showDeleteConfirm && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-red-700">Remove bank account?</p>
              <p className="text-xs text-red-600">You won't receive payments until you add a new account.</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white h-9 text-sm"
                >
                  {deleting ? <IconLoader2 className="h-4 w-4 animate-spin mx-auto" /> : "Yes, Remove"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 h-9 text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Add / Edit form */}
          {showForm && (
            <form onSubmit={handleSave} className="space-y-5">
              {isEditing && (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">Edit Bank Account</p>
                  <button type="button" onClick={handleCancelForm} className="text-gray-400 hover:text-gray-600">
                    <IconX className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Bank dropdown */}
              <div className="space-y-1.5" ref={bankRef}>
                <label className="text-sm font-medium text-gray-700">
                  Bank <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={banksLoading ? "Loading banks..." : "Search or select bank..."}
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
                    className="w-full h-9 rounded-md border border-input bg-white px-4 pr-8 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</span>
                  {showBankDropdown && !banksLoading && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                      {filteredBanks.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-400">No banks found</p>
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
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors"
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
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit account number"
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
                  />
                  {verifying && <IconLoader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" />}
                  {verified && !verifying && <IconCircleCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                </div>
                {verifying && <p className="text-xs text-blue-500">Verifying account...</p>}
                {verifyError && <p className="text-xs text-red-500">{verifyError}</p>}
              </div>

              {/* Account Name — read-only */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Account Name</label>
                <div className="relative">
                  <Input
                    type="text"
                    readOnly
                    placeholder="Auto-filled after verification"
                    value={accountName}
                    className={`pr-10 ${verified ? "bg-green-50 border-green-300 text-green-800 font-medium" : "bg-gray-50 text-gray-400"}`}
                  />
                  {verified && <IconCircleCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                </div>
                {verified && <p className="text-xs text-green-600">✓ Verified by your bank</p>}
              </div>

              {saveError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  <IconAlertTriangle className="h-4 w-4 shrink-0" />
                  {saveError}
                </div>
              )}

              <Button
                type="submit"
                disabled={saving || !verified}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" /> Saving...
                  </span>
                ) : isEditing ? "Update Bank Account" : "Save Bank Account"}
              </Button>

              <div className="flex items-center gap-2 text-gray-400 text-xs justify-center">
                <IconLock className="h-3.5 w-3.5" />
                Your account details are encrypted and secure.
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
