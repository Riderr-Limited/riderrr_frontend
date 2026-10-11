"use client";

import { useEffect, useState } from "react";
import { IconRefresh, IconSearch } from "@tabler/icons-react";
import { PageHeader, StatStrip, Stat, EmptyState } from "@/components/dashboard/primitives";
import { DeliveryRow, DeliveryRowSkeleton } from "@/components/dashboard/DeliveryRow";
import { API_CONFIG } from "../../lib/config";
import { ApiClient } from "../../lib/api-client";
import MapModal from "@/components/MapModal";
import DeliveryDetailsModal from "@/components/DeliveryDetailsModal";

interface Delivery {
  _id: string;
  referenceId: string;
  customerName: string;
  customerPhone: string;
  recipientName: string;
  recipientPhone: string;
  pickup: {
    address: string;
    lat: number;
    lng: number;
    name: string;
    phone: string;
  };
  dropoff: {
    address: string;
    lat: number;
    lng: number;
    name: string;
    phone: string;
  };
  itemDetails: {
    type: string;
    description?: string;
    weight: number;
    value: number;
  };
  fare: {
    baseFare?: number;
    distanceFare?: number;
    totalFare?: number;
    currency: string;
  };
  estimatedDistanceKm: number;
  estimatedDurationMin: number;
  payment: {
    method: string;
    status: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  driverDetails?: {
    driverId: string;
    name: string;
    phone: string;
    rating: number;
    avatarUrl: string | null;
    userId: string;
    vehicle: {
      type: string;
      make: string;
      model: string;
      plateNumber: string;
    };
    currentLocation?: {
      lat: number;
      lng: number;
      updatedAt: string;
    };
  };
  driver?: {
    _id: string;
    name: string;
    phone: string;
    vehicle: {
      type: string;
      make: string;
      model: string;
      plateNumber: string;
    };
  };
  customer: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  company: {
    _id: string;
    name: string;
    contactPhone: string;
    address: string;
  };
  statusDisplay: string;
}

interface Stats {
  totalDeliveries: number;
  totalDelivered: number;
  totalInProgress: number;
  totalPending: number;
  totalCancelled: number;
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [allStats, setAllStats] = useState<Stats>({
    totalDeliveries: 0,
    totalDelivered: 0,
    totalInProgress: 0,
    totalPending: 0,
    totalCancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [mapModal, setMapModal] = useState<{
    isOpen: boolean;
    lat: number;
    lng: number;
    title: string;
    address?: string;
    updatedAt?: string;
  }>({ isOpen: false, lat: 0, lng: 0, title: "" });

  const fetchStats = async () => {
    try {
      setStatsLoading(true);

      // Using centralized config
      const url =
        ApiClient.buildUrl(API_CONFIG.ENDPOINTS.DELIVERIES.COMPANY_DELIVERIES) +
        "?page=1&limit=1000";

      const data = await ApiClient.get(url);

      if (data.success) {
        const allDeliveries = data.data;
        setAllStats({
          totalDeliveries: data.pagination?.total || 0,
          totalDelivered: allDeliveries.filter(
            (d: Delivery) => d.status === "delivered",
          ).length,
          totalInProgress: allDeliveries.filter((d: Delivery) =>
            ["assigned", "picked_up", "in_transit"].includes(d.status),
          ).length,
          totalPending: allDeliveries.filter(
            (d: Delivery) => d.status === "pending",
          ).length,
          totalCancelled: allDeliveries.filter(
            (d: Delivery) => d.status === "cancelled",
          ).length,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchDeliveries = async (page = 1) => {
    try {
      setLoading(true);

      // Using centralized config
      const url =
        ApiClient.buildUrl(API_CONFIG.ENDPOINTS.DELIVERIES.COMPANY_DELIVERIES) +
        `?page=${page}&limit=10`;

      const data = await ApiClient.get(url);

      if (data.success) {
        setDeliveries(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchDeliveries();

    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement("script");
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=" +
        (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "") +
        "&libraries=places";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleViewDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDelivery(null);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      assigned: "bg-blue-100 text-blue-800",
      picked_up: "bg-purple-100 text-purple-800",
      in_transit: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      delivery.driverDetails?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) || false;

    const matchesStatus =
      statusFilter === "all" ||
      delivery.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const openMapModal = (
    lat: number,
    lng: number,
    title: string,
    address?: string,
    updatedAt?: string,
  ) => {
    setMapModal({ isOpen: true, lat, lng, title, address, updatedAt });
  };

  const closeMapModal = () => {
    setMapModal({
      isOpen: false,
      lat: 0,
      lng: 0,
      title: "",
      updatedAt: undefined,
    });
  };

  const refreshAll = () => {
    fetchStats();
    fetchDeliveries(pagination.page);
  };

  return (
    <div>
      <PageHeader
        title="Deliveries"
        description="Track deliveries, riders and progress across your fleet."
      >
        <button
          onClick={refreshAll}
          disabled={loading || statsLoading}
          className="dash-btn dash-btn-secondary"
        >
          <IconRefresh
            className={`size-4 ${loading || statsLoading ? "animate-spin" : ""}`}
            stroke={1.75}
          />
          Refresh
        </button>
      </PageHeader>

      <div className="space-y-5">
        {/* Stats Summary - Total Across All Pages */}
        <StatStrip className="grid-cols-2 sm:grid-cols-5">
          <Stat label="Total" value={allStats.totalDeliveries} loading={statsLoading} />
          <Stat label="Delivered" value={allStats.totalDelivered} loading={statsLoading} />
          <Stat label="In progress" value={allStats.totalInProgress} loading={statsLoading} />
          <Stat label="Pending" value={allStats.totalPending} loading={statsLoading} />
          <Stat
            label="Cancelled"
            value={allStats.totalCancelled}
            loading={statsLoading}
            className="col-span-2 sm:col-span-1"
          />
        </StatStrip>

        {/* Search and Filters */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1 sm:max-w-sm">
            <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brand-ink-faint" />
            <input
              type="text"
              placeholder="Search by rider name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dash-input pl-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="dash-input sm:w-44"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="picked_up">Picked up</option>
            <option value="in_transit">In transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Deliveries */}
        <div className="dash-card overflow-hidden">
          <div className="divide-y divide-brand-hairline">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <DeliveryRowSkeleton key={idx} />
              ))
            ) : filteredDeliveries.length === 0 ? (
              <EmptyState
                title="No deliveries found"
                description="Try a different search or status filter."
              />
            ) : (
              filteredDeliveries.map((delivery) => (
                <DeliveryRow
                  key={delivery._id}
                  pickup={delivery.pickup.address}
                  dropoff={delivery.dropoff.address}
                  rider={delivery.driverDetails?.name}
                  amount={`${delivery.fare.currency} ${
                    delivery.fare.totalFare?.toLocaleString() || "0"
                  }`}
                  status={delivery.status}
                  onView={() => handleViewDelivery(delivery)}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-brand-hairline px-5 py-3">
              <p className="text-[13px] text-brand-ink-muted tabular-nums">
                Page {pagination.page} of {pagination.pages}
                <span className="hidden sm:inline"> · {pagination.total} total</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchDeliveries(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="dash-btn dash-btn-sm dash-btn-secondary"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchDeliveries(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="dash-btn dash-btn-sm dash-btn-secondary"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedDelivery && (
        <DeliveryDetailsModal
          isOpen={showModal}
          onClose={closeModal}
          delivery={selectedDelivery}
          onViewLocation={openMapModal}
        />
      )}

      {/* Map Modal */}
      <MapModal
        isOpen={mapModal.isOpen}
        onClose={closeMapModal}
        lat={mapModal.lat}
        lng={mapModal.lng}
        title={mapModal.title}
        address={mapModal.address}
        updatedAt={mapModal.updatedAt}
      />
    </div>
  );
}
