import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { toast } from 'react-toastify'
import { apiService, type User } from '../services/api'
import AuthModal from './AuthModal'

// Cashfree will be loaded dynamically

gsap.registerPlugin(ScrollTrigger)

// Pricing Card Interface
interface PricingCard {
  name: string
  description: string
  highlightedWord?: string
  credits?: string
  price: string
  originalPrice?: string
  period?: string
  gstNote?: string
  features: string[]
  popular?: boolean
  discountBadge?: string
}


const PricingSection = () => {
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [creditAmount, setCreditAmount] = useState<string>('')
  const [selectedPlan, setSelectedPlan] = useState<PricingCard | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showMobileModal, setShowMobileModal] = useState(false)
  const [mobileNumber, setMobileNumber] = useState<string>('')
  const [isSavingMobile, setIsSavingMobile] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (showCreditModal || showMobileModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showCreditModal, showMobileModal])
  

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const cards = section.querySelectorAll('.pricing-card')
      if (!cards || cards.length === 0) return

      // Set initial state for all cards - fade only
      gsap.set(cards, { opacity: 0 })
      
      // Check if section is already in viewport
      const rect = section.getBoundingClientRect()
      const isInView = rect.top < window.innerHeight * 0.8 && rect.bottom > 0

      if (isInView) {
        // If already in view, animate immediately - all cards fade in together
        gsap.to(cards, {
          opacity: 1,
          duration: 0.8,
        })
      } else {
        // Otherwise, use ScrollTrigger - all cards fade in together
        gsap.to(cards, {
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none none'
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])


  const creditPacks: PricingCard[] = [
    {
      name: '',
      description: '',
      credits: '100 Credits',
      price: '₹99',
      gstNote: '+18% GST as applicable',
      features: [],
      popular: false,
    },
    {
      name: '',
      description: '',
      credits: '550 Credits',
      price: '₹499',
      gstNote: '+18% GST as applicable',
      features: [],
      popular: false,
      discountBadge: '10% Bonus',
    },
    {
      name: '',
      description: '',
      credits: '1200 Credits',
      price: '₹999',
      gstNote: '+18% GST as applicable',
      features: [],
      popular: true,
      discountBadge: '20% Bonus',
    },
  ]

  // Load Cashfree SDK via script tag
  const loadCashfreeSDK = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if ((window as any).Cashfree) {
        resolve((window as any).Cashfree)
        return
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="cashfree"]')) {
        const checkInterval = setInterval(() => {
          if ((window as any).Cashfree) {
            clearInterval(checkInterval)
            resolve((window as any).Cashfree)
          }
        }, 100)
        setTimeout(() => {
          clearInterval(checkInterval)
          reject(new Error('Cashfree SDK loading timeout'))
        }, 10000)
        return
      }

      // Load Cashfree SDK script
      const script = document.createElement('script')
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
      script.async = true
      script.onload = () => {
        if ((window as any).Cashfree) {
          resolve((window as any).Cashfree)
        } else {
          reject(new Error('Cashfree SDK loaded but not available on window'))
        }
      }
      script.onerror = () => {
        reject(new Error('Failed to load Cashfree SDK script'))
      }
      document.head.appendChild(script)
    })
  }

  // Initialize Cashfree instance (shared function)
  const initializeCashfree = async () => {
    const Cashfree = await loadCashfreeSDK()
    
    if (!Cashfree || typeof Cashfree !== 'function') {
      throw new Error('Cashfree SDK not available')
    }
    
    return new Cashfree({
      mode: 'production', // Change to 'production' for live payments
    })
  }

  // Check if user has mobile number
  const checkMobileNumber = (): boolean => {
    const userStr = localStorage.getItem('user')
    if (!userStr) return false
    
    try {
      const user = JSON.parse(userStr)
      return !!(user.mobile_number && user.mobile_number.trim() !== '')
    } catch {
      return false
    }
  }

  // Payment handler - uses static Order ID and Session ID
  // STATIC IDs ARE DEFINED AT THE TOP OF THIS FILE (lines 20-21)
  const handleBuyNow = async (plan: PricingCard) => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      setShowLoginModal(true)
      return
    }

    // Check if user has mobile number
    if (!checkMobileNumber()) {
      setPendingAction(() => () => {
        const numericAmount = plan.price.replace(/[₹,]/g, '').trim()
        setCreditAmount(numericAmount)
        setSelectedPlan(plan)
        setShowCreditModal(true)
      })
      setShowMobileModal(true)
      return
    }

    // Extract numeric amount from price (remove ₹ and any other text)
    const numericAmount = plan.price.replace(/[₹,]/g, '').trim()
    setCreditAmount(numericAmount)
    setSelectedPlan(plan)
    setShowCreditModal(true)
  }

  // Handle mobile number save
  const handleSaveMobile = async () => {
    // Validation
    if (!mobileNumber || mobileNumber.trim() === '') {
      toast.error('Please enter a valid mobile number')
      return
    }

    // Basic mobile number validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/
    if (!mobileRegex.test(mobileNumber.trim())) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    setIsSavingMobile(true)

    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        toast.error('User not found. Please login again.')
        setShowMobileModal(false)
        return
      }

      const user = JSON.parse(userStr)
      const userId = user.id || user.user_id

      if (!userId) {
        toast.error('User ID not found')
        setShowMobileModal(false)
        return
      }

      // Call API to update profile
      const response = await apiService.updateProfile({
        user_id: userId,
        mobile_number: mobileNumber.trim()
      })

      if (!response.status) {
        throw new Error(response.message || 'Failed to update mobile number')
      }

      // Update user in localStorage
      const updatedUser = {
        ...user,
        mobile_number: mobileNumber.trim()
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))

      // toast.success('Mobile number saved successfully!')
      setShowMobileModal(false)
      setMobileNumber('')

      // Execute pending action if any
      if (pendingAction) {
        pendingAction()
        setPendingAction(null)
      }
    } catch (error: any) {
      console.error('Error saving mobile number:', error)
      toast.error(error.message || 'Failed to save mobile number')
    } finally {
      setIsSavingMobile(false)
    }
  }

  // Handle credit payment
  const handleCreditPayment = async () => {
    // Check if user has mobile number
    if (!checkMobileNumber()) {
      setPendingAction(() => handleCreditPaymentAfterMobileCheck)
      setShowCreditModal(false)
      setShowMobileModal(true)
      return
    }

    handleCreditPaymentAfterMobileCheck()
  }

  // Handle credit payment after mobile check
  const handleCreditPaymentAfterMobileCheck = async () => {
    const amount = parseFloat(creditAmount)
    
    // Validation
    if (!creditAmount || isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (amount < 1) {
      toast.error('Minimum amount is ₹1')
      return
    }

    setIsProcessing(true)

    try {
      // Get user ID from localStorage
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        setShowCreditModal(false)
        setShowLoginModal(true)
        return
      }

      const user = JSON.parse(userStr)
      const userId = user.id || user.user_id

      if (!userId) {
        toast.error('User ID not found')
        setShowCreditModal(false)
        return
      }

      // Call API to create order
      const response = await apiService.createPaymentOrder(userId, amount)

      if (!response.status || !response.data) {
        throw new Error(response.message || 'Failed to create order')
      }

      const { paymentSessionId } = response.data

      // Initialize Cashfree
      const cashfree = await initializeCashfree()

      const checkoutOptions = {
        paymentSessionId: paymentSessionId,
        redirectTarget: '_modal',
      }

      // Close modal
      setShowCreditModal(false)
      setCreditAmount('')

      // Open Cashfree checkout
      cashfree.checkout(checkoutOptions)
        .then(async (response: any) => {
          console.log("Response:", response);
          // toast.success('Redirecting to payment gateway...')
          
          // Wait a bit for payment to process, then verify
          setTimeout(async () => {
            try {
              const verifyResponse = await apiService.verifyOrder(String(userId))
              
              // Check if API call was successful and has results
              if (verifyResponse.status && verifyResponse.data?.results && verifyResponse.data.results.length > 0) {
                // Get the most recent order (first in results array)
                const latestOrder = verifyResponse.data.results[0]
                
                // Use status from result as the real payment status
                // Map status values to our payment status format
                const orderStatus = (latestOrder.status || '').toLowerCase()
                
                let paymentStatus: 'success' | 'failed' | 'pending' = 'pending'
                
                if (orderStatus === 'success' || orderStatus === 'completed' || orderStatus === 'paid') {
                  paymentStatus = 'success'
                } else if (orderStatus === 'failed' || orderStatus === 'fail') {
                  paymentStatus = 'failed'
                } else if (orderStatus === 'pending') {
                  paymentStatus = 'pending'
                } else {
                  // Default to pending for unknown statuses
                  paymentStatus = 'pending'
                }
                
                // Determine if payment is successful for credits refresh
                const isSuccess = paymentStatus === 'success'
                
                // Prepare payment data to pass to PaymentResult
                const paymentData = {
                  status: paymentStatus,
                  orderId: latestOrder.order_id,
                  amount: latestOrder.amount,
                  baseAmount: latestOrder.base_amount,
                  gstAmount: latestOrder.gst_amount,
                  totalAmount: latestOrder.amount,
                  credits: latestOrder.credits_to_add,
                  date: latestOrder.completed_at || latestOrder.created_at,
                  paymentMethod: 'Cashfree',
                  orderStatus: latestOrder.order_status,
                  orderStatusInternal: latestOrder.status,
                }
                
                if (isSuccess) {
                  // Payment successful - refresh credits
                  window.dispatchEvent(new CustomEvent('refreshCredits'))
                }
                
                // Navigate to payment result page with order data
                navigate('/payment-result', {
                  state: { paymentData }
                })
              } else {
                // No order data found - navigate to result page with error
                navigate('/payment-result', {
                  state: {
                    paymentData: {
                      status: 'failed',
                      message: 'No payment orders found',
                    }
                  }
                })
              }
            } catch (verifyError: any) {
              console.error('Error verifying orders after checkout:', verifyError)
              // On error, navigate to result page with error message
              navigate('/payment-result', {
                state: {
                  paymentData: {
                    status: 'failed',
                    message: 'Unable to verify payment. Please check your payment status.',
                  }
                }
              })
            }
          }, 2000) // Wait 2 seconds for payment to process
        })
        .catch((error: any) => {
          console.error("Payment checkout error:", error)
          // Navigate to failure page with error message
          navigate('/payment-result', {
            state: {
              paymentData: {
                status: 'failed',
                message: 'Payment checkout failed. Please try again.',
              }
            }
          })
        })

    } catch (error: any) {
      console.error('Credit payment error:', error)
      toast.error(error.message || 'Failed to process payment')
    } finally {
      setIsProcessing(false)
    }
  }

  // Calculate credits (1rs = 1 credit)

  return (
    <section ref={sectionRef} id="pricing" className="relative z-10 md:pt-32 md:pb-24 py-20 px-6 lg:px-8">
         
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center md:mb-16 mb-8">
        <div  className="flex items-center gap-2 md:mb-4 mb-2 justify-center">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className=" text-sm font-medium uppercase tracking-wider">
            Pricing
            </span>
          </div>
          <h2 className="text-5xl lg:text-7xl font-semibold leading-[1.1] mb-2">
          Choose the Plan That Fits Your Vision

          </h2>
          <p className="md:text-lg text-md text-gray-600 font-primary">Simple pricing that gives you full control. No hidden charges. Just fast, reliable AI generation to power your content.</p>
        </div>


        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          {creditPacks.map((plan, index) => (
            <div
              key={index}
              className={`w-full pricing-card relative rounded-4xl border transition-all duration-300 md:w-1/4 ${
                plan.popular
                  ? 'scale-100 md:scale-110 z-10'
                  : ''
              }`}
              style={{
              
                borderColor: plan.popular 
                  ? 'color-mix(in srgb, var(--color-primary) 50%, transparent)' 
                  : 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
                boxShadow: plan.popular
                  ? '0 8px 32px color-mix(in srgb, var(--color-primary) 30%, transparent), 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)'
                  : '0 4px 16px color-mix(in srgb, var(--color-primary) 30%, transparent), 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)',
              }}
            >
       

              <div className="p-8 relative z-10">
                {/* Discount Badge */}
                {plan.discountBadge && (
                  <div className="absolute top-4 right-4 z-20">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white bg-primary"
                      style={{
                        boxShadow: '0 2px 8px color-mix(in srgb, var(--color-primary) 40%, transparent)',
                      }}
                    >
                      {plan.discountBadge}
                    </span>
                  </div>
                )}

                {/* Title */}
                {plan.name !== '' && (
                  <h3 className="text-2xl font-bold text-primary mb-3">
                    {plan.name}
                  </h3>
                )}

                {/* Description */}
                {plan.description && (
                  <div className="mb-3">
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                  </div>
                )}

                {/* Credits */}
                {plan.credits && (
                  <div className={`${plan.name !== '' ? 'mb-8' : 'mb-4'}`}>
                    <p 
                      className="text-xl font-bold text-black"
                   
                    >
                      {plan.credits}
                    </p>
                  </div>
                )}
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-4xl font-bold text-primary">{plan.price}</p>
                    {plan.period && (
                      <span className="text-lg text-gray-600">{plan.period}</span>
                    )}
                  </div>
                  {plan.originalPrice && (
                    <p className="text-lg text-gray-600 mb-1 line-through">{plan.originalPrice}</p>
                  )}
                  {plan.gstNote && (
                    <p className="text-sm text-gray-600">{plan.gstNote}</p>
                  )}
                </div>
                {/* Features */}
                {plan.features.length > 0 && (
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                       <svg xmlns="http://www.w3.org/2000/svg" style={{minWidth: '18px', minHeight: '18px', maxWidth: '18px', maxHeight: '18px'}} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                        <span className="text-white text-sm w-auto">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

               

                {/* Buy Now Button */}
                <button
                  onClick={() => handleBuyNow(plan)}
                  className="w-full py-3 rounded-full font-semibold text-white transition-all duration-300 relative overflow-hidden group bg-primary"
                
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <span className="relative z-10">Buy Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Purchase Modal */}
      {showCreditModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onWheel={(e) => e.stopPropagation()}
        >
          <div 
            className="relative w-full max-w-md max-h-[90vh] rounded-4xl border p-8 my-4 overflow-y-auto bg-secondary"
            style={{
              borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
              boxShadow: '0 8px 32px color-mix(in srgb, var(--color-primary) 30%, transparent), 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setShowCreditModal(false)
                setCreditAmount('')
                setSelectedPlan(null)
              }}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Modal Content */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Buy Credits</h3>

              {/* Amount Display */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Payment Summary
                </label>
                <div className="w-full px-4 py-3 rounded-xl border border-gray-600 space-y-2">
                  {(() => {
                    const baseAmount = parseFloat(creditAmount || '0')
                    const gstAmount = baseAmount * 0.18
                    const totalAmount = baseAmount + gstAmount
                    
                    return (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Amount (excl. GST):</span>
                          <span className="font-medium">₹{baseAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">GST @ 18%:</span>
                          <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                          <span className="text-primary font-semibold">Total (incl. GST):</span>
                          <span className="text-primary font-bold text-lg">₹{totalAmount.toFixed(2)}</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* Credits Display */}
              {selectedPlan && selectedPlan.credits && (
                <div className="p-4 rounded-xl border border-[var(--color-primary)]">
                  <p className="text-sm mb-1 text-gray-600">You will receive</p>
                  <p className="text-2xl font-bold text-primary">
                    {selectedPlan.credits}
                  </p>
                  {selectedPlan.discountBadge && (
                    <p className="text-xs mt-1 font-medium text-gray-600">
                      {selectedPlan.discountBadge}
                    </p>
                  )}
                </div>
              )}

              {/* Pay Now Button */}
              <button
                onClick={handleCreditPayment}
                disabled={!creditAmount || isNaN(parseFloat(creditAmount)) || parseFloat(creditAmount) <= 0 || isProcessing}
                className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed bg-primary"
                style={{
                  border: '1px solid color-mix(in srgb, var(--color-primary) 50%, transparent)',
                  boxShadow: '0 4px 15px color-mix(in srgb, var(--color-primary) 40%, transparent), inset 0 0 20px color-mix(in srgb, var(--color-primary) 10%, transparent)',
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.boxShadow = '0 6px 20px color-mix(in srgb, var(--color-primary) 60%, transparent), inset 0 0 30px color-mix(in srgb, var(--color-primary) 20%, transparent)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 15px color-mix(in srgb, var(--color-primary) 40%, transparent), inset 0 0 20px color-mix(in srgb, var(--color-primary) 10%, transparent)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span className="relative z-10">
                  {isProcessing ? 'Processing...' : 'Pay Now'}
                </span>
              </button>

              {/* Terms & Privacy Links */}
              <div className="flex items-center justify-center gap-4 text-sm">
                <a
                  href="/terms-and-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-800 transition-colors underline"
                >
                  Terms & Conditions
                </a>
                <span className="text-gray-600">|</span>
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-800 transition-colors underline"
                >
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <AuthModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={(user: User) => {
            // Save user to localStorage
            localStorage.setItem('user', JSON.stringify(user))
            setShowLoginModal(false)
            // toast.success('Login successful! You can now proceed with payment.')
          }}
        />
      )}

      {/* Mobile Number Setup Modal */}
      {showMobileModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onWheel={(e) => e.stopPropagation()}
        >
          <div 
            className="relative w-full max-w-md max-h-[90vh] rounded-4xl border p-8 my-4 overflow-y-auto bg-secondary"
            style={{
              borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
              boxShadow: '0 8px 32px color-mix(in srgb, var(--color-primary) 30%, transparent), 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setShowMobileModal(false)
                setMobileNumber('')
                setPendingAction(null)
              }}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Modal Content */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Setup Mobile Number</h3>
              <p className="text-gray-600 text-sm">
                Please provide your mobile number to continue with the payment.
              </p>

              {/* Mobile Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    if (value.length <= 10) {
                      setMobileNumber(value)
                    }
                  }}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-600 text-gray-600 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
                <p className="mt-2 text-xs text-gray-600">
                  Enter your 10-digit mobile number without country code
                </p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveMobile}
                disabled={!mobileNumber || mobileNumber.length !== 10 || isSavingMobile}
                className="w-full py-4 rounded-xl font-semibold text-black transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed bg-secondary"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                  border: '1px solid color-mix(in srgb, var(--color-primary) 50%, transparent)',
                  boxShadow: '0 4px 15px color-mix(in srgb, var(--color-primary) 40%, transparent), inset 0 0 20px color-mix(in srgb, var(--color-primary) 10%, transparent)',
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.boxShadow = '0 6px 20px color-mix(in srgb, var(--color-primary) 60%, transparent), inset 0 0 30px color-mix(in srgb, var(--color-primary) 20%, transparent)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 15px color-mix(in srgb, var(--color-primary) 40%, transparent), inset 0 0 20px color-mix(in srgb, var(--color-primary) 10%, transparent)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span className="relative z-10">
                  {isSavingMobile ? 'Saving...' : 'Save & Continue'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default PricingSection

