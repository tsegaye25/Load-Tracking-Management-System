import React, { useEffect } from 'react';
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
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getMyCourses } from '../../store/courseSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myCourses, myCoursesLoading } = useSelector((state) => state.course);

  useEffect(() => {
    if (user?.role === 'instructor') {
      dispatch(getMyCourses());
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
            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
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
          </Paper>
        </Grid>

        {/* Statistics Section */}
        {user.role === 'instructor' && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Course Load Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Total Courses
                    </Typography>
                    <Typography variant="h4">
                      {myCourses?.length || 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Total Hours
                    </Typography>
                    <Typography variant="h4">
                      {calculateTotalHours()}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Overload Hours
                    </Typography>
                    <Typography
                      variant="h4"
                      color={calculateOverload() > 0 ? 'error' : 'inherit'}
                    >
                      {calculateOverload()}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Instructor's Courses Section */}
        {user.role === 'instructor' && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                My Assigned Courses
              </Typography>
              {myCoursesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : myCourses?.length > 0 ? (
                <Grid container spacing={2}>
                  {myCourses.map((course) => (
                    <Grid item xs={12} key={course._id}>
                      <Accordion>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{ 
                            '& .MuiAccordionSummary-content': { 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexGrow: 1
                            }
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle1">
                              {course.code} - {course.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {course.school} | {course.department}
                            </Typography>
                          </Box>
                          <Typography variant="subtitle1" color="primary">
                            Total Hours: {course.totalHours || 0}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={3}>
                            {/* Basic Information */}
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" color="primary" gutterBottom>
                                Course Information
                              </Typography>
                              <Box sx={{ ml: 2 }}>
                                <Typography variant="body2">
                                  Class Year: {course.classYear}
                                </Typography>
                                <Typography variant="body2">
                                  Semester: {course.semester}
                                </Typography>
                              </Box>
                            </Grid>

                            {/* Credit Hours */}
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" color="primary" gutterBottom>
                                Credit Hours
                              </Typography>
                              <Box sx={{ ml: 2 }}>
                                <Typography variant="body2">
                                  Credit Hours: {course.Hourfor?.creaditHours || 0}
                                </Typography>
                                <Typography variant="body2">
                                  Lecture Hours: {course.Hourfor?.lecture || 0}
                                </Typography>
                                <Typography variant="body2">
                                  Lab Hours: {course.Hourfor?.lab || 0}
                                </Typography>
                                <Typography variant="body2">
                                  Tutorial Hours: {course.Hourfor?.tutorial || 0}
                                </Typography>
                              </Box>
                            </Grid>

                            {/* Sections */}
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" color="primary" gutterBottom>
                                Number of Sections
                              </Typography>
                              <Box sx={{ ml: 2 }}>
                                <Typography variant="body2">
                                  Lecture Sections: {course.Number_of_Sections?.lecture || 0}
                                </Typography>
                                <Typography variant="body2">
                                  Lab Sections: {course.Number_of_Sections?.lab || 0}
                                </Typography>
                                <Typography variant="body2">
                                  Tutorial Sections: {course.Number_of_Sections?.tutorial || 0}
                                </Typography>
                              </Box>
                            </Grid>

                            {/* Additional Hours */}
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" color="primary" gutterBottom>
                                Additional Hours
                              </Typography>
                              <Box sx={{ ml: 2 }}>
                                <Typography variant="body2">
                                  HDP Hours: {course.hdp || 0}
                                </Typography>
                                <Typography variant="body2">
                                  Position Hours: {course.position || 0}
                                </Typography>
                                <Typography variant="body2">
                                  Branch Advisor Hours: {course.BranchAdvisor || 0}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No courses assigned yet.
                </Typography>
              )}
            </Paper>
          </Grid>
        )}

        {/* Admin Section */}
        {user.role === 'admin' && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                System Statistics
              </Typography>
              {/* Add admin statistics here */}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;
