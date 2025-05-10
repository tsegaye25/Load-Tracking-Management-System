import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  useMediaQuery
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { baseURL } from '../../config';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Create a clean axios instance without interceptors for the forgot password request
  const axiosInstance = axios.create({
    baseURL
  });

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setStatus({ type: '', message: '' });
      
      try {
        // Use the clean axios instance instead of the global one
        await axiosInstance.post('/api/v1/users/forgotPassword', { email: values.email });
        setStatus({
          type: 'success',
          message: 'Password reset link has been sent to your email!'
        });
        // Clear the form
        formik.resetForm();
      } catch (error) {
        console.error('Forgot password error:', error);
        
        // Provide more specific error messages based on the error status
        let errorMessage = 'Something went wrong. Please try again.';
        
        if (error.response) {
          // The server responded with a status code outside the 2xx range
          if (error.response.status === 500) {
            errorMessage = 'The email service is currently unavailable. This is a known issue that the development team is working on. For now, please contact support directly for password assistance.';
          } else if (error.response.status === 404) {
            errorMessage = 'Email address not found. Please check your email and try again.';
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = 'No response from server. Please check your internet connection and try again.';
        }
        
        setStatus({
          type: 'error',
          message: errorMessage
        });
      } finally {
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
              Password Recovery
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
              We'll help you get back into your account
            </Typography>
            <Box 
              component="img"
              src="https://img.freepik.com/free-vector/forgot-password-concept-illustration_114360-1095.jpg"
              alt="Password recovery"
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
        
        {/* Forgot Password Form Section - Will appear second on mobile */}
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
              Forgot Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
          </Box>

          {status.message && (
            <>
              <Alert 
                severity={status.type} 
                sx={{ width: '100%', mb: 3 }}
              >
                {status.message}
              </Alert>
              {status.type === 'error' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                  <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/login')}
                    variant="contained"
                    color="primary"
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 'bold',
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4,
                      },
                    }}
                  >
                    Return to Login
                  </Button>
                  
                  {/* Temporary manual password reset instructions */}
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Temporary Password Reset Process
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      While our automated system is being fixed, you can reset your password by contacting an administrator with the following information:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mb: 1 }}>
                      <Typography component="li" variant="body2">Your registered email address</Typography>
                      <Typography component="li" variant="body2">Your full name</Typography>
                      <Typography component="li" variant="body2">Your department or role</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Contact: <b>admin@ltms.edu</b> or call <b>(123) 456-7890</b> during business hours.
                    </Typography>
                  </Box>
                </Box>
              )}
            </>
          )}

          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ width: '100%' }}
            noValidate // Prevent browser validation to avoid conflicts with our form validation
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              placeholder="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
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
                'Send Reset Link'
              )}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
