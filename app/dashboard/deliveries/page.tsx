// app/dashboard/deliveries/page.tsx
"use client";
import DeliveryAssignmentModal from "@/components/deliveries/DeliveryAssignmentModal";
import { useState } from "react";

type Delivery = {
  id: string;
  customer: string;
  pickup: string;
  drop: string;
  price: number;
  distance: number;
};

export default function DeliveriesPage() {
  const [selected, setSelected] = useState<Delivery | null>(null);

  // mocked pending deliveries
  const pending = [
    {
      id: "d1",
      customer: "John Doe",
      pickup: "Restaurant XYZ",
      drop: "123 Main St",
      price: 1800,
      distance: 4.2,
    },
    {
      id: "d2",
      customer: "Jane Smith",
      pickup: "Shop ABC",
      drop: "45 Park Ave",
      price: 1200,
      distance: 2.1,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Pending Deliveries</h2>
      </div>

      <div className="bg-white rounded shadow p-4">
        {pending.map((p) => (
          <div
            key={p.id}
            className="flex justify-between items-center border-b py-3"
          >
            <div>
              <div className="font-semibold">
                {p.customer} — ₦{p.price}
              </div>
              <div className="text-sm text-slate-600">
                {p.pickup} → {p.drop} • {p.distance} km
              </div>
            </div>
            <div>
              <button
                className="px-3 py-2 border rounded"
                onClick={() => setSelected(p)}
              >
                Open
              </button>
            </div>
          </div>
        ))}
      </div>

      <DeliveryAssignmentModal
        delivery={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
