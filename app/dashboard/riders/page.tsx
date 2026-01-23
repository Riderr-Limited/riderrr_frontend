'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { IconPlus, IconUser, IconPhone, IconCar, IconCheck, IconX, IconEye, IconRefresh, IconPackage, IconCash, IconMapPin, IconId, IconCalendar, IconCarCrash, IconMail } from '@tabler/icons-react'
import { formatDate } from '@/libs/utils'

interface Driver {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
    phone: string
    fullName: string
    avatarUrl?: string
  }
  licenseNumber: string
  licenseExpiry: string
  vehicleType: 'car' | 'bike' | 'truck'
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehicleColor: string
  plateNumber: string
  isAvailable: boolean
  isOnline: boolean
  isActive: boolean
  isVerified: boolean
  currentStatus: 'online' | 'offline' | 'busy'
  approvalStatus: 'pending' | 'approved' | 'rejected'
  stats: {
    totalDeliveries: number
    totalEarnings: number
    acceptanceRate: number
  }
  rating: {
    average: number
    totalRatings: number
  }
  lastOnlineAt: string
  createdAt: string
  location?: {
    coordinates: [number, number]
    lastUpdated: string
  }
  bankDetails?: {
    verified: boolean
  }
}

interface AddDriverFormData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  licenseNumber: string
  licenseExpiry: string
  vehicleType: 'car' | 'bike' | 'truck'
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehicleColor: string
  plateNumber: string
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

// Toast Component
const Toast = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, 5000)

    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const bgColor = {
    success: 'bg-green-100 border-green-300 text-green-800',
    error: 'bg-red-100 border-red-300 text-red-800',
    info: 'bg-blue-100 border-blue-300 text-blue-800',
    warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  }[toast.type]

  const icon = {
    success: <IconCheck className="w-5 h-5 text-green-600" />,
    error: <IconX className="w-5 h-5 text-red-600" />,
    info: <IconMail className="w-5 h-5 text-blue-600" />,
    warning: <IconX className="w-5 h-5 text-yellow-600" />,
  }[toast.type]

  return (
    <div className={`flex items-center p-4 mb-2 rounded-lg border ${bgColor} shadow-lg animate-slideIn`}>
      <div className="mr-3">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-4 text-gray-500 hover:text-gray-700"
      >
        <IconX className="w-4 h-4" />
      </button>
    </div>
  )
}

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] max-w-md w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

// Add CSS animation
const addToastStyles = () => {
  if (typeof document === 'undefined') return
  if (document.getElementById('toast-styles')) return

  const style = document.createElement('style')
  style.id = 'toast-styles'
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slideIn {
      animation: slideIn 0.3s ease-out;
    }
  `
  document.head.appendChild(style)
}

export default function RidersPage() {
  const { user } = useAuth()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [verificationData, setVerificationData] = useState<{
    email: string
    name: string
    driverId?: string
  } | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationError, setVerificationError] = useState('')
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const [formData, setFormData] = useState<AddDriverFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    licenseExpiry: '',
    vehicleType: 'car',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: new Date().getFullYear(),
    vehicleColor: '',
    plateNumber: ''
  })

  // Add toast styles on mount
  useEffect(() => {
    addToastStyles()
  }, [])

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:5000/api/company/drivers', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setDrivers(data.data || [])
        }
      }
    } catch (error) {
      showToast('Failed to load riders', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match')
      showToast('Passwords do not match', 'error')
      return
    }
    
    // Validate password strength
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      showToast('Password must be at least 6 characters', 'error')
      return
    }

    setPasswordError('')
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('access_token')
      
      const userResponse = await fetch('http://localhost:5000/api/auth/signup-company-driver', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'driver',
          licenseNumber: formData.licenseNumber,
          licenseExpiry: formData.licenseExpiry,
          vehicleType: formData.vehicleType,
          vehicleMake: formData.vehicleMake,
          vehicleModel: formData.vehicleModel,
          vehicleYear: formData.vehicleYear,
          vehicleColor: formData.vehicleColor,
          plateNumber: formData.plateNumber
        })
      })

      const result = await userResponse.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to create driver account')
      }

      // Set verification data and show verification modal
      setVerificationData({
        email: formData.email,
        name: formData.name,
        driverId: result.data?.user?._id
      })

      // Reset form and close add modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        licenseNumber: '',
        licenseExpiry: '',
        vehicleType: 'car',
        vehicleMake: '',
        vehicleModel: '',
        vehicleYear: new Date().getFullYear(),
        vehicleColor: '',
        plateNumber: ''
      })
      
      setShowAddModal(false)
      setShowVerificationModal(true)
      
      showToast('Driver account created! Please verify their email.', 'success')
      
    } catch (error: any) {
      showToast(error.message || 'Failed to add driver. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyEmail = async () => {
    if (!verificationData || !verificationCode) {
      setVerificationError('Please enter the verification code')
      showToast('Please enter the verification code', 'error')
      return
    }

    if (verificationCode.length !== 6) {
      setVerificationError('Verification code must be 6 digits')
      showToast('Verification code must be 6 digits', 'error')
      return
    }

    setVerificationError('')
    setVerificationLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: verificationData.email,
          token: verificationCode
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Verification failed')
      }

      setVerificationSuccess(true)
      showToast('Email verified successfully! Driver can now log in.', 'success')
      
      // Show success message
      setTimeout(() => {
        setShowVerificationModal(false)
        setVerificationCode('')
        setVerificationData(null)
        setVerificationSuccess(false)
        
        // Refresh drivers list
        fetchDrivers()
      }, 2000)

    } catch (error: any) {
      showToast(error.message || 'Failed to verify email', 'error')
      setVerificationError(error.message || 'Failed to verify email')
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!verificationData) return

    setResendLoading(true)
    setVerificationError('')

    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: verificationData.email
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to resend verification code')
      }

      showToast('Verification code has been resent to the driver\'s email!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to resend verification code', 'error')
      setVerificationError(error.message || 'Failed to resend code')
    } finally {
      setResendLoading(false)
    }
  }

  const handleVerifyLater = () => {
    setShowVerificationModal(false)
    setVerificationCode('')
    setVerificationData(null)
    setVerificationError('')
    
    // Refresh drivers list
    fetchDrivers()
    
    showToast('Driver added successfully! They can verify their email later.', 'info')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'vehicleYear' ? parseInt(value) : value
    }))
    
    // Clear password error when user types
    if (name.includes('password')) {
      setPasswordError('')
    }
  }

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setVerificationCode(value)
    if (verificationError) setVerificationError('')
  }

  const handleViewProfile = (driver: Driver) => {
    setSelectedDriver(driver)
    setShowProfileModal(true)
  }

  // Filter drivers based on search and status
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.userId.phone.includes(searchTerm) ||
                         driver.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'online' && driver.isOnline) ||
                         (statusFilter === 'offline' && !driver.isOnline)
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (driver: Driver) => {
    if (!driver.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <IconX className="w-3 h-3 mr-1" />
          Inactive
        </span>
      )
    }
    
    if (driver.isOnline) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <IconCheck className="w-3 h-3 mr-1" />
          Online
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Offline
      </span>
    )
  }

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approved</span>
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
    }
  }

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({
      ...prev,
      password: password,
      confirmPassword: password
    }))
    setPasswordError('')
    showToast('Strong password generated', 'info')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading riders...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Riders Management</h1>
            <p className="text-gray-600 mt-1">Manage your drivers and their details</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                fetchDrivers()
                showToast('Refreshing drivers list...', 'info')
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <IconRefresh className="w-4 h-4 mr-2" />
              Refresh
            </button>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <IconPlus className="w-4 h-4 mr-2" />
              Add Rider
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, phone, or plate number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <IconUser className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <IconUser className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Riders</p>
                <p className="text-2xl font-bold text-gray-900">{drivers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <IconCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Online Now</p>
                <p className="text-2xl font-bold text-gray-900">
                  {drivers.filter(d => d.isOnline && d.isActive).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <IconCar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {drivers.filter(d => d.isActive).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg">
                <IconPackage className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {drivers.reduce((sum, driver) => sum + (driver.stats?.totalDeliveries || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Drivers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approval
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <IconUser className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No riders found</p>
                      {searchTerm && (
                        <p className="text-sm text-gray-400 mt-1">
                          Try changing your search criteria
                        </p>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => (
                    <tr key={driver._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-gray-900">
                          {driver._id.substring(driver._id.length - 8)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold">
                              {driver.userId.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {driver.userId.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {driver.userId.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <IconPhone className="w-4 h-4 mr-2 text-gray-400" />
                          {driver.userId.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{driver.vehicleMake} {driver.vehicleModel}</div>
                          <div className="text-xs text-gray-500">{driver.plateNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(driver)}
                      </td>
                      <td className="px-6 py-4">
                        {getApprovalStatusBadge(driver.approvalStatus)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewProfile(driver)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <IconEye className="w-4 h-4 mr-1" />
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Driver Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50">
            {/* No overlay/backdrop - just the modal positioned absolutely */}
            <div className="absolute inset-0">
              <div className="relative w-full h-full">
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Add New Rider</h2>
                      <button
                        onClick={() => setShowAddModal(false)}
                        className="text-gray-400 hover:text-gray-500 p-1 hover:bg-gray-100 rounded-lg"
                      >
                        <IconX className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleAddDriver}>
                      <div className="space-y-6">
                        {/* Personal Information */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="John Doe"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="john@example.com"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="+2348012345678"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Password *
                                </label>
                                <button
                                  type="button"
                                  onClick={generateRandomPassword}
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  Generate Strong Password
                                </button>
                              </div>
                              <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter password"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password *
                              </label>
                              <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Confirm password"
                              />
                              {passwordError && (
                                <p className="text-red-600 text-sm mt-1">{passwordError}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* License Information */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">License Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                License Number *
                              </label>
                              <input
                                type="text"
                                name="licenseNumber"
                                value={formData.licenseNumber}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="DL-123456"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                License Expiry *
                              </label>
                              <input
                                type="date"
                                name="licenseExpiry"
                                value={formData.licenseExpiry}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Vehicle Information */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vehicle Type *
                              </label>
                              <select
                                name="vehicleType"
                                value={formData.vehicleType}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="car">Car</option>
                                <option value="bike">Motorcycle</option>
                                <option value="truck">Truck</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vehicle Make *
                              </label>
                              <input
                                type="text"
                                name="vehicleMake"
                                value={formData.vehicleMake}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Toyota"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vehicle Model *
                              </label>
                              <input
                                type="text"
                                name="vehicleModel"
                                value={formData.vehicleModel}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Corolla"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vehicle Year *
                              </label>
                              <input
                                type="number"
                                name="vehicleYear"
                                value={formData.vehicleYear}
                                onChange={handleInputChange}
                                required
                                min="2000"
                                max={new Date().getFullYear() + 1}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="2024"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vehicle Color *
                              </label>
                              <input
                                type="text"
                                name="vehicleColor"
                                value={formData.vehicleColor}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="White"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Plate Number *
                              </label>
                              <input
                                type="text"
                                name="plateNumber"
                                value={formData.plateNumber}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="ABC123XY"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> After creating the account, you'll need to verify the driver's email address.
                            A verification code will be sent to their email.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setShowAddModal(false)}
                          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Adding...' : 'Add Rider'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Verification Modal */}
        {showVerificationModal && verificationData && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0">
              <div className="relative w-full h-full">
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Verify Driver Email</h2>
                      <button
                        onClick={() => setShowVerificationModal(false)}
                        className="text-gray-400 hover:text-gray-500 p-1 hover:bg-gray-100 rounded-lg"
                      >
                        <IconX className="w-6 h-6" />
                      </button>
                    </div>

                    {verificationSuccess ? (
                      <div className="text-center py-8">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                          <IconCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Email Verified!</h3>
                        <p className="text-gray-600">Driver's email has been verified successfully.</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-center mb-6">
                          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                            <IconMail className="h-8 w-8 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Check Driver's Email</h3>
                          <p className="text-gray-600">
                            A 6-digit verification code has been sent to:
                          </p>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {verificationData.email}
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Enter Verification Code
                            </label>
                            <input
                              type="text"
                              value={verificationCode}
                              onChange={handleVerificationCodeChange}
                              placeholder="000000"
                              maxLength={6}
                              className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {verificationError && (
                              <p className="text-red-600 text-sm mt-2">{verificationError}</p>
                            )}
                          </div>

                          <div className="text-sm text-gray-500 space-y-2">
                            <p>• Code expires in 10 minutes</p>
                            <p>• Check spam folder if not received</p>
                            <p>• Driver needs this verification to log in</p>
                          </div>

                          <div className="flex flex-col gap-3 pt-4">
                            <button
                              onClick={handleVerifyEmail}
                              disabled={verificationLoading || verificationCode.length !== 6}
                              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {verificationLoading ? 'Verifying...' : 'Verify Email'}
                            </button>
                            
                            <button
                              onClick={handleResendVerification}
                              disabled={resendLoading}
                              className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                              {resendLoading ? 'Sending...' : 'Resend Code'}
                            </button>
                            
                            <button
                              onClick={handleVerifyLater}
                              className="w-full py-2.5 text-gray-600 hover:text-gray-800"
                            >
                              Verify Later
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Profile Modal */}
        {showProfileModal && selectedDriver && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Driver Profile</h2>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="text-gray-400 hover:text-gray-500 p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <IconX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-start space-x-4">
                    <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-2xl font-bold">
                        {selectedDriver.userId.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{selectedDriver.userId.name}</h3>
                      <p className="text-gray-600">{selectedDriver.userId.email}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {getStatusBadge(selectedDriver)}
                        {getApprovalStatusBadge(selectedDriver.approvalStatus)}
                        {selectedDriver.isVerified && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <IconPackage className="w-5 h-5 text-gray-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Deliveries</p>
                          <p className="text-lg font-bold text-gray-900">
                            {selectedDriver.stats?.totalDeliveries || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <IconCash className="w-5 h-5 text-gray-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Earnings</p>
                          <p className="text-lg font-bold text-gray-900">
                            ₦{(selectedDriver.stats?.totalEarnings || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <IconUser className="w-5 h-5 text-gray-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Rating</p>
                          <p className="text-lg font-bold text-gray-900">
                            {selectedDriver.rating?.average || 0}/5
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <IconCalendar className="w-5 h-5 text-gray-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Acceptance</p>
                          <p className="text-lg font-bold text-gray-900">
                            {selectedDriver.stats?.acceptanceRate || 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">Contact Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <IconPhone className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="text-gray-900">{selectedDriver.userId.phone}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <IconId className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">License Number</p>
                            <p className="text-gray-900">{selectedDriver.licenseNumber}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <IconCalendar className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">License Expiry</p>
                            <p className="text-gray-900">{formatDate(selectedDriver.licenseExpiry)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Information */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">Vehicle Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <IconCar className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">Vehicle</p>
                            <p className="text-gray-900">
                              {selectedDriver.vehicleMake} {selectedDriver.vehicleModel} ({selectedDriver.vehicleYear})
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <IconCarCrash className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">Plate Number</p>
                            <p className="text-gray-900">{selectedDriver.plateNumber}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-5 h-5 mr-3 flex items-center justify-center">
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: selectedDriver.vehicleColor.toLowerCase() }}
                            />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Color</p>
                            <p className="text-gray-900 capitalize">{selectedDriver.vehicleColor}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <IconMapPin className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">Last Online</p>
                            <p className="text-gray-900">{formatDate(selectedDriver.lastOnlineAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  {selectedDriver.bankDetails && (
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h4>
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                        selectedDriver.bankDetails.verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedDriver.bankDetails.verified ? 'Verified' : 'Not Verified'}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowProfileModal(false)}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        showToast('Edit functionality coming soon!', 'info')
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}