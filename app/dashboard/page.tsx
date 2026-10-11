"use client";

import { useAuth, useRole, usePermissions } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useBankAccount } from "@/hooks/useBankAccount";
import { BankSetupAlert } from "@/components/BankSetupAlert";
import {
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconTruck,
  IconArrowUpRight,
} from "@tabler/icons-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { PageHeader, StatStrip, EmptyState } from "@/components/dashboard/primitives";
import { DeliveryRow, DeliveryRowSkeleton } from "@/components/dashboard/DeliveryRow";
import DeliveryDetailsModal from "@/components/DeliveryDetailsModal";
import { API_CONFIG } from "./../lib/config";
import { formatDate } from "./../lib/utils";
import { cn } from "@/lib/utils";
import { TokenUtils } from "@/lib/tokenUtils";
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
  const { bankData, loading: bankLoading, needsSetup, setupStatus } = useBankAccount();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = TokenUtils.getToken();
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
        const token = TokenUtils.getToken();

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
      const token = TokenUtils.getToken();

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
    <div>
      <PageHeader
        title="Overview"
        description={`Welcome back, ${user?.name || "User"}. Here's what's happening today.`}
      />

      <div className="space-y-6">
        {/* Bank Setup Alert */}
        {user?.role === 'company_admin' && !bankLoading && needsSetup && (
          <BankSetupAlert
            setupStatus={setupStatus}
            bankAccount={bankData?.bankAccount}
          />
        )}

        {/* Stats */}
        <StatStrip className="grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total deliveries"
            value={stats.totalDeliveries}
            loading={loading.stats}
          />
          <StatsCard
            title="Total revenue"
            value={stats.totalRevenue}
            loading={loading.stats}
            currency="NGN"
          />
          <StatsCard
            title="Total drivers"
            value={stats.totalDrivers}
            loading={loading.drivers}
          />
          <StatsCard
            title="Online now"
            value={stats.onlineDrivers}
            loading={loading.drivers}
          />
        </StatStrip>

        {/* Recent Deliveries */}
        <section className="dash-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-brand-hairline px-5 py-3.5">
            <h2 className="text-sm font-semibold text-brand-ink">
              Recent deliveries
            </h2>
            <Link
              href="/dashboard/deliveries"
              className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-ink-muted transition-colors hover:text-brand-ink"
            >
              View all
              <IconArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-brand-hairline">
            {loading.deliveries ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <DeliveryRowSkeleton key={idx} />
              ))
            ) : deliveries.length === 0 ? (
              <EmptyState
                title="No deliveries yet"
                description="New delivery requests will show up here."
              />
            ) : (
              deliveries.slice(0, 5).map((delivery) => (
                <DeliveryRow
                  key={delivery._id}
                  pickup={delivery.pickup.address}
                  dropoff={delivery.dropoff.address}
                  rider={delivery.driverDetails?.name}
                  amount={`${delivery.fare.currency} ${
                    (delivery.fare.totalFare || delivery.fare.amount)?.toLocaleString() || "0"
                  }`}
                  status={delivery.status}
                  onView={() => handleViewDelivery(delivery)}
                />
              ))
            )}
          </div>
        </section>
      </div>

      {/* Modal */}
      {showModal && selectedDelivery && (
        <DeliveryDetailsModal
          isOpen={showModal}
          onClose={closeModal}
          delivery={selectedDelivery}
        />
      )}
    </div>
  );
}
