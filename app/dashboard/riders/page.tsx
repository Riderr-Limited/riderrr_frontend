// app/dashboard/riders/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ToastProvider";
import axios from "axios";
import AddRiderModal from "@/components/riders/AddRiderModal";
import { RiderList } from "@/components/riders/RiderList";
interface Rider {
  id: string | number;
  name: string;
  phone?: string;
  active?: boolean;
}

// dummy-data/riders.ts

export const DUMMY_RIDERS = [
  {
    id: 1,
    name: "Samuel Ade",
    online: true,
    location: "Lekki Phase 1",
    activeDeliveries: 2,
    rating: 4.8,
  },
  {
    id: 2,
    name: "John Musa",
    online: false,
    location: null,
    activeDeliveries: 0,
    rating: 4.2,
  },
  {
    id: 3,
    name: "Ibrahim Lawal",
    online: true,
    location: "Yaba",
    activeDeliveries: 1,
    rating: 4.6,
  },
  {
    id: 4,
    name: "Ahmed Bello",
    online: true,
    location: "Ikeja",
    activeDeliveries: 3,
    rating: 4.9,
  },
  {
    id: 5,
    name: "Peter Okoye",
    online: false,
    location: "Surulere",
    activeDeliveries: 0,
    rating: null,
  },
];

export default function RidersPage() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  function onAdded(newRider: Rider) {
    setRiders((s) => [newRider, ...s]);
    setOpen(false);
    toast({
      title: "Rider added",
      description: "Credentials were sent via SMS.",
    });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4"></div>

      <RiderList open={open} setOpen={setOpen} />
      <AddRiderModal
        open={open}
        onClose={() => setOpen(false)}
        onAdded={onAdded}
      />
    </div>
  );
}
