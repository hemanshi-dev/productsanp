import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { apiService, type User } from '../services/api'
import { toast } from 'react-toastify'

type TabType = 'profile' | 'credit-history' | 'transaction-history'

const Settings = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [user, setUser] = useState<any>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  // User and profile state for top bar
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

  // Handle URL hash to set active tab
  useEffect(() => {
    const updateTabFromHash = () => {
      const hash = location.hash.substring(1) // Remove the '#'
      const validTabs: TabType[] = ['profile', 'credit-history', 'transaction-history']
      if (hash && validTabs.includes(hash as TabType)) {
        setActiveTab(hash as TabType)
      } else if (!hash) {
        // If no hash, default to profile
        setActiveTab('profile')
      }
    }

    // Update tab on mount and when hash changes
    updateTabFromHash()

    // Listen to hashchange event for better reliability
    const handleHashChange = () => {
      updateTabFromHash()
    }

    // Listen to custom event from Navbar when already on settings page
    const handleSettingsTabChange = (e: Event) => {
      const customEvent = e as CustomEvent
      const tabId = customEvent.detail
      const validTabs: TabType[] = ['profile', 'credit-history', 'transaction-history']
      if (validTabs.includes(tabId as TabType)) {
        setActiveTab(tabId as TabType)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('settingsTabChange', handleSettingsTabChange as EventListener)
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('settingsTabChange', handleSettingsTabChange as EventListener)
    }
  }, [location.hash, location.pathname])

  // Animate section entrance
  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      )
    }
  }, [])

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: 'credit-history' as TabType, label: 'Credit History', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-badge-indian-rupee-icon lucide-badge-indian-rupee">
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="m13 17-5-1h1a4 4 0 0 0 0-8"/></svg>
    )},
    { id: 'transaction-history' as TabType, label: 'Transaction History', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
  ]

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

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-sm font-medium uppercase tracking-wider">
              Settings
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-semibold mb-2 leading-tight">
            Account Settings
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Manage your profile, credits, and preferences
          </p>
        </div>

        {/* Tabs and Content */}
        <div className="rounded-2xl backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-700/50 bg-gray-900/30">
            <div className="flex overflow-x-auto scrollbar-hide bg-gradient-to-r from-gray-700/50 to-gray-800/50 ">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    window.history.replaceState(null, '', `#${tab.id}`)
                  }}
                  className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-white bg-gray-900'
                      : 'text-white hover:text-white hover:bg-gray-400/50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && <ProfileTab user={user} />}
            {activeTab === 'credit-history' && <CreditHistoryTab userId={user?.id} />}
            {activeTab === 'transaction-history' && <TransactionHistoryTab userId={user?.id || user?.user_id} />}
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Profile Tab Component
const ProfileTab = ({ user }: { user: any }) => {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)

  // Prevent body scroll when reset password modal is open
  useEffect(() => {
    if (showResetPassword) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showResetPassword])
  const [resetEmail, setResetEmail] = useState('')
  const [resetOtp, setResetOtp] = useState('')
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request')
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    if (user?.id) {
      setLoading(true)
      apiService.getProfile(user.id)
        .then((response) => {
          if (response.status && response.user) {
            // Map picture to avatar for compatibility
            const profileData = {
              ...response.user,
              avatar: response.user.picture
            }
            setProfile(profileData)
            setFullName(profileData.full_name || profileData.name || '')
            setMobileNumber(profileData.mobile_number || '')
            setResetEmail(profileData.email || '')
          }
        })
        .catch((error) => {
          console.error('Error fetching profile:', error)
          toast.error('Failed to load profile')
        })
        .finally(() => setLoading(false))
    }
  }, [user])

  const handleEdit = () => {
    setIsEditing(true)
    setFullName(profile?.full_name || profile?.name || '')
    setMobileNumber(profile?.mobile_number || '')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFullName(profile?.full_name || profile?.name || '')
    setMobileNumber(profile?.mobile_number || '')
  }

  const handleSave = async () => {
    if (!user?.id) {
      toast.error('User not found')
      return
    }

    setIsSaving(true)
    try {
      const updateData: { user_id: string; full_name?: string; mobile_number?: string } = {
        user_id: user.id || user.user_id
      }

      if (fullName.trim()) {
        updateData.full_name = fullName.trim()
      }
      if (mobileNumber.trim()) {
        // Validate mobile number
        const mobileRegex = /^[0-9]{10}$/
        if (!mobileRegex.test(mobileNumber.trim())) {
          toast.error('Please enter a valid 10-digit mobile number')
          setIsSaving(false)
          return
        }
        updateData.mobile_number = mobileNumber.trim()
      }

      const response = await apiService.updateProfile(updateData)

      if (response.status) {
        toast.success('Profile updated successfully')
        setIsEditing(false)
        // Refresh profile
        const profileResponse = await apiService.getProfile(user.id)
        if (profileResponse.status && profileResponse.user) {
          const profileData = {
            ...profileResponse.user,
            avatar: profileResponse.user.picture
          }
          setProfile(profileData)
          // Update localStorage user
          const userStr = localStorage.getItem('user')
          if (userStr) {
            const userData = JSON.parse(userStr)
            const updatedUser = {
              ...userData,
              name: profileData.full_name || profileData.name,
              mobile_number: profileData.mobile_number
            }
            localStorage.setItem('user', JSON.stringify(updatedUser))
          }
        }
      } else {
        toast.error(response.message || 'Failed to update profile')
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetPasswordRequest = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsResetting(true)
    try {
      const response = await apiService.resetPasswordRequest({ email: resetEmail })
      if (response.status) {
        toast.success(response.message || 'OTP sent to your email')
        setResetStep('verify')
      } else {
        toast.error(response.message || 'Failed to send OTP')
      }
    } catch (error: any) {
      console.error('Error requesting password reset:', error)
      toast.error(error.message || 'Failed to send OTP')
    } finally {
      setIsResetting(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetOtp || resetOtp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setIsResetting(true)
    try {
      const response = await apiService.resetPassword({
        email: resetEmail,
        otp: resetOtp
      })
      if (response.status) {
        toast.success(response.message || 'Password reset successfully')
        setShowResetPassword(false)
        setResetStep('request')
        setResetOtp('')
      } else {
        toast.error(response.message || 'Failed to reset password')
      }
    } catch (error: any) {
      console.error('Error resetting password:', error)
      toast.error(error.message || 'Failed to reset password')
    } finally {
      setIsResetting(false)
    }
  }

  // const isGoogleLogin = profile?.login_method === 'google' || profile?.google_id

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden">
            {profile?.avatar && !imageError ? (
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-full h-full rounded-full object-cover"
                onError={() => setImageError(true)}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-3xl font-bold text-primary">
                {profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{profile?.full_name || profile?.name || 'User'}</h3>
            <p className="text-white/80">{profile?.email}</p>
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-primary hover:bg-transparent text-white text-gray-900 border border-[var(--color-primary)] hover:border-white rounded-full transition-all duration-300 font-semibold"
          >
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="p-4  border border-white/20 rounded-xl">
            <label className="block text-sm text-gray-400 font-medium mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white transition-all"
              placeholder="Enter your full name"
            />
          </div>
          <div className="p-4  border border-white/20 rounded-xl">
            <label className="block text-sm text-gray-400 font-medium mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              maxLength={10}
              value={mobileNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '')
                if (value.length <= 10) {
                  setMobileNumber(value)
                }
              }}
              className="w-full px-4 py-3 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white transition-all"
              placeholder="Enter 10-digit mobile number"
            />
            <p className="mt-2 text-xs text-white/80">Enter your 10-digit mobile number without country code</p>
          </div>
          <div className="p-4  border border-white/20 rounded-xl">
            <label className="block text-sm text-gray-400 font-medium mb-2">Email</label>
            <p className="text-white text-lg text-gray-400">{profile?.email || 'N/A'}</p>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          {profile?.created_at && (
            <div className="p-4  border border-white/20 rounded-xl">
              <label className="block text-sm text-gray-400 font-medium mb-2">Member Since</label>
              <p className="text-white text-lg text-gray-400">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-3 border border-white/20 hover:border-white text-white rounded-full transition-all duration-300 hover:shadow-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !fullName.trim()}
              className="flex-1 px-6 py-3 bg-primary hover:bg-transparent text-white text-gray-900 border border-[var(--color-primary)] hover:border-white rounded-full transition-all duration-300 font-semibold"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4  border border-white/20 rounded-xl">
            <label className="block text-sm text-gray-400 font-medium mb-2">Full Name</label>
            <p className="text-white text-lg text-gray-400">{profile?.full_name || profile?.name || 'N/A'}</p>
          </div>
          <div className="p-4  border border-white/20 rounded-xl">
            <label className="block text-sm text-gray-400 font-medium mb-2">Email</label>
            <p className="text-white text-lg">{profile?.email || 'N/A'}</p>
          </div>
          {profile?.mobile_number && (
            <div className="p-4  border border-white/20 rounded-xl">
              <label className="block text-sm text-gray-400 font-medium mb-2">Mobile Number</label>
              <p className="text-white text-lg">{profile.mobile_number}</p>
            </div>
          )}
          {profile?.created_at && (
            <div className="p-4  border border-white/20 rounded-xl">
              <label className="block text-sm text-gray-400 font-medium mb-2">Member Since</label>
              <p className="text-white text-lg">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reset Password Section - Only for non-Google login users */}
      {/* {!isGoogleLogin && (
        <div className="mt-8 pt-8 border-t border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-white">Password</h4>
              <p className="text-sm text-gray-400">Reset your account password</p>
            </div>
            <button
              onClick={() => {
                setShowResetPassword(true)
                setResetStep('request')
                setResetOtp('')
              }}
              className="px-4 py-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white rounded-full transition-all duration-300 hover:shadow-lg"
            >
              Reset Password
            </button>
          </div>
        </div>
      )} */}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onWheel={(e) => e.stopPropagation()}
        >
          <div 
            className="relative w-full max-w-md max-h-[90vh] rounded-2xl border p-8 my-4 overflow-y-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(163, 132, 255, 0.15) 0%, rgba(87, 58, 209, 0.12) 50%, rgba(163, 132, 255, 0.15) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderColor: 'rgba(163, 132, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(163, 132, 255, 0.3), 0 0 0 1px rgba(163, 132, 255, 0.2)',
            }}
          >
            <button
              onClick={() => {
                setShowResetPassword(false)
                setResetStep('request')
                setResetOtp('')
              }}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">
                {resetStep === 'request' ? 'Reset Password' : 'Enter OTP'}
              </h3>

              {resetStep === 'request' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleResetPasswordRequest}
                    disabled={isResetting || !resetEmail}
                    className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #A384FF 0%, #573AD1 100%)',
                      border: '1px solid rgba(163, 132, 255, 0.5)',
                      boxShadow: '0 4px 15px rgba(163, 132, 255, 0.4), inset 0 0 20px rgba(163, 132, 255, 0.1)',
                    }}
                  >
                    {isResetting ? 'Sending...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Enter OTP <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={resetOtp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '')
                        if (value.length <= 6) {
                          setResetOtp(value)
                        }
                      }}
                      placeholder="Enter 6-digit OTP"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                    <p className="mt-2 text-xs text-white/60">
                      Check your email for the OTP code
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setResetStep('request')
                        setResetOtp('')
                      }}
                      className="flex-1 px-4 py-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white rounded-xl transition-all duration-300"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleResetPassword}
                      disabled={isResetting || resetOtp.length !== 6}
                      className="flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'linear-gradient(135deg, #A384FF 0%, #573AD1 100%)',
                        border: '1px solid rgba(163, 132, 255, 0.5)',
                        boxShadow: '0 4px 15px rgba(163, 132, 255, 0.4), inset 0 0 20px rgba(163, 132, 255, 0.1)',
                      }}
                    >
                      {isResetting ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Credit History Tab Component
const CREDIT_HISTORY_ITEMS_PER_PAGE = 10

const CreditHistoryTab = ({ userId }: { userId?: string | number }) => {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentCredits, setCurrentCredits] = useState<number>(0)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isFetchingRef = useRef(false)
  const hasInitialFetch = useRef(false)

  const fetchCreditHistory = async (isLoadMore: boolean = false) => {
    if (!userId || isFetchingRef.current) return

    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    setError(null)
    isFetchingRef.current = true

    try {
      const response = await apiService.getCreditHistory(String(userId), CREDIT_HISTORY_ITEMS_PER_PAGE, isLoadMore ? cursor || undefined : undefined)
      
      if (response.status && response.data) {
        if (isLoadMore) {
          setHistory(prev => [...prev, ...(response.data!.history || [])])
        } else {
          setHistory(response.data.history || [])
        }
        setCurrentCredits(response.data.user?.current_credits || 0)
        setCursor(response.data.pagination.next_cursor || null)
        setHasMore(response.data.pagination.has_more || false)
      } else {
        setError(response.message || 'Failed to fetch credit history')
        if (!isLoadMore) {
          setHistory([])
        }
      }
    } catch (err: any) {
      console.error('Error fetching credit history:', err)
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        userId,
        cursor
      })
      setError(err.message || 'Failed to fetch credit history')
      if (!isLoadMore) {
        setHistory([])
      }
      toast.error('Failed to load credit history')
    } finally {
      setLoading(false)
      setLoadingMore(false)
      isFetchingRef.current = false
    }
  }

  useEffect(() => {
    // Initial fetch on mount
    if (!hasInitialFetch.current && userId) {
      hasInitialFetch.current = true
      fetchCreditHistory(false)
    }
  }, [userId])

  const handleLoadMore = async () => {
    if (!cursor || !hasMore || loadingMore || loading) return
    await fetchCreditHistory(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/50"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-800 border border-white/20 rounded-xl">
        <div>
          <p className="text-md text-gray-400 font-medium">Current Credits</p>
          <p className="text-3xl font-bold text-white">{currentCredits}</p>
        </div>
        <div className="w-16 h-16 flex items-center justify-center text-white">
        <img src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/credit-icon-50x.png" alt="Credit Icon" className="w-auto" />
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No credit history found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4  border border-white/20 rounded-xl hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="md:w-11/12 w-9/12 flex-1">
                  <p className="text-gray-400 font-medium">{item.reason || 'Credit transaction'}</p>
                  <p className="text-sm text-white/80 mt-1">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                  {item.action_by && (
                    <p className="text-xs text-white/80 mt-1">
                      Action by: {item.action_by}
                    </p>
                  )}
                </div>
                <div className="md:w-1/12 w-3/12 text-right">
                  <p className={`text-sm font-bold ${item.change > 0 ? 'text-white bg-green-500 text-center px-2 py-1 rounded' : 'text-white bg-red-500 text-center px-2 py-1 rounded'}`}>
                    {item.change > 0 ? '+' : ''}{item.change}
                  </p>
                  <p className="text-xs text-white/80">Balance: {item.new}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-4 bg-primary hover:bg-transparent text-white text-gray-900 border border-[var(--color-primary)] hover:border-white rounded-full transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  )
}

// Transaction History Tab Component
const ITEMS_PER_PAGE = 10

const TransactionHistoryTab = ({ userId }: { userId?: string | number }) => {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const isFetchingRef = useRef(false)
  const hasInitialFetch = useRef(false)

  const fetchTransactionHistory = async (isLoadMore: boolean = false) => {
    if (!userId || isFetchingRef.current) return

    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    setError(null)
    isFetchingRef.current = true

    try {
      const response = await apiService.getTransactionHistory(String(userId), ITEMS_PER_PAGE, isLoadMore ? cursor || undefined : undefined)
      
      if (response.status && response.data && response.data.transactions) {
        if (isLoadMore) {
          setTransactions(prev => [...prev, ...response.data!.transactions])
        } else {
          setTransactions(response.data.transactions)
        }
        setCursor(response.data.pagination.next_cursor || null)
        setHasMore(response.data.pagination.has_more || false)
      } else {
        setError(response.message || 'Failed to fetch transaction history')
        if (!isLoadMore) {
          setTransactions([])
        }
      }
    } catch (err: any) {
      console.error('Error fetching transaction history:', err)
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        userId,
        cursor
      })
      setError(err.message || 'Failed to fetch transaction history')
      if (!isLoadMore) {
        setTransactions([])
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
      isFetchingRef.current = false
    }
  }

  useEffect(() => {
    // Initial fetch on mount
    if (!hasInitialFetch.current && userId) {
      hasInitialFetch.current = true
      fetchTransactionHistory(false)
    }
  }, [userId])

  const handleLoadMore = async () => {
    if (!cursor || !hasMore || loadingMore || loading) return
    await fetchTransactionHistory(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-400 text-lg">No transactions found</p>
          <p className="text-gray-400 text-sm mt-2">Your transaction history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const amount = transaction.amount || 0
            const baseAmount = transaction.base_amount
            const gstAmount = transaction.gst_amount
            const creditsToAdd = transaction.credits_to_add || 0
            const creditsAdded = transaction.credits_added
            const status = transaction.status || 'pending'
            const orderStatus = transaction.order_status || ''
            const orderId = transaction.order_id || 'N/A'
            const cfOrderId = transaction.cf_order_id || ''
            const currency = transaction.currency || 'INR'
            const createdAt = transaction.created_at
            const completedAt = transaction.completed_at

            const isCompleted = status.toLowerCase() === 'completed' || status.toLowerCase() === 'success' || status.toLowerCase() === 'paid'
            const isFailed = status.toLowerCase() === 'failed' || status.toLowerCase() === 'cancelled' || status.toLowerCase() === 'rejected' || status.toLowerCase() === 'expired'

            return (
              <div
                key={transaction.id}
                className="p-5  border border-white/20 rounded-xl hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 md:w-11/12 w-8/12">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-white font-semibold text-lg">
                        {creditsToAdd} Credits
                      </p>
                      {creditsAdded && (
                        <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                          Added
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-400">
                        Order ID: <span className="break-all">{orderId}</span>
                      </p>
                      {cfOrderId && (
                        <p className="text-gray-400">
                          CF Order: <span >{cfOrderId}</span>
                        </p>
                      )}
                      {baseAmount && (
                        <p className="text-gray-400">
                          Base Amount: <span >₹{baseAmount.toFixed(2)}</span>
                        </p>
                      )}
                      {gstAmount && (
                        <p className="text-gray-400">
                          GST ({transaction.gst_rate}%): <span >₹{gstAmount.toFixed(2)}</span>
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/20">
                      <p className="text-xs text-gray-400">
                        Created: {new Date(createdAt).toLocaleString()}
                      </p>
                      {completedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Completed: {new Date(completedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0 md:w-1/12 w-4/12">
                    <p className="text-2xl font-bold text-white mb-1">
                      ₹{amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-white/80 mb-2">{currency}</p>
                    <div className="space-y-1">
                      <p className={`text-xs font-medium px-2 py-1 rounded text-center ${
                        isCompleted ? 'bg-green-500 text-white border border-green-500/30' : 
                        isFailed ? 'bg-red-500 text-white border border-red-500/30' : 
                        'bg-yellow-500 text-white border border-yellow-500/30'
                      }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </p>
                      {orderStatus && orderStatus !== status && (
                        <p className="text-xs text-white/80 mt-1">
                          {orderStatus}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-4 bg-primary hover:bg-transparent text-white text-gray-900 border border-[var(--color-primary)] hover:border-white rounded-full transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  )
}

export default Settings


