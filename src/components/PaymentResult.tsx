import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface PaymentResultData {
  status: 'success' | 'failed' | 'pending'
  orderId?: string
  amount?: number
  baseAmount?: number
  gstAmount?: number
  totalAmount?: number
  credits?: number
  date?: string
  paymentMethod?: string
  message?: string
}

const PaymentResult = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [paymentData, setPaymentData] = useState<PaymentResultData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get payment data from navigation state
    const stateData = location.state as { paymentData?: PaymentResultData } | null
    
    if (stateData?.paymentData) {
      // Use data passed from PricingSection
      const data = stateData.paymentData
      
      // Determine if payment is successful
      const isSuccess = data.status === 'success'
      
      if (isSuccess) {
        // Refresh navbar credits on success
        window.dispatchEvent(new CustomEvent('refreshCredits'))
      }
      
      setPaymentData(data)
      setLoading(false)
    } else {
      // No data passed - show error
      setPaymentData({
        status: 'failed',
        message: 'Payment information not available. Please try again.',
      })
      setLoading(false)
    }
  }, [location.state])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying payment status...</p>
        </div>
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-gray-600">Unable to load payment information</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 rounded-full bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  const isSuccess = paymentData.status === 'success'
  const isPending = paymentData.status === 'pending'

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-4xl w-full">
        <div
          className="rounded-4xl p-8 md:p-12"
        >
          {/* Success/Failure/Pending Icon */}
          <div className="text-center mb-8">
            {isSuccess ? (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-500"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            ) : isPending ? (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/20 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-yellow-500"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-500"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
            )}

            {/* Headline */}
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {isSuccess ? 'Payment Successful' : isPending ? 'Payment Pending' : 'Payment Failed'}
            </h1>

            {/* Short message */}
            {isSuccess ? (
              <div>
                <p className="text-gray-600 text-lg mb-2">
                  {paymentData.totalAmount !== undefined && paymentData.totalAmount !== null
                    ? `Your payment of ₹${paymentData.totalAmount.toFixed(2)} (incl. 18% GST) has been received.`
                    : 'Your payment has been received successfully.'}
                </p>
                {paymentData.credits !== undefined && paymentData.credits !== null && (
                  <p className="text-primary font-semibold text-xl">
                    {paymentData.credits} Credits have been added to your account!
                  </p>
                )}
              </div>
            ) : isPending ? (
              <div>
                <p className="text-gray-600 text-lg mb-2">
                  Your payment is being processed. Please wait while we verify your transaction.
                </p>
                {paymentData.credits !== undefined && paymentData.credits !== null && (
                  <p className="text-primary font-semibold text-xl">
                    {paymentData.credits} Credits will be added once payment is confirmed.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-lg">
                {paymentData.amount !== undefined && paymentData.amount !== null
                  ? `Your payment of ₹${paymentData.amount.toFixed(2)} could not be processed. No money has been charged.`
                  : 'Your payment could not be processed. No money has been charged.'}
              </p>
            )}
          </div>

          {/* Success Content */}
          {isSuccess && (
            <>
              {/* Order Summary */}
              <div className="mb-6 p-6 rounded-2xl border-2 border-[var(--color-primary)]/50">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  {paymentData.credits !== undefined && paymentData.credits !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Credits Added:</span>
                      <span className="font-semibold text-primary text-lg">{paymentData.credits} Credits</span>
                    </div>
                  )}
                  {paymentData.orderId && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium">{paymentData.orderId}</span>
                    </div>
                  )}
                  {paymentData.date && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Date & Time:</span>
                      <span className="font-medium">{formatDate(paymentData.date)}</span>
                    </div>
                  )}
                  {paymentData.paymentMethod && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Gateway:</span>
                      <span className="font-medium">{paymentData.paymentMethod}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* GST & Amount Block */}
              <div className="mb-6 p-6 rounded-2xl border-2 border-[var(--color-primary)]/50">
                <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                <div className="space-y-3">
                  {paymentData.baseAmount !== undefined && paymentData.baseAmount !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Base Amount:</span>
                      <span className="font-medium">₹{paymentData.baseAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {paymentData.gstAmount !== undefined && paymentData.gstAmount !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">GST @ 18%:</span>
                      <span className="font-medium">₹{paymentData.gstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {paymentData.totalAmount !== undefined && paymentData.totalAmount !== null && (
                    <div className="flex justify-between items-center pt-3 border-t border-gray-600">
                      <span className="text-primary font-semibold text-lg">Total Paid:</span>
                      <span className="text-primary font-bold text-xl">₹{paymentData.totalAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust & Support */}
              <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-gray-600 text-center">
                  If credits are not visible, they will reflect within a few seconds.
                </p>
              </div>
            </>
          )}

          {/* Pending Content */}
          {isPending && (
            <>
              {/* Order Summary */}
              <div className="mb-6 p-6 rounded-2xl border-2 border-[var(--color-primary)]/50">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  {paymentData.credits !== undefined && paymentData.credits !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Credits to be Added:</span>
                      <span className="font-semibold text-lg">{paymentData.credits} Credits</span>
                    </div>
                  )}
                  {paymentData.orderId && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium">{paymentData.orderId}</span>
                    </div>
                  )}
                  {paymentData.date && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Date & Time:</span>
                      <span className="font-medium">{formatDate(paymentData.date)}</span>
                    </div>
                  )}
                  {paymentData.paymentMethod && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Gateway:</span>
                      <span className="font-medium">{paymentData.paymentMethod}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div className="mb-6 p-6 rounded-2xl border-2 border-[var(--color-primary)]/50">
                <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                <div className="space-y-3">
                  {paymentData.baseAmount !== undefined && paymentData.baseAmount !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Base Amount:</span>
                      <span className="font-medium">₹{paymentData.baseAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {paymentData.gstAmount !== undefined && paymentData.gstAmount !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">GST @ 18%:</span>
                      <span className="font-medium">₹{paymentData.gstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {paymentData.totalAmount !== undefined && paymentData.totalAmount !== null && (
                    <div className="flex justify-between items-center pt-3 border-t border-gray-600">
                      <span className="text-primary font-semibold text-lg">Total Amount:</span>
                      <span className="text-primary font-bold text-xl">₹{paymentData.totalAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Message */}
              <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-gray-600 text-center">
                  Your payment is currently being processed. This may take a few moments. Please do not refresh or close this page.
                </p>
              </div>
            </>
          )}

          {/* Failure Content */}
          {!isSuccess && !isPending && (
            <>
              {/* Reason */}
              <div className="mb-6 p-6 rounded-2xl border-2 border-[var(--color-primary)]/50">
                <p className="text-gray-600 mb-4">
                  This can happen due to network issues, incorrect card/UPI details, or insufficient balance.
                </p>
                {paymentData.credits !== undefined && paymentData.credits !== null && (
                  <p className="text-gray-600">
                    {paymentData.credits} Credits were not added to your account because the payment failed.
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-4">
                  If you see any debit in your bank statement, it will be auto-reversed by your bank within 3-7 working days.
                </p>
              </div>

              {/* Support & Reassurance */}
              <div className="mb-6 p-4">
                <p className="text-sm text-gray-600 text-center mb-2">
                  You can safely retry; you will only be charged for a successful payment.
                </p>
                <p className="text-sm text-gray-600 text-center">
                  Still facing issues? Contact{' '}
                  <a href="mailto:support@shuchiai.com" className="text-primary underline">
                    support@shuchiai.com
                  </a>
                </p>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {isSuccess ? (
              <>
                <button
                  onClick={() => navigate('/app')}
                  className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 bg-primary hover:opacity-90"
                  style={{
                    boxShadow:
                      '0 4px 15px color-mix(in srgb, var(--color-primary) 40%, transparent), inset 0 0 20px color-mix(in srgb, var(--color-primary) 10%, transparent)',
                  }}
                >
                  Start Generating Images
                </button>
              </>
            ) : isPending ? (
              <>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 bg-primary hover:opacity-90"
                  style={{
                    boxShadow:
                      '0 4px 15px color-mix(in srgb, var(--color-primary) 40%, transparent), inset 0 0 20px color-mix(in srgb, var(--color-primary) 10%, transparent)',
                  }}
                >
                  Go to Home
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/#pricing')}
                  className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 bg-primary hover:opacity-90"
                  style={{
                    boxShadow:
                      '0 4px 15px color-mix(in srgb, var(--color-primary) 40%, transparent), inset 0 0 20px color-mix(in srgb, var(--color-primary) 10%, transparent)',
                  }}
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentResult

