// components/dashboard/stats-card.tsx
import React from 'react'
import { cn } from '@/libs/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  iconColor?: string
  iconBgColor?: string
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  loading?: boolean
  currency?: string
  className?: string
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-50',
  change,
  changeType = 'neutral',
  loading = false,
  currency,
  className
}: StatsCardProps) {
  const formattedValue = currency && typeof value === 'number' 
    ? `${currency} ${value.toLocaleString()}`
    : value.toLocaleString()

  return (
    <div className={cn(
      "bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-blue-200",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <p className="text-2xl md:text-3xl font-bold text-gray-900 truncate">{formattedValue}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-full ml-4 flex-shrink-0", iconBgColor)}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
      </div>
      
      {change !== undefined && !loading && (
        <div className="mt-4 flex items-center">
          <span className={cn(
            "inline-flex items-center text-sm font-medium",
            changeType === 'increase' ? 'text-green-600' : 
            changeType === 'decrease' ? 'text-red-600' : 
            'text-gray-600'
          )}>
            {changeType === 'increase' ? (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </>
            ) : changeType === 'decrease' ? (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </>
            ) : null}
            {Math.abs(change)}%
          </span>
          <span className="ml-2 text-sm text-gray-500 truncate">from last month</span>
        </div>
      )}
    </div>
  )
}