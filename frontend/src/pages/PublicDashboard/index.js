import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  AutoGraph as AutoGraphIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Login as LoginIcon,
  Engineering as EngineeringIcon,
  Business as BusinessIcon,
  LocalHospital as MedicalIcon,
  Agriculture as AgricultureIcon,
  Computer as ComputerIcon,
  Science as ScienceIcon,
  Build as TechnologyIcon,
  AccountBalance as LawIcon
} from '@mui/icons-material';

const PublicDashboard = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const schools = [
    {
      name: 'School of Computing and Informatics',
      icon: <ComputerIcon />,
      departments: ['Computer Science', 'Information Technology', 'Software Engineering']
    },
    {
      name: 'School of Engineering',
      icon: <EngineeringIcon />,
      departments: ['Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Chemical Engineering']
    },
    {
      name: 'School of Business and Economics',
      icon: <BusinessIcon />,
      departments: ['Management', 'Accounting and Finance', 'Economics', 'Public Administration']
    },
    {
      name: 'School of Medicine and Health Sciences',
      icon: <MedicalIcon />,
      departments: ['Medicine', 'Nursing', 'Laboratory', 'Anesthesia']
    },
    {
      name: 'School of Natural and Computational Sciences',
      icon: <ScienceIcon />,
      departments: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Statistics']
    },
    {
      name: 'School of Law',
      icon: <LawIcon />,
      departments: ['Law', 'Legal Studies']
    },
    {
      name: 'School of Agriculture and Natural Resources',
      icon: <AgricultureIcon />,
      departments: ['Plant Science', 'Animal Science', 'Natural Resource Management']
    },
    {
      name: 'School of Technology',
      icon: <TechnologyIcon />,
      departments: ['Construction Technology', 'Electrical Technology', 'Manufacturing Technology']
    }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(/hero-bg.jpg)',
          minHeight: '500px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Increase the priority of the hero background image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.6)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', py: 8 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography
                component="h1"
                variant="h2"
                color="inherit"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Instructor Load Management System
              </Typography>
              <Typography
                variant="h5"
                color="inherit"
                paragraph
                sx={{
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  mb: 4
                }}
              >
                Streamline your academic workload distribution with our modern and efficient system
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleLoginClick}
                  startIcon={<LoginIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  Login to Access Dashboard
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Statistics Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h4" component="div" gutterBottom color="primary">
                  500+
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Active Instructors
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h4" component="div" gutterBottom color="primary">
                  50+
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Departments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h4" component="div" gutterBottom color="primary">
                  1000+
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Courses
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h4" component="div" gutterBottom color="primary">
                  95%
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Satisfaction Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" gutterBottom align="center" sx={{ mb: 6 }}>
            Key Features
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AutoGraphIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="h5">
                      Automated Load Distribution
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    Efficiently distribute teaching loads among instructors based on expertise and availability.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimelineIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="h5">
                      Real-time Analytics
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    Monitor and analyze teaching load distribution with comprehensive dashboards and reports.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssessmentIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="h5">
                      Performance Tracking
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    Track and evaluate instructor performance and workload balance over time.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Schools Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" gutterBottom align="center" sx={{ mb: 6 }}>
          Our Schools
        </Typography>
        <Grid container spacing={4}>
          {schools.map((school, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      color: 'primary.main',
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {school.icon}
                    </Box>
                    <Typography variant="h6" component="div">
                      {school.name}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <List dense>
                    {school.departments.map((dept, deptIndex) => (
                      <ListItem key={deptIndex}>
                        <ListItemIcon>
                          <SchoolIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={dept} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ 
        mt: 8, 
        mb: 16, 
        textAlign: 'center',
        py: 8, 
        backgroundColor: 'grey.100',
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'grey.200'
      }}>
        <Container maxWidth="sm">
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{
              fontWeight: 'bold',
              mb: 3 
            }}
          >
            Ready to Get Started?
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            paragraph
            sx={{ mb: 4 }} 
          >
            Join our growing community of educators and administrators
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleLoginClick}
            startIcon={<LoginIcon />}
            sx={{
              mt: 2,
              px: 6, 
              py: 2, 
              fontSize: '1.2rem',
              textTransform: 'none',
              boxShadow: 2,
              borderRadius: 2,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)',
                transition: 'all 0.2s'
              }
            }}
          >
            Login to Access Dashboard
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicDashboard;
