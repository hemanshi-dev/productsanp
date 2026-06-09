import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAppDispatch } from '../../store/hooks'
import { createFace, fetchFaces, resetPagination } from '../../store/slices/facesSlice'

const AddFace = () => {
  const navigate = useNavigate()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [type, setType] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  
  const dispatch = useAppDispatch()

  // Compress image (without resizing)
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Use original dimensions
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }
          
          // Draw image on canvas
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0)
          
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) {
      toast.error('Please select an image')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      if (type) {
        formData.append('type', type)
      }

      const result = await dispatch(createFace(formData))
      
      if (createFace.fulfilled.match(result)) {
        toast.success('Face model created successfully')
        // Refresh the faces list before navigating
        
        dispatch(resetPagination())
        dispatch(fetchFaces({ page: 1, cursor: undefined }))
        navigate('/admin/faces')
      } else {
        toast.error(result.payload as string || 'Failed to create face model')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create face model')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/faces')}
          className="mb-6 px-4 py-2.5 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-white/15 flex items-center gap-2 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Models
        </button>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Add New Model</h1>
        <p className="text-gray-400 text-lg">Upload a new face model image</p>
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 p-6 shadow-xl">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Image */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Image <span className="text-red-400">*</span>
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
            {!imageFile && (
              <p className="mt-2 text-sm text-red-400">Please select an image</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-3">
              Type <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Men', 'Women', 'Kid'].map((option) => (
                <label
                  key={option}
                  className={`flex items-center justify-center px-4 py-3 rounded-full border-2 cursor-pointer transition-all ${
                    type === option
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                      : 'border-gray-700/50 bg-gray-900/30 text-gray-400 hover:border-gray-600/50 hover:bg-gray-900/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={option}
                    checked={type === option}
                    onChange={(e) => setType(e.target.value)}
                    className="sr-only"
                  />
                  <span className="font-medium">{option}</span>
                </label>
              ))}
            </div>
            {!type && (
              <p className="mt-2 text-sm text-red-400">Please select a type</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/faces')}
              className="flex-1 px-6 py-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white rounded-full transition-all duration-300 hover:shadow-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !imageFile || !type}
              className="flex-1 px-6 py-3 bg-primary  text-white rounded-full transition-all duration-300 hover:bg-[var(--color-primary-light)] hover:text-black disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </span>
              ) : (
                'Create Model'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddFace

