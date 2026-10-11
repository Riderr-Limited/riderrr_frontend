"use client";

import { useEffect, useState } from "react";
import { IconX } from "@tabler/icons-react";
import { Avatar } from "@/components/dashboard/primitives";
import { API_CONFIG } from "@/app/lib/config";
import { TokenUtils } from "@/lib/tokenUtils";

interface Driver {
  _id: string;
  userId: {
    name: string;
    phone: string;
  };
  isOnline: boolean;
  isAvailable: boolean;
}

interface Props {
  podId: string;
  onClose: () => void;
  onAssigned: () => void;
}

export default function AssignDriverModal({ podId, onClose, onAssigned }: Props) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = TokenUtils.getToken();
        const res = await fetch(`${API_CONFIG.BASE_URL}/company/drivers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setDrivers(data.data || data.drivers || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAssign = async () => {
    if (!selected) return;
    setAssigning(true);
    try {
      const token = TokenUtils.getToken();
      const res = await fetch(`${API_CONFIG.BASE_URL}/pod/${podId}/assign`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: selected }),
      });
      const data = await res.json();
      if (data.success) onAssigned();
    } catch (e) {
      console.error(e);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="dash-overlay">
      <div className="dash-modal max-w-md">
        <div className="dash-modal-header">
          <h2 className="dash-modal-title">Assign driver</h2>
          <button onClick={onClose} className="dash-icon-btn -mr-1.5" aria-label="Close">
            <IconX className="size-[18px]" />
          </button>
        </div>

        <div className="dash-modal-body max-h-80 space-y-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="dash-skeleton h-[52px] rounded-md" />
            ))
          ) : drivers.length === 0 ? (
            <p className="py-6 text-center text-sm text-brand-ink-muted">No drivers available</p>
          ) : (
            drivers.map((d) => (
              <button
                key={d._id}
                onClick={() => setSelected(d._id)}
                aria-pressed={selected === d._id}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
                  selected === d._id
                    ? "border-brand-primary bg-brand-primary/[0.04] ring-1 ring-brand-primary"
                    : "border-brand-hairline hover:bg-brand-canvas-soft"
                }`}
              >
                <Avatar name={d.userId?.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brand-ink">{d.userId?.name}</p>
                  <p className="text-xs text-brand-ink-muted tabular-nums">{d.userId?.phone}</p>
                </div>
                <span className={`dash-badge ${d.isAvailable ? "dash-badge-success" : ""}`}>
                  {d.isAvailable ? "Available" : "Busy"}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="dash-modal-footer">
          <button onClick={onClose} className="dash-btn dash-btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selected || assigning}
            className="dash-btn dash-btn-primary"
          >
            {assigning ? "Assigning..." : "Assign driver"}
          </button>
        </div>
      </div>
    </div>
  );
}
