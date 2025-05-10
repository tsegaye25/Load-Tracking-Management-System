import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Link,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  useTheme,
  alpha,
  InputAdornment,
  IconButton,
  Divider,
  useMediaQuery
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { login } from '../../store/authSlice';
import { useState } from 'react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);
  const message = location.state?.message;
  const messageType = location.state?.type;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    }),
    onSubmit: async (values) => {
      const success = await dispatch(login(values.email, values.password));
      if (success) {
        navigate('/');
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
              Load Tracking Management System
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
              Efficiently manage course loads and instructor assignments
            </Typography>
            <Box 
              component="img"
              src="https://img.freepik.com/free-vector/college-university-students-group-young-happy-people-standing-isolated-white-background_575670-66.jpg"
              alt="University students"
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
        
        {/* Login Form Section - Will appear second on mobile */}
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
              onClick={() => navigate('/')}
              sx={{ mr: 2, textTransform: 'none' }}
              disabled={loading}
            >
              Back to Landing Page
            </Button>
          </Box>
          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              LTMS
            </Typography>
            <Typography variant="h5" gutterBottom>
              Sign in to your account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your credentials to access your account
            </Typography>
          </Box>

          {/* Show location state messages (e.g., after password reset) */}
          {message && (
            <Alert 
              severity={messageType || 'info'} 
              sx={{ width: '100%', mb: 3 }}
              onClose={() => {
                // Clear the message from location state
                window.history.replaceState({}, document.title)
              }}
            >
              {message}
            </Alert>
          )}
          
          {/* Show auth error messages immediately above the form */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mb: 3,
                borderLeft: '4px solid #f44336',
                '& .MuiAlert-icon': {
                  color: '#f44336'
                }
              }}
              onClose={() => {
                // Clear the error message
                dispatch({ type: 'auth/clearError' })
              }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ width: '100%' }}
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault(); // Prevent form submission
                  navigate('/forgot-password');
                }}
                type="button" // Explicitly set type to button to prevent form submission
                sx={{ textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 1,
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
                'Sign In'
              )}
            </Button>
            {/* Sign up link removed as requested */}
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Login;
