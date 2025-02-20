import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  users: [], // Add users array
};

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
      localStorage.removeItem('user');
      localStorage.removeItem('token');
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
  },
});

export const { setCredentials, logout, setLoading, setError, setUsers } = authSlice.actions;

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000'; // Updated port to match backend

// Thunk actions
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const { data } = await axios.post('/api/v1/users/login', { email, password });
    dispatch(setCredentials(data));
    toast.success('Login successful!');
    return true;
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed';
    dispatch(setError(message));
    return false;
  } finally {
    dispatch(setLoading(false));
  }
};

export const register = (userData) => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    console.log('Sending registration request with data:', userData);
    const { data } = await axios.post('/api/v1/users/signup', userData);
    console.log('Registration response:', data);
    
    // Check if the current user is an admin
    const currentUser = getState().auth.user;
    if (!currentUser || currentUser.role !== 'admin') {
      // Only set credentials if not an admin registering others
      dispatch(setCredentials(data));
    }
    
    toast.success('Registration successful!');
    return true;
  } catch (error) {
    console.error('Registration error:', error.response || error);
    const message = error.response?.data?.message || 'Registration failed';
    dispatch(setError(message));
    return false;
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateProfile = (userData) => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    const { token } = getState().auth;
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const { data } = await axios.patch('/api/v1/users/updateMe', userData, config);
    const updatedUser = { ...getState().auth.user, ...data.data };
    dispatch(setCredentials({ user: updatedUser, token }));
    toast.success('Profile updated successfully!');
    return true;
  } catch (error) {
    const message = error.response?.data?.message || 'Profile update failed';
    dispatch(setError(message));
    return false;
  } finally {
    dispatch(setLoading(false));
  }
};

export const getAllUsers = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const { data } = await axios.get('/api/v1/users');
    dispatch(setUsers(data.data.users));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch users';
    dispatch(setError(message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateUser = ({ id, userData }) => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    const { token } = getState().auth;
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const { data } = await axios.patch(`/api/v1/users/${id}`, userData, config);
    dispatch(getAllUsers()); // Refresh the users list
    toast.success('User updated successfully!');
    return true;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update user';
    dispatch(setError(message));
    return false;
  } finally {
    dispatch(setLoading(false));
  }
};

export const deleteUser = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    await axios.delete(`/api/v1/users/${id}`);
    toast.success('User deleted successfully!');
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete user';
    dispatch(setError(message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const getInstructors = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const { data } = await axios.get('/api/v1/users/instructors');
    return data.data.instructors;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch instructors';
    dispatch(setError(message));
    throw error;
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
