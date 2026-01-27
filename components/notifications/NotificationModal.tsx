'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  IconBell, 
  IconCheck, 
  IconClock, 
  IconAlertCircle,
  IconPackage,
  IconUser,
  IconCash,
  IconX,
  IconTrash,
  IconChecklist,
  IconExternalLink
} from '@tabler/icons-react'
//import { formatDistanceToNow } from 'date-fns'

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  subType?: string
  read: boolean
  createdAt: string
  data?: any
  priority?: string
  actionUrl?: string
  actionLabel?: string
}

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const [unreadCount, setUnreadCount] = useState(0)
  const modalRef = useRef<HTMLDivElement>(null)

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      
      const url = activeTab === 'unread' 
        ? 'http://localhost:5000/api/notifications?unreadOnly=true'
        : 'http://localhost:5000/api/notifications'
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNotifications(data.data || [])
          setUnreadCount(data.pagination?.unreadCount || 0)
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, activeTab])

  const getNotificationIcon = (type: string) => {
    const iconProps = { className: "h-5 w-5 text-gray-500" }
    
    switch (type) {
      case 'order':
        return <IconPackage {...iconProps} />
      case 'payment':
        return <IconCash {...iconProps} />
      case 'user':
        return <IconUser {...iconProps} />
      case 'alert':
        return <IconAlertCircle {...iconProps} />
      case 'task':
        return <IconChecklist {...iconProps} />
      case 'success':
        return <IconCheck {...iconProps} className="h-5 w-5 text-green-500" />
      case 'pending':
        return <IconClock {...iconProps} className="h-5 w-5 text-yellow-500" />
      default:
        return <IconBell {...iconProps} />
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('access_token')
      await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token')
      await fetch('http://localhost:5000/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // ... rest of your functions (deleteNotification, etc.) ...

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Position the modal as a dropdown from the bell icon */}
      <div className="absolute top-16 right-4 md:right-6">
        <div 
          ref={modalRef}
          className="w-80 md:w-96 bg-white rounded-xl shadow-lg border border-gray-200 ring-1 ring-black ring-opacity-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div className="flex items-center space-x-2">
              <IconBell className="h-5 w-5 text-gray-700" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                <p className="text-xs text-gray-500">
                  {activeTab === 'all' ? 'All' : 'Unread'}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-3 py-2 text-xs font-medium ${
                  activeTab === 'all'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`flex-1 px-3 py-2 text-xs font-medium ${
                  activeTab === 'unread'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <IconBell className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                         { /**<span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span> */}
                          <div className="flex items-center space-x-1">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 px-3 py-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => window.location.href = '/notifications'}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  View all
                </button>
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Mark all read
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}