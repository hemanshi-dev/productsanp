import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useAppDispatch } from '../../store/hooks'
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice'
import { apiService } from '../../services/api'

interface LoginFormData {
  email: string
  password: string
}

const AdminLogin = () => {
  const dispatch = useAppDispatch()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>()
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (data: LoginFormData) => {
    setError('')
    dispatch(loginStart())

    try {
      const response = await apiService.adminLogin({
        email: data.email,
        password: data.password
      })
      
      if (response.status && response.admin) {
        dispatch(loginSuccess(response.admin))
        toast.success('Login successful!')
        navigate('/admin/dashboard')
      } else {
        const errorMsg = response.message || 'Login failed'
        setError(errorMsg)
        dispatch(loginFailure(errorMsg))
        toast.error(errorMsg)
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Login failed. Please try again.'
      setError(errorMsg)
      dispatch(loginFailure(errorMsg))
      toast.error(errorMsg)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold gradient-text mb-2 text-center">
          Admin Login
        </h1>
        <p className="text-gray-400 text-center mb-6">
          Sign in to access the admin dashboard
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className={`w-full px-4 py-3 bg-white/5 border rounded-full border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${
                errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-white/10 focus:border-[var(--color-primary)]/50 focus:ring-[var(--color-primary)]/50'
              }`}
              placeholder="admin@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              className={`w-full px-4 py-3.5 bg-white/5 border rounded-full border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${
                errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-white/10 focus:border-[var(--color-primary)]/50 focus:ring-[var(--color-primary)]/50'
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-primary rounded-full font-semibold text-white hover:bg-[var(--color-primary-light)] hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin

