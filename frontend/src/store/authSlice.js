import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { baseURL } from '../config';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  users: [], // Add users array
};

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue, getState }) => {
    try {
      // Convert hour fields to numbers
      const formattedData = {
        ...userData,
        hdpHour: Number(userData.hdpHour || 0),
        positionHour: Number(userData.positionHour || 0),
        batchAdvisor: Number(userData.batchAdvisor || 0)
      };

      const { data } = await axios.post(`${baseURL}/api/v1/users/signup`, formattedData);
      
      // Check if the current user is an admin
      const currentUser = getState().auth.user;
      if (!currentUser || currentUser.role !== 'admin') {
        // Only set credentials if not an admin registering others
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('token', data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error.response || error);
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          ...(userData instanceof FormData ? {} : { 'Content-Type': 'application/json' })
        }
      };
      
      const { data } = await axios.patch(`${baseURL}/api/v1/users/updateMe`, userData, config);
      const updatedUser = data.data.user;
      return { user: updatedUser, token };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async ({ id, ...userData }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Convert hour fields to numbers
      if (userData.hdpHour !== undefined) userData.hdpHour = Number(userData.hdpHour);
      if (userData.positionHour !== undefined) userData.positionHour = Number(userData.positionHour);
      if (userData.batchAdvisor !== undefined) userData.batchAdvisor = Number(userData.batchAdvisor);

      // Remove password fields if they're empty
      if (userData.password === '') delete userData.password;
      if (userData.passwordConfirm === '') delete userData.passwordConfirm;

      // Log the data being sent to the server for debugging
      console.log('Updating user with data:', { id, userData });

      const { data } = await axios.patch(
        `${baseURL}/api/v1/users/${id}`,
        userData,
        config
      );

      // Log the response from the server
      console.log('Server response:', data);

      // Return the updated user with the ID to ensure proper state update
      return data.data.user;
    } catch (error) {
      console.error('Update user error:', error.response || error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'auth/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${baseURL}/api/v1/users/${id}`);
      return id; // Return the deleted user's ID
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user = payload.user;
      state.token = payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(payload.user));
      localStorage.setItem('token', payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setError: (state, { payload }) => {
      state.error = payload;
      toast.error(payload);
    },
    setUsers: (state, { payload }) => {
      state.users = payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, { payload }) => {
        state.loading = false;
        // Only update state if not an admin registering others
        const currentUser = state.user;
        if (!currentUser || currentUser.role !== 'admin') {
          state.user = payload.data.user;
          state.token = payload.token;
          state.isAuthenticated = true;
        }
        toast.success('Registration successful!');
      })
      .addCase(register.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        toast.error(payload || 'Registration failed');
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.user;
        state.token = payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(payload.user));
        localStorage.setItem('token', payload.token);
        toast.success('Profile updated successfully!');
      })
      .addCase(updateProfile.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        toast.error(payload || 'Profile update failed');
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        
        // Make sure payload is properly defined before updating state
        if (payload && payload._id) {
          // Fix: Use _id instead of id for matching users
          state.users = state.users.map(user => {
            if (user._id === payload._id) {
              console.log('Updating user in state:', user._id, '->', payload);
              return payload;
            }
            return user;
          });
          toast.success('User updated successfully!');
        } else {
          console.error('Invalid payload received:', payload);
          toast.error('Error updating user: Invalid response from server');
        }
      })
      .addCase(updateUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        toast.error(payload || 'Failed to update user');
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.users = state.users.filter(user => user._id !== payload);
      })
      .addCase(deleteUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        toast.error(payload || 'Failed to delete user');
      });
  }
});

export const { setCredentials, logout, setLoading, setError, setUsers, clearError } = authSlice.actions;

// Configure axios defaults
axios.defaults.baseURL = baseURL;

// Thunk actions
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    // Create a custom axios instance for login to avoid polluting console with 401 errors
    const loginAxios = axios.create();
    
    // Custom response interceptor to handle 401 errors silently
    loginAxios.interceptors.response.use(
      response => response, // Return successful responses as-is
      error => {
        // For 401 errors, we'll handle them silently without console errors
        if (error.response && error.response.status === 401) {
          return Promise.reject({
            response: error.response,
            silent: true // Mark this error as silent
          });
        }
        // For other errors, pass them through normally
        return Promise.reject(error);
      }
    );
    
    const { data } = await loginAxios.post(`${baseURL}/api/v1/users/login`, { email, password });
    dispatch(setCredentials(data));
    toast.success('Login successful!');
    return true;
  } catch (error) {
    // Don't log the error to console if it's marked as silent
    if (!error.silent) {
      console.error('Login error:', error);
    }
    
    const message = error.response?.data?.message || 'Incorrect email or password';
    dispatch(setError(message));
    return false;
  } finally {
    dispatch(setLoading(false));
  }
};

export const getAllUsers = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const { data } = await axios.get(`${baseURL}/api/v1/users`);
    dispatch(setUsers(data.data.users));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch users';
    dispatch(setError(message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const getInstructors = () => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    const { user } = getState().auth;
    const { data } = await axios.get(`${baseURL}/api/v1/users/instructors`);
    
    if (!data.data || !data.data.instructors) {
      throw new Error('No instructors data received from server');
    }

    // Filter instructors based on department head's school only
    const filteredInstructors = user?.role === 'department-head'
      ? data.data.instructors.filter(instructor => 
          instructor.school === user.school) // Only filter by school, not department
      : data.data.instructors;

    return filteredInstructors;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch instructors';
    dispatch(setError(message));
    return []; // Return empty array instead of throwing
  } finally {
    dispatch(setLoading(false));
  }
};

// Axios interceptor for token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default authSlice.reducer;
