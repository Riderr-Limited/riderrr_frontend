"use client";

import { useAuth, useRole, usePermissions } from "@/contexts/AuthContext";
import { useEffect, useState, useCallback } from "react";
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
} from "@tabler/icons-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/libs/utils";

interface Delivery {
  _id: string;
  referenceId: string;
  pickup: { address: string; lat: number; lng: number; name: string };
  dropoff: { address: string; lat: number; lng: number; name: string };
  status: string;
  fare: { amount?: number; currency: string };
  payment: { status: string; method: string };
  createdAt: string;
  customerName: string;
  recipientName: string;
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
  const { getUserRole, canAccess } = useRole();
  const { canViewRevenue, canManageDeliveries } = usePermissions();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        "http://localhost:5000/api/notifications/unread-count",
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
  }, []);

  useEffect(() => {
    // Start with immediate call, then set interval
    const interval = setInterval(fetchUnreadCount, 30000);
    setTimeout(() => {
      fetchUnreadCount(); // Call immediately after setting up interval
    }, 0);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const [stats, setStats] = useState({
    totalDeliveries: 0,
    totalRevenue: 0,
    totalDrivers: 0,
    onlineDrivers: 0,
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
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

        // Fetch deliveries
        const deliveriesRes = await fetch(
          "http://localhost:5000/api/deliveries/company/deliveries",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
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

        // Fetch drivers
        const driversRes = await fetch(
          "http://localhost:5000/api/company/drivers",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
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

        // Fetch statistics
        const statsRes = await fetch(
          "http://localhost:5000/api/company/statistics",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
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

  const refreshData = useCallback(async () => {
    try {
      setLoading({ stats: true, deliveries: true, drivers: true });
      const token = localStorage.getItem("access_token");

      // Fetch deliveries
      const deliveriesRes = await fetch(
        "http://localhost:5000/api/deliveries/company/deliveries",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
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

      // Fetch drivers
      const driversRes = await fetch(
        "http://localhost:5000/api/company/drivers",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
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

      // Fetch statistics
      const statsRes = await fetch(
        "http://localhost:5000/api/company/statistics",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
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
  }, []);

  return (
    <div className="space-y-6">
      {/* Role-based greeting */}
      <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Welcome back, {user?.name || "User"}!
            </h2>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <p className="text-sm font-medium">Current Role</p>
              <p className="text-lg font-bold capitalize">{getUserRole()}</p>
            </div>
            <button
              onClick={refreshData}
              disabled={loading.stats || loading.deliveries || loading.drivers}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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

      {/* Recent Deliveries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Deliveries
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Latest delivery requests
              </p>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pickup Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dropoff Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading.deliveries ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index}>
                    {Array.from({ length: 6 }).map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : deliveries.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <IconPackage className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p>No deliveries yet</p>
                  </td>
                </tr>
              ) : (
                deliveries.map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {delivery.referenceId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <IconMapPin className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {delivery.pickup.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {delivery.pickup.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <IconMapPin className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {delivery.recipientName}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {delivery.dropoff.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {delivery.fare.currency}{" "}
                        {delivery.fare.amount?.toLocaleString() || "0"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(delivery.status)}
                        <StatusBadge status={delivery.status} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(delivery.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Drivers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Active Drivers
          </h3>
          <div className="space-y-4">
            {loading.drivers
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full mr-3"></div>
                      <div>
                        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-1"></div>
                        <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    </div>
                    <div className="h-2 w-2 bg-gray-200 animate-pulse rounded-full mr-2"></div>
                  </div>
                ))
              : drivers
                  .filter((d) => d.isOnline)
                  .slice(0, 3)
                  .map((driver) => (
                    <div
                      key={driver._id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold">
                            {driver.userId.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {driver.userId.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {driver.plateNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-xs text-green-600">Online</span>
                      </div>
                    </div>
                  ))}
          </div>
        </div>

        {/* Delivery Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Delivery Status
          </h3>
          <div className="space-y-4">
            {["assigned", "in_transit", "delivered"].map((status) => {
              const count = deliveries.filter(
                (d) => d.status === status,
              ).length;
              return (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 capitalize">
                    {status.replace("_", " ")}
                  </span>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-900 mr-2">
                      {count}
                    </span>
                    <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
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
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            {canManageDeliveries && (
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors">
                + Create New Delivery
              </button>
            )}
            {user?.role === "company_admin" && (
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors">
                + Add New Rider
              </button>
            )}
            <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-colors">
              📊 View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this helper function at the end of the file
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
