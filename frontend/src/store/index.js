import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import courseReducer from './courseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
