'use client'

import { useAuth } from '@/contexts/AuthContext'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import LoadingScreen from '@/components/LoadingScreen'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Redirect if user role doesn't have access to dashboard
  useEffect(() => {
    if (user && !isLoading) {
      const allowedRoles = ['admin', 'company_admin', 'driver']
      if (!allowedRoles.includes(user.role)) {
        router.push('/unauthorized')
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      {/* Add overflow-hidden to prevent horizontal scroll on the entire page */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Dynamic Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {getPageTitle(pathname)}
            </h1>
            <p className="text-gray-600 mt-1">
              {getPageDescription(pathname, user?.name)}
            </p>
          </div>
          {/* Add min-width: 0 to prevent children from overflowing */}
          <div className="min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

// Helper function to get page title based on route
function getPageTitle(pathname: string): string {
  const routes: Record<string, string> = {
    '/dashboard': 'Dashboard Overview',
    '/dashboard/dashboard': 'Dashboard Overview',
    '/dashboard/overview': 'Dashboard Overview',
    '/dashboard/riders': ' ',
    '/dashboard/deliveries': 'Deliveries Tracking',
     '/dashboard/profile': 'My Profile',
    '/dashboard/settings': 'Settings',
    '/company/profile': 'Company Profile',
  }
  return routes[pathname] || ''
}

// Helper function to get page description
function getPageDescription(pathname: string, userName?: string): string {
  const descriptions: Record<string, string> = {
    '/dashboard': `Welcome back, ${userName || 'User'}! Here's what's happening today.`,
    '/dashboard/dashboard': `Welcome back, ${userName || 'User'}! Here's what's happening today.`,
    '/dashboard/overview': `Welcome back, ${userName || 'User'}! Here's what's happening today.`,
    '/dashboard/riders': ' ',
    '/dashboard/deliveries': 'Track all deliveries in real-time, assign riders, and monitor progress.',
     '/dashboard/profile': 'Manage your personal information and account settings.',
    '/dashboard/settings': 'Configure your account preferences and notification settings.',
    '/company/profile': 'Manage your company information, settings, and documents.',
  }
  return descriptions[pathname] || ''
}