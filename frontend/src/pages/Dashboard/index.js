import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  Badge,
  alpha,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import BookIcon from '@mui/icons-material/Book';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ClassIcon from '@mui/icons-material/Class';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoIcon from '@mui/icons-material/Info';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import axios from 'axios';
import { getMyCourses } from '../../store/courseSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myCourses, myCoursesLoading } = useSelector((state) => state.course);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  
  const handleCourseExpand = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  // Fetch instructor payment information
  const fetchPaymentInfo = async () => {
    if (!user || user.role !== 'instructor') return;
    
    try {
      setLoadingPayment(true);
      setPaymentError(null);
      const token = localStorage.getItem('token');
      
      // Get current academic year and semester
      const currentDate = new Date();
      const academicYear = currentDate.getFullYear().toString();
      const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
      const semester = month >= 9 && month <= 2 ? 'First' : 'Second'; // Simplified logic
      
      // First try to get payment from finance endpoint
      try {
        const response = await axios.get(
          `/api/v1/finance/instructors/${user._id}/payments?academicYear=${academicYear}&semester=${semester}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );
        
        if (response.data.data.payment) {
          setPaymentInfo(response.data.data.payment);
          setLoadingPayment(false);
          return;
        }
      } catch (financeError) {
        console.log('Could not access payment directly, calculating from courses...');
        // Don't set an error here, we'll try the fallback approach
      }
      
      // If no payment record exists, calculate from courses
      try {
        // Get all courses with any approval status
        const coursesResponse = await axios.get(
          `/api/v1/courses?instructor=${user._id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );
        
        // Filter for approved courses with any approval status
        const approvedStatuses = [
          'approved', 
          'dean-approved', 
          'vice-director-approved', 
          'scientific-director-approved', 
          'finance-approved'
        ];
        
        // Filter the courses to only include approved ones
        if (coursesResponse.data.data) {
          coursesResponse.data.data = coursesResponse.data.data.filter(course => 
            approvedStatuses.includes(course.status)
          );
        }
        
        if (coursesResponse.data.data && coursesResponse.data.data.length > 0) {
          // Calculate total load using the same logic as in PaymentCalculator
          const totalLoad = coursesResponse.data.data.reduce((sum, course) => {
            const creditHours = course.creditHours || 0;
            const lectureLoad = (course.Hourfor?.lecture || 0) * (course.Number_of_Sections?.lecture || 0);
            const labLoad = (course.Hourfor?.lab || 0) * (course.Number_of_Sections?.lab || 0);
            const tutorialLoad = (course.Hourfor?.tutorial || 0) * (course.Number_of_Sections?.tutorial || 0);
            
            return sum + creditHours + lectureLoad + labLoad + tutorialLoad;
          }, 0);
          
          // Use a default rate per load
          const defaultRate = 500;
          
          // Create payment info based on calculated load
          setPaymentInfo({
            totalLoad: totalLoad,
            paymentAmount: defaultRate,
            totalPayment: Math.round((totalLoad * defaultRate) * 100) / 100,
            status: 'pending',
            createdAt: new Date().toISOString(),
            isEstimated: true // Flag to indicate this is an estimated payment
          });
          setLoadingPayment(false);
          return;
        } else {
          // No courses found
          setPaymentError('No approved courses found to calculate payment');
          setLoadingPayment(false);
          return;
        }
      } catch (coursesError) {
        console.error('Error fetching courses:', coursesError);
        setPaymentError('Could not retrieve course information');
        setLoadingPayment(false);
        return;
      }
    } catch (error) {
      console.error('Error fetching payment info:', error);
      setPaymentError('Failed to load payment information');
      setLoadingPayment(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'instructor') {
      dispatch(getMyCourses());
      fetchPaymentInfo();
    }
  }, [dispatch, user?.role]);

  const calculateTotalHours = () => {
    if (!myCourses?.length) return 0;
    return myCourses.reduce((total, course) => total + (course.totalHours || 0), 0);
  };

  const calculateOverload = () => {
    const totalHours = calculateTotalHours();
    const maxLoad = 12; // Maximum allowed load
    return totalHours > maxLoad ? totalHours - maxLoad : 0;
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
              <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
              <Skeleton variant="text" width={150} height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width={180} height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width={160} height={24} />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
              <Skeleton variant="text" width={180} height={32} sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {[...Array(3)].map((_, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                      <Skeleton variant="text" width={120} height={24} sx={{ mb: 1 }} />
                      <Skeleton variant="text" width={80} height={40} />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
      <Grid container spacing={3} sx={{ maxWidth: '100%', mx: 'auto' }}>
        {/* Welcome Card */}
        {user.role === 'instructor' && (
          <Grid item xs={12}>
            <Card 
              elevation={3} 
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)',
                color: 'white',
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: 'fadeIn 0.8s ease-out',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0, transform: 'translateY(-20px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' }
                },
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  right: -20, 
                  top: -20, 
                  opacity: 0.1,
                  transform: 'rotate(15deg)'
                }}
              >
                <SchoolIcon sx={{ fontSize: 180 }} />
              </Box>
              <CardContent sx={{ position: 'relative', zIndex: 1, py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'white', 
                      color: 'primary.main',
                      width: 56, 
                      height: 56,
                      boxShadow: 2,
                      mr: 2 
                    }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                      Welcome, {user.name}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)} • {user.department} • {user.school}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Chip 
                    icon={<CalendarTodayIcon />} 
                    label={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.15)', 
                      color: 'white',
                      '& .MuiChip-icon': { color: 'white' }
                    }} 
                  />
                  <Chip 
                    icon={<AccessTimeIcon />} 
                    label={`${calculateTotalHours()} Teaching Hours`}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.15)', 
                      color: 'white',
                      '& .MuiChip-icon': { color: 'white' }
                    }} 
                  />
                  {calculateOverload() > 0 && (
                    <Chip 
                      icon={<WarningIcon />} 
                      label={`${calculateOverload()} Overload Hours`}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.15)', 
                        color: 'white',
                        '& .MuiChip-icon': { color: '#ffeb3b' }
                      }} 
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>
              Welcome, {user.name}!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Role: {user.role}
            </Typography>
            {user.school && (
              <Typography variant="subtitle1" color="text.secondary">
                School: {user.school}
              </Typography>
            )}
            {user.department && (
              <Typography variant="subtitle1" color="text.secondary">
                Department: {user.department}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Statistics Section */}
        {user.role === 'instructor' && (
          <Grid item xs={12}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                display: 'flex', 
                flexDirection: 'column'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="600" color="primary.main">
                  Course Load Statistics
                </Typography>
              </Box>
              
              {myCoursesLoading ? (
                <Grid container spacing={2}>
                  {[...Array(3)].map((_, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={index}>
                      <Paper 
                        elevation={2} 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          height: '100%',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'translateY(-4px)' }
                        }}
                      >
                        <Skeleton variant="text" width={120} height={24} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width={80} height={40} />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2.5, 
                        borderRadius: 2,
                        height: '100%',
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.info.light, 0.2)} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`,
                        border: '1px solid',
                        borderColor: 'info.light',
                        animation: 'fadeInLeft 0.8s ease-out',
                        '@keyframes fadeInLeft': {
                          '0%': { opacity: 0, transform: 'translateX(-30px)' },
                          '100%': { opacity: 1, transform: 'translateX(0)' }
                        },
                        '&:hover': { 
                          transform: 'translateY(-8px) scale(1.03)',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                          borderColor: 'info.main'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'info.main', 
                            width: 40, 
                            height: 40,
                            mr: 1.5 
                          }}
                        >
                          <ClassIcon />
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight="600" color="info.dark">
                          Total Courses
                        </Typography>
                      </Box>
                      <Typography variant="h3" fontWeight="700" color="info.dark" sx={{ ml: 1 }}>
                        {myCourses?.length || 0}
                      </Typography>
                      <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="Number of courses assigned to you this semester">
                          <InfoIcon sx={{ fontSize: 16, color: 'info.main', mr: 0.5 }} />
                        </Tooltip>
                        <Typography variant="body2" color="text.secondary">
                          {myCourses?.length === 1 ? 'Course' : 'Courses'} this semester
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2.5, 
                        borderRadius: 2,
                        height: '100%',
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.2)} 0%, ${alpha(theme.palette.success.main, 0.1)} 100%)`,
                        border: '1px solid',
                        borderColor: 'success.light',
                        animation: 'fadeInUp 0.8s ease-out 0.2s both',
                        '@keyframes fadeInUp': {
                          '0%': { opacity: 0, transform: 'translateY(30px)' },
                          '100%': { opacity: 1, transform: 'translateY(0)' }
                        },
                        '&:hover': { 
                          transform: 'translateY(-8px) scale(1.03)',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                          borderColor: 'success.main'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'success.main', 
                            width: 40, 
                            height: 40,
                            mr: 1.5 
                          }}
                        >
                          <AccessTimeIcon />
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight="600" color="success.dark">
                          Total Hours
                        </Typography>
                      </Box>
                      <Typography variant="h3" fontWeight="700" color="success.dark" sx={{ ml: 1 }}>
                        {calculateTotalHours()}
                      </Typography>
                      <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="Total teaching hours assigned to you">
                          <InfoIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                        </Tooltip>
                        <Typography variant="body2" color="text.secondary">
                          Teaching hours this semester
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2.5, 
                        borderRadius: 2,
                        height: '100%',
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        background: (theme) => `linear-gradient(135deg, ${alpha(calculateOverload() > 0 ? theme.palette.warning.light : theme.palette.success.light, 0.2)} 0%, ${alpha(calculateOverload() > 0 ? theme.palette.warning.main : theme.palette.success.main, 0.1)} 100%)`,
                        border: '1px solid',
                        borderColor: calculateOverload() > 0 ? 'warning.light' : 'success.light',
                        animation: 'fadeInRight 0.8s ease-out 0.4s both',
                        '@keyframes fadeInRight': {
                          '0%': { opacity: 0, transform: 'translateX(30px)' },
                          '100%': { opacity: 1, transform: 'translateX(0)' }
                        },
                        '&:hover': { 
                          transform: 'translateY(-8px) scale(1.03)',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                          borderColor: calculateOverload() > 0 ? 'warning.main' : 'success.main'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: calculateOverload() > 0 ? 'warning.main' : 'success.main', 
                            width: 40, 
                            height: 40,
                            mr: 1.5 
                          }}
                        >
                          {calculateOverload() > 0 ? <WarningIcon /> : <AssignmentIcon />}
                        </Avatar>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight="600" 
                          color={calculateOverload() > 0 ? 'warning.dark' : 'success.dark'}
                        >
                          Overload Hours
                        </Typography>
                      </Box>
                      <Typography 
                        variant="h3" 
                        fontWeight="700" 
                        color={calculateOverload() > 0 ? 'warning.dark' : 'success.dark'}
                        sx={{ ml: 1 }}
                      >
                        {calculateOverload()}
                      </Typography>
                      <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center' }}>
                        <Tooltip title={calculateOverload() > 0 ? "You have overload hours" : "You don't have any overload hours"}>
                          <InfoIcon sx={{ 
                            fontSize: 16, 
                            color: calculateOverload() > 0 ? 'warning.main' : 'success.main', 
                            mr: 0.5 
                          }} />
                        </Tooltip>
                        <Typography variant="body2" color="text.secondary">
                          {calculateOverload() > 0 ? 'Hours exceeding standard load' : 'No overload hours'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  {/* Payment Information Card */}
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2.5, 
                        borderRadius: 2,
                        height: '100%',
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.secondary.light, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                        border: '1px solid',
                        borderColor: 'secondary.light',
                        animation: 'fadeInRight 0.8s ease-out 0.4s both',
                        '@keyframes fadeInRight': {
                          '0%': { opacity: 0, transform: 'translateX(30px)' },
                          '100%': { opacity: 1, transform: 'translateX(0)' }
                        },
                        '&:hover': { 
                          transform: 'translateY(-8px) scale(1.03)',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                          borderColor: 'secondary.main'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'secondary.main', 
                            width: 40, 
                            height: 40,
                            mr: 1.5 
                          }}
                        >
                          <PaymentIcon />
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight="600" color="secondary.dark">
                          Payment Status
                        </Typography>
                      </Box>
                      
                      {loadingPayment ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70%' }}>
                          <CircularProgress size={30} color="secondary" sx={{ mb: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            Loading payment...
                          </Typography>
                        </Box>
                      ) : paymentError ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70%' }}>
                          <Typography variant="body2" color="error" sx={{ textAlign: 'center', mb: 1 }}>
                            {paymentError}
                          </Typography>
                          <Button 
                            variant="outlined" 
                            color="secondary" 
                            size="small" 
                            onClick={fetchPaymentInfo}
                            sx={{ mt: 1, fontSize: '0.75rem' }}
                          >
                            Retry
                          </Button>
                        </Box>
                      ) : paymentInfo ? (
                        <>
                          <Typography variant="h3" fontWeight="700" color="secondary.dark" sx={{ ml: 1 }}>
                            {paymentInfo.totalPayment ? `${paymentInfo.totalPayment.toLocaleString()} ETB` : 'Pending'}
                          </Typography>
                          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center' }}>
                            <Tooltip title={`Payment ${paymentInfo.status === 'estimated' || paymentInfo.isEstimated ? 'estimated' : (paymentInfo.status || 'pending')}`}>
                              <InfoIcon sx={{ fontSize: 16, color: 'secondary.main', mr: 0.5 }} />
                            </Tooltip>
                            <Typography variant="body2" color="text.secondary">
                              {paymentInfo.status === 'calculated' ? 'Payment calculated' : 
                               paymentInfo.status === 'pending' ? 'Payment pending approval' : 
                               paymentInfo.status === 'approved' ? 'Payment approved' : 
                               paymentInfo.status === 'estimated' ? 'Estimated payment' : 
                               paymentInfo.isEstimated ? 'Estimated payment' : 'Payment status unknown'}
                            </Typography>
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Total Load: <strong>{paymentInfo.totalLoad || 0} hrs</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Rate per Load: <strong>ETB {paymentInfo.paymentAmount || 0}</strong>
                            </Typography>
                          </Box>
                          {paymentInfo.createdAt && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                              {(paymentInfo.status === 'pending' && !paymentInfo._id) || 
                               paymentInfo.status === 'estimated' || 
                               paymentInfo.isEstimated ? 
                                'Estimated payment (not yet saved)' : 
                                `Last updated: ${new Date(paymentInfo.createdAt).toLocaleDateString()}`}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70%' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                            No payment information available yet
                          </Typography>
                          <Button 
                            variant="outlined" 
                            color="secondary" 
                            size="small" 
                            onClick={fetchPaymentInfo}
                            sx={{ mt: 2, fontSize: '0.75rem' }}
                          >
                            Refresh
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </Paper>
          </Grid>
        )}

        {/* Instructor's Courses Section */}
        {user.role === 'instructor' && (
          <Grid item xs={12}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                display: 'flex', 
                flexDirection: 'column'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <BookIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="600" color="primary.main">
                  My Assigned Courses
                </Typography>
                <Chip 
                  label={`${myCourses?.length || 0} ${myCourses?.length === 1 ? 'Course' : 'Courses'}`}
                  size="small"
                  color="primary"
                  sx={{ ml: 2, fontWeight: 500 }}
                />
              </Box>
              
              {myCoursesLoading ? (
                <Box sx={{ width: '100%' }}>
                  {/* Skeleton for courses */}
                  <Grid container spacing={2}>
                    {[...Array(3)].map((_, index) => (
                      <Grid item xs={12} key={index}>
                        <Paper 
                          elevation={1} 
                          sx={{ 
                            p: 2, 
                            borderRadius: 2,
                            mb: 2,
                            background: (theme) => alpha(theme.palette.background.paper, 0.7)
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                            <Box sx={{ width: '100%' }}>
                              <Skeleton variant="text" width="30%" height={28} />
                              <Skeleton variant="text" width="60%" height={20} />
                            </Box>
                            <Skeleton variant="circular" width={24} height={24} />
                          </Box>
                          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : myCourses?.length > 0 ? (
                <Grid container spacing={2}>
                  {myCourses.map((course, index) => (
                    <Grid item xs={12} key={course._id}>
                      <Accordion 
                        expanded={expandedCourse === course._id}
                        onChange={() => handleCourseExpand(course._id)}
                        elevation={2}
                        sx={{ 
                          borderRadius: '12px',
                          mb: 2,
                          overflow: 'hidden',
                          '&:before': { display: 'none' },
                          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          border: '1px solid',
                          borderColor: 'divider',
                          animation: `fadeInStagger 0.6s ease-out ${0.1 + index * 0.1}s both`,
                          '@keyframes fadeInStagger': {
                            '0%': { opacity: 0, transform: 'translateY(20px)' },
                            '100%': { opacity: 1, transform: 'translateY(0)' }
                          },
                          '&:hover': {
                            transform: 'translateX(5px)',
                            borderColor: 'primary.main',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                          },
                          '&.Mui-expanded': {
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                            borderColor: 'primary.light',
                            background: (theme) => alpha(theme.palette.primary.light, 0.05),
                            transform: 'scale(1.01)'
                          }
                        }}
                      >
                        <AccordionSummary
                          expandIcon={
                            <Avatar 
                              sx={{ 
                                width: 28, 
                                height: 28, 
                                bgcolor: 'primary.main',
                                transition: 'transform 0.3s',
                                transform: expandedCourse === course._id ? 'rotate(180deg)' : 'rotate(0deg)'
                              }}
                            >
                              <ExpandMoreIcon sx={{ fontSize: 18, color: 'white' }} />
                            </Avatar>
                          }
                          sx={{ 
                            px: 3,
                            py: 1.5,
                            '&.Mui-expanded': {
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              background: (theme) => alpha(theme.palette.primary.light, 0.05)
                            },
                            '& .MuiAccordionSummary-content': { 
                              display: 'flex', 
                              alignItems: 'center',
                              gap: 2,
                              flexGrow: 1
                            }
                          }}
                        >
                          <Avatar 
                            sx={{ 
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                              width: 40,
                              height: 40
                            }}
                          >
                            <ClassIcon />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography 
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: '1rem', 
                                color: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}
                            >
                              {course.title}
                            </Typography>

                          </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 3, py: 2.5 }}>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Box sx={{ mb: 2 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    color: 'text.secondary',
                                    mb: 1,
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    fontWeight: 600
                                  }}
                                >
                                  <SchoolIcon sx={{ mr: 1, fontSize: 16 }} />
                                  Department
                                </Typography>
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    fontWeight: 500,
                                    bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                                    p: 1.5,
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider'
                                  }}
                                >
                                  {course.department}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ mb: 2 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    color: 'text.secondary',
                                    mb: 1,
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    fontWeight: 600
                                  }}
                                >
                                  <PersonIcon sx={{ mr: 1, fontSize: 16 }} />
                                  Class Year
                                </Typography>
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    fontWeight: 500,
                                    bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                                    p: 1.5,
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider'
                                  }}
                                >
                                  {course.classYear}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ mb: 2 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    color: 'text.secondary',
                                    mb: 1,
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    fontWeight: 600
                                  }}
                                >
                                  <CalendarTodayIcon sx={{ mr: 1, fontSize: 16 }} />
                                  Semester
                                </Typography>
                                <Chip 
                                  label={course.semester}
                                  sx={{ 
                                    fontWeight: 500,
                                    bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                                    color: 'secondary.main',
                                  }}
                                />
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              {/* Course Hours Section */}
                              <Box sx={{ mb: 2 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    color: 'text.secondary',
                                    mb: 1,
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    fontWeight: 600
                                  }}
                                >
                                  <AccessTimeIcon sx={{ mr: 1, fontSize: 16 }} />
                                  Course Hours
                                </Typography>
                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                  <Grid item xs={6}>
                                    <Paper sx={{ 
                                      p: 1.5, 
                                      borderRadius: 1,
                                      bgcolor: (theme) => alpha(theme.palette.info.light, 0.1),
                                      border: '1px solid',
                                      borderColor: 'info.light',
                                      height: '100%',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <Typography variant="caption" color="text.secondary" gutterBottom>
                                        Credit Hours
                                      </Typography>
                                      <Typography variant="h6" color="info.main" fontWeight="600">
                                        {course.Hourfor?.creaditHours || 0}
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Paper sx={{ 
                                      p: 1.5, 
                                      borderRadius: 1,
                                      bgcolor: (theme) => alpha(theme.palette.success.light, 0.1),
                                      border: '1px solid',
                                      borderColor: 'success.light',
                                      height: '100%',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <Typography variant="caption" color="text.secondary" gutterBottom>
                                        Lecture Hours
                                      </Typography>
                                      <Typography variant="h6" color="success.main" fontWeight="600">
                                        {course.Hourfor?.lecture || 0}
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                </Grid>
                                <Grid container spacing={1}>
                                  <Grid item xs={6}>
                                    <Paper sx={{ 
                                      p: 1.5, 
                                      borderRadius: 1,
                                      bgcolor: (theme) => alpha(theme.palette.warning.light, 0.1),
                                      border: '1px solid',
                                      borderColor: 'warning.light',
                                      height: '100%',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <Typography variant="caption" color="text.secondary" gutterBottom>
                                        Lab Hours
                                      </Typography>
                                      <Typography variant="h6" color="warning.main" fontWeight="600">
                                        {course.Hourfor?.lab || 0}
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Paper sx={{ 
                                      p: 1.5, 
                                      borderRadius: 1,
                                      bgcolor: (theme) => alpha(theme.palette.secondary.light, 0.1),
                                      border: '1px solid',
                                      borderColor: 'secondary.light',
                                      height: '100%',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <Typography variant="caption" color="text.secondary" gutterBottom>
                                        Tutorial Hours
                                      </Typography>
                                      <Typography variant="h6" color="secondary.main" fontWeight="600">
                                        {course.Hourfor?.tutorial || 0}
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                </Grid>
                              </Box>
                              
                              {/* Sections Information */}
                              <Box sx={{ mb: 2 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    color: 'text.secondary',
                                    mb: 1,
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    fontWeight: 600
                                  }}
                                >
                                  <ClassIcon sx={{ mr: 1, fontSize: 16 }} />
                                  Section Hours
                                </Typography>
                                <Grid container spacing={1}>
                                  <Grid item xs={4}>
                                    <Paper sx={{ 
                                      p: 1.5, 
                                      borderRadius: 1,
                                      bgcolor: (theme) => alpha(theme.palette.success.light, 0.1),
                                      border: '1px solid',
                                      borderColor: 'success.light',
                                      height: '100%',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <Typography variant="caption" color="text.secondary" gutterBottom>
                                        Lecture
                                      </Typography>
                                      <Typography variant="h6" color="success.main" fontWeight="600">
                                        {course.Number_of_Sections?.lecture || 0}
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Paper sx={{ 
                                      p: 1.5, 
                                      borderRadius: 1,
                                      bgcolor: (theme) => alpha(theme.palette.warning.light, 0.1),
                                      border: '1px solid',
                                      borderColor: 'warning.light',
                                      height: '100%',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <Typography variant="caption" color="text.secondary" gutterBottom>
                                        Lab
                                      </Typography>
                                      <Typography variant="h6" color="warning.main" fontWeight="600">
                                        {course.Number_of_Sections?.lab || 0}
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Paper sx={{ 
                                      p: 1.5, 
                                      borderRadius: 1,
                                      bgcolor: (theme) => alpha(theme.palette.secondary.light, 0.1),
                                      border: '1px solid',
                                      borderColor: 'secondary.light',
                                      height: '100%',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <Typography variant="caption" color="text.secondary" gutterBottom>
                                        Tutorial
                                      </Typography>
                                      <Typography variant="h6" color="secondary.main" fontWeight="600">
                                        {course.Number_of_Sections?.tutorial || 0}
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                </Grid>
                              </Box>
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                    animation: 'pulseEffect 3s infinite ease-in-out',
                    '@keyframes pulseEffect': {
                      '0%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.1)' },
                      '50%': { boxShadow: '0 0 0 15px rgba(33, 150, 243, 0)' },
                      '100%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)' }
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <BookIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Courses Assigned Yet
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 400, mx: 'auto' }}>
                    You don't have any courses assigned to you this semester. When courses are assigned, they will appear here.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;
