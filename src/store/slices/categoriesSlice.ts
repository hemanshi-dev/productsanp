import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { apiService } from '../../services/api'

interface Category {
  id: string
  title: string
  image: string
  showBanner: boolean
  is_active: boolean
  index: number
  created_at: string
  updated_at: string
}

interface CategoriesState {
  categories: Category[]
  currentCategory: Category | null
  totalCategories: number
  loading: boolean
  error: string | null
  currentPage: number
  pageCursors: { [key: number]: string | undefined }
}

const ITEMS_PER_PAGE = 10

const initialState: CategoriesState = {
  categories: [],
  currentCategory: null,
  totalCategories: 0,
  loading: false,
  error: null,
  currentPage: 1,
  pageCursors: { 1: undefined },
}

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async ({ page, cursor, limit }: { page: number; cursor?: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await apiService.getCategories(limit || ITEMS_PER_PAGE, cursor)
      
      if (response.status && response.data) {
        return {
          categories: response.data.categories,
          pagination: response.data.pagination,
          page,
          cursor: cursor || undefined, // Pass cursor to know if it's a load more operation
          nextCursor: response.data.pagination.next_cursor || undefined,
        }
      }
      return rejectWithValue(response.message || 'Failed to fetch categories')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch categories')
    }
  }
)

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await apiService.createCategory(formData)
      if (response.status) {
        return response.message
      }
      return rejectWithValue(response.message || 'Failed to create category')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create category')
    }
  }
)

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await apiService.updateCategory(formData)
      if (response.status) {
        return response.message
      }
      return rejectWithValue(response.message || 'Failed to update category')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update category')
    }
  }
)

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.deleteCategory(categoryId)
      if (response.status) {
        return categoryId
      }
      return rejectWithValue(response.message || 'Delete failed')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Delete failed')
    }
  }
)

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    resetPagination: (state) => {
      state.currentPage = 1
      state.pageCursors = { 1: undefined }
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null
    },
    setCurrentCategoryFromList: (state, action: PayloadAction<Category>) => {
      state.currentCategory = action.payload
    },
    updateCategoryInList: (state, action: PayloadAction<Partial<Category> & { id: string }>) => {
      const index = state.categories.findIndex(c => c.id === action.payload.id)
      if (index !== -1) {
        state.categories[index] = { ...state.categories[index], ...action.payload }
      }
      if (state.currentCategory?.id === action.payload.id) {
        state.currentCategory = { ...state.currentCategory, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state, action) => {
        // Only set loading if it's not a "load more" operation (no cursor)
        // This prevents the table from blinking when loading more items
        if (!action.meta.arg.cursor) {
          state.loading = true
          state.error = null
        }
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        // If cursor exists, it's a "load more" operation - append categories
        // Otherwise, replace the categories array (initial load or refresh)
        if (action.payload.cursor) {
          state.categories = [...state.categories, ...action.payload.categories]
        } else {
          state.categories = action.payload.categories
        }
        state.totalCategories = action.payload.pagination.total_categories
        state.currentPage = action.payload.page
        
        if (action.payload.pagination.has_more && action.payload.pagination.next_cursor) {
          state.pageCursors[action.payload.page + 1] = action.payload.pagination.next_cursor
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Delete category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c.id !== action.payload)
        state.totalCategories = Math.max(0, state.totalCategories - 1)
      })
  },
})

export const { resetPagination, setCurrentPage, clearCurrentCategory, setCurrentCategoryFromList, updateCategoryInList } = categoriesSlice.actions
export default categoriesSlice.reducer

