import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Book as BookIcon,
  Warning as WarningIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const SchoolDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch courses data
        const coursesResponse = await fetch(`${baseURL}/api/v1/courses/school-courses`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const coursesData = await coursesResponse.json();

        // Fetch instructors data
        const instructorsResponse = await fetch(`${baseURL}/api/v1/users/school-instructors`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const instructorsData = await instructorsResponse.json();

        if (coursesData.status === 'success' && instructorsData.status === 'success') {
          // Process and combine the data
          const departments = new Set();
          const departmentStats = {};
          let totalCourses = 0;
          let totalInstructors = 0;
          let overloadedInstructors = 0;

          // Process instructors data
          instructorsData.data.instructorStats.forEach(instructor => {
            if (instructor.role === 'instructor') {
              totalInstructors++;
              if (instructor.overloadHours > 0) {
                overloadedInstructors++;
              }
              if (instructor.department) {
                departments.add(instructor.department);
                if (!departmentStats[instructor.department]) {
                  departmentStats[instructor.department] = {
                    instructors: 0,
                    courses: 0,
                    overloadedInstructors: 0
                  };
                }
                departmentStats[instructor.department].instructors++;
                if (instructor.overloadHours > 0) {
                  departmentStats[instructor.department].overloadedInstructors++;
                }
              }
            }
          });

          // Process courses data
          Object.entries(coursesData.data.departments).forEach(([dept, courses]) => {
            departments.add(dept);
            if (!departmentStats[dept]) {
              departmentStats[dept] = {
                instructors: 0,
                courses: 0,
                overloadedInstructors: 0
              };
            }
            departmentStats[dept].courses += courses.length;
            totalCourses += courses.length;
          });

          // Prepare chart data
          const departmentChartData = Object.entries(departmentStats).map(([dept, stats]) => ({
            name: dept,
            courses: stats.courses,
            instructors: stats.instructors,
            overloaded: stats.overloadedInstructors
          }));

          const workloadDistribution = [
            { name: 'Normal Load', value: totalInstructors - overloadedInstructors },
            { name: 'Overloaded', value: overloadedInstructors }
          ];

          setDashboardData({
            totalDepartments: departments.size,
            totalCourses,
            totalInstructors,
            overloadedInstructors,
            departmentChartData,
            workloadDistribution,
            departmentStats
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [baseURL]);

  if (loading || !dashboardData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          School Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Overview of school departments, courses, and instructor workloads
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Departments
                </Typography>
              </Box>
              <Typography variant="h4">
                {dashboardData.totalDepartments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon color="secondary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Instructors
                </Typography>
              </Box>
              <Typography variant="h4">
                {dashboardData.totalInstructors}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BookIcon color="info" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Total Courses
                </Typography>
              </Box>
              <Typography variant="h4">
                {dashboardData.totalCourses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon color="error" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Overloaded Instructors
                </Typography>
              </Box>
              <Typography variant="h4">
                {dashboardData.overloadedInstructors}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Department Statistics Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Department Statistics
            </Typography>
            <Box sx={{ height: 400, mt: 2 }}>
              <BarChart
                width={800}
                height={350}
                data={dashboardData.departmentChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="courses" fill="#8884d8" name="Courses" />
                <Bar dataKey="instructors" fill="#82ca9d" name="Instructors" />
                <Bar dataKey="overloaded" fill="#ff8042" name="Overloaded" />
              </BarChart>
            </Box>
          </Paper>
        </Grid>

        {/* Workload Distribution Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Instructor Workload Distribution
            </Typography>
            <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <PieChart width={400} height={350}>
                <Pie
                  data={dashboardData.workloadDistribution}
                  cx={200}
                  cy={175}
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dashboardData.workloadDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </Box>
          </Paper>
        </Grid>

        {/* Department Summary List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Department Summary
            </Typography>
            <List>
              {Object.entries(dashboardData.departmentStats).map(([dept, stats]) => (
                <React.Fragment key={dept}>
                  <ListItem>
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={dept}
                      secondary={`Courses: ${stats.courses} | Instructors: ${stats.instructors} | Overloaded: ${stats.overloadedInstructors}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SchoolDashboard;
