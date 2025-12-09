// components/riders/AddRiderModal.tsx
"use client";
import { useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import axios from "axios";

type VehicleType = "Bike" | "Car" | "Truck";

type Rider = {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  vehicleType: VehicleType;
  plate?: string;
  color?: string;
};

interface AddRiderModalProps {
  open: boolean;
  onClose: () => void;
  onAdded?: (rider: Rider) => void;
}

export default function AddRiderModal({
  open,
  onClose,
  onAdded,
}: AddRiderModalProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    vehicleType: "Bike",
    plate: "",
    color: "",
  });
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function submit() {
    setLoading(true);
    try {
      // backend will create username/password & QR code
      const res = await axios.post("/api/riders", form);
      onAdded?.(res.data);
    } catch (err) {
      alert("Error adding rider");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white w-full max-w-2xl rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Add New Rider</h3>
          <button onClick={onClose} className="text-slate-500">
            Close
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Full name</label>
            <Input
              value={form.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm">Phone</label>
            <Input
              value={form.phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm">Email (optional)</label>
            <Input
              value={form.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm">Vehicle type</label>
            <select
              value={form.vehicleType}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setForm({ ...form, vehicleType: e.target.value as VehicleType })
              }
              className="w-full border rounded px-3 py-2"
            >
              <option>Bike</option>
              <option>Car</option>
              <option>Truck</option>
            </select>
          </div>
          <div>
            <label className="text-sm">Plate</label>
            <Input
              value={form.plate}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, plate: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm">Color</label>
            <Input
              value={form.color}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, color: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            className="bg-indigo-600 text-white"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Rider"}
          </Button>
        </div>
      </div>
    </div>
  );
}
