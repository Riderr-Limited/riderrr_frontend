// components/VerificationModal.jsx
import { useState } from 'react'
import { IconCheck, IconX, IconMail, IconPhone, IconRefresh } from '@tabler/icons-react'

interface VerificationModalProps {
  driverEmail: string
  driverPhone: string
  driverName: string
  onVerify: (code: string) => Promise<void>
  onResend: () => Promise<void>
  onClose: () => void
  isOpen: boolean
  isLoading: boolean
}

export default function VerificationModal({
  driverEmail,
  driverPhone,
  driverName,
  onVerify,
  onResend,
  onClose,
  isOpen,
  isLoading
}: VerificationModalProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (code.length !== 6) {
      setError('Please enter a 6-digit verification code')
      return
    }
    
    try {
      await onVerify(code)
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError('')
    try {
      await onResend()
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to resend code')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Verify Driver Account</h2>
              <p className="text-gray-600 mt-1">Complete driver registration</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-1 hover:bg-gray-100 rounded-lg"
            >
              <IconX className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              A verification code has been sent to {driverName}'s email and phone.
              Please ask the driver to check their inbox or enter the code below.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <IconMail className="w-5 h-5 text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900 font-medium">{driverEmail}</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <IconPhone className="w-5 h-5 text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-gray-900 font-medium">{driverPhone}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setCode(value)
                  setError('')
                }}
                placeholder="6-digit code"
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>

            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <IconRefresh className={`w-4 h-4 mr-2 ${resendLoading ? 'animate-spin' : ''}`} />
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </button>
              
              {resendSuccess && (
                <div className="flex items-center text-green-600 text-sm">
                  <IconCheck className="w-4 h-4 mr-1" />
                  Code resent successfully
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                Skip for Now
              </button>
              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify Account'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Note:</strong> The driver can verify their account later by checking their email.
              They won't be able to accept deliveries until their email is verified.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}