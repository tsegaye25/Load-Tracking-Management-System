import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import axios from 'axios';
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
import AssignmentIcon from '@mui/icons-material/Assignment';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoIcon from '@mui/icons-material/Info';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PaymentIcon from '@mui/icons-material/Payment';
import ClassIcon from '@mui/icons-material/Class';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getMyCourses } from '../../store/courseSlice';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useSelector((state) => state.auth);
  const { myCourses, myCoursesLoading } = useSelector((state) => state.course);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  
  // Department head statistics
  const [departmentStats, setDepartmentStats] = useState(null);
  const [departmentStatsLoading, setDepartmentStatsLoading] = useState(true);
  const [departmentCourses, setDepartmentCourses] = useState(0);
  const [assignedCourses, setAssignedCourses] = useState(0);
  const [unassignedCourses, setUnassignedCourses] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [instructorList, setInstructorList] = useState([]);
  const [courseStatusDistribution, setCourseStatusDistribution] = useState([]);
  const [courseTypeDistribution, setCourseTypeDistribution] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  
  const handleCourseExpand = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  // Fetch payment information for the instructor
  const fetchPaymentInfo = async () => {
    if (!user || user.role !== 'instructor') return;
    
    setPaymentLoading(true);
    setPaymentError(null);
    
    try {
      const token = localStorage.getItem('token');
      const academicYear = new Date().getFullYear().toString();
      const semester = 'First'; // TODO: Make this dynamic based on current semester
      
      const response = await axios.get(
        `/api/v1/finance/instructors/${user._id}/payments?academicYear=${academicYear}&semester=${semester}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.status === 'success' && response.data.data.payment) {
        setPaymentInfo(response.data.data.payment);
      } else {
        // No payment found but request was successful
        setPaymentInfo(null);
      }
    } catch (error) {
      console.error('Error fetching payment information:', error);
      
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 404) {
          // No payment found - this is not an error, just no data yet
          setPaymentInfo(null);
          return;
        } else if (error.response.status === 403) {
          setPaymentError('You do not have permission to view payment information.');
          return;
        }
      }
      
      // Generic error message for other errors
      setPaymentError('Failed to load payment information. Please try again later.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Fetch department head statistics
  const fetchDepartmentHeadStats = async () => {
    try {
      setDepartmentStatsLoading(true);
      
      // Fetch courses for the department head's department
      const token = localStorage.getItem('token');
      
      // First, fetch dashboard data from the dashboard API
      const dashboardResponse = await axios.get(`/api/v1/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Then fetch all courses for more detailed information
      const coursesResponse = await axios.get(`/api/v1/courses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Get instructors in the department
      const instructorsResponse = await axios.get(`/api/v1/users/instructors`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Filter instructors by department and school
      const departmentInstructors = instructorsResponse.data.data.instructors.filter(instructor => 
        instructor.department === user.department && instructor.school === user.school
      );
      
      // Filter courses by department and school
      const departmentCourses = coursesResponse.data.data.courses.filter(course => 
        course.department === user.department && course.school === user.school
      );
      
      // Get all courses from the same school (for school-wide statistics)
      const schoolCourses = coursesResponse.data.data.courses.filter(course => 
        course.school === user.school
      );
      
      // Get dashboard stats
      const dashboardData = dashboardResponse.data.data;
      
      // Calculate course status distribution
      // Count assigned courses from school-wide courses
      const assignedCoursesCount = schoolCourses.filter(course => 
        course.instructor !== null && course.instructor !== undefined
      ).length;
      
      const statusCounts = {
        assigned: assignedCoursesCount, // School-wide assigned courses
        departmentTotal: departmentCourses.length, // Total department courses
        unassigned: departmentCourses.filter(course => !course.instructor).length, // Department unassigned courses
        pending: departmentCourses.filter(course => course.status === 'pending_assignment' || course.status === 'pending').length // Department pending courses
      };
      
      const statusDistribution = [
        { name: 'Assigned', value: statusCounts.assigned, color: '#2ecc71' },
        { name: 'Department', value: statusCounts.departmentTotal, color: '#3498db' },
        { name: 'Unassigned', value: statusCounts.unassigned, color: '#e74c3c' },
        { name: 'Pending', value: statusCounts.pending, color: '#f39c12' }
      ];
      
      // Create a course status distribution for the pie chart
      const courseTypeDistribution = [
        { 
          name: 'Department Courses', 
          value: departmentCourses.length, 
          color: '#3498db' 
        },
        { 
          name: 'Assigned Courses', 
          value: assignedCoursesCount, 
          color: '#2ecc71' 
        },
        { 
          name: 'Unassigned Courses', 
          value: departmentCourses.filter(course => !course.instructor).length, 
          color: '#e74c3c' 
        },
        { 
          name: 'Pending Approvals', 
          value: departmentCourses.filter(course => 
            course.status === 'pending_assignment' || 
            course.status === 'pending'
          ).length, 
          color: '#f39c12' 
        }
      ];
      
      // Filter out zero values to prevent empty segments
      const filteredTypeDistribution = courseTypeDistribution.filter(item => item.value > 0);
      
      // Generate monthly stats (mock data for now as this would require historical data)
      // In a real implementation, this would come from the backend with actual historical data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const mockMonthlyStats = months.map(month => ({
        month,
        assigned: Math.floor(Math.random() * 10) + 10,
        unassigned: Math.floor(Math.random() * 5) + 2,
        pending: Math.floor(Math.random() * 3) + 1
      }));
      
      // Set state with the fetched data
      setDepartmentStats(dashboardData);
      setDepartmentCourses(departmentCourses.length); // Use actual department course count
      setAssignedCourses(statusCounts.assigned);
      setUnassignedCourses(statusCounts.unassigned);
      setPendingApprovals(statusCounts.pending);
      setInstructorList(departmentInstructors);
      setCourseStatusDistribution(statusDistribution);
      setCourseTypeDistribution(filteredTypeDistribution); // Use filtered distribution
      setMonthlyStats(mockMonthlyStats);
      
    } catch (error) {
      console.error('Error fetching department head statistics:', error);
      enqueueSnackbar('Failed to load department statistics', { variant: 'error' });
    } finally {
      setDepartmentStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'instructor') {
        dispatch(getMyCourses());
        fetchPaymentInfo();
      } else if (user.role === 'department-head') {
        fetchDepartmentHeadStats();
      }
    }
  }, [user]);

  const calculateTotalHours = () => {
    if (!myCourses?.length) return 0;
    
    // Calculate total workload using the formula:
    // Total Hours = (Lecture Hours * Number of Sections Lecture) + 
    //               (Lab Hours * 0.67 * Number of Sections Lab) + 
    //               (Tutorial Hours * 0.67 * Number of Sections Tutorial) + 
    //               HDP Hours + Position Hours + Batch Advisor Hours
    
    const totalHours = myCourses.reduce((total, course) => {
      const lectureLoad = (course.Hourfor?.lecture || 0) * (course.Number_of_Sections?.lecture || 0);
      const labLoad = (course.Hourfor?.lab || 0) * 0.67 * (course.Number_of_Sections?.lab || 0);
      const tutorialLoad = (course.Hourfor?.tutorial || 0) * 0.67 * (course.Number_of_Sections?.tutorial || 0);
      
      // Calculate course workload
      const courseWorkload = lectureLoad + labLoad + tutorialLoad;
      
      return total + courseWorkload;
    }, 0) + (user.hdpHour || 0) + (user.positionHour || 0) + (user.batchAdvisor || 0);
    
    // Round to 2 decimal places
    return parseFloat(totalHours.toFixed(2));
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
        {user.role === 'department-head' && (
          <Grid item xs={12}>
            <Card 
              elevation={3} 
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
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
                      color: '#2c3e50',
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
                      Department Head • {user.department} • {user.school}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
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
                    icon={<ClassIcon />} 
                    label="Department Management"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.15)', 
                      color: 'white',
                      '& .MuiChip-icon': { color: 'white' }
                    }} 
                  />
                  <Chip 
                    icon={<AssignmentIcon />} 
                    label="Course Oversight"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.15)', 
                      color: 'white',
                      '& .MuiChip-icon': { color: 'white' }
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
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

        
        {/* Department Head Statistics Section */}
        {user.role === 'department-head' && (
          <>
            {/* Summary Cards */}
            <Grid item xs={12} container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    borderRadius: 2,
                    height: '100%',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography color="text.secondary" variant="subtitle2" fontWeight="medium">
                          Department Courses
                        </Typography>
                        <Typography variant="h4" sx={{ mt: 1, mb: 2 }}>
                          {departmentStatsLoading ? <Skeleton width={60} /> : departmentCourses}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: '#3498db', width: 40, height: 40 }}>
                        <ClassIcon />
                      </Avatar>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Total courses this semester
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    borderRadius: 2,
                    height: '100%',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography color="text.secondary" variant="subtitle2" fontWeight="medium">
                          Assigned Courses
                        </Typography>
                        <Typography variant="h4" sx={{ mt: 1, mb: 2 }}>
                          {departmentStatsLoading ? <Skeleton width={60} /> : assignedCourses}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: '#2ecc71', width: 40, height: 40 }}>
                        <CheckCircleIcon />
                      </Avatar>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Courses with instructors
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    borderRadius: 2,
                    height: '100%',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography color="text.secondary" variant="subtitle2" fontWeight="medium">
                          Unassigned Courses
                        </Typography>
                        <Typography variant="h4" sx={{ mt: 1, mb: 2 }}>
                          {departmentStatsLoading ? <Skeleton width={60} /> : unassignedCourses}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: '#e74c3c', width: 40, height: 40 }}>
                        <WarningIcon />
                      </Avatar>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Courses needing instructors
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    borderRadius: 2,
                    height: '100%',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography color="text.secondary" variant="subtitle2" fontWeight="medium">
                          Pending Approvals
                        </Typography>
                        <Typography variant="h4" sx={{ mt: 1, mb: 2 }}>
                          {departmentStatsLoading ? <Skeleton width={60} /> : pendingApprovals}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: '#f39c12', width: 40, height: 40 }}>
                        <AssignmentIcon />
                      </Avatar>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Courses awaiting approval
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Charts Section */}
            <Grid item xs={12} md={8}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  height: '100%',
                  minHeight: 380
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3,
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600" color="primary.main">
                      Course Status Overview
                    </Typography>
                  </Box>
                  <Chip 
                    label="Current Semester" 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
                
                {departmentStatsLoading ? (
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Skeleton variant="rectangular" width="100%" height={300} />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={courseStatusDistribution}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: 8, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`${value} courses`, 'Count']}
                      />
                      <Legend />
                      <Bar 
                        dataKey="value" 
                        radius={[4, 4, 0, 0]}
                      >
                        {courseStatusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  height: '100%',
                  minHeight: 380
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3,
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BookIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600" color="primary.main">
                      Course Type Distribution
                    </Typography>
                  </Box>
                </Box>
                
                {departmentStatsLoading ? (
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Skeleton variant="circular" width={300} height={300} />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={courseTypeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {courseTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value, name, props) => [`${value} courses`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>
            
            {/* Trend Chart */}
            <Grid item xs={12}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  height: '100%',
                  minHeight: 380
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3,
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DateRangeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600" color="primary.main">
                      Course Status Trends
                    </Typography>
                  </Box>
                  <Chip 
                    label="Last 6 Months" 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
                
                {departmentStatsLoading ? (
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Skeleton variant="rectangular" width="100%" height={300} />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={monthlyStats}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorAssigned" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#2ecc71" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorUnassigned" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e74c3c" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#e74c3c" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f39c12" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f39c12" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: 8, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="assigned" 
                        name="Assigned Courses"
                        stroke="#2ecc71" 
                        fillOpacity={1} 
                        fill="url(#colorAssigned)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="unassigned" 
                        name="Unassigned Courses"
                        stroke="#e74c3c" 
                        fillOpacity={1} 
                        fill="url(#colorUnassigned)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="pending" 
                        name="Pending Approvals"
                        stroke="#f39c12" 
                        fillOpacity={1} 
                        fill="url(#colorPending)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>
            
            {/* Action Required Courses */}
            <Grid item xs={12}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3,
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WarningIcon sx={{ mr: 1, color: '#f39c12' }} />
                    <Typography variant="h6" fontWeight="600" color="primary.main">
                      Courses Requiring Action
                    </Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    size="small" 
                    startIcon={<AssignmentIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    Manage Courses
                  </Button>
                </Box>
                
                {departmentStatsLoading ? (
                  <Box>
                    {[...Array(5)].map((_, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                        <Box sx={{ width: '100%' }}>
                          <Skeleton variant="text" width="40%" />
                          <Skeleton variant="text" width="25%" />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon sx={{ mr: 1, color: '#f39c12', fontSize: 20 }} />
                      Pending Approvals ({pendingApprovals})
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                      {/* Mock pending approval courses */}
                      {[...Array(Math.min(3, pendingApprovals))].map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} key={`pending-${index}`}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              borderRadius: 2,
                              borderLeft: '4px solid #f39c12',
                              transition: 'transform 0.3s, box-shadow 0.3s',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                              }
                            }}
                          >
                            <CardContent>
                              <Typography variant="subtitle1" fontWeight="500">
                                {['Introduction to Programming', 'Database Systems', 'Web Development', 'Data Structures', 'Computer Networks'][index % 5]}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Course Code: {['CS101', 'CS305', 'CS210', 'CS401', 'CS310'][index % 5]}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Chip 
                                  size="small" 
                                  label="Pending Approval" 
                                  sx={{ 
                                    bgcolor: 'rgba(243, 156, 18, 0.1)', 
                                    color: '#f39c12',
                                    fontWeight: 500
                                  }} 
                                />
                                <Button size="small" color="primary">Review</Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    
                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, mt: 3, display: 'flex', alignItems: 'center' }}>
                      <WarningIcon sx={{ mr: 1, color: '#e74c3c', fontSize: 20 }} />
                      Unassigned Courses ({unassignedCourses})
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {/* Mock unassigned courses */}
                      {[...Array(Math.min(3, unassignedCourses))].map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} key={`unassigned-${index}`}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              borderRadius: 2,
                              borderLeft: '4px solid #e74c3c',
                              transition: 'transform 0.3s, box-shadow 0.3s',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                              }
                            }}
                          >
                            <CardContent>
                              <Typography variant="subtitle1" fontWeight="500">
                                {['Artificial Intelligence', 'Machine Learning', 'Mobile Development', 'Cloud Computing', 'Software Engineering'][index % 5]}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Course Code: {['CS420', 'CS430', 'CS350', 'CS440', 'CS330'][index % 5]}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Chip 
                                  size="small" 
                                  label="Unassigned" 
                                  sx={{ 
                                    bgcolor: 'rgba(231, 76, 60, 0.1)', 
                                    color: '#e74c3c',
                                    fontWeight: 500
                                  }} 
                                />
                                <Button size="small" color="primary">Assign</Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>
          </>
        )}

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
                        background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                        border: '1px solid',
                        borderColor: 'primary.light',
                        animation: 'fadeInBottom 0.8s ease-out 0.6s both',
                        '@keyframes fadeInBottom': {
                          '0%': { opacity: 0, transform: 'translateY(30px)' },
                          '100%': { opacity: 1, transform: 'translateY(0)' }
                        },
                        '&:hover': { 
                          transform: 'translateY(-8px) scale(1.03)',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                          borderColor: 'primary.main'
                        }
                      }}
                    >
                      {paymentLoading ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <CircularProgress size={40} sx={{ mb: 2, color: 'primary.main' }} />
                          <Typography variant="body2" color="text.secondary">
                            Loading payment...
                          </Typography>
                        </Box>
                      ) : paymentError ? (
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: 'primary.main', 
                                width: 40, 
                                height: 40,
                                mr: 1.5 
                              }}
                            >
                              <PaymentIcon />
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight="600" color="primary.dark">
                              Payment
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                            {paymentError}
                          </Typography>
                        </Box>
                      ) : !paymentInfo ? (
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: 'primary.main', 
                                width: 40, 
                                height: 40,
                                mr: 1.5 
                              }}
                            >
                              <PaymentIcon />
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight="600" color="primary.dark">
                              Payment Status
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            bgcolor: 'info.lighter', 
                            p: 1.5, 
                            borderRadius: 1,
                            border: '1px dashed',
                            borderColor: 'info.light',
                            mt: 1
                          }}>
                            <Typography variant="body2" color="info.dark" sx={{ fontWeight: 'medium' }}>
                              Your payment is being processed
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
                              Payment calculations are completed after all your courses are approved and your total load is finalized by the finance department.
                            </Typography>
                          </Box>
                          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center' }}>
                            <InfoIcon sx={{ fontSize: 16, color: 'primary.main', mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                              You'll receive an email notification when your payment is calculated.
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: 'primary.main', 
                                width: 40, 
                                height: 40,
                                mr: 1.5 
                              }}
                            >
                              <MonetizationOnIcon />
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight="600" color="primary.dark">
                              Payment
                            </Typography>
                          </Box>
                          <Typography variant="h3" fontWeight="700" color="primary.dark" sx={{ ml: 1 }}>
                            {paymentInfo.totalPayment ? `ETB ${parseInt(paymentInfo.totalPayment).toLocaleString()}` : 'N/A'}
                          </Typography>
                          {paymentInfo.status === 'pending' && (
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              mt: 0.5, 
                              ml: 1,
                              bgcolor: 'info.lighter',
                              p: 1,
                              borderRadius: 1,
                              width: 'calc(100% - 16px)',
                              border: '1px dashed',
                              borderColor: 'info.light'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon sx={{ fontSize: 16, color: 'info.main', mr: 0.5 }} />
                                <Typography variant="body2" color="info.main" sx={{ fontWeight: 'medium' }}>
                                  Payment Calculated
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 0.5 }}>
                                Payment will be processed according to the university schedule.
                              </Typography>
                            </Box>
                          )}
                          {paymentInfo.status === 'approved' && (
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              mt: 0.5, 
                              ml: 1,
                              bgcolor: 'success.lighter',
                              p: 1,
                              borderRadius: 1,
                              width: 'calc(100% - 16px)',
                              border: '1px dashed',
                              borderColor: 'success.light'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                                <Typography variant="body2" color="success.main" sx={{ fontWeight: 'medium' }}>
                                  Payment Approved
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 0.5 }}>
                                Funds will be disbursed according to the university payment schedule.
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Tooltip title="Your calculated payment amount for this semester">
                                <InfoIcon sx={{ fontSize: 16, color: 'primary.main', mr: 0.5 }} />
                              </Tooltip>
                              <Typography variant="body2" color="text.secondary">
                                Rate: ETB {paymentInfo.paymentAmount}/load
                              </Typography>
                            </Box>
                            <Tooltip title={paymentInfo.status === 'pending' ? 
                              'Your payment has been calculated and is ready for disbursement' : 
                              paymentInfo.status === 'approved' ? 
                              'Your payment has been approved and funds will be disbursed soon' : 
                              'Payment status'}>
                              <Chip 
                                size="small" 
                                label={paymentInfo.status === 'pending' ? 'Calculated' : 
                                       paymentInfo.status === 'approved' ? 'Approved' : 
                                       paymentInfo.status.charAt(0).toUpperCase() + paymentInfo.status.slice(1)}
                                color={paymentInfo.status === 'approved' ? 'success' : paymentInfo.status === 'pending' ? 'info' : 'default'}
                                icon={paymentInfo.status === 'pending' ? <AccessTimeIcon style={{ fontSize: '0.7rem' }} /> : undefined}
                                sx={{ 
                                  height: 20, 
                                  '& .MuiChip-label': { px: 1, py: 0.1, fontSize: '0.7rem' },
                                  '& .MuiChip-icon': { ml: 0.5, mr: -0.25 }
                                }}
                              />
                            </Tooltip>
                          </Box>
                        </>
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
