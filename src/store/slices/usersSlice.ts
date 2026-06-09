import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { apiService, type UserListItem } from '../../services/api'

interface CreditHistoryItem {
  id: string
  change: number
  previous: number
  new: number
  reason: string
  action_by: string
  timestamp: string
}

interface UserDetail extends UserListItem {
  creditHistory?: CreditHistoryItem[]
  currentCredits?: number
}

interface UsersState {
  users: UserListItem[]
  currentUser: UserDetail | null
  totalUsers: number
  loading: boolean
  error: string | null
  searchQuery: string
  currentPage: number
  pageCursors: { [key: number]: string | undefined }
  creditHistoryLoading: boolean
}

const ITEMS_PER_PAGE = 10

const initialState: UsersState = {
  users: [],
  currentUser: null,
  totalUsers: 0,
  loading: false,
  error: null,
  searchQuery: '',
  currentPage: 1,
  pageCursors: { 1: undefined },
  creditHistoryLoading: false,
}

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ page, cursor, query }: { page: number; cursor?: string; query?: string }, { rejectWithValue }) => {
    try {
      const response = query
        ? await apiService.searchUsers(query, ITEMS_PER_PAGE, cursor)
        : await apiService.getUserList(ITEMS_PER_PAGE, cursor)
      
      if (response.status && response.data) {
        return {
          users: response.data.users,
          pagination: response.data.pagination,
          page,
          cursor: cursor || undefined, // Pass cursor to know if it's a load more operation
          nextCursor: response.data.pagination.next_cursor || undefined,
        }
      }
      return rejectWithValue(response.message || 'Failed to fetch users')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch users')
    }
  }
)

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getUserList(100)
      if (response.status && response.data) {
        const user = response.data.users.find(u => u.id === userId)
        if (user) {
          return user
        }
        return rejectWithValue('User not found')
      }
      return rejectWithValue('Failed to fetch user')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user')
    }
  }
)

export const fetchCreditHistory = createAsyncThunk(
  'users/fetchCreditHistory',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getCreditHistory(userId, 50)
      if (response.status && response.data) {
        return {
          history: response.data.history,
          currentCredits: response.data.user.current_credits,
        }
      }
      return rejectWithValue('Failed to fetch credit history')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch credit history')
    }
  }
)

export const updateUserStatus = createAsyncThunk(
  'users/updateUserStatus',
  async ({ userId, isActive, reason }: { userId: string; isActive: boolean; reason: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateUserStatus({
        user_id: userId,
        is_active: isActive,
        reason,
      })
      if (response.status) {
        return { userId, isActive }
      }
      return rejectWithValue(response.message || 'Update failed')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Update failed')
    }
  }
)

export const updateUserCredits = createAsyncThunk(
  'users/updateUserCredits',
  async ({ userId, creditsChange, reason }: { userId: string; creditsChange: number; reason: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateCredits({
        user_id: userId,
        credits_change: creditsChange,
        reason,
      })
      if (response.status) {
        return { userId, creditsChange, reason }
      }
      return rejectWithValue(response.message || 'Update failed')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Update failed')
    }
  }
)

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.deleteUser(userId)
      if (response.status) {
        return userId
      }
      return rejectWithValue(response.message || 'Delete failed')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Delete failed')
    }
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    resetPagination: (state) => {
      state.currentPage = 1
      state.pageCursors = { 1: undefined }
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    clearCurrentUser: (state) => {
      state.currentUser = null
    },
    setCurrentUserFromList: (state, action: PayloadAction<UserListItem>) => {
      state.currentUser = action.payload as UserDetail
    },
    updateUserInList: (state, action: PayloadAction<Partial<UserListItem> & { id: string }>) => {
      const index = state.users.findIndex(u => u.id === action.payload.id)
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload }
      }
      if (state.currentUser?.id === action.payload.id) {
        state.currentUser = { ...state.currentUser, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state, action) => {
        // Only set loading if it's not a "load more" operation (no cursor)
        // This prevents the table from blinking when loading more items
        if (!action.meta.arg.cursor && !state.loading) {
          state.loading = true
          state.error = null
        }
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        // If cursor exists, it's a "load more" operation - append users
        // Otherwise, replace the users array (initial load or refresh)
        if (action.payload.cursor) {
          state.users = [...state.users, ...action.payload.users]
        } else {
          state.users = action.payload.users
        }
        state.totalUsers = action.payload.pagination.total_users
        state.currentPage = action.payload.page
        
        if (action.payload.pagination.has_more && action.payload.pagination.next_cursor) {
          state.pageCursors[action.payload.page + 1] = action.payload.pagination.next_cursor
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload as UserDetail
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Fetch credit history
      .addCase(fetchCreditHistory.pending, (state) => {
        state.creditHistoryLoading = true
      })
      .addCase(fetchCreditHistory.fulfilled, (state, action) => {
        state.creditHistoryLoading = false
        // Update credit history for currentUser if it exists
        if (state.currentUser) {
          state.currentUser.creditHistory = action.payload.history
          state.currentUser.currentCredits = action.payload.currentCredits
        }
      })
      .addCase(fetchCreditHistory.rejected, (state) => {
        state.creditHistoryLoading = false
      })
      // Update user status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.userId)
        if (index !== -1) {
          state.users[index].is_active = action.payload.isActive
        }
        if (state.currentUser?.id === action.payload.userId) {
          state.currentUser.is_active = action.payload.isActive
        }
      })
      // Update user credits
      .addCase(updateUserCredits.fulfilled, (state, action) => {
        // Update credits in users list
        const index = state.users.findIndex(u => u.id === action.payload.userId)
        if (index !== -1) {
          state.users[index].credits = (state.users[index].credits || 0) + action.payload.creditsChange
        }
        // Update current user credits
        if (state.currentUser?.id === action.payload.userId) {
          state.currentUser.currentCredits = (state.currentUser.currentCredits || 0) + action.payload.creditsChange
        }
      })
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload)
        state.totalUsers = Math.max(0, state.totalUsers - 1)
      })
  },
})

export const { setSearchQuery, resetPagination, setCurrentPage, clearCurrentUser, setCurrentUserFromList, updateUserInList } = usersSlice.actions
export default usersSlice.reducer

