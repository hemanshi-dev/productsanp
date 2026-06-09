import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { apiService, type User } from '../services/api'
import { toast } from 'react-toastify'
import JSZip from 'jszip'

interface GalleryItem {
  id: string
  url: string
  path: string
  date: string
  type: string
}

interface Generation {
  id: string
  job_id: string
  images: GalleryItem[]
  created_at: string
  count: number
  aspect_ratio?: string
  type?: string
}

const MyGenerations = () => {
  const navigate = useNavigate()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedGeneration) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedGeneration])
  const sectionRef = useRef<HTMLDivElement>(null)
  const [videoGenerating, setVideoGenerating] = useState<{ [key: string]: boolean }>({})
  const pollingIntervalsRef = useRef<{ [key: string]: NodeJS.Timeout }>({})

  // User and profile state
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const [loadingCredits, setLoadingCredits] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Helper functions for user profile
  const getInitial = (name?: string, email?: string) => {
    if (name) return name.charAt(0).toUpperCase()
    if (email) return email.charAt(0).toUpperCase()
    return 'U'
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setUserCredits(null)
    navigate('/')
    window.location.reload()
  }

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`)
    } else {
      window.history.replaceState(null, '', `/#${sectionId}`)
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 50)
    }
  }

  // Load user from localStorage on mount
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        // Map picture to avatar if avatar doesn't exist
        if (parsedUser.picture && !parsedUser.avatar) {
          parsedUser.avatar = parsedUser.picture
        }
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  // Fetch user credits
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (user?.id) {
        try {
          setLoadingCredits(true)
          const response = await apiService.getProfile(user.id)
          if (response.status && response.user?.credits !== undefined) {
            setUserCredits(response.user.credits)
            // Update user in localStorage if avatar changed
            const userWithAvatar = user as User & { avatar?: string }
            const responseUserWithAvatar = response.user as User & { avatar?: string }
            if (responseUserWithAvatar.avatar && responseUserWithAvatar.avatar !== userWithAvatar.avatar) {
              const updatedUser = { ...user, avatar: responseUserWithAvatar.avatar } as User & { avatar?: string }
              setUser(updatedUser as User)
              localStorage.setItem('user', JSON.stringify(updatedUser))
            }
          }
        } catch (error) {
          console.error('Error fetching user credits:', error)
        } finally {
          setLoadingCredits(false)
        }
      } else {
        setUserCredits(null)
      }
    }
    fetchUserCredits()
  }, [user?.id, (user as User & { avatar?: string })?.avatar])

  // Listen for credit refresh events
  useEffect(() => {
    const handleRefreshCredits = () => {
      if (user?.id) {
        const fetchUserCredits = async () => {
          try {
            setLoadingCredits(true)
            const response = await apiService.getProfile(user.id)
            if (response.status && response.user?.credits !== undefined) {
              setUserCredits(response.user.credits)
            }
          } catch (error) {
            console.error('Error fetching user credits:', error)
          } finally {
            setLoadingCredits(false)
          }
        }
        fetchUserCredits()
      }
    }

    window.addEventListener('refreshCredits', handleRefreshCredits)
    return () => {
      window.removeEventListener('refreshCredits', handleRefreshCredits)
    }
  }, [user?.id])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false)
  }, [user?.avatar, user?.picture])
  // Video generation loading screen state
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [videoJobId, setVideoJobId] = useState<string | null>(null)
  const [_videoSourceImageId, setVideoSourceImageId] = useState<string | null>(null)
  const [videoSourceImageUrl, setVideoSourceImageUrl] = useState<string | null>(null)
  const [currentVideoMessageIndex, setCurrentVideoMessageIndex] = useState(0)

  // Get user ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setUserId(user.id)
      } catch (error) {
        console.error('Error parsing user data:', error)
        // Don't redirect here - ProtectedRoute will handle it
      }
    }
    // Don't redirect here - ProtectedRoute will handle authentication
  }, [])

  // Transform API response items (already grouped by job) to Generation format
  const transformApiItems = (apiItems: any[]): Generation[] => {
    return apiItems
      .filter((item) => item && item.job_id && item.items && Array.isArray(item.items))
      .map((item) => {
        // Get the earliest date from all images in this job
        const dates = item.items.map((img: any) => new Date(img.date).getTime())
        const earliestDate = new Date(Math.min(...dates))
        
        // Transform images to match GalleryItem interface
        const images: GalleryItem[] = item.items.map((img: any) => ({
          id: img.id,
          url: img.url,
          path: img.path,
          date: img.date,
          type: img.type
        }))
        
        // Sort images by date (newest first)
        images.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        return {
          id: item.job_id,
          job_id: item.job_id,
          images: images,
          created_at: earliestDate.toISOString(),
          count: item.count || images.length,
          aspect_ratio: item.aspect_ratio,
          type: item.type
        }
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  // Fetch generations
  const fetchGenerations = async (isLoadMore: boolean = false) => {
    if (!userId) return

    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
      // Reset cursor when doing a fresh fetch so we start from page 1
      setCursor(null)
      setHasMore(true)
    }

    try {
      // If this is a fresh fetch, always start from the first page
      const fetchCursor = isLoadMore ? cursor : null
      const response = await apiService.getUserGallery(userId, 20, fetchCursor || undefined)
      
      if (response.status && response.data) {
        const apiItems = response.data.items || []
        const groupedGenerations = transformApiItems(apiItems)
        
        if (isLoadMore) {
          setGenerations(prev => [...prev, ...groupedGenerations])
        } else {
          setGenerations(groupedGenerations)
        }
        
        setCursor(response.data.next_cursor || null)
        setHasMore(response.data.has_more || false)
      } else {
        toast.error('Failed to load generations')
        setGenerations([])
        setHasMore(false)
      }
    } catch (error: any) {
      console.error('Error fetching generations:', error)
      toast.error(error.message || 'Failed to load generations')
      setGenerations([])
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchGenerations()
    }
  }, [userId])

  // Cleanup polling intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(pollingIntervalsRef.current).forEach(interval => {
        if (interval) clearInterval(interval)
      })
    }
  }, [])

  // Animate section entrance
  useEffect(() => {
    if (sectionRef.current && generations.length > 0) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      )
    }
  }, [generations])

  // Helper function to load image via canvas to handle CORS
  const loadImageAsBlob = (imgUrl: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      // Always load a fresh image to get original dimensions
      // Don't use existing DOM images as they may be cropped/resized by CSS
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      const handleLoad = () => {
        try {
          // Use naturalWidth and naturalHeight to get original image dimensions
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }
          
          // Draw the full original image
          ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight)
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to convert canvas to blob'))
            }
          }, 'image/png', 1.0) // Use maximum quality
        } catch (error) {
          reject(error)
        }
      }
      
      img.onload = handleLoad
      img.onerror = () => {
        reject(new Error('Failed to load image due to CORS restrictions'))
      }
      
      // Load the image
      img.src = imgUrl
    })
  }

  // Download individual image
  const downloadImage = async (imgUrl: string, fileName: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    try {
      // Try to download using canvas approach first (handles CORS)
      const blob = await loadImageAsBlob(imgUrl)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || 'image.png'
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)
      // toast.success('Image downloaded!')
    } catch (error) {
      // Fallback: try direct download (may open in new tab if CORS fails)
      console.error('Error downloading image:', error)
      const link = document.createElement('a')
      link.href = imgUrl
      link.download = fileName || 'image.png'
      link.target = '_blank'
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        document.body.removeChild(link)
      }, 100)
      toast.warning('Downloading image... (may open in new tab)')
    }
  }

  // Download all images from a generation as zip
  const downloadGenerationAsZip = async (generation: Generation, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    try {
      toast.info('Preparing zip file...', { autoClose: 2000 })
      const zip = new JSZip()
      const failedImages: number[] = []
      
      const imagePromises = generation.images.map(async (img, index) => {
        try {
          const blob = await loadImageAsBlob(img.url)
          const fileName = `generation-${generation.id.replace(/[:]/g, '-')}-image-${index + 1}.png`
          zip.file(fileName, blob)
        } catch (error) {
          console.error(`Error loading image ${index + 1}:`, error)
          failedImages.push(index + 1)
        }
      })

      await Promise.all(imagePromises)

      if (Object.keys(zip.files).length > 0) {
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(zipBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `generation-${generation.id.replace(/[:]/g, '-')}-${new Date().getTime()}.zip`
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        setTimeout(() => {
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }, 100)
        
        if (failedImages.length > 0) {
          toast.warning(`${Object.keys(zip.files).length} images downloaded. ${failedImages.length} failed due to CORS.`)
        } else {
          // toast.success('Generation downloaded as zip!')
        }
      } else {
        // If all failed, show error instead of opening images
        toast.error('Unable to create zip file due to CORS restrictions. Please try downloading images individually from the view modal.')
      }
    } catch (error: any) {
      console.error('Error creating zip file:', error)
      toast.error('Failed to create zip file. Please try again.')
    }
  }


  // Delete images
  const deleteImages = async (imageIds: string[]) => {
    if (!userId) {
      toast.error('User ID not found')
      return
    }

    try {
      const response = await apiService.deleteGalleryImages(userId, imageIds)
      if (response.status) {
        // toast.success('Images deleted successfully')
        // Refresh the generations list
        fetchGenerations(false)
        // Close modal if open
        if (selectedGeneration) {
          setSelectedGeneration(null)
        }
      } else {
        toast.error(response.message || 'Failed to delete images')
      }
    } catch (error: any) {
      console.error('Error deleting images:', error)
      toast.error(error.message || 'Failed to delete images')
    }
  }

  // Delete single image
  const handleDeleteImage = async (imageId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (window.confirm('Are you sure you want to delete this image?')) {
      await deleteImages([imageId])
    }
  }

  // Delete entire generation
  const handleDeleteGeneration = async (generation: Generation, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const imageIds = generation.images.map(img => img.id)
    if (window.confirm(`Are you sure you want to delete this generation (${imageIds.length} image${imageIds.length !== 1 ? 's' : ''})?`)) {
      await deleteImages(imageIds)
    }
  }

  // Generate video from image
  const handleGenerateVideo = async (imageId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!userId) {
      toast.error('User ID not found')
      return
    }

    if (videoGenerating[imageId]) {
      toast.info('Video generation already in progress...')
      return
    }

    try {
      setVideoGenerating(prev => ({ ...prev, [imageId]: true }))
      
      const response = await apiService.generateVideo({
        user_id: userId,
        image_id: imageId,
        total_video_generation: 1
      })

      if (response.status && response.data) {
        const jobId = response.data.job_id
        
        // Find the source image URL from the current generation
        let sourceImageUrl: string | null = null
        if (selectedGeneration) {
          const sourceImage = selectedGeneration.images.find(img => img.id === imageId)
          sourceImageUrl = sourceImage?.url || null
        } else {
          // If no modal is open, search through all generations
          for (const gen of generations) {
            const sourceImage = gen.images.find(img => img.id === imageId)
            if (sourceImage) {
              sourceImageUrl = sourceImage.url
              break
            }
          }
        }
        
        // Set video generation state to show loading screen
        setIsGeneratingVideo(true)
        setVideoJobId(jobId)
        setVideoSourceImageId(imageId)
        setVideoSourceImageUrl(sourceImageUrl)
        
        // toast.success('Video generation started!')
        
        // Start polling for status
        pollVideoStatus(jobId, imageId)
      } else {
        toast.error(response.message || 'Failed to start video generation')
        setVideoGenerating(prev => {
          const newState = { ...prev }
          delete newState[imageId]
          return newState
        })
        // Reset video generation state
        setIsGeneratingVideo(false)
        setVideoJobId(null)
        setVideoSourceImageId(null)
        setVideoSourceImageUrl(null)
      }
    } catch (error: any) {
      console.error('Error generating video:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate video'
      toast.error(errorMessage)
      setVideoGenerating(prev => {
        const newState = { ...prev }
        delete newState[imageId]
        return newState
      })
      // Reset video generation state
      setIsGeneratingVideo(false)
      setVideoJobId(null)
      setVideoSourceImageId(null)
      setVideoSourceImageUrl(null)
    }
  }

  // Poll video generation status
  const pollVideoStatus = async (jobId: string, imageId: string) => {
    const poll = async () => {
      try {
        const response = await apiService.checkVideoGenerationStatus(jobId)
        
        if (!response.status) {
          // Stop polling on API error
          if (pollingIntervalsRef.current[imageId]) {
            clearInterval(pollingIntervalsRef.current[imageId])
            delete pollingIntervalsRef.current[imageId]
          }
          setVideoGenerating(prev => {
            const newState = { ...prev }
            delete newState[imageId]
            return newState
          })
          toast.error('Failed to check video generation status')
          return
        }

        if (response.data) {
          const status = response.data.status

          // Stop polling when status is 'completed', 'failed', or 'error'
          if (status === 'completed') {
            if (pollingIntervalsRef.current[imageId]) {
              clearInterval(pollingIntervalsRef.current[imageId])
              delete pollingIntervalsRef.current[imageId]
            }
            
            setVideoGenerating(prev => {
              const newState = { ...prev }
              delete newState[imageId]
              return newState
            })

            // Reset video generation state
            setIsGeneratingVideo(false)
            setVideoJobId(null)
            setVideoSourceImageId(null)
            setVideoSourceImageUrl(null)

            // Refresh generations to show new video
            fetchGenerations(false)
            
            // Refresh credits in navbar after successful video generation
            window.dispatchEvent(new Event('refreshCredits'))
            
            if (response.data.generated_videos && response.data.generated_videos.length > 0) {
              // toast.success('Video generated successfully!')
            } else {
              toast.warning('Video generation completed but no video was returned')
            }
          } else if (status === 'failed' || status === 'error') {
            if (pollingIntervalsRef.current[imageId]) {
              clearInterval(pollingIntervalsRef.current[imageId])
              delete pollingIntervalsRef.current[imageId]
            }
            
            setVideoGenerating(prev => {
              const newState = { ...prev }
              delete newState[imageId]
              return newState
            })
            
            // Reset video generation state
            setIsGeneratingVideo(false)
            setVideoJobId(null)
            setVideoSourceImageUrl(null)
            
            const errorMessage = response.data.status_message || 
              (status === 'error' ? 'Video generation encountered an error' : 'Video generation failed')
            toast.error(errorMessage)
          }
        }
      } catch (error: any) {
        console.error('Error polling video status:', error)
        if (pollingIntervalsRef.current[imageId]) {
          clearInterval(pollingIntervalsRef.current[imageId])
          delete pollingIntervalsRef.current[imageId]
        }
        setVideoGenerating(prev => {
          const newState = { ...prev }
          delete newState[imageId]
          return newState
        })
        
        // Reset video generation state on error
        setIsGeneratingVideo(false)
        setVideoJobId(null)
        setVideoSourceImageUrl(null)
        
        toast.error('Failed to check video generation status')
      }
    }

    // Poll immediately, then every 5 seconds
    poll()
    pollingIntervalsRef.current[imageId] = setInterval(poll, 5000)
  }

  // Video loading messages
  const VIDEO_LOADING_MESSAGES = [
    'Generating your video...',
    'Please wait a few seconds more...',
    'Creating video with AI...',
    'Processing video...',
    'Almost there...',
    'Finalizing your video...'
  ]

  // Rotate through messages with fade effect for video generation
  useEffect(() => {
    if (!isGeneratingVideo || !videoJobId) return

    const interval = setInterval(() => {
      setCurrentVideoMessageIndex((prev) => (prev + 1) % VIDEO_LOADING_MESSAGES.length)
    }, 2000) // Change message every 2 seconds

    return () => clearInterval(interval)
  }, [isGeneratingVideo, videoJobId])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Show video generation loading screen
  if (isGeneratingVideo && videoJobId && videoSourceImageUrl) {
    return (
      <div className="py-20 relative overflow-hidden min-h-screen">
        <div ref={sectionRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className=" text-sm font-medium uppercase tracking-wider">
                Generating Video
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-semibold mb-6">
              Creating Your <span className="text-primary">Video</span>
            </h2>
          </div>

          {/* Single Image Card with Animated Shadow */}
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-md">
              {/* Animated glowing shadow effect */}
              <div 
                className="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary)] to-[var(--color-primary)] rounded-4xl blur-xl opacity-75 animate-pulse"
                style={{
                  animation: 'glow 2s ease-in-out infinite alternate',
                }}
              ></div>
              <style>{`
                @keyframes glow {
                  from {
                    opacity: 0.5;
                    transform: scale(1);
                  }
                  to {
                    opacity: 0.9;
                    transform: scale(1.02);
                  }
                }
              `}</style>
              
              {/* Card */}
              <div className="relative bg-secondary backdrop-blur-xl border border-[var(--color-primary)]/30 rounded-4xl overflow-hidden shadow-2xl">
                {/* Image Container */}
                <div className="aspect-square relative">
                  <img
                    src={videoSourceImageUrl}
                    alt="Generating video"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Animated Text Messages */}
          <div className="text-center">
            <div className="h-8 flex items-center justify-center">
              <span 
                key={currentVideoMessageIndex}
                className="text-primary text-lg font-medium animate-fade-in-out"
                style={{
                  animation: 'fadeInOut 2s ease-in-out',
                }}
              >
                {VIDEO_LOADING_MESSAGES[currentVideoMessageIndex]}
              </span>
            </div>
            <style>{`
              @keyframes fadeInOut {
                0%, 100% {
                  opacity: 0;
                  transform: translateY(10px);
                }
                20%, 80% {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </div>

          {/* Status info */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              This may take a few moments. Please don't close this page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading && generations.length === 0) {
    return (
      <div className="min-h-screen md:pt-[180px] pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--color-primary)]/30"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[var(--color-primary)] absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-600 text-lg">Loading your generations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="min-h-screen flex flex-col">
        {/* Top Header Bar */}
        <div className="bg-gray-900 text-white border-b border-white/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="md:w-3/12 w-1/2 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Link
                  to="/"
                  className="flex items-center space-x-2 cursor-pointer flex-shrink-0"
                >
                  <img src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/header-logo.png" alt="ProductSnap AI" className="md:h-8 md:h-auto w-auto max-w-[140px] md:max-w-[180px]" />
                </Link>
              </div>
            </div>
            <div className="md:w-3/12 w-1/2 flex items-center gap-4 justify-end">
              {/* Credits Display */}
              {user && userCredits !== null && (
                <a
                  href="/settings#credit-history"
                  onClick={(e) => {
                    e.preventDefault()
                    if (location.pathname === '/settings') {
                      navigate('/settings#credit-history', { replace: true })
                      window.dispatchEvent(new CustomEvent('settingsTabChange', { detail: 'credit-history' }))
                    } else {
                      navigate('/settings#credit-history')
                    }
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-white/20 rounded-full hover:text-gray-900 transition-all cursor-pointer"
                >
                  <span className="text-sm font-semibold">
                    <img src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/credit-icon.png" alt="Credit Icon" className="w-auto h-4" />
                  </span>
                  <span className="text-sm font-medium text-white">
                    {loadingCredits ? '...' : userCredits}
                  </span>
                </a>
              )}
              
              {/* Profile Dropdown */}
              {user && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 lg:space-x-3 md:px-2 lg:px-3 md:py-2 rounded-full hover:text-gray-900 transition-all"
                  >
                    {(user.avatar || user.picture) && !avatarError ? (
                      <img 
                        src={user.avatar || user.picture} 
                        alt={user.name || user.email}
                        className="w-8 h-8 rounded-full object-cover border border-gray-300"
                        onError={() => setAvatarError(true)}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold border border-gray-300">
                        {getInitial(user.name, user.email)}
                      </div>
                    )}
                    <span className="text-sm text-white hidden lg:block max-w-[120px] truncate">
                      {user.name || user.email}
                    </span>
                    <svg 
                      className={`w-4 h-4 text-white transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-900 text-black backdrop-blur-xl border border-white/20 rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="p-2">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-semibold text-white truncate">
                            {user.name || 'User'}
                          </p>
                          <p className="text-xs text-white truncate">
                            {user.email}
                          </p>
                        </div>
                        <a
                          href="/app"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[var(--color-primary)] transition-all text-white hover:text-white group"
                        >
                          <svg 
                            className="w-5 h-5 text-[var(--color-primary)] group-hover:text-white" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-sm font-medium">Create New</span>
                        </a>
                        <a 
                          href="/#pricing" 
                          onClick={(e) => {
                            e.preventDefault()
                            scrollToSection('pricing')
                            setShowDropdown(false)
                          }}
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[var(--color-primary)] transition-all text-white hover:text-white group"
                        >
                          <div>
                            <div className="p-[3px] rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center group-hover:border-white group-hover:text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
                            </div>
                          </div>
                          <span className="text-sm font-medium">Top Up Credits</span>
                        </a>
                       
                        <a
                          href="/settings"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[var(--color-primary)] transition-all text-white hover:text-white group"
                        >
                          <svg 
                            className="w-5 h-5 text-[var(--color-primary)] group-hover:text-white" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm font-medium">Settings</span>
                        </a>
                     
                        <button
                          onClick={() => {
                            setShowDropdown(false)
                            handleLogout()
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-red-600 hover:text-white hover:bg-red-500 group"
                        >
                          <svg 
                            className="w-5 h-5 group-hover:text-white" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span className="text-sm font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div ref={sectionRef} className=" mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* Header */}
        <div className="text-center md:mb-16 mb-8">
        <div  className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm font-medium uppercase tracking-wider">
                My Generations
              </span>
            </div>
          <h1 className="text-6xl md:text-7xl font-semibold mb-2 leading-tight">
            All Photoshoots
          </h1>
          <p className="md:text-lg text-md text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Explore and download all your AI generated masterpieces
          </p>
        </div>

        {/* Generations Grid */}
        {!generations || generations.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary text-white flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold  mb-3">No Generations Yet</h3>
            <p className="text-gray-600 mb-8">Start creating amazing images with our AI generator</p>
            <button
              onClick={() => navigate('/app')}
              className="px-8 py-3 bg-primary rounded-full hover:bg-black transition-all text-white font-semibold"
            >
              Create Your First Generation
            </button>
          </div>
        ) : (
          <>
            {/* Generations - Each generation in one row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Create Photoshoot Placeholder Card */}
              <div
                className="group relative rounded-2xl border-2 border-dashed border-gray-400/50 overflow-hidden transition-all duration-300 hover:border-primary hover:bg-gray-800 cursor-pointer bg-gray-900"
                onClick={() => navigate('/app')}
              >
                <div className="relative aspect-square flex flex-col items-center justify-center p-8">
                  {/* Central Icon Circle */}
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-gray-900 border-2 border-gray-400/50 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    {/* Plus Icon Overlay */}
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                  </div>
                  {/* Text */}
                  <span className="text-gray-400 font-medium text-sm">Create Photoshoot</span>
                </div>
              </div>

              {generations.map((generation) => (
                <div key={generation.id} className="">
                  {/* Generation Info - Show once per generation */}
                  {/* <div className="flex items-center justify-between mb-2">
                    <div>                    
                    <span className="text-sm text-gray-600">
                      {formatDate(generation.created_at)}
                    </span>
                    </div>
                    <div className="flex items-center gap-3">
                      
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded-md text-xs font-medium text-primary border border-[var(--color-primary)]">
                          ProductSnap AI
                        </span>
                        {generation.aspect_ratio && (
                          <span className="px-2 py-1 rounded-md text-xs font-medium text-primary border border-[var(--color-primary)]">
                            Ratio: {generation.aspect_ratio}
                          </span>
                        )}
                      </div>
                    </div>
                  </div> */}
                  
                  {/* Single Image Preview - Click to view all images in popup */}
                  <div className="flex gap-6">
                    {generation.images.length > 0 && (() => {
                      const firstImage = generation.images[0]
                      return (
                        <div
                          className="group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-105 flex-shrink-0 cursor-pointer"
                          style={{
                            width: '100%',
                            background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary-light) 30%, transparent) 0%, transparent 100%)',
                            borderColor: 'color-mix(in srgb, var(--color-primary-light) 30%, transparent)',
                          }}
                          onClick={() => {
                            setSelectedGeneration(generation)
                            setSelectedImageIndex(0) // Show the first image in the modal
                          }}
                        >
                        
                          {/* Image/Video Container */}
                          <div className="relative aspect-square overflow-hidden">
                            {firstImage.type === 'video' ? (
                              <>
                                <video
                                  src={firstImage.url}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  onError={(e) => {
                                    const target = e.target as HTMLVideoElement
                                    target.style.display = 'none'
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                                      <path d="M8 5v14l11-7z"/>
                                    </svg>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <img
                                src={firstImage.url}
                                alt={`Generation ${generation.id} - Preview`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                }}
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                            
                            {/* Image Count Badge */}
                            {generation.images.length > 1 && (
                              <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                                +{generation.images.length - 1} {generation.images.length - 1 === 1 ? 'image' : 'images'}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => fetchGenerations(true)}
                  disabled={loadingMore}
                  className="px-8 py-4 bg-primary rounded-full hover:bg-black transition-all text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </div>
      </div>

      {/* View Generation Modal - New Layout with Large Image, Thumbnails, and Sidebar */}
      {selectedGeneration && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" 
          onClick={() => setSelectedGeneration(null)}
          onWheel={(e) => e.stopPropagation()}
        >
          <div 
            className="relative w-full max-w-7xl max-h-[95vh] rounded-4xl border overflow-hidden bg-gray-900 backdrop-blur-xl my-4 border-gray-400/30"

            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedGeneration(null)}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-primary border border-primary transition-all text-white flex items-center justify-center backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex h-[95vh]">
              {/* Left Sidebar - Thumbnails */}
              <div className="w-24 border-r border-gray-400/50 overflow-y-auto p-3 space-y-3">
                {selectedGeneration.images.map((img, index) => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-[var(--color-primary)] scale-105' 
                        : 'border-gray-700/50 hover:border-gray-600'
                    }`}
                  >
                    {img.type === 'video' ? (
                      <>
                        <video
                          src={img.url}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLVideoElement
                            target.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </>
                    ) : (
                      <img
                        src={img.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Center - Large Image */}
              <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
                {selectedGeneration.images[selectedImageIndex] && (
                  <div className="relative w-full h-full max-w-4xl max-h-full flex items-center justify-center">
                    {selectedGeneration.images[selectedImageIndex].type === 'video' ? (
                      <video
                        src={selectedGeneration.images[selectedImageIndex].url}
                        className="max-w-full max-h-full object-contain rounded-2xl"
                        controls
                        autoPlay
                        onError={(e) => {
                          const target = e.target as HTMLVideoElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <img
                        src={selectedGeneration.images[selectedImageIndex].url}
                        alt={`Image ${selectedImageIndex + 1}`}
                        className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    )}
                    
                    {/* Navigation Arrows */}
                    {selectedGeneration.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedImageIndex((prev) => 
                              prev > 0 ? prev - 1 : selectedGeneration.images.length - 1
                            )
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 border border-gray-300 hover:border-primary hover:bg-primary/10 transition-all text-black flex items-center justify-center backdrop-blur-sm z-10 shadow-lg"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedImageIndex((prev) => 
                              prev < selectedGeneration.images.length - 1 ? prev + 1 : 0
                            )
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 border border-gray-300 hover:border-primary hover:bg-primary/10 transition-all text-black flex items-center justify-center backdrop-blur-sm z-10 shadow-lg"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Right Sidebar - Metadata and Actions */}
              <div className="w-80 border-l border-gray-800/30 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Metadata */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs uppercase tracking-wider">Model</label>
                        <div className="flex items-center gap-2 mt-1">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm text-gray-400">ProductSnap AI</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider">Date Created</label>
                        <p className="text-sm text-gray-400 mt-1">{formatDate(selectedGeneration.created_at)}</p>
                      </div>
                      {selectedGeneration.aspect_ratio && (
                        <div>
                          <label className="text-xs uppercase tracking-wider">Aspect Ratio</label>
                          <p className="text-sm text-gray-400 mt-1">{selectedGeneration.aspect_ratio}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-xs uppercase tracking-wider">Images in Generation</label>
                        <p className="text-sm text-gray-400 mt-1">{selectedGeneration.images.length} {selectedGeneration.images.some(img => img.type === 'video') ? 'item' : 'image'}{selectedGeneration.images.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Actions</h3>
                    <div className="space-y-2">
                      {selectedGeneration.images[selectedImageIndex] && (
                        <>
                          {selectedGeneration.images[selectedImageIndex].type === 'video' ? (
                            <a
                              href={selectedGeneration.images[selectedImageIndex].url}
                              download={`generation-${selectedGeneration.id.replace(/[:]/g, '-')}-video-${selectedImageIndex + 1}.mp4`}
                              className="w-full px-4 py-3 bg-primary border border-[var(--color-primary)] rounded-lg transition-all text-white text-sm font-medium flex items-center justify-center gap-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
                              Download
                            </a>
                          ) : (
                            <>
                              <button
                                onClick={(e) => downloadImage(selectedGeneration.images[selectedImageIndex].url, `generation-${selectedGeneration.id.replace(/[:]/g, '-')}-image-${selectedImageIndex + 1}.png`, e)}
                                className="w-full px-4 py-3 bg-primary border border-[var(--color-primary)] rounded-lg transition-all text-white text-sm font-medium flex items-center justify-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
                                Download
                              </button>
                              <button
                                onClick={(e) => handleGenerateVideo(selectedGeneration.images[selectedImageIndex].id, e)}
                                disabled={videoGenerating[selectedGeneration.images[selectedImageIndex].id]}
                                className="w-full px-4 py-3 bg-blue-500 border border-blue-500 rounded-lg hover:bg-blue-500 transition-all text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                {videoGenerating[selectedGeneration.images[selectedImageIndex].id] ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-300/30 border-t-blue-300"></div>
                                ) : (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                                    Generate Video
                                  </>
                                )}
                              </button>
                            </>
                          )}
                          <button
                            onClick={(e) => handleDeleteImage(selectedGeneration.images[selectedImageIndex].id, e)}
                            className="w-full px-4 py-3 bg-red-500 border border-red-500 rounded-lg hover:bg-red-500 transition-all text-white text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                            Delete
                          </button>
                        </>
                      )}
                      
                      {/* Only show Download All and Delete Generation if generation contains images (not all videos) */}
                      {selectedGeneration.images.some(img => img.type !== 'video') && (
                        <div className="pt-4 border-t border-gray-800/30 space-y-2">
                          <button
                            onClick={(e) => downloadGenerationAsZip(selectedGeneration, e)}
                            className="w-full px-4 py-3 bg-primary rounded-lg transition-all text-white text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
                            Download All
                          </button>
                          <button
                            onClick={(e) => handleDeleteGeneration(selectedGeneration, e)}
                            className="w-full px-4 py-3 bg-red-500 border border-red-500 rounded-lg hover:bg-red-500 transition-all text-white text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                            Delete Generation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyGenerations

