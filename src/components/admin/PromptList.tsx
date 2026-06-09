import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchPrompts, deletePrompt, setSearchQuery, resetPagination, setCurrentPromptFromList } from '../../store/slices/promptsSlice'

interface Prompt {
  id: string
  title: string
  image: string | null
  prompt?: string // Legacy format
  prompts?: string[] // New format - array of prompts
  visible: boolean
  created_at: string
  updated_at: string
}

const PromptList = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { prompts, loading, error, totalPrompts, searchQuery } = useAppSelector((state) => state.prompts)
  const [deletingPrompt, setDeletingPrompt] = useState<Prompt | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const isFetchingRef = useRef(false)
  const isInitialMount = useRef(true)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasInitialFetch = useRef(false)

  // Initial fetch on mount
  useEffect(() => {
    // Only fetch if we don't have data and haven't fetched yet
    if (!hasInitialFetch.current && prompts.length === 0 && !loading && !isFetchingRef.current) {
      hasInitialFetch.current = true
      isFetchingRef.current = true
      setCursor(null)
      setHasMore(false)
      dispatch(resetPagination())
      dispatch(fetchPrompts({ page: 1, cursor: undefined, query: '' })).then((result) => {
        if (fetchPrompts.fulfilled.match(result)) {
          setCursor(result.payload.pagination.next_cursor || null)
          setHasMore(result.payload.pagination.has_more || false)
        }
      }).finally(() => {
        isFetchingRef.current = false
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  // Debounced search effect - skip on initial mount
  useEffect(() => {
    // Skip on initial mount to avoid duplicate calls
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = null
    }

    // Only trigger search if query is 3+ characters
    if (searchQuery.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        if (!isFetchingRef.current) {
          isFetchingRef.current = true
          setCursor(null)
          setHasMore(false)
          dispatch(resetPagination())
          dispatch(fetchPrompts({ page: 1, cursor: undefined, query: searchQuery })).then((result) => {
            if (fetchPrompts.fulfilled.match(result)) {
              setCursor(result.payload.pagination.next_cursor || null)
              setHasMore(result.payload.pagination.has_more || false)
            }
          }).finally(() => {
            isFetchingRef.current = false
          })
        }
      }, 500)
    } else if (searchQuery.length === 0) {
      // When search is cleared, fetch all prompts
      searchTimeoutRef.current = setTimeout(() => {
        if (!isFetchingRef.current) {
          isFetchingRef.current = true
          setCursor(null)
          setHasMore(false)
          dispatch(resetPagination())
          dispatch(fetchPrompts({ page: 1, cursor: undefined, query: '' })).then((result) => {
            if (fetchPrompts.fulfilled.match(result)) {
              setCursor(result.payload.pagination.next_cursor || null)
              setHasMore(result.payload.pagination.has_more || false)
            }
          }).finally(() => {
            isFetchingRef.current = false
          })
        }
      }, 500)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
        searchTimeoutRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, dispatch])

  const handleRefresh = () => {
    if (isFetchingRef.current || loading) return
    isFetchingRef.current = true
    hasInitialFetch.current = false // Reset to allow re-fetch
    setCursor(null)
    setHasMore(false)
    dispatch(setSearchQuery(''))
    dispatch(resetPagination())
    dispatch(fetchPrompts({ page: 1, cursor: undefined, query: '' })).then((result) => {
      if (fetchPrompts.fulfilled.match(result)) {
        setCursor(result.payload.pagination.next_cursor || null)
        setHasMore(result.payload.pagination.has_more || false)
      }
    }).finally(() => {
      isFetchingRef.current = false
    })
  }

  const handleLoadMore = async () => {
    if (!cursor || !hasMore || loadingMore || loading) return

    setLoadingMore(true)
    try {
      const result = await dispatch(fetchPrompts({ page: 1, cursor, query: searchQuery }))
      if (fetchPrompts.fulfilled.match(result)) {
        setCursor(result.payload.pagination.next_cursor || null)
        setHasMore(result.payload.pagination.has_more || false)
      }
    } finally {
      setLoadingMore(false)
    }
  }

  const handleEditClick = (prompt: Prompt) => {
    // Set prompt in Redux before navigating
    dispatch(setCurrentPromptFromList(prompt))
    navigate(`/admin/prompts/edit/${prompt.id}`)
  }

  const handleDeleteClick = (prompt: Prompt) => {
    setDeletingPrompt(prompt)
  }

  const handleDeletePrompt = async () => {
    if (!deletingPrompt) return
    
    try {
      const result = await dispatch(deletePrompt(deletingPrompt.id))
      if (deletePrompt.fulfilled.match(result)) {
        setDeletingPrompt(null)
        toast.success('Prompt deleted successfully')
        // Refresh the list
        hasInitialFetch.current = false // Reset to allow re-fetch
        setCursor(null)
        setHasMore(false)
        dispatch(resetPagination())
        dispatch(fetchPrompts({ page: 1, cursor: undefined, query: searchQuery })).then((result) => {
          if (fetchPrompts.fulfilled.match(result)) {
            setCursor(result.payload.pagination.next_cursor || null)
            setHasMore(result.payload.pagination.has_more || false)
          }
        })
      } else {
        toast.error(result.payload as string || 'Delete failed')
      }
    } catch (error) {
      console.error(error)
      toast.error('Delete failed')
    }
  }


  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Prompts</h1>
          <p className="text-gray-400 text-lg">
            {totalPrompts > 0 ? (
              <span>Total Prompts: <span className="text-white font-semibold">{totalPrompts}</span></span>
            ) : (
              'Manage your prompts'
            )}
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <form onSubmit={(e) => e.preventDefault()} className="relative flex-1 md:w-80">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                placeholder="Search prompts..."
                className="w-full bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>
          
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
            onClick={() => navigate('/admin/prompts/add')}
            className="px-6 py-3 bg-primary hover:bg-[var(--color-primary-light)] hover:text-black text-white rounded-full transition-all duration-300 shadow-lg shadow-[var(--color-primary)]/30 hover:shadow-xl hover:shadow-[var(--color-primary)]/40 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Prompt
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && prompts.length === 0 && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading prompts...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-2xl bg-gradient-to-br from-red-500/10 to-[var(--color-primary)]/10 border border-red-500/30 p-8 text-center">
          <p className="text-red-400 text-lg font-semibold">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Prompts Table */}
      {!loading && prompts.length > 0 && (
        <>
          <div className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 border-b border-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Prompts Count</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Visible</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {prompts.map((prompt) => (
                  <tr key={prompt.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-700/30">
                        {prompt.image ? (
                          <img
                            src={prompt.image}
                            alt={prompt.title}
                            className="w-full h-full object-cover"
                            loading='lazy'
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              const hasRetried = target.dataset.retried === 'true'
                              if (!hasRetried) {
                                target.dataset.retried = 'true'
                                target.src = `${prompt.image}`
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{prompt.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/30">
                          {prompt.prompts?.length || (prompt.prompt ? 1 : 0)} prompt{(prompt.prompts?.length || (prompt.prompt ? 1 : 0)) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        prompt.visible
                          ? 'bg-gradient-to-r from-green-500/20 to-[var(--color-secondary)]/20 text-green-300 border border-green-500/30'
                          : 'bg-gradient-to-r from-red-500/20 to-[var(--color-primary)]/20 text-red-300 border border-red-500/30'
                      }`}>
                        {prompt.visible ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-400 text-sm">
                        {new Date(prompt.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(prompt)}
                          className="p-2 bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30 hover:border-blue-400/50 text-blue-400 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(prompt)}
                          className="group/btn p-2 rounded-lg bg-gradient-to-br from-red-500/10 to-[var(--color-primary)]/10 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                          title="Delete Prompt"
                        >
                          <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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

      {/* Empty State */}
      {!loading && prompts.length === 0 && !error && (
        <div className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 p-12 text-center">
          <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="text-gray-400 text-lg mb-6">{searchQuery ? 'No prompts found matching your search' : 'No prompts found'}</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl text-white mb-2">Delete Prompt</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete <span className="text-white font-semibold">{deletingPrompt.title}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingPrompt(null)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePrompt}
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

export default PromptList

