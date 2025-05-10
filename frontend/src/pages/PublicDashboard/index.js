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
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero Section - Modern Gradient Background */}
      <Box
        sx={{
          position: 'relative',
          color: '#fff',
          mb: 6,
          minHeight: '650px',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
          borderRadius: { xs: 0, md: '0 0 50px 50px' },
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        }}
      >
        {/* Decorative Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            zIndex: 1,
          }}
        />
        
        {/* Hero Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', py: 10, zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    display: 'inline-block',
                    background: 'rgba(255,255,255,0.15)',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    backdropFilter: 'blur(10px)',
                    mb: 2
                  }}
                >
                  Dire Dawa University
                </Typography>
              </Box>
              <Typography
                component="h1"
                variant="h2"
                color="inherit"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  mb: 2,
                  letterSpacing: '-0.5px',
                }}
              >
                Instructor Load Tracking Management System
              </Typography>
              <Typography
                variant="h6"
                color="inherit"
                paragraph
                sx={{
                  opacity: 0.9,
                  maxWidth: '600px',
                  lineHeight: 1.6,
                  mb: 4,
                  fontWeight: 400,
                }}
              >
                Empowering educators through intelligent workload management. Streamline course allocation, track teaching hours, and optimize departmental resources.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleLoginClick}
                  startIcon={<LoginIcon />}
                  sx={{
                    fontSize: '1rem',
                    py: 1.5,
                    px: 4,
                    textTransform: 'none',
                    borderRadius: 2,
                    background: 'white',
                    color: '#6a11cb',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'rgba(255,255,255,0.9)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Login to Dashboard
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    fontSize: '1rem',
                    py: 1.5,
                    px: 4,
                    textTransform: 'none',
                    borderRadius: 2,
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      background: 'rgba(255,255,255,0.1)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                component="img"
                src="https://img.freepik.com/free-vector/teacher-concept-illustration_114360-2166.jpg"
                alt="University Education"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  height: 'auto',
                  borderRadius: 4,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  transform: 'perspective(1000px) rotateY(-10deg)',
                  transition: 'transform 0.5s ease',
                  '&:hover': {
                    transform: 'perspective(1000px) rotateY(0deg)',
                  },
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* University Stats */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '2.5rem' },
              background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              mb: 1
            }}
          >
            University at a Glance
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
            Explore our vibrant academic community and discover what makes Dire Dawa University special
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card 
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.05)',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                    borderColor: 'transparent'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    color: 'white', 
                    mb: 3,
                    p: 2,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 70,
                    height: 70,
                    boxShadow: '0 10px 20px rgba(37, 117, 252, 0.2)'
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography variant="h3" component="div" gutterBottom fontWeight="bold" sx={{ color: '#2c3e50' }}>
                  {stat.value}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#7f8c8d', fontWeight: 500 }}>
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Key Features */}
      <Box sx={{ py: 10, position: 'relative', overflow: 'hidden' }}>
        {/* Background decorative elements */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '10%', 
            right: '5%', 
            width: 200, 
            height: 200, 
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.05) 0%, rgba(37, 117, 252, 0.05) 100%)',
            zIndex: 0
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: '5%', 
            left: '10%', 
            width: 300, 
            height: 300, 
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.03) 0%, rgba(37, 117, 252, 0.03) 100%)',
            zIndex: 0
          }} 
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: '#6a11cb',
                fontWeight: 600,
                mb: 2,
                display: 'inline-block',
                px: 2,
                py: 0.5,
                borderRadius: 5,
                background: 'rgba(106, 17, 203, 0.1)'
              }}
            >
              UNIVERSITY HIGHLIGHTS
            </Typography>
            <Typography
              component="h2"
              variant="h3"
              align="center"
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.5rem' },
                mb: 2
              }}
            >
              Why Choose Dire Dawa University?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Discover the unique advantages that set us apart as a leading institution of higher education
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    p: 4,
                    borderRadius: 3,
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                      borderColor: 'transparent',
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      color: 'white', 
                      mr: 3, 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                      width: 60,
                      height: 60,
                      flexShrink: 0,
                      boxShadow: '0 10px 20px rgba(37, 117, 252, 0.15)'
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Box>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#7f8c8d', lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* LTMS Section */}
      <Box 
        sx={{ 
          position: 'relative',
          py: 12, 
          mt: 10,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #43118a 0%, #1a5fc7 100%)',
          color: 'white',
          borderRadius: { xs: 0, md: '0 100px 0 0' },
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Decorative elements */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: '5%',
            right: '10%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            zIndex: 0
          }}
        />
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: '-10%',
            left: '5%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
            zIndex: 0
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="subtitle1"
              sx={{
                display: 'inline-block',
                background: 'rgba(255, 255, 255, 0.15)',
                px: 2,
                py: 0.5,
                borderRadius: 5,
                backdropFilter: 'blur(10px)',
                mb: 2,
                letterSpacing: 1
              }}
            >
              INNOVATIVE SOLUTION
            </Typography>
            <Typography
              component="h2"
              variant="h2"
              align="center"
              sx={{ 
                mb: 2, 
                fontWeight: 700,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}
            >
              Load Tracking Management System
            </Typography>
            <Typography
              variant="h6"
              align="center"
              paragraph
              sx={{ 
                mb: 8, 
                maxWidth: '800px', 
                mx: 'auto',
                opacity: 0.9,
                lineHeight: 1.8
              }}
            >
              Our innovative system streamlines the academic workload management process, ensuring efficient distribution
              of teaching loads while maintaining quality education standards.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {ltmsFeatures.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  sx={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      background: 'rgba(255, 255, 255, 0.15)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      mb: 3
                    }}>
                      <Box sx={{ 
                        mr: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                      }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.7 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* System Benefits */}
          <Box sx={{ mt: 12, mb: 4 }}>
            <Typography
              variant="h3"
              align="center"
              sx={{ 
                mb: 2, 
                fontWeight: 700,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}
            >
              Benefits
            </Typography>
            <Typography
              variant="h6"
              align="center"
              paragraph
              sx={{ 
                mb: 6, 
                maxWidth: '700px', 
                mx: 'auto',
                opacity: 0.9
              }}
            >
              Why educational institutions choose our system
            </Typography>
            
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} md={10}>
                <Card 
                  sx={{ 
                    background: 'rgba(255, 255, 255, 0.08)', 
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                  }}
                >
                  <List sx={{ py: 2 }}>
                    {[
                      'Reduces administrative workload by automating load distribution',
                      'Ensures fair and transparent teaching load allocation',
                      'Provides real-time insights into department workload statistics',
                      'Simplifies course management and instructor assignment process',
                      'Improves overall academic planning and resource utilization'
                    ].map((benefit, index) => (
                      <ListItem key={index} sx={{ py: 2 }}>
                        <ListItemIcon>
                          <Box 
                            sx={{ 
                              bgcolor: 'rgba(255, 255, 255, 0.2)', 
                              borderRadius: '50%',
                              width: 40,
                              height: 40,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <CheckCircleIcon sx={{ color: 'white' }} />
                          </Box>
                        </ListItemIcon>
                        <ListItemText 
                          primary={benefit} 
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontWeight: 500,
                              fontSize: '1.1rem'
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Our Schools Section */}
      <Box 
        sx={{ 
          position: 'relative',
          py: 12, 
          my: 10,
          overflow: 'hidden',
          background: 'linear-gradient(to right, #f8f9fa, #ffffff, #f8f9fa)',
          borderRadius: { xs: 0, md: '100px 0 0 0' },
        }}
      >
        {/* Decorative elements */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.03) 0%, rgba(37, 117, 252, 0.03) 100%)',
            zIndex: 0
          }}
        />
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: '5%',
            left: '10%',
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.02) 0%, rgba(37, 117, 252, 0.02) 100%)',
            zIndex: 0
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="subtitle1"
              sx={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.1) 0%, rgba(37, 117, 252, 0.1) 100%)',
                px: 2,
                py: 0.5,
                borderRadius: 5,
                mb: 2,
                letterSpacing: 1,
                color: '#6a11cb'
              }}
            >
              ACADEMIC DEPARTMENTS
            </Typography>
            <Typography
              component="h2"
              variant="h2"
              align="center"
              sx={{ 
                mb: 2, 
                fontWeight: 700,
                background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}
            >
              Our Schools
            </Typography>
            <Typography
              variant="h6"
              align="center"
              paragraph
              sx={{ 
                mb: 6, 
                maxWidth: '700px', 
                mx: 'auto',
                color: '#7f8c8d'
              }}
            >
              Explore our diverse academic schools and their specialized departments
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {schools.map((school, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 15px 35px rgba(37, 117, 252, 0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      mb: 3
                    }}>
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                        color: 'white',
                        mr: 3,
                        boxShadow: '0 10px 20px rgba(37, 117, 252, 0.15)'
                      }}>
                        {school.icon}
                      </Box>
                      <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                        {school.name}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2, opacity: 0.5 }} />
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 3 }}>
                      {school.departments.map((dept, idx) => (
                        <Chip
                          key={idx}
                          label={dept}
                          size="medium"
                          sx={{ 
                            m: 0.5,
                            py: 1.5,
                            background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.1) 0%, rgba(37, 117, 252, 0.1) 100%)',
                            color: '#6a11cb',
                            fontWeight: 500,
                            border: '1px solid rgba(106, 17, 203, 0.1)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.15) 0%, rgba(37, 117, 252, 0.15) 100%)',
                              boxShadow: '0 5px 15px rgba(37, 117, 252, 0.1)'
                            }
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
      </Box>

      {/* Achievements Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
          color: 'white', 
          py: 10,
          borderRadius: { xs: 0, md: '50px 0 50px 0' },
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(37, 117, 252, 0.2)',
          my: 8
        }}
      >
        {/* Decorative elements */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: '-5%',
            right: '-5%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            zIndex: 0
          }}
        />
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: '-10%',
            left: '-5%',
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            zIndex: 0
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="subtitle1"
              sx={{
                display: 'inline-block',
                background: 'rgba(255, 255, 255, 0.15)',
                px: 2,
                py: 0.5,
                borderRadius: 5,
                backdropFilter: 'blur(10px)',
                mb: 2
              }}
            >
              RECOGNITION & EXCELLENCE
            </Typography>
            <Typography
              component="h2"
              variant="h3"
              align="center"
              sx={{ 
                fontWeight: 700,
                mb: 2,
                textShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              Our Achievements
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 700, mx: 'auto', opacity: 0.9, mb: 5 }}>
              Celebrating our milestones and recognitions in academic excellence
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={8}>
              <Card 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.1)', 
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                  overflow: 'hidden'
                }}
              >
                <List sx={{ py: 2 }}>
                  {achievements.map((achievement, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ py: 2 }}>
                        <ListItemIcon>
                          <Box 
                            sx={{ 
                              bgcolor: 'rgba(255, 255, 255, 0.2)', 
                              borderRadius: '50%',
                              width: 40,
                              height: 40,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <AchievementIcon sx={{ color: 'white' }} />
                          </Box>
                        </ListItemIcon>
                        <ListItemText 
                          primary={achievement}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontWeight: 500,
                              fontSize: '1.1rem'
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
        mt: 10, 
        mb: 16,
        textAlign: 'center',
        py: 10,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(to right, #f8f9fa, #ffffff, #f8f9fa)',
        borderRadius: { xs: 0, md: '0 100px 0 100px' },
      }}>
        {/* Decorative elements */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.05) 0%, rgba(37, 117, 252, 0.05) 100%)',
            zIndex: 0
          }}
        />
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: '5%',
            right: '10%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.03) 0%, rgba(37, 117, 252, 0.03) 100%)',
            zIndex: 0
          }}
        />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box 
            sx={{
              background: 'white',
              py: 6,
              px: { xs: 3, md: 6 },
              borderRadius: 4,
              boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.03)'
            }}
          >
            <Typography 
              variant="h3" 
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}
            >
              Ready to Get Started?
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              paragraph
              sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
            >
              Join our growing community of educators and administrators to streamline your workload management
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
                fontSize: '1.1rem',
                textTransform: 'none',
                borderRadius: 3,
                background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
                boxShadow: '0 10px 20px rgba(37, 117, 252, 0.3)',
                '&:hover': {
                  boxShadow: '0 15px 30px rgba(37, 117, 252, 0.4)',
                  transform: 'translateY(-3px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              Login to Access Dashboard
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicDashboard;
