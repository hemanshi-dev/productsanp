import { useEffect, useState, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchPurchases, resetPagination } from '../../store/slices/paymentHistorySlice'

const PaymentHistory = () => {
  const dispatch = useAppDispatch()
  const { purchases, loading, error } = useAppSelector((state) => state.paymentHistory)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const isFetchingRef = useRef(false)
  const hasInitialFetch = useRef(false)

  // Initial fetch on mount
  useEffect(() => {
    // Only fetch if we don't have data and haven't fetched yet
    if (!hasInitialFetch.current && purchases.length === 0 && !loading && !isFetchingRef.current) {
      hasInitialFetch.current = true
      isFetchingRef.current = true
      setCursor(null)
      setHasMore(false)
      dispatch(resetPagination())
      dispatch(fetchPurchases({ page: 1, cursor: undefined })).then((result) => {
        if (fetchPurchases.fulfilled.match(result)) {
          setCursor(result.payload.pagination.next_cursor || null)
          setHasMore(result.payload.pagination.has_more || false)
        }
      }).finally(() => {
        isFetchingRef.current = false
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  const handleLoadMore = async () => {
    if (!cursor || !hasMore || loadingMore || loading) return

    setLoadingMore(true)
    try {
      const result = await dispatch(fetchPurchases({ page: 1, cursor }))
      if (fetchPurchases.fulfilled.match(result)) {
        setCursor(result.payload.pagination.next_cursor || null)
        setHasMore(result.payload.pagination.has_more || false)
      }
    } finally {
      setLoadingMore(false)
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Payment History</h1>
        <p className="text-gray-400 text-lg">View all purchase transactions</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && purchases.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--color-primary)]/30"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[var(--color-primary)] absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-400 text-lg">Loading payment history...</p>
          </div>
        </div>
      )}

      {/* Purchases Table */}
      {purchases.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary text-white flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No Payments Yet</h3>
          <p className="text-gray-400">Payment history will appear here once transactions are made</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 border-b border-gray-700/50">
                  <tr className="border-b border-gray-700/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Base Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">GST</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Credits</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{purchase.order_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white font-medium">{purchase.user_name}</div>
                        <div className="text-xs text-gray-400">{purchase.user_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-400">{formatCurrency(purchase.amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{formatCurrency(purchase.base_amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {formatCurrency(purchase.gst_amount)} ({purchase.gst_rate}%)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[var(--color-primary)]">{purchase.credits_added.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{formatDate(purchase.completed_at || purchase.created_at)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-4 bg-primary rounded-full hover:bg-[var(--color-primary-light)] hover:text-black text-white transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)]"></div>
                    Loading...
                  </span>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PaymentHistory

