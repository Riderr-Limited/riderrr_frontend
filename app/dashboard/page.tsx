"use client";

import { useAuth, useRole, usePermissions } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import {
  IconPackage,
  IconTrendingUp,
  IconUsers,
  IconCash,
  IconMapPin,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconTruck,
  IconRefresh,
  IconArrowUpRight,
  IconEye,
  IconX,
} from "@tabler/icons-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { API_CONFIG } from "./../lib/config";
import { formatDate } from "./../lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Delivery {
  _id: string;
  referenceId: string;
  pickup: { address: string; lat: number; lng: number; name: string };
  dropoff: { address: string; lat: number; lng: number; name: string };
  status: string;
  fare: { amount?: number; totalFare?: number; currency: string };
  payment: { status: string; method: string };
  createdAt: string;
  customerName: string;
  recipientName: string;
  driverDetails?: {
    name: string;
  };
}

interface Driver {
  _id: string;
  userId: { name: string; email: string; phone: string; avatarUrl?: string };
  plateNumber: string;
  vehicleType: string;
  isOnline: boolean;
  isActive: boolean;
  stats: { totalDeliveries: number; totalEarnings: number };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { getUserRole } = useRole();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT),
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUnreadCount(data.data.count);
          }
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const [stats, setStats] = useState({
    totalDeliveries: 0,
    totalRevenue: 0,
    totalDrivers: 0,
    onlineDrivers: 0,
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    stats: true,
    deliveries: true,
    drivers: true,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading({ stats: true, deliveries: true, drivers: true });
        const token = localStorage.getItem("access_token");

        // Use Promise.all to fetch data in parallel
        const [deliveriesRes, driversRes, statsRes] = await Promise.all([
          fetch(
            API_CONFIG.buildUrl(
              API_CONFIG.ENDPOINTS.DELIVERIES.COMPANY_DELIVERIES,
            ),
            { headers: { Authorization: `Bearer ${token}` } },
          ),
          fetch(API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.COMPANY.DRIVERS), {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.COMPANY.STATISTICS), {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Process deliveries response
        if (deliveriesRes.ok) {
          const deliveriesData = await deliveriesRes.json();
          if (deliveriesData.success) {
            setDeliveries(deliveriesData.data);
            setStats((prev) => ({
              ...prev,
              totalDeliveries: deliveriesData.pagination?.total || 0,
            }));
            setLoading((prev) => ({ ...prev, deliveries: false }));
          }
        }

        // Process drivers response
        if (driversRes.ok) {
          const driversData = await driversRes.json();
          if (driversData.success) {
            setDrivers(driversData.data);
            const online = driversData.data.filter(
              (d: Driver) => d.isOnline && d.isActive,
            ).length;
            setStats((prev) => ({
              ...prev,
              totalDrivers: driversData.data.length,
              onlineDrivers: online,
            }));
            setLoading((prev) => ({ ...prev, drivers: false }));
          }
        }

        // Process statistics response
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) {
            setStats((prev) => ({
              ...prev,
              totalRevenue: statsData.data.summary?.totalRevenue || 0,
            }));
            setLoading((prev) => ({ ...prev, stats: false }));
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading({ stats: false, deliveries: false, drivers: false });
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
        return <IconCheck className="h-4 w-4 text-green-500" />;
      case "cancelled":
      case "failed":
        return <IconAlertCircle className="h-4 w-4 text-red-500" />;
      case "assigned":
      case "picked_up":
      case "in_transit":
        return <IconTruck className="h-4 w-4 text-blue-500" />;
      default:
        return <IconClock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const refreshData = async () => {
    try {
      setLoading({ stats: true, deliveries: true, drivers: true });
      const token = localStorage.getItem("access_token");

      const [deliveriesRes, driversRes, statsRes] = await Promise.all([
        fetch(
          API_CONFIG.buildUrl(
            API_CONFIG.ENDPOINTS.DELIVERIES.COMPANY_DELIVERIES,
          ),
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        fetch(API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.COMPANY.DRIVERS), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.COMPANY.STATISTICS), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (deliveriesRes.ok) {
        const deliveriesData = await deliveriesRes.json();
        if (deliveriesData.success) {
          setDeliveries(deliveriesData.data);
          setStats((prev) => ({
            ...prev,
            totalDeliveries: deliveriesData.pagination?.total || 0,
          }));
          setLoading((prev) => ({ ...prev, deliveries: false }));
        }
      }

      if (driversRes.ok) {
        const driversData = await driversRes.json();
        if (driversData.success) {
          setDrivers(driversData.data);
          const online = driversData.data.filter(
            (d: Driver) => d.isOnline && d.isActive,
          ).length;
          setStats((prev) => ({
            ...prev,
            totalDrivers: driversData.data.length,
            onlineDrivers: online,
          }));
          setLoading((prev) => ({ ...prev, drivers: false }));
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats((prev) => ({
            ...prev,
            totalRevenue: statsData.data.summary?.totalRevenue || 0,
          }));
          setLoading((prev) => ({ ...prev, stats: false }));
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading({ stats: false, deliveries: false, drivers: false });
    }
  };

  const handleViewDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDelivery(null);
  };

  return (
    <div className="space-y-8 p-6 bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-screen">
      {/* Professional Header */}
      {/* <div className="bg-linear-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-8 rounded-2xl shadow-xl border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.name || "User"}
            </h1>
            <p className="text-blue-100 mt-2 text-base font-medium">
              Here&apos;s what&apos;s happening with your deliveries today
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/20">
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                Role
              </p>
              <p className="text-lg font-bold capitalize text-white mt-1">
                Company Admin
              </p>
            </div>
            <button
              onClick={refreshData}
              disabled={loading.stats || loading.deliveries || loading.drivers}
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-200 disabled:opacity-50 border border-white/20 hover:scale-105"
              title="Refresh Data"
            >
              <IconRefresh
                className={cn(
                  "h-5 w-5",
                  (loading.stats || loading.deliveries || loading.drivers) &&
                    "animate-spin",
                )}
              />
            </button>
          </div>
        </div>
      </div> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Deliveries"
          value={stats.totalDeliveries}
          icon={IconPackage}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          change={12}
          changeType="increase"
          loading={loading.stats}
        />

        <StatsCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={IconCash}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          change={8}
          changeType="increase"
          loading={loading.stats}
          currency="NGN"
        />

        <StatsCard
          title="Total Drivers"
          value={stats.totalDrivers}
          icon={IconUsers}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
          change={5}
          changeType="increase"
          loading={loading.drivers}
        />

        <StatsCard
          title="Online Now"
          value={stats.onlineDrivers}
          icon={IconTrendingUp}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
          change={3}
          changeType="increase"
          loading={loading.drivers}
        />
      </div>

      {/* Recent Deliveries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <IconPackage className="h-6 w-6 text-blue-600" />
              Recent Deliveries
            </h3>
            <p className="text-sm text-gray-600 mt-1 font-medium">
              Latest delivery requests and updates
            </p>
          </div>
          <Link
            href="/dashboard/deliveries"
            className="text-blue-600 hover:text-blue-700 text-sm font-semibold px-4 py-2 rounded-lg border-2 border-blue-200 hover:bg-blue-50 transition-all duration-200 hover:scale-105 flex items-center gap-1"
          >
            View All
            <IconArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Deliveries Cards */}
        <div className="space-y-3">
          {loading.deliveries ? (
            Array.from({ length: 3 }).map((_, idx) => (
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
          ) : deliveries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <IconPackage className="h-16 w-16 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 text-lg">No deliveries found</p>
            </div>
          ) : (
            deliveries.slice(0, 5).map((delivery) => (
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
                        {(delivery.fare.totalFare || delivery.fare.amount)?.toLocaleString() || "0"}
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
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Drivers */}
        {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Active Drivers
          </h3>
          <div className="space-y-3">
            {loading.drivers
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2"
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full mr-2"></div>
                      <div>
                        <div className="h-3 w-20 bg-gray-200 animate-pulse rounded mb-1"></div>
                        <div className="h-2 w-14 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    </div>
                    <div className="h-1.5 w-1.5 bg-gray-200 animate-pulse rounded-full"></div>
                  </div>
                ))
              : drivers
                  .filter((d) => d.isOnline)
                  .slice(0, 3)
                  .map((driver) => (
                    <div
                      key={driver._id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-blue-600 font-semibold text-xs">
                            {driver.userId.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            {driver.userId.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {driver.plateNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></div>
                        <span className="text-xs text-green-600">Online</span>
                      </div>
                    </div>
                  ))}
          </div>
        </div> */}

        {/* Delivery Status */}
        {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Delivery Status
          </h3>
          <div className="space-y-3">
            {["assigned", "in_transit", "delivered"].map((status) => {
              const count = deliveries.filter(
                (d) => d.status === status,
              ).length;
              return (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-xs text-gray-700 capitalize font-medium">
                    {status.replace("_", " ")}
                  </span>
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-900 mr-2">
                      {count}
                    </span>
                    <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          status === "delivered"
                            ? "bg-green-500"
                            : status === "in_transit"
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                        }`}
                        style={{
                          width: `${(count / Math.max(deliveries.length, 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div> */}

        {/* Quick Actions */}
        {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {canManageDeliveries && (
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-3 rounded-md transition-colors text-sm">
                + Create Delivery
              </button>
            )}
            {user?.role === "company_admin" && (
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-3 rounded-md transition-colors text-sm">
                + Add Rider
              </button>
            )}
            <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-3 rounded-md transition-colors text-sm">
              📊 View Reports
            </button>
          </div>
        </div> */}
      </div>

      {/* Modal */}
      {showModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Delivery Details</h2>
                  <p className="text-sm text-white/80">#{selectedDelivery.referenceId}</p>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-white/20 rounded-lg transition-all">
                  <IconX className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IconMapPin className="h-5 w-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Pickup</h3>
                  </div>
                  <p className="text-sm text-gray-700">{selectedDelivery.pickup.address}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IconMapPin className="h-5 w-5 text-green-600" />
                    <h3 className="font-bold text-gray-900">Dropoff</h3>
                  </div>
                  <p className="text-sm text-gray-700">{selectedDelivery.dropoff.address}</p>
                </div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <IconCash className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-bold text-gray-900">Fare</h3>
                </div>
                <p className="text-2xl font-bold text-emerald-700">
                  {selectedDelivery.fare.currency} {(selectedDelivery.fare.totalFare || selectedDelivery.fare.amount)?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <IconTruck className="h-5 w-5 text-purple-600" />
                  <h3 className="font-bold text-gray-900">Rider</h3>
                </div>
                <p className="text-sm text-gray-700">{selectedDelivery.driverDetails?.name || "Not Assigned"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <IconClock className="h-5 w-5 text-gray-600" />
                  <h3 className="font-bold text-gray-900">Created</h3>
                </div>
                <p className="text-sm text-gray-700">{formatDate(selectedDelivery.createdAt)}</p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
              <button onClick={closeModal} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
