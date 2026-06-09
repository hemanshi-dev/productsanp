import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchUsers, setSearchQuery, resetPagination, setCurrentUserFromList } from '../../store/slices/usersSlice'
import type { UserListItem } from '../../services/api'

const UserList = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { users, loading, error, totalUsers, searchQuery } = useAppSelector((state) => state.users)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const isInitialMount = useRef(true)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFetchingRef = useRef(false)
  const hasInitialFetch = useRef(false)

  // Initial fetch on mount
  useEffect(() => {
    // Only fetch once on mount if we don't have data
    if (!hasInitialFetch.current && !isFetchingRef.current) {
      hasInitialFetch.current = true
      isFetchingRef.current = true
      setCursor(null)
      setHasMore(false)
      dispatch(resetPagination())
      dispatch(fetchUsers({ page: 1, cursor: undefined, query: '' })).then((result) => {
        if (fetchUsers.fulfilled.match(result)) {
          setCursor(result.payload.pagination.next_cursor || null)
          setHasMore(result.payload.pagination.has_more || false)
        }
      }).finally(() => {
        isFetchingRef.current = false
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Debounced search effect - skip on initial mount
  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Skip on initial mount to avoid duplicate calls
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Only trigger search if query is 3+ characters
    if (searchQuery.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        if (!isFetchingRef.current && !loading) {
          isFetchingRef.current = true
          setCursor(null)
          setHasMore(false)
          dispatch(resetPagination())
          dispatch(fetchUsers({ page: 1, cursor: undefined, query: searchQuery })).then((result) => {
            if (fetchUsers.fulfilled.match(result)) {
              setCursor(result.payload.pagination.next_cursor || null)
              setHasMore(result.payload.pagination.has_more || false)
            }
          }).finally(() => {
            isFetchingRef.current = false
          })
        }
      }, 500)
    } else if (searchQuery.length === 0 && !isInitialMount.current) {
      // Only refetch if user cleared search (not on initial mount)
      // But only if we don't have data - otherwise just clear search
      if (users.length === 0 && !isFetchingRef.current && !loading) {
        searchTimeoutRef.current = setTimeout(() => {
          isFetchingRef.current = true
          setCursor(null)
          setHasMore(false)
          dispatch(resetPagination())
          dispatch(fetchUsers({ page: 1, cursor: undefined, query: '' })).then((result) => {
            if (fetchUsers.fulfilled.match(result)) {
              setCursor(result.payload.pagination.next_cursor || null)
              setHasMore(result.payload.pagination.has_more || false)
            }
          }).finally(() => {
            isFetchingRef.current = false
          })
        }, 500)
      }
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
        searchTimeoutRef.current = null
      }
    }
  }, [searchQuery, dispatch])

  const handleRefresh = () => {
    if (isFetchingRef.current || loading) return
    isFetchingRef.current = true
    hasInitialFetch.current = false // Reset to allow re-fetch
    setCursor(null)
    setHasMore(false)
    dispatch(setSearchQuery(''))
    dispatch(resetPagination())
    dispatch(fetchUsers({ page: 1, cursor: undefined, query: '' })).then((result) => {
      if (fetchUsers.fulfilled.match(result)) {
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
      const result = await dispatch(fetchUsers({ page: 1, cursor, query: searchQuery }))
      if (fetchUsers.fulfilled.match(result)) {
        setCursor(result.payload.pagination.next_cursor || null)
        setHasMore(result.payload.pagination.has_more || false)
      }
    } finally {
      setLoadingMore(false)
    }
  }

  const handleEditClick = (user: UserListItem) => {
    // Set user in Redux before navigating
    dispatch(setCurrentUserFromList(user))
    navigate(`/admin/users/edit/${user.id}`)
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
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">User Management</h1>
          <p className="text-gray-400 text-lg">
            {totalUsers > 0 ? (
              <span>Total Users: <span className="text-white font-semibold">{totalUsers}</span></span>
            ) : (
              'View and manage registered users'
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
                placeholder="Search users..."
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

      {/* Users Table */}
      <div className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 border-b border-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">User</th>
                <th className="px-6 py-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">Credits</th>
                <th className="px-6 py-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">Joined</th>
                <th className="px-6 py-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-gray-400 text-xs uppercase font-semibold tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                      <span className="ml-3 text-gray-400">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-lg font-medium">{searchQuery ? 'No users found matching your search' : 'No users found'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/20 transition-all duration-200 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="relative w-12 h-12 rounded-xl bg-primary flex items-center justify-center overflow-hidden mr-4 border border-gray-700/50 group-hover:border-[var(--color-primary)]/30 transition-colors">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-semibold text-lg">
                              {user.name?.[0] || user.email[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{user.name || 'N/A'}</div>
                          <div className="text-gray-400 text-sm">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-normal bg-primary text-white border border-[var(--color-primary)]/30">
                        {user.credits ?? 0} Credits
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                          user.is_active !== false
                            ? 'bg-gradient-to-r from-green-500/20 to-[var(--color-secondary)]/20 text-green-300 border-green-500/30'
                            : 'bg-gradient-to-r from-red-500/20 to-[var(--color-primary)]/20 text-red-300 border-red-500/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          user.is_active !== false ? 'bg-green-400' : 'bg-red-400'
                        }`}></span>
                        {user.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEditClick(user)}
                          className="group/btn p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-[var(--color-secondary)]/10 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 hover:text-blue-300 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                          title="Edit User"
                        >
                          <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

    </div>
  )
}

export default UserList
