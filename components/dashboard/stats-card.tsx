// components/dashboard/stats-card.tsx
import React from "react";
import { cn } from "@/libs/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
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
  icon: Icon,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-50",
  // change,
  // changeType = "neutral",
  loading = false,
  currency,
  className,
}: StatsCardProps) {
  const formattedValue =
    currency && typeof value === "number"
      ? `${currency} ${value.toLocaleString()}`
      : value.toLocaleString();

  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-300 hover:-translate-y-1 group",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-600 mb-2 truncate uppercase tracking-wide">
            {title}
          </p>
          {loading ? (
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ) : (
            <p className="text-3xl md:text-4xl font-extrabold text-gray-900 truncate">
              {formattedValue}
            </p>
          )}
        </div>
        <div
          className={cn(
            "p-4 rounded-2xl ml-4 shrink-0 group-hover:scale-110 transition-transform duration-300",
            iconBgColor,
          )}
        >
          <Icon className={cn("h-7 w-7", iconColor)} />
        </div>
      </div>

      {/* {change !== undefined && !loading && (
          <div className="mt-5 flex items-center pt-4 border-t border-gray-100">
            <span className={cn(
              "inline-flex items-center text-sm font-bold px-2.5 py-1 rounded-lg",
              changeType === 'increase' ? 'text-green-700 bg-green-50' : 
              changeType === 'decrease' ? 'text-red-700 bg-red-50' : 
              'text-gray-700 bg-gray-50'
            )}>
              {changeType === 'increase' ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </>
              ) : changeType === 'decrease' ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </>
              ) : null}
              {Math.abs(change)}%
            </span>
            <span className="ml-2 text-sm text-gray-600 truncate font-medium">from last month</span>
          </div>
        )} */}
    </div>
  );
}
