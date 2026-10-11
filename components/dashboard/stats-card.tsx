// components/dashboard/stats-card.tsx
import React from "react";
import { Stat } from "@/components/dashboard/primitives";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBgColor?: string;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  loading?: boolean;
  currency?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  loading = false,
  currency,
  className,
}: StatsCardProps) {
  const formattedValue =
    currency && typeof value === "number"
      ? `${currency} ${value.toLocaleString()}`
      : value.toLocaleString();

  return (
    <Stat
      label={title}
      value={formattedValue}
      loading={loading}
      className={className}
    />
  );
}
