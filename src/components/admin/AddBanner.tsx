import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useAppDispatch } from '../../store/hooks'
import { createBanner, fetchBanners, resetPagination } from '../../store/slices/bannersSlice'

interface BannerFormData {
  title: string
}

const AddBanner = () => {
  const navigate = useNavigate()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<BannerFormData>()

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
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const dispatch = useAppDispatch()

  const onSubmit = async (data: BannerFormData) => {
    if (!imageFile) {
      toast.error('Please select an image')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('image', imageFile)

      const result = await dispatch(createBanner(formData))
      
      if (createBanner.fulfilled.match(result)) {
        toast.success('Banner created successfully')
        // Refresh the banners list before navigating
        dispatch(resetPagination())
        dispatch(fetchBanners({ page: 1, cursor: undefined, query: '' }))
        navigate('/admin/banners')
      } else {
        toast.error(result.payload as string || 'Failed to create banner')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create banner')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/banners')}
          className="mb-6 px-4 py-2.5 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-white/15 flex items-center gap-2 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Banners
        </button>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Add New Banner</h1>
        <p className="text-gray-400 text-lg">Create a new banner</p>
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
              Image <span className="text-red-400">*</span>
            </label>
            <div className="space-y-4">
              <label 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all group"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  borderColor: isDragging ? 'rgba(168, 85, 247, 0.5)' : 'rgba(55, 65, 81, 0.5)',
                  backgroundColor: isDragging ? 'rgba(168, 85, 247, 0.2)' : 'rgba(17, 24, 39, 0.3)',
                  transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                }}
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
                  <p className={`mb-2 text-sm font-medium transition-colors ${isDragging ? 'text-primary' : 'text-gray-400'}`}>
                    {isDragging ? 'Drop image here' : <><span className="font-semibold">Click to upload</span> or drag and drop</>}
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
            {!imageFile && (
              <p className="mt-2 text-sm text-red-400">Please select an image</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/banners')}
              className="flex-1 px-6 py-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white rounded-full transition-all duration-300 hover:shadow-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !imageFile}
              className="flex-1 px-6 py-3 bg-primary  text-white rounded-full transition-all duration-300 hover:bg-[var(--color-primary-light)] hover:text-black disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </span>
              ) : (
                'Create Banner'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddBanner

