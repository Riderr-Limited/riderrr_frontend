// app/dashboard/riders/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ToastProvider";
import axios from "axios";
import RiderList from "@/components/riders/RiderList";
import AddRiderModal from "@/components/riders/AddRiderModal";
interface Rider {
  id: string | number;
  name: string;
  phone?: string;
  active?: boolean;
}

export default function RidersPage() {
  const [open, setOpen] = useState(false);
  const [riders, setRiders] = useState<Rider[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // load riders
    async function load() {
      try {
        const res = await axios.get("/api/riders");
        setRiders(res.data || []);
      } catch (err) {
        toast({ title: "Could not load riders" });
        console.error(err);
      }
    }
    load();
  }, [toast]);

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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Riders</h2>
        <Button
          className="bg-indigo-600 text-white"
          onClick={() => setOpen(true)}
        >
          Add New Rider
        </Button>
      </div>

      <RiderList riders={riders} />
      <AddRiderModal
        open={open}
        onClose={() => setOpen(false)}
        onAdded={onAdded}
      />
    </div>
  );
}
