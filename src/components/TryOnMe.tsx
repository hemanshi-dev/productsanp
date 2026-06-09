import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { apiService, type User } from '../services/api'
import { toast } from 'react-toastify'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import men from '../assets/images/men.png'
import women from '../assets/images/women.png'
import kid from '../assets/images/kid.png'

interface StepData {
  who: 'Men' | 'Women' | 'Kids' | null
  category: string | null
  style: string | null
  photo: File | null
  photoPreview: string | null
  product: File | null
  productPreview: string | null
}

// Static data - will be replaced with API calls later
const CATEGORIES = [
  { id: 'jewelry', name: 'Jewelry' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'eyewear', name: 'Eyewear' },
  { id: 'headwear', name: 'Headwear' },
]

const STYLES: Record<string, Record<string, Array<{ id: string; name: string; style_id?: string }>>> = {
  Men: {
    jewelry: [
      { id: 'earrings', name: 'Earrings' },
      { id: 'necklace', name: 'Necklace' },
      { id: 'ring', name: 'Ring' },
      { id: 'watch', name: 'Watch' },
    ],
    clothing: [
      { id: 'shirt', name: 'Shirt' },
      { id: 'jacket', name: 'Jacket' },
      { id: 'pants', name: 'Pants' },
      { id: 't-shirt', name: 'T-Shirt' },
    ],
    accessories: [
      { id: 'bag', name: 'Bag' },
      { id: 'watch', name: 'Watch' },
      { id: 'belt', name: 'Belt' },
      { id: 'wallet', name: 'Wallet' },
    ],
    eyewear: [
      { id: 'sunglasses', name: 'Sunglasses' },
      { id: 'glasses', name: 'Glasses' },
    ],
    headwear: [
      { id: 'cap', name: 'Cap' },
      { id: 'hat', name: 'Hat' },
      { id: 'beanie', name: 'Beanie' },
    ],
  },
  Women: {
    jewelry: [
      { id: 'earrings', name: 'Earrings' },
      { id: 'necklace', name: 'Necklace' },
      { id: 'bangles', name: 'Bangles' },
      { id: 'ring', name: 'Ring' },
      { id: 'bracelet', name: 'Bracelet' },
    ],
    clothing: [
      { id: 'dress', name: 'Saree', style_id: '6957ae1d5b74aa431109c096' },
      { id: 'lehenga', name: 'Lehenga' },
      { id: 'kurti', name: 'Kurti' },
      { id: 'salwar_suit', name: 'Salwar Suit' },
      { id: 'western_dress', name: 'Western Dress' },
      { id: 'gown', name: 'Gown' },
      { id: 'top', name: 'Top/T-Shirt' },
      { id: 'skirt', name: 'Skirt' },
      { id: 'indo_western', name: 'Indo Western' },
      { id: 'other', name: 'Other' },
    ],
    accessories: [
      { id: 'bag', name: 'Bag' },
      { id: 'watch', name: 'Watch' },
      { id: 'belt', name: 'Belt' },
      { id: 'scarf', name: 'Scarf' },
      { id: 'purse', name: 'Purse' },
    ],
    eyewear: [
      { id: 'sunglasses', name: 'Sunglasses' },
      { id: 'glasses', name: 'Glasses' },
    ],
    headwear: [
      { id: 'cap', name: 'Cap' },
      { id: 'hat', name: 'Hat' },
      { id: 'beanie', name: 'Beanie' },
    ],
  },
  Kids: {
    jewelry: [
      { id: 'earrings', name: 'Earrings' },
      { id: 'necklace', name: 'Necklace' },
      { id: 'bracelet', name: 'Bracelet' },
    ],
    clothing: [
      { id: 'shirt', name: 'Shirt' },
      { id: 'dress', name: 'Dress' },
      { id: 'jacket', name: 'Jacket' },
      { id: 'pants', name: 'Pants' },
      { id: 't-shirt', name: 'T-Shirt' },
    ],
    accessories: [
      { id: 'bag', name: 'Bag' },
      { id: 'watch', name: 'Watch' },
      { id: 'belt', name: 'Belt' },
    ],
    eyewear: [
      { id: 'sunglasses', name: 'Sunglasses' },
      { id: 'glasses', name: 'Glasses' },
    ],
    headwear: [
      { id: 'cap', name: 'Cap' },
      { id: 'hat', name: 'Hat' },
      { id: 'beanie', name: 'Beanie' },
    ],
  },
}

const TryOnMe = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [stepData, setStepData] = useState<StepData>({
    who: null,
    category: null,
    style: null,
    photo: null,
    photoPreview: null,
    product: null,
    productPreview: null,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [resultImages, setResultImages] = useState<string[]>([])
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false)
  const [isDraggingProduct, setIsDraggingProduct] = useState(false)
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [mobileView, setMobileView] = useState<'left' | 'right' | 'center'>('left')

  const sectionRef = useRef<HTMLDivElement>(null)
  const fileInputPhotoRef = useRef<HTMLInputElement>(null)
  const fileInputProductRef = useRef<HTMLInputElement>(null)


  // User and profile state
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

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      )
    }
  }, [])

  const handlePhotoUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setStepData((prev) => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file),
      }))
    }
  }

  const handleProductUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setStepData((prev) => ({
        ...prev,
        product: file,
        productPreview: URL.createObjectURL(file),
      }))
    }
  }

  // Compress image file to WebP format (same as AIImageGenerator)
  const compressImageFile = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          let targetWidth = img.width
          let targetHeight = img.height

          let scaleWidth = 1
          let scaleHeight = 1

          if (targetWidth > 1024) {
            scaleWidth = 1024 / targetWidth
          }
          if (targetHeight > 1024) {
            scaleHeight = 1024 / targetHeight
          }

          const finalScale = Math.min(scaleWidth, scaleHeight)

          if (finalScale < 1) {
            targetWidth = Math.round(targetWidth * finalScale)
            targetHeight = Math.round(targetHeight * finalScale)
          }

          const canvas = document.createElement('canvas')
          canvas.width = targetWidth
          canvas.height = targetHeight
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

          const outputType = 'image/webp'
          let quality = 0.85

          const tryCompress = (currentQuality: number): void => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to compress image'))
                  return
                }

                const maxSize = 500 * 1024

                if (blob.size > maxSize && currentQuality > 0.5) {
                  tryCompress(currentQuality - 0.1)
                } else {
                  const fileName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
                  const compressedFile = new File([blob], fileName, {
                    type: outputType,
                    lastModified: Date.now()
                  })

                  resolve(compressedFile)
                }
              },
              outputType,
              currentQuality
            )
          }

          tryCompress(quality)
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  // Convert file to base64 (with compression)
  const fileToBase64 = async (file: File): Promise<string> => {
    const compressedFile = await compressImageFile(file)
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        const base64Data = base64.includes(',') ? base64.split(',')[1] : base64
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(compressedFile)
    })
  }

  // Poll job status
  const pollJobStatus = async (jobId: string) => {
    try {
      const response = await apiService.checkImageGenerationStatus(jobId)

      if (!response.status) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        setIsGenerating(false)
        toast.error('Failed to check generation status')
        return
      }

      if (response.data) {
        const status = response.data.status

        if (status === 'completed' || status === 'partial_success') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }

          setIsGenerating(false)
          
          if (response.data?.generated_images && response.data.generated_images.length > 0) {
            // Get all successful images
            const generatedImages = response.data.generated_images
            const successfulImages = generatedImages
              .filter(img => img.status === 'success' && img.url)
              .map(img => img.url)
              .sort((a, b) => {
                // Sort by index if available
                const aIndex = generatedImages.findIndex(img => img.url === a)
                const bIndex = generatedImages.findIndex(img => img.url === b)
                return aIndex - bIndex
              })
            
            if (successfulImages.length > 0) {
              setResultImages(successfulImages)
            } else {
              toast.error('No images were generated')
            }
          } else {
            toast.error('No images were generated')
          }
        } else if (status === 'failed' || status === 'error') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
          setIsGenerating(false)
          toast.error(response.data.status_message || 'Generation failed')
        }
      }
    } catch (error: any) {
      console.error('Error polling job status:', error)
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      setIsGenerating(false)
      toast.error(error.message || 'Failed to check generation status')
    }
  }

  const handleGenerate = async () => {
    // Prepare JSON payload with actual selected values (for logging)
    const payload = {
      target: stepData.who?.toLowerCase() || null,
      category: stepData.category || null,
      subcategory: stepData.style || null,
      age_group: null,
      photo: stepData.photo?.name || null,
      product_id: stepData.product?.name || null,
      settings: {
        scale: 1.1,
        angle: "front",
        lighting: "studio"
      }
    }

    // Log the selected values as JSON
    console.log('Generate Try On - Selected Values:', JSON.stringify(payload, null, 2))

    // Validate required fields
    if (!stepData.photo || !stepData.product) {
      toast.error('Please upload both photo and product image')
      return
    }

    // Get user ID from localStorage
    const userData = localStorage.getItem('user')
    if (!userData) {
      toast.error('Please login to generate images')
      return
    }

    let userId: string
    try {
      const user = JSON.parse(userData)
      userId = user.id?.toString() || ''
      if (!userId) {
        toast.error('User ID not found')
        return
      }
    } catch (error) {
      toast.error('Invalid user data')
      return
    }

    setIsGenerating(true)

    try {
      // Convert images to base64
      const facePhotoBase64 = await fileToBase64(stepData.photo)
      const productBase64 = await fileToBase64(stepData.product)

      // Build prompt based on selections
      const categoryName = CATEGORIES.find(c => c.id === stepData.category)?.name || ''
      const styleName = stepData.who && stepData.category && STYLES[stepData.who] && STYLES[stepData.who][stepData.category]
        ? STYLES[stepData.who][stepData.category].find((s: { id: string; name: string }) => s.id === stepData.style)?.name || ''
        : ''
      
      const userPrompt = `Try on ${styleName} ${categoryName} on ${stepData.who?.toLowerCase() || 'person'}`

      // Prepare API request data for generateImage
      // Get style_id from selected style, or use default
      const selectedStyle = stepData.who && stepData.category && STYLES[stepData.who] && STYLES[stepData.who][stepData.category]
        ? STYLES[stepData.who][stepData.category].find((s: { id: string; name: string; style_id?: string }) => s.id === stepData.style)
        : null
      const styleId = selectedStyle?.style_id || '6957ae1d5b74aa431109c096'
      
      const requestData = {
        user_id: userId,
        style_id: styleId, // Use style_id from selection or fallback to default
        user_prompt: userPrompt,
        modeling: true, // Always true for try-on
        type: 'try-on', // Static type for try-on
        total_image_generation: 1, // Static - generate 1 image
        aspect_ratio: '1:1', // Static aspect ratio
        face_id: '', // Empty since we're using face_photo_base64
        face_photo_base64: facePhotoBase64,
        photos_base64: [productBase64], // Product image as base64
      }

      // Call generate image API
      const response = await apiService.generateImage(requestData)

      if (response.status && response.data) {
        // Start polling immediately
        pollJobStatus(response.data.job_id)

        // Then set up interval to poll every 5 seconds
        const interval = setInterval(() => {
          pollJobStatus(response.data!.job_id)
        }, 5000)

        pollingIntervalRef.current = interval
      } else {
        setIsGenerating(false)
        toast.error(response.message || 'Failed to start generation')
      }
    } catch (error: any) {
      console.error('Error generating try-on:', error)
      setIsGenerating(false)
      toast.error(error.message || 'Failed to generate try-on image')
    }
  }

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  // Reset everything function
  const resetEverything = () => {
    setStepData({
      who: null,
      category: null,
      style: null,
      photo: null,
      photoPreview: null,
      product: null,
      productPreview: null,
    })
    setResultImages([])
    setIsGenerating(false)
    
    // Reset mobile view
    setMobileView('left')
    
    // Clear preview URLs
    if (stepData.photoPreview) {
      URL.revokeObjectURL(stepData.photoPreview)
    }
    if (stepData.productPreview) {
      URL.revokeObjectURL(stepData.productPreview)
    }
    
    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  // Dashboard layout - all panels visible at once
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
                          <a
                            href="/gallery"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[var(--color-primary)] transition-all text-white hover:text-white group"
                          >
                            <svg 
                              className="w-5 h-5 text-[var(--color-primary)] group-hover:text-white" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium">My Gallery</span>
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

          {/* Three Panel Layout */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Mobile Navigation Header - Only visible on mobile */}
            <div className="md:hidden bg-gray-900 border-b border-white/20 z-40 shadow-sm">
              {/* Categories Section - Show before tabs */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center flex-wrap justify-center gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setStepData((prev) => ({ ...prev, category: category.id, style: null }))
                      }}
                      className={`md:px-3 md:py-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                        stepData.category === category.id
                          ? 'bg-primary text-white'
                          : 'text-gray-900 text-white'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Left Panel - Inputs */}
            <div className={`w-full md:w-100 bg-gray-900 border-r border-white/20 overflow-y-auto flex-shrink-0 ${
              mobileView === 'center' ? 'hidden md:block' : 'block'
            } ${isGenerating || resultImages.length > 0 ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">Inputs</h2>
              
              {/* Who Selection */}
              <div className="mb-6">
                <label className="block text-md font-medium text-white mb-3">Who</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Men', 'Women', 'Kids'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setStepData((prev) => ({ ...prev, who: option, category: null, style: null }))}
                      className={`p-2 rounded-lg transition-all text-center ${
                        stepData.who === option
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-gradient-to-r from-gray-700/50 to-gray-800/50 text-gray-400 hover:bg-white/30'
                      }`}
                    >
                      {option === 'Men' ? <img src={men} alt="Men" className="w-10 h-auto mx-auto mb-1" /> : 
                       option === 'Women' ? <img src={women} alt="Women" className="w-10 h-auto mx-auto mb-1" /> : 
                       <img src={kid} alt="Kids" className="w-10 h-auto mx-auto mb-1" />}
                      <div className="text-xs font-medium">{option}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div className="mb-6">
                <label className="block text-md font-medium text-white mb-3">Category</label>
                <div className="space-y-3">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setStepData((prev) => ({ ...prev, category: category.id, style: null }))
                      }}
                      className={`w-auto display-inline mr-3 text-center py-2 px-2.5 rounded-lg text-sm transition-all ${
                        stepData.category === category.id
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-gradient-to-r from-gray-700/50 to-gray-800/50 text-gray-400'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Selection */}
              {stepData.who && stepData.category && STYLES[stepData.who] && STYLES[stepData.who][stepData.category] && (
                <div className="mb-6">
                  <label className="block text-md font-medium text-white mb-3">Style</label>
                  <div className="space-y-3">
                    {STYLES[stepData.who][stepData.category].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setStepData((prev) => ({ ...prev, style: style.id }))}
                        className={`w-auto display-inline mr-2 text-center py-2 px-2.5 rounded-lg text-sm transition-all ${
                          stepData.style === style.id
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-gradient-to-r from-gray-700/50 to-gray-800/50 text-gray-400'
                        }`}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            
              </div>
            </div>

            {/* Center Panel - Canvas */}
            <div className={`w-full md:flex-1 bg-gradient-to-r from-gray-700/50 to-gray-800/50 flex justify-center p-4 md:p-8 overflow-y-auto flex-1 ${
              mobileView === 'center' ? 'block' : 'hidden md:block'
            }`}>
              <div className="w-full h-full">
                {isGenerating ? (
                  <div className="w-full">
                    <div className="text-center mb-4">
                      <p className="text-white/80 text-sm">
                        Generating try-on image... This may take a few moments.
                      </p>
                    </div>
                    <div className="relative bg-gray-900 rounded-xl border-2 border-white/20 overflow-hidden shadow-lg max-w-2xl mx-auto">
                      <div className="aspect-square flex items-center justify-center">
                        <div className="relative w-16 h-16">
                          <div className="animate-spin rounded-full h-16 w-16 border-2 border-white/20"></div>
                          <div className="animate-spin rounded-full h-16 w-16 border-2 border-transparent border-t-white/80 absolute top-0 left-0" style={{ animationDirection: 'reverse' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : resultImages.length > 0 ? (
                  <div className="w-full">
                    <div className="flex flex-wrap justify-center gap-2">
                      {resultImages.map((imgUrl, index) => (
                        <div key={index} className="max-w-2xl w-full relative group rounded-xl overflow-hidden border-2 border-white/20 hover:border-[var(--color-primary)] transition-all cursor-pointer">
                          <img
                            src={imgUrl}
                            alt={`Generated Result ${index + 1}`}
                            className="w-full h-auto"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    
                    {/* Mobile: Create New Button - Only show when images are generated */}
                    <div className="md:hidden w-full mt-6 px-4">
                      <button
                        onClick={() => {
                          setMobileView('left')
                          resetEverything()
                        }}
                        className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New
                      </button>
                    </div>
                  </div>
                ) : stepData.photoPreview ? (
                  <div className="w-full">
                    <div className="relative bg-gray-900 rounded-xl border-2 border-white/20 overflow-hidden shadow-lg max-w-2xl mx-auto">
                      <img
                        src={stepData.photoPreview}
                        alt="Preview"
                        className="w-full h-auto"
                      />
                      <div className="absolute top-2 left-2 bg-primary text-white text-xs font-medium px-2 py-1 rounded">
                        Input
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white/80 mb-2">Try On Canvas</h3>
                    <p className="text-white/80 text-sm">Your generated try-on image will appear here. Begin by adding your photo in the left panel.</p>
                  </div>
                )}
                {/* Create New Button - Show after successful generation */}
                {!isGenerating && resultImages.length > 0 && (
                  <button
                    onClick={resetEverything}
                    className="w-auto mx-auto mt-8 px-6 py-3 bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2 hidden md:flex"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New
                  </button>
                )}
              </div>
            </div>

            {/* Right Panel - Settings */}
            <div className={`w-full md:w-80 bg-gray-900 border-l border-white/20 overflow-y-auto flex-shrink-0 ${
              mobileView === 'center' ? 'hidden md:block' : 'block'
            } ${isGenerating || resultImages.length > 0 ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="md:p-6 px-6 space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-4">Settings</h2>
                  {/* Photo Upload */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-md font-medium text-white">
                    Your Photo <span className="text-red-500">*</span>
                  </label>
                </div>
                {!stepData.photo && (
                  <p className="text-xs text-red-500 mb-2">Please upload your photo</p>
                )}
                <input
                  ref={fileInputPhotoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handlePhotoUpload(file)
                  }}
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer block">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDraggingPhoto(true)
                    }}
                    onDragLeave={() => setIsDraggingPhoto(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setIsDraggingPhoto(false)
                      const file = e.dataTransfer.files[0]
                      if (file) handlePhotoUpload(file)
                    }}
                    className={`border-2 border-dashed rounded-lg p-4 transition-all ${
                      isDraggingPhoto
                        ? 'border-[var(--color-primary)] bg-primary/10'
                        : 'border-white/30 hover:border-[var(--color-primary)]/50 border-gray-700'
                    }`}
                  >
                    {stepData.photoPreview ? (
                      <img
                        src={stepData.photoPreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center py-4">
                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-xs text-gray-600">Drag & drop or click</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Product Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-md font-medium text-white">Product Image</label>
                </div>
                <input
                  ref={fileInputProductRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleProductUpload(file)
                  }}
                  id="product-upload"
                />
                <label htmlFor="product-upload" className="cursor-pointer block">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDraggingProduct(true)
                    }}
                    onDragLeave={() => setIsDraggingProduct(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setIsDraggingProduct(false)
                      const file = e.dataTransfer.files[0]
                      if (file) handleProductUpload(file)
                    }}
                    className={`border-2 border-dashed rounded-lg p-4 transition-all ${
                      isDraggingProduct
                        ? 'border-[var(--color-primary)] bg-primary/10'
                        : 'border-white/30 hover:border-[var(--color-primary)]/50 border-gray-700'
                    }`}
                  >
                    {stepData.productPreview ? (
                      <img
                        src={stepData.productPreview}
                        alt="Product Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center py-4">
                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-xs text-gray-600">Optional</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
                {/* Generate Button - Bottom of Right Panel */}
                <div className="pt-4 border-t border-white/20">
                  <button
                    onClick={() => {
                      handleGenerate()
                      setMobileView('center')
                    }}
                    disabled={!stepData.photo || !stepData.product || !stepData.who || !stepData.category || !stepData.style || isGenerating}
                    className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}

export default TryOnMe

