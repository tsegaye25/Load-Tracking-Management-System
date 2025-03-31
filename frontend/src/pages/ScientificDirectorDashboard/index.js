import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Stack,
  Button,
  useTheme,
  Skeleton,
  Fade,
  Divider
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  LibraryBooks as LibraryBooksIcon,
  Refresh as RefreshIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AssignmentReturn as AssignmentReturnIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Loading placeholder components
const StatCardSkeleton = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Stack direction="row" spacing={2}>
        <Skeleton variant="rounded" width={48} height={48} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="40%" />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const ChartSkeleton = () => (
  <Box sx={{ p: 3, height: 400 }}>
    <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={368} />
  </Box>
);

const ActivitySkeleton = () => (
  <Stack spacing={2}>
    {[...Array(5)].map((_, i) => (
      <Box key={i}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </Box>
          <Skeleton variant="text" width={100} />
        </Stack>
        {i < 4 && <Divider sx={{ mt: 2 }} />}
      </Box>
    ))}
  </Stack>
);

const ScientificDirectorDashboard = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    schoolStats: [],
    statusDistribution: [],
    recentActivity: []
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/courses/scientific-director-dashboard`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setStats(data.data);
      enqueueSnackbar('Dashboard data updated successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      enqueueSnackbar('Failed to fetch dashboard data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <Fade in={!loading}>
      <Card sx={{ 
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8]
        }
      }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                backgroundColor: `${color}15`,
                borderRadius: 2,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon sx={{ color: color, fontSize: 32 }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" component="div" sx={{ mb: 0.5 }}>
                {value}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {title}
              </Typography>
              {subtitle && (
                <Typography color="text.secondary" variant="caption" sx={{ display: 'block' }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Fade>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography variant="h4" component="h1" gutterBottom>
            Scientific Director Dashboard
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchDashboardData}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              icon={LibraryBooksIcon}
              title="Total Courses"
              value={stats.totalCourses}
              color={theme.palette.primary.main}
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              icon={ScheduleIcon}
              title="Pending Review"
              value={stats.pendingReview}
              color={theme.palette.warning.main}
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              icon={AssignmentTurnedInIcon}
              title="Approved"
              value={stats.approved}
              color={theme.palette.success.main}
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              icon={AssignmentReturnIcon}
              title="Rejected"
              value={stats.rejected}
              color={theme.palette.error.main}
            />
          )}
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Course Distribution by School */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '100%' }}>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <Fade in>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Course Distribution by School
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.schoolStats}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="school" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="totalCourses" name="Total Courses" fill={theme.palette.primary.main} />
                        <Bar dataKey="pendingReview" name="Pending" fill={theme.palette.warning.main} />
                        <Bar dataKey="approved" name="Approved" fill={theme.palette.success.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </Fade>
            )}
          </Paper>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%' }}>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <Fade in>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Course Status Distribution
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Pending', value: stats.pendingReview },
                            { name: 'Approved', value: stats.approved },
                            { name: 'Rejected', value: stats.rejected }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label
                        >
                          {stats.statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </Fade>
            )}
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {loading ? (
              <ActivitySkeleton />
            ) : (
              <Fade in>
                <Stack spacing={2}>
                  {stats.recentActivity.map((activity, index) => (
                    <Box key={index}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            backgroundColor: activity.type === 'approved' 
                              ? `${theme.palette.success.main}15` 
                              : `${theme.palette.error.main}15`,
                            borderRadius: 2,
                            p: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {activity.type === 'approved' ? (
                            <AssignmentTurnedInIcon sx={{ color: theme.palette.success.main }} />
                          ) : (
                            <AssignmentReturnIcon sx={{ color: theme.palette.error.main }} />
                          )}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2">
                            {activity.course}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {activity.department} - {activity.school}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(activity.timestamp).toLocaleString()}
                        </Typography>
                      </Stack>
                      {index < stats.recentActivity.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))}
                </Stack>
              </Fade>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ScientificDirectorDashboard;
