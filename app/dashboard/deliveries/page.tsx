"use client";

import { useEffect, useState } from "react";
import {
  IconMapPin,
  IconClock,
  IconEye,
  IconX,
  IconPackage,
  IconUser,
  IconPhone,
  IconCash,
  IconTruck,
  IconRefresh,
  IconSearch,
  IconFilter,
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
  console.log("Deliveries state:", deliveries); // Debugging log
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
        "https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places";
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
      delivery.driverDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;

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
  ) => {
    setMapModal({ isOpen: true, lat, lng, title, address });
  };

  const closeMapModal = () => {
    setMapModal({ isOpen: false, lat: 0, lng: 0, title: "" });
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
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-600 mb-1">Total</p>
            {statsLoading ? (
              <div className="h-6 md:h-8 w-12 md:w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {allStats.totalDeliveries}
              </p>
            )}
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-green-700 mb-1">Delivered</p>
            {statsLoading ? (
              <div className="h-6 md:h-8 w-12 md:w-16 bg-green-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-xl md:text-2xl font-bold text-green-600">
                {allStats.totalDelivered}
              </p>
            )}
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-blue-700 mb-1">In Progress</p>
            {statsLoading ? (
              <div className="h-6 md:h-8 w-12 md:w-16 bg-blue-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-xl md:text-2xl font-bold text-blue-600">
                {allStats.totalInProgress}
              </p>
            )}
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-yellow-700 mb-1">Pending</p>
            {statsLoading ? (
              <div className="h-6 md:h-8 w-12 md:w-16 bg-yellow-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-xl md:text-2xl font-bold text-yellow-600">
                {allStats.totalPending}
              </p>
            )}
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 md:p-4 col-span-2 sm:col-span-1">
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
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
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
            <div key={delivery._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
              <div className="p-4 md:p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Pickup Location */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <IconMapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-blue-600 mb-1">PICKUP</p>
                      <p className="text-sm text-gray-900 font-medium line-clamp-2">{delivery.pickup.address}</p>
                    </div>
                  </div>

                  {/* Dropoff Location */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <IconMapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-green-600 mb-1">DROPOFF</p>
                      <p className="text-sm text-gray-900 font-medium line-clamp-2">{delivery.dropoff.address}</p>
                    </div>
                  </div>

                  {/* Rider & Action */}
                  <div className="flex items-center justify-between md:justify-end gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <IconTruck className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rider</p>
                        <p className="text-sm font-medium text-gray-900">{delivery.driverDetails?.name || "Not Assigned"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDelivery(delivery)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                    >
                      <IconEye className="h-4 w-4" />
                      <span className="hidden sm:inline">View</span>
                    </button>
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
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-10">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                Delivery Details
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IconX className="h-5 w-5 md:h-6 md:w-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Status Banner */}
              <div
                className={`p-3 md:p-4 rounded-lg ${getStatusColor(selectedDelivery.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm md:text-base font-semibold">
                      Status: {selectedDelivery.statusDisplay}
                    </p>
                    <p className="text-xs md:text-sm mt-1">
                      Payment: {selectedDelivery.payment.status}
                    </p>
                  </div>
                  <IconTruck className="h-6 w-6 md:h-8 md:w-8" />
                </div>
              </div>

              {/* Recipient Info */}
              <div className="border border-gray-200 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <IconUser className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Recipient</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Name:</span>{" "}
                    {selectedDelivery.recipientName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedDelivery.recipientPhone}
                  </p>
                </div>
              </div>

              {/* Pickup & Dropoff Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IconMapPin className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">
                      Pickup Location
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Contact:</span>{" "}
                      {selectedDelivery.pickup.name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedDelivery.pickup.phone}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Address:</span>{" "}
                      {selectedDelivery.pickup.address}
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IconMapPin className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">
                      Dropoff Location
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Contact:</span>{" "}
                      {selectedDelivery.dropoff.name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedDelivery.dropoff.phone}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Address:</span>{" "}
                      {selectedDelivery.dropoff.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Item & Fare Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IconPackage className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">
                      Item Details
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Type:</span>{" "}
                      {selectedDelivery.itemDetails.type}
                    </p>
                    {selectedDelivery.itemDetails.description && (
                      <p className="text-sm">
                        <span className="font-medium">Description:</span>{" "}
                        {selectedDelivery.itemDetails.description}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-medium">Weight:</span>{" "}
                      {selectedDelivery.itemDetails.weight} kg
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Distance:</span>{" "}
                      {selectedDelivery.estimatedDistanceKm.toFixed(2)} km
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Est. Duration:</span>{" "}
                      {selectedDelivery.estimatedDurationMin} mins
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IconCash className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">
                      Fare Details
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Base Fare:</span>{" "}
                      {selectedDelivery.fare.currency}{" "}
                      {selectedDelivery.fare.baseFare?.toLocaleString() || "0"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Distance Fare:</span>{" "}
                      {selectedDelivery.fare.currency}{" "}
                      {selectedDelivery.fare.distanceFare?.toFixed(2) || "0"}
                    </p>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <p className="text-sm font-bold">
                        <span className="font-bold">Total Fare:</span>{" "}
                        {selectedDelivery.fare.currency}{" "}
                        {selectedDelivery.fare.totalFare?.toLocaleString() ||
                          "0"}
                      </p>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Payment Method:</span>{" "}
                      {selectedDelivery.payment.method}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Payment Status:</span>{" "}
                      {selectedDelivery.payment.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rider Info (if assigned) */}
              {selectedDelivery.driverDetails && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IconTruck className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">
                      Rider Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Name:</span>{" "}
                        {selectedDelivery.driverDetails.name}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Phone:</span>{" "}
                        {selectedDelivery.driverDetails.phone || "N/A"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Rating:</span>{" "}
                        {selectedDelivery.driverDetails.rating || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Vehicle:</span>{" "}
                        {selectedDelivery.driverDetails.vehicle.make}{" "}
                        {selectedDelivery.driverDetails.vehicle.model}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Plate:</span>{" "}
                        {selectedDelivery.driverDetails.vehicle.plateNumber}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Type:</span>{" "}
                        {selectedDelivery.driverDetails.vehicle.type}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <IconClock className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-gray-900">Timeline</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5"></div>
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(selectedDelivery.createdAt)}
                      </p>
                    </div>
                  </div>
                  {selectedDelivery.assignedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5"></div>
                      <div>
                        <p className="text-sm font-medium">Assigned</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(selectedDelivery.assignedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedDelivery.pickedUpAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5"></div>
                      <div>
                        <p className="text-sm font-medium">Picked Up</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(selectedDelivery.pickedUpAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedDelivery.deliveredAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-600 mt-1.5"></div>
                      <div>
                        <p className="text-sm font-medium">Delivered</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(selectedDelivery.deliveredAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="w-full sm:w-auto px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
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
      />
    </div>
  );
}
