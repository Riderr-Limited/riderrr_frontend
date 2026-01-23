export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-blue-200 rounded-full"></div>
          <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your workspace</p>
      </div>
    </div>
  )
}