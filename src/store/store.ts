import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import usersReducer from './slices/usersSlice'
import categoriesReducer from './slices/categoriesSlice'
import bannersReducer from './slices/bannersSlice'
import promptsReducer from './slices/promptsSlice'
import facesReducer from './slices/facesSlice'
import paymentHistoryReducer from './slices/paymentHistorySlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    categories: categoriesReducer,
    banners: bannersReducer,
    prompts: promptsReducer,
    faces: facesReducer,
    paymentHistory: paymentHistoryReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

