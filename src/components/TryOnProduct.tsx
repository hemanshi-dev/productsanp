import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { apiService, type User } from '../services/api'

interface StepData {
  photo: File | null
  photoPreview: string | null
  product: File | null
  productPreview: string | null
  productImageUrl: string | null
}

const TryOnProduct = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const sectionRef = useRef<HTMLDivElement>(null)
  const fileInputPhotoRef = useRef<HTMLInputElement>(null)
  const fileInputProductRef = useRef<HTMLInputElement>(null)

  const [stepData, setStepData] = useState<StepData>({
    photo: null,
    photoPreview: null,
    product: null,
    productPreview: null,
    productImageUrl: null,
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [resultImages, setResultImages] = useState<string[]>([])
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Drag & drop state
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false)
  const [isDraggingProduct, setIsDraggingProduct] = useState(false)

  // User and profile state (same pattern as other pages)
  const [user, setUser] = useState<User | null>(null)
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const [loadingCredits, setLoadingCredits] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
        if (element) element.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }
  }

  // Load user from localStorage on mount
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
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
    return () => window.removeEventListener('refreshCredits', handleRefreshCredits)
  }, [user?.id])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  useEffect(() => {
    setAvatarError(false)
  }, [user?.avatar, user?.picture])

  // Animate entrance
  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      )
    }
  }, [])

  // Handle product image from WordPress plugin OR Chrome extension
  useEffect(() => {
    const productId = searchParams.get('product_id')
    const imageApi = searchParams.get('image_api')
    const productImageUrl = searchParams.get('product_image_url')
    const source = searchParams.get('source')
    
    // Handle Chrome Extension or Shopify direct image URL
    if (productImageUrl && (source === 'chrome_extension' || source === 'shopify_theme_app_extension')) {
      const decodedImageUrl = decodeURIComponent(productImageUrl)
      setStepData(prev => ({
        ...prev,
        productImageUrl: decodedImageUrl,
        productPreview: decodedImageUrl,
      }))
        
      // Clean up URL params
      navigate(location.pathname, { replace: true })
      return
    }
  
    // Handle WordPress plugin proxied image
    if (productId && imageApi) {
      const decodedApi = decodeURIComponent(imageApi)
      const proxyUrl = `${decodedApi}?product_id=${productId}`
    
      setStepData(prev => ({
        ...prev,
        productImageUrl: proxyUrl,
        productPreview: proxyUrl,
      }))
      
      toast.info('Product image loaded from WooCommerce')
      navigate(location.pathname, { replace: true })
    }

  }, [searchParams, navigate, location.pathname])
    

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
        productImageUrl: null,
      }))
    }
  }

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent, type: 'photo' | 'product') => {
    e.preventDefault()
    e.stopPropagation()
    if (type === 'photo') setIsDraggingPhoto(true)
    else setIsDraggingProduct(true)
  }

  const handleDragLeave = (e: React.DragEvent, type: 'photo' | 'product') => {
    e.preventDefault()
    e.stopPropagation()
    if (type === 'photo') setIsDraggingPhoto(false)
    else setIsDraggingProduct(false)
  }

  const handleDrop = (e: React.DragEvent, type: 'photo' | 'product') => {
    e.preventDefault()
    e.stopPropagation()
    if (type === 'photo') setIsDraggingPhoto(false)
    else setIsDraggingProduct(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        if (type === 'photo') handlePhotoUpload(file)
        else handleProductUpload(file)
      } else {
        toast.error('Please drop an image file')
      }
    }
  }

  // Compress image file to WebP format (same approach as existing pages)
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

          if (targetWidth > 1024) scaleWidth = 1024 / targetWidth
          if (targetHeight > 1024) scaleHeight = 1024 / targetHeight

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
          const maxSize = 500 * 1024

          const tryCompress = (quality: number): void => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to compress image'))
                  return
                }
                if (blob.size > maxSize && quality > 0.5) {
                  tryCompress(quality - 0.1)
                } else {
                  const fileName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
                  resolve(new File([blob], fileName, { type: outputType, lastModified: Date.now() }))
                }
              },
              outputType,
              quality
            )
          }

          tryCompress(0.85)
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

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

  // Try to download a product image from URL and wrap as File
  // Updated to handle both proxied and direct URLs
  const urlToFile = async (url: string): Promise<File> => {
    console.log('url', url);
    try {
      const res = await fetch(url, {
        // mode: 'no-cors',
        // credentials: 'omit',
      })
      if (!res.ok) {
        throw new Error(`Failed to fetch product image (status ${res.status})`)
      } 
      const blob = await res.blob()
      const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg'
      return new File([blob], `product.${ext}`, { type: blob.type || 'image/jpeg' })
    } catch (error) {
      console.error('Failed to fetch from URL:', error)
      throw error
    }
  }

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
            const successfulImages = response.data.generated_images
              .filter((img) => img.status === 'success' && img.url)
              .map((img) => img.url)
              .sort((a, b) => {
                const aIndex = response.data!.generated_images!.findIndex((img) => img.url === a)
                const bIndex = response.data!.generated_images!.findIndex((img) => img.url === b)
                return aIndex - bIndex
              })

            if (successfulImages.length > 0) {
              setResultImages(successfulImages)
              window.dispatchEvent(new Event('refreshCredits'))
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
    if (!stepData.photo) {
      toast.error('Please upload your photo')
      return
    }

    // Product can be either uploaded file or a URL passed from WooCommerce/Chrome Extension
    if (!stepData.product && !stepData.productImageUrl) {
      toast.error('Please upload product image')
      return
    }

    const userData = localStorage.getItem('user')
    if (!userData) {
      toast.error('Please login to generate images')
      return
    }

    let userId = ''
    try {
      const u = JSON.parse(userData)
      userId = u.id?.toString() || ''
    } catch {
      toast.error('Invalid user data')
      return
    }
    if (!userId) {
      toast.error('User ID not found')
      return
    }

    setIsGenerating(true)

    try {
      const facePhotoBase64 = await fileToBase64(stepData.photo)

      let productFile: File
      if (stepData.product) {
        productFile = stepData.product
      } else {

        try {
          // The URL could be from WordPress (proxied) or Chrome Extension (direct)
          productFile = await urlToFile(stepData.productImageUrl as string)
        } catch (e: any) {
          console.error('Failed to load product image from URL:', e)
          setIsGenerating(false)
          toast.error('Could not load product image. Please try uploading it manually using the product photo field.')
          return
        }
      }

      const productBase64 = await fileToBase64(productFile)

      const requestData = {
        user_id: userId,
        style_id: '697b494b6538c831a83aab28', // default style for try-on
        user_prompt: 'Try on this product',
        modeling: true,
        type: 'try-on',
        total_image_generation: 1,
        aspect_ratio: '1:1',
        face_id: '',
        face_photo_base64: facePhotoBase64,
        photos_base64: [productBase64],
      }

      const response = await apiService.generateImage(requestData)
      if (response.status && response.data) {
        pollJobStatus(response.data.job_id)
        const interval = setInterval(() => pollJobStatus(response.data!.job_id), 5000)
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

  const downloadImage = async (imgUrl: string, fileName: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    try {
      const response = await fetch(imgUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || 'tryon-image.png'
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error('Error downloading image:', error)
      toast.error('Failed to download image')
    }
  }

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
      if (stepData.photoPreview && stepData.photo) URL.revokeObjectURL(stepData.photoPreview)
      // productPreview can be either object URL or remote URL; only revoke if it was created from file
      if (stepData.productPreview && stepData.product) URL.revokeObjectURL(stepData.productPreview)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="min-h-screen flex flex-col" ref={sectionRef}>
        {/* Top Header Bar (same as other app pages) */}
        <div className="bg-gray-900 text-white border-b border-white/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="md:w-3/12 w-1/2 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Link to="/" className="flex items-center space-x-2 cursor-pointer flex-shrink-0">
                  <img
                    src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/header-logo.png"
                    alt="ProductSnap AI"
                    className="md:h-8 md:h-auto w-auto max-w-[140px] md:max-w-[180px]"
                  />
                </Link>
              </div>
            </div>
            <div className="md:w-3/12 w-1/2 flex items-center gap-4 justify-end">
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
                    <img
                      src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/credit-icon.png"
                      alt="Credit Icon"
                      className="w-auto h-4"
                    />
                  </span>
                  <span className="text-sm font-medium text-white">{loadingCredits ? '...' : userCredits}</span>
                </a>
              )}

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
                    <span className="text-sm text-white hidden lg:block max-w-[120px] truncate">{user.name || user.email}</span>
                    <svg
                      className={`w-4 h-4 text-white transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-900 text-black backdrop-blur-xl border border-white/20 rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="p-2">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-semibold text-white truncate">{user.name || 'User'}</p>
                          <p className="text-xs text-white truncate">{user.email}</p>
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
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-zap"
                              >
                                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                              </svg>
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
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
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
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
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
                          <svg className="w-5 h-5 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
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

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Uploads */}
          <div className={`w-full md:w-[420px] bg-gray-900 border-r border-white/20 overflow-y-auto flex-shrink-0 ${isGenerating || resultImages.length > 0 ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="p-6 space-y-6">
              <h2 className="text-2xl font-semibold text-white">Try On Product</h2>

              {/* Your Photo */}
              <div>
                <label className="block text-md font-medium text-white mb-2">
                  Your Photo <span className="text-red-500">*</span>
                </label>
                <input
                  ref={fileInputPhotoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handlePhotoUpload(file)
                  }}
                  id="tryon-photo-upload"
                />
                <label htmlFor="tryon-photo-upload" className="cursor-pointer block">
                  <div
                    onDragOver={(e) => handleDragOver(e, 'photo')}
                    onDragLeave={(e) => handleDragLeave(e, 'photo')}
                    onDrop={(e) => handleDrop(e, 'photo')}
                    className={`border-2 border-dashed rounded-lg p-4 transition-all ${
                      isDraggingPhoto
                        ? 'border-[var(--color-primary)] bg-primary/10'
                        : 'border-white/30 hover:border-[var(--color-primary)]/50 border-gray-700'
                    }`}
                  >
                    {stepData.photoPreview ? (
                      <img src={stepData.photoPreview} alt="Your Photo" className="w-full h-40 object-cover rounded-lg" />
                    ) : (
                      <div className="text-center py-6">
                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-xs text-gray-400">Drag & drop or click</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Product Photo */}
              <div>
                <label className="block text-md font-medium text-white mb-2">
                  Product Photo <span className="text-red-500">*</span>
                </label>
                <input
                  ref={fileInputProductRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleProductUpload(file)
                  }}
                  id="tryon-product-upload"
                />
                <label htmlFor="tryon-product-upload" className="cursor-pointer block">
                  <div
                    onDragOver={(e) => handleDragOver(e, 'product')}
                    onDragLeave={(e) => handleDragLeave(e, 'product')}
                    onDrop={(e) => handleDrop(e, 'product')}
                    className={`border-2 border-dashed rounded-lg p-4 transition-all ${
                      isDraggingProduct
                        ? 'border-[var(--color-primary)] bg-primary/10'
                        : 'border-white/30 hover:border-[var(--color-primary)]/50 border-gray-700'
                    }`}
                  >
                    {stepData.productPreview ? (
                      <img src={stepData.productPreview} alt="Product" className="w-full h-40 object-cover rounded-lg" />
                    ) : (
                      <div className="text-center py-6">
                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-xs text-gray-400">
                          {stepData.productImageUrl ? 'Product loaded (drag & drop or click to replace)' : 'Drag & drop or click'}
                        </p>
                      </div>
                    )}
                  </div>
                </label>
                {stepData.productImageUrl && !stepData.product && (
                  <p className="text-xs text-gray-400 mt-2">
                    ✓ Product image loaded from external source
                  </p>
                )}
              </div>

              {/* Generate */}
              <div className="pt-4 border-t border-white/20">
                <button
                  onClick={handleGenerate}
                  disabled={!stepData.photo || (!stepData.product && !stepData.productImageUrl) || isGenerating}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  {isGenerating ? 'Generating...' : 'Try On Me'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Preview / Result */}
          <div className="w-full md:flex-1 bg-gradient-to-r from-gray-700/50 to-gray-800/50 flex justify-center p-4 md:p-8 overflow-y-auto">
            <div className="w-full h-full">
              {isGenerating ? (
                <div className="w-full">
                  <div className="text-center mb-4">
                    <p className="text-white/80 text-sm">Generating try-on image... This may take a few moments.</p>
                  </div>
                  <div className="relative bg-gray-900 rounded-xl border-2 border-white/20 overflow-hidden shadow-lg max-w-2xl mx-auto">
                    <div className="aspect-square flex items-center justify-center">
                      <div className="relative w-16 h-16">
                        <div className="animate-spin rounded-full h-16 w-16 border-2 border-white/20"></div>
                        <div
                          className="animate-spin rounded-full h-16 w-16 border-2 border-transparent border-t-white/80 absolute top-0 left-0"
                          style={{ animationDirection: 'reverse' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : resultImages.length > 0 ? (
                <div className="w-full">
                  <div className="flex flex-wrap justify-center gap-2">
                    {resultImages.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="max-w-2xl w-full relative group rounded-xl overflow-hidden border-2 border-white/20 hover:border-[var(--color-primary)] transition-all"
                      >
                        <img src={imgUrl} alt={`Generated Result ${index + 1}`} className="w-full h-auto" />
                        <div className="absolute bottom-3 right-3 flex gap-2 z-20">
                          <button
                            onClick={(e) => downloadImage(imgUrl, `tryon-result-${index + 1}.png`, e)}
                            className="px-3 py-2 bg-primary text-white rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 backdrop-blur-sm"
                            title="Download"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 17V3" />
                              <path d="m6 11 6 6 6-6" />
                              <path d="M19 21H5" />
                            </svg>
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : stepData.photoPreview ? (
                <div className="w-full">
                  <div className="relative bg-gray-900 rounded-xl border-2 border-white/20 overflow-hidden shadow-lg max-w-2xl mx-auto">
                    <img src={stepData.photoPreview} alt="Preview" className="w-full h-auto" />
                    <div className="absolute top-2 left-2 bg-primary text-white text-xs font-medium px-2 py-1 rounded">Input</div>
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
                  <p className="text-white/80 text-sm">Upload your photo and product photo to generate a try-on image.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TryOnProduct