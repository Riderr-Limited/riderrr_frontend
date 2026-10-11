// components/ui/status-badge.tsx
import React from 'react'
import { cn } from '@/libs/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusConfig: Record<string, { color: string; text: string }> = {
  pending: { color: 'dash-badge-warning', text: 'Pending' },
  assigned: { color: 'dash-badge-info', text: 'Assigned' },
  picked_up: { color: 'dash-badge-info', text: 'Picked up' },
  in_transit: { color: 'dash-badge-info', text: 'In transit' },
  delivered: { color: 'dash-badge-success', text: 'Delivered' },
  completed: { color: 'dash-badge-success', text: 'Completed' },
  cancelled: { color: 'dash-badge-danger', text: 'Cancelled' },
  failed: { color: 'dash-badge-danger', text: 'Failed' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    color: '',
    text: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
  }

  return (
    <span className={cn("dash-badge", config.color, className)}>
      {config.text}
    </span>
  )
}
