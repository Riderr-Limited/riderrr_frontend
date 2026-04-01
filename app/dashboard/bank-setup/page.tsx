"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  IconBuildingBank,
  IconAlertTriangle,
  IconCircleCheck,
  IconLoader2,
  IconLock,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { API_CONFIG } from "@/app/lib/config";

interface Bank {
  code: string;
  name: string;
}

export default function BankSetupPage() {
  const router = useRouter();

  const [banks, setBanks] = useState<Bank[]>([]);
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
  const [success, setSuccess] = useState(false);

  const [banksLoading, setBanksLoading] = useState(true);

  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bankRef.current && !bankRef.current.contains(e.target as Node)) {
        setShowBankDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load banks
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.BANKS), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setBanks(data.data);
      } catch {
        // silently fail — banks list will just be empty
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
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          API_CONFIG.buildUrl(
            `${API_CONFIG.ENDPOINTS.PAYMENTS.VERIFY_ACCOUNT}?accountNumber=${accountNumber}&bankCode=${selectedBank.code}`
          ),
          { headers: { Authorization: `Bearer ${token}` } }
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verified) {
      setSaveError("Please verify your account number first.");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.SETUP_BANK), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountNumber,
          accountName,
          bankCode: selectedBank!.code,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setSaveError(data.message || "Failed to save bank account.");
      }
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center max-w-sm w-full">
          <IconCircleCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Bank Account Saved!</h2>
          <p className="text-gray-500 mt-2 text-sm">Redirecting to dashboard...</p>
        </div>
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
              <h1 className="text-xl font-bold">Bank Account Setup</h1>
              <p className="text-blue-100 text-sm mt-0.5">
                Payments from deliveries will be sent to this account automatically.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">

          {/* Bank searchable dropdown */}
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
                    // reset verification when bank changes
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
                          // reset verification when bank changes
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
                  // reset if user edits
                  if (val !== accountNumber) {
                    setAccountName("");
                    setVerified(false);
                    setVerifyError("");
                  }
                }}
              />
              {verifying && (
                <IconLoader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" />
              )}
              {verified && !verifying && (
                <IconCircleCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            {verifying && (
              <p className="text-xs text-blue-500">Verifying account...</p>
            )}
            {verifyError && (
              <p className="text-xs text-red-500">{verifyError}</p>
            )}
          </div>

          {/* Account Name — read-only, auto-filled */}
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
              {verified && (
                <IconCircleCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            {verified && (
              <p className="text-xs text-green-600">✓ Verified by your bank</p>
            )}
          </div>

          {/* Save error */}
          {saveError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              <IconAlertTriangle className="h-4 w-4 shrink-0" />
              {saveError}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={saving || !verified}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <IconLoader2 className="h-4 w-4 animate-spin" /> Saving...
              </span>
            ) : (
              "Save Bank Account"
            )}
          </Button>

          {/* Security note */}
          <div className="flex items-center gap-2 text-gray-400 text-xs justify-center">
            <IconLock className="h-3.5 w-3.5" />
            Your account details are encrypted and secure.
          </div>

        </form>
      </div>
    </div>
  );
}
