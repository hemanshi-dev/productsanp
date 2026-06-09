import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useAppDispatch } from '../../store/hooks'
import { updatePrompt as updatePromptAction, resetPagination, fetchPrompts } from '../../store/slices/promptsSlice'
import { apiService } from '../../services/api'

interface PromptFormData {
  title: string
  visible: boolean
}

const EditPrompt = () => {
  const dispatch = useAppDispatch()
  const { promptId } = useParams<{ promptId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPrompt, setCurrentPrompt] = useState<any>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [prompts, setPrompts] = useState<string[]>([''])
  const [customPrompt1, setCustomPrompt1] = useState<string>('')
  const [customPrompt2, setCustomPrompt2] = useState<string>('')
  const [customPrompt3, setCustomPrompt3] = useState<string>('')
  const [customPrompt4, setCustomPrompt4] = useState<string>('')
  const [customPromptProduct1, setCustomPromptProduct1] = useState<string>('')
  const [customPromptProduct2, setCustomPromptProduct2] = useState<string>('')
  const [customPromptProduct3, setCustomPromptProduct3] = useState<string>('')
  const [customPromptProduct4, setCustomPromptProduct4] = useState<string>('')

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PromptFormData>()

  const addPrompt = () => {
    setPrompts([...prompts, ''])
  }

  const removePrompt = (index: number) => {
    if (prompts.length > 1) {
      setPrompts(prompts.filter((_, i) => i !== index))
    } else {
      toast.error('At least one prompt is required')
    }
  }

  const handlePromptChange = (index: number, value: string) => {
    const updatedPrompts = [...prompts]
    updatedPrompts[index] = value
    setPrompts(updatedPrompts)
  }

  useEffect(() => {
    const fetchPromptDetail = async () => {
      if (!promptId) return

      try {
        setLoading(true)
        const response = await apiService.getPromptDetail(promptId)
        if (response.status && response.data) {
          setCurrentPrompt(response.data)
        } else {
          setError(response.message || 'Failed to load prompt details')
        }
      } catch (err: any) {
        console.error('Error fetching prompt details:', err)
        setError(err.message || 'Failed to load prompt details')
      } finally {
        setLoading(false)
      }
    }

    fetchPromptDetail()
  }, [promptId])

  useEffect(() => {
    if (currentPrompt) {
      setImagePreview(currentPrompt.image_url)
      reset({
        title: currentPrompt.title,
        visible: currentPrompt.visible,
      })

      // Handle prompts - API now returns 'prompts' array or 'prompt' string (legacy)
      if (currentPrompt.prompts && Array.isArray(currentPrompt.prompts)) {
        // New format: prompts is already an array
        setPrompts(currentPrompt.prompts.length > 0 ? currentPrompt.prompts : [''])
      } else if (currentPrompt.prompt) {
        // Legacy format: prompt is a string
        try {
          // Try to parse as JSON array
          const parsed = JSON.parse(currentPrompt.prompt)
          if (Array.isArray(parsed)) {
            setPrompts(parsed.length > 0 ? parsed : [''])
          } else {
            // If it's a string, check if it contains commas
            const promptString = currentPrompt.prompt
            if (promptString.includes(',')) {
              // Split by comma and trim each part
              const splitPrompts = promptString.split(',').map((p: string) => p.trim()).filter((p: string) => p.length > 0)
              setPrompts(splitPrompts.length > 0 ? splitPrompts : [''])
            } else {
              // Single prompt string
              setPrompts([promptString])
            }
          }
        } catch {
          // If not JSON, check if it contains commas
          const promptString = currentPrompt.prompt
          if (promptString.includes(',')) {
            // Split by comma and trim each part
            const splitPrompts = promptString.split(',').map((p: string) => p.trim()).filter((p: string) => p.length > 0)
            setPrompts(splitPrompts.length > 0 ? splitPrompts : [''])
          } else {
            // Single prompt string
            setPrompts([promptString])
          }
        }
      } else {
        setPrompts([''])
      }

      // Load custom prompts if they exist (check both camelCase and snake_case)
      setCustomPrompt1((currentPrompt as any).custom_prompt_1 || (currentPrompt as any).customPrompt1 || '')
      setCustomPrompt2((currentPrompt as any).custom_prompt_2 || (currentPrompt as any).customPrompt2 || '')
      setCustomPrompt3((currentPrompt as any).custom_prompt_3 || (currentPrompt as any).customPrompt3 || '')
      setCustomPrompt4((currentPrompt as any).custom_prompt_4 || (currentPrompt as any).customPrompt4 || '')
      setCustomPromptProduct1((currentPrompt as any).custom_prompt_product_1 || (currentPrompt as any).customPromptProduct1 || '')
      setCustomPromptProduct2((currentPrompt as any).custom_prompt_product_2 || (currentPrompt as any).customPromptProduct2 || '')
      setCustomPromptProduct3((currentPrompt as any).custom_prompt_product_3 || (currentPrompt as any).customPromptProduct3 || '')
      setCustomPromptProduct4((currentPrompt as any).custom_prompt_product_4 || (currentPrompt as any).customPromptProduct4 || '')
    }
  }, [currentPrompt, reset])

  // Optimize image (without resizing)
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

  const onSubmit = async (data: PromptFormData) => {
    if (!currentPrompt) return

    // Validate prompts
    const validPrompts = prompts.filter(p => p.trim().length > 0)
    if (validPrompts.length === 0) {
      toast.error('At least one prompt is required')
      return
    }

    setSubmitting(true)

    // Validate custom prompts
    if (!customPrompt1.trim() || !customPrompt2.trim() || !customPrompt3.trim() || !customPrompt4.trim()) {
      toast.error('All 4 Custom Prompts for Model Angles are required')
      setSubmitting(false)
      return
    }

    // Validate custom product prompts
    if (!customPromptProduct1.trim() || !customPromptProduct2.trim() || !customPromptProduct3.trim() || !customPromptProduct4.trim()) {
      toast.error('All 4 Custom Product Prompts are required')
      setSubmitting(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('id', currentPrompt.id)
      formData.append('title', data.title)
      // Send prompts as JSON array string
      formData.append('prompts', JSON.stringify(validPrompts))
      formData.append('visible', data.visible.toString())
      if (imageFile) {
        formData.append('image', imageFile)
      }
      // Send all 8 custom prompt fields (always send all fields)
      formData.append('custom_prompt_1', customPrompt1.trim())
      formData.append('custom_prompt_2', customPrompt2.trim())
      formData.append('custom_prompt_3', customPrompt3.trim())
      formData.append('custom_prompt_4', customPrompt4.trim())
      formData.append('custom_prompt_product_1', customPromptProduct1.trim())
      formData.append('custom_prompt_product_2', customPromptProduct2.trim())
      formData.append('custom_prompt_product_3', customPromptProduct3.trim())
      formData.append('custom_prompt_product_4', customPromptProduct4.trim())

      const result = await dispatch(updatePromptAction(formData))

      if (updatePromptAction.fulfilled.match(result)) {
        toast.success('Prompt updated successfully')
        // Refresh prompts list
        dispatch(resetPagination())
        dispatch(fetchPrompts({ page: 1, cursor: undefined, query: '' }))
        // navigate('/admin/prompts')
      } else {
        toast.error(result.payload as string || 'Failed to update prompt')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update prompt')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading prompt data...</p>
        </div>
      </div>
    )
  }

  const prompt = currentPrompt

  if (error || !prompt) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-red-500/10 to-[var(--color-primary)]/10 border border-red-500/30 p-8 text-center">
        <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-400 text-lg font-semibold mb-6">{error || 'Prompt not found'}</p>
        <button
          onClick={() => navigate('/admin/prompts')}
          className="px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary-light)] rounded-full transition-all shadow-lg shadow-[var(--color-primary)]/30"
        >
          Back to Prompts
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/prompts')}
          className="mb-6 px-4 py-2.5 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary)]/10 flex items-center gap-2 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Prompts</span>
        </button>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Edit Prompt</h1>
        <p className="text-gray-400 text-lg">Update prompt information</p>
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
              className={`w-full px-4 py-3 bg-gray-900/50 border rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${errors.title
                ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                : 'border-gray-700/50 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]'
                }`}
              placeholder="Enter prompt title"
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Prompts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-400 text-sm font-medium">
                Prompts <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={addPrompt}
                className="px-4 py-2 text-sm bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary-light)] text-white rounded-full transition-all duration-300 shadow-lg shadow-[var(--color-primary)]/30 hover:shadow-xl hover:shadow-[var(--color-primary)]/40 font-semibold flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Prompt
              </button>
            </div>
            <div className="space-y-5">
              {prompts.map((prompt, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <textarea
                    value={prompt}
                    onChange={(e) => handlePromptChange(index, e.target.value)}
                    rows={8}
                    className={`flex-1 px-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all resize-none ${prompt.trim().length === 0 && prompts.length > 1
                      ? 'border-yellow-500/50 focus:ring-yellow-500/50 focus:border-yellow-500'
                      : 'border-gray-700/50 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]'
                      }`}
                    placeholder={`Enter prompt ${index + 1}`}
                  />
                  {prompts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrompt(index)}
                      className="mt-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 hover:border-red-500 text-red-400 rounded-lg transition-all duration-300 flex items-center justify-center"
                      title="Remove prompt"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            {prompts.filter(p => p.trim().length > 0).length === 0 && (
              <p className="mt-2 text-sm text-red-400">At least one prompt is required</p>
            )}
          </div>

          {/* Custom Prompts for Model Angles */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-3">
              Custom Prompts for Model Angles <span className="text-red-400">*</span>
            </label>
            <div className="space-y-4">
              {/* Custom Prompt 1 */}
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-2">
                  Model Prompt 1
                </label>
                <textarea
                  rows={8}
                  value={customPrompt1}
                  onChange={(e) => setCustomPrompt1(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                  placeholder="Enter custom prompt for angle 1"
                />
              </div>

              {/* Custom Prompt 2 */}
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-2">
                  Model Prompt 2
                </label>

                <textarea
                  rows={8}
                  value={customPrompt2}
                  onChange={(e) => setCustomPrompt2(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                  placeholder="Enter custom prompt for angle 2"
                />
              </div>

              {/* Custom Prompt 3 */}
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-2">
                  Model Prompt 3
                </label>
                <textarea
                  rows={8}
                  value={customPrompt3}
                  onChange={(e) => setCustomPrompt3(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                  placeholder="Enter custom prompt for angle 3"
                />
              </div>

              {/* Custom Prompt 4 */}
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-2">
                  Model Prompt 4
                </label>
                <textarea
                  rows={8}
                  value={customPrompt4}
                  onChange={(e) => setCustomPrompt4(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                  placeholder="Enter custom prompt for angle 4"
                />
              </div>
            </div>
          </div>


          {/* Custom Product Prompts */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-3">
              Custom Product Prompts <span className="text-red-400">*</span>
            </label>
            <div className="space-y-4">
              {/* Custom Product Prompt 1 */}
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-2">
                  Product Prompt 1
                </label>
                <textarea
                  rows={8}
                  value={customPromptProduct1}
                  onChange={(e) => setCustomPromptProduct1(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                  placeholder="Enter custom product prompt 1"
                />
              </div>

              {/* Custom Product Prompt 2 */}
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-2">
                  Product Prompt 2
                </label>
                <textarea
                  rows={8}
                  value={customPromptProduct2}
                  onChange={(e) => setCustomPromptProduct2(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                  placeholder="Enter custom product prompt 2"
                />
              </div>

              {/* Custom Product Prompt 3 */}
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-2">
                  Product Prompt 3
                </label>
                <textarea
                  rows={8}
                  value={customPromptProduct3}
                  onChange={(e) => setCustomPromptProduct3(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                  placeholder="Enter custom product prompt 3"
                />
              </div>

              {/* Custom Product Prompt 4 */}
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-2">
                  Product Prompt 4
                </label>
                <textarea
                  rows={8}
                  value={customPromptProduct4}
                  onChange={(e) => setCustomPromptProduct4(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                  placeholder="Enter custom product prompt 4"
                />
              </div>
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Image <span className="text-gray-500 text-xs">(Optional - only upload if you want to replace the current image)</span>
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
                <div className="relative w-[340px] h-[200px] rounded-xl overflow-hidden border border-gray-700/50">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {imagePreview && !imageFile ? 'Current image is displayed. Upload a new image to replace it.' : 'Upload a new image to replace the current one'}
            </p>
          </div>

          {/* Visible */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('visible')}
                className="w-5 h-5 rounded border-gray-700/50 bg-gray-900/50 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/50 focus:ring-offset-gray-900"
              />
              <span className="text-gray-400 text-sm font-medium">Visible</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/prompts')}
              className="flex-1 px-6 py-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white rounded-full transition-all duration-300 hover:shadow-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-primary hover:bg-[var(--color-primary-light)] hover:text-black text-white rounded-full transition-all duration-300 shadow-lg shadow-[var(--color-primary)]/30 hover:shadow-xl hover:shadow-[var(--color-primary)]/40 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Updating...
                </span>
              ) : (
                'Update Prompt'
              )}
            </button>
          </div>
        </form>
      </div >
    </div >
  )
}

export default EditPrompt

