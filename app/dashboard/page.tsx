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
} from "@tabler/icons-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { API_CONFIG } from "./../lib/config";
import { formatDate } from "./../lib/utils";
import { cn } from "@/lib/utils";

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
  const { getUserRole } = useRole();
  const { canManageDeliveries } = usePermissions();
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

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      {/* <div className="bg-linear-to-r from-slate-800 to-slate-900 text-white p-5 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-100">
              Welcome back, {user?.name || "User"}
            </h1>
            <p className="text-sm text-slate-300 mt-1">Dashboard Overview</p>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <div className="bg-white/10 px-3 py-2 rounded-md border border-white/20">
              <p className="text-xs font-medium text-slate-300">Role</p>
              <p className="text-sm font-semibold capitalize text-white">
                {getUserRole()}
              </p>
            </div>
            <button
              onClick={refreshData}
              disabled={loading.stats || loading.deliveries || loading.drivers}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors disabled:opacity-50 border border-white/20"
              title="Refresh Data"
            >
              <IconRefresh
                className={cn(
                  "h-4 w-4",
                  (loading.stats || loading.deliveries || loading.drivers) &&
                    "animate-spin",
                )}
              />
            </button>
          </div>
        </div>
      </div> */}

      {/* Rest of your component remains the same... */}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Recent Deliveries
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Latest delivery requests
              </p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-xs font-medium px-3 py-1 rounded-md border border-blue-200 hover:bg-blue-50 transition-colors">
              View All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Pickup
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Dropoff
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading.deliveries ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index}>
                    {Array.from({ length: 6 }).map((_, colIndex) => (
                      <td key={colIndex} className="px-4 py-3">
                        <div className="h-3 bg-gray-200 animate-pulse rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : deliveries.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    <IconPackage className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm">No deliveries yet</p>
                  </td>
                </tr>
              ) : (
                deliveries.map((delivery) => (
                  <tr
                    key={delivery._id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium text-gray-900">
                        {delivery.referenceId}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start">
                        <IconMapPin className="h-3 w-3 text-blue-500 mr-1.5 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs text-gray-900 font-medium truncate">
                            {delivery.pickup.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[150px]">
                            {delivery.pickup.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start">
                        <IconMapPin className="h-3 w-3 text-green-500 mr-1.5 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs text-gray-900 font-medium truncate">
                            {delivery.recipientName}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[150px]">
                            {delivery.dropoff.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold text-gray-900">
                        {delivery.fare.currency}{" "}
                        {delivery.fare.amount?.toLocaleString() || "0"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(delivery.status)}
                        <StatusBadge status={delivery.status} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Drivers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
        </div>

        {/* Delivery Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
        </div>
      </div>
    </div>
  );
}
