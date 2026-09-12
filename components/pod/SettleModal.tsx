"use client";

import { useState } from "react";
import { IconX } from "@tabler/icons-react";
import { API_CONFIG } from "@/app/lib/config";
import { TokenUtils } from "@/lib/tokenUtils";

interface Props {
  podId: string;
  productAmount: number;
  onClose: () => void;
  onSettled: () => void;
}

export default function SettleModal({ podId, productAmount, onClose, onSettled }: Props) {
  const [amount, setAmount] = useState(productAmount.toString());
  const [note, setNote] = useState("");
  const [settling, setSettling] = useState(false);

  const handleSettle = async () => {
    setSettling(true);
    try {
      const token = TokenUtils.getToken();
      const res = await fetch(`${API_CONFIG.BASE_URL}/pod/${podId}/settle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ settlementAmount: Number(amount), ...(note && { note }) }),
      });
      const data = await res.json();
      if (data.success) onSettled();
    } catch (e) {
      console.error(e);
    } finally {
      setSettling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Settle Merchant</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <IconX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Settlement Amount (₦)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Settled via bank transfer"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="p-5 border-t border-gray-200 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSettle}
            disabled={!amount || settling}
            className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {settling ? "Settling..." : "Confirm Settlement"}
          </button>
        </div>
      </div>
    </div>
  );
}
