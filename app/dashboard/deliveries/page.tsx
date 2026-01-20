// app/dashboard/deliveries/page.tsx
"use client";
import { AllDeliveries } from "@/components/deliveries/AllDelivery";
import { CompletedDeliveries } from "@/components/deliveries/CompletedDeliveries";
import DeliveryAssignmentModal from "@/components/deliveries/DeliveryAssignmentModal";
import { OngoingDeliveries } from "@/components/deliveries/OnGoingDeliveries";

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
  const [activeTab, setActiveTab] = useState("All");

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
    <div className="px-6">
      {/* Tabs */}
      <div className="flex items-center  pt-2  justify-between">
        <h1 className="text-2xl font-semibold">Deliveries</h1>
        <button className="px-3 py-1 bg-blue-600 text-white rounded">Assign Delivery</button>
      </div>
      <div className="relative mt-8 mb-4 ">
        <div className="flex md:gap-8 gap-4 border-b-2 border-gray-200 dark:border-gray-700 pb-2">
          {["All", "Ongoing", "Completed", "Request"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative md:px-4 px-4 py-3 md:py-4 md:text-base font-semibold transition-all duration-300 ${
                activeTab === tab
                  ? "text-brand-600 text-white dark:text-brand-400"
                  : "text-gray-500 dark:text-gray-400 bg-transparent hover:text-gray-300 "
              }`}
            >
              {tab === "All"
                ? "All"
                : tab === "Ongoing"
                ? "Ongoing"
                : tab === "Completed"
                ? "Completed"
                : "Request"}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-brand-500 to-brand-600 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "All" && <AllDeliveries />}
      {activeTab == "Ongoing" && <OngoingDeliveries />}
      {activeTab == "Completed" && <CompletedDeliveries />}

      {activeTab === "Request" && (
        <div className="bg-white rounded shadow p-4">
          {pending.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center border-b py-3 "
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
      )}

      <DeliveryAssignmentModal
        delivery={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
