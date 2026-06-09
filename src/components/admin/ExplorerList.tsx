import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { apiService } from '../../services/api'

interface ExplorerItem {
  id: string
  title: string
  type: string
  url: string
  created_at: string
}

const ExplorerList = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<ExplorerItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [deletingItem, setDeletingItem] = useState<ExplorerItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isFetchingRef = useRef(false)
  const hasInitialFetch = useRef(false)

  // Initial fetch
  useEffect(() => {
    if (!hasInitialFetch.current && items.length === 0 && !loading) {
      hasInitialFetch.current = true
      fetchItems()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchItems = async (isLoadMore: boolean = false, cursorParam?: string | null) => {
    if (isFetchingRef.current) return

    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }

    isFetchingRef.current = true
    setError(null)

    try {
      // Use provided cursor parameter, or fall back to state cursor, or undefined
      const cursorToUse = cursorParam !== undefined 
        ? (cursorParam || undefined) 
        : (cursor || undefined)
      const response = await apiService.getExplorer(10, cursorToUse)
      
      if (response.status && response.data) {
        if (isLoadMore) {
          setItems(prev => [...prev, ...response.data!.items])
        } else {
          setItems(response.data.items)
        }
        setCursor(response.data.pagination.next_cursor || null)
        setHasMore(response.data.pagination.has_more || false)
      } else {
        const errorMsg = response.message || 'Failed to load explorer items'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error: any) {
      console.error('Error fetching explorer items:', error)
      const errorMsg = error.message || 'Failed to load explorer items'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      isFetchingRef.current = false
    }
  }

  const handleRefresh = () => {
    if (isFetchingRef.current || loading) return
    isFetchingRef.current = true
    hasInitialFetch.current = false // Reset to allow re-fetch
    setCursor(null)
    setHasMore(false)
    fetchItems(false, undefined).finally(() => {
      isFetchingRef.current = false
    })
  }

  const handleLoadMore = async () => {
    if (!cursor || !hasMore || loadingMore || loading) return

    setLoadingMore(true)
    try {
      const response = await apiService.getExplorer(50, cursor)
      if (response.status && response.data) {
        setItems(prev => [...prev, ...response.data!.items])
        setCursor(response.data.pagination.next_cursor || null)
        setHasMore(response.data.pagination.has_more || false)
      }
    } finally {
      setLoadingMore(false)
    }
  }

  const handleDeleteClick = (item: ExplorerItem) => {
    setDeletingItem(item)
  }

  const handleDeleteItem = async () => {
    if (!deletingItem) return
    
    try {
      const response = await apiService.deleteExplorer(deletingItem.id)
      if (response.status) {
        toast.success(response.message || 'Item deleted successfully')
        setDeletingItem(null)
        // Refresh the list
        hasInitialFetch.current = false
        setCursor(null)
        setHasMore(false)
        fetchItems()
      } else {
        toast.error(response.message || 'Failed to delete item')
      }
    } catch (error: any) {
      console.error('Error deleting item:', error)
      toast.error(error.message || 'Failed to delete item')
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Explorer Management</h1>
          <p className="text-gray-400 text-lg">
            {items.length > 0 ? (
              <span>Total Items: <span className="text-white font-semibold">{items.length}</span></span>
            ) : (
              'View and manage explorer items'
            )}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary)]/10 flex items-center justify-center"
            title="Refresh List"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={() => navigate('/admin/explorer/add')}
            className="px-6 py-3 bg-primary hover:bg-[var(--color-primary-light)] hover:text-black text-white rounded-full transition-all shadow-lg shadow-[var(--color-primary)]/30 text-white  flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Explorer Item
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 backdrop-blur-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Explorer Items Table */}
      <div className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 border-b border-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">Preview</th>
                <th className="px-6 py-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">Title</th>
                <th className="px-6 py-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">Type</th>
                <th className="px-6 py-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">Created</th>
                <th className="px-6 py-4 text-right text-gray-400 text-xs uppercase font-semibold tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                      <span className="ml-3 text-gray-400">Loading explorer items...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-lg font-medium">No explorer items found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-700/20 transition-all duration-200 group">
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-700/50 group-hover:border-[var(--color-primary)]/30 transition-colors">
                        {item.type === 'video' ? (
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLVideoElement
                              const hasRetried = target.dataset.retried === 'true'
                              if (!hasRetried) {
                                target.dataset.retried = 'true'
                                target.src = `${item.url}`
                              }
                            }}
                          />
                        ) : (
                          <img
                            src={item.url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading='lazy'
                            referrerPolicy="no-referrer"
                            onError={(e) => { 
                              const target = e.target as HTMLImageElement
                              const hasRetried = target.dataset.retried === 'true'
                              if (!hasRetried) {
                                target.dataset.retried = 'true'
                                target.src = `${item.url}`
                              }
                            }}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">{item.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                        item.type === 'video'
                          ? 'bg-white/10 text-white border border-white/30'
                          : 'bg-gray-700/40 text-gray-400 border border-gray-600/40'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleDeleteClick(item)}
                          className="group/btn p-2 rounded-lg bg-gradient-to-br from-red-500/10 to-[var(--color-primary)]/10 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                          title="Delete Item"
                        >
                          <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl text-white mb-2">Delete Explorer Item</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete <span className="text-white font-semibold">{deletingItem.title}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingItem(null)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-full transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExplorerList

