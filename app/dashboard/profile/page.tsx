// app/company/profile/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Shield,
  Banknote,
  Clock,
  Edit2,
  Save,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Package,
  DollarSign,
  FileText,
  Settings,
  CreditCard,
  Bell,
  Lock,
  RefreshCw,
  Download,
  X
} from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'
import { cn } from '@/libs/utils'
import { useAuth, useCompany } from '@/contexts/AuthContext'

interface BankDetails {
  accountName: string
  accountNumber: string
  bankName: string
  verified: boolean
}

interface Settings {
  operatingHours: {
    start: string
    end: string
  }
  autoAccept: boolean
  commissionRate: number
  notificationChannels: string[]
}

interface Stats {
  totalDrivers: number
  onlineDrivers: number
  totalDeliveries: number
  totalEarnings: number
}

interface OnboardingDoc {
  name: string
  url: string
  type?: string
  verified: boolean
  uploadedAt: string
}

interface CompanyProfile {
  _id: string
  name: string
  businessLicense: string
  taxId: string
  address: string
  city: string
  state: string
  lga: string
  contactPhone: string
  contactEmail: string
  status: string
  rejectionReason?: string
  isActive: boolean
  registrationDate: string
  slug: string
  settings: Settings
  bankDetails: BankDetails
  stats: Stats
  onboardingDocs: OnboardingDoc[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function CompanyProfilePage() {
  const { user } = useAuth()
  
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    city: '',
    state: '',
    lga: '',
    businessLicense: '',
    taxId: '',
  })
  
  const [settings, setSettings] = useState<Settings>({
    operatingHours: {
      start: '09:00',
      end: '18:00'
    },
    autoAccept: false,
    commissionRate: 15,
    notificationChannels: ['push', 'email']
  })
  
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountName: '',
    accountNumber: '',
    bankName: '',
    verified: false
  })
  
  const fetchProfile = async () => {
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
        throw new Error(data.message || 'Failed to fetch profile')
      }
      
      if (data.success && data.data) {
        const profileData = data.data
        setProfile(profileData)
        
        // Update form data
        setFormData({
          name: profileData.name || '',
          contactPhone: profileData.contactPhone || '',
          contactEmail: profileData.contactEmail || '',
          address: profileData.address || '',
          city: profileData.city || '',
          state: profileData.state || '',
          lga: profileData.lga || '',
          businessLicense: profileData.businessLicense || '',
          taxId: profileData.taxId || '',
        })
        
        // Update settings
        if (profileData.settings) {
          setSettings({
            operatingHours: profileData.settings.operatingHours || { start: '09:00', end: '18:00' },
            autoAccept: profileData.settings.autoAccept || false,
            commissionRate: profileData.settings.commissionRate || 15,
            notificationChannels: profileData.settings.notificationChannels || ['push', 'email']
          })
        }
        
        // Update bank details
        if (profileData.bankDetails) {
          setBankDetails({
            accountName: profileData.bankDetails.accountName || '',
            accountNumber: profileData.bankDetails.accountNumber || '',
            bankName: profileData.bankDetails.bankName || '',
            verified: profileData.bankDetails.verified || false
          })
        }
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err)
      setError(err.message || 'Failed to load company profile')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (user?.role === 'company_admin') {
      fetchProfile()
    } else {
      setError('Only company administrators can access this page')
      setLoading(false)
    }
  }, [user])
  
  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)
      
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/company/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile')
      }
      
      if (data.success) {
        await fetchProfile()
        setEditing(false)
        setSuccessMessage('Profile updated successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err: any) {
      console.error('Error updating profile:', err)
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }
  
  const handleSaveSettings = async () => {
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
        await fetchProfile()
        setSuccessMessage('Settings updated successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err: any) {
      console.error('Error updating settings:', err)
      setError(err.message || 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }
  
  const handleSaveBankDetails = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)
      
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/company/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bankDetails })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update bank details')
      }
      
      if (data.success) {
        await fetchProfile()
        setSuccessMessage('Bank details updated successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err: any) {
      console.error('Error updating bank details:', err)
      setError(err.message || 'Failed to update bank details')
    } finally {
      setSaving(false)
    }
  }
  
  const handleFileUpload = async (file: File, type: string) => {
    try {
      setUploading(true)
      setError(null)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/company/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload document')
      }
      
      if (data.success) {
        await fetchProfile()
        setSuccessMessage('Document uploaded successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err: any) {
      console.error('Error uploading document:', err)
      setError(err.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-96 bg-gray-200 rounded-xl"></div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 rounded-xl"></div>
                <div className="h-48 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Company Profile Found</h2>
            <p className="text-gray-600 mb-4">{error || 'Please contact support to set up your company profile.'}</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Company Profile</h1>
              <p className="text-gray-600 mt-2">Manage your company information and settings</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchProfile}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
              </button>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(false)
                      fetchProfile()
                    }}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Company Info & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-blue-600" />
                    Company Information
                  </h2>
                  <StatusBadge status={profile.status} />
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business License
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.businessLicense}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessLicense: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile.businessLicense}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax ID
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.taxId}
                        onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile.taxId}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Date
                    </label>
                    <div className="flex items-center text-gray-900">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(profile.registrationDate)}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="flex items-start text-gray-900">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <span>{profile.address}, {profile.city}, {profile.state}</span>
                      </div>
                    )}
                  </div>
                  
                  {editing && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="flex items-center text-gray-900">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {profile.contactPhone}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    {editing ? (
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="flex items-center text-gray-900">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {profile.contactEmail}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Business Settings Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-purple-600" />
                  Business Settings
                </h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Operating Hours
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={settings.operatingHours.start}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            operatingHours: { ...prev.operatingHours, start: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">End Time</label>
                        <input
                          type="time"
                          value={settings.operatingHours.end}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            operatingHours: { ...prev.operatingHours, end: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Commission Rate
                    </label>
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
                      </div>
                      <div className="text-lg font-bold text-blue-600 min-w-[60px]">
                        {settings.commissionRate}%
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Notification Preferences
                    </label>
                    <div className="space-y-2">
                      {['push', 'email', 'sms'].map((channel) => (
                        <label key={channel} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notificationChannels.includes(channel)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSettings(prev => ({
                                  ...prev,
                                  notificationChannels: [...prev.notificationChannels, channel]
                                }))
                              } else {
                                setSettings(prev => ({
                                  ...prev,
                                  notificationChannels: prev.notificationChannels.filter(c => c !== channel)
                                }))
                              }
                            }}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-gray-700 capitalize">{channel} notifications</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoAccept}
                          onChange={(e) => setSettings(prev => ({ ...prev, autoAccept: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">Auto-accept delivery requests</span>
                      </label>
                      <p className="text-sm text-gray-500 ml-6 mt-1">
                        Automatically assign incoming deliveries to available drivers
                      </p>
                    </div>
                    <button
                      onClick={handleSaveSettings}
                      disabled={saving}
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bank Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-emerald-600" />
                    Bank Details
                  </h2>
                  <div className="flex items-center">
                    {bankDetails.verified ? (
                      <span className="flex items-center text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center text-sm text-yellow-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Pending Verification
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={bankDetails.accountName}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, accountName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter account name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter account number"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter bank name"
                    />
                  </div>
                  
                  {bankDetails.verified && (
                    <div className="md:col-span-2 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center text-green-700">
                        <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Bank account verified successfully</p>
                          <p className="text-sm mt-1">Your bank details have been verified and are ready for payouts.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="md:col-span-2">
                    <button
                      onClick={handleSaveBankDetails}
                      disabled={saving}
                      className="w-full flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      <Banknote className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Update Bank Details'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Stats & Documents */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Business Overview</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Total Drivers</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{profile.stats.totalDrivers}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {profile.stats.onlineDrivers} currently online
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-purple-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Total Deliveries</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{profile.stats.totalDeliveries}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Lifetime completed deliveries
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-emerald-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Total Earnings</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">
                        {formatCurrency(profile.stats.totalEarnings)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Lifetime revenue generated
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Banknote className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Commission Rate</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">
                        {settings.commissionRate}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Platform commission fee
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Documents Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-gray-600" />
                    Documents
                  </h2>
                  <span className="text-sm text-gray-500">
                    {profile.onboardingDocs?.length || 0} files
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {!profile.onboardingDocs || profile.onboardingDocs.length === 0 ? (
                    <div className="text-center py-4">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No documents uploaded yet</p>
                    </div>
                  ) : (
                    profile.onboardingDocs.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center flex-1 min-w-0">
                          <FileText className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          {doc.verified ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block mb-3">
                      <div className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        {uploading ? (
                          <>
                            <RefreshCw className="h-5 w-5 mr-2 text-blue-600 animate-spin" />
                            <span className="text-sm text-blue-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-600">Upload new document</span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload(file, 'business_document')
                          }
                        }}
                        disabled={uploading}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="text-xs text-gray-500 text-center">
                      Upload business registration, license, or other documents (PDF, JPG, PNG)
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status & Verification */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Account Status
                </h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Company Status</span>
                    <StatusBadge status={profile.status} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Account Active</span>
                    {profile.isActive ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bank Verified</span>
                    {bankDetails.verified ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Documents Verified</span>
                    {profile.onboardingDocs?.length > 0 && profile.onboardingDocs.every(doc => doc.verified) ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  
                  {profile.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-700">Rejection Reason</p>
                          <p className="text-sm text-red-600 mt-1">{profile.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
                  <Download className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Export Documents</span>
                </button>
                <button className="w-full flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
                  <Bell className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Notification Settings</span>
                </button>
                <button className="w-full flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
                  <Lock className="h-5 w-5 text-emerald-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Security Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}