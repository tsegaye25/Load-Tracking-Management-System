import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Card,
  CardContent,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { updateProfile } from '../../store/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    ...(user?.role !== 'admin' && {
      school: user?.school || '',
      department: user?.department || ''
    }),
    avatar: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getAvatarUrl = () => {
    if (previewImage) return previewImage;
    if (user?.avatar) {
      if (user.avatar.startsWith('data:') || user.avatar.startsWith('blob:')) {
        return user.avatar;
      }
      return user.avatar.startsWith('http') 
        ? user.avatar 
        : `${baseURL}${user.avatar}`;
    }
    return `${baseURL}/uploads/profile-images/default-avatar.jpg`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'avatar' && formData[key]) {
          submitData.append('avatar', formData[key]);
        } else if (key !== 'avatar') {
          submitData.append(key, formData[key]);
        }
      });

      const result = await dispatch(updateProfile(submitData)).unwrap();
      if (result) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      ...(user?.role !== 'admin' && {
        school: user?.school || '',
        department: user?.department || ''
      }),
      avatar: null
    });
    setPreviewImage(null);
    setIsEditing(false);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Profile
          </Typography>
          {!isEditing ? (
            <Button
              startIcon={<EditIcon />}
              variant="contained"
              color="primary"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Box>
              <Button
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{ mr: 1 }}
                disabled={loading}
              >
                Save
              </Button>
              <Button
                startIcon={<CancelIcon />}
                variant="outlined"
                color="error"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>

        <Grid container spacing={4}>
          {/* Profile Overview Card */}
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                  <Box position="relative">
                    <Avatar
                      src={getAvatarUrl()}
                      alt={user?.name}
                      sx={{
                        width: 120,
                        height: 120,
                        mb: 2,
                        bgcolor: 'primary.main',
                        fontSize: '3rem'
                      }}
                    />
                    {isEditing && (
                      <IconButton
                        sx={{
                          position: 'absolute',
                          bottom: 10,
                          right: -10,
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
                  <Typography variant="h5" gutterBottom>
                    {user?.name}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    {user?.role?.replace('-', ' ').toUpperCase()}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">{user?.name}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">{user?.email}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">{user?.phone}</Typography>
                  </Box>
                  {user?.role !== 'admin' && (
                    <>
                      <Box display="flex" alignItems="center" mb={1}>
                        <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2">{user?.school}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={1}>
                        <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2">{user?.department}</Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Edit Form */}
          <Grid item xs={12} md={8}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      type="email"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  {user?.role !== 'admin' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="School"
                          name="school"
                          value={formData.school}
                          onChange={handleChange}
                          disabled={!isEditing}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Department"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          disabled={!isEditing}
                          required
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;
