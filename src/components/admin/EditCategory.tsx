import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { updateCategory, fetchCategories, setCurrentCategoryFromList, resetPagination } from '../../store/slices/categoriesSlice'
import { store } from '../../store/store'
import { apiService } from '../../services/api'

interface CategoryFormData {
  title: string
  showBanner: boolean
}

interface BannerInput {
  id: string
  searchQuery: string
  selectedBanner: { id: string; title: string; image: string } | null
  searchResults: Array<{ id: string; title: string; image: string }>
  isSearching: boolean
}

interface CategoryBanner {
  id: string
  title: string
  image: string
  banner_id: string
}

const EditCategory = () => {
  const dispatch = useAppDispatch()
  const { categoryId } = useParams<{ categoryId: string }>()
  const navigate = useNavigate()
  const { currentCategory, loading, error } = useAppSelector((state) => state.categories)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [bannerInputs, setBannerInputs] = useState<BannerInput[]>([])
  const [categoryBanners, setCategoryBanners] = useState<CategoryBanner[]>([])
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<CategoryFormData>()
  const showBanner = watch('showBanner')

  useEffect(() => {
    if (categoryId) {
      // Use category from Redux state (set when clicking edit in list)
      if (!currentCategory || currentCategory.id !== categoryId) {
        const state = store.getState()
        const { categories: categoriesList, loading } = state.categories
        
        // Try to find in existing categories list first
        const categoryFromList = categoriesList.find(c => c.id === categoryId)
        if (categoryFromList) {
          dispatch(setCurrentCategoryFromList(categoryFromList))
        } else if (!loading) {
          // If not found and not loading, fetch categories list with larger limit
          // Fetch with limit 100 to ensure we get the category even if it's not on first page
          dispatch(fetchCategories({ page: 1, cursor: undefined, limit: 100 })).then((result) => {
            if (fetchCategories.fulfilled.match(result)) {
              // After fetching, try to find the category
              const updatedState = store.getState()
              const foundCategory = updatedState.categories.categories.find(c => c.id === categoryId)
              if (foundCategory) {
                dispatch(setCurrentCategoryFromList(foundCategory))
              }
            }
          })
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, dispatch])

  useEffect(() => {
    if (currentCategory) {
      setImagePreview(currentCategory.image)
      reset({
        title: currentCategory.title,
        showBanner: currentCategory.showBanner
      })
      // Fetch category banners
      const fetchCategoryBanners = async () => {
        try {
          const response = await apiService.getBannersByCategory(currentCategory.id)
          if (response.status && response.data) {
            setCategoryBanners(response.data.banners.map(banner => ({
              id: banner.id,
              title: banner.title,
              image: banner.image,
              banner_id: banner.banner_id || banner.id
            })))
          }
        } catch (error: any) {
          console.error('Failed to fetch category banners:', error)
          // Don't show error toast, just start with empty array
          setCategoryBanners([])
        }
      }
      fetchCategoryBanners()
    }
  }, [currentCategory, reset])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Handle banner search with debounce
  const handleBannerSearchDebounced = async (inputId: string, query: string) => {
    if (query.length < 3) {
      setBannerInputs(prev => prev.map(b => 
        b.id === inputId ? { ...b, searchResults: [], isSearching: false } : b
      ))
      return
    }

    setBannerInputs(prev => prev.map(b => 
      b.id === inputId ? { ...b, isSearching: true } : b
    ))

    try {
      const response = await apiService.searchBanners(query, 10)
      if (response.status && response.data) {
        setBannerInputs(prev => prev.map(b => 
          b.id === inputId 
            ? { ...b, searchResults: response.data!.banners, isSearching: false }
            : b
        ))
      }
    } catch (error: any) {
      toast.error('Failed to search banners')
      setBannerInputs(prev => prev.map(b => 
        b.id === inputId ? { ...b, isSearching: false, searchResults: [] } : b
      ))
    }
  }

  // Compress image as much as possible
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Fixed dimensions: 200x200
          const targetWidth = 200
          const targetHeight = 200
          
          // Calculate scaling to fit within 200x200 while maintaining aspect ratio
          const scale = Math.min(targetWidth / img.width, targetHeight / img.height)
          const scaledWidth = img.width * scale
          const scaledHeight = img.height * scale
          
          // Calculate position to center the image
          const x = (targetWidth - scaledWidth) / 2
          const y = (targetHeight - scaledHeight) / 2
          
          // Create canvas with fixed 200x200 dimensions
          const canvas = document.createElement('canvas')
          canvas.width = targetWidth
          canvas.height = targetHeight
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }
          
          // Draw image centered on canvas with better quality scaling
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
          
          // Convert to WebP format with 70% quality
          const outputType = 'image/webp'
          const quality = 0.7 // 70% quality
          
          // Convert to blob as WebP
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'))
                return
              }
              
              // Change file extension to .webp
              const fileName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
              
              // Create a new File object with WebP format
              const compressedFile = new File([blob], fileName, {
                type: outputType,
                lastModified: Date.now()
              })
              
              // Show compression info
              const originalSize = file.size
              const compressedSize = compressedFile.size
              const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1)
              
              // Format file sizes
              const formatFileSize = (bytes: number): string => {
                if (bytes < 1024) return bytes + ' B'
                if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
                return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
              }
              
              const originalSizeFormatted = formatFileSize(originalSize)
              const compressedSizeFormatted = formatFileSize(compressedSize)
              
              // Show toast notification
              toast.success(`Image compressed to WebP: ${originalSizeFormatted} → ${compressedSizeFormatted} (${compressionRatio}% reduction)`, {
                autoClose: 3000
              })
              
              resolve(compressedFile)
            },
            outputType,
            quality
          )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed.')
      return
    }

    try {
      // Compress the image
      const compressedFile = await compressImage(file)
      setImageFile(compressedFile)
      
      // Show preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(compressedFile)
    } catch (error: any) {
      console.error('Error compressing image:', error)
      toast.error('Failed to compress image. Using original file.')
      // Fallback to original file
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const handleAddBannerInput = () => {
    const newInput: BannerInput = {
      id: `banner-input-${Date.now()}`,
      searchQuery: '',
      selectedBanner: null,
      searchResults: [],
      isSearching: false
    }
    setBannerInputs([...bannerInputs, newInput])
  }

  const handleRemoveBannerInput = (inputId: string) => {
    setBannerInputs(bannerInputs.filter(b => b.id !== inputId))
  }

  const handleBannerSearchChange = (inputId: string, value: string) => {
    setBannerInputs(bannerInputs.map(b => 
      b.id === inputId ? { ...b, searchQuery: value, selectedBanner: null, searchResults: [] } : b
    ))

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Debounce search
    if (value.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        handleBannerSearchDebounced(inputId, value)
      }, 500)
    }
  }

  const handleSelectBanner = (inputId: string, banner: { id: string; title: string; image: string }) => {
    setBannerInputs(bannerInputs.map(b => 
      b.id === inputId ? { ...b, selectedBanner: banner, searchQuery: banner.title, searchResults: [] } : b
    ))
  }

  const handleSaveBanner = async (inputId: string) => {
    if (!currentCategory) return

    const input = bannerInputs.find(b => b.id === inputId)
    if (!input || !input.selectedBanner) {
      toast.error('Please select a banner')
      return
    }

    try {
      const response = await apiService.addBannerToCategory(currentCategory.id, input.selectedBanner.id)
      if (response.status) {
        toast.success('Banner added to category successfully')
        // Remove the input
        handleRemoveBannerInput(inputId)
        // Refresh category banners list
        const bannersResponse = await apiService.getBannersByCategory(currentCategory.id)
        if (bannersResponse.status && bannersResponse.data) {
          setCategoryBanners(bannersResponse.data.banners.map(banner => ({
            id: banner.id,
            title: banner.title,
            image: banner.image,
            banner_id: banner.banner_id || banner.id
          })))
        }
      } else {
        toast.error(response.message || 'Failed to add banner')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add banner')
    }
  }

  const handleRemoveBanner = async (bannerId: string) => {
    if (!currentCategory) return

    if (window.confirm('Are you sure you want to remove this banner from the category?')) {
      try {
        const response = await apiService.removeBannerFromCategory(currentCategory.id, bannerId)
        if (response.status) {
          toast.success('Banner removed from category successfully')
          // Refresh category banners list
          const bannersResponse = await apiService.getBannersByCategory(currentCategory.id)
          if (bannersResponse.status && bannersResponse.data) {
            setCategoryBanners(bannersResponse.data.banners.map(banner => ({
              id: banner.id,
              title: banner.title,
              image: banner.image,
              banner_id: banner.banner_id || banner.id
            })))
          }
        } else {
          toast.error(response.message || 'Failed to remove banner')
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to remove banner')
      }
    }
  }

  const onSubmit = async (data: CategoryFormData) => {
    if (!currentCategory) return

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('id', currentCategory.id)
      formData.append('title', data.title)
      formData.append('showBanner', data.showBanner.toString())
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const result = await dispatch(updateCategory(formData))
      
      if (updateCategory.fulfilled.match(result)) {
        toast.success('Category updated successfully')
        // Refresh categories list
        dispatch(resetPagination())
        dispatch(fetchCategories({ page: 1, cursor: undefined }))
        navigate('/admin/categories')
      } else {
        toast.error(result.payload as string || 'Failed to update category')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update category')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading category data...</p>
        </div>
      </div>
    )
  }

  const category = currentCategory

  if (error || !category) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-red-500/10 to-[var(--color-primary)]/10 border border-red-500/30 p-8 text-center">
        <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-400 text-lg font-semibold mb-6">{error || 'Category not found'}</p>
        <button
          onClick={() => navigate('/admin/categories')}
          className="px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary-light)] rounded-full transition-all shadow-lg shadow-[var(--color-primary)]/30"
        >
          Back to Categories
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/categories')}
          className="mb-6 px-4 py-2.5 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary)]/10 flex items-center gap-2 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Categories
        </button>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Edit Category</h1>
        <p className="text-gray-400 text-lg">Update category information</p>
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 p-6 shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('title', {
                required: 'Title is required',
                minLength: {
                  value: 2,
                  message: 'Title must be at least 2 characters'
                }
              })}
              placeholder="Enter category title"
              className={`w-full px-4 py-3 bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm border rounded-xl text-white focus:outline-none focus:ring-2 transition-all ${
                errors.title 
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-600/50 focus:border-[var(--color-primary)]/50 focus:ring-[var(--color-primary)]/20'
              }`}
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Image */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Image {imageFile && <span className="text-green-400">(New image selected)</span>}
            </label>
            <div className="space-y-4">
              <label 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600/50 rounded-xl cursor-pointer bg-gradient-to-br from-gray-700/30 to-gray-800/30 hover:border-[var(--color-primary)]/50 transition-colors"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB (optional - leave empty to keep current)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="relative w-[150px] h-[150px] rounded-xl overflow-hidden border border-gray-700/50">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Show Banner */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                {...register('showBanner')}
                className="sr-only"
              />
              <div className={`w-14 h-8 rounded-full transition-all duration-300 ${
                showBanner ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-700'
              }`}>
                <div className={`w-6 h-6 rounded-full bg-white transition-all duration-300 transform ${
                  showBanner ? 'translate-x-7' : 'translate-x-1'
                } mt-1 shadow-lg inline-block`}></div>
              </div>
              <span className="text-white font-medium text-lg">Show Category</span>
            </label>
            <p className="text-gray-400 text-sm mt-2">Display this category on the homepage</p>
          </div>

          {/* Category Banners */}
          <div className="border-t border-gray-700/50 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Category Banners</h3>
                <p className="text-gray-400 text-sm">Add banners to this category</p>
              </div>
              <button
                type="button"
                onClick={handleAddBannerInput}
                className="px-4 py-2 bg-primary hover:bg-[var(--color-primary-light)] hover:text-black text-white rounded-full transition-all shadow-lg shadow-[var(--color-primary)]/30 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Banner
              </button>
            </div>

            {/* Banner Input Fields */}
            {bannerInputs.map((input) => (
              <div key={input.id} className="mb-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <div className="flex gap-2 mb-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={input.searchQuery}
                      onChange={(e) => handleBannerSearchChange(input.id, e.target.value)}
                      placeholder="Search banners (min 3 characters)..."
                      className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]/50"
                    />
                    {/* Search Results Dropdown */}
                    {input.searchResults.length > 0 && !input.selectedBanner && (
                      <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700/50 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {input.searchResults.map((banner) => (
                          <button
                            key={banner.id}
                            type="button"
                            onClick={() => handleSelectBanner(input.id, banner)}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 transition-colors border-b border-gray-700/30 last:border-b-0"
                          >
                            {banner.image && (
                              <img src={banner.image} alt={banner.title} className="w-10 h-10 rounded-lg object-cover" />
                            )}
                            <span className="text-white text-sm">{banner.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {input.isSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--color-primary)]"></div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveBanner(input.id)}
                    disabled={!input.selectedBanner}
                    className="px-4 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary-light)] text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveBannerInput(input.id)}
                    className="px-4 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary-light)] text-white rounded-xl transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Remove
                  </button>
                </div>
                {input.selectedBanner && (
                  <div className="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                    <img src={input.selectedBanner.image} alt={input.selectedBanner.title} className="w-12 h-12 rounded-lg object-cover" />
                    <span className="text-green-400 text-sm font-medium">{input.selectedBanner.title}</span>
                  </div>
                )}
              </div>
            ))}

            {/* Existing Category Banners */}
            {categoryBanners.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-gray-400 text-sm font-medium mb-2">Current Banners:</h4>
                {categoryBanners.map((banner) => (
                  <div key={banner.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <div className="flex items-center gap-3">
                      {banner.image && (
                        <img src={banner.image} alt={banner.title} className="w-12 h-12 rounded-lg object-cover" />
                      )}
                      <span className="text-white text-sm">{banner.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveBanner(banner.id)}
                      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-lg transition-all text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/categories')}
              className="flex-1 px-6 py-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white rounded-full transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-primary hover:bg-[var(--color-primary-light)] hover:text-black text-white rounded-full transition-all shadow-lg shadow-[var(--color-primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </span>
              ) : 'Update Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCategory

