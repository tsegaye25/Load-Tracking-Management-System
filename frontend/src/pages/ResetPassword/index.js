import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
  alpha,
  InputAdornment,
  IconButton,
  useMediaQuery
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { baseURL } from '../../config';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      password: '',
      passwordConfirm: '',
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      passwordConfirm: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Password confirmation is required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setStatus({ type: '', message: '' });
      
      try {
        await axios.patch(`${baseURL}/api/v1/users/resetPassword/${token}`, {
          password: values.password,
          passwordConfirm: values.passwordConfirm,
        });
        
        setStatus({
          type: 'success',
          message: 'Password reset successful! Redirecting to login page...'
        });
        
        // Clear the form
        formik.resetForm();
        
        // Disable the form
        setLoading(true);
        
        // Redirect to login after 2 seconds with a success message
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password has been reset successfully. Please login with your new password.',
              type: 'success'
            }
          });
        }, 2000);
      } catch (error) {
        setStatus({
          type: 'error',
          message: error.response?.data?.message || 'Something went wrong. Please try again.'
        });
        setLoading(false);
      }
    },
  });

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: (theme) => theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.9) : '#f5f5f5',
        p: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 1000,
          width: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Image Section - Will appear first on mobile */}
        <Box
          sx={{
            width: isMobile ? '100%' : '50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            bgcolor: theme.palette.primary.main,
            p: 4,
            color: '#fff',
            overflow: 'hidden',
            backgroundImage: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
            order: isMobile ? 1 : 2, // This will appear first on mobile (order: 1)
          }}
        >
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              textAlign: 'center',
              p: 2,
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Secure Your Account
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
              Create a strong password to protect your information
            </Typography>
            <Box 
              component="img"
              src="https://img.freepik.com/free-vector/privacy-policy-concept-illustration_114360-7853.jpg"
              alt="Secure password"
              sx={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                mb: 3,
              }}
            />
          </Box>
        </Box>
        
        {/* Reset Password Form Section - Will appear second on mobile */}
        <Box
          sx={{
            width: isMobile ? '100%' : '50%',
            p: { xs: 3, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            order: isMobile ? 2 : 1, // This will appear second on mobile (order: 2)
          }}
        >
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/login')}
              sx={{ mr: 2, textTransform: 'none' }}
              disabled={loading}
            >
              Back to Login
            </Button>
          </Box>
          
          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please enter your new password below.
            </Typography>
          </Box>

          {status.message && (
            <Alert 
              severity={status.type} 
              sx={{ width: '100%', mb: 3 }}
            >
              {status.message}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ width: '100%' }}
            noValidate
          >
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              placeholder="New Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="passwordConfirm"
              placeholder="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="passwordConfirm"
              autoComplete="new-password"
              value={formik.values.passwordConfirm}
              onChange={formik.handleChange}
              error={formik.touched.passwordConfirm && Boolean(formik.errors.passwordConfirm)}
              helperText={formik.touched.passwordConfirm && formik.errors.passwordConfirm}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                mb: 3,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: 2,
                bgcolor: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                  boxShadow: 4,
                },
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Reset Password'
              )}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default ResetPassword;
