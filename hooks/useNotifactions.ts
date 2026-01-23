'use client'

import { useState, useEffect, useCallback } from 'react'

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return
      
      setIsLoading(true)
      const response = await fetch('http://localhost:5000/api/notifications/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUnreadCount(data.data.count)
        }
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUnreadCount()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  return {
    unreadCount,
    isLoading,
    refreshCount: fetchUnreadCount
  }
}