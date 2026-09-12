"use client";

import { useEffect, useState } from "react";
import { IconX, IconUser } from "@tabler/icons-react";
import { API_CONFIG } from "@/app/lib/config";
import { TokenUtils } from "@/lib/tokenUtils";

interface Driver {
  _id: string;
  name: string;
  phone: string;
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Assign Driver</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <IconX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-lg" />
            ))
          ) : drivers.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No drivers available</p>
          ) : (
            drivers.map((d) => (
              <button
                key={d._id}
                onClick={() => setSelected(d._id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                  selected === d._id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="p-2 bg-gray-100 rounded-full">
                  <IconUser className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-500">{d.phone}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${d.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {d.isAvailable ? "Available" : "Busy"}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="p-5 border-t border-gray-200 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selected || assigning}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {assigning ? "Assigning..." : "Assign Driver"}
          </button>
        </div>
      </div>
    </div>
  );
}
