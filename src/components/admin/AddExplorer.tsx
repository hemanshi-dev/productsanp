import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { apiService } from '../../services/api'

interface ExplorerFormData {
  title: string
  prompt: string
  type: 'image' | 'video'
}

const AddExplorer = () => {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ExplorerFormData>({
    defaultValues: {
      type: 'image',
      prompt: ''
    }
  })
  
  const type = watch('type')

  const processFile = (selectedFile: File) => {
    // Validate file type based on selected type
    if (type === 'video' && !selectedFile.type.startsWith('video/')) {
      toast.error('Only video files are allowed.')
      return
    }
    if (type === 'image' && !selectedFile.type.startsWith('image/')) {
      toast.error('Only image files are allowed.')
      return
    }

    setFile(selectedFile)
    const previewUrl = URL.createObjectURL(selectedFile)
    setFilePreview(previewUrl)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
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

  const onSubmit = async (data: ExplorerFormData) => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', data.title.trim())
      formDataToSend.append('prompt', data.prompt.trim())
      formDataToSend.append('type', data.type)
      formDataToSend.append('file', file)

      const response = await apiService.addExplorer(formDataToSend)

      if (response.status) {
        toast.success(response.message || 'Explorer item added successfully')
        navigate('/admin/explorer')
      } else {
        toast.error(response.message || 'Failed to add explorer item')
      }
    } catch (error: any) {
      console.error('Error adding explorer item:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to add explorer item')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/explorer')}
          className="mb-6 px-4 py-2.5 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-white/15 flex items-center gap-2 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Explorer
        </button>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Add New Explorer Item</h1>
        <p className="text-gray-400 text-lg">Add a new image or video to the explorer</p>
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
              placeholder="Enter title"
              className={`w-full px-4 py-3 bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm border rounded-full text-white focus:outline-none focus:ring-2 transition-all ${
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

          {/* Prompt */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Prompt
            </label>
            <textarea
              {...register('prompt')}
              placeholder="Enter prompt (optional)"
              rows={4}
              className="w-full px-4 py-3 bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:border-[var(--color-primary)]/50 focus:ring-[var(--color-primary)]/20 transition-all resize-none"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Type <span className="text-red-400">*</span>
            </label>
            <select
              {...register('type', { required: 'Type is required' })}
              className="w-full px-4 py-3 bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-full text-white focus:outline-none focus:ring-2 focus:border-[var(--color-primary)]/50 focus:ring-[var(--color-primary)]/20 transition-all"
            >
              <option value="image" className="bg-gray-900">Image</option>
              <option value="video" className="bg-gray-900">Video</option>
            </select>
            {errors.type && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.type.message}
              </p>
            )}
          </div>

          {/* File */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              File <span className="text-red-400">*</span>
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
                  <p className="text-xs text-gray-500">
                    {type === 'video' ? 'MP4, MOV, AVI up to 100MB' : 'PNG, JPG, GIF up to 10MB'}
                  </p>
                </div>
                <input
                  type="file"
                  accept={type === 'video' ? 'video/*' : 'image/*'}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {filePreview && (
                <div className="relative w-full max-w-md">
                  {type === 'video' ? (
                    <div className="rounded-xl overflow-hidden border border-gray-700/50">
                      <video
                        src={filePreview}
                        className="w-full h-auto"
                        controls
                      />
                    </div>
                  ) : (
                    <div className="relative w-[150px] h-[150px] rounded-xl overflow-hidden border border-gray-700/50">
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            {!file && (
              <p className="mt-2 text-sm text-red-400">Please select a file</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/explorer')}
              className="flex-1 px-6 py-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white rounded-full transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !file}
                className="flex-1 px-6 py-3 bg-primary  text-white rounded-full transition-all hover:bg-[var(--color-primary-light)] hover:text-black disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </span>
              ) : 'Add Explorer Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddExplorer

