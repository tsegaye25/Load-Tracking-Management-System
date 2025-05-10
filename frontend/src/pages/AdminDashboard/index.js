import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
  Skeleton,
  useTheme,
  useMediaQuery,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  IconButton,
  alpha
} from '@mui/material';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  People as PeopleIcon,
  Pending as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  SupervisorAccount as AdminIcon,
  Settings as SettingsIcon,
  LibraryBooks as CoursesIcon
} from '@mui/icons-material';

// Status colors for charts
const STATUS_COLORS = {
  pending: '#FFA726',
  approved: '#66BB6A',
  rejected: '#EF5350',
  total: '#42A5F5',
  instructor: '#7E57C2',
  departmentHead: '#26A69A',
  schoolDean: '#5C6BC0',
  viceDirector: '#EC407A',
  scientificDirector: '#AB47BC',
  finance: '#F9A825',
  admin: '#EF5350'
};

// Responsive chart container component
const ResponsiveChartContainer = ({ children, height = 300 }) => {
  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </Box>
  );
};

// Skeleton loader for stats cards
const StatCardSkeleton = () => (
  <Card sx={{ height: '100%', borderRadius: 2 }}>
    <CardContent>
      <Skeleton variant="text" width="60%" height={20} />
      <Skeleton variant="text" width="40%" height={40} sx={{ my: 1 }} />
      <Skeleton variant="text" width="80%" height={20} />
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const isMobile = windowWidth < 600;
  const isTablet = windowWidth >= 600 && windowWidth < 960;
  
  // State to track if this is the initial load or a manual refresh
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Dashboard statistics state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    pendingApprovals: 0,
    recentActivity: 0,
    userDistribution: [],
    courseStatusDistribution: [],
    activityTrends: [],
    recentActivities: []
  });
  
  // Effect to handle window resize for responsive charts
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    fetchDashboardData(isInitialLoad);
    // After initial load, set isInitialLoad to false
    setIsInitialLoad(false);
  }, []);

  const fetchDashboardData = async (isInitialLoad = false) => {
    setLoading(true);
    try {
      // Fetch users data
      const usersResponse = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/users`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users data');
      }
      
      const usersData = await usersResponse.json();
      
      // Fetch courses data
      const coursesResponse = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/courses`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!coursesResponse.ok) {
        throw new Error('Failed to fetch courses data');
      }
      
      const coursesData = await coursesResponse.json();
      
      // Process the data
      const users = usersData.data.users || [];
      const courses = coursesData.data.courses || [];
      
      // Calculate statistics
      const totalUsers = users.length;
      const totalCourses = courses.length;
      
      // Count pending approvals (courses that need admin attention)
      const pendingApprovals = courses.filter(course => 
        course.status === 'pending' || 
        course.status === 'department-head-review' ||
        course.status === 'dean-review' ||
        course.status === 'vice-director-review' ||
        course.status === 'scientific-director-review' ||
        course.status === 'finance-review'
      ).length;
      
      // Count recent activity (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentUsersCount = users.filter(user => new Date(user.createdAt) > oneWeekAgo).length;
      const recentCoursesCount = courses.filter(course => new Date(course.updatedAt) > oneWeekAgo).length;
      const recentActivity = recentUsersCount + recentCoursesCount;
      
      // Create user distribution data for charts
      const userRoleCounts = {
        instructor: 0,
        'department-head': 0,
        'school-dean': 0,
        'vice-scientific-director': 0,
        'scientific-director': 0,
        finance: 0,
        admin: 0
      };
      
      users.forEach(user => {
        if (userRoleCounts[user.role] !== undefined) {
          userRoleCounts[user.role]++;
        }
      });
      
      const userDistribution = [
        { name: 'Instructors', value: userRoleCounts.instructor, color: STATUS_COLORS.instructor },
        { name: 'Department Heads', value: userRoleCounts['department-head'], color: STATUS_COLORS.departmentHead },
        { name: 'School Deans', value: userRoleCounts['school-dean'], color: STATUS_COLORS.schoolDean },
        { name: 'Vice Directors', value: userRoleCounts['vice-scientific-director'], color: STATUS_COLORS.viceDirector },
        { name: 'Scientific Directors', value: userRoleCounts['scientific-director'], color: STATUS_COLORS.scientificDirector },
        { name: 'Finance', value: userRoleCounts.finance, color: STATUS_COLORS.finance },
        { name: 'Admins', value: userRoleCounts.admin, color: STATUS_COLORS.admin }
      ];
      
      // Create course status distribution data
      const courseStatusCounts = {
        pending: 0,
        approved: 0,
        rejected: 0,
        other: 0
      };
      
      courses.forEach(course => {
        if (course.status.includes('approved') || course.status === 'finance-approved') {
          courseStatusCounts.approved++;
        } else if (course.status.includes('rejected')) {
          courseStatusCounts.rejected++;
        } else if (course.status === 'pending' || course.status.includes('review')) {
          courseStatusCounts.pending++;
        } else {
          courseStatusCounts.other++;
        }
      });
      
      const courseStatusDistribution = [
        { name: 'Pending', value: courseStatusCounts.pending, color: STATUS_COLORS.pending },
        { name: 'Approved', value: courseStatusCounts.approved, color: STATUS_COLORS.approved },
        { name: 'Rejected', value: courseStatusCounts.rejected, color: STATUS_COLORS.rejected },
        { name: 'Other', value: courseStatusCounts.other, color: STATUS_COLORS.total }
      ];
      
      // Create activity trends data (last 6 months)
      const currentMonth = new Date().getMonth();
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      const activityTrends = [];
      
      // Generate sample data for the last 6 months
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const month = monthNames[monthIndex];
        
        // Calculate month start and end dates
        const year = new Date().getFullYear() - (monthIndex > currentMonth ? 1 : 0);
        const monthStart = new Date(year, monthIndex, 1);
        const monthEnd = new Date(year, monthIndex + 1, 0);
        
        // Count users and courses created in this month
        const newUsers = users.filter(user => {
          const createdAt = new Date(user.createdAt);
          return createdAt >= monthStart && createdAt <= monthEnd;
        }).length;
        
        const newCourses = courses.filter(course => {
          const createdAt = new Date(course.createdAt);
          return createdAt >= monthStart && createdAt <= monthEnd;
        }).length;
        
        const updatedCourses = courses.filter(course => {
          const updatedAt = new Date(course.updatedAt);
          return updatedAt >= monthStart && updatedAt <= monthEnd && updatedAt > new Date(course.createdAt);
        }).length;
        
        activityTrends.push({
          month,
          'New Users': newUsers,
          'New Courses': newCourses,
          'Updated Courses': updatedCourses
        });
      }
      
      // Create recent activities data
      const recentActivities = [];
      
      // Combine and sort recent user registrations and course updates
      const combinedActivities = [
        ...users.map(user => ({
          type: 'user',
          action: 'registered',
          name: user.name,
          role: user.role,
          timestamp: user.createdAt,
          id: user._id
        })),
        ...courses.map(course => ({
          type: 'course',
          action: course.status.includes('approved') ? 'approved' : 
                 course.status.includes('rejected') ? 'rejected' : 'updated',
          name: course.name,
          code: course.code,
          status: course.status,
          timestamp: course.updatedAt,
          id: course._id
        }))
      ];
      
      // Sort by timestamp (most recent first) and take the 10 most recent
      combinedActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const recentActivitiesList = combinedActivities.slice(0, 10);
      
      // Update the stats state
      setStats({
        totalUsers,
        totalCourses,
        pendingApprovals,
        recentActivity,
        userDistribution,
        courseStatusDistribution,
        activityTrends,
        recentActivities: recentActivitiesList
      });
      
      setLoading(false);
      
      // Only show success notification if this is not the initial load
      if (!isInitialLoad) {
        enqueueSnackbar('Dashboard data refreshed successfully', { variant: 'success' });
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
      enqueueSnackbar('Failed to fetch dashboard data', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)', // Subtract header height
      width: '100%',
      pt: 2,
      pb: 10 // Significantly increased bottom padding to prevent footer overlap
    }}>
      <Container maxWidth={false} sx={{ height: '100%', px: { xs: 1, sm: 2, md: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Dashboard
          </Typography>
          <IconButton 
            onClick={() => fetchDashboardData(false)} 
            disabled={loading}
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
        
        {/* Stats Cards */}
        <Grid container spacing={3} mb={3}>
          {/* Total Users */}
          <Grid item xs={12} sm={6} md={3}>
            {loading ? (
              <StatCardSkeleton />
            ) : (
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: 2,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 80,
                    height: 80,
                    background: alpha(theme.palette.primary.main, 0.1),
                    borderBottomLeftRadius: '50%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    pt: 1,
                    pr: 1
                  }}
                >
                  <PeopleIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                </Box>
                <CardContent>
                  <Typography variant="overline" color="textSecondary">
                    Total Users
                  </Typography>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', my: 1 }}>
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Registered users across all roles
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
          
          {/* Total Courses */}
          <Grid item xs={12} sm={6} md={3}>
            {loading ? (
              <StatCardSkeleton />
            ) : (
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: 2,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 80,
                    height: 80,
                    background: alpha(STATUS_COLORS.total, 0.1),
                    borderBottomLeftRadius: '50%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    pt: 1,
                    pr: 1
                  }}
                >
                  <CoursesIcon sx={{ color: STATUS_COLORS.total, fontSize: 28 }} />
                </Box>
                <CardContent>
                  <Typography variant="overline" color="textSecondary">
                    Total Courses
                  </Typography>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', my: 1 }}>
                    {stats.totalCourses}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Courses in the system
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
          
          {/* Pending Approvals */}
          <Grid item xs={12} sm={6} md={3}>
            {loading ? (
              <StatCardSkeleton />
            ) : (
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: 2,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 80,
                    height: 80,
                    background: alpha(STATUS_COLORS.pending, 0.1),
                    borderBottomLeftRadius: '50%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    pt: 1,
                    pr: 1
                  }}
                >
                  <PendingIcon sx={{ color: STATUS_COLORS.pending, fontSize: 28 }} />
                </Box>
                <CardContent>
                  <Typography variant="overline" color="textSecondary">
                    Pending Approvals
                  </Typography>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', my: 1 }}>
                    {stats.pendingApprovals}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Courses awaiting review
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
          
          {/* Recent Activity */}
          <Grid item xs={12} sm={6} md={3}>
            {loading ? (
              <StatCardSkeleton />
            ) : (
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: 2,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 80,
                    height: 80,
                    background: alpha(theme.palette.success.main, 0.1),
                    borderBottomLeftRadius: '50%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    pt: 1,
                    pr: 1
                  }}
                >
                  <EventIcon sx={{ color: theme.palette.success.main, fontSize: 28 }} />
                </Box>
                <CardContent>
                  <Typography variant="overline" color="textSecondary">
                    Recent Activity
                  </Typography>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', my: 1 }}>
                    {stats.recentActivity}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Actions in the last 7 days
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
        
        {/* Charts Section */}
        <Grid container spacing={3} mb={3}>
          {/* User Distribution - Bar Chart */}
          <Grid item xs={12} md={6}>
            {loading ? (
              <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Skeleton variant="text" width="60%" height={30} />
                <Skeleton variant="rectangular" height={300} width="100%" sx={{ mt: 2 }} />
              </Paper>
            ) : (
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  User Distribution by Role
                </Typography>
                <ResponsiveChartContainer>
                  <BarChart data={stats.userDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value, name) => [value, 'Users']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Bar dataKey="value" name="Users">
                      {stats.userDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveChartContainer>
              </Paper>
            )}
          </Grid>
          
          {/* Course Status Distribution - Pie Chart */}
          <Grid item xs={12} md={6}>
            {loading ? (
              <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Skeleton variant="text" width="60%" height={30} />
                <Skeleton variant="rectangular" height={300} width="100%" sx={{ mt: 2 }} />
              </Paper>
            ) : (
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Course Status Distribution
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <ResponsiveChartContainer>
                      <PieChart>
                        <Pie
                          data={stats.courseStatusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {stats.courseStatusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value, name, props) => [value, props.payload.name]}
                        />
                      </PieChart>
                    </ResponsiveChartContainer>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%', justifyContent: 'center' }}>
                      {stats.courseStatusDistribution.map((entry) => (
                        <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: entry.color }} />
                          <Typography variant="body2">{entry.name}: {entry.value}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Grid>
        </Grid>
        
        {/* Activity Trends - Area Chart */}
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            System Activity Trends (Last 6 Months)
          </Typography>
          {loading ? (
            <Skeleton variant="rectangular" height={300} width="100%" />
          ) : (
            <ResponsiveChartContainer>
              <AreaChart data={stats.activityTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="New Users" 
                  stackId="1"
                  stroke={theme.palette.primary.main} 
                  fill={alpha(theme.palette.primary.main, 0.6)} 
                  name="New Users"
                />
                <Area 
                  type="monotone" 
                  dataKey="New Courses" 
                  stackId="1"
                  stroke={STATUS_COLORS.total} 
                  fill={alpha(STATUS_COLORS.total, 0.6)} 
                  name="New Courses"
                />
                <Area 
                  type="monotone" 
                  dataKey="Updated Courses" 
                  stackId="1"
                  stroke={STATUS_COLORS.pending} 
                  fill={alpha(STATUS_COLORS.pending, 0.6)} 
                  name="Updated Courses"
                />
              </AreaChart>
            </ResponsiveChartContainer>
          )}
        </Paper>
        
        {/* Recent Activity */}
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent System Activity
          </Typography>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                <Box sx={{ width: '100%' }}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              </Box>
            ))
          ) : stats.recentActivities.length > 0 ? (
            <List sx={{ width: '100%', p: 0 }}>
              {stats.recentActivities.map((activity, index) => {
                let avatarColor, avatarIcon;
                
                if (activity.type === 'user') {
                  avatarColor = theme.palette.primary.main;
                  avatarIcon = <PersonIcon />;
                } else {
                  switch (activity.action) {
                    case 'approved':
                      avatarColor = STATUS_COLORS.approved;
                      avatarIcon = <CheckCircleIcon />;
                      break;
                    case 'rejected':
                      avatarColor = STATUS_COLORS.rejected;
                      avatarIcon = <CancelIcon />;
                      break;
                    default:
                      avatarColor = STATUS_COLORS.pending;
                      avatarIcon = <PendingIcon />;
                  }
                }
                
                return (
                  <ListItem 
                    key={index}
                    sx={{ 
                      py: 1.5, 
                      px: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': {
                        borderBottom: 'none'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: avatarColor }}>
                        {avatarIcon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="body1" component="span" fontWeight="medium">
                            {activity.type === 'user' ? activity.name : activity.name}
                          </Typography>
                          <Chip 
                            label={activity.type === 'user' ? 'NEW USER' : activity.action.toUpperCase()} 
                            size="small"
                            sx={{ 
                              bgcolor: alpha(avatarColor, 0.1),
                              color: avatarColor,
                              fontWeight: 'bold',
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span" color="text.secondary">
                            {activity.type === 'user' 
                              ? `Role: ${activity.role.charAt(0).toUpperCase() + activity.role.slice(1).replace(/-/g, ' ')}`
                              : `Course Code: ${activity.code} • Status: ${activity.status.replace(/-/g, ' ')}`}
                          </Typography>
                          <Typography variant="caption" component="div" color="text.secondary" sx={{ mt: 0.5 }}>
                            {new Date(activity.timestamp).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                No recent activity found
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
