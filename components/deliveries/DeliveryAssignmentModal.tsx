"use client";
import { useState } from "react";


export interface Rider {
  id: string;
  name: string;
  distance: number;
  vehicle: string;
  rating: number;
  activeDeliveries: number;
}

export interface Delivery {
  customer: string;
  pickup: string;
  drop: string;
  price: number;
  distance: number;
}

interface Props {
  delivery: Delivery | null;
  onClose: () => void;
}

export default function DeliveryAssignmentModal({ delivery, onClose }: Props) {
  const [riders] = useState<Rider[]>([
    {
      id: "r1",
      name: "Kareem",
      distance: 1.2,
      vehicle: "Bike",
      rating: 4.7,
      activeDeliveries: 0,
    },
    {
      id: "r2",
      name: "Aisha",
      distance: 2.8,
      vehicle: "Car",
      rating: 4.9,
      activeDeliveries: 1,
    },
  ]);

  if (!delivery) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white w-full max-w-4xl rounded-lg grid md:grid-cols-2 overflow-hidden">
        <div className="p-4 border-r">
          <h3 className="font-semibold">Delivery Details</h3>
          <div className="mt-3 text-sm text-slate-600 space-y-2">
            <div>
              <strong>Customer:</strong> {delivery.customer}
            </div>
            <div>
              <strong>Pickup:</strong> {delivery.pickup}
            </div>
            <div>
              <strong>Drop-off:</strong> {delivery.drop}
            </div>
            <div>
              <strong>Package:</strong> Food (Hot)
            </div>
            <div>
              <strong>Notes:</strong> No onions please
            </div>
            <div>
              <strong>Price:</strong> ₦{delivery.price}
            </div>
            <div>
              <strong>Distance:</strong> {delivery.distance} km
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold">Available Riders</h4>
            <div className="text-sm">
              <button className="mr-2">All</button>
              <button className="mr-2">Near Pickup</button>
              <button>Highest Rated</button>
            </div>
          </div>

          <div className="space-y-2">
            {riders.map((r) => (
              <div
                key={r.id}
                className="flex justify-between items-center border rounded p-2"
              >
                <div>
                  <div className="font-semibold">
                    {r.name}{" "}
                    <span className="text-xs text-slate-500">
                      • {r.vehicle}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Distance: {r.distance} km • Rating: {r.rating} • Active:{" "}
                    {r.activeDeliveries}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm">Assign</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between">
            <button className="px-3 py-1 border rounded text-sm">Assign Manually</button>
            <div className="flex gap-2">
              <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm">
                Auto-assign Nearest
              </button>
              <button className="border px-3 py-1 rounded text-sm">Reject Request</button>
            </div>
          </div>
        </div>
      </div>

      <button
        className="absolute top-6 right-6 bg-white rounded-full p-2 shadow"
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  );
}
