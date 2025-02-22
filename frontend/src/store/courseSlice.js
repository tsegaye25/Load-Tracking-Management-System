import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const initialState = {
  courses: [],
  myCourses: [],
  loading: false,
  error: null,
  myCoursesLoading: false,
};

// Thunk actions
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseURL}/api/v1/courses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error fetching courses');
      }
      return rejectWithValue(error.response?.data || 'Error fetching courses');
    }
  }
);

export const getMyCourses = createAsyncThunk(
  'courses/getMyCourses',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseURL}/api/v1/courses/my-courses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching your courses');
      return rejectWithValue(error.response?.data || 'Error fetching your courses');
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const processedData = {
        ...courseData,
        Hourfor: {
          creaditHours: Number(courseData.Hourfor.creaditHours),
          lecture: Number(courseData.Hourfor.lecture),
          lab: Number(courseData.Hourfor.lab),
          tutorial: Number(courseData.Hourfor.tutorial),
        },
        Number_of_Sections: {
          lecture: Number(courseData.Number_of_Sections.lecture),
          lab: Number(courseData.Number_of_Sections.lab),
          tutorial: Number(courseData.Number_of_Sections.tutorial),
        },
        hdp: Number(courseData.hdp),
        position: Number(courseData.position),
        BranchAdvisor: Number(courseData.BranchAdvisor)
      };
      const response = await axios.post(`${baseURL}/api/v1/courses`, processedData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Course created successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course');
      return rejectWithValue(error.response?.data || 'Failed to create course');
    }
  }
);

export const assignCourse = createAsyncThunk(
  'courses/assignCourse',
  async ({ courseId, instructorId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${baseURL}/api/v1/courses/${courseId}/assign`, {
        instructorId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign course');
      return rejectWithValue(error.response?.data || 'Failed to assign course');
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${baseURL}/api/v1/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete course');
      return rejectWithValue(error.response?.data || 'Failed to delete course');
    }
  }
);

export const updateCourseById = createAsyncThunk(
  'courses/updateCourseById',
  async ({ id, courseData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${baseURL}/api/v1/courses/${id}`, courseData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update course');
      return rejectWithValue(error.response?.data || 'Failed to update course');
    }
  }
);

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCourses: (state, { payload }) => {
      state.courses = payload;
    },
    setMyCourses: (state, { payload }) => {
      state.myCourses = payload;
    },
    addCourse: (state, { payload }) => {
      state.courses.push(payload);
    },
    updateCourse: (state, { payload }) => {
      const index = state.courses.findIndex((c) => c._id === payload._id);
      if (index !== -1) {
        state.courses[index] = payload;
      }
    },
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setError: (state, { payload }) => {
      state.error = payload;
      toast.error(payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.data.courses;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get my courses
      .addCase(getMyCourses.pending, (state) => {
        state.myCoursesLoading = true;
      })
      .addCase(getMyCourses.fulfilled, (state, action) => {
        state.myCoursesLoading = false;
        state.myCourses = action.payload.data.courses;
      })
      .addCase(getMyCourses.rejected, (state, action) => {
        state.myCoursesLoading = false;
        state.error = action.payload;
      })
      // Create course
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses.push(action.payload.data.course);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Assign course
      .addCase(assignCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignCourse.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.courses.findIndex((c) => c._id === action.payload.data.course._id);
        if (index !== -1) {
          state.courses[index] = action.payload.data.course;
        }
      })
      .addCase(assignCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete course
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        const courseId = action.payload.data.courseId;
        state.courses = state.courses.filter(course => course._id !== courseId);
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update course
      .addCase(updateCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourseById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.courses.findIndex((c) => c._id === action.payload.data.course._id);
        if (index !== -1) {
          state.courses[index] = action.payload.data.course;
        }
      })
      .addCase(updateCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setCourses,
  setMyCourses,
  addCourse,
  updateCourse,
  setLoading,
  setError,
  clearError,
} = courseSlice.actions;

export default courseSlice.reducer;
