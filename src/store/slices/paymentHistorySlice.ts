import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { apiService } from '../../services/api'

export interface Purchase {
  id: string
  order_id: string
  user_id: string
  user_name: string
  user_email: string
  amount: number
  base_amount: number
  gst_amount: number
  gst_rate: number
  credits_added: number
  created_at: string
  completed_at: string
}

interface PaymentHistoryState {
  purchases: Purchase[]
  totalPurchases: number
  loading: boolean
  error: string | null
  currentPage: number
  pageCursors: { [key: number]: string | undefined }
}

const ITEMS_PER_PAGE = 10

const initialState: PaymentHistoryState = {
  purchases: [],
  totalPurchases: 0,
  loading: false,
  error: null,
  currentPage: 1,
  pageCursors: { 1: undefined },
}

export const fetchPurchases = createAsyncThunk(
  'paymentHistory/fetchPurchases',
  async ({ page, cursor, limit }: { page: number; cursor?: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await apiService.getPurchaseHistory(limit || ITEMS_PER_PAGE, cursor)
      
      if (response.status && response.data) {
        return {
          purchases: response.data.purchases,
          pagination: response.data.pagination,
          page,
          cursor: cursor || undefined, // Pass cursor to know if it's a load more operation
          nextCursor: response.data.pagination.next_cursor || undefined,
        }
      }
      return rejectWithValue(response?.message || 'Failed to fetch purchases')
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch purchases')
    }
  }
)

export const resetPagination = createAsyncThunk(
  'paymentHistory/resetPagination',
  async () => {
    return {}
  }
)

const paymentHistorySlice = createSlice({
  name: 'paymentHistory',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    setPageCursor: (state, action: PayloadAction<{ page: number; cursor: string | undefined }>) => {
      state.pageCursors[action.payload.page] = action.payload.cursor
    },
  },
  extraReducers: (builder) => {
    builder
      // Reset pagination
      .addCase(resetPagination.fulfilled, (state) => {
        state.currentPage = 1
        state.pageCursors = { 1: undefined }
      })
      // Fetch purchases
      .addCase(fetchPurchases.pending, (state, action) => {
        // Only set loading if it's not a "load more" operation (no cursor)
        // This prevents the table from blinking when loading more items
        if (!action.meta.arg.cursor) {
          state.loading = true
          state.error = null
        }
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.loading = false
        // If cursor exists, it's a "load more" operation - append purchases
        // Otherwise, replace the purchases array (initial load or refresh)
        if (action.payload.cursor) {
          state.purchases = [...state.purchases, ...action.payload.purchases]
        } else {
          state.purchases = action.payload.purchases
        }
        state.totalPurchases = action.payload.pagination.count
        state.currentPage = action.payload.page
        state.error = null
        // Update page cursor if next cursor exists
        if (action.payload.nextCursor) {
          state.pageCursors[action.payload.page + 1] = action.payload.nextCursor
        }
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setCurrentPage, setPageCursor } = paymentHistorySlice.actions
export default paymentHistorySlice.reducer

