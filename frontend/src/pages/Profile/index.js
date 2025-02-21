import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  CircularProgress,
  Avatar,
  IconButton,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  School as SchoolIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { updateProfile } from '../../store/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (user?.avatar) {
      if (user.avatar.startsWith('data:') || user.avatar.startsWith('blob:')) {
        setPreviewImage(user.avatar);
      } else {
        // Handle both absolute and relative paths
        const avatarUrl = user.avatar.startsWith('http') 
          ? user.avatar 
          : `${baseURL}${user.avatar}`;
        setPreviewImage(avatarUrl);
      }
    } else {
      setPreviewImage(`${baseURL}/uploads/profile-images/default-avatar.jpg`);
    }
  }, [user?.avatar, baseURL]);

  const schools = [
    'College of Business and Economics',
    'College of Computing and Informatics',
    'College of Engineering',
    'College of Natural Sciences'
  ];

  const departments = {
    'College of Business and Economics': [
      'Management',
      'Accounting and Finance',
      'Economics',
      'Public Administration',
      'Logistics and Supply Chain Management',
      'Marketing Management',
      'Tourism and Hotel Management'
    ],
    'College of Computing and Informatics': ['Software Engineering', 'Computer Science', 'Information Technology'],
    'College of Engineering': ['Mechanical', 'Electrical', 'Civil',"Textile","Chemical","COTM","Surveying"],
    'College of Natural Sciences': ['Mathematics', 'Physics', 'Chemistry', 'Biology']
  };

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      school: user?.school || '',
      department: user?.department || '',
      phone: user?.phone || '',
      avatar: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      school: Yup.string().required('School is required'),
      department: Yup.string().required('Department is required'),
      phone: Yup.string().required('Phone number is required'),
    }),
    onSubmit: async (values) => {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'avatar' && values[key]) {
          formData.append('avatar', values[key]);
        } else {
          formData.append(key, values[key]);
        }
      });

      const success = await dispatch(updateProfile(formData));
      if (success) {
        setIsEditing(false);
      }
    },
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      formik.setFieldValue('avatar', file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Box position="relative">
            <Avatar
              src={previewImage}
              alt={user?.name}
              sx={{ width: 120, height: 120 }}
              imgProps={{
                onError: () => {
                  setPreviewImage(`${baseURL}/uploads/profile-images/default-avatar.jpg`);
                }
              }}
            />
            {isEditing && (
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'primary.main',
                  '&:hover': { backgroundColor: 'primary.dark' },
                }}
                onClick={() => fileInputRef.current.click()}
              >
                <PhotoCameraIcon sx={{ color: 'white' }} />
              </IconButton>
            )}
            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
            />
          </Box>
          <Box>
            <Typography variant="h4" gutterBottom>
              {user?.name}
            </Typography>
            <Box display="flex" gap={1} alignItems="center">
              <Chip icon={<BadgeIcon />} label={user?.role} color="primary" />
            </Box>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Profile Information</Typography>
                {!isEditing ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : null}
              </Box>
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth disabled={!isEditing}>
                      <InputLabel>School</InputLabel>
                      <Select
                        name="school"
                        value={formik.values.school}
                        onChange={(e) => {
                          formik.setFieldValue('school', e.target.value);
                          formik.setFieldValue('department', '');
                        }}
                        error={formik.touched.school && Boolean(formik.errors.school)}
                        startAdornment={<SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                      >
                        {schools.map((school) => (
                          <MenuItem key={school} value={school}>
                            {school}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth disabled={!isEditing || !formik.values.school}>
                      <InputLabel>Department</InputLabel>
                      <Select
                        name="department"
                        value={formik.values.department}
                        onChange={formik.handleChange}
                        error={formik.touched.department && Boolean(formik.errors.department)}
                      >
                        {formik.values.school &&
                          departments[formik.values.school]?.map((dept) => (
                            <MenuItem key={dept} value={dept}>
                              {dept}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                      helperText={formik.touched.phone && formik.errors.phone}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                  {isEditing && (
                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setIsEditing(false);
                            formik.resetForm();
                            setPreviewImage(user?.avatar || null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={loading}
                        >
                          {loading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Teaching Load
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Total Load:</strong> {user?.totalLoad || 0} hours
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom color="primary">
                  Assigned Courses:
                </Typography>
                {user?.courses?.length > 0 ? (
                  user.courses.map((course) => (
                    <Box key={course._id} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        {course.code} - {course.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {course.creditHours} credit hours
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No courses assigned yet
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
