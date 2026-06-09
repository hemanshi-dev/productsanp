import { useEffect, useRef } from 'react'

interface ProtectedRouteProps {
  isAuthenticated: boolean
  children: React.ReactNode
  onLoginRequired?: () => void
}

interface ProtectedRouteProps {
  isAuthenticated: boolean
  children: React.ReactNode
  onLoginRequired?: () => void
  authChecked?: boolean
}

const ProtectedRoute = ({ isAuthenticated, children, onLoginRequired, authChecked = true }: ProtectedRouteProps) => {
  const hasTriggeredModalRef = useRef(false)

  useEffect(() => {
    // Only trigger modal once when user is not authenticated and auth has been checked
    // Reset the ref when user becomes authenticated
    if (isAuthenticated) {
      hasTriggeredModalRef.current = false
    } else if (authChecked && !isAuthenticated && !hasTriggeredModalRef.current && onLoginRequired) {
      // Trigger login modal only once when accessing protected route without auth
      hasTriggeredModalRef.current = true
      onLoginRequired()
    }
  }, [isAuthenticated, onLoginRequired, authChecked])

  // Wait for auth check to complete before redirecting
  if (!authChecked) {
    // Show loading state while checking auth
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Stay on the same route and let the parent show the auth modal.
    // We render a simple blocked state instead of navigating away.
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-2xl font-semibold mb-2">Login required</p>
          <p className="text-sm text-gray-600">
            Please log in to access this page.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute

