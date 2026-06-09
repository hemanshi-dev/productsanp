import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { apiService } from '../../services/api'

interface Face {
  id: string
  face_id: string
  image_url: string
  path: string
  type?: string
  created_at: string
  updated_at?: string
}

interface FacesState {
  faces: Face[]
  currentFace: Face | null
  totalFaces: number
  loading: boolean
  error: string | null
  currentPage: number
  pageCursors: { [key: number]: string | undefined }
}

const ITEMS_PER_PAGE = 10

const initialState: FacesState = {
  faces: [],
  currentFace: null,
  totalFaces: 0,
  loading: false,
  error: null,
  currentPage: 1,
  pageCursors: { 1: undefined },
}

// Async thunks
export const fetchFaces = createAsyncThunk(
  'faces/fetchFaces',
  async ({ page, cursor, limit }: { page: number; cursor?: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await apiService.getFaces(limit || ITEMS_PER_PAGE, cursor)
      if (response.status && response.data) {
        return { 
          faces: response.data.faces, 
          pagination: response.data.pagination, 
          page,
          cursor: cursor || undefined, // Pass cursor to know if it's a load more operation
          nextCursor: response.data.pagination.next_cursor || undefined,
        }
      }
      return rejectWithValue(response?.message || 'Failed to fetch faces')
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch faces')
    }
  }
)

export const createFace = createAsyncThunk(
  'faces/createFace',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await apiService.createFace(formData)
      if (response.status) {
        return response.message
      }
      return rejectWithValue(response.message || 'Failed to create face')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create face')
    }
  }
)

export const updateFace = createAsyncThunk(
  'faces/updateFace',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await apiService.updateFace(formData)
      if (response.status) {
        return response.message
      }
      return rejectWithValue(response.message || 'Failed to update face')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update face')
    }
  }
)

export const deleteFace = createAsyncThunk(
  'faces/deleteFace',
  async (faceId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.deleteFace(faceId)
      if (response.status) {
        return faceId
      }
      return rejectWithValue(response.message || 'Failed to delete face')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete face')
    }
  }
)

const facesSlice = createSlice({
  name: 'faces',
  initialState,
  reducers: {
    resetPagination: (state) => {
      state.currentPage = 1
      state.pageCursors = { 1: undefined }
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    clearCurrentFace: (state) => {
      state.currentFace = null
    },
    setCurrentFaceFromList: (state, action: PayloadAction<Face>) => {
      state.currentFace = action.payload
    },
    updateFaceInList: (state, action: PayloadAction<Partial<Face> & { id: string }>) => {
      const index = state.faces.findIndex(f => f.id === action.payload.id)
      if (index !== -1) {
        state.faces[index] = { ...state.faces[index], ...action.payload }
      }
      if (state.currentFace?.id === action.payload.id) {
        state.currentFace = { ...state.currentFace, ...action.payload }
      }
    },
    setPageCursor: (state, action: PayloadAction<{ page: number; cursor: string | undefined }>) => {
      state.pageCursors[action.payload.page] = action.payload.cursor
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFaces.pending, (state, action) => {
        // Only set loading if it's not a "load more" operation (no cursor)
        // This prevents the table from blinking when loading more items
        if (!action.meta.arg.cursor && !state.loading) {
          state.loading = true
          state.error = null
        }
      })
      .addCase(fetchFaces.fulfilled, (state, action) => {
        state.loading = false
        // If cursor exists, it's a "load more" operation - append faces
        // Otherwise, replace the faces array (initial load or refresh)
        if (action.payload.cursor) {
          state.faces = [...state.faces, ...action.payload.faces]
        } else {
          state.faces = action.payload.faces
        }
        state.totalFaces = action.payload.pagination.total_faces
        state.currentPage = action.payload.page
        state.error = null
        // Update page cursor if next cursor exists
        if (action.payload.nextCursor) {
          state.pageCursors[action.payload.page + 1] = action.payload.nextCursor
        }
      })
      .addCase(fetchFaces.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createFace.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createFace.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(createFace.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateFace.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateFace.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(updateFace.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(deleteFace.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteFace.fulfilled, (state, action) => {
        state.loading = false
        state.faces = state.faces.filter((face) => face.id !== action.payload)
        state.totalFaces = Math.max(0, state.totalFaces - 1)
        state.error = null
      })
      .addCase(deleteFace.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { resetPagination, setCurrentPage, clearCurrentFace, setCurrentFaceFromList, updateFaceInList, setPageCursor } = facesSlice.actions
export default facesSlice.reducer

