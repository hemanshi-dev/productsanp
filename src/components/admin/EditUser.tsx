import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCreditHistory, updateUserStatus, updateUserCredits } from '../../store/slices/usersSlice'
import { store } from '../../store/store'

interface CreditsFormData {
  creditsChange: string
  reason: string
}

interface StatusFormData {
  reason: string
}

const EditUser = () => {
  const dispatch = useAppDispatch()
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { currentUser, loading, error, creditHistoryLoading } = useAppSelector((state) => state.users)
  
  // Form state
  const [isActive, setIsActive] = useState(true)
  const [updating, setUpdating] = useState(false)
  const creditHistoryFetchedRef = useRef(false)
  
  // React Hook Form for credits update
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CreditsFormData>()
  
  // React Hook Form for status update
  const { register: registerStatus, handleSubmit: handleSubmitStatus, formState: { errors: statusErrors, isSubmitting: isSubmittingStatus }, reset: resetStatus } = useForm<StatusFormData>()

  useEffect(() => {
    if (userId && currentUser && currentUser.id === userId) {
      // Only fetch credit history once if it doesn't exist
      if (!creditHistoryFetchedRef.current && !currentUser.creditHistory && !creditHistoryLoading) {
        creditHistoryFetchedRef.current = true
        dispatch(fetchCreditHistory(userId))
      }
    } else if (userId && !currentUser) {
      // User not loaded yet, try to find in list
      const state = store.getState()
      const { users: usersList } = state.users
      const userFromList = usersList.find(u => u.id === userId)
      if (!userFromList) {
        console.warn('User not found in Redux state. Please navigate from user list.')
      }
    }
  }, [userId, currentUser, creditHistoryLoading, dispatch])

  useEffect(() => {
    if (currentUser) {
      setIsActive(currentUser.is_active !== false)
    }
  }, [currentUser])

  const handleUpdateStatus = async (data: StatusFormData) => {
    if (!currentUser) return
    
    setUpdating(true)
    try {
      const result = await dispatch(updateUserStatus({
        userId: currentUser.id,
        isActive,
        reason: data.reason
      }))
      
      if (updateUserStatus.fulfilled.match(result)) {
        resetStatus()
        toast.success('User status updated successfully')
        // Redux slice already updates the user in the list, no need to fetch
      } else {
        toast.error(result.payload as string || 'Update failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateCredits = async (data: CreditsFormData) => {
    if (!currentUser) return
    
    const change = parseInt(data.creditsChange)
    
    setUpdating(true)
    try {
      const result = await dispatch(updateUserCredits({
        userId: currentUser.id,
        creditsChange: change,
        reason: data.reason
      }))
      
      if (updateUserCredits.fulfilled.match(result)) {
        toast.success('Credits updated successfully')
        reset()
        // Refresh credit history after credits update
        if (!creditHistoryLoading) {
          dispatch(fetchCreditHistory(currentUser.id))
        }
      } else {
        toast.error(result.payload as string || 'Update failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  const user = currentUser
  const creditHistory = currentUser?.creditHistory || []
  const currentCredits = currentUser?.currentCredits || 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
              <p className="text-gray-400">Loading user data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-red-500/10 to-[var(--color-primary)]/10 border border-red-500/30 p-8 text-center">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 text-lg font-semibold mb-6">{error || 'User not found'}</p>
            <button
              onClick={() => navigate('/admin/users')}
              className="px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary-light)] rounded-full transition-all shadow-lg shadow-[var(--color-primary)]/30"
            >
              Back to User List
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/users')}
          className="mb-6 px-4 py-2.5 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary)]/10 flex items-center gap-2 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to User List
        </button>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Edit User</h1>
        <p className="text-gray-400 text-lg">Manage user details, status, and credits</p>
      </div>

        {/* User Information */}
        <div className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 p-6 mb-6 shadow-xl">
          <div className="flex items-center mb-6">
            <span className="w-1 h-6 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary)] rounded-full mr-3"></span>
            <h2 className="text-2xl font-bold text-white">User Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-gray-700/20 border border-gray-700/50">
              <label className="text-gray-400 text-sm font-medium block mb-2">Name</label>
              <p className="text-white text-lg font-semibold">{user.name || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-700/20 border border-gray-700/50">
              <label className="text-gray-400 text-sm font-medium block mb-2">Email</label>
              <p className="text-white text-lg font-semibold">{user.email}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-700/20 border border-gray-700/50">
              <label className="text-gray-400 text-sm font-medium block mb-2">User ID</label>
              <p className="text-white text-sm font-mono break-all">{user.id}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/20 border border-[var(--color-primary)]/30">
              <label className="text-gray-400 text-sm font-medium block mb-2">Current Credits</label>
              <p className="text-white text-2xl font-bold">{currentCredits}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-700/20 border border-gray-700/50">
              <label className="text-gray-400 text-sm font-medium block mb-2">Created At</label>
              <p className="text-white text-lg">
                {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-700/20 border border-gray-700/50">
              <label className="text-gray-400 text-sm font-medium block mb-2">Status</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
                user.is_active 
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30'
                  : 'bg-gradient-to-r from-red-500/20 to-[var(--color-primary)]/20 text-red-300 border-red-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${user.is_active ? 'bg-green-400' : 'bg-red-400'}`}></span>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Update Status Form */}
        <div className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 p-6 mb-6 shadow-xl">
          <div className="flex items-center mb-6">
            <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-[var(--color-primary)] rounded-full mr-3"></span>
            <h2 className="text-2xl font-bold text-white">Update User Status</h2>
          </div>
          <form onSubmit={handleSubmitStatus(handleUpdateStatus)} className="space-y-6">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-14 h-8 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-700'
                  }`}>
                    <div className={`w-6 h-6 rounded-full bg-white transition-all duration-300 transform ${
                      isActive ? 'translate-x-7' : 'translate-x-1'
                    } mt-1 shadow-lg inline-block`}></div>
                  </div>
                </div>
                <span className="text-white font-medium text-lg">Active</span>
              </label>
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Reason <span className="text-gray-500">(required for status change)</span>
              </label>
              <input
                type="text"
                {...registerStatus('reason', {
                  required: 'Reason is required',
                  minLength: {
                    value: 3,
                    message: 'Reason must be at least 3 characters'
                  }
                })}
                placeholder="e.g., Violation of terms"
                className={`w-full px-4 py-3 bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm border rounded-full text-white focus:outline-none focus:ring-2 transition-all ${
                  statusErrors.reason 
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-600/50 focus:border-[var(--color-primary)]/50 focus:ring-[var(--color-primary)]/20'
                }`}
              />
              {statusErrors.reason && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {statusErrors.reason.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={updating || isSubmittingStatus}
              className="px-6 py-3 bg-primary hover:bg-[var(--color-primary-light)] hover:text-black text-white rounded-full transition-all shadow-lg shadow-[var(--color-primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {updating || isSubmittingStatus ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </span>
              ) : 'Update Status'}
            </button>
          </form>
        </div>

        {/* Update Credits Form */}
        <div className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 p-6 mb-6 shadow-xl">
          <div className="flex items-center mb-6">
            <span className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-3"></span>
            <h2 className="text-2xl font-bold text-white">Add/Remove Credits</h2>
          </div>
          <form onSubmit={handleSubmit(handleUpdateCredits)} className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Credits Change <span className="text-gray-500">(positive to add, negative to remove)</span>
              </label>
              <input
                type="number"
                {...register('creditsChange', {
                  required: 'Credits change is required',
                  validate: (value) => {
                    const num = parseInt(value)
                    if (isNaN(num)) return 'Please enter a valid number'
                    if (num === 0) return 'Credits change cannot be zero'
                    return true
                  }
                })}
                placeholder="e.g., 100 or -50"
                className={`w-full px-4 py-3 bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm border rounded-full text-white focus:outline-none focus:ring-2 transition-all ${
                  errors.creditsChange 
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-600/50 focus:border-[var(--color-primary)]/50 focus:ring-[var(--color-primary)]/20'
                }`}
              />
              {errors.creditsChange && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.creditsChange.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Reason</label>
              <input
                type="text"
                {...register('reason', {
                  required: 'Reason is required',
                  minLength: {
                    value: 3,
                    message: 'Reason must be at least 3 characters'
                  }
                })}
                placeholder="e.g., Bonus credits"
                className={`w-full px-4 py-3 bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm border rounded-full text-white focus:outline-none focus:ring-2 transition-all ${
                  errors.reason 
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-600/50 focus:border-[var(--color-primary)]/50 focus:ring-[var(--color-primary)]/20'
                }`}
              />
              {errors.reason && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.reason.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting || updating}
              className="px-6 py-3 bg-primary hover:bg-[var(--color-primary-light)] hover:text-black text-white rounded-full transition-all shadow-lg shadow-[var(--color-primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {updating || isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </span>
              ) : 'Update Credits'}
            </button>
          </form>
        </div>

        {/* Credit History Table */}
        <div className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 p-6 shadow-xl">
          <div className="flex items-center mb-6">
            <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full mr-3"></span>
            <h2 className="text-2xl font-bold text-white">Credit History</h2>
          </div>
          {creditHistoryLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
              <p className="text-gray-400">Loading history...</p>
            </div>
          ) : creditHistory.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-400 text-lg">No credit history found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700/50">
                    <th className="text-left py-4 px-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">Date</th>
                    <th className="text-left py-4 px-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">Change</th>
                    <th className="text-left py-4 px-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">Previous</th>
                    <th className="text-left py-4 px-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">New</th>
                    <th className="text-left py-4 px-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">Reason</th>
                    <th className="text-left py-4 px-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">Action By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {creditHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-700/20 transition-all duration-200">
                      <td className="py-4 px-4 text-gray-400 text-sm">
                        {new Date(item.timestamp).toLocaleString()}
                      </td>
                      <td className={`py-4 px-4 font-semibold ${
                        item.change > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.change > 0 
                            ? 'bg-green-500/20 border border-green-500/30' 
                            : 'bg-red-500/20 border border-red-500/30'
                        }`}>
                          {item.change > 0 ? '+' : ''}{item.change}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-400">{item.previous}</td>
                      <td className="py-4 px-4 font-semibold text-white">{item.new}</td>
                      <td className="py-4 px-4 text-gray-400">{item.reason}</td>
                      <td className="py-4 px-4 text-gray-400">{item.action_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  )
}

export default EditUser

