// app/company/settings/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import {
  Settings,
  Clock,
  Bell,
  Shield,
  Users,
  DollarSign,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Smartphone,
  MessageSquare,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Key,
  LogOut
} from 'lucide-react'
import { cn } from '@/libs/utils'
import { useAuth } from '@/contexts/AuthContext'

interface OperatingHours {
  start: string
  end: string
}

interface CompanySettings {
  operatingHours: OperatingHours
  autoAccept: boolean
  commissionRate: number
  notificationChannels: string[]
}

interface NotificationPreferences {
  push: boolean
  email: boolean
  sms: boolean
  newDelivery: boolean
  driverStatusChange: boolean
  paymentReceived: boolean
  documentVerification: boolean
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  sessionTimeout: number
  ipWhitelist: string[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function CompanySettingsPage() {
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security'>('general')
  
  // General Settings
  const [settings, setSettings] = useState<CompanySettings>({
    operatingHours: {
      start: '09:00',
      end: '18:00'
    },
    autoAccept: false,
    commissionRate: 15,
    notificationChannels: ['push', 'email']
  })
  
  // Notification Preferences
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    push: true,
    email: true,
    sms: false,
    newDelivery: true,
    driverStatusChange: true,
    paymentReceived: true,
    documentVerification: true
  })
  
  // Security Settings
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    ipWhitelist: []
  })
  
  // Password Change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        setError('No authentication token found')
        return
      }
      
      const response = await fetch(`${API_URL}/company/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch settings')
      }
      
      if (data.success && data.data) {
        const profileData = data.data
        
        // Update settings
        if (profileData.settings) {
          setSettings({
            operatingHours: profileData.settings.operatingHours || { start: '09:00', end: '18:00' },
            autoAccept: profileData.settings.autoAccept || false,
            commissionRate: profileData.settings.commissionRate || 15,
            notificationChannels: profileData.settings.notificationChannels || ['push', 'email']
          })
          
          // Map notification channels to preferences
          const channels = profileData.settings.notificationChannels || []
          setNotifications(prev => ({
            ...prev,
            push: channels.includes('push'),
            email: channels.includes('email'),
            sms: channels.includes('sms')
          }))
        }
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err)
      setError(err.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (user?.role === 'company_admin') {
      fetchSettings()
    } else {
      setError('Only company administrators can access settings')
      setLoading(false)
    }
  }, [user])
  
  const handleSaveGeneralSettings = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)
      
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/company/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update settings')
      }
      
      if (data.success) {
        setSuccessMessage('General settings updated successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err: any) {
      console.error('Error updating settings:', err)
      setError(err.message || 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }
  
  const handleSaveNotifications = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)
      
      // Convert notification preferences to channels array
      const channels: string[] = []
      if (notifications.push) channels.push('push')
      if (notifications.email) channels.push('email')
      if (notifications.sms) channels.push('sms')
      
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/company/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationChannels: channels
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update notification settings')
      }
      
      if (data.success) {
        setSuccessMessage('Notification settings updated successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err: any) {
      console.error('Error updating notifications:', err)
      setError(err.message || 'Failed to update notification settings')
    } finally {
      setSaving(false)
    }
  }
  
  const handleChangePassword = async () => {
    try {
      if (!passwordForm.currentPassword || !passwordForm.newPassword) {
        setError('Please fill in all password fields')
        return
      }
      
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError('New passwords do not match')
        return
      }
      
      if (passwordForm.newPassword.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
      
      setSaving(true)
      setError(null)
      setSuccessMessage(null)
      
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password')
      }
      
      if (data.success) {
        setSuccessMessage('Password changed successfully!')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err: any) {
      console.error('Error changing password:', err)
      setError(err.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }
  
  const handleLogoutAllDevices = async () => {
    if (!confirm('Are you sure you want to logout from all devices? You will need to login again.')) {
      return
    }
    
    try {
      setSaving(true)
      setError(null)
      
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/auth/login'
      }
    } catch (err: any) {
      console.error('Error logging out:', err)
      setError(err.message || 'Failed to logout')
    } finally {
      setSaving(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-green-700">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-500 hover:text-green-700"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('general')}
                className={cn(
                  "flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors",
                  activeTab === 'general'
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Settings className="h-5 w-5 mx-auto mb-1" />
                General
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={cn(
                  "flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors",
                  activeTab === 'notifications'
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Bell className="h-5 w-5 mx-auto mb-1" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={cn(
                  "flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors",
                  activeTab === 'security'
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Shield className="h-5 w-5 mx-auto mb-1" />
                Security
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Operating Hours
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={settings.operatingHours.start}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          operatingHours: { ...prev.operatingHours, start: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={settings.operatingHours.end}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          operatingHours: { ...prev.operatingHours, end: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Set your company's daily operating hours for accepting deliveries
                  </p>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-emerald-600" />
                    Commission Rate
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="range"
                        min="5"
                        max="30"
                        step="1"
                        value={settings.commissionRate}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          commissionRate: parseInt(e.target.value)
                        }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>5%</span>
                        <span>30%</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 min-w-[80px] text-center">
                      {settings.commissionRate}%
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Platform commission charged on each delivery
                  </p>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                    Delivery Management
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={settings.autoAccept}
                        onChange={(e) => setSettings(prev => ({ ...prev, autoAccept: e.target.checked }))}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <span className="text-gray-900 font-medium">Auto-accept delivery requests</span>
                        <p className="text-sm text-gray-500 mt-1">
                          Automatically assign incoming deliveries to available drivers without manual approval
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSaveGeneralSettings}
                    disabled={saving}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {saving ? 'Saving...' : 'Save General Settings'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-blue-600" />
                    Notification Channels
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <Smartphone className="h-5 w-5 ml-3 text-blue-600" />
                      <div className="ml-3">
                        <span className="text-gray-900 font-medium">Push Notifications</span>
                        <p className="text-sm text-gray-500">Receive instant notifications on your device</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <Mail className="h-5 w-5 ml-3 text-purple-600" />
                      <div className="ml-3">
                        <span className="text-gray-900 font-medium">Email Notifications</span>
                        <p className="text-sm text-gray-500">Get updates via email</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={(e) => setNotifications(prev => ({ ...prev, sms: e.target.checked }))}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <MessageSquare className="h-5 w-5 ml-3 text-emerald-600" />
                      <div className="ml-3">
                        <span className="text-gray-900 font-medium">SMS Notifications</span>
                        <p className="text-sm text-gray-500">Receive text messages for important updates</p>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={notifications.newDelivery}
                        onChange={(e) => setNotifications(prev => ({ ...prev, newDelivery: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-900">New delivery requests</span>
                    </label>
                    
                    <label className="flex items-center cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={notifications.driverStatusChange}
                        onChange={(e) => setNotifications(prev => ({ ...prev, driverStatusChange: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-900">Driver status changes</span>
                    </label>
                    
                    <label className="flex items-center cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={notifications.paymentReceived}
                        onChange={(e) => setNotifications(prev => ({ ...prev, paymentReceived: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-900">Payment received</span>
                    </label>
                    
                    <label className="flex items-center cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={notifications.documentVerification}
                        onChange={(e) => setNotifications(prev => ({ ...prev, documentVerification: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-900">Document verification updates</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {saving ? 'Saving...' : 'Save Notification Settings'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Key className="h-5 w-5 mr-2 text-red-600" />
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleChangePassword}
                      disabled={saving}
                      className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <Lock className="h-5 w-5 mr-2" />
                      {saving ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-600" />
                    Security Options
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-yellow-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Two-factor authentication is currently under development. It will be available soon to add an extra layer of security to your account.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Session Timeout</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Automatically log out after {security.sessionTimeout} minutes of inactivity
                          </p>
                        </div>
                        <select
                          value={security.sessionTimeout}
                          onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center text-red-600">
                    <LogOut className="h-5 w-5 mr-2" />
                    Session Management
                  </h3>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-900 mb-2">Logout from all devices</h4>
                    <p className="text-sm text-red-700 mb-4">
                      This will log you out from all devices where you're currently signed in. You'll need to login again on each device.
                    </p>
                    <button
                      onClick={handleLogoutAllDevices}
                      disabled={saving}
                      className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      {saving ? 'Logging out...' : 'Logout All Devices'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-start">
              <Globe className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Business Hours</h3>
                <p className="text-sm text-blue-700">
                  Your operating hours determine when you can accept new delivery requests. Make sure they align with your driver availability.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-xl border border-purple-200 p-6">
            <div className="flex items-start">
              <Bell className="h-6 w-6 text-purple-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">Stay Informed</h3>
                <p className="text-sm text-purple-700">
                  Enable notifications to stay updated about new deliveries, driver activities, and important account events in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}