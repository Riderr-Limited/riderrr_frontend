// components/ui/status-badge.tsx
import React from 'react'
import { cn } from '@/libs/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusConfig: Record<string, { color: string; text: string }> = {
  pending: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', text: 'Pending' },
  assigned: { color: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Assigned' },
  picked_up: { color: 'bg-purple-50 text-purple-700 border-purple-200', text: 'Picked Up' },
  in_transit: { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'In Transit' },
  delivered: { color: 'bg-green-50 text-green-700 border-green-200', text: 'Delivered' },
  completed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'Completed' },
  cancelled: { color: 'bg-red-50 text-red-700 border-red-200', text: 'Cancelled' },
  failed: { color: 'bg-rose-50 text-rose-700 border-rose-200', text: 'Failed' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { 
    color: 'bg-gray-50 text-gray-700 border-gray-200', 
    text: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
  }

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      config.color,
      className
    )}>
      {config.text}
    </span>
  )
}