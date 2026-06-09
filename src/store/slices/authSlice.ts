import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface Admin {
  id: string
  email: string
  name?: string
  created_at?: string
  last_login?: string
}

interface AuthState {
  admin: Admin | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  admin: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

// Load from localStorage on initialization
const loadAuthFromStorage = (): Partial<AuthState> => {
  try {
    const adminData = localStorage.getItem('admin')
    const adminToken = localStorage.getItem('adminToken')
    
    if (adminData && adminToken) {
      const admin = JSON.parse(adminData)
      return {
        admin,
        isAuthenticated: true,
      }
    }
  } catch (error) {
    console.error('Error loading auth from storage:', error)
  }
  return {}
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...initialState,
    ...loadAuthFromStorage(),
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<Admin>) => {
      state.loading = false
      state.admin = action.payload
      state.isAuthenticated = true
      state.error = null
      
      // Persist to localStorage
      localStorage.setItem('admin', JSON.stringify(action.payload))
      localStorage.setItem('adminToken', 'session')
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
      state.isAuthenticated = false
    },
    logout: (state) => {
      state.admin = null
      state.isAuthenticated = false
      state.error = null
      
      // Clear localStorage
      localStorage.removeItem('admin')
      localStorage.removeItem('adminToken')
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions
export default authSlice.reducer

