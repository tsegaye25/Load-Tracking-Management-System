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
  Stack,
  Chip
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
  AccountBalance as LawIcon,
  People as PeopleIcon,
  MenuBook as MenuBookIcon,
  Apartment as ApartmentIcon,
  EmojiEvents as AchievementIcon,
  Lightbulb as InnovationIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const PublicDashboard = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  // University Stats
  const stats = [
    { icon: <PeopleIcon />, value: '10,000+', label: 'Students' },
    { icon: <MenuBookIcon />, value: '30+', label: 'Programs' },
    { icon: <ApartmentIcon />, value: '6', label: 'Schools' },
    { icon: <AchievementIcon />, value: '15+', label: 'Years of Excellence' }
  ];

  // Key Features
  const features = [
    {
      title: 'Academic Excellence',
      description: 'Offering quality education through innovative teaching methods and experienced faculty.',
      icon: <SchoolIcon />
    },
    {
      title: 'Research Innovation',
      description: 'Leading research initiatives in various fields contributing to national development.',
      icon: <InnovationIcon />
    },
    {
      title: 'Modern Facilities',
      description: 'State-of-the-art laboratories, libraries, and research centers.',
      icon: <ApartmentIcon />
    },
    {
      title: 'Industry Partnerships',
      description: 'Strong collaborations with industry leaders for practical experience.',
      icon: <BusinessIcon />
    }
  ];

  // University Achievements
  const achievements = [
    'Ranked among top universities in Ethiopia',
    'Multiple research publications in international journals',
    'Strong international academic partnerships',
    'Leading technology innovation center in the region'
  ];

  // Key Features of LTMS
  const ltmsFeatures = [
    {
      title: 'Automated Load Distribution',
      description: 'Smart workload distribution system that ensures fair and efficient allocation of teaching loads among instructors.',
      icon: <AutoGraphIcon />
    },
    {
      title: 'Real-time Tracking',
      description: 'Monitor and track instructor workloads in real-time with comprehensive dashboards and reporting tools.',
      icon: <TimelineIcon />
    },
    {
      title: 'Department Management',
      description: 'Efficiently manage departments, courses, and instructor assignments through an intuitive interface.',
      icon: <AssessmentIcon />
    },
    {
      title: 'Course Management',
      description: 'Streamlined course allocation and management system with support for multiple departments and programs.',
      icon: <MenuBookIcon />
    }
  ];

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
      departments: ['Law']
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
          minHeight: '600px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Overlay */}
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
        
        {/* Hero Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', py: 8 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Typography
                component="h1"
                variant="h2"
                color="inherit"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  mb: 2
                }}
              >
                Welcome to Dire Dawa University
              </Typography>
              <Typography
                component="h2"
                variant="h3"
                color="inherit"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  mb: 4
                }}
              >
                Instructor Load Tracking Management System
              </Typography>
              <Typography
                variant="h5"
                color="inherit"
                paragraph
                sx={{
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  mb: 4
                }}
              >
                Empowering minds, transforming futures. Join us in our pursuit of excellence
                in education, research, and innovation.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleLoginClick}
                startIcon={<LoginIcon />}
                sx={{
                  mt: 2,
                  fontSize: '1.1rem',
                  py: 1.5,
                  px: 4,
                  textTransform: 'none',
                  boxShadow: 3
                }}
              >
                Login to Access Dashboard
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* University Stats */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={4} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card 
                elevation={3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 3,
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <Box sx={{ 
                  color: 'primary.main',
                  mb: 2,
                  transform: 'scale(1.5)'
                }}>
                  {stat.icon}
                </Box>
                <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Key Features */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h3"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 'bold' }}
          >
            Why Choose DDU?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  elevation={2}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3
                  }}
                >
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2
                  }}>
                    <Box sx={{ 
                      color: 'primary.main',
                      mr: 2,
                      transform: 'scale(1.5)'
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="div">
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* LTMS Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8, mt: 8 }}>
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h3"
            align="center"
            gutterBottom
            sx={{ mb: 2, fontWeight: 'bold' }}
          >
            Load Tracking Management System
          </Typography>
          <Typography
            variant="h6"
            align="center"
            paragraph
            sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
          >
            Our innovative system streamlines the academic workload management process, ensuring efficient distribution
            of teaching loads while maintaining quality education standards.
          </Typography>
          <Grid container spacing={4}>
            {ltmsFeatures.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.1)', 
                    color: 'white',
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2
                    }}>
                      <Box sx={{ 
                        mr: 2,
                        transform: 'scale(1.5)'
                      }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h5" component="div">
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* System Benefits */}
          <Box sx={{ mt: 8 }}>
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{ mb: 4, fontWeight: 'bold' }}
            >
              Benefits
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={8}>
                <List>
                  {[
                    'Reduces administrative workload by automating load distribution',
                    'Ensures fair and transparent teaching load allocation',
                    'Provides real-time insights into department workload statistics',
                    'Simplifies course management and instructor assignment process',
                    'Improves overall academic planning and resource utilization'
                  ].map((benefit, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleIcon sx={{ color: 'white' }} />
                      </ListItemIcon>
                      <ListItemText primary={benefit} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Our Schools Section */}
      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Typography
          component="h2"
          variant="h3"
          align="center"
          gutterBottom
          sx={{ mb: 6, fontWeight: 'bold' }}
        >
          Our Schools
        </Typography>
        <Grid container spacing={4}>
          {schools.map((school, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2
                  }}>
                    <Box sx={{ 
                      color: 'primary.main',
                      mr: 2
                    }}>
                      {school.icon}
                    </Box>
                    <Typography variant="h6" component="div">
                      {school.name}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {school.departments.map((dept, idx) => (
                      <Chip
                        key={idx}
                        label={dept}
                        size="small"
                        sx={{ 
                          m: 0.5,
                          bgcolor: 'primary.light',
                          color: 'white'
                        }}
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Achievements Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h3"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 'bold' }}
          >
            Our Achievements
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={8}>
              <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                <List>
                  {achievements.map((achievement, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <AchievementIcon sx={{ color: 'white' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={achievement}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontWeight: 500
                            }
                          }}
                        />
                      </ListItem>
                      {index < achievements.length - 1 && (
                        <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

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
