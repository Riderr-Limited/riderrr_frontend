"use client";

import { useEffect, useState } from "react";
import {
  IconMapPin,
  IconClock,
  IconEye,
  IconX,
  IconPackage,
  IconCash,
  IconTruck,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import { API_CONFIG } from "../../lib/config";
import { ApiClient } from "../../lib/api-client";
import MapModal from "@/components/MapModal";

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
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by rider name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={refreshAll}
                disabled={loading || statsLoading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
              >
                <IconRefresh
                  className={`h-4 w-4 ${loading || statsLoading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary - Total Across All Pages */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-600 mb-1">Total</p>
            {statsLoading ? (
              <div className="h-6 md:h-8 w-12 md:w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {allStats.totalDeliveries}
              </p>
            )}
          </div>
          <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-green-700 mb-1">Delivered</p>
            {statsLoading ? (
              <div className="h-6 md:h-8 w-12 md:w-16 bg-green-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-xl md:text-2xl font-bold text-green-600">
                {allStats.totalDelivered}
              </p>
            )}
          </div>
          <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-blue-700 mb-1">In Progress</p>
            {statsLoading ? (
              <div className="h-6 md:h-8 w-12 md:w-16 bg-blue-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-xl md:text-2xl font-bold text-blue-600">
                {allStats.totalInProgress}
              </p>
            )}
          </div>
          <div className="bg-linear-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-yellow-700 mb-1">Pending</p>
            {statsLoading ? (
              <div className="h-6 md:h-8 w-12 md:w-16 bg-yellow-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-xl md:text-2xl font-bold text-yellow-600">
                {allStats.totalPending}
              </p>
            )}
          </div>
          <div className="bg-linear-to-br from-red-50 to-red-100 rounded-lg p-3 md:p-4 col-span-2 sm:col-span-1">
            <p className="text-xs md:text-sm text-red-700 mb-1">Cancelled</p>
            {statsLoading ? (
              <div className="h-6 md:h-8 w-12 md:w-16 bg-red-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-xl md:text-2xl font-bold text-red-600">
                {allStats.totalCancelled}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Deliveries Cards - All Screens */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5"
            >
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3"></div>
              </div>
            </div>
          ))
        ) : filteredDeliveries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <IconPackage className="h-16 w-16 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 text-lg">No deliveries found</p>
          </div>
        ) : (
          filteredDeliveries.map((delivery) => (
            <div
              key={delivery._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              {/* Header with Fare and Status */}
              <div className="bg-linear-to-r from-blue-50 to-purple-50 px-4 md:px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <IconCash className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Fare</p>
                    <p className="text-lg font-bold text-gray-900">
                      {delivery.fare.currency}{" "}
                      {delivery.fare.totalFare?.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleViewDelivery(delivery)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                >
                  <IconEye className="h-4 w-4" />
                  <span>Details</span>
                </button>
              </div>

              {/* Body with Route and Rider */}
              <div className="p-4 md:p-5 space-y-4">
                {/* Route Section */}
                <div className="space-y-3">
                  {/* Pickup */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <IconMapPin className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="w-0.5 h-full bg-gray-300 my-1"></div>
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-xs font-semibold text-blue-600 mb-1">
                        PICKUP
                      </p>
                      <p className="text-sm text-gray-900 font-medium">
                        {delivery.pickup.address}
                      </p>
                    </div>
                  </div>

                  {/* Dropoff */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-green-100 rounded-full">
                        <IconMapPin className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-green-600 mb-1">
                        DROPOFF
                      </p>
                      <p className="text-sm text-gray-900 font-medium">
                        {delivery.dropoff.address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rider Info */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 rounded-lg">
                      <IconTruck className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Assigned Rider</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {delivery.driverDetails?.name || "Not Assigned"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
            <div className="text-xs md:text-sm text-gray-500 text-center sm:text-left">
              Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
              total)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchDeliveries(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Previous
              </button>
              <div className="flex items-center px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 font-medium">
                {pagination.page}
              </div>
              <button
                onClick={() => fetchDeliveries(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Delivery Details
                  </h2>
                  <p className="text-sm text-white/80">
                    #{selectedDelivery.referenceId}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 group"
                >
                  <IconX className="h-6 w-6 text-white group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="p-6 space-y-6">
                {/* Status Banner */}
                <div
                  className={`p-4 rounded-xl ${getStatusColor(selectedDelivery.status)} border-2 border-current/20`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold mb-1">
                        {selectedDelivery.statusDisplay}
                      </p>
                      {selectedDelivery.payment.method.toLowerCase() !==
                        "cash" && (
                        <p className="text-sm opacity-90">
                          Payment: {selectedDelivery.payment.status}
                        </p>
                      )}
                    </div>
                    <IconTruck className="h-8 w-8 opacity-80" />
                  </div>
                </div>

                {/* Pickup & Dropoff Locations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <IconMapPin className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900">
                        Pickup Location
                      </h3>
                    </div>
                    <p className="text-sm text-gray-700">
                      {selectedDelivery.pickup.address}
                    </p>
                  </div>

                  <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <IconMapPin className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900">
                        Dropoff Location
                      </h3>
                    </div>
                    <p className="text-sm text-gray-700">
                      {selectedDelivery.dropoff.address}
                    </p>
                  </div>
                </div>

                {/* Item & Fare Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-purple-600 rounded-lg">
                        <IconPackage className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900">Item Details</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium text-gray-900">
                          {selectedDelivery.itemDetails.type}
                        </span>
                      </div>
                      {selectedDelivery.itemDetails.description && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Description:</span>
                          <span className="font-medium text-gray-900">
                            {selectedDelivery.itemDetails.description}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Weight:</span>
                        <span className="font-medium text-gray-900">
                          {selectedDelivery.itemDetails.weight} kg
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Distance:</span>
                        <span className="font-medium text-gray-900">
                          {selectedDelivery.estimatedDistanceKm.toFixed(2)} km
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium text-gray-900">
                          {selectedDelivery.estimatedDurationMin} mins
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-linear-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-emerald-600 rounded-lg">
                        <IconCash className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900">Fare Details</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Base Fare:</span>
                        <span className="font-medium text-gray-900">
                          {selectedDelivery.fare.currency}{" "}
                          {selectedDelivery.fare.baseFare?.toLocaleString() ||
                            "0"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Distance Fare:</span>
                        <span className="font-medium text-gray-900">
                          {selectedDelivery.fare.currency}{" "}
                          {selectedDelivery.fare.distanceFare?.toFixed(2) ||
                            "0"}
                        </span>
                      </div>
                      <div className="border-t-2 border-emerald-300 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-bold text-gray-900">
                            Total Fare:
                          </span>
                          <span className="font-bold text-emerald-700 text-lg">
                            {selectedDelivery.fare.currency}{" "}
                            {selectedDelivery.fare.totalFare?.toLocaleString() ||
                              "0"}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Method:</span>
                        <span className="font-medium text-gray-900">
                          {selectedDelivery.payment.method}
                        </span>
                      </div>
                      {selectedDelivery.payment.method.toLowerCase() !==
                        "cash" && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium text-gray-900">
                            {selectedDelivery.payment.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rider Info (if assigned) */}
                {selectedDelivery.driverDetails && (
                  <div className="bg-linear-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-600 rounded-lg">
                          <IconTruck className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900">
                          Rider Information
                        </h3>
                      </div>
                      {selectedDelivery.driverDetails.currentLocation && (
                        <button
                          onClick={() =>
                            openMapModal(
                              selectedDelivery.driverDetails!.currentLocation!
                                .lat,
                              selectedDelivery.driverDetails!.currentLocation!
                                .lng,
                              "Rider Location",
                              `${selectedDelivery.driverDetails!.name}'s current location`,
                              selectedDelivery.driverDetails!.currentLocation!
                                .updatedAt,
                            )
                          }
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <IconMapPin className="h-4 w-4" />
                          View Location
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium text-gray-900">
                            {selectedDelivery.driverDetails.name}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium text-gray-900">
                            {selectedDelivery.driverDetails.phone || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Rating:</span>
                          <span className="font-medium text-gray-900">
                            ⭐ {selectedDelivery.driverDetails.rating || 0}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Vehicle:</span>
                          <span className="font-medium text-gray-900">
                            {selectedDelivery.driverDetails.vehicle.make}{" "}
                            {selectedDelivery.driverDetails.vehicle.model}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Plate:</span>
                          <span className="font-medium text-gray-900">
                            {selectedDelivery.driverDetails.vehicle.plateNumber}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium text-gray-900">
                            {selectedDelivery.driverDetails.vehicle.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-orange-600 rounded-lg">
                      <IconClock className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900">Timeline</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-600 mt-1 ring-4 ring-blue-200"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          Created
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDate(selectedDelivery.createdAt)}
                        </p>
                      </div>
                    </div>
                    {selectedDelivery.assignedAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-purple-600 mt-1 ring-4 ring-purple-200"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            Assigned
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatDate(selectedDelivery.assignedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedDelivery.pickedUpAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-indigo-600 mt-1 ring-4 ring-indigo-200"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            Picked Up
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatDate(selectedDelivery.pickedUpAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedDelivery.deliveredAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-600 mt-1 ring-4 ring-green-200"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            Delivered
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatDate(selectedDelivery.deliveredAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
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
