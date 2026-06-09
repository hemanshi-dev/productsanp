import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { updateBanner, fetchBanners, setCurrentBannerFromList, resetPagination } from '../../store/slices/bannersSlice'
import { store } from '../../store/store'
import { apiService } from '../../services/api'

interface BannerFormData {
  title: string
}

interface PromptInput {
  id: string
  searchQuery: string
  selectedPrompt: { id: string; title: string; image: string | null } | null
  searchResults: Array<{ id: string; title: string; image: string | null }>
  isSearching: boolean
}

interface BannerPrompt {
  id: string
  title: string
  image: string | null
  prompt_id: string
}

const EditBanner = () => {
  const dispatch = useAppDispatch()
  const { bannerId } = useParams<{ bannerId: string }>()
  const navigate = useNavigate()
  const { currentBanner, loading, error } = useAppSelector((state) => state.banners)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [promptInputs, setPromptInputs] = useState<PromptInput[]>([])
  const [bannerPrompts, setBannerPrompts] = useState<BannerPrompt[]>([])
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const promptsFetchedRef = useRef<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BannerFormData>()

  useEffect(() => {
    if (bannerId) {
      // Use banner from Redux state (set when clicking edit in list)
      if (!currentBanner || currentBanner.id !== bannerId) {
        const state = store.getState()
        const { banners: bannersList, loading } = state.banners
        
        // Try to find in existing banners list first
        const bannerFromList = bannersList.find(b => b.id === bannerId)
        if (bannerFromList) {
          dispatch(setCurrentBannerFromList(bannerFromList))
        } else if (!loading) {
          // If not found and not loading, fetch banners list with larger limit
          dispatch(fetchBanners({ page: 1, cursor: undefined, limit: 100 })).then((result) => {
            if (fetchBanners.fulfilled.match(result)) {
              // After fetching, try to find the banner
              const updatedState = store.getState()
              const foundBanner = updatedState.banners.banners.find(b => b.id === bannerId)
              if (foundBanner) {
                dispatch(setCurrentBannerFromList(foundBanner))
              }
            }
          })
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannerId, dispatch])

  useEffect(() => {
    if (currentBanner) {
      setImagePreview(currentBanner.image)
      reset({
        title: currentBanner.title,
      })
    }
  }, [currentBanner, reset])

  // Fetch banner prompts - only once per banner
  useEffect(() => {
    if (currentBanner && promptsFetchedRef.current !== currentBanner.id) {
      promptsFetchedRef.current = currentBanner.id
      // Fetch banner prompts
      const fetchBannerPrompts = async () => {
        try {
          const response = await apiService.getPromptsByBanner(currentBanner.id)
          if (response.status && response.data) {
            setBannerPrompts(response.data.prompts.map(prompt => ({
              id: prompt.id,
              title: prompt.title,
              image: prompt.image,
              prompt_id: prompt.prompt_id || prompt.id
            })))
          }
        } catch (error: any) {
          console.error('Failed to fetch banner prompts:', error)
          setBannerPrompts([])
        }
      }
      fetchBannerPrompts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBanner?.id])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Handle prompt search with debounce
  const handlePromptSearchDebounced = async (inputId: string, query: string) => {
    if (query.length < 3) {
      setPromptInputs(prev => prev.map(p => 
        p.id === inputId ? { ...p, searchResults: [], isSearching: false } : p
      ))
      return
    }

    setPromptInputs(prev => prev.map(p => 
      p.id === inputId ? { ...p, isSearching: true } : p
    ))

    try {
      const response = await apiService.searchPrompts(query, 10)
      if (response.status && response.data) {
        setPromptInputs(prev => prev.map(p => 
          p.id === inputId 
            ? { ...p, searchResults: response.data!.prompts, isSearching: false }
            : p
        ))
      }
    } catch (error: any) {
      toast.error('Failed to search prompts')
      setPromptInputs(prev => prev.map(p => 
        p.id === inputId ? { ...p, isSearching: false, searchResults: [] } : p
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
          const quality = 1 // 70% quality
          
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

  const handleAddPromptInput = () => {
    const newInput: PromptInput = {
      id: `prompt-input-${Date.now()}`,
      searchQuery: '',
      selectedPrompt: null,
      searchResults: [],
      isSearching: false
    }
    setPromptInputs([...promptInputs, newInput])
  }

  const handleRemovePromptInput = (inputId: string) => {
    setPromptInputs(promptInputs.filter(p => p.id !== inputId))
  }

  const handlePromptSearchChange = (inputId: string, value: string) => {
    setPromptInputs(promptInputs.map(p => 
      p.id === inputId ? { ...p, searchQuery: value, selectedPrompt: null, searchResults: [] } : p
    ))

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Debounce search
    if (value.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        handlePromptSearchDebounced(inputId, value)
      }, 500)
    }
  }

  const handleSelectPrompt = (inputId: string, prompt: { id: string; title: string; image: string | null }) => {
    setPromptInputs(promptInputs.map(p => 
      p.id === inputId ? { ...p, selectedPrompt: prompt, searchQuery: prompt.title, searchResults: [] } : p
    ))
  }

  const handleSavePrompt = async (inputId: string) => {
    if (!currentBanner) return

    const input = promptInputs.find(p => p.id === inputId)
    if (!input || !input.selectedPrompt) {
      toast.error('Please select a prompt')
      return
    }

    try {
      const response = await apiService.addPromptToBanner(currentBanner.id, input.selectedPrompt.id)
      if (response.status) {
        toast.success('Prompt added to banner successfully')
        // Remove the input
        handleRemovePromptInput(inputId)
        // Refresh banner prompts list
        const promptsResponse = await apiService.getPromptsByBanner(currentBanner.id)
        if (promptsResponse.status && promptsResponse.data) {
          setBannerPrompts(promptsResponse.data.prompts.map(prompt => ({
            id: prompt.id,
            title: prompt.title,
            image: prompt.image,
            prompt_id: prompt.prompt_id || prompt.id
          })))
        }
      } else {
        toast.error(response.message || 'Failed to add prompt')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add prompt')
    }
  }

  const handleRemovePrompt = async (promptId: string) => {
    if (!currentBanner) return

    if (window.confirm('Are you sure you want to remove this prompt from the banner?')) {
      try {
        const response = await apiService.removePromptFromBanner(currentBanner.id, promptId)
        if (response.status) {
          toast.success('Prompt removed from banner successfully')
          // Refresh banner prompts list
          const promptsResponse = await apiService.getPromptsByBanner(currentBanner.id)
          if (promptsResponse.status && promptsResponse.data) {
            setBannerPrompts(promptsResponse.data.prompts.map(prompt => ({
              id: prompt.id,
              title: prompt.title,
              image: prompt.image,
              prompt_id: prompt.prompt_id || prompt.id
            })))
          }
        } else {
          toast.error(response.message || 'Failed to remove prompt')
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to remove prompt')
      }
    }
  }

  const onSubmit = async (data: BannerFormData) => {
    if (!currentBanner) return

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('id', currentBanner.id)
      formData.append('title', data.title)
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const result = await dispatch(updateBanner(formData))
      
      if (updateBanner.fulfilled.match(result)) {
        toast.success('Banner updated successfully')
        // Refresh banners list
        dispatch(resetPagination())
        dispatch(fetchBanners({ page: 1, cursor: undefined, query: '' }))
        navigate('/admin/banners')
      } else {
        toast.error(result.payload as string || 'Failed to update banner')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update banner')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading banner data...</p>
        </div>
      </div>
    )
  }

  const banner = currentBanner

  if (error || !banner) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-red-500/10 to-[var(--color-primary)]/10 border border-red-500/30 p-8 text-center">
        <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-400 text-lg font-semibold mb-6">{error || 'Banner not found'}</p>
        <button
          onClick={() => navigate('/admin/banners')}
          className="px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary-light)] rounded-xl transition-all shadow-lg shadow-[var(--color-primary)]/30"
        >
          Back to Banners
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/banners')}
          className="mb-6 px-4 py-2.5 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary)]/10 flex items-center gap-2 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Banners
        </button>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Edit Banner</h1>
        <p className="text-gray-400 text-lg">Update banner information</p>
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
                  message: 'Title must be at least 2 characters',
                },
              })}
              className={`w-full px-4 py-3 bg-gray-900/50 border rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                errors.title
                  ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                  : 'border-gray-700/50 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]'
              }`}
              placeholder="Enter banner title"
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Image */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Image {!imagePreview && <span className="text-red-400">*</span>}
            </label>
            <div className="space-y-4">
              
              <label 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700/50 rounded-xl cursor-pointer bg-gray-900/30 hover:bg-gray-900/50 hover:border-[var(--color-primary)]/50 transition-all group"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-10 h-10 mb-3 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-400 group-hover:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
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
            <p className="mt-2 text-sm text-gray-500">Leave empty to keep current image, or upload a new one</p>
          </div>

          {/* Banner Prompts */}
          <div className="border-t border-gray-700/50 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Banner Prompts</h3>
                <p className="text-gray-400 text-sm">Add prompts to this banner</p>
              </div>
              <button
                type="button"
                onClick={handleAddPromptInput}
                className="px-4 py-2 bg-primary hover:bg-[var(--color-primary-light)] hover:text-black text-white rounded-full transition-all shadow-lg shadow-[var(--color-primary)]/30 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Prompt
              </button>
            </div>

            {/* Prompt Input Fields */}
            {promptInputs.map((input) => (
              <div key={input.id} className="mb-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <div className="flex gap-2 mb-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={input.searchQuery}
                      onChange={(e) => handlePromptSearchChange(input.id, e.target.value)}
                      placeholder="Search prompts (min 3 characters)..."
                      className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]/50"
                    />
                    {/* Search Results Dropdown */}
                    {input.searchResults.length > 0 && !input.selectedPrompt && (
                      <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700/50 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {input.searchResults.map((prompt) => (
                          <button
                            key={prompt.id}
                            type="button"
                            onClick={() => handleSelectPrompt(input.id, prompt)}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 transition-colors border-b border-gray-700/30 last:border-b-0"
                          >
                            {prompt.image && (
                              <img src={prompt.image} alt={prompt.title} className="w-10 h-10 rounded-lg object-cover" />
                            )}
                            <div className="flex-1 text-left">
                              <div className="text-white text-sm font-medium">{prompt.title}</div>
                              {prompt.image === null && (
                                <div className="text-gray-400 text-xs">No image</div>
                              )}
                            </div>
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
                    onClick={() => handleSavePrompt(input.id)}
                    disabled={!input.selectedPrompt}
                    className="px-4 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary-light)] text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemovePromptInput(input.id)}
                    className="px-4 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary-light)] text-white rounded-xl transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Remove
                  </button>
                </div>
                {input.selectedPrompt && (
                  <div className="mt-2 p-3 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-lg flex items-center gap-3">
                    {input.selectedPrompt.image && (
                      <img src={input.selectedPrompt.image} alt={input.selectedPrompt.title} className="w-12 h-12 rounded-lg object-cover" />
                    )}
                    <span className="text-green-400 text-sm font-medium">{input.selectedPrompt.title}</span>
                  </div>
                )}
              </div>
            ))}

            {/* Existing Banner Prompts */}
            {bannerPrompts.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-gray-400 text-sm font-medium mb-2">Current Prompts:</h4>
                {bannerPrompts.map((prompt) => (
                  <div key={prompt.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <div className="flex items-center gap-3">
                      {prompt.image && (
                        <img src={prompt.image} alt={prompt.title} className="w-12 h-12 rounded-lg object-cover" />
                      )}
                      <span className="text-white text-sm">{prompt.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePrompt(prompt.id)}
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
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/banners')}
              className="flex-1 px-6 py-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white rounded-xl transition-all duration-300 hover:shadow-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary-light)] text-white rounded-xl transition-all duration-300 shadow-lg shadow-[var(--color-primary)]/30 hover:shadow-xl hover:shadow-[var(--color-primary)]/40 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Updating...
                </span>
              ) : (
                'Update Banner'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditBanner

