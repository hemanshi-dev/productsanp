// import { useState, useEffect, useRef } from 'react'
// import { gsap } from 'gsap'
// import { apiService, type User } from '../services/api'
// import { toast } from 'react-toastify'
// import JSZip from 'jszip'
// import { useNavigate, useLocation, Link } from 'react-router-dom'

// type Step = 'form' | 'results'

// interface Category {
//   id: string
//   title: string
//   image: string
// }

// interface Banner {
//   id: string
//   title: string
//   image: string
// }

// interface Prompt {
//   id: string
//   title: string
//   image: string
// }

// interface Face {
//   id: string
//   image: string
//   type?: string
// }

// const AIImageGenerator = () => {
//   // Available aspect ratios
//   const aspectRatioMap = [
//     '1:1',
//     '2:3',
//     '3:2',
//     '3:4',
//     '4:3',
//     '4:5',
//     '5:4',
//     '9:16',
//     '16:9',
//     '21:9'
//   ] as const

//   const [currentStep, setCurrentStep] = useState<Step>('form')
//   const [categories, setCategories] = useState<Category[]>([])
//   const [banners, setBanners] = useState<Banner[]>([])
//   const [prompts, setPrompts] = useState<Prompt[]>([])
//   const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
//   const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)
//   const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
//   const [loadingCategories, setLoadingCategories] = useState(false)
//   const [loadingBanners, setLoadingBanners] = useState(false)
//   const [loadingPrompts, setLoadingPrompts] = useState(false)

//   // Form state
//   const [formData, setFormData] = useState({
//     productName: '',
//     mainImage: null as File | null,
//     additionalImage: null as File | null,
//     numberOfImages: '1',
//     imagesWithModel: 'no' as 'yes' | 'no',
//     selectedFaceId: '',
//     customFaceUpload: null as File | null,
//     autoPrompt: '',
//     customPrompt: '',
//     aspectRatio: '1:1',
//   })

//   // Preview URLs for uploaded images
//   const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
//   const [additionalImagePreview, setAdditionalImagePreview] = useState<string | null>(null)
//   const [customFacePreview, setCustomFacePreview] = useState<string | null>(null)

//   // Drag & drop state
//   const [isDraggingMain, setIsDraggingMain] = useState(false)
//   const [isDraggingAdditional, setIsDraggingAdditional] = useState(false)
//   const [isDraggingCustomFace, setIsDraggingCustomFace] = useState(false)

//   // Instruction modal state
//   const [showImageInstructionModal, setShowImageInstructionModal] = useState(false)

//   const [faces, setFaces] = useState<Face[]>([])
//   const [facesByGender, setFacesByGender] = useState<{
//     Men: Face[]
//     Women: Face[]
//     Kid: Face[]
//   }>({
//     Men: [],
//     Women: [],
//     Kid: []
//   })
//   const [loadingFaces, setLoadingFaces] = useState(false)
//   const [showFaceModal, setShowFaceModal] = useState(false)
//   const [selectedFaceInModal, setSelectedFaceInModal] = useState<Face | null>(null)
//   const [faceGenderFilter, setFaceGenderFilter] = useState<'all' | 'Men' | 'Women' | 'Kid'>('all')

//   // Prevent body scroll when face modal is open
//   useEffect(() => {
//     if (showFaceModal) {
//       document.body.style.overflow = 'hidden'
//     } else {
//       document.body.style.overflow = ''
//     }
//     return () => {
//       document.body.style.overflow = ''
//     }
//   }, [showFaceModal])

//   // Prevent body scroll when instruction modal is open
//   useEffect(() => {
//     if (showImageInstructionModal) {
//       document.body.style.overflow = 'hidden'
//     } else {
//       document.body.style.overflow = ''
//     }
//     return () => {
//       document.body.style.overflow = ''
//     }
//   }, [showImageInstructionModal])

//   const [generatedImages, setGeneratedImages] = useState<string[]>([])
//   const [generatedImagesData, setGeneratedImagesData] = useState<Array<{ url: string; id: string; gallery_image_id?: string; path: string; type?: 'image' | 'video'; isGenerating?: boolean; sourceImageId?: string; videoJobId?: string }>>([])
//   const [isGenerating, setIsGenerating] = useState(false)
//   const [jobId, setJobId] = useState<string | null>(null)
//   const [_jobStatus, setJobStatus] = useState<'pending' | 'processing' | 'completed' | 'failed' | 'error' | 'partial_success' | null>(null)
//   const [_statusMessage, setStatusMessage] = useState<string>('')
//   const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
//   // Track currently displayed image during generation (starts with main image, then switches to generated images)
//   const [currentDisplayImage, setCurrentDisplayImage] = useState<string | null>(null)
//   const [generatedImagesInProgress, setGeneratedImagesInProgress] = useState<Array<{ url: string; index: number; status: string }>>([])
//   const [videoGenerating, setVideoGenerating] = useState<{ [key: string]: boolean }>({})
//   const pollingIntervalsRef = useRef<{ [key: string]: NodeJS.Timeout }>({})
//   const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

//   // Prevent body scroll when image view modal is open
//   useEffect(() => {
//     if (selectedImageIndex !== null) {
//       document.body.style.overflow = 'hidden'
//     } else {
//       document.body.style.overflow = ''
//     }
//     return () => {
//       document.body.style.overflow = ''
//     }
//   }, [selectedImageIndex])
//   // Video generation state (similar to image generation)
//   const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
//   const [videoJobId, setVideoJobId] = useState<string | null>(null)
//   const [_videoJobStatus, setVideoJobStatus] = useState<'pending' | 'processing' | 'completed' | 'failed' | 'error' | null>(null)
//   const [_videoSourceImageId, setVideoSourceImageId] = useState<string | null>(null)
//   const [videoSourceImageUrl, setVideoSourceImageUrl] = useState<string | null>(null)

//   const sectionRef = useRef<HTMLDivElement>(null)

//   // Helper functions for user profile
//   const getInitial = (name?: string, email?: string) => {
//     if (name) return name.charAt(0).toUpperCase()
//     if (email) return email.charAt(0).toUpperCase()
//     return 'U'
//   }

//   const handleLogout = () => {
//     localStorage.removeItem('user')
//     setUser(null)
//     setUserCredits(null)
//     navigate('/')
//     window.location.reload()
//   }

//   const scrollToSection = (sectionId: string) => {
//     if (location.pathname !== '/') {
//       navigate(`/#${sectionId}`)
//     } else {
//       window.history.replaceState(null, '', `/#${sectionId}`)
//       setTimeout(() => {
//         const element = document.getElementById(sectionId)
//         if (element) {
//           element.scrollIntoView({ behavior: 'smooth' })
//         }
//       }, 50)
//     }
//   }

//   // User credits state
//   const [userCredits, setUserCredits] = useState<number | null>(null)
//   const [loadingCredits, setLoadingCredits] = useState(false)

//   // User and profile state
//   const navigate = useNavigate()
//   const location = useLocation()
//   const [user, setUser] = useState<User | null>(null)
//   const [showDropdown, setShowDropdown] = useState(false)
//   const [avatarError, setAvatarError] = useState(false)
//   const dropdownRef = useRef<HTMLDivElement>(null)

//   // Calculate required credits (15 credits per image)
//   const creditsPerImage = 10
//   const numberOfImages = parseInt(formData.numberOfImages) || 1
//   const requiredCredits = numberOfImages * creditsPerImage
//   const hasSufficientCredits = userCredits !== null && userCredits >= requiredCredits

//   // Load user from localStorage on mount
//   useEffect(() => {
//     const userData = localStorage.getItem('user')
//     if (userData) {
//       try {
//         const parsedUser = JSON.parse(userData)
//         if (parsedUser.picture && !parsedUser.avatar) {
//           parsedUser.avatar = parsedUser.picture
//         }
//         setUser(parsedUser)
//       } catch (error) {
//         console.error('Error parsing user data:', error)
//       }
//     }
//   }, [])

//   // Fetch user credits on mount and when user changes
//   useEffect(() => {
//     const fetchUserCredits = async () => {
//       if (user?.id) {
//         try {
//           setLoadingCredits(true)
//           const response = await apiService.getProfile(user.id)
//           if (response.status && response.user?.credits !== undefined) {
//             setUserCredits(response.user.credits)
//           }
//           // Update avatar if profile has picture and user doesn't have avatar
//           if (response.user?.picture && !user.avatar) {
//             const updatedUser = {
//               ...user,
//               avatar: response.user.picture,
//               picture: response.user.picture
//             }
//             setUser(updatedUser)
//             localStorage.setItem('user', JSON.stringify(updatedUser))
//           }
//         } catch (error) {
//           console.error('Error fetching user credits:', error)
//         } finally {
//           setLoadingCredits(false)
//         }
//       } else {
//         setUserCredits(null)
//       }
//     }
//     fetchUserCredits()
//   }, [user?.id, user?.avatar])

//   // Listen for credit refresh events
//   useEffect(() => {
//     const handleRefreshCredits = () => {
//       if (user?.id) {
//         const fetchUserCredits = async () => {
//           try {
//             setLoadingCredits(true)
//             const response = await apiService.getProfile(user.id)
//             if (response.status && response.user?.credits !== undefined) {
//               setUserCredits(response.user.credits)
//             }
//           } catch (error) {
//             console.error('Error fetching user credits:', error)
//           } finally {
//             setLoadingCredits(false)
//           }
//         }
//         fetchUserCredits()
//       }
//     }

//     window.addEventListener('refreshCredits', handleRefreshCredits)
//     return () => {
//       window.removeEventListener('refreshCredits', handleRefreshCredits)
//     }
//   }, [user?.id])

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setShowDropdown(false)
//       }
//     }

//     if (showDropdown) {
//       document.addEventListener('mousedown', handleClickOutside)
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside)
//     }
//   }, [showDropdown])

//   // Reset avatar error when user changes
//   useEffect(() => {
//     setAvatarError(false)
//   }, [user?.id, user?.avatar, user?.picture])

//   // Fetch categories on mount and auto-select first category
//   useEffect(() => {
//     const fetchCategories = async () => {
//       setLoadingCategories(true)
//       try {
//         const response = await apiService.getUserCategories(50)
//         if (response.status && response.data) {
//           const categoriesData = response.data.categories
//           setCategories(categoriesData)
//           // Auto-select first category (Product Photoshoot or first available)
//           if (categoriesData.length > 0) {
//             const firstCategory = categoriesData.find(cat => 
//               cat.title.toLowerCase().includes('product') || 
//               cat.title.toLowerCase().includes('photoshoot')
//             ) || categoriesData[0]
//             setSelectedCategory(firstCategory)
//           }
//         } else {
//           toast.error('Failed to load categories')
//         }
//       } catch (error: any) {
//         console.error('Error fetching categories:', error)
//         toast.error(error.message || 'Failed to load categories')
//       } finally {
//         setLoadingCategories(false)
//       }
//     }
//     fetchCategories()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   // Fetch banners when category is selected
//   useEffect(() => {
//     if (selectedCategory) {
//       const fetchBanners = async () => {
//         setLoadingBanners(true)
//         try {
//           const response = await apiService.getUserBanners(selectedCategory.id, 50)
//           if (response.status && response.data) {
//             setBanners(response.data.banners)
//             // Auto-select first banner if available and no banner is selected
//             if (response.data.banners.length > 0) {
//               setSelectedBanner(response.data.banners[0])
//             }
//           } else {
//             toast.error('Failed to load banners')
//           }
//         } catch (error: any) {
//           console.error('Error fetching banners:', error)
//           toast.error(error.message || 'Failed to load banners')
//         } finally {
//           setLoadingBanners(false)
//         }
//       }
//       fetchBanners()
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedCategory?.id])

//   // Fetch prompts when banner is selected
//   useEffect(() => {
//     if (selectedBanner && selectedCategory) {
//       const fetchPrompts = async () => {
//         setLoadingPrompts(true)
//         try {
//           const response = await apiService.getUserPrompts(selectedBanner.id, selectedCategory.id, 50)
//           if (response.status && response.data) {
//             const promptsData = response.data.prompts || []
//             setPrompts(promptsData)
//             // Auto-select first prompt if available
//             if (promptsData.length > 0) {
//               setSelectedPrompt(promptsData[0])
//               setFormData((prev) => ({ ...prev, autoPrompt: promptsData[0].title }))
//             } else if (selectedBanner) {
//               // If no prompts, create dummy prompt from banner
//               const dummyPrompt: Prompt = {
//                 id: selectedBanner.id,
//                 title: selectedBanner.title,
//                 image: selectedBanner.image
//               }
//               setSelectedPrompt(dummyPrompt)
//               setFormData((prev) => ({ ...prev, autoPrompt: selectedBanner.title }))
//             }
//           } else {
//             toast.error('Failed to load prompts')
//           }
//         } catch (error: any) {
//           console.error('Error fetching prompts:', error)
//           toast.error(error.message || 'Failed to load prompts')
//         } finally {
//           setLoadingPrompts(false)
//         }
//       }
//       fetchPrompts()
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedBanner?.id, selectedCategory?.id])

//   // Fetch prompts when banner is selected (handled in handleBannerSelect to avoid duplicate calls)

//   // Compress image file to WebP format with size constraints (similar to AddCategory.tsx)
//   const compressImageFile = async (file: File): Promise<File> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader()
//       reader.onload = (e) => {
//         const img = new Image()
//         img.onload = () => {
//           // Target dimensions - don't scale up if less than 512, scale down if greater than 1024
//           let targetWidth = img.width
//           let targetHeight = img.height

//           // Calculate scale factors for width and height constraints
//           let scaleWidth = 1
//           let scaleHeight = 1

//           // If width is greater than 1024, calculate scale to reduce to 1024
//           if (targetWidth > 1024) {
//             scaleWidth = 1024 / targetWidth
//           }
//           // If width is less than 512, don't scale up (keep original)
//           // No action needed - scaleWidth remains 1

//           // If height is greater than 1024, calculate scale to reduce to 1024
//           if (targetHeight > 1024) {
//             scaleHeight = 1024 / targetHeight
//           }
//           // If height is less than 512, don't scale up (keep original)
//           // No action needed - scaleHeight remains 1

//           // Use the smaller scale to ensure both dimensions are within limits
//           const finalScale = Math.min(scaleWidth, scaleHeight)

//           // Apply scale only if we need to scale down (scale < 1)
//           if (finalScale < 1) {
//             targetWidth = Math.round(targetWidth * finalScale)
//             targetHeight = Math.round(targetHeight * finalScale)
//           }
//           // If scale is 1, keep original dimensions (don't scale up)

//           // Create canvas with target dimensions
//           const canvas = document.createElement('canvas')
//           canvas.width = targetWidth
//           canvas.height = targetHeight
//           const ctx = canvas.getContext('2d')

//           if (!ctx) {
//             reject(new Error('Could not get canvas context'))
//             return
//           }

//           // Enable high quality scaling
//           ctx.imageSmoothingEnabled = true
//           ctx.imageSmoothingQuality = 'high'
//           ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

//           // Convert to WebP format with quality adjustment to meet 500KB limit
//           const outputType = 'image/webp'
//           let quality = 0.85 // Start with 85% quality

//           const tryCompress = (currentQuality: number): void => {
//             canvas.toBlob(
//               (blob) => {
//                 if (!blob) {
//                   reject(new Error('Failed to compress image'))
//                   return
//                 }

//                 const maxSize = 500 * 1024 // 500KB in bytes

//                 // If file size is still too large and quality can be reduced, try again
//                 if (blob.size > maxSize && currentQuality > 0.5) {
//                   // Reduce quality by 0.1 and try again
//                   tryCompress(currentQuality - 0.1)
//                 } else {
//                   // File size is acceptable or quality is at minimum
//                   const fileName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
//                   const compressedFile = new File([blob], fileName, {
//                     type: outputType,
//                     lastModified: Date.now()
//                   })

//                   resolve(compressedFile)
//                 }
//               },
//               outputType,
//               currentQuality
//             )
//           }

//           tryCompress(quality)
//         }
//         img.onerror = () => reject(new Error('Failed to load image'))
//         img.src = e.target?.result as string
//       }
//       reader.onerror = () => reject(new Error('Failed to read file'))
//       reader.readAsDataURL(file)
//     })
//   }

//   // Convert file to base64 (with compression)
//   const fileToBase64 = async (file: File): Promise<string> => {
//     // First compress the file to meet size requirements (512-1024 width, <500KB)
//     const compressedFile = await compressImageFile(file)
    
//     // Then convert compressed file to base64
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader()
//       reader.onload = (e) => {
//         const base64 = e.target?.result as string
//         const base64Data = base64.includes(',') ? base64.split(',')[1] : base64
//         resolve(base64Data)
//       }
//       reader.onerror = reject
//       reader.readAsDataURL(compressedFile)
//     })
//   }

//   // Reset form data (left and right panels) while keeping generated images
//   const resetFormData = () => {
//     // Reset form inputs
//     setFormData({
//       productName: '',
//       mainImage: null,
//       additionalImage: null,
//       numberOfImages: '1',
//       imagesWithModel: 'no' as 'yes' | 'no',
//       selectedFaceId: '',
//       customFaceUpload: null,
//       autoPrompt: '',
//       customPrompt: '',
//       aspectRatio: '1:1',
//     })

//     // Clear image previews
//     if (mainImagePreview) {
//       URL.revokeObjectURL(mainImagePreview)
//       setMainImagePreview(null)
//     }
//     if (additionalImagePreview) {
//       URL.revokeObjectURL(additionalImagePreview)
//       setAdditionalImagePreview(null)
//     }
//     if (customFacePreview) {
//       URL.revokeObjectURL(customFacePreview)
//       setCustomFacePreview(null)
//     }

//     // Reset drag states
//     setIsDraggingMain(false)
//     setIsDraggingAdditional(false)
//     setIsDraggingCustomFace(false)
//   }

//   // Poll job status - continues every 5 seconds until success or error
//   const pollJobStatus = async (jobId: string) => {
//     try {
//       const response = await apiService.checkImageGenerationStatus(jobId)

//       // Check if API response itself indicates an error
//       if (!response.status) {
//         // Stop polling on API error
//         if (pollingIntervalRef.current) {
//           clearInterval(pollingIntervalRef.current)
//           pollingIntervalRef.current = null
//         }
//         setIsGenerating(false)
//         setJobStatus('error')
//         setStatusMessage('Failed to check job status')
//         toast.error('Request failed. Your image generation may still be processing in the background. Please check "My Generation" list or try again later - the server might be busy.', {
//           autoClose: 8000,
//         })
//         return
//       }

//       if (response.data) {
//         const dataStatus = response.data.status
//         setJobStatus(dataStatus)
//         setStatusMessage(response.data.status_message || 'Processing your images...')

//         // Update generated images as they come in (even during processing)
//         if (response.data.generated_images && response.data.generated_images.length > 0) {
//           const sortedImages = response.data.generated_images
//             .sort((a, b) => a.index - b.index)
          
//           // Track images with their status
//           const imagesInProgress = sortedImages.map(img => ({
//             url: img.url || '',
//             index: img.index,
//             status: img.status || 'in_progress'
//           }))
//           setGeneratedImagesInProgress(imagesInProgress)

//           // Find the latest completed image to display (show the most recent one)
//           const completedImages = sortedImages.filter(img => img.status === 'success' && img.url)
//           if (completedImages.length > 0) {
//             // Show the latest completed image
//             const latestImage = completedImages[completedImages.length - 1]
//             if (latestImage.url) {
//               setCurrentDisplayImage(latestImage.url)
//             }
//           } else {
//             // If no completed images yet, show main image
//             setCurrentDisplayImage(mainImagePreview)
//           }
//         } else {
//           // If no images in response yet, show main image
//           if (!currentDisplayImage) {
//             setCurrentDisplayImage(mainImagePreview)
//           }
//         }

//         // Stop polling when status is 'completed', 'partial_success', 'failed', or 'error'
//         if (dataStatus === 'completed' || dataStatus === 'partial_success') {
//           // Stop polling
//           if (pollingIntervalRef.current) {
//             clearInterval(pollingIntervalRef.current)
//             pollingIntervalRef.current = null
//           }

//           // Extract image URLs and data (only successful images)
//           if (response.data.generated_images && response.data.generated_images.length > 0) {
//             // Filter out failed images - only include successful ones with valid URLs
//             const successfulImages = response.data.generated_images
//               .filter(img => img.status === 'success' && img.url !== null && img.url !== undefined)
//               .sort((a, b) => a.index - b.index)
            
//             const imageUrls = successfulImages.map(img => img.url)
//             const imageData = successfulImages.map(img => ({
//               url: img.url,
//               id: img.image_id || img.id || img.path, // Use image_id from API response, fallback to id or path
//               gallery_image_id: img.gallery_image_id || undefined, // Store gallery_image_id for video generation
//               path: img.path,
//               type: 'image' as const
//             }))
//             setGeneratedImages(imageUrls)
//             setGeneratedImagesData(imageData)
//             setIsGenerating(false)

//             // Reset left and right panels after successful generation
//             resetFormData()

//             // Refresh credits in navbar after successful generation
//             window.dispatchEvent(new Event('refreshCredits'))

//             // Check if there were any failures
//             if (response.data.failed_count > 0) {
//               toast.warning(`${response.data.success_count} image(s) generated successfully, but ${response.data.failed_count} failed.`, {
//                 autoClose: 6000,
//               })
//             } else {
//               // toast.success('Images generated successfully!')
//             }
//           } else {
//             // If completed but no images, show error
//             setIsGenerating(false)
//             toast.error('Generation completed but no images were returned')
//           }
//         } else if (dataStatus === 'failed' || dataStatus === 'error') {
//           // Stop polling on failure or error
//           if (pollingIntervalRef.current) {
//             clearInterval(pollingIntervalRef.current)
//             pollingIntervalRef.current = null
//           }
//           setIsGenerating(false)

//           // Build detailed error message
//           let errorMessage = response.data.status_message || (dataStatus === 'error' ? 'Image generation encountered an error' : 'Image generation failed')

//           // Add detailed error information if available
//           const errorDetails: string[] = []

//           if (response.data.errors && response.data.errors.length > 0) {
//             errorDetails.push(...response.data.errors)
//           }

//           if (response.data.failed_images && response.data.failed_images.length > 0) {
//             const failedDetails = response.data.failed_images
//               .map(img => `Image ${img.index}: ${img.error}`)
//             errorDetails.push(...failedDetails)
//           }

//           // Show error count if available
//           if (response.data.failed_count > 0 && response.data.total_requested > 0) {
//             errorMessage = `${errorMessage} (${response.data.failed_count} of ${response.data.total_requested} failed)`
//           }

//           // Show main error message
//           toast.error(errorMessage, {
//             autoClose: 6000,
//           })

//           // Show detailed errors if available
//           if (errorDetails.length > 0) {
//             // Show first error detail as a separate toast
//             setTimeout(() => {
//               toast.error(errorDetails[0], {
//                 autoClose: 5000,
//               })
//             }, 1000)

//             // If multiple errors, show count
//             if (errorDetails.length > 1) {
//               setTimeout(() => {
//                 toast.info(`${errorDetails.length - 1} more error(s). Check console for details.`, {
//                   autoClose: 4000,
//                 })
//               }, 2000)
//             }
//           }

//           // Log all errors to console for debugging
//           if (errorDetails.length > 0) {
//             console.error('Image generation errors:', errorDetails)
//           }
//         }
//         // If status is 'pending' or 'processing', continue polling (don't stop)
//       }
//     } catch (error: any) {
//       console.error('Error checking job status:', error)
//       // Stop polling on network/API errors
//       if (pollingIntervalRef.current) {
//         clearInterval(pollingIntervalRef.current)
//         pollingIntervalRef.current = null
//       }
//       setIsGenerating(false)
//       setJobStatus('error')
//       setStatusMessage('Failed to check job status')
      
//       // Check if error message contains "Request failed" or similar network errors
//       const errorMessage = error.message || error.toString() || ''
//       const isNetworkError = errorMessage.toLowerCase().includes('request failed') || 
//                             errorMessage.toLowerCase().includes('network error') ||
//                             errorMessage.toLowerCase().includes('failed to fetch') ||
//                             error.code === 'ERR_NETWORK' ||
//                             error.response?.status >= 500
      
//       if (isNetworkError) {
//         toast.error('Request failed. Your image generation may still be processing in the background. Please check "My Generation" list or try again later - the server might be busy.', {
//           autoClose: 8000,
//         })
//       } else {
//         toast.error('Failed to check job status. Your image generation may still be processing. Please check "My Generation" list or try again later.', {
//           autoClose: 8000,
//         })
//       }
//     }
//   }

//   // Cleanup polling on unmount
//   useEffect(() => {
//     return () => {
//       if (pollingIntervalRef.current) {
//         clearInterval(pollingIntervalRef.current)
//         pollingIntervalRef.current = null
//       }
//     }
//   }, [])

//   // Animate section entrance and card hovers
//   useEffect(() => {
//     // Animate section entrance
//     if (sectionRef.current) {
//       gsap.fromTo(
//         sectionRef.current,
//         { opacity: 0, y: 20 },
//         { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
//       )
//     }

//     // Add hover animations to cards
//     const cards = document.querySelectorAll('.category-card, .glass-effect')
//     cards.forEach((card) => {
//       card.addEventListener('mouseenter', () => {
//         gsap.to(card, {
//           scale: 1.05,
//           y: -5,
//           duration: 0.3,
//           ease: 'power2.out'
//         })
//       })
//       card.addEventListener('mouseleave', () => {
//         gsap.to(card, {
//           scale: 1,
//           y: 0,
//           duration: 0.3,
//           ease: 'power2.out'
//         })
//       })
//     })

//     return () => {
//       cards.forEach((card) => {
//         card.removeEventListener('mouseenter', () => { })
//         card.removeEventListener('mouseleave', () => { })
//       })
//     }
//   }, [currentStep, isGenerating])

//   // Scroll to generating section when it appears
//   useEffect(() => {
//     if (isGenerating && sectionRef.current) {
//       // Small delay to ensure the section is rendered
//       setTimeout(() => {
//         sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
//       }, 100)
//     }
//   }, [isGenerating])

//   // Fetch all faces when modal opens and group by gender (single API call with pagination)
//   useEffect(() => {
//     if (showFaceModal) {
//       // If faces are already loaded, just group them
//       if (faces.length > 0 && (facesByGender.Men.length === 0 && facesByGender.Women.length === 0 && facesByGender.Kid.length === 0)) {
//         const grouped: {
//           Men: Face[]
//           Women: Face[]
//           Kid: Face[]
//         } = {
//           Men: [],
//           Women: [],
//           Kid: []
//         }

//         faces.forEach(face => {
//           // Normalize type to handle both lowercase and capitalized values from API
//           const type = face.type ? face.type.charAt(0).toUpperCase() + face.type.slice(1).toLowerCase() : 'Other'
//           if (type === 'Men') {
//             grouped.Men.push(face)
//           } else if (type === 'Women') {
//             grouped.Women.push(face)
//           } else if (type === 'Kid') {
//             grouped.Kid.push(face)
//           } else {
//           }
//         })

//         setFacesByGender(grouped)
//       } else if (faces.length === 0) {
//         // Fetch faces if not loaded
//         const fetchAllFaces = async () => {
//           setLoadingFaces(true)
//           try {
//             let allFaces: Face[] = []
//             let cursor: string | undefined = undefined
//             let hasMore = true

//             // Fetch all faces with pagination in a single flow
//             while (hasMore) {
//               const response = await apiService.getUserFaces(50, cursor)
//               if (response.status && response.data) {
//                 allFaces = [...allFaces, ...response.data.faces]
//                 hasMore = response.data.pagination.has_more
//                 cursor = response.data.pagination.next_cursor || undefined
//               } else {
//                 hasMore = false
//               }
//             }

//             // Group faces by gender after fetching all
//             const grouped: {
//               Men: Face[]
//               Women: Face[]
//               Kid: Face[]
//             } = {
//               Men: [],
//               Women: [],
//               Kid: []
//             }

//             allFaces.forEach(face => {
//               // Normalize type to handle both lowercase and capitalized values from API
//               const type = face.type ? face.type.charAt(0).toUpperCase() + face.type.slice(1).toLowerCase() : 'Other'
//               if (type === 'Men') {
//                 grouped.Men.push(face)
//               } else if (type === 'Women') {
//                 grouped.Women.push(face)
//               } else if (type === 'Kid') {
//                 grouped.Kid.push(face)
//               } else {
//               }
//             })

//             setFaces(allFaces)
//             setFacesByGender(grouped)
//           } catch (error: any) {
//             console.error('Error fetching models:', error)
//             toast.error(error.message || 'Failed to load models')
//           } finally {
//             setLoadingFaces(false)
//           }
//         }
//         fetchAllFaces()
//       }
//     }
//   }, [showFaceModal, faces.length, facesByGender])

//   // Cleanup polling intervals on unmount
//   useEffect(() => {
//     return () => {
//       Object.values(pollingIntervalsRef.current).forEach(interval => {
//         if (interval) clearInterval(interval)
//       })
//     }
//   }, [])

//   // Cleanup preview URLs on unmount
//   useEffect(() => {
//     return () => {
//       if (mainImagePreview) URL.revokeObjectURL(mainImagePreview)
//       if (additionalImagePreview) URL.revokeObjectURL(additionalImagePreview)
//       if (customFacePreview) URL.revokeObjectURL(customFacePreview)
//     }
//   }, [])

//   // Show processing view when generating - continues until success
//   const VIDEO_LOADING_MESSAGES = [
//     'Generating your video...',
//     'Please wait a few seconds more...',
//     'Creating video with AI...',
//     'Processing video...',
//     'Almost there...',
//     'Finalizing your video...'
//   ]
//   const [currentVideoMessageIndex, setCurrentVideoMessageIndex] = useState(0)

//   // Dashboard state for collapsible sections
//   const [expandedSections, setExpandedSections] = useState<{
//     category: boolean
//     subcategory: boolean
//     prompts: boolean
//     output: boolean
//     model: boolean
//     images: boolean
//     prompt: boolean
//   }>({
//     category: true,
//     subcategory: false,
//     prompts: false,
//     output: true,
//     model: true,
//     images: true,
//     prompt: true,
//   })

//   const toggleSection = (section: keyof typeof expandedSections) => {
//     setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
//   }

//   // Rotate through messages with fade effect for video generation
//   useEffect(() => {
//     if (!isGeneratingVideo || !videoJobId) return

//     const interval = setInterval(() => {
//       setCurrentVideoMessageIndex((prev) => (prev + 1) % VIDEO_LOADING_MESSAGES.length)
//     }, 2000) // Change message every 2 seconds

//     return () => clearInterval(interval)
//   }, [isGeneratingVideo, videoJobId])

//   // Poll video generation status - defined early to avoid hoisting issues
//   const pollVideoStatus = async (jobId: string, imageId: string, videoPlaceholderId?: string) => {
//     const poll = async () => {
//       try {
//         const response = await apiService.checkVideoGenerationStatus(jobId)
        
//         if (response.status && response.data) {
//           const videoStatus = response.data.status as string
//           const statusToSet = videoStatus === 'partial_success' ? 'completed' : (videoStatus as 'pending' | 'processing' | 'completed' | 'failed' | 'error' | null)
//           setVideoJobStatus(statusToSet)

//           if (videoStatus === 'completed' || videoStatus === 'partial_success') {
//             // Video generation completed
//             if (response.data.generated_videos && response.data.generated_videos.length > 0) {
//               const videoUrl = response.data.generated_videos[0].url
//               if (videoUrl) {
//                 // Find the video placeholder by videoPlaceholderId, or by isGenerating flag and videoJobId
//                 let videoPlaceholderIndex = -1
//                 if (videoPlaceholderId) {
//                   videoPlaceholderIndex = generatedImagesData.findIndex(img => img.id === videoPlaceholderId)
//                 }
//                 if (videoPlaceholderIndex === -1) {
//                   // Try to find by isGenerating flag and videoJobId
//                   videoPlaceholderIndex = generatedImagesData.findIndex(img => 
//                     img.type === 'video' && 
//                     img.isGenerating === true && 
//                     img.videoJobId === jobId
//                   )
//                 }
                
//                 if (videoPlaceholderIndex !== -1) {
//                   // Update the existing video placeholder
//                   const newGeneratedImages = [...generatedImages]
//                   const newGeneratedImagesData = [...generatedImagesData]
//                   // Replace placeholder image URL with actual video URL
//                   newGeneratedImages[videoPlaceholderIndex] = videoUrl
//                   // Update image data with video URL and mark as completed
//                   newGeneratedImagesData[videoPlaceholderIndex] = {
//                     ...newGeneratedImagesData[videoPlaceholderIndex],
//                     url: videoUrl,
//                     type: 'video' as const,
//                     isGenerating: false, // Mark as completed
//                     videoJobId: undefined // Clear job ID
//                   }
//                   setGeneratedImages(newGeneratedImages)
//                   setGeneratedImagesData(newGeneratedImagesData)
//                 } else {
//                   // Fallback: try to find by source image ID
//                   const videoIndex = generatedImagesData.findIndex((img, idx) => img.id === imageId && img.type !== 'video')
//                   if (videoIndex !== -1) {
//                     // Add video as new item after the source image
//                     const newGeneratedImages = [...generatedImages]
//                     const newGeneratedImagesData = [...generatedImagesData]
//                     newGeneratedImages.splice(videoIndex + 1, 0, videoUrl)
//                     newGeneratedImagesData.splice(videoIndex + 1, 0, {
//                       url: videoUrl,
//                       id: `video-${imageId}-${Date.now()}`,
//                       path: generatedImagesData[videoIndex]?.path || '',
//                       type: 'video' as const
//                     })
//                     setGeneratedImages(newGeneratedImages)
//                     setGeneratedImagesData(newGeneratedImagesData)
//                   } else {
//                     // Add as new item at the end
//                     const sourceImageData = generatedImagesData.find(img => img.id === imageId)
//                     setGeneratedImages(prev => [...prev, videoUrl])
//                     setGeneratedImagesData(prev => [...prev, {
//                       url: videoUrl,
//                       id: `video-${imageId}-${Date.now()}`,
//                       path: sourceImageData?.path || '',
//                       type: 'video' as const
//                     }])
//                   }
//                 }
                
//                 // toast.success('Video generated successfully!')
                
//                 // Hide main video placeholder immediately after video is added to grid
//                 setIsGeneratingVideo(false)
//                 setVideoJobId(null)
//                 setVideoSourceImageUrl(null)
//                 setVideoSourceImageId(null)
//                 setVideoJobStatus(null)
//               }
//             }
            
//             // Stop polling
//             if (pollingIntervalsRef.current[jobId]) {
//               clearInterval(pollingIntervalsRef.current[jobId])
//               delete pollingIntervalsRef.current[jobId]
//             }
//             setVideoGenerating(prev => ({ ...prev, [imageId]: false }))
//             // Ensure main placeholder is hidden (in case video wasn't added above)
//             setIsGeneratingVideo(false)
//             setVideoJobId(null)
//             setVideoJobStatus(null)
//             setVideoSourceImageId(null)
//             setVideoSourceImageUrl(null)
//           } else if (videoStatus === 'failed' || videoStatus === 'error') {
//             // Video generation failed
//             toast.error('Video generation failed')
//             if (pollingIntervalsRef.current[jobId]) {
//               clearInterval(pollingIntervalsRef.current[jobId])
//               delete pollingIntervalsRef.current[jobId]
//             }
//             setVideoGenerating(prev => ({ ...prev, [imageId]: false }))
//             setIsGeneratingVideo(false)
//             setVideoJobId(null)
//             setVideoJobStatus(null)
//             setVideoSourceImageId(null)
//             setVideoSourceImageUrl(null)
//           } else {
//             // Still processing, continue polling
//             pollingIntervalsRef.current[jobId] = setTimeout(poll, 3000)
//           }
//         } else {
//           // API error, stop polling
//           if (pollingIntervalsRef.current[jobId]) {
//             clearInterval(pollingIntervalsRef.current[jobId])
//             delete pollingIntervalsRef.current[jobId]
//           }
//           setVideoGenerating(prev => ({ ...prev, [imageId]: false }))
//           setIsGeneratingVideo(false)
//           setVideoJobId(null)
//           setVideoJobStatus(null)
//           setVideoSourceImageId(null)
//           setVideoSourceImageUrl(null)
//           toast.error('Failed to check video generation status')
//         }
//       } catch (error) {
//         console.error('Error polling video status:', error)
//         if (pollingIntervalsRef.current[jobId]) {
//           clearInterval(pollingIntervalsRef.current[jobId])
//           delete pollingIntervalsRef.current[jobId]
//         }
//         setVideoGenerating(prev => ({ ...prev, [imageId]: false }))
//         setIsGeneratingVideo(false)
//         setVideoJobId(null)
//         setVideoJobStatus(null)
//         setVideoSourceImageId(null)
//         setVideoSourceImageUrl(null)
//         toast.error('Error checking video generation status')
//       }
//     }

//     // Start polling after 3 seconds
//     pollingIntervalsRef.current[jobId] = setTimeout(poll, 3000)
//   }

//   // Generate video from image - defined early to avoid hoisting issues
//   const handleGenerateVideo = async (imageId: string, e?: React.MouseEvent) => {
//     if (e) {
//       e.preventDefault()
//       e.stopPropagation()
//     }

//     const userData = localStorage.getItem('user')
//     if (!userData) {
//       toast.error('User ID not found')
//       return
//     }

//     let userId: string
//     try {
//       const user = JSON.parse(userData)
//       userId = user.id || user.user_id
//     } catch {
//       toast.error('User ID not found')
//       return
//     }

//     // Find the image data to get gallery_image_id
//     const imageData = generatedImagesData.find(img => img.id === imageId)
//     const galleryImageId = imageData?.gallery_image_id || imageId

//     if (!galleryImageId) {
//       toast.error('Gallery image ID not found')
//       return
//     }

//     if (videoGenerating[imageId]) {
//       toast.info('Video generation already in progress...')
//       return
//     }

//     try {
//       setVideoGenerating(prev => ({ ...prev, [imageId]: true }))

//       const response = await apiService.generateVideo({
//         user_id: userId,
//         image_id: galleryImageId, // Use gallery_image_id for video generation
//         total_video_generation: 1
//       })

//       if (response.status && response.data) {
//         const jobId = response.data.job_id
        
//         // Find the source image URL from generated images
//         const sourceImageData = generatedImagesData.find(img => img.id === imageId || img.gallery_image_id === imageId)
//         // Try multiple ways to find the source image URL
//         let sourceImageUrl = sourceImageData?.url || null
//         if (!sourceImageUrl) {
//           // Try to find by index in generatedImages array
//           const imageIndex = generatedImagesData.findIndex(img => img.id === imageId || img.gallery_image_id === imageId)
//           if (imageIndex !== -1 && generatedImages[imageIndex]) {
//             sourceImageUrl = generatedImages[imageIndex]
//           }
//         }
//         if (!sourceImageUrl) {
//           // Fallback: try to find any image with matching gallery_image_id
//           const matchingIndex = generatedImagesData.findIndex(img => img.gallery_image_id === galleryImageId)
//           if (matchingIndex !== -1 && generatedImages[matchingIndex]) {
//             sourceImageUrl = generatedImages[matchingIndex]
//           }
//         }
        
//         // If still no source image URL, use the first available image as fallback
//         if (!sourceImageUrl && generatedImages.length > 0) {
//           sourceImageUrl = generatedImages[0]
//         }
        
//         // Only proceed if we have a source image URL
//         if (!sourceImageUrl) {
//           toast.error('Source image not found')
//           setVideoGenerating(prev => {
//             const newState = { ...prev }
//             delete newState[imageId]
//             return newState
//           })
//           return
//         }
        
//         // Add video placeholder to generated images immediately
//         const videoPlaceholderId = `video-placeholder-${imageId}-${Date.now()}`
//         setGeneratedImages(prev => [...prev, sourceImageUrl!]) // Use source image as placeholder
//         setGeneratedImagesData(prev => [...prev, {
//           url: sourceImageUrl!,
//           id: videoPlaceholderId,
//           path: sourceImageData?.path || '',
//           type: 'video' as const,
//           isGenerating: true, // Mark as generating
//           sourceImageId: imageId, // Store source image ID to update later
//           videoJobId: jobId // Store job ID for reference
//         }])
        
//         // Set video generation state to show loading screen
//         setIsGeneratingVideo(true)
//         setVideoJobId(jobId)
//         setVideoJobStatus(response.data.status as 'pending' | 'processing')
//         setVideoSourceImageId(imageId)
//         setVideoSourceImageUrl(sourceImageUrl)
        
//         // Switch to form view to show video placeholder
//         setCurrentStep('form')
        
//         // toast.success('Video generation started!')

//         // Start polling for status
//         pollVideoStatus(jobId, imageId, videoPlaceholderId)
//       } else {
//         toast.error(response.message || 'Failed to start video generation')
//         setVideoGenerating(prev => {
//           const newState = { ...prev }
//           delete newState[imageId]
//           return newState
//         })
//         // Reset video generation state
//         setIsGeneratingVideo(false)
//         setVideoJobId(null)
//         setVideoJobStatus(null)
//         setVideoSourceImageId(null)
//         setVideoSourceImageUrl(null)
//       }
//     } catch (error: any) {
//       console.error('Error generating video:', error)
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to generate video'
//       toast.error(errorMessage)
//       setVideoGenerating(prev => {
//         const newState = { ...prev }
//         delete newState[imageId]
//         return newState
//       })
//       // Reset video generation state
//       setIsGeneratingVideo(false)
//       setVideoJobId(null)
//       setVideoJobStatus(null)
//       setVideoSourceImageId(null)
//       setVideoSourceImageUrl(null)
//     }
//   }

//   // Download single image
//   const downloadImage = async (imgUrl: string, fileName: string, e?: React.MouseEvent) => {
//     if (e) {
//       e.preventDefault()
//       e.stopPropagation()
//     }

//     try {
//       const response = await fetch(imgUrl)
//       const blob = await response.blob()
//       const url = URL.createObjectURL(blob)
//       const link = document.createElement('a')
//       link.href = url
//       link.download = fileName || 'image.png'
//       link.style.display = 'none'
//       document.body.appendChild(link)
//       link.click()
//       setTimeout(() => {
//         document.body.removeChild(link)
//         URL.revokeObjectURL(url)
//       }, 100)
//       // toast.success('Image downloaded!')
//     } catch (error) {
//       console.error('Error downloading image:', error)
//       toast.error('Failed to download image')
//     }
//   }

//   const downloadVideo = async (videoUrl: string, fileName: string, e?: React.MouseEvent) => {
//     if (e) {
//       e.preventDefault()
//       e.stopPropagation()
//     }

//     try {
//       const response = await fetch(videoUrl)
//       const blob = await response.blob()
//       const url = URL.createObjectURL(blob)
//       const link = document.createElement('a')
//       link.href = url
//       link.download = fileName || 'video.mp4'
//       link.style.display = 'none'
//       document.body.appendChild(link)
//       link.click()
//       setTimeout(() => {
//         document.body.removeChild(link)
//         URL.revokeObjectURL(url)
//       }, 100)
//       // toast.success('Video downloaded!')
//     } catch (error) {
//       console.error('Error downloading video:', error)
//       toast.error('Failed to download video')
//     }
//   }

//   // Delete image - defined early to avoid hoisting issues
//   const handleDeleteImage = async (imageId: string, e?: React.MouseEvent) => {
//     if (e) {
//       e.preventDefault()
//       e.stopPropagation()
//     }

//     const userData = localStorage.getItem('user')
//     if (!userData) {
//       toast.error('User ID not found')
//       return
//     }

//     let userId: string
//     try {
//       const user = JSON.parse(userData)
//       userId = user.id || user.user_id
//     } catch {
//       toast.error('User ID not found')
//       return
//     }

//     if (window.confirm('Are you sure you want to delete this image?')) {
//       try {
//         const response = await apiService.deleteGalleryImages(userId, [imageId])
//         if (response.status) {
//           // Remove the deleted image from state
//           const imageIndex = generatedImagesData.findIndex(img => 
//             img.gallery_image_id === imageId || img.id === imageId
//           )
          
//           if (imageIndex !== -1) {
//             // Remove from both arrays
//             setGeneratedImages(prev => prev.filter((_, idx) => idx !== imageIndex))
//             setGeneratedImagesData(prev => prev.filter((_, idx) => idx !== imageIndex))
//             // toast.success('Image deleted successfully')
//           } else {
//             // If not found in state, just show success message
//             // toast.success('Image deleted successfully')
//           }
//         } else {
//           toast.error(response.message || 'Failed to delete image')
//         }
//       } catch (error: any) {
//         console.error('Error deleting image:', error)
//         toast.error(error.message || 'Failed to delete image')
//       }
//     }
//   }

//   const handleGenerate = async () => {
//     // Validation
//     if (!formData.mainImage) {
//       toast.error('Please upload a main image')
//       return
//     }

//     if (formData.imagesWithModel === 'yes') {
//       if (!formData.selectedFaceId && !formData.customFaceUpload) {
//         toast.error('Please select a model or upload a your own model')
//         return
//       }
//     }

//     try {
//       setIsGenerating(true)
//       setJobStatus('pending')
//       setStatusMessage('Initializing image generation...')
//       // Set initial display image to main image preview
//       setCurrentDisplayImage(mainImagePreview)
//       setGeneratedImagesInProgress([])

//       // Get user ID from localStorage or context (you may need to adjust this)
//       const userData = localStorage.getItem('user')
//       const userId = userData ? JSON.parse(userData).id : null

//       if (!userId) {
//         toast.error('User not authenticated')
//         setIsGenerating(false)
//         return
//       }

//       // Convert uploaded files to base64 (with compression)
//       let facePhotoBase64 = ''
//       let photosBase64: string[] = []

//       // Compress main image
//       if (formData.mainImage) {
//         setStatusMessage('Compressing main image...')
//         try {
//           const mainImageBase64 = await fileToBase64(formData.mainImage)
//           photosBase64.push(mainImageBase64)
//         } catch (error: any) {
//           console.error('Error compressing main image:', error)
//           toast.error('Failed to compress main image. Please try a different image.')
//           setIsGenerating(false)
//           return
//         }
//       }

//       // Compress additional image if provided
//       if (formData.additionalImage) {
//         setStatusMessage('Compressing additional image...')
//         try {
//           const additionalImageBase64 = await fileToBase64(formData.additionalImage)
//           photosBase64.push(additionalImageBase64)
//         } catch (error: any) {
//           console.error('Error compressing additional image:', error)
//           toast.error('Failed to compress additional image. Please try a different image.')
//           setIsGenerating(false)
//           return
//         }
//       }

//       // Compress custom face upload if provided
//       if (formData.customFaceUpload) {
//         setStatusMessage('Compressing model image...')
//         try {
//           facePhotoBase64 = await fileToBase64(formData.customFaceUpload)
//         } catch (error: any) {
//           console.error('Error compressing model image:', error)
//           toast.error('Failed to compress model image. Please try a different image.')
//           setIsGenerating(false)
//           return
//         }
//       }

//       setStatusMessage('Images compressed. Preparing request...')

//       // Map aspect ratio
//       const aspectRatioMap: { [key: string]: string } = {
//         '1:1': '1:1',
//         '2:3': '2:3',
//         '3:2': '3:2',
//         '3:4': '3:4',
//         '4:3': '4:3',
//         '4:5': '4:5',
//         '5:4': '5:4',
//         '9:16': '9:16',
//         '16:9': '16:9',
//         '21:9': '21:9'

//       }

//       // Prepare API request data
//       if (!selectedCategory || !selectedBanner) {
//         toast.error('Please complete all steps before generating')
//         setIsGenerating(false)
//         return
//       }

//       // Use selectedPrompt if available, otherwise use banner as fallback
//       const promptId = selectedPrompt?.id || selectedBanner.id
//       // Don't include autogenerated prompt (autoPrompt) in user_prompt
//       const basePrompt = selectedPrompt?.title || selectedBanner.title

//       // Combine product title with user prompt (custom prompt)
//       let promptTitle = ''
//       const productTitle = formData.productName?.trim() || ''
//       let userPrompt = formData.customPrompt?.trim() || ''

//       // If Images with Model is "no", add "Product only, no model" to user prompt
//       if (formData.imagesWithModel === 'no') {
//         if (userPrompt) {
//           userPrompt = `Product only, no model, ${userPrompt}`
//         } else {
//           userPrompt = 'Product only, no model'
//         }
//       }

//       if (productTitle && userPrompt) {
//         // Both product title and user prompt exist - combine them
//         promptTitle = `'Product Name': ${productTitle}, 'CustomUser Prompt': ${userPrompt}`
//       } else if (productTitle) {
//         // Only product title exists - combine with base prompt (if available)
//         promptTitle = basePrompt ? `'Product Name': ${productTitle}, 'CustomUser Prompt': ${basePrompt}` : `'Product Name': ${productTitle}`
//       } else if (userPrompt) {
//         // Only user prompt exists
//         promptTitle = userPrompt
//       } else {
//         // Use base prompt as fallback (selected prompt or banner, but not autogenerated)
//         promptTitle = basePrompt || ''
//       }

//       // Determine face_id based on selection
//       let faceId = ''
//       if (formData.imagesWithModel === 'yes') {
//         if (formData.customFaceUpload) {
//           // If custom face is uploaded, we'll use face_photo_base64
//           faceId = ''
//         } else if (formData.selectedFaceId) {
//           faceId = formData.selectedFaceId
//         } else {
//           toast.error('Please select a model or upload a your own model')
//           setIsGenerating(false)
//           return
//         }
//       }

//       // Build dynamic request payload
//       const requestData: any = {
//         user_id: userId,
//         style_id: promptId,
//         user_prompt: promptTitle,
//         modeling: formData.imagesWithModel === 'yes',
//         total_image_generation: parseInt(formData.numberOfImages) || 1,
//         aspect_ratio: aspectRatioMap[formData.aspectRatio] || '1:1',
//         photos_base64: photosBase64,
//       }

//       // Add face-related fields only if modeling is enabled
//       if (formData.imagesWithModel === 'yes') {
//         if (formData.customFaceUpload && facePhotoBase64) {
//           requestData.face_photo_base64 = facePhotoBase64
//         } else if (faceId) {
//           requestData.face_id = faceId
//         }
//       }

//       // Call generate image API
//       const response = await apiService.generateImage(requestData)

//       if (response.status && response.data) {
//         setJobId(response.data.job_id)
//         setJobStatus(response.data.status as 'pending' | 'processing')
//         setStatusMessage('Job created successfully. Processing...')

//         // Update user credits from API response
//         if (response.data.user_credits !== undefined) {
//           setUserCredits(response.data.user_credits)
//           // Refresh credits in navbar after job creation (credits are deducted at this point)
//           window.dispatchEvent(new Event('refreshCredits'))
//         }

//         // Start polling immediately, then every 3 seconds until success
//         // First check immediately
//         pollJobStatus(response.data!.job_id)

//         // Then set up interval to poll every 3 seconds
//         const interval = setInterval(() => {
//           pollJobStatus(response.data!.job_id)
//         }, 5000) // Poll every 3 seconds

//         pollingIntervalRef.current = interval
//       } else {
//         setIsGenerating(false)
//         toast.error(response.message || 'Failed to start image generation')
//       }
//     } catch (error: any) {
//       console.error('Error generating image:', error)
//       setIsGenerating(false)
//       toast.error(error.message || 'Failed to generate images')
//     }
//   }

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'additional' | 'customFace') => {
//     const file = e.target.files?.[0]
//     if (file) {
//       processFile(file, type)
//     }
//   }

//   const processFile = (file: File, type: 'main' | 'additional' | 'customFace') => {
//     // Validate file type
//     if (!file.type.startsWith('image/')) {
//       toast.error('Please upload an image file')
//       return
//     }

//     // Create preview URL
//     const previewUrl = URL.createObjectURL(file)

//     if (type === 'main') {
//       // Clean up previous preview URL
//       if (mainImagePreview) {
//         URL.revokeObjectURL(mainImagePreview)
//       }
//       setFormData({ ...formData, mainImage: file })
//       setMainImagePreview(previewUrl)
//     } else if (type === 'additional') {
//       // Clean up previous preview URL
//       if (additionalImagePreview) {
//         URL.revokeObjectURL(additionalImagePreview)
//       }
//       setFormData({ ...formData, additionalImage: file })
//       setAdditionalImagePreview(previewUrl)
//     } else if (type === 'customFace') {
//       // Clean up previous preview URL
//       if (customFacePreview) {
//         URL.revokeObjectURL(customFacePreview)
//       }
//       setFormData({ ...formData, customFaceUpload: file, selectedFaceId: '' })
//       setCustomFacePreview(previewUrl)
//     }
//   }

//   // Drag & drop handlers
//   const handleDragOver = (e: React.DragEvent, type: 'main' | 'additional' | 'customFace') => {
//     e.preventDefault()
//     e.stopPropagation()
//     if (type === 'main') {
//       setIsDraggingMain(true)
//     } else if (type === 'additional') {
//       setIsDraggingAdditional(true)
//     } else if (type === 'customFace') {
//       setIsDraggingCustomFace(true)
//     }
//   }

//   const handleDragLeave = (e: React.DragEvent, type: 'main' | 'additional' | 'customFace') => {
//     e.preventDefault()
//     e.stopPropagation()
//     if (type === 'main') {
//       setIsDraggingMain(false)
//     } else if (type === 'additional') {
//       setIsDraggingAdditional(false)
//     } else if (type === 'customFace') {
//       setIsDraggingCustomFace(false)
//     }
//   }

//   const handleDrop = (e: React.DragEvent, type: 'main' | 'additional' | 'customFace') => {
//     e.preventDefault()
//     e.stopPropagation()
    
//     if (type === 'main') {
//       setIsDraggingMain(false)
//     } else if (type === 'additional') {
//       setIsDraggingAdditional(false)
//     } else if (type === 'customFace') {
//       setIsDraggingCustomFace(false)
//     }

//     const files = e.dataTransfer.files
//     if (files && files.length > 0) {
//       const file = files[0]
//       processFile(file, type)
//     }
//   }

//   // Dashboard Layout - Main Form View
//   if (currentStep === 'form') {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         <div className="min-h-screen flex flex-col">
//           {/* Top Header Bar */}
//           <div className="bg-white border-b border-gray-200 px-6 py-4">
//             <div className="flex items-center justify-between">
//               <div className="w-1/3 flex items-center gap-4">
//                 <div className="flex items-center gap-2">
//                 <Link
//             to="/"
//             className="flex items-center space-x-2 cursor-pointer flex-shrink-0"
//           >
//                 <img src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/footer-logo.png" alt="ProductSnap AI" className="h-8 md:h-auto w-auto max-w-[140px] md:max-w-[180px]" />
//                   </Link>
//                 </div>
//               </div>
//                {/* Categories in Top Bar */}
//               <div className="w-1/3 flex items-center gap-2 overflow-x-auto flex-1 justify-center">
//                 {loadingCategories ? (
//                   <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)]"></div>
//                 ) : (
//                   <div className="flex items-center gap-2 border border-gray-600/20 rounded-full p-2">
//                     {categories.map((category) => (
//                       <button
//                         key={category.id}
//                         onClick={() => {
//                           setSelectedCategory(category)
//                           setSelectedBanner(null)
//                           setSelectedPrompt(null)
//                           setBanners([])
//                           setPrompts([])
//                         }}
//                         className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
//                           selectedCategory?.id === category.id
//                             ? 'bg-primary text-white'
//                             : 'text-gray-600 hover:bg-gray-200'
//                         }`}
//                       >
//                         {category.title}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//               <div className="w-1/3 flex items-center gap-4 justify-end">
//                 {/* Credits Display */}
//                 {user && userCredits !== null && (
//                   <a
//                     href="/settings#credit-history"
//                     onClick={(e) => {
//                       e.preventDefault()
//                       if (location.pathname === '/settings') {
//                         navigate('/settings#credit-history', { replace: true })
//                         window.dispatchEvent(new CustomEvent('settingsTabChange', { detail: 'credit-history' }))
//                       } else {
//                         navigate('/settings#credit-history')
//                       }
//                     }}
//                     className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
//                   >
//                     <span className="text-sm font-semibold">
//                       <img src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/credit-icon.png" alt="Credit Icon" className="w-auto h-4" />
//                     </span>
//                     <span className="text-sm font-medium text-gray-700">
//                       {loadingCredits ? '...' : userCredits}
//                     </span>
//                   </a>
//                 )}
                
//                 {/* Profile Dropdown */}
//                 {user && (
//                   <div className="relative" ref={dropdownRef}>
//                     <button
//                       onClick={() => setShowDropdown(!showDropdown)}
//                       className="flex items-center space-x-2 lg:space-x-3 px-2 lg:px-3 py-2 rounded-full hover:bg-gray-100 transition-all"
//                     >
//                       {(user.avatar || user.picture) && !avatarError ? (
//                         <img 
//                           src={user.avatar || user.picture} 
//                           alt={user.name || user.email}
//                           className="w-8 h-8 rounded-full object-cover border border-gray-300"
//                           onError={() => setAvatarError(true)}
//                           loading="lazy"
//                           referrerPolicy="no-referrer"
//                         />
//                       ) : (
//                         <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold border border-gray-300">
//                           {getInitial(user.name, user.email)}
//                         </div>
//                       )}
//                       <span className="text-sm text-gray-700 hidden lg:block max-w-[120px] truncate">
//                         {user.name || user.email}
//                       </span>
//                       <svg 
//                         className={`w-4 h-4 text-gray-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
//                         fill="none" 
//                         stroke="currentColor" 
//                         viewBox="0 0 24 24"
//                       >
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                       </svg>
//                     </button>

//                     {/* Dropdown Menu */}
//                     {showDropdown && (
//                       <div className="absolute right-0 mt-2 w-56 bg-white text-black backdrop-blur-xl border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
//                         <div className="p-2">
//                           <div className="px-4 py-3 border-b border-gray-200">
//                             <p className="text-sm font-semibold text-gray-900 truncate">
//                               {user.name || 'User'}
//                             </p>
//                             <p className="text-xs text-gray-600 truncate">
//                               {user.email}
//                             </p>
//                           </div>
//                           <a 
//                             href="/#pricing" 
//                             onClick={(e) => {
//                               e.preventDefault()
//                               scrollToSection('pricing')
//                               setShowDropdown(false)
//                             }}
//                             className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[var(--color-primary)] transition-all text-gray-600 hover:text-white group"
//                           >
//                             <div>
//                               <div className="p-[3px] rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center group-hover:border-white">
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
//                               </div>
//                             </div>
//                             <span className="text-sm font-medium">Top Up Credits</span>
//                           </a>
//                           <a
//                             href="/settings"
//                             onClick={() => setShowDropdown(false)}
//                             className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[var(--color-primary)] transition-all text-gray-600 hover:text-white group"
//                           >
//                             <svg 
//                               className="w-5 h-5 text-[var(--color-primary)] group-hover:text-white" 
//                               fill="none" 
//                               stroke="currentColor" 
//                               viewBox="0 0 24 24"
//                             >
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                             </svg>
//                             <span className="text-sm font-medium">Settings</span>
//                           </a>
//                           <a
//                             href="/gallery"
//                             onClick={() => setShowDropdown(false)}
//                             className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[var(--color-primary)] transition-all text-gray-600 hover:text-white group"
//                           >
//                             <svg 
//                               className="w-5 h-5 text-[var(--color-primary)] group-hover:text-white" 
//                               fill="none" 
//                               stroke="currentColor" 
//                               viewBox="0 0 24 24"
//                             >
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                             </svg>
//                             <span className="text-sm font-medium">My Gallery</span>
//                           </a>
//                           <button
//                             onClick={() => {
//                               setShowDropdown(false)
//                               handleLogout()
//                             }}
//                             className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-red-600 hover:text-white hover:bg-red-500 group"
//                           >
//                             <svg 
//                               className="w-5 h-5 group-hover:text-white" 
//                               fill="none" 
//                               stroke="currentColor" 
//                               viewBox="0 0 24 24"
//                             >
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                             </svg>
//                             <span className="text-sm font-medium">Logout</span>
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}
                
//                 <button
//                   onClick={handleGenerate}
//                   disabled={isGenerating || !hasSufficientCredits || !formData.mainImage}
//                   className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
//                   </svg>
//                   {isGenerating ? 'Generating...' : 'Generate'}
//                 </button>
//               </div>
//             </div>
           
//           </div>

//           {/* Three Panel Layout */}
//           <div className="flex-1 flex overflow-hidden">
//             {/* Left Panel - Inputs */}
//             <div className="w-100 bg-white border-r border-gray-200 overflow-y-auto">
//               <div className="p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-1">Inputs</h2>
                
//                 {/* Subcategories (Banners) */}
//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-3">What you’re creating
//                   </label>
//                   {loadingBanners ? (
//                     <div className="flex items-center justify-center py-4">
//                       <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)]"></div>
//                     </div>
//                   ) : banners.length === 0 ? (
//                     <p className="text-xs text-gray-500">No subcategories available</p>
//                   ) : (
//                     <div className="space-y-2">
//                       {banners.map((banner) => (
//                         <button
//                           key={banner.id}
//                           onClick={() => {
//                             setSelectedBanner(banner)
//                             setSelectedPrompt(null)
//                             setPrompts([])
//                           }}
//                           className={`w-auto display-inline mr-2 text-center py-2 px-2.5 rounded-lg border-2 text-xs transition-all ${
//                             selectedBanner?.id === banner.id
//                               ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
//                               : 'border-gray-200 hover:border-[var(--color-primary)]/50 bg-gray-50'
//                           }`}
//                         >
                         
//                             {banner.title}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* Styles (Prompts) */}
//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-3">Style</label>
//                   {loadingPrompts ? (
//                     <div className="flex items-center justify-center py-4">
//                       <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)]"></div>
//                     </div>
//                   ) : prompts.length === 0 ? (
//                     <p className="text-xs text-gray-500">No styles available</p>
//                   ) : (
//                     <div className="space-y-2">
//                       {prompts.map((prompt) => (
//                         <button
//                           key={prompt.id}
//                           onClick={() => {
//                             setSelectedPrompt(prompt)
//                             setFormData((prev) => ({ ...prev, autoPrompt: prompt.title }))
//                           }}
//                           className={`w-auto display-inline mr-2 text-center py-2 px-2.5 rounded-lg border-2 text-xs transition-all ${
//                             selectedPrompt?.id === prompt.id
//                               ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
//                               : 'border-gray-200 hover:border-[var(--color-primary)]/50 bg-gray-50'
//                           }`}
//                         >
//                           {prompt.title}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* Product Name */}
//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
//                   <input
//                     type="text"
//                     value={formData.productName}
//                     onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
//                     className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-[var(--color-primary)] transition-all"
//                     placeholder="Enter product name"
//                   />
//                 </div>

//                 {/* Main Image Upload */}
//                 <div className="mb-6">
//                   <div className="flex items-center justify-between mb-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                       Main Image <span className="text-red-500">*</span>
//                     </label>
//                     {selectedCategory?.id === '693667ca799d1d1e0cb46b9a' && (
//                       <button
//                         onClick={() => setShowImageInstructionModal(true)}
//                         className="text-xs text-primary hover:underline"
//                       >
//                         Guidelines
//                       </button>
//                     )}
//                   </div>
//                   {!formData.mainImage && (
//                     <p className="text-xs text-red-500 mb-2">Please upload a main image</p>
//                   )}
//                   <input
//                     type="file"
//                     onChange={(e) => handleFileUpload(e, 'main')}
//                     className="hidden"
//                     id="main-image-upload"
//                     accept="image/*"
//                   />
//                   <label htmlFor="main-image-upload" className="cursor-pointer block">
//                     <div
//                       onDragOver={(e) => handleDragOver(e, 'main')}
//                       onDragLeave={(e) => handleDragLeave(e, 'main')}
//                       onDrop={(e) => handleDrop(e, 'main')}
//                       className={`border-2 border-dashed rounded-lg p-4 transition-all ${
//                         isDraggingMain
//                           ? 'border-[var(--color-primary)] bg-primary/10'
//                           : 'border-gray-300 hover:border-[var(--color-primary)]/50 bg-gray-50'
//                       }`}
//                     >
//                       {mainImagePreview ? (
//                         <img src={mainImagePreview} alt="Main image" className="w-full h-32 object-cover rounded-lg" />
//                       ) : (
//                         <div className="text-center py-4">
//                           <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                           </svg>
//                           <p className="text-xs text-gray-600">Drag & drop or click</p>
//                         </div>
//                       )}
//                     </div>
//                   </label>
//                 </div>

//                 {/* Additional Image Upload */}
//                 <div className="mb-6">
//                   <div className="flex items-center justify-between mb-2">
//                     <label className="block text-sm font-medium text-gray-700">Additional Image</label>
//                     {selectedCategory?.id === '693667ca799d1d1e0cb46b9a' && (
//                       <button
//                         onClick={() => setShowImageInstructionModal(true)}
//                         className="text-xs text-primary hover:underline"
//                       >
//                         Guidelines
//                       </button>
//                     )}
//                   </div>
//                   <input
//                     type="file"
//                     onChange={(e) => handleFileUpload(e, 'additional')}
//                     className="hidden"
//                     id="additional-image-upload"
//                     accept="image/*"
//                   />
//                   <label htmlFor="additional-image-upload" className="cursor-pointer block">
//                     <div
//                       onDragOver={(e) => handleDragOver(e, 'additional')}
//                       onDragLeave={(e) => handleDragLeave(e, 'additional')}
//                       onDrop={(e) => handleDrop(e, 'additional')}
//                       className={`border-2 border-dashed rounded-lg p-4 transition-all ${
//                         isDraggingAdditional
//                           ? 'border-[var(--color-primary)] bg-primary/10'
//                           : 'border-gray-300 hover:border-[var(--color-primary)]/50 bg-gray-50'
//                       }`}
//                     >
//                       {additionalImagePreview ? (
//                         <img src={additionalImagePreview} alt="Additional image" className="w-full h-32 object-cover rounded-lg" />
//                       ) : (
//                         <div className="text-center py-4">
//                           <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                           </svg>
//                           <p className="text-xs text-gray-600">Optional</p>
//                         </div>
//                       )}
//                     </div>
//                   </label>
//                 </div>
//               </div>
//             </div>

//             {/* Center Panel - Canvas */}
//             <div className="flex-1 bg-gray-50 flex justify-center p-8 overflow-y-auto">
//               <div className="w-full">
//                 {/* Show video placeholder when video is generating - hide all other images */}
//                 {isGeneratingVideo && videoJobId && videoSourceImageUrl ? (
//                   /* Show video generation placeholder */
//                   <div className="w-full">
//                     <div className="text-center mb-4">
//                       <p className="text-gray-600 text-sm">
//                         Generating video... This may take a few moments.
//                       </p>
//                     </div>
//                     <div className="relative bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg max-w-2xl mx-auto">
//                       <img
//                         src={videoSourceImageUrl}
//                         alt="Video source"
//                         className="w-full h-auto"
//                       />
//                       {/* Video generation overlay */}
//                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
//                         <div className="text-center">
//                           <div className="relative w-16 h-16 mx-auto mb-4">
//                             <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20"></div>
//                             <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-white absolute top-0 left-0" style={{ animationDirection: 'reverse' }}></div>
//                           </div>
//                           <p className="text-white text-sm font-medium">Generating Video...</p>
//                           <p className="text-white/80 text-xs mt-1">Please wait</p>
//                         </div>
//                       </div>
//                       <div className="absolute top-2 left-2 bg-primary text-white text-xs font-medium px-2 py-1 rounded">
//                         Video Processing
//                       </div>
//                     </div>
//                   </div>
//                 ) : generatedImages.length > 0 ? (
//                   /* Show generated images if available */
//                   <div className="flex flex-wrap justify-center gap-2">
//                     {generatedImages.map((imgUrl, index) => {
//                       const imageData = generatedImagesData[index]
//                       // console.log(imageData)
//                       if (!imgUrl || !imageData?.url) return null
                      
//                       // Skip video placeholders that are still generating (they're shown in the main placeholder)
//                       if (imageData?.type === 'video' && imageData?.isGenerating === true) {
//                         return null
//                       }
                     
//                       return (
//                       <div
//                           key={index}
//                           className="w-[calc(33.33%-0.5rem)] relative group rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[var(--color-primary)] transition-all cursor-pointer"
//                           onClick={() => setSelectedImageIndex(index)}
//                         >
//                           <div 
//                             className=""
//                           >
//                             {imageData?.type === 'video' ? (
                              
//                                 <video
//                                   src={imgUrl}
//                                   className="w-full h-auto"
//                                   autoPlay
//                                   loop
//                                   muted
//                                   playsInline
//                                   controls={false}
//                                   onError={(e) => {
//                                     const target = e.target as HTMLVideoElement
//                                     target.style.display = 'none'
//                                   }}
//                                 />
                              
//                             ) : (
//                               <img
//                                 src={imgUrl}
//                                 alt={`Generated ${index + 1}`}
//                                 className="w-full h-auto"
//                                 onError={(e) => {
//                                   const target = e.target as HTMLImageElement
//                                   target.style.display = 'none'
//                                 }}
//                               />
//                             )}
//                           </div>
//                           {/* View Image Button (Eye Icon) */}
//                           <button
//                             type="button"
//                             className="absolute top-2 right-2 z-[60] bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-lg p-2 transition-all cursor-pointer shadow-lg pointer-events-auto"
//                             onClick={(e) => {
//                               e.stopPropagation()
//                               e.preventDefault()
//                               setSelectedImageIndex(index)
//                             }}
//                             aria-label="View image in full screen"
//                           >
//                             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                             </svg>
//                           </button>
//                         </div>
//                       )
//                     })}
//                   </div>
//                 ) : isGenerating && jobId ? (
//                   /* Show loading state with multiple placeholders - hide preview */
//                   <div className="w-full">
//                     <div className="text-center mb-4">
//                       <p className="text-gray-600 text-sm">
//                         Generating {numberOfImages} image{numberOfImages > 1 ? 's' : ''}... This may take a few moments.
//                       </p>
//                     </div>
//                     <div className="flex flex-wrap justify-center gap-2">
//                       {Array.from({ length: numberOfImages }).map((_, arrayIndex) => {
//                         // API returns index starting from 1, so we need to map: arrayIndex 0 -> API index 1, arrayIndex 1 -> API index 2, etc.
//                         const apiIndex = arrayIndex + 1
                        
//                         // First check if we have a completed image in generatedImages (final state)
//                         const generatedImage = generatedImages[arrayIndex]
                        
//                         // Then check if we have an in-progress image from the API response
//                         const inProgressImage = generatedImagesInProgress.find(img => img.index === apiIndex)
//                         const hasImageUrl = inProgressImage?.url && inProgressImage.url.trim() !== '' && inProgressImage?.status === 'success'
                        
//                         // Use completed image first, then in-progress image, otherwise show placeholder
//                         const imageToShow = generatedImage || (hasImageUrl ? inProgressImage.url : null)
//                         const isCompleted = !!generatedImage || (hasImageUrl && inProgressImage?.status === 'success')
//                         const isProcessing = !isCompleted && (inProgressImage?.status === 'in_progress' || !inProgressImage)
                        
//                         return (
//                           <div key={arrayIndex} className="w-[calc(33.33%-0.5rem)] relative bg-white rounded-xl border-2 border-gray-200 overflow-hidden aspect-square group">
//                             {imageToShow ? (
//                               // Show generated image if available
//                               <img
//                                 src={imageToShow}
//                                 alt={`Generated ${arrayIndex + 1}`}
//                                 className="w-full h-full object-cover"
//                                 onError={(e) => {
//                                   const target = e.target as HTMLImageElement
//                                   target.style.display = 'none'
//                                 }}
//                               />
//                             ) : (
//                               // Show placeholder with spinner
//                               <div className="w-full h-full flex items-center justify-center bg-gray-100">
//                                 <div className="relative w-16 h-16">
//                                   <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--color-primary)]/20"></div>
//                                   <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[var(--color-primary)] absolute top-0 left-0" style={{ animationDirection: 'reverse' }}></div>
//                                 </div>
//                               </div>
//                             )}
//                             {imageToShow && (
//                               <div 
//                                 className="absolute top-2 right-2 opacity-100 cursor-pointer z-10"
//                                 onClick={(e) => {
//                                   e.stopPropagation()
//                                   // Store the image info for the modal
//                                   setSelectedImageIndex(arrayIndex)
//                                   // Also store the in-progress image URL if it's not in generatedImages yet
//                                   if (!generatedImage && hasImageUrl && inProgressImage) {
//                                     // We'll handle this in the modal by checking generatedImagesInProgress
//                                   }
//                                 }}
//                               >
                              
                              
//                               </div>
//                             )}
//                             {isCompleted ? (
//                           ''
//                             ) : isProcessing ? (
//                               <div className="absolute inset-0 bg-primary/5 flex items-center justify-center pointer-events-none">
//                                 <span className="text-xs font-medium text-primary bg-white/80 px-2 py-1 rounded">Processing...</span>
//                               </div>
//                             ) : (
//                               <div className="absolute inset-0 bg-primary/5 flex items-center justify-center pointer-events-none">
//                                 <span className="text-xs font-medium text-primary bg-white/80 px-2 py-1 rounded">Waiting...</span>
//                               </div>
//                             )}
//                           </div>
//                         )
//                       })}
//                     </div>
//                   </div>
//                 ) : mainImagePreview ? (
//                   /* Show main image preview only - no placeholders until generate is clicked */
//                   <div className="w-full">
//                     <div className="relative bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg max-w-2xl mx-auto">
//                       <img
//                         src={mainImagePreview}
//                         alt="Preview"
//                         className="w-full h-auto"
//                       />
//                       <div className="absolute top-2 left-2 bg-primary text-white text-xs font-medium px-2 py-1 rounded">
//                         Input
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   /* Show empty state */
//                   <div className="w-full h-full flex flex-col items-center justify-center text-center">
//                     <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
//                       <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
//                       </svg>
//                     </div>
//                     <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Snap AI Canvas</h3>
//                     <p className="text-gray-600 text-sm">Your generated images will appear here. Begin by adding a main image in the left panel.</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Right Panel - Settings */}
//             <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
//               <div className="p-6 space-y-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>

//                 {/* Output Section */}
//                 <div>
//                   <button
//                     onClick={() => toggleSection('output')}
//                     className="w-full flex items-center justify-between mb-3 text-sm font-medium text-gray-700"
//                   >
//                     <span>Output</span>
//                     <svg className={`w-4 h-4 transition-transform ${expandedSections.output ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                     </svg>
//                   </button>
//                   {expandedSections.output && (
//                     <div className="space-y-4">
//                       {/* Aspect Ratio */}
//                       <div>
//                         <label className="block text-xs font-medium text-gray-700 mb-2">Aspect Ratio</label>
//                         <div className="grid grid-cols-4 gap-2">
//                           {aspectRatioMap.map((ratio) => (
//                             <button
//                               key={ratio}
//                               onClick={() => setFormData({ ...formData, aspectRatio: ratio })}
//                               className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
//                                 formData.aspectRatio === ratio
//                                   ? 'bg-primary text-white'
//                                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                               }`}
//                             >
//                               {ratio}
//                             </button>
//                           ))}
//                         </div>
//                       </div>
//                       {/* Number of Images */}
//                       <div>
//                         <label className="block text-xs font-medium text-gray-700 mb-2">Number of Images</label>
//                         <div className="flex gap-2">
//                           {[1, 2,3, 4].map((num) => (
//                             <button
//                               key={num}
//                               onClick={() => setFormData({ ...formData, numberOfImages: num.toString() })}
//                               className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
//                                 formData.numberOfImages === num.toString()
//                                   ? 'bg-primary text-white'
//                                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                               }`}
//                             >
//                               {num}
//                             </button>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Model Section */}
//                 <div>
//                   <button
//                     onClick={() => toggleSection('model')}
//                     className="w-full flex items-center justify-between mb-3 text-sm font-medium text-gray-700"
//                   >
//                     <span>Model</span>
//                     <svg className={`w-4 h-4 transition-transform ${expandedSections.model ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                     </svg>
//                   </button>
//                   {expandedSections.model && (
//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-xs font-medium text-gray-700 mb-2">Images with Model</label>
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => setFormData({ ...formData, imagesWithModel: 'yes', selectedFaceId: '', customFaceUpload: null })}
//                             className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
//                               formData.imagesWithModel === 'yes'
//                                 ? 'bg-primary text-white'
//                                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                             }`}
//                           >
//                             Yes
//                           </button>
//                           <button
//                             onClick={() => setFormData({ ...formData, imagesWithModel: 'no', selectedFaceId: '', customFaceUpload: null })}
//                             className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
//                               formData.imagesWithModel === 'no'
//                                 ? 'bg-primary text-white'
//                                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                             }`}
//                           >
//                             No
//                           </button>
//                         </div>
//                       </div>
//                       {formData.imagesWithModel === 'yes' && (
//                         <div className="space-y-3">
//                           <button
//                             onClick={() => setShowFaceModal(true)}
//                             className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center justify-between"
//                           >
//                             <span>{formData.selectedFaceId ? 'Model Selected' : 'Select Model'}</span>
//                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                             </svg>
//                           </button>
//                           {/* Selected Model Preview */}
//                           {formData.selectedFaceId && faces.find(f => f.id === formData.selectedFaceId) && (
//                             <div className="relative w-full rounded-lg overflow-hidden border-2 border-gray-200">
//                               <img
//                                 src={faces.find(f => f.id === formData.selectedFaceId)?.image || ''}
//                                 alt="Selected model"
//                                 className="w-full h-32 object-cover"
//                                 onError={(e) => {
//                                   const target = e.target as HTMLImageElement
//                                   target.style.display = 'none'
//                                 }}
//                               />
//                               <div className="absolute top-2 right-2 bg-primary/80 text-white text-xs font-medium px-2 py-1 rounded">
//                                 Selected
//                               </div>
//                             </div>
//                           )}
//                           <input
//                             type="file"
//                             onChange={(e) => handleFileUpload(e, 'customFace')}
//                             className="hidden"
//                             id="custom-face-upload"
//                             accept="image/*"
//                           />
//                           <label htmlFor="custom-face-upload" className="cursor-pointer block">
//                             <div className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 text-center">
//                               Upload Your Own
//                             </div>
//                           </label>
//                           {customFacePreview && (
//                             <img src={customFacePreview} alt="Custom model" className="w-full h-32 object-cover rounded-lg" />
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 {/* Prompt Section */}
//                 <div>
//                   <button
//                     onClick={() => toggleSection('prompt')}
//                     className="w-full flex items-center justify-between mb-3 text-sm font-medium text-gray-700"
//                   >
//                     <span>Prompt</span>
//                     <svg className={`w-4 h-4 transition-transform ${expandedSections.prompt ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                     </svg>
//                   </button>
//                   {expandedSections.prompt && (
//                     <div>
//                       <textarea
//                         value={formData.customPrompt}
//                         onChange={(e) => setFormData({ ...formData, customPrompt: e.target.value })}
//                         rows={4}
//                         className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-[var(--color-primary)] transition-all resize-none"
//                         placeholder="Additional instructions..."
//                       />
//                     </div>
//                   )}
//                 </div>

//                 {/* Credits Summary */}
//                 <div className="pt-4 border-t border-gray-200">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs font-medium text-gray-700">Credits Use</span>
//                     {loadingCredits ? (
//                       <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)]"></div>
//                     ) : (
//                       <span className="text-sm font-semibold text-primary flex gap-2 items-center">
//                         <img src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/credit-icon.png" alt="Rupee Icon" className="w-auto" /> {requiredCredits}
//                       </span>
//                     )}
//                   </div>
//                   {!hasSufficientCredits && userCredits !== null && (
//                     <p className="text-xs text-red-500">Insufficient credits</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Form content continues below - keeping for reference but will be removed */}
//         <div className="hidden">
//           <div className="space-y-6">
//               {/* 1. Product Name */}
//               <div className="border-2 rounded-2xl p-6" style={{borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)'}}>
//                 <label className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">Product Name</label>
//                 <input
//                   type="text"
//                   value={formData.productName}
//                   onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
//                   className="w-full px-5 py-4 bg-secondary border border-black/50 rounded-xl text-gray-600 placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-2 focus:ring-primary/20 transition-all"
//                   placeholder="Enter product name"
//                 />
//               </div>

//               {/* 2. Main Image */}
//               <div className="border-2 rounded-2xl p-6" style={{borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)'}}>
//                 <div className="flex items-center justify-between mb-3">
//                   <label className="block text-sm font-semibold text-black uppercase tracking-wide">
//                     Main Image <span className="text-red-400">*</span>
//                   </label>
//                   {selectedCategory?.id === '693667ca799d1d1e0cb46b9a' && (
//                     <button
//                       type="button"
//                       onClick={() => setShowImageInstructionModal(true)}
//                       className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 text-xs"
//                       title="View image guidelines"
//                     >
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                       Guidelines
//                     </button>
//                   )}
//                 </div>
//                 {!formData.mainImage && (
//                   <p className="mb-3 text-sm text-red-400">Please upload a main image</p>
//                 )}
//                 <div className="relative group">
//                   <input
//                     type="file"
//                     onChange={(e) => handleFileUpload(e, 'main')}
//                     className="hidden"
//                     id="main-image-upload"
//                     accept="image/*"
//                   />
//                   <label htmlFor="main-image-upload" className="cursor-pointer block">
//                     <div
//                       onDragOver={(e) => handleDragOver(e, 'main')}
//                       onDragLeave={(e) => handleDragLeave(e, 'main')}
//                       onDrop={(e) => handleDrop(e, 'main')}
//                       className={`border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${
//                         isDraggingMain
//                           ? 'border-[var(--color-primary)] bg-primary/20 scale-[1.02]'
//                           : 'border-gray-300 hover:border-[var(--color-primary)] bg-primary/10'
//                       }`}
//                     >
//                       {mainImagePreview ? (
//                         <div className="relative w-full h-64 overflow-hidden rounded-lg max-w-xs mx-auto">
//                           <img
//                             src={mainImagePreview}
//                             alt="Main image preview"
//                             className="w-full h-full object-cover"
//                           />
//                           <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
//                             <div className="text-center">
//                               <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-[var(--color-primary)]/30 text-primary flex items-center justify-center text-2xl border border-[var(--color-primary)]/60">
//                               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-up-icon lucide-image-up"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19.5 3-3 3 3"/><path d="M17 22v-5.5"/><circle cx="9" cy="9" r="2"/></svg>
//                               </div>
//                               <p className="text-white text-sm font-medium">Click to change</p>
//                             </div>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="text-center py-8">
//                           <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/30 text-primary flex items-center justify-center text-3xl border border-[var(--color-primary)]/60">
//                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-up-icon lucide-image-up"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19.5 3-3 3 3"/><path d="M17 22v-5.5"/><circle cx="9" cy="9" r="2"/></svg>
//                           </div>
//                           <p className={`mb-2 font-medium transition-colors ${isDraggingMain ? 'text-primary' : 'text-gray-600'}`}>
//                             {isDraggingMain ? 'Drop image here' : 'Drag & drop or click to upload'}
//                           </p>
//                           <p className="text-sm text-gray-500">No file selected</p>
//                         </div>
//                       )}
//                     </div>
//                   </label>
//                 </div>
//               </div>

//               {/* 3. Additional Image */}
//               <div className="border-2 rounded-2xl p-6" style={{borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)'}}>
//                 <div className="flex items-center justify-between mb-3">
//                   <label className="block text-sm font-semibold text-black uppercase tracking-wide">Additional Image (Optional)</label>
//                   {selectedCategory?.id === '693667ca799d1d1e0cb46b9a' && (
//                   <button
//                     type="button"
//                     onClick={() => setShowImageInstructionModal(true)}
//                     className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 text-xs"
//                     title="View image guidelines"
//                   >
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     Guidelines
//                   </button>
//                     )}
//                 </div>
//                 <div className="relative group">
//                   <input
//                     type="file"
//                     onChange={(e) => handleFileUpload(e, 'additional')}
//                     className="hidden"
//                     id="additional-image-upload"
//                     accept="image/*"
//                   />
//                   <label htmlFor="additional-image-upload" className="cursor-pointer block">
//                     <div
//                       onDragOver={(e) => handleDragOver(e, 'additional')}
//                       onDragLeave={(e) => handleDragLeave(e, 'additional')}
//                       onDrop={(e) => handleDrop(e, 'additional')}
//                       className={`border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${
//                         isDraggingAdditional
//                           ? 'border-[var(--color-primary)] bg-primary/20 scale-[1.02]'
//                           : 'border-gray-300 hover:border-[var(--color-primary)] bg-primary/10'
//                       }`}
//                     >
//                       {additionalImagePreview ? (
//                         <div className="relative w-full h-64 overflow-hidden rounded-lg max-w-xs mx-auto">
//                           <img
//                             src={additionalImagePreview}
//                             alt="Additional image preview"
//                             className="w-full h-full object-cover"
//                           />
//                           <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
//                             <div className="text-center">
//                               <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-primary/30 text-white flex items-center justify-center text-2xl border border-[var(--color-primary)]/60">
//                               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-up-icon lucide-image-up"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19.5 3-3 3 3"/><path d="M17 22v-5.5"/><circle cx="9" cy="9" r="2"/></svg>
//                               </div>
//                               <p className="text-white text-sm font-medium">Click to change</p>
//                             </div>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="text-center py-8">
//                           <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/30 text-primary flex items-center justify-center text-3xl border border-[var(--color-primary)]/60">
//                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-up-icon lucide-image-up"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19.5 3-3 3 3"/><path d="M17 22v-5.5"/><circle cx="9" cy="9" r="2"/></svg>
//                           </div>
//                           <p className={`mb-2 font-medium transition-colors ${isDraggingAdditional ? 'text-primary' : 'text-gray-600'}`}>
//                             {isDraggingAdditional ? 'Drop image here' : 'Drag & drop or click to upload'}
//                           </p>
//                           <p className="text-sm text-gray-500">No file selected</p>
//                         </div>
//                       )}
//                     </div>
//                   </label>
//                 </div>
//               </div>

//               {/* 4. Number of Images */}
//               <div className="border-2 rounded-2xl p-6" style={{borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)'}}>
//                 <label className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">Number of Images to Generate</label>
//                 <select
//                   value={formData.numberOfImages}
//                   onChange={(e) => setFormData({ ...formData, numberOfImages: e.target.value })}
//                   className="w-full px-5 py-4 bg-secondary border border-black/50 rounded-xl text-gray-600 focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-2 focus:ring-primary/20 transition-all"
//                 >
//                   {[1, 2, 3, 4].map((num) => (
//                     <option key={num} value={num.toString()} className="">{num}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* 5. Images with Model */}
//               <div className="border-2 rounded-2xl p-6" style={{borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)'}}>
//                 <label className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">Images with Model</label>
//                 <div className="flex gap-4">
//                   <button
//                     type="button"
//                     onClick={() => setFormData({ ...formData, imagesWithModel: 'yes', selectedFaceId: '', customFaceUpload: null })}
//                     className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${formData.imagesWithModel === 'yes'
//                       ? 'bg-primary text-white'
//                       : 'bg-secondary border border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/50'
//                       }`}
//                   >
//                     Yes
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setFormData({ ...formData, imagesWithModel: 'no', selectedFaceId: '', customFaceUpload: null })}
//                     className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${formData.imagesWithModel === 'no'
//                       ? 'bg-primary text-white'
//                       : 'bg-secondary border border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/50'
//                       }`}
//                   >
//                     No
//                   </button>
//                 </div>

//                 {/* Face Selection - Show when "Yes" is selected */}
//                 {formData.imagesWithModel === 'yes' && (
//                   <div className="mt-6 space-y-4">
//                     {loadingFaces ? (
//                       <div className="flex items-center justify-center py-8">
//                         <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300"></div>
//                         <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-[var(--color-primary)] absolute"></div>
//                       </div>
//                     ) : (
//                       <>
//                         {/* Face Selection Button */}
//                         <div>
//                           <label className="block text-sm font-medium text-black mb-3">
//                             Select Model <span className="text-red-400">*</span>
//                           </label>
//                           <button
//                             type="button"
//                             onClick={() => setShowFaceModal(true)}
//                             className="w-full px-5 py-4 bg-secondary border border-gray-300 rounded-xl hover:border-[var(--color-primary)]/50 transition-all text-left flex items-center justify-between"
//                           >
//                             <div className="flex items-center gap-3">
//                               {formData.selectedFaceId ? (
//                                 <>
//                                   <img
//                                     src={faces.find(f => f.id === formData.selectedFaceId)?.image || ''}
//                                     alt="Selected model"
//                                     className="w-10 h-10 rounded-lg object-cover"
//                                   />
//                                   <span className="text-gray-600 text-sm">Model Selected</span>
//                                 </>
//                               ) : (
//                                 <span className="text-gray-600 text-sm">Click to select a model</span>
//                               )}
//                             </div>
//                             <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                             </svg>
//                           </button>
//                           {!formData.selectedFaceId && !formData.customFaceUpload && (
//                             <p className="mt-2 text-sm text-red-400">Please select a model or upload your own model</p>
//                           )}
//                         </div>

//                         {/* Custom Face Upload */}
//                         <div>
//                           <label className="block text-sm font-medium text-black mb-3">Or Upload Your Own Model</label>
//                           <div className="relative">
//                             <input
//                               type="file"
//                               onChange={(e) => handleFileUpload(e, 'customFace')}
//                               className="hidden"
//                               id="custom-face-upload"
//                               accept="image/*"
//                             />
//                             <label htmlFor="custom-face-upload" className="cursor-pointer block">
//                               <div
//                                 onDragOver={(e) => handleDragOver(e, 'customFace')}
//                                 onDragLeave={(e) => handleDragLeave(e, 'customFace')}
//                                 onDrop={(e) => handleDrop(e, 'customFace')}
//                                 className={`border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${
//                                   isDraggingCustomFace
//                                     ? 'border-[var(--color-primary)] bg-primary/20 scale-[1.02]'
//                                     : 'border-gray-300 hover:border-[var(--color-primary)] bg-primary/10'
//                                 }`}
//                               >
//                                 {customFacePreview ? (
//                                   <div className="relative w-full h-64 overflow-hidden rounded-lg max-w-xs mx-auto">
//                                     <img
//                                       src={customFacePreview}
//                                       alt="Custom model preview"
//                                       className="w-full h-full object-cover"
//                                     />
//                                     <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
//                                       <div className="text-center">
//                                         <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-primary/30 text-white flex items-center justify-center text-2xl border border-[var(--color-primary)]/60">
//                                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-up-icon lucide-image-up"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19.5 3-3 3 3"/><path d="M17 22v-5.5"/><circle cx="9" cy="9" r="2"/></svg>
//                                         </div>
//                                         <p className="text-white text-sm font-medium">Click to change</p>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 ) : (
//                                   <div className="text-center py-6">
//                                     <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/30 text-primary flex items-center justify-center text-2xl border border-[var(--color-primary)]/60">
//                                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-up-icon lucide-image-up"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19.5 3-3 3 3"/><path d="M17 22v-5.5"/><circle cx="9" cy="9" r="2"/></svg>
//                                     </div>
//                                     <p className={`text-sm font-medium transition-colors ${isDraggingCustomFace ? 'text-primary' : 'text-gray-600'}`}>
//                                       {isDraggingCustomFace ? 'Drop image here' : 'Upload Your Own Model'}
//                                     </p>
//                                     <p className="text-xs text-gray-500 mt-1">No file selected</p>
//                                   </div>
//                                 )}
//                               </div>
//                             </label>
//                           </div>
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>



//               {/* 6. Custom Prompt */}
//               <div className="border-2 rounded-2xl p-6" style={{borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)'}}>
//                 <label className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">Additional Instructions </label>
//                 <textarea
//                   value={formData.customPrompt}
//                   onChange={(e) => setFormData({ ...formData, customPrompt: e.target.value })}
//                   rows={4}
//                   className="w-full px-5 py-4 bg-secondary border border-black/50 rounded-xl text-gray-600 placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
//                   placeholder="Example: Use a soft, natural lighting, focus on the product, etc."
//                 />
//               </div>

//               {/* 7. Aspect Ratio */}
//               <div className="border-2 rounded-2xl p-6" style={{borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)'}}>
//                 <label className="block text-sm font-semibold text-black mb-4 uppercase tracking-wide">Aspect Ratio</label>
                
//                 {/* Category Buttons */}
//                 <div className="flex gap-3 mb-4 hidden md:flex">
//                   {/* Portrait */}
//                   <button
//                     type="button"
//                     onClick={() => {
//                       // Set to first portrait ratio if current is not portrait
//                       if (!['2:3', '3:4', '4:5'].includes(formData.aspectRatio)) {
//                         setFormData({ ...formData, aspectRatio: '2:3' })
//                       }
//                     }}
//                     className={`cursor-pointer flex-1 flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-xl font-medium transition-all ${
//                       ['2:3', '3:4', '4:5'].includes(formData.aspectRatio)
//                         ? 'bg-primary border-2 border-[var(--color-primary)] text-white'
//                         : 'bg-secondary border border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/50'
//                     }`}
//                   >
//                     <div className={`md:w-8 md:h-10 w-6 h-8 rounded border-2 ${
//                       ['2:3', '3:4', '4:5'].includes(formData.aspectRatio)
//                         ? 'border-white'
//                         : 'border-gray-500'
//                     }`}></div>
//                     <span className="text-sm">Portrait</span>
//                   </button>

//                   {/* Square */}
//                   <button
//                     type="button"
//                     onClick={() => setFormData({ ...formData, aspectRatio: '1:1' })}
//                     className={`cursor-pointer flex-1 flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-xl font-medium transition-all ${
//                       formData.aspectRatio === '1:1'
//                         ? 'bg-primary border-2 border-[var(--color-primary)] text-white'
//                         : 'bg-secondary border border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/50'
//                     }`}
//                   >
//                     <div className={`md:w-10 md:h-10 w-8 h-8 rounded border-2 ${
//                       formData.aspectRatio === '1:1'
//                         ? 'border-white'
//                         : 'border-gray-500'
//                     }`}></div>
//                     <span className="text-sm">Square</span>
//                   </button>

//                   {/* Landscape */}
//                   <button
//                     type="button"
//                     onClick={() => {
//                       // Set to first landscape ratio if current is not landscape
//                       if (!['3:2', '4:3', '5:4', '16:9', '21:9'].includes(formData.aspectRatio)) {
//                         setFormData({ ...formData, aspectRatio: '16:9' })
//                       }
//                     }}
//                     className={`cursor-pointer flex-1 flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-xl font-medium transition-all ${
//                       ['3:2', '4:3', '5:4', '16:9', '21:9'].includes(formData.aspectRatio)
//                         ? 'bg-primary border-2 border-[var(--color-primary)] text-white'
//                         : 'bg-secondary border border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/50'
//                     }`}
//                   >
//                     <div className={`md:w-10 md:h-8 w-8 h-6 rounded border-2 ${
//                       ['3:2', '4:3', '5:4', '16:9', '21:9'].includes(formData.aspectRatio)
//                         ? 'border-white'
//                         : 'border-gray-500'
//                     }`}></div>
//                     <span className="text-sm">Landscape</span>
//                   </button>

//                   {/* Stories */}
//                   <button
//                     type="button"
//                     onClick={() => setFormData({ ...formData, aspectRatio: '9:16' })}
//                     className={`cursor-pointer flex-1 flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-xl font-medium transition-all ${
//                       formData.aspectRatio === '9:16'
//                         ? 'bg-primary border-2 border-[var(--color-primary)] text-white'
//                         : 'bg-secondary border border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/50'
//                     }`}
//                   >
//                     <div className={`md:w-8 md:h-12 w-6 h-10 rounded border-2 ${
//                       formData.aspectRatio === '9:16'
//                         ? 'border-white'
//                         : 'border-gray-500'
//                     }`}></div>
//                     <span className="text-sm">Stories</span>
//                   </button>
//                 </div>

//                 {/* All Specific Ratio Buttons */}
//                 <div className="flex gap-2 flex-wrap">
//                   {/* Portrait Ratios */}
//                   {['2:3', '3:4', '4:5'].map((ratio) => (
//                     <button
//                       key={ratio}
//                       type="button"
//                       onClick={() => setFormData({ ...formData, aspectRatio: ratio })}
//                       className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-all text-sm ${
//                         formData.aspectRatio === ratio
//                           ? 'bg-primary border-2 border-[var(--color-primary)] text-white'
//                           : 'bg-secondary border border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/50'
//                       }`}
//                     >
//                       {ratio}
//                     </button>
//                   ))}
                  
//                   {/* Square Ratio */}
//                   <button
//                     type="button"
//                     onClick={() => setFormData({ ...formData, aspectRatio: '1:1' })}
//                     className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-all text-sm ${
//                       formData.aspectRatio === '1:1'
//                         ? 'bg-primary border-2 border-[var(--color-primary)] text-white'
//                         : 'border border-gray-700/50 text-gray-600 hover:border-gray-600/50'
//                     }`}
//                   >
//                     1:1
//                   </button>

//                   {/* Landscape Ratios */}
//                   {['3:2', '4:3', '5:4', '16:9', '21:9'].map((ratio) => (
//                     <button
//                       key={ratio}
//                       type="button"
//                       onClick={() => setFormData({ ...formData, aspectRatio: ratio })}
//                       className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-all text-sm ${
//                         formData.aspectRatio === ratio
//                           ? 'bg-primary border-2 border-[var(--color-primary)] text-white'
//                           : 'bg-secondary border border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/50'
//                       }`}
//                     >
//                       {ratio}
//                     </button>
//                   ))}

//                   {/* Stories Ratio */}
//                   <button
//                     type="button"
//                     onClick={() => setFormData({ ...formData, aspectRatio: '9:16' })}
//                     className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-all text-sm ${
//                       formData.aspectRatio === '9:16'
//                         ? 'bg-primary border-2 border-[var(--color-primary)] text-white'
//                         : 'border border-gray-700/50 text-gray-600 hover:border-gray-600/50'
//                     }`}
//                   >
//                     9:16
//                   </button>
//                 </div>
//               </div>

//               {/* 8. Credit Summary */}
//               <div className="border-2 rounded-2xl p-6" style={{borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)'}}>
//                 <div className="flex items-center md:flex-row flex-col justify-between mb-0">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
//                       <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
//                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                       </svg>
//                     </div>
//                     <label className="text-sm font-semibold text-black uppercase tracking-wide">Credits Summary</label>
//                   </div>
//                   {loadingCredits ? (
//                     <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-500/30 border-t-yellow-400"></div>
//                   ) : (
//                     <div className="flex items-center gap-1">
//                       <span className="font-bold text-lg">
//                         Required: {requiredCredits} /
//                       </span><span className="font-bold text-lg text-primary">
//                         {userCredits !== null ? userCredits : '0'} Available
//                       </span>
//                     </div>
//                   )}
//                 </div>

//                 {!hasSufficientCredits && userCredits !== null && (
//                   <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
//                     <p className="text-red-400 text-sm">
//                       Insufficient credits. You need {requiredCredits} credits but only have {userCredits}.
//                     </p>
//                   </div>
//                 )}
//               </div>

//           </div>
//         </div>

//         {/* Image Instruction Modal */}
//         {showImageInstructionModal && (
//           <div 
//             className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
//             onWheel={(e) => e.stopPropagation()}
//             onClick={() => setShowImageInstructionModal(false)}
//           >
//             <div 
//               className="relative w-full max-w-3xl max-h-[90vh] bg-secondary rounded-2xl overflow-hidden flex flex-col border-2 border-[var(--color-primary)]/30 shadow-2xl"
//               onClick={(e) => e.stopPropagation()}
//             >
//               {/* Header */}
//               <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-primary/10">
//                 <h2 className="text-2xl font-bold text-black">Image Upload Guidelines</h2>
//                 <button
//                   onClick={() => setShowImageInstructionModal(false)}
//                   className="w-10 h-10 rounded-full border border-gray-300 hover:border-[var(--color-primary)] hover:bg-primary/10 transition-all text-black flex items-center justify-center"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>

//               {/* Content */}
//               <div className="flex-1 overflow-y-auto p-6 space-y-6">
//                 {/* What Works Best Section */}
//                 <div>
//                   <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
//                     <span className="w-2 h-2 rounded-full bg-green-500"></span>
//                     What Works Best
//                   </h3>
//                   <div className="grid grid-cols-3 gap-4 mb-4">
//                     {/* Example 1 */}
//                     <div className="relative rounded-lg overflow-hidden border-2 border-green-500/30">
//                       <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
//                          <img src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/8b0a5cd5-bcdb-449c-bf24-5e15442c9ca1.jpg" alt="Image Instruction 1" className="w-full h-full object-cover" />
//                          <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
//                             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                             </svg>
//                           </div>
//                       </div>
//                     </div>
//                     {/* Example 2 */}
//                     <div className="relative rounded-lg overflow-hidden border-2 border-green-500/30">
//                       <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
//                          <img src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/4c34021e-38c1-4a1d-a90e-c578bc9d32d7.jpg" alt="Image Instruction 1" className="w-full h-full object-cover" />
//                          <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
//                             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                             </svg>
//                           </div>
//                       </div>
//                     </div>
//                     {/* Example 3 */}
//                     <div className="relative rounded-lg overflow-hidden border-2 border-green-500/30">
//                       <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
//                          <img src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/17526539-1883-4da5-abc3-5dd329b1f3f6.jpg" alt="Image Instruction 1" className="w-full h-full object-cover" />
//                          <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
//                             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                             </svg>
//                           </div>
//                       </div>
//                     </div>
//                   </div>
//                   <p className="text-sm text-white bg-green-500 border border-green-200 rounded-lg p-4">
//                     Clean, well-lit product photos. Front-facing garments or tidy flat-lays work great for consistent results.
//                   </p>
//                 </div>

//                 {/* What to Avoid Section */}
//                 <div>
//                   <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
//                     <span className="w-2 h-2 rounded-full bg-red-500"></span>
//                     What to Avoid
//                   </h3>
//                   <div className="grid grid-cols-3 gap-4 mb-4">
//                     {/* Example 1 */}
//                     <div className="relative rounded-lg overflow-hidden border-2 border-red-500/30">
//                       <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
//                         <img src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/dc494c88-4f4c-4f62-965d-130ef4ca84ab.jpg" alt="Image Instruction 1" className="w-full h-full object-cover" />
//                       <div className="absolute bottom-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
//                         <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                         </svg>
//                       </div>
//                       </div>
//                     </div>
//                     {/* Example 2 */}
//                     <div className="relative rounded-lg overflow-hidden border-2 border-red-500/30">
//                       <div className="aspect-square bg-gray-100 flex items-center justify-center">
//                         <img src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/aebceac3-7227-4ced-bf98-e99a03a4a629.jpg" alt="Image Instruction 1" className="w-full h-full object-cover" />
//                          <div className="absolute bottom-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
//                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                         </svg>
//                           </div>
//                       </div>
//                     </div>
//                     {/* Example 3 */}
//                     <div className="relative rounded-lg overflow-hidden border-2 border-red-500/30">
//                       <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
//                         <img src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/b99da0b5-5b4c-43e5-ba4d-fb7bf8e8d423.jpg" alt="Image Instruction 1" className="w-full h-full object-cover" />
//                          <div className="absolute bottom-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
//                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                         </svg>
//                           </div>
//                       </div>
//                     </div>
//                   </div>
//                   <p className="text-sm text-white bg-red-500 border border-red-200 rounded-lg p-4">
//                     Cluttered backgrounds, covered garments, or folded/creased items can reduce quality.
//                   </p>
//                 </div>
//               </div>

//             </div>
//           </div>
//         )}

//         {/* Face Selection Modal */}
//         {showFaceModal && (() => {
//           const filteredFaces = faceGenderFilter === 'all'
//             ? faces
//             : faces.filter(face => {
//               // Normalize type for comparison
//               const faceType = face.type ? face.type.charAt(0).toUpperCase() + face.type.slice(1).toLowerCase() : 'Other'
//               return faceType === faceGenderFilter
//             })

//           return (
//           <div 
//             className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
//             onWheel={(e) => e.stopPropagation()}
//           >
//               <div className="relative w-full max-w-5xl h-[90vh] bg-secondary rounded-2xl overflow-hidden flex flex-col border-2 border-[var(--color-primary)]/30">
//                 {/* Header */}
//                 <div className="flex items-center justify-between p-6 border-b border-gray-300">
//                   <div>
//                     <h2 className="text-2xl font-bold text-black mb-2">Select Model</h2>
//                     <p className="text-sm text-gray-600">Choose a model for your image generation</p>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setShowFaceModal(false)
//                       setSelectedFaceInModal(null)
//                       setFaceGenderFilter('all')
//                     }}
//                     className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 hover:border-[var(--color-primary)] hover:bg-primary/10 transition-all text-black flex items-center justify-center"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>

//                 {/* Gender Filter */}
//                 <div className="p-6 border-b border-gray-300">
//                   <div className="flex gap-3 flex-wrap">
//                     {['all', 'Men', 'Women', 'Kid'].map((filter) => (
//                       <button
//                         key={filter}
//                         onClick={() => setFaceGenderFilter(filter as typeof faceGenderFilter)}
//                         className={`px-4 py-2 rounded-lg font-medium transition-all ${faceGenderFilter === filter
//                           ? 'bg-primary border border-[var(--color-primary)] text-white'
//                           : 'bg-secondary border border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/50'
//                           }`}
//                       >
//                         {filter === 'all' ? 'All' : filter}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Faces Grid - Organized by Gender */}
//                 <div 
//                   className="flex-1 overflow-y-auto p-6"
//                   onWheel={(e) => e.stopPropagation()}
//                 >
//                   {loadingFaces ? (
//                     <div className="flex items-center justify-center py-20">
//                       <div className="text-center">
//                         <div className="relative inline-block">
//                           <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300"></div>
//                           <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-[var(--color-primary)] absolute top-0 left-0"></div>
//                         </div>
//                         <p className="text-black mt-4">Loading models...</p>
//                       </div>
//                     </div>
//                   ) : faceGenderFilter === 'all' ? (
//                     // Show all faces organized by gender sections
//                     faces.length === 0 ? (
//                       <div className="text-center py-20">
//                         <p className="text-gray-600">No models available</p>
//                       </div>
//                     ) : (
//                       <div className="space-y-8">
//                         {facesByGender.Men && facesByGender.Men.length > 0 && (
//                           <div>
//                             <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
//                               <span className="w-2 h-2 rounded-full bg-primary"></span>
//                               Men ({facesByGender.Men.length})
//                             </h3>
//                             <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
//                               {facesByGender.Men.map((face) => (
//                                 <div
//                                   key={face.id}
//                                   onClick={() => setSelectedFaceInModal(face)}
//                                   className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all aspect-square ${selectedFaceInModal?.id === face.id
//                                     ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/50 scale-105'
//                                     : 'border-gray-300 hover:border-[var(--color-primary)]/50'
//                                     }`}
//                                 >
//                                   <img
//                                     src={face.image}
//                                     alt={`Model ${face.id}`}
//                                     className="w-full h-full object-cover"
//                                   />
//                                   {selectedFaceInModal?.id === face.id && (
//                                     <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
//                                       <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
//                                         <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                         </svg>
//                                       </div>
//                                     </div>
//                                   )}
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )}

//                         {facesByGender.Women && facesByGender.Women.length > 0 && (
//                           <div>
//                             <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
//                               <span className="w-2 h-2 rounded-full bg-primary"></span>
//                               Women ({facesByGender.Women.length})
//                             </h3>
//                             <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
//                               {facesByGender.Women.map((face) => (
//                                 <div
//                                   key={face.id}
//                                   onClick={() => setSelectedFaceInModal(face)}
//                                   className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all aspect-square ${selectedFaceInModal?.id === face.id
//                                     ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/50 scale-105'
//                                     : 'border-gray-300 hover:border-[var(--color-primary)]/50'
//                                     }`}
//                                 >
//                                   <img
//                                     src={face.image}
//                                     alt={`Model ${face.id}`}
//                                     className="w-full h-full object-cover"
//                                   />
//                                   {selectedFaceInModal?.id === face.id && (
//                                     <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
//                                       <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
//                                         <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                         </svg>
//                                       </div>
//                                     </div>
//                                   )}
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )}

//                         {facesByGender.Kid && facesByGender.Kid.length > 0 && (
//                           <div>
//                             <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
//                               <span className="w-2 h-2 rounded-full bg-primary"></span>
//                               Kid ({facesByGender.Kid.length})
//                             </h3>
//                             <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
//                               {facesByGender.Kid.map((face) => (
//                                 <div
//                                   key={face.id}
//                                   onClick={() => setSelectedFaceInModal(face)}
//                                   className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all aspect-square ${selectedFaceInModal?.id === face.id
//                                     ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/50 scale-105'
//                                     : 'border-gray-300 hover:border-[var(--color-primary)]/50'
//                                     }`}
//                                 >
//                                   <img
//                                     src={face.image}
//                                     alt={`Model ${face.id}`}
//                                     className="w-full h-full object-cover"
//                                   />
//                                   {selectedFaceInModal?.id === face.id && (
//                                     <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
//                                       <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
//                                         <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                         </svg>
//                                       </div>
//                                     </div>
//                                   )}
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     )
//                   ) : (
//                     // Show filtered faces for specific gender
//                     filteredFaces.length === 0 ? (
//                       <div className="text-center py-20">
//                         <p className="text-gray-600">No models available for this filter</p>
//                       </div>
//                     ) : (
//                       <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
//                         {filteredFaces.map((face) => (
//                           <div
//                             key={face.id}
//                             onClick={() => setSelectedFaceInModal(face)}
//                             className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all aspect-square ${selectedFaceInModal?.id === face.id
//                               ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/50 scale-105'
//                               : 'border-gray-700/50 hover:border-[var(--color-primary)]/50'
//                               }`}
//                           >
//                             <img
//                               src={face.image}
//                               alt={`Model ${face.id}`}
//                               className="w-full h-full object-cover"
//                             />
//                             {selectedFaceInModal?.id === face.id && (
//                               <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
//                                 <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
//                                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                   </svg>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     )
//                   )}
//                 </div>

//                 {/* Footer */}
//                 <div className="p-6 border-t border-gray-300 flex gap-3">
//                   <button
//                     onClick={() => {
//                       setShowFaceModal(false)
//                       setSelectedFaceInModal(null)
//                       setFaceGenderFilter('all')
//                     }}
//                     className="flex-1 px-6 py-3 bg-gray-200 border border-gray-300 rounded-xl hover:border-[var(--color-primary)] hover:bg-primary/10 transition-all text-black font-semibold"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={() => {
//                       if (selectedFaceInModal) {
//                         setFormData((prev) => ({
//                           ...prev,
//                           selectedFaceId: selectedFaceInModal.id,
//                           customFaceUpload: null
//                         }))
//                         setShowFaceModal(false)
//                         setSelectedFaceInModal(null)
//                         setFaceGenderFilter('all')
//                         // toast.success('Model selected successfully')
//                       } else {
//                         toast.error('Please select a model')
//                       }
//                     }}
//                     disabled={!selectedFaceInModal}
//                     className="flex-1 px-6 py-3 bg-primary rounded-xl hover:bg-primary/80 transition-all text-white font-semibold shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Save
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )
//         })()}

//         {/* Image View Modal - Full Width Popup with Action Buttons */}
//         {selectedImageIndex !== null && selectedImageIndex >= 0 && (() => {
//           // Check for completed image first, then in-progress image
//           const completedImage = generatedImages[selectedImageIndex]
//           const apiIndex = selectedImageIndex + 1 // API uses 1-based indexing
//           const inProgressImage = generatedImagesInProgress.find(img => img.index === apiIndex)
//           const imageUrl = completedImage || (inProgressImage?.url && inProgressImage.url.trim() !== '' ? inProgressImage.url : null)
//           const imageData = generatedImagesData[selectedImageIndex]
//           const imageId = imageData?.id || imageData?.path || ''
//           const galleryImageId = imageData?.gallery_image_id || imageData?.id || ''
//           const deleteId = imageData?.gallery_image_id || imageData?.id || ''
          
//           return (
//             <div 
//               className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
//               onWheel={(e) => e.stopPropagation()}
//               onClick={() => setSelectedImageIndex(null)}
//             >
//               <div 
//                 className="relative w-full h-full flex flex-col items-center justify-center p-4"
//                 onClick={(e) => e.stopPropagation()}
//                 onWheel={(e) => e.stopPropagation()}
//               >
//                 {/* Close Button */}
//                 <button
//                   onClick={() => setSelectedImageIndex(null)}
//                   className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-gray-300 hover:border-[var(--color-primary)] transition-all text-black flex items-center justify-center shadow-lg"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>

//                 {/* White Background Container with Centered Image/Video */}
//                 <div className="relative w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
//                   {!imageUrl ? (
//                     <div className="flex-1 flex items-center justify-center p-8 text-center">
//                       <div>
//                         <p className="text-gray-900 text-lg mb-4">Image not available</p>
//                         <p className="text-gray-600 text-sm mb-6">The image may still be processing or has been removed.</p>
//                         <button
//                           onClick={() => setSelectedImageIndex(null)}
//                           className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
//                         >
//                           Close
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <>
//                       {/* Image/Video Container */}
//                       <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
//                         {imageData?.type === 'video' ? (
//                           <video
//                             src={imageUrl}
//                             className="w-full h-full max-h-full object-contain"
//                             controls={false}
//                             autoPlay
//                             loop
//                             onError={(e) => {
//                               const target = e.target as HTMLVideoElement
//                               target.style.display = 'none'
//                             }}
//                           />
//                         ) : (
//                           <img
//                             src={imageUrl}
//                             alt={`Image ${selectedImageIndex + 1}`}
//                             className="w-full h-full max-h-full object-contain"
//                             onError={(e) => {
//                               const target = e.target as HTMLImageElement
//                               target.style.display = 'none'
//                             }}
//                           />
//                         )}
//                       </div>

//                       {/* Action Buttons - Fixed at Bottom */}
//                       <div className=" p-2 bg-black/90 rounded-full w-auto mt-4 mx-auto flex items-center justify-center">
//                         {imageData?.type === 'video' ? (
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation()
                              
//                               downloadVideo(imageUrl, `generated-video-${selectedImageIndex + 1}.mp4`, e)
//                             }}
//                             className="px-4 py-2 text-white transition-all text-sm font-medium flex items-center justify-center gap-2"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
//                             Download Video
//                           </button>
                            
//                         ) : (
//                           <>
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation()
//                                 downloadImage(imageUrl, `generated-image-${selectedImageIndex + 1}.png`, e)
//                               }}
//                               className="px-4 py-2 border-white/50 border-r text-white transition-all text-sm font-medium flex items-center justify-center gap-2"
//                             >
//                               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
//                               Download
//                             </button>
//                             {(imageId || galleryImageId) && (
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation()
//                                   setSelectedImageIndex(null)
//                                   handleGenerateVideo(imageId || galleryImageId, e)
//                                 }}
//                                 disabled={videoGenerating[imageId || galleryImageId]}
//                                 className="px-4 py-2 border-white/50 border-r text-white transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                               >
//                                 {videoGenerating[imageId || galleryImageId] ? (
//                                   <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
//                                 ) : (
//                                   <>
//                                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
//                                     Generate Video
//                                   </>
//                                 )}
//                               </button>
//                             )}
//                             {deleteId && (
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation()
//                                   setSelectedImageIndex(null)
//                                   handleDeleteImage(deleteId, e)
//                                 }}
//                                 className="px-4 py-2  text-white transition-all text-sm font-medium flex items-center justify-center gap-2"
//                               >
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                   <path d="M3 6h18"></path>
//                                   <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
//                                   <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
//                                 </svg>
//                                 Delete
//                               </button>
//                             )}
//                           </>
//                         )}
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )
//         })()}
//       </div>
//     )
//   }

//   // Download all images as zip
//   const downloadAllImagesAsZip = async () => {
//     try {
//       // toast.info('Preparing zip file...', { autoClose: 2000 })
//       const zip = new JSZip()

//       // Fetch all images and add them to zip
//       const imagePromises = generatedImages.map(async (imgUrl, index) => {
//         try {
//           const response = await fetch(imgUrl)
//           const blob = await response.blob()
//           const fileName = `generated-image-${index + 1}.png`
//           zip.file(fileName, blob)
//         } catch (error) {
//           console.error(`Error fetching image ${index + 1}:`, error)
//           toast.warning(`Failed to include image ${index + 1} in zip`)
//         }
//       })

//       await Promise.all(imagePromises)

//       // Generate zip file
//       const zipBlob = await zip.generateAsync({ type: 'blob' })

//       // Create download link
//       const url = URL.createObjectURL(zipBlob)
//       const link = document.createElement('a')
//       link.href = url
//       link.download = `generated-images-${new Date().getTime()}.zip`
//       document.body.appendChild(link)
//       link.click()
//       document.body.removeChild(link)
//       URL.revokeObjectURL(url)

//       // toast.success('All images downloaded as zip!')
//     } catch (error: any) {
//       console.error('Error creating zip file:', error)
//       toast.error('Failed to create zip file. Please try again.')
//     }
//   }

//   // Step 6: Results - Show images once success response is received
//   if (currentStep === 'results' && generatedImages.length > 0) {
//     return (
//       <div className="md:pt-[180px] pt-[120px] pb-20 relative overflow-hidden">
//         <div ref={sectionRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
//             <div>
//               <div className="flex items-center justify-start gap-2">
//                 <div className="w-2 h-2 rounded-full bg-primary"></div>
//                 <span className=" text-sm font-medium uppercase tracking-wider">
//                   Generation Complete
//                 </span>
//               </div>
//               <h2 className="text-5xl md:text-6xl font-bold">
//                 Your <span className="text-primary">Images</span> Are Ready
//               </h2>
//               <p className="text-gray-600 mt-3">Download or save your generated images</p>
//             </div>
//             <button
//               onClick={() => {
//                 setCurrentStep('form')
//                 setGeneratedImages([])
//                 setGeneratedImagesData([])
//                 setJobId(null)
//                 setJobStatus(null)
//                 setStatusMessage('')
//                 setVideoGenerating({})
//                 // Cleanup preview URLs
//                 if (mainImagePreview) {
//                   URL.revokeObjectURL(mainImagePreview)
//                   setMainImagePreview(null)
//                 }
//                 if (additionalImagePreview) {
//                   URL.revokeObjectURL(additionalImagePreview)
//                   setAdditionalImagePreview(null)
//                 }
//                 if (customFacePreview) {
//                   URL.revokeObjectURL(customFacePreview)
//                   setCustomFacePreview(null)
//                 }
//                 setFormData({
//                   productName: '',
//                   mainImage: null,
//                   additionalImage: null,
//                   numberOfImages: '1',
//                   imagesWithModel: 'no',
//                   selectedFaceId: '',
//                   customFaceUpload: null,
//                   autoPrompt: '',
//                   customPrompt: '',
//                   aspectRatio: '1:1',
//                 })
//                 setFaces([])
//               }}
//               className="feature-btn px-6 py-3 font-semibold bg-primary rounded-full hover:bg-primary/80 transition-all text-white"
//             >
//               Create New Generation
//             </button>
//           </div>

//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {generatedImages.map((imgUrl, index) => {
//               const imageData = generatedImagesData[index]
//               // console.log(imageData)
//               // Skip rendering if image URL is invalid or image data is missing
//               if (!imgUrl || !imageData?.url) {
//                 return null
//               }
//               const imageId = imageData?.id || imageData?.path || ''

//               return (
//                 <div
//                   key={index}
//                   className="group relative rounded-4xl border-2 border-[var(--color-primary)]/30 overflow-hidden transition-all duration-300 hover:scale-105 bg-primary/5"
//                 >
//                   {/* Glow Effect */}
//                   <div
//                     className="absolute inset-0 rounded-4xl opacity-0 group-hover:opacity-40 blur-2xl -z-10 transition-opacity duration-300 bg-primary/20"
//                   />

//                   {/* Image/Video Container */}
//                   <div 
//                     className="relative aspect-square overflow-hidden cursor-pointer"
//                     onClick={() => setSelectedImageIndex(index)}
//                   >
//                     {imageData?.type === 'video' ? (
//                       <>
//                         <video
//                           src={imgUrl}
//                           className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//                           onError={(e) => {
//                             const target = e.target as HTMLVideoElement
//                             target.style.display = 'none'
//                           }}
//                         />
//                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                           <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20">
//                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
//                               <path d="M8 5v14l11-7z"/>
//                             </svg>
//                           </div>
//                         </div>
//                       </>
//                     ) : (
//                       <img
//                         src={imgUrl}
//                         alt={`Generated image ${index + 1}`}
//                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//                         onError={(e) => {
//                           const target = e.target as HTMLImageElement
//                           target.style.display = 'none'
//                           const parent = target.parentElement
//                           if (parent) {
//                             parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-gray-600">Failed to load image</span></div>'
//                           }
//                         }}
//                       />
//                     )}
//                     {/* Action Buttons - Floating in bottom right corner */}
//                     <div className="absolute bottom-3 right-3 flex gap-2 z-20">
//                       {imageData?.type === 'video' ? (
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation()
//                             downloadVideo(imgUrl, `generated-video-${index + 1}.mp4`, e)
//                           }}
//                           className="px-2 py-2 bg-primary text-white rounded-lg transition-all text-center text-xs backdrop-blur-sm"
//                           title="Download video"
//                         >
//                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3"></path><path d="m6 11 6 6 6-6"></path><path d="M19 21H5"></path></svg>
//                         </button>
//                       ) : (
//                         <>
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation()
//                               downloadImage(imgUrl, `generated-image-${index + 1}.png`, e)
//                             }}
//                             className="px-2 py-2 bg-primary text-white rounded-lg transition-all text-center text-xs backdrop-blur-sm"
//                             title="Download"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3"></path><path d="m6 11 6 6 6-6"></path><path d="M19 21H5"></path></svg>
//                           </button>
//                           {imageId && (
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation()
//                                 handleGenerateVideo(imageId, e)
//                               }}
//                               disabled={videoGenerating[imageId]}
//                               className="px-2 py-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg transition-all text-center text-xs disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
//                               title="Generate video"
//                             >
//                               {videoGenerating[imageId] ? (
//                                 <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-[var(--color-primary)]"></div>
//                               ) : (
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
//                               )}
//                             </button>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>

//           {/* Download All Button */}
//           <div className="mt-8 text-center">
//             <button
//               onClick={downloadAllImagesAsZip}
//               className="px-8 py-3 bg-primary rounded-full hover:bg-primary/80 transition-all text-white font-semibold"
//             >
//               Download All Images
//             </button>
//           </div>
//         </div>

//         {/* Image View Modal - Full Width Popup with Action Buttons */}
//         {selectedImageIndex !== null && selectedImageIndex >= 0 && (() => {
//           // Check for completed image first, then in-progress image
//           const completedImage = generatedImages[selectedImageIndex]
//           const apiIndex = selectedImageIndex + 1 // API uses 1-based indexing
//           const inProgressImage = generatedImagesInProgress.find(img => img.index === apiIndex)
//           const imageUrl = completedImage || (inProgressImage?.url && inProgressImage.url.trim() !== '' ? inProgressImage.url : null)
//           const imageData = generatedImagesData[selectedImageIndex]
//           const imageId = imageData?.id || imageData?.path || ''
//           const galleryImageId = imageData?.gallery_image_id || imageData?.id || ''
//           const deleteId = imageData?.gallery_image_id || imageData?.id || ''
          
//           return (
//             <div 
//               className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
//               onWheel={(e) => e.stopPropagation()}
//               onClick={() => setSelectedImageIndex(null)}
//             >
//               <div 
//                 className="relative w-full h-full flex flex-col items-center justify-center p-4"
//                 onClick={(e) => e.stopPropagation()}
//                 onWheel={(e) => e.stopPropagation()}
//               >
//                 {/* Close Button */}
//                 <button
//                   onClick={() => setSelectedImageIndex(null)}
//                   className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-gray-300 hover:border-[var(--color-primary)] transition-all text-black flex items-center justify-center shadow-lg"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>

//                 {/* White Background Container with Centered Image/Video */}
//                 <div className="relative w-full max-w-4xl h-full max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col">
//                   {!imageUrl ? (
//                     <div className="flex-1 flex items-center justify-center p-8 text-center">
//                       <div>
//                         <p className="text-gray-900 text-lg mb-4">Image not available</p>
//                         <p className="text-gray-600 text-sm mb-6">The image may still be processing or has been removed.</p>
//                         <button
//                           onClick={() => setSelectedImageIndex(null)}
//                           className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
//                         >
//                           Close
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <>
//                       {/* Image/Video Container */}
//                       <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
//                         {imageData?.type === 'video' ? (
//                           <video
//                             src={imageUrl}
//                             className="w-full h-full max-h-full object-contain"
//                             controls
//                             autoPlay
//                             onError={(e) => {
//                               const target = e.target as HTMLVideoElement
//                               target.style.display = 'none'
//                             }}
//                           />
//                         ) : (
//                           <img
//                             src={imageUrl}
//                             alt={`Image ${selectedImageIndex + 1}`}
//                             className="w-full h-full max-h-full object-contain"
//                             onError={(e) => {
//                               const target = e.target as HTMLImageElement
//                               target.style.display = 'none'
//                             }}
//                           />
//                         )}
//                       </div>

//                       {/* Action Buttons - Fixed at Bottom */}
//                       <div className="border-t border-gray-200 p-4 flex items-center justify-center gap-3">
//                         {imageData?.type === 'video' ? (
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation()
//                               downloadVideo(imageUrl, `generated-video-${selectedImageIndex + 1}.mp4`, e)
//                             }}
//                             className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-sm font-medium flex items-center justify-center gap-2"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
//                             Download Video
//                           </button>
//                         ) : (
//                           <>
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation()
//                                 downloadImage(imageUrl, `generated-image-${selectedImageIndex + 1}.png`, e)
//                               }}
//                               className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-sm font-medium flex items-center justify-center gap-2"
//                             >
//                               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
//                               Download
//                             </button>
//                             {(imageId || galleryImageId) && (
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation()
//                                   handleGenerateVideo(imageId || galleryImageId, e)
//                                 }}
//                                 disabled={videoGenerating[imageId || galleryImageId]}
//                                 className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                               >
//                                 {videoGenerating[imageId || galleryImageId] ? (
//                                   <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
//                                 ) : (
//                                   <>
//                                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
//                                     Generate Video
//                                   </>
//                                 )}
//                               </button>
//                             )}
//                             {deleteId && (
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation()
//                                   handleDeleteImage(deleteId, e)
//                                 }}
//                                 className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium flex items-center justify-center gap-2"
//                               >
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                   <path d="M3 6h18"></path>
//                                   <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
//                                   <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
//                                 </svg>
//                                 Delete
//                               </button>
//                             )}
//                           </>
//                         )}
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )
//         })()}
//       </div>
//     )
//   }

//   // Face Selection Modal
//   const filteredFaces = faceGenderFilter === 'all'
//     ? faces
//     : faces.filter(face => {
//       const faceType = face.type ? face.type.charAt(0).toUpperCase() + face.type.slice(1).toLowerCase() : 'Other'
//       return faceType === faceGenderFilter
//     })

//   return (
//     <>
//       {/* Face Selection Modal */}
//       {showFaceModal && (
//         <div 
//           className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
//           onWheel={(e) => e.stopPropagation()}
//           onClick={(e) => {
//             if (e.target === e.currentTarget) {
//               setShowFaceModal(false)
//               setSelectedFaceInModal(null)
//               setFaceGenderFilter('all')
//             }
//           }}
//         >
//           <div 
//             className="relative w-full max-w-5xl max-h-[90vh] bg-secondary backdrop-blur-xl border-2 border-[var(--color-primary)]/30 rounded-2xl overflow-hidden flex flex-col my-4"
//             onWheel={(e) => e.stopPropagation()}
//           >
//             {/* Header */}
//             <div className="flex items-center justify-between p-6 border-b border-gray-300">
//               <div>
//                 <h2 className="text-2xl font-bold text-black mb-2">Select Model</h2>
//                 <p className="text-sm text-gray-600">Choose a model for your generation</p>
//               </div>
//               <button
//                 onClick={() => {
//                   setShowFaceModal(false)
//                   setSelectedFaceInModal(null)
//                   setFaceGenderFilter('all')
//                 }}
//                 className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 hover:border-[var(--color-primary)] hover:bg-primary/10 transition-all text-black flex items-center justify-center"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             {/* Gender Filter */}
//             <div className="p-6 border-b border-gray-300">
//               <div className="flex gap-3 flex-wrap">
//                 {['all', 'Men', 'Women', 'Kid'].map((filter) => (
//                   <button
//                     key={filter}
//                     onClick={() => setFaceGenderFilter(filter as typeof faceGenderFilter)}
//                     className={`px-4 py-2 rounded-lg font-medium transition-all ${faceGenderFilter === filter
//                       ? 'bg-primary border border-[var(--color-primary)] text-white'
//                       : 'bg-secondary border border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/50'
//                       }`}
//                   >
//                     {filter === 'all' ? 'All' : filter}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Faces Grid */}
//             <div className="flex-1 overflow-y-auto p-6">
//               {loadingFaces ? (
//                 <div className="flex items-center justify-center py-20">
//                   <div className="text-center">
//                       <div className="relative inline-block">
//                         <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300"></div>
//                         <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-[var(--color-primary)] absolute top-0 left-0"></div>
//                       </div>
//                       <p className="text-black mt-4">Loading models...</p>
//                   </div>
//                 </div>
//               ) : filteredFaces.length === 0 ? (
//                 <div className="text-center py-20">
//                   <p className="text-gray-600">No models available for this filter</p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
//                   {filteredFaces.map((face) => (
//                     <div
//                       key={face.id}
//                       onClick={() => setSelectedFaceInModal(face)}
//                       className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all aspect-square ${selectedFaceInModal?.id === face.id
//                         ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/50 scale-105'
//                         : 'border-gray-300 hover:border-[var(--color-primary)]/50'
//                         }`}
//                     >
//                       <img
//                         src={face.image}
//                         alt={`Model ${face.id}`}
//                         className="w-full h-full object-cover"
//                       />
//                       {selectedFaceInModal?.id === face.id && (
//                         <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
//                           <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
//                             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                             </svg>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Footer */}
//             <div className="p-6 border-t border-gray-300 flex gap-3">
//               <button
//                 onClick={() => {
//                   setShowFaceModal(false)
//                   setSelectedFaceInModal(null)
//                   setFaceGenderFilter('all')
//                 }}
//                 className="flex-1 px-6 py-3 bg-gray-200 border border-gray-300 rounded-xl hover:border-[var(--color-primary)] hover:bg-primary/10 transition-all text-black font-semibold"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => {
//                   if (selectedFaceInModal) {
//                     setFormData((prev) => ({
//                       ...prev,
//                       selectedFaceId: selectedFaceInModal.id,
//                       customFaceUpload: null
//                     }))
//                     setShowFaceModal(false)
//                     setSelectedFaceInModal(null)
//                     setFaceGenderFilter('all')
//                     // toast.success('Model selected successfully')
//                   } else {
//                     toast.error('Please select a model')
//                   }
//                 }}
//                 disabled={!selectedFaceInModal}
//                 className="flex-1 px-6 py-3 bg-primary rounded-xl hover:bg-primary/80 transition-all text-white font-semibold shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Image View Modal - Full Width Popup with Action Buttons */}
//       {selectedImageIndex !== null && selectedImageIndex >= 0 && (() => {
//         // Check for completed image first, then in-progress image
//         const completedImage = generatedImages[selectedImageIndex]
//         const apiIndex = selectedImageIndex + 1 // API uses 1-based indexing
//         const inProgressImage = generatedImagesInProgress.find(img => img.index === apiIndex)
//         const imageUrl = completedImage || (inProgressImage?.url && inProgressImage.url.trim() !== '' ? inProgressImage.url : null)
//         const imageData = generatedImagesData[selectedImageIndex]
//         const imageId = imageData?.id || imageData?.path || ''
//         const galleryImageId = imageData?.gallery_image_id || imageData?.id || ''
//         const deleteId = imageData?.gallery_image_id || imageData?.id || ''
        
//         return (
//           <div 
//             className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
//             onWheel={(e) => e.stopPropagation()}
//             onClick={() => setSelectedImageIndex(null)}
//           >
//             <div 
//               className="relative w-full h-full flex flex-col items-center justify-center p-4"
//               onClick={(e) => e.stopPropagation()}
//               onWheel={(e) => e.stopPropagation()}
//             >
//               {/* Close Button */}
//               <button
//                 onClick={() => setSelectedImageIndex(null)}
//                 className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-gray-300 hover:border-[var(--color-primary)] transition-all text-black flex items-center justify-center shadow-lg"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>

//               {/* White Background Container with Centered Image/Video */}
//               <div className="relative w-full max-w-4xl h-full max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col">
//                 {!imageUrl ? (
//                   <div className="flex-1 flex items-center justify-center p-8 text-center">
//                     <div>
//                       <p className="text-gray-900 text-lg mb-4">Image not available</p>
//                       <p className="text-gray-600 text-sm mb-6">The image may still be processing or has been removed.</p>
//                       <button
//                         onClick={() => setSelectedImageIndex(null)}
//                         className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
//                       >
//                         Close
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <>
//                     {/* Image/Video Container */}
//                     <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
//                       {imageData?.type === 'video' ? (
//                         <video
//                           src={imageUrl}
//                           className="w-full h-full max-h-full object-contain"
//                           controls
//                           autoPlay
//                           onError={(e) => {
//                             const target = e.target as HTMLVideoElement
//                             target.style.display = 'none'
//                           }}
//                         />
//                       ) : (
//                         <img
//                           src={imageUrl}
//                           alt={`Image ${selectedImageIndex + 1}`}
//                           className="w-full h-full max-h-full object-contain"
//                           onError={(e) => {
//                             const target = e.target as HTMLImageElement
//                             target.style.display = 'none'
//                           }}
//                         />
//                       )}
//                     </div>

//                     {/* Action Buttons - Fixed at Bottom */}
//                     <div className="border-t border-gray-200 p-4 flex items-center justify-center gap-3">
//                       {imageData?.type === 'video' ? (
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation()
//                             downloadVideo(imageUrl, `generated-video-${selectedImageIndex + 1}.mp4`, e)
//                           }}
//                           className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-sm font-medium flex items-center justify-center gap-2"
//                         >
//                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
//                           Download Video
//                         </button>
//                       ) : (
//                         <>
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation()
//                               downloadImage(imageUrl, `generated-image-${selectedImageIndex + 1}.png`, e)
//                             }}
//                             className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-sm font-medium flex items-center justify-center gap-2"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
//                             Download
//                           </button>
//                           {(imageId || galleryImageId) && (
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation()
//                                 handleGenerateVideo(imageId || galleryImageId, e)
//                               }}
//                               disabled={videoGenerating[imageId || galleryImageId]}
//                               className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                             >
//                               {videoGenerating[imageId || galleryImageId] ? (
//                                 <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
//                               ) : (
//                                 <>
//                                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
//                                   Generate Video
//                                 </>
//                               )}
//                             </button>
//                           )}
//                           {deleteId && (
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation()
//                                 handleDeleteImage(deleteId, e)
//                               }}
//                               className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium flex items-center justify-center gap-2"
//                             >
//                               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                 <path d="M3 6h18"></path>
//                                 <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
//                                 <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
//                               </svg>
//                               Delete
//                             </button>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         )
//       })()}
//     </>
//   )
// }

// export default AIImageGenerator


