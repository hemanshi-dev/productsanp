import { useState, useEffect } from 'react'
import { useAppSelector } from '../../store/hooks'
import { apiService } from '../../services/api'
import { toast } from 'react-toastify'

type TimePeriod = '24h' | '7d' | 'month' | 'year' | 'all'

interface Revenue {
  total_amount: number
  total_base_amount: number
  total_gst_amount: number
  transaction_count: number
}

interface DashboardStats {
  active_users: number
  failed_generations: number
  image_generations: number
  new_users: number
  revenue: Revenue
}

const AdminDashboard = () => {
  const { admin } = useAppSelector((state) => state.auth)
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('24h')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await apiService.getDashboardStats()
      if (response.status && response.data) {
        // Set initial stats based on selected period
        updateStatsForPeriod(response.data, selectedPeriod)
      } else {
        toast.error('Failed to load dashboard stats')
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error)
      toast.error(error.message || 'Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  const updateStatsForPeriod = (data: any, period: TimePeriod) => {
    const periodData = data[period]
    if (periodData) {
      setStats(periodData)
    }
  }

  const handlePeriodChange = async (period: TimePeriod) => {
    setSelectedPeriod(period)
    try {
      const response = await apiService.getDashboardStats()
      if (response.status && response.data) {
        updateStatsForPeriod(response.data, period)
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error)
      toast.error('Failed to load dashboard stats')
    }
  }

  const timePeriods: { value: TimePeriod; label: string }[] = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All Time' },
  ]

  const statCards = [
    {
      label: 'Active Users',
      key: 'active_users' as keyof DashboardStats,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      label: 'Image Generations',
      key: 'image_generations' as keyof DashboardStats,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: 'Failed Generations',
      key: 'failed_generations' as keyof DashboardStats,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      label: 'New Users',
      key: 'new_users' as keyof DashboardStats,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
  ]

  const formatNumber = (num: number): string => {
    return num.toLocaleString()
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Dashboard Overview</h1>
            <p className="text-gray-400 text-lg">Welcome back, <span className="text-white font-medium">{admin?.name || 'Admin'}</span></p>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Time Period Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-400 text-sm font-medium">Time Period:</span>
          {timePeriods.map((period) => (
            <button
              key={period.value}
              onClick={() => handlePeriodChange(period.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedPeriod === period.value
                  ? 'bg-primary text-white shadow-lg shadow-[var(--color-primary)]/30'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300 border border-gray-700/50'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
            <span className="ml-3 text-gray-400">Loading dashboard stats...</span>
          </div>
        </div>
      ) : stats ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
              <div 
                key={index} 
                className="relative group overflow-hidden rounded-2xl bg-primary p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--color-primary)]/10"
              >
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-white `}>
                      <div className="text-primary">
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white tracking-tight">
                      {typeof stats[stat.key] === 'number' ? formatNumber(stats[stat.key] as number) : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Section */}
          {stats.revenue && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-6">Revenue Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="relative group overflow-hidden rounded-2xl bg-primary p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--color-primary)]/10">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-white">
                        <div className="text-primary">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-white tracking-tight">{formatCurrency(stats.revenue.total_amount)}</p>
                    </div>
                  </div>
                </div>

                {/* Base Amount */}
                  <div className="relative group overflow-hidden rounded-2xl bg-primary p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--color-primary)]/10">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-white">
                        <div className="text-primary">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium mb-1">Base Amount</p>
                      <p className="text-3xl font-bold text-white tracking-tight">{formatCurrency(stats.revenue.total_base_amount)}</p>
                    </div>
                  </div>
                </div>

                {/* GST Amount */}
                <div className="relative group overflow-hidden rounded-2xl bg-primary p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--color-primary)]/10">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-white">
                        <div className="text-primary">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium mb-1">GST Amount</p>
                      <p className="text-3xl font-bold text-white tracking-tight">{formatCurrency(stats.revenue.total_gst_amount)}</p>
                    </div>
                  </div>
                </div>

                {/* Transaction Count */}
                <div className="relative group overflow-hidden rounded-2xl bg-primary p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--color-primary)]/10">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-white">
                        <div className="text-primary">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium mb-1">Transactions</p>
                      <p className="text-3xl font-bold text-white tracking-tight">{formatNumber(stats.revenue.transaction_count)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No stats available</p>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
