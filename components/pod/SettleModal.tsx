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
    <div className="dash-overlay">
      <div className="dash-modal max-w-md">
        <div className="dash-modal-header">
          <h2 className="dash-modal-title">Settle merchant</h2>
          <button onClick={onClose} className="dash-icon-btn -mr-1.5" aria-label="Close">
            <IconX className="size-[18px]" />
          </button>
        </div>

        <div className="dash-modal-body space-y-4">
          <div>
            <label className="dash-label">Settlement amount (₦)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="dash-input tabular-nums"
            />
          </div>
          <div>
            <label className="dash-label">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Settled via bank transfer"
              className="dash-input"
            />
          </div>
        </div>

        <div className="dash-modal-footer">
          <button onClick={onClose} className="dash-btn dash-btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSettle}
            disabled={!amount || settling}
            className="dash-btn dash-btn-primary"
          >
            {settling ? "Settling..." : "Confirm settlement"}
          </button>
        </div>
      </div>
    </div>
  );
}
