import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCategories, deleteCategory, resetPagination, setCurrentCategoryFromList } from '../../store/slices/categoriesSlice'

interface Category {
  id: string
  title: string
  image: string
  showBanner: boolean
  is_active: boolean
  index: number
  created_at: string
  updated_at: string
}

const CategoryList = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { categories, loading, error, totalCategories } = useAppSelector((state) => state.categories)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const isFetchingRef = useRef(false)
  const hasInitialFetch = useRef(false)

  // Initial fetch - only if categories list is empty and not loading
  useEffect(() => {
    if (!hasInitialFetch.current && categories.length === 0 && !loading) {
      hasInitialFetch.current = true
      setCursor(null)
      setHasMore(false)
      dispatch(fetchCategories({ page: 1, cursor: undefined })).then((result) => {
        if (fetchCategories.fulfilled.match(result)) {
          setCursor(result.payload.pagination.next_cursor || null)
          setHasMore(result.payload.pagination.has_more || false)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRefresh = () => {
    if (isFetchingRef.current || loading) return
    isFetchingRef.current = true
    hasInitialFetch.current = false // Reset to allow re-fetch
    setCursor(null)
    setHasMore(false)
    dispatch(resetPagination())
    dispatch(fetchCategories({ page: 1, cursor: undefined })).then((result) => {
      if (fetchCategories.fulfilled.match(result)) {
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
      const result = await dispatch(fetchCategories({ page: 1, cursor }))
      if (fetchCategories.fulfilled.match(result)) {
        setCursor(result.payload.pagination.next_cursor || null)
        setHasMore(result.payload.pagination.has_more || false)
      }
    } finally {
      setLoadingMore(false)
    }
  }

  const handleEditClick = (category: Category) => {
    // Set category in Redux before navigating
    dispatch(setCurrentCategoryFromList(category))
    navigate(`/admin/categories/edit/${category.id}`)
  }

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category)
  }

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return
    
    try {
      const result = await dispatch(deleteCategory(deletingCategory.id))
        if (deleteCategory.fulfilled.match(result)) {
          setDeletingCategory(null)
          toast.success('Category deleted successfully')
          // Refresh the list
          hasInitialFetch.current = false // Reset to allow re-fetch
          setCursor(null)
          setHasMore(false)
          dispatch(resetPagination())
          dispatch(fetchCategories({ page: 1, cursor: undefined })).then((result) => {
            if (fetchCategories.fulfilled.match(result)) {
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
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Category Management</h1>
          <p className="text-gray-400 text-lg">
            {totalCategories > 0 ? (
              <span>Total Categories: <span className="text-white font-semibold">{totalCategories}</span></span>
            ) : (
              'View and manage categories'
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
            onClick={() => navigate('/admin/categories/add')}
            className="px-6 py-3 bg-primary hover:bg-[var(--color-primary-light)] hover:text-black rounded-full transition-all shadow-lg shadow-[var(--color-primary)]/30 text-white font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Category
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

      {/* Categories Table */}
      <div className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 border-b border-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">Image</th>
                <th className="px-6 py-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">Title</th>
                <th className="px-6 py-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">Show Banner</th>
                <th className="px-6 py-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 text-gray-400 text-xs uppercase font-semibold tracking-wider">Created</th>
                <th className="px-6 py-4 text-right text-gray-400 text-xs uppercase font-semibold tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                      <span className="ml-3 text-gray-400">Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <p className="text-lg font-medium">No categories found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-700/20 transition-all duration-200 group">
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-700/50 group-hover:border-[var(--color-primary)]/30 transition-colors">
                        <img 
                          src={category.image} 
                          alt={category.title}
                          className="w-full h-full object-cover"
                          loading='lazy'
                          referrerPolicy="no-referrer"
                          onError={(e) => { 
                            const target = e.target as HTMLImageElement
                            const hasRetried = target.dataset.retried === 'true'
                            if (!hasRetried) {
                              target.dataset.retried = 'true'
                              target.src = `${category.image}`
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">{category.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                        category.showBanner
                          ? 'bg-gradient-to-r from-blue-500/20 to-[var(--color-primary)]/20 text-blue-300 border-blue-500/30'
                          : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {category.showBanner ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                        category.is_active
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30'
                          : 'bg-gradient-to-r from-red-500/20 to-[var(--color-primary)]/20 text-red-300 border-red-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${category.is_active ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {formatDate(category.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEditClick(category)}
                          className="p-2 bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30 hover:border-blue-400/50 text-blue-400 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                          title="Edit Category"
                        >
                          <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(category)}
                          className="group/btn p-2 rounded-lg bg-gradient-to-br from-red-500/10 to-[var(--color-primary)]/10 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                          title="Delete Category"
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
            className="px-8 py-4 bg-primary rounded-full hover:bg-[var(--color-primary-light)] hover:text-black transition-all text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <span className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)]/40"></div>
                Loading...
              </span>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl text-white mb-2">Delete Category</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete <span className="text-white font-semibold">{deletingCategory.title}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingCategory(null)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
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

export default CategoryList

