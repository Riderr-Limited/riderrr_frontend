'use client'

import { useEffect, useState } from 'react'
import { 
  IconMapPin, 
  IconClock, 
  IconEye,
  IconX,
  IconPackage,
  IconUser,
  IconPhone,
  IconCash,
  IconTruck,
  IconRefresh,
  IconSearch,
  IconFilter
} from '@tabler/icons-react'
import { API_CONFIG } from "../../lib/config"
import { ApiClient } from "../../lib/api-client"
import MapModal from "@/components/MapModal"


interface Delivery {
  _id: string
  referenceId: string
  customerName: string
  customerPhone: string
  recipientName: string
  recipientPhone: string
  pickup: {
    address: string
    lat: number
    lng: number
    name: string
    phone: string
  }
  dropoff: {
    address: string
    lat: number
    lng: number
    name: string
    phone: string
  }
  itemDetails: {
    type: string
    description?: string
    weight: number
    value: number
  }
  fare: {
    baseFare?: number
    distanceFare?: number
    totalFare?: number
    currency: string
  }
  estimatedDistanceKm: number
  estimatedDurationMin: number
  payment: {
    method: string
    status: string
  }
  status: string
  createdAt: string
  updatedAt: string
  assignedAt?: string
  pickedUpAt?: string
  deliveredAt?: string
  driver?: {
    _id: string
    name: string
    phone: string
    vehicle: {
      type: string
      make: string
      model: string
      plateNumber: string
    }
  }
  customer: {
    _id: string
    name: string
    phone: string
    email: string
  }
  company: {
    _id: string
    name: string
    contactPhone: string
    address: string
  }
  statusDisplay: string
}

interface Stats {
  totalDeliveries: number
  totalDelivered: number
  totalInProgress: number
  totalPending: number
  totalCancelled: number
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [allStats, setAllStats] = useState<Stats>({
    totalDeliveries: 0,
    totalDelivered: 0,
    totalInProgress: 0,
    totalPending: 0,
    totalCancelled: 0
  })
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  })
  const [mapModal, setMapModal] = useState<{
    isOpen: boolean;
    lat: number;
    lng: number;
    title: string;
    address?: string;
  }>({ isOpen: false, lat: 0, lng: 0, title: '' })

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      
      // Using centralized config
      const url = ApiClient.buildUrl(API_CONFIG.ENDPOINTS.DELIVERIES.COMPANY_DELIVERIES) + '?page=1&limit=1000';
      
      const data = await ApiClient.get(url);
      
      if (data.success) {
        const allDeliveries = data.data
        setAllStats({
          totalDeliveries: data.pagination?.total || 0,
          totalDelivered: allDeliveries.filter((d: Delivery) => d.status === 'delivered').length,
          totalInProgress: allDeliveries.filter((d: Delivery) => 
            ['assigned', 'picked_up', 'in_transit'].includes(d.status)
          ).length,
          totalPending: allDeliveries.filter((d: Delivery) => d.status === 'pending').length,
          totalCancelled: allDeliveries.filter((d: Delivery) => d.status === 'cancelled').length
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchDeliveries = async (page = 1) => {
    try {
      setLoading(true)
      
      // Using centralized config
      const url = ApiClient.buildUrl(API_CONFIG.ENDPOINTS.DELIVERIES.COMPANY_DELIVERIES) + `?page=${page}&limit=10`;
      
      const data = await ApiClient.get(url);
      
      if (data.success) {
        setDeliveries(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchDeliveries()
    
    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement('script')
      script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places'
      script.async = true
      document.head.appendChild(script)
    }
  }, [])

  const handleViewDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedDelivery(null)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-purple-100 text-purple-800',
      in_transit: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800'
    }
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || delivery.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const openMapModal = (lat: number, lng: number, title: string, address?: string) => {
    setMapModal({ isOpen: true, lat, lng, title, address })
  }

  const closeMapModal = () => {
    setMapModal({ isOpen: false, lat: 0, lng: 0, title: '' })
  }

  const refreshAll = () => {
    fetchStats()
    fetchDeliveries(pagination.page)
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, customer, or recipient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <IconFilter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <button
            onClick={refreshAll}
            disabled={loading || statsLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <IconRefresh className={`h-5 w-5 ${(loading || statsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Summary - Total Across All Pages */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Deliveries</p>
            {statsLoading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mx-auto mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-gray-900">{allStats.totalDeliveries}</p>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Delivered</p>
            {statsLoading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mx-auto mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-green-600">{allStats.totalDelivered}</p>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">In Progress</p>
            {statsLoading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mx-auto mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-blue-600">{allStats.totalInProgress}</p>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Pending</p>
            {statsLoading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mx-auto mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-yellow-600">{allStats.totalPending}</p>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Cancelled</p>
            {statsLoading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mx-auto mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-red-600">{allStats.totalCancelled}</p>
            )}
          </div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px]">
                  Reference ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">
                  Pickup Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">
                  Dropoff Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[110px]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    {Array.from({ length: 8 }).map((_, colIdx) => (
                      <td key={colIdx} className="px-4 py-4">
                        <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <IconPackage className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No deliveries found</p>
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 break-words">
                        {delivery.referenceId}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 truncate">{delivery.customerName}</div>
                      <div className="text-xs text-gray-500 truncate">{delivery.customerPhone}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-2">
                        <IconMapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-gray-900 truncate">{delivery.pickup.name}</div>
                          <button
                            onClick={() => openMapModal(delivery.pickup.lat, delivery.pickup.lng, 'Pickup Location', delivery.pickup.address)}
                            className="text-xs text-blue-600 hover:text-blue-800 underline whitespace-nowrap"
                          >
                            View on map
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-2">
                        <IconMapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-gray-900 truncate">{delivery.recipientName}</div>
                          <button
                            onClick={() => openMapModal(delivery.dropoff.lat, delivery.dropoff.lng, 'Dropoff Location', delivery.dropoff.address)}
                            className="text-xs text-green-600 hover:text-green-800 underline whitespace-nowrap"
                          >
                            View on map
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {delivery.fare.currency} {delivery.fare.totalFare?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-gray-500">{delivery.payment.method}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(delivery.status)}`}>
                        {delivery.statusDisplay}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(delivery.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleViewDelivery(delivery)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <IconEye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} total deliveries)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchDeliveries(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                Page {pagination.page}
              </div>
              <button
                onClick={() => fetchDeliveries(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delivery Details</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedDelivery.referenceId}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IconX className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg ${getStatusColor(selectedDelivery.status)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Status: {selectedDelivery.statusDisplay}</p>
                    <p className="text-sm mt-1">Payment: {selectedDelivery.payment.status}</p>
                  </div>
                  <IconTruck className="h-8 w-8" />
                </div>
              </div>

              {/* Customer & Recipient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IconUser className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Customer</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Name:</span> {selectedDelivery.customerName}</p>
                    <p className="text-sm"><span className="font-medium">Phone:</span> {selectedDelivery.customerPhone}</p>
                    <p className="text-sm"><span className="font-medium">Email:</span> {selectedDelivery.customer.email}</p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-2">
                  <div className="flex items-center gap-2 mb-3">
                    <IconUser className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Recipient</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Name:</span> {selectedDelivery.recipientName}</p>
                    <p className="text-sm"><span className="font-medium">Phone:</span> {selectedDelivery.recipientPhone}</p>
                  </div>
                </div>
              </div>

              {/* Pickup & Dropoff Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IconMapPin className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Pickup Location</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Contact:</span> {selectedDelivery.pickup.name}</p>
                    <p className="text-sm"><span className="font-medium">Phone:</span> {selectedDelivery.pickup.phone}</p>
                    <p className="text-sm"><span className="font-medium">Address:</span> {selectedDelivery.pickup.address}</p>
                    <button
                      onClick={() => openMapModal(selectedDelivery.pickup.lat, selectedDelivery.pickup.lng, 'Pickup Location', selectedDelivery.pickup.address)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    >
                      <IconMapPin className="h-4 w-4" />
                      View on Map
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IconMapPin className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Dropoff Location</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Contact:</span> {selectedDelivery.dropoff.name}</p>
                    <p className="text-sm"><span className="font-medium">Phone:</span> {selectedDelivery.dropoff.phone}</p>
                    <p className="text-sm"><span className="font-medium">Address:</span> {selectedDelivery.dropoff.address}</p>
                    <button
                      onClick={() => openMapModal(selectedDelivery.dropoff.lat, selectedDelivery.dropoff.lng, 'Dropoff Location', selectedDelivery.dropoff.address)}
                      className="mt-2 text-sm text-green-600 hover:text-green-800 underline flex items-center gap-1"
                    >
                      <IconMapPin className="h-4 w-4" />
                      View on Map
                    </button>
                  </div>
                </div>
              </div>

              {/* Item & Fare Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IconPackage className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Item Details</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Type:</span> {selectedDelivery.itemDetails.type}</p>
                    {selectedDelivery.itemDetails.description && (
                      <p className="text-sm"><span className="font-medium">Description:</span> {selectedDelivery.itemDetails.description}</p>
                    )}
                    <p className="text-sm"><span className="font-medium">Weight:</span> {selectedDelivery.itemDetails.weight} kg</p>
                    <p className="text-sm"><span className="font-medium">Distance:</span> {selectedDelivery.estimatedDistanceKm.toFixed(2)} km</p>
                    <p className="text-sm"><span className="font-medium">Est. Duration:</span> {selectedDelivery.estimatedDurationMin} mins</p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IconCash className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Fare Details</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Base Fare:</span> {selectedDelivery.fare.currency} {selectedDelivery.fare.baseFare?.toLocaleString() || '0'}</p>
                    <p className="text-sm"><span className="font-medium">Distance Fare:</span> {selectedDelivery.fare.currency} {selectedDelivery.fare.distanceFare?.toFixed(2) || '0'}</p>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <p className="text-sm font-bold"><span className="font-bold">Total Fare:</span> {selectedDelivery.fare.currency} {selectedDelivery.fare.totalFare?.toLocaleString() || '0'}</p>
                    </div>
                    <p className="text-sm"><span className="font-medium">Payment Method:</span> {selectedDelivery.payment.method}</p>
                    <p className="text-sm"><span className="font-medium">Payment Status:</span> {selectedDelivery.payment.status}</p>
                  </div>
                </div>
              </div>

              {/* Driver Info (if assigned) */}
              {selectedDelivery.driver && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IconTruck className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">Driver Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm"><span className="font-medium">Name:</span> {selectedDelivery.driver.name}</p>
                      <p className="text-sm"><span className="font-medium">Phone:</span> {selectedDelivery.driver.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm"><span className="font-medium">Vehicle:</span> {selectedDelivery.driver.vehicle.make} {selectedDelivery.driver.vehicle.model}</p>
                      <p className="text-sm"><span className="font-medium">Plate:</span> {selectedDelivery.driver.vehicle.plateNumber}</p>
                      <p className="text-sm"><span className="font-medium">Type:</span> {selectedDelivery.driver.vehicle.type}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <IconClock className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-gray-900">Timeline</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5"></div>
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-xs text-gray-500">{formatDate(selectedDelivery.createdAt)}</p>
                    </div>
                  </div>
                  {selectedDelivery.assignedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5"></div>
                      <div>
                        <p className="text-sm font-medium">Assigned</p>
                        <p className="text-xs text-gray-500">{formatDate(selectedDelivery.assignedAt)}</p>
                      </div>
                    </div>
                  )}
                  {selectedDelivery.pickedUpAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5"></div>
                      <div>
                        <p className="text-sm font-medium">Picked Up</p>
                        <p className="text-xs text-gray-500">{formatDate(selectedDelivery.pickedUpAt)}</p>
                      </div>
                    </div>
                  )}
                  {selectedDelivery.deliveredAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-600 mt-1.5"></div>
                      <div>
                        <p className="text-sm font-medium">Delivered</p>
                        <p className="text-xs text-gray-500">{formatDate(selectedDelivery.deliveredAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      <MapModal
        isOpen={mapModal.isOpen}
        onClose={closeMapModal}
        lat={mapModal.lat}
        lng={mapModal.lng}
        title={mapModal.title}
        address={mapModal.address}
      />
    </div>
  )
}