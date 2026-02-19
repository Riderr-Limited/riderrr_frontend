"use client";

import {
  IconX,
  IconMapPin,
  IconCash,
  IconPackage,
  IconTruck,
  IconClock,
} from "@tabler/icons-react";

interface DeliveryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: {
    _id: string;
    referenceId: string;
    pickup: { address: string; lat: number; lng: number; name: string };
    dropoff: { address: string; lat: number; lng: number; name: string };
    status: string;
    statusDisplay?: string;
    fare: {
      amount?: number;
      totalFare?: number;
      baseFare?: number;
      distanceFare?: number;
      currency: string;
    };
    payment: { status: string; method: string };
    createdAt: string;
    updatedAt?: string;
    assignedAt?: string;
    pickedUpAt?: string;
    deliveredAt?: string;
    customerName?: string;
    recipientName?: string;
    itemDetails?: {
      type: string;
      description?: string;
      weight: number;
      value: number;
    };
    estimatedDistanceKm?: number;
    estimatedDurationMin?: number;
    driverDetails?: {
      name: string;
      phone?: string;
      rating?: number;
      vehicle?: {
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
  };
  onViewLocation?: (lat: number, lng: number, title: string, address?: string, updatedAt?: string) => void;
}

export default function DeliveryDetailsModal({
  isOpen,
  onClose,
  delivery,
  onViewLocation,
}: DeliveryDetailsModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="sticky top-0 bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                Delivery Details
              </h2>
              <p className="text-sm text-white/80">#{delivery.referenceId}</p>
            </div>
            <button
              onClick={onClose}
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
              className={`p-4 rounded-xl ${getStatusColor(delivery.status)} border-2 border-current/20`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold mb-1">
                    {delivery.statusDisplay || delivery.status}
                  </p>
                  {delivery.payment.method.toLowerCase() !== "cash" && (
                    <p className="text-sm opacity-90">
                      Payment: {delivery.payment.status}
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
                  <h3 className="font-bold text-gray-900">Pickup Location</h3>
                </div>
                <p className="text-sm text-gray-700">{delivery.pickup.address}</p>
              </div>

              <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <IconMapPin className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">Dropoff Location</h3>
                </div>
                <p className="text-sm text-gray-700">{delivery.dropoff.address}</p>
              </div>
            </div>

            {/* Item & Fare Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {delivery.itemDetails && (
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
                        {delivery.itemDetails.type}
                      </span>
                    </div>
                    {delivery.itemDetails.description && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Description:</span>
                        <span className="font-medium text-gray-900">
                          {delivery.itemDetails.description}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium text-gray-900">
                        {delivery.itemDetails.weight} kg
                      </span>
                    </div>
                    {delivery.estimatedDistanceKm && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Distance:</span>
                        <span className="font-medium text-gray-900">
                          {delivery.estimatedDistanceKm.toFixed(2)} km
                        </span>
                      </div>
                    )}
                    {delivery.estimatedDurationMin && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium text-gray-900">
                          {delivery.estimatedDurationMin} mins
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-linear-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-emerald-600 rounded-lg">
                    <IconCash className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">Fare Details</h3>
                </div>
                <div className="space-y-2">
                  {delivery.fare.baseFare && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Base Fare:</span>
                      <span className="font-medium text-gray-900">
                        {delivery.fare.currency}{" "}
                        {delivery.fare.baseFare?.toLocaleString() || "0"}
                      </span>
                    </div>
                  )}
                  {delivery.fare.distanceFare && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Distance Fare:</span>
                      <span className="font-medium text-gray-900">
                        {delivery.fare.currency}{" "}
                        {delivery.fare.distanceFare?.toFixed(2) || "0"}
                      </span>
                    </div>
                  )}
                  <div className="border-t-2 border-emerald-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">Total Fare:</span>
                      <span className="font-bold text-emerald-700 text-lg">
                        {delivery.fare.currency}{" "}
                        {(
                          delivery.fare.totalFare || delivery.fare.amount
                        )?.toLocaleString() || "0"}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium text-gray-900">
                      {delivery.payment.method}
                    </span>
                  </div>
                  {delivery.payment.method.toLowerCase() !== "cash" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-gray-900">
                        {delivery.payment.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rider Info (if assigned) */}
            {delivery.driverDetails && (
              <div className="bg-linear-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                      <IconTruck className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900">Rider Information</h3>
                  </div>
                  {delivery.driverDetails.currentLocation && onViewLocation && (
                    <button
                      onClick={() =>
                        onViewLocation(
                          delivery.driverDetails!.currentLocation!.lat,
                          delivery.driverDetails!.currentLocation!.lng,
                          "Rider Location",
                          `${delivery.driverDetails!.name}'s current location`,
                          delivery.driverDetails!.currentLocation!.updatedAt,
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
                        {delivery.driverDetails.name}
                      </span>
                    </div>
                    {delivery.driverDetails.phone && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium text-gray-900">
                          {delivery.driverDetails.phone}
                        </span>
                      </div>
                    )}
                    {delivery.driverDetails.rating !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium text-gray-900">
                          ⭐ {delivery.driverDetails.rating}
                        </span>
                      </div>
                    )}
                  </div>
                  {delivery.driverDetails.vehicle && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Vehicle:</span>
                        <span className="font-medium text-gray-900">
                          {delivery.driverDetails.vehicle.make}{" "}
                          {delivery.driverDetails.vehicle.model}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Plate:</span>
                        <span className="font-medium text-gray-900">
                          {delivery.driverDetails.vehicle.plateNumber}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium text-gray-900">
                          {delivery.driverDetails.vehicle.type}
                        </span>
                      </div>
                    </div>
                  )}
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
                    <p className="text-sm font-semibold text-gray-900">Created</p>
                    <p className="text-xs text-gray-600">
                      {formatDate(delivery.createdAt)}
                    </p>
                  </div>
                </div>
                {delivery.assignedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-600 mt-1 ring-4 ring-purple-200"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Assigned</p>
                      <p className="text-xs text-gray-600">
                        {formatDate(delivery.assignedAt)}
                      </p>
                    </div>
                  </div>
                )}
                {delivery.pickedUpAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-indigo-600 mt-1 ring-4 ring-indigo-200"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Picked Up</p>
                      <p className="text-xs text-gray-600">
                        {formatDate(delivery.pickedUpAt)}
                      </p>
                    </div>
                  </div>
                )}
                {delivery.deliveredAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-600 mt-1 ring-4 ring-green-200"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Delivered</p>
                      <p className="text-xs text-gray-600">
                        {formatDate(delivery.deliveredAt)}
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
            onClick={onClose}
            className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
