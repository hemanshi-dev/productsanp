import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { apiService } from '../../services/api'

interface Prompt {
  id: string
  title: string
  image: string | null
  prompt?: string // Legacy format - single prompt string
  prompts?: string[] // New format - array of prompts
  visible: boolean
  created_at: string
  updated_at: string
}

interface PromptsState {
  prompts: Prompt[]
  currentPrompt: Prompt | null
  totalPrompts: number
  loading: boolean
  error: string | null
  searchQuery: string
  currentPage: number
  pageCursors: { [key: number]: string | undefined }
}

const ITEMS_PER_PAGE = 10

const initialState: PromptsState = {
  prompts: [],
  currentPrompt: null,
  totalPrompts: 0,
  loading: false,
  error: null,
  searchQuery: '',
  currentPage: 1,
  pageCursors: { 1: undefined },
}

export const fetchPrompts = createAsyncThunk(
  'prompts/fetchPrompts',
  async ({ page, cursor, limit, query }: { page: number; cursor?: string; limit?: number; query?: string }, { rejectWithValue }) => {
    try {
      let response
      if (query && query.length >= 3) {
        // Use search API when query is provided
        response = await apiService.searchPrompts(query, limit || ITEMS_PER_PAGE)
        if (response.status && response.data) {
          return { 
            prompts: response.data.prompts, 
            pagination: { 
              total_prompts: response.data.prompts.length,
              has_more: false,
              next_cursor: undefined,
              returned: response.data.prompts.length,
              limit: limit || ITEMS_PER_PAGE
            }, 
            page,
            nextCursor: undefined,
          }
        }
      } else {
        // Use regular get API
        response = await apiService.getPrompts(limit || ITEMS_PER_PAGE, cursor)
        if (response.status && response.data) {
          return {
            prompts: response.data.prompts,
            pagination: response.data.pagination,
            page,
            cursor: cursor || undefined, // Pass cursor to know if it's a load more operation
            nextCursor: response.data.pagination.next_cursor || undefined,
          }
        }
      }
      return rejectWithValue(response?.message || 'Failed to fetch prompts')
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch prompts')
    }
  }
)

export const createPrompt = createAsyncThunk(
  'prompts/createPrompt',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await apiService.createPrompt(formData)
      if (response && response.status) {
        return String(response.message || 'Prompt created successfully')
      }
      return rejectWithValue(String(response?.message || 'Failed to create prompt'))
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to create prompt'
      return rejectWithValue(String(errorMessage))
    }
  }
)

export const updatePrompt = createAsyncThunk(
  'prompts/updatePrompt',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await apiService.updatePrompt(formData)
      if (response && response.status) {
        return String(response.message || 'Prompt updated successfully')
      }
      return rejectWithValue(String(response?.message || 'Failed to update prompt'))
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to update prompt'
      return rejectWithValue(String(errorMessage))
    }
  }
)

export const deletePrompt = createAsyncThunk(
  'prompts/deletePrompt',
  async (promptId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.deletePrompt(promptId)
      if (response.status) {
        return promptId
      }
      return rejectWithValue(response.message || 'Failed to delete prompt')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete prompt')
    }
  }
)

const promptsSlice = createSlice({
  name: 'prompts',
  initialState,
  reducers: {
    resetPagination: (state) => {
      state.currentPage = 1
      state.pageCursors = { 1: undefined }
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    clearCurrentPrompt: (state) => {
      state.currentPrompt = null
    },
    setCurrentPromptFromList: (state, action: PayloadAction<Prompt>) => {
      state.currentPrompt = action.payload
    },
    updatePromptInList: (state, action: PayloadAction<Partial<Prompt> & { id: string }>) => {
      const index = state.prompts.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.prompts[index] = { ...state.prompts[index], ...action.payload }
      }
      if (state.currentPrompt?.id === action.payload.id) {
        state.currentPrompt = { ...state.currentPrompt, ...action.payload }
      }
    },
    setPageCursor: (state, action: PayloadAction<{ page: number; cursor: string | undefined }>) => {
      state.pageCursors[action.payload.page] = action.payload.cursor
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrompts.pending, (state, action) => {
        // Only set loading if it's not a "load more" operation (no cursor)
        // This prevents the table from blinking when loading more items
        if (!action.meta.arg.cursor && !state.loading) {
          state.loading = true
          state.error = null
        }
      })
      .addCase(fetchPrompts.fulfilled, (state, action) => {
        state.loading = false
        // If cursor exists, it's a "load more" operation - append prompts
        // Otherwise, replace the prompts array (initial load or refresh)
        if (action.payload.cursor) {
          state.prompts = [...state.prompts, ...action.payload.prompts]
        } else {
          state.prompts = action.payload.prompts
        }
        state.totalPrompts = action.payload.pagination.total_prompts
        state.currentPage = action.payload.page
        state.error = null
        // Update page cursor if next cursor exists
        if (action.payload.nextCursor) {
          state.pageCursors[action.payload.page + 1] = action.payload.nextCursor
        }
      })
      .addCase(fetchPrompts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createPrompt.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPrompt.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(createPrompt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updatePrompt.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePrompt.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(updatePrompt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(deletePrompt.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deletePrompt.fulfilled, (state, action) => {
        state.loading = false
        state.prompts = state.prompts.filter((prompt) => prompt.id !== action.payload)
        state.totalPrompts = Math.max(0, state.totalPrompts - 1)
        state.error = null
      })
      .addCase(deletePrompt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { resetPagination, setCurrentPage, clearCurrentPrompt, setCurrentPromptFromList, updatePromptInList, setPageCursor, setSearchQuery } = promptsSlice.actions
export default promptsSlice.reducer

