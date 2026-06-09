import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { apiService } from '../../services/api'

interface Banner {
  id: string
  title: string
  image: string
  created_at: string
  updated_at: string
}

interface BannersState {
  banners: Banner[]
  currentBanner: Banner | null
  totalBanners: number
  loading: boolean
  error: string | null
  searchQuery: string
  currentPage: number
  pageCursors: { [key: number]: string | undefined }
}

const ITEMS_PER_PAGE = 10

const initialState: BannersState = {
  banners: [],
  currentBanner: null,
  totalBanners: 0,
  loading: false,
  error: null,
  searchQuery: '',
  currentPage: 1,
  pageCursors: { 1: undefined },
}

// Async thunks
export const fetchBanners = createAsyncThunk(
  'banners/fetchBanners',
  async ({ page, cursor, limit, query }: { page: number; cursor?: string; limit?: number; query?: string }, { rejectWithValue }) => {
    try {
      let response
      if (query && query.length >= 3) {
        // Use search API when query is provided
        response = await apiService.searchBanners(query, limit || ITEMS_PER_PAGE)
        if (response.status && response.data) {
          return { 
            banners: response.data.banners, 
            pagination: { 
              total_banners: response.data.banners.length,
              has_more: false,
              next_cursor: undefined,
              banners_returned: response.data.banners.length,
              limit: limit || ITEMS_PER_PAGE
            }, 
            page,
            nextCursor: undefined,
          }
        }
      } else {
        // Use regular get API
        response = await apiService.getBanners(limit || ITEMS_PER_PAGE, cursor)
        if (response.status && response.data) {
          return { 
            banners: response.data.banners, 
            pagination: response.data.pagination, 
            page,
            cursor: cursor || undefined, // Pass cursor to know if it's a load more operation
            nextCursor: response.data.pagination.next_cursor || undefined,
          }
        }
      }
      return rejectWithValue(response?.message || 'Failed to fetch banners')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch banners')
    }
  }
)

export const createBanner = createAsyncThunk(
  'banners/createBanner',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await apiService.createBanner(formData)
      if (response.status) {
        return response.message
      }
      return rejectWithValue(response.message || 'Failed to create banner')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create banner')
    }
  }
)

export const updateBanner = createAsyncThunk(
  'banners/updateBanner',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await apiService.updateBanner(formData)
      if (response.status) {
        return response.message
      }
      return rejectWithValue(response.message || 'Failed to update banner')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update banner')
    }
  }
)

export const deleteBanner = createAsyncThunk(
  'banners/deleteBanner',
  async (bannerId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.deleteBanner(bannerId)
      if (response.status) {
        return bannerId
      }
      return rejectWithValue(response.message || 'Failed to delete banner')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete banner')
    }
  }
)

const bannersSlice = createSlice({
  name: 'banners',
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
    clearCurrentBanner: (state) => {
      state.currentBanner = null
    },
    setCurrentBannerFromList: (state, action: PayloadAction<Banner>) => {
      state.currentBanner = action.payload
    },
    updateBannerInList: (state, action: PayloadAction<Partial<Banner> & { id: string }>) => {
      const index = state.banners.findIndex(b => b.id === action.payload.id)
      if (index !== -1) {
        state.banners[index] = { ...state.banners[index], ...action.payload }
      }
      if (state.currentBanner?.id === action.payload.id) {
        state.currentBanner = { ...state.currentBanner, ...action.payload }
      }
    },
    setPageCursor: (state, action: PayloadAction<{ page: number; cursor: string | undefined }>) => {
      state.pageCursors[action.payload.page] = action.payload.cursor
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch banners
      .addCase(fetchBanners.pending, (state, action) => {
        // Only set loading if it's not a "load more" operation (no cursor)
        // This prevents the table from blinking when loading more items
        if (!action.meta.arg.cursor) {
          state.loading = true
          state.error = null
        }
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false
        // If cursor exists, it's a "load more" operation - append banners
        // Otherwise, replace the banners array (initial load or refresh)
        if (action.payload.cursor) {
          state.banners = [...state.banners, ...action.payload.banners]
        } else {
          state.banners = action.payload.banners
        }
        state.totalBanners = action.payload.pagination.total_banners
        state.currentPage = action.payload.page
        state.error = null
        // Update page cursor if next cursor exists
        if (action.payload.nextCursor) {
          state.pageCursors[action.payload.page + 1] = action.payload.nextCursor
        }
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create banner
      .addCase(createBanner.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBanner.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Update banner
      .addCase(updateBanner.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateBanner.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Delete banner
      .addCase(deleteBanner.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.loading = false
        state.banners = state.banners.filter((banner) => banner.id !== action.payload)
        state.totalBanners = Math.max(0, state.totalBanners - 1)
        state.error = null
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setSearchQuery, resetPagination, setCurrentPage, clearCurrentBanner, setCurrentBannerFromList, updateBannerInList, setPageCursor } = bannersSlice.actions
export default bannersSlice.reducer

