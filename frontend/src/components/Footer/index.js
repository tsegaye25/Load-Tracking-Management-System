import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  ArrowForward as ArrowForwardIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  MenuBook as MenuBookIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarTodayIcon,
  Devices as DevicesIcon,
  Lock as LockIcon,
  PersonalVideo as PersonalVideoIcon,
  Help as HelpIcon,
  BusinessCenter as BusinessCenterIcon,
  Event as EventIcon,
  Notifications as NotificationsIcon,
  Groups as GroupsIcon,
  PersonAdd as PersonAddIcon,
  Support as SupportIcon,
  AccessibilityNew as AccessibilityNewIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Psychology as PsychologyIcon,
  FitnessCenter as FitnessCenterIcon,
  ContactSupport as ContactSupportIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const currentYear = new Date().getFullYear();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // State for all modals
  const [activeModal, setActiveModal] = useState(null);
  
  // Helper function to open a specific modal
  const openModal = (modalName) => {
    setActiveModal(modalName);
  };
  
  // Helper function to close the active modal
  const closeModal = () => {
    setActiveModal(null);
  };

  const quickLinks = [
    { text: 'About Us', id: 'about-us' },
    { text: 'Academic Programs', id: 'academic-programs' },
    { text: 'Research', id: 'research' },
    { text: 'Library', id: 'library' },
    { text: 'Student Portal', id: 'student-portal' },
    { text: 'Career Opportunities', id: 'careers' }
  ];

  const resources = [
    { text: 'Academic Calendar', id: 'academic-calendar' },
    { text: 'News & Events', id: 'news-events' },
    { text: 'Publications', id: 'publications' },
    { text: 'Alumni', id: 'alumni' },
    { text: 'Support Services', id: 'support-services' }
  ];

  const contactInfo = [
    { icon: <PhoneIcon />, text: '+251 25 111 1399', href: 'tel:+251251111399' },
    { icon: <EmailIcon />, text: 'info@ddu.edu.et', href: 'mailto:info@ddu.edu.et' },
    { icon: <LocationIcon />, text: 'Dire Dawa, Ethiopia', href: 'https://maps.google.com/?q=Dire+Dawa+University' }
  ];

  const socialLinks = [
    { icon: <FacebookIcon />, href: 'https://www.facebook.com/diredawauniversity', label: 'Facebook' },
    { icon: <TwitterIcon />, href: 'https://twitter.com/DireDawaUni', label: 'Twitter' },
    { icon: <LinkedInIcon />, href: 'https://www.linkedin.com/school/dire-dawa-university', label: 'LinkedIn' },
    { icon: <YouTubeIcon />, href: 'https://www.youtube.com/@diredawauniversity', label: 'YouTube' }
  ];
  
  // Function to handle external links
  const handleExternalLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
    <Box
      component="footer"
      sx={{
        bgcolor: isDarkMode ? 'rgb(30, 30, 30)' : '#f5f5f5', // Dark mode: dark gray, Light mode: light gray
        color: isDarkMode ? '#e0e0e0' : '#333333', // Text color based on mode
        py: { xs: 4, md: 6 },
        mt: 'auto',
        boxShadow: isDarkMode ? '0 -5px 15px rgba(0,0,0,0.3)' : '0 -5px 15px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease'
      }}
    >
      <Container 
        maxWidth="xl" 
        sx={{ 
          px: { xs: 1.5, sm: 2, md: 4, lg: 5 },  // Reduced padding for small screens
          mx: 'auto',
          position: 'relative',
          zIndex: 1, // Ensure content appears above the background pattern
          width: '100%',
          '& .MuiDivider-root': {
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          },
          '& .MuiPaper-root': {
            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
            color: isDarkMode ? '#e0e0e0' : 'inherit'
          },
          '& .MuiTypography-root': {
            color: isDarkMode ? '#e0e0e0' : 'inherit'
          },
          '& a': {
            color: isDarkMode ? '#90caf9' : '#1976d2'
          },
          '& .MuiDialog-paper': {
            bgcolor: isDarkMode ? 'rgb(30, 30, 30)' : '#ffffff',
          },
          '& .MuiDialogTitle-root': {
            bgcolor: isDarkMode ? 'rgb(40, 40, 40)' : '#f5f5f5',
          },
          '& .MuiDialogContent-root': {
            bgcolor: isDarkMode ? 'rgb(30, 30, 30)' : '#ffffff',
          },
          '& .MuiDialogActions-root': {
            bgcolor: isDarkMode ? 'rgb(40, 40, 40)' : '#f5f5f5',
          }
        }}
      >
        <Grid container spacing={{ xs: 2, sm: 4, md: 6 }} sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>  {/* Evenly distributed layout */}
          {/* University Info */}
          <Grid item xs={12} md={3}>
            <Box sx={{ mb: { xs: 1.5, sm: 2, md: 3 } }}>  {/* Reduced margin for small screens */}
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: { xs: 1, sm: 1.5, md: 2 },
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #f5f5f5 0%, #bbdefb 100%)', // Muted gradient
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)', // Stronger shadow for better contrast
                  fontSize: { xs: '1.15rem', sm: '1.25rem', md: '1.5rem' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 1.5, width: { xs: 30, sm: 35, md: 40 }, height: { xs: 30, sm: 35, md: 40 } }}>
                    <img 
                      src="/images/ddu.png" 
                      alt="Dire Dawa University Logo" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                  </Box>
                  <span>Dire Dawa University</span>
                </Box>
              </Typography>
              <Typography variant="body2" sx={{ mb: { xs: 1.5, sm: 2, md: 3 }, opacity: 0.95, lineHeight: 1.6, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Empowering minds, transforming futures. Join us in our pursuit of excellence in education,
                research, and innovation at Dire Dawa University.
              </Typography>
              {!isMobile ? (
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => openModal('ltms')}
                  sx={{
                    borderRadius: 8,
                    textTransform: 'none',
                    px: { xs: 2, sm: 2.5, md: 3 },
                    py: { xs: 0.75, md: 1 },
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                    background: 'linear-gradient(90deg, #42a5f5 0%, #1976d2 100%)',
                    boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
                      boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)'
                    }
                  }}
                >
                  Learn More About DDU
                </Button>
              ) : (
                <Link 
                  component="button"
                  onClick={() => openModal('ltms')}
                  color="primary"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    fontSize: '0.8rem',
                    textDecoration: 'none',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Learn More <ArrowForwardIcon sx={{ ml: 0.5, fontSize: '0.9rem' }} />
                </Link>
              )}
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} sm={6} md={3}>
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"} 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                position: 'relative',
                display: 'inline-block',
                pb: { xs: 0.5, md: 1 },
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: { xs: '30px', md: '40px' },
                  height: { xs: '2px', md: '3px' },
                  borderRadius: '3px',
                  backgroundColor: '#42a5f5'
                }
              }}
            >
              Quick Links
            </Typography>
            <Stack spacing={1}>
              {quickLinks.map((link) => (
                <Link
                  key={link.text}
                  component="button"
                  onClick={() => openModal(link.id)}
                  color="inherit"
                  sx={{
                    textDecoration: 'none',
                    opacity: 0.8,
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    p: 0,
                    '&:hover': {
                      opacity: 1,
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Resources */}
          <Grid item xs={6} sm={6} md={3}>
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"} 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                position: 'relative',
                display: 'inline-block',
                pb: { xs: 0.5, md: 1 },
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: { xs: '30px', md: '40px' },
                  height: { xs: '2px', md: '3px' },
                  borderRadius: '3px',
                  backgroundColor: '#42a5f5'
                }
              }}
            >
              Resources
            </Typography>
            <Stack spacing={1}>
              {resources.map((link) => (
                <Link
                  key={link.text}
                  component="button"
                  onClick={() => openModal(link.id)}
                  color="inherit"
                  sx={{
                    textDecoration: 'none',
                    opacity: 0.8,
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    p: 0,
                    '&:hover': {
                      opacity: 1,
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={3} sx={{ mt: { xs: 1, sm: 0 } }}>
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"} 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                position: 'relative',
                display: 'inline-block',
                pb: { xs: 0.5, md: 1 },
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: { xs: '30px', md: '40px' },
                  height: { xs: '2px', md: '3px' },
                  borderRadius: '3px',
                  backgroundColor: '#42a5f5'
                }
              }}
            >
              Contact Us
            </Typography>
            <Stack spacing={isMobile ? 1 : 1.5} sx={{ mt: 1, width: '100%' }}>
              {contactInfo.map((info) => (
                <Link
                  key={info.text}
                  component="button"
                  onClick={() => handleExternalLink(info.href)}
                  color="inherit"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    opacity: 0.85,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    p: 0,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      opacity: 1,
                      color: '#90caf9'
                    }
                  }}
                >
                  <Box sx={{
                    mr: { xs: 1, md: 2 },
                    backgroundColor: 'rgba(66, 165, 245, 0.2)',
                    borderRadius: '50%',
                    p: { xs: 0.5, md: 1 },
                    display: 'flex',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '& svg': { fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' } },
                    '&:hover': {
                      transform: 'scale(1.1)',
                      backgroundColor: 'rgba(66, 165, 245, 0.3)'
                    }
                  }}>
                    {info.icon}
                  </Box>
                  <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}>
                    {info.text}
                  </Typography>
                </Link>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ 
          my: { xs: 2, sm: 3, md: 4 }, 
          bgcolor: 'rgba(255, 255, 255, 0.15)', 
          width: '100%',
          mx: 'auto',
          '&::before, &::after': {
            bgcolor: 'rgba(255, 255, 255, 0.15)'
          }
        }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'center' },
            gap: 2,
            width: '100%'
          }}
        >
          <Typography variant="body2" sx={{ 
            opacity: 0.8, 
            textAlign: { xs: 'center', md: 'left' },
            fontWeight: 500,
            letterSpacing: '0.5px',
            fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' }
          }}>
            {currentYear} Dire Dawa University. All rights reserved.
          </Typography>

          {/* Social Links */}
          <Stack direction="row" spacing={1}>
            {socialLinks.map((link) => (
              <IconButton
                key={link.label}
                onClick={() => handleExternalLink(link.href)}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.3s ease',
                  p: { xs: 0.5, sm: 0.75, md: 1 },
                  '& svg': { fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' } },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                  }
                }}
                aria-label={link.label}
              >
                {link.icon}
              </IconButton>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
    
    {/* LTMS Modal */}
    <Dialog
      open={activeModal === 'ltms'}
      onClose={closeModal}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          overflow: 'hidden'
        }
      }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #0a1232 0%, #1a237e 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Dire Dawa University - Load Tracking Management System
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={closeModal}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                About LTMS
              </Typography>
              
              <Typography paragraph sx={{ mb: 2 }}>
                The <strong>Load Tracking Management System (LTMS)</strong> is a comprehensive digital solution developed specifically for Dire Dawa University to streamline and optimize the management of teaching loads across all departments and schools.
              </Typography>
              
              <Typography paragraph>
                This system enables efficient course assignment, workload tracking, and resource allocation, ensuring fair distribution of teaching responsibilities while maintaining academic quality standards.
              </Typography>
              
              <Paper elevation={2} sx={{ 
                p: 2, 
                mt: 3, 
                bgcolor: '#f5f7ff',
                borderLeft: '4px solid #1a237e' 
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1a237e' }}>
                  LTMS Vision
                </Typography>
                <Typography variant="body2">
                  To transform academic workload management through digital innovation, creating a transparent, efficient, and equitable system that supports both faculty and administration.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                Key Features
              </Typography>
              
              <List sx={{ p: 0 }}>
                {[
                  { 
                    icon: <DashboardIcon color="primary" />, 
                    primary: 'Intuitive Dashboard', 
                    secondary: 'Real-time analytics and visualizations of department workloads' 
                  },
                  { 
                    icon: <AssignmentIcon color="primary" />, 
                    primary: 'Course Management', 
                    secondary: 'Streamlined course creation, assignment, and tracking' 
                  },
                  { 
                    icon: <PeopleIcon color="primary" />, 
                    primary: 'Instructor Profiles', 
                    secondary: 'Comprehensive faculty profiles with specialization and workload history' 
                  },
                  { 
                    icon: <TimelineIcon color="primary" />, 
                    primary: 'Workload Balancing', 
                    secondary: 'Automated tools to ensure equitable distribution of teaching loads' 
                  },
                  { 
                    icon: <SettingsIcon color="primary" />, 
                    primary: 'Administrative Controls', 
                    secondary: 'Role-based access with approval workflows for department heads and deans' 
                  },
                ].map((item, index) => (
                  <ListItem key={index} sx={{ 
                    py: 1.5, 
                    borderBottom: index < 4 ? '1px solid rgba(0,0,0,0.08)' : 'none' 
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.primary}</Typography>} 
                      secondary={item.secondary} 
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Paper elevation={3} sx={{ 
                p: 2.5, 
                bgcolor: '#e8f4fd',
                borderRadius: 2,
              }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1 }}>
                    LTMS at Dire Dawa University
                  </Typography>
                  <Typography variant="body2">
                    Implemented in 2023, the LTMS has successfully optimized teaching load distribution across 15 departments, 
                    resulting in a 40% reduction in administrative processing time and a 25% improvement in faculty satisfaction with course assignments.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={closeModal} 
            variant="outlined"
            color="primary"
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={closeModal}
            startIcon={<SchoolIcon />}
          >
            Return to LTMS
          </Button>
        </DialogActions>
      </Dialog>

      {/* About Us Modal */}
      <Dialog
        open={activeModal === 'about-us'}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #0a1232 0%, #1a237e 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              About Dire Dawa University
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={closeModal}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                Our History
              </Typography>
              
              <Typography paragraph sx={{ mb: 2 }}>
                Established in 2006, Dire Dawa University (DDU) has rapidly emerged as one of Ethiopia's premier higher education institutions. Located in the historic city of Dire Dawa, the university was founded with a vision to provide quality education that addresses the developmental needs of the nation.
              </Typography>
              
              <Typography paragraph>
                From its humble beginnings with just three faculties and 725 students, DDU has grown to encompass 7 colleges, 35 departments, and over 20,000 students. The university's expansion reflects its commitment to meeting the educational needs of Ethiopia's growing population and contributing to the country's transformation agenda.
              </Typography>
              
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Our Mission
                </Typography>
                <Typography variant="body2">
                  To provide quality education, conduct problem-solving research, and deliver community services that contribute to the socio-economic development of Ethiopia through innovative teaching-learning processes and the use of modern technologies.
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Our Vision
                </Typography>
                <Typography variant="body2">
                  To be one of the top ten universities in East Africa by 2030, recognized for excellence in education, research, and community engagement.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                University at a Glance
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2 
              }}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a237e', mb: 0.5 }}>
                    Academic Structure
                  </Typography>
                  <Typography variant="body2">
                    • 7 Colleges and Institutes<br />
                    • 35 Undergraduate Programs<br />
                    • 28 Postgraduate Programs<br />
                    • 5 PhD Programs
                  </Typography>
                </Paper>
                
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a237e', mb: 0.5 }}>
                    Campus Facilities
                  </Typography>
                  <Typography variant="body2">
                    • Modern Library with over 100,000 volumes<br />
                    • 45 State-of-the-art Laboratories<br />
                    • ICT Center with high-speed internet<br />
                    • Student Recreation Centers<br />
                    • Sports Facilities and Stadium
                  </Typography>
                </Paper>
                
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a237e', mb: 0.5 }}>
                    Community Impact
                  </Typography>
                  <Typography variant="body2">
                    • Technology Transfer Centers<br />
                    • Community Service Programs<br />
                    • Industry Partnerships<br />
                    • Entrepreneurship Incubation Centers<br />
                    • Sustainable Development Initiatives
                  </Typography>
                </Paper>
              </Box>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Paper elevation={3} sx={{ 
                p: 2.5, 
                bgcolor: '#e8f4fd',
                borderRadius: 2,
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1 }}>
                  Leadership & Governance
                </Typography>
                <Typography variant="body2">
                  Dire Dawa University is led by a President and four Vice Presidents, with oversight from a Board of Directors appointed by the Ministry of Education. The university follows a participatory governance model that includes academic senate, college councils, and student representatives, ensuring inclusive decision-making processes.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={closeModal} 
            variant="outlined"
            color="primary"
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={closeModal}
            startIcon={<SchoolIcon />}
          >
            Back to LTMS
          </Button>
        </DialogActions>
      </Dialog>

      {/* Academic Programs Modal */}
      <Dialog
        open={activeModal === 'academic-programs'}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #0a1232 0%, #1a237e 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AssignmentIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Academic Programs at Dire Dawa University
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={closeModal}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography paragraph>
                Dire Dawa University offers a diverse range of undergraduate and postgraduate programs across various disciplines. Our academic programs are designed to meet international standards while addressing Ethiopia's development needs and priorities.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                College of Computing and Informatics
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Undergraduate Programs
                </Typography>
                <List dense sx={{ pl: 2 }}>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary="BSc in Computer Science"
                      secondary="4-year program focusing on theoretical foundations and practical applications of computing"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary="BSc in Information Technology"
                      secondary="4-year program emphasizing IT infrastructure, systems integration, and service management"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary="BSc in Software Engineering"
                      secondary="4-year program specializing in software development methodologies and practices"
                    />
                  </ListItem>
                </List>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Postgraduate Programs
                </Typography>
                <List dense sx={{ pl: 2 }}>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary="MSc in Computer Science"
                      secondary="2-year program with specializations in AI, Data Science, and Cybersecurity"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary="MSc in Information Systems"
                      secondary="2-year program focusing on enterprise systems and digital transformation"
                    />
                  </ListItem>
                </List>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                College of Engineering
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Undergraduate Programs
                </Typography>
                <List dense sx={{ pl: 2 }}>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary="BSc in Civil Engineering"
                      secondary="5-year program covering structural, geotechnical, and transportation engineering"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary="BSc in Electrical Engineering"
                      secondary="5-year program with focus on power systems, control, and communications"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary="BSc in Mechanical Engineering"
                      secondary="5-year program covering thermal systems, manufacturing, and design"
                    />
                  </ListItem>
                </List>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Postgraduate Programs
                </Typography>
                <List dense sx={{ pl: 2 }}>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary="MSc in Structural Engineering"
                      secondary="2-year program specializing in advanced structural analysis and design"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary="MSc in Power Systems Engineering"
                      secondary="2-year program focusing on modern power generation and distribution"
                    />
                  </ListItem>
                </List>
              </Box>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Paper elevation={3} sx={{ 
                p: 2.5, 
                bgcolor: '#e8f4fd',
                borderRadius: 2,
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1 }}>
                  Additional Colleges and Programs
                </Typography>
                <Typography variant="body2" paragraph>
                  Dire Dawa University also offers programs through the following colleges:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="College of Business and Economics" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="College of Natural and Computational Sciences" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="College of Social Sciences and Humanities" />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="College of Health and Medical Sciences" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="College of Agriculture" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="School of Law" />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={closeModal} 
            variant="outlined"
            color="primary"
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={closeModal}
            startIcon={<SchoolIcon />}
          >
            Back to LTMS
          </Button>
        </DialogActions>
      </Dialog>

      {/* Research Modal */}
      <Dialog
        open={activeModal === 'research'}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #0a1232 0%, #1a237e 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TimelineIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Research at Dire Dawa University
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={closeModal}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography paragraph>
                Research at Dire Dawa University is guided by our commitment to addressing national development priorities while contributing to global knowledge. Our research activities focus on finding innovative solutions to local challenges while maintaining international standards of academic excellence.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                Research Centers of Excellence
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Center for Sustainable Development
                </Typography>
                <Typography variant="body2" paragraph>
                  Established in 2015, this center focuses on research related to environmental sustainability, renewable energy, and climate change adaptation strategies relevant to Ethiopia's context.
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Technology Innovation Center
                </Typography>
                <Typography variant="body2" paragraph>
                  This center promotes technological innovation and entrepreneurship through research on ICT applications, digital solutions for development, and technology transfer.
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Center for Policy Studies
                </Typography>
                <Typography variant="body2">
                  Focusing on evidence-based policy research, this center works closely with government agencies to inform national and regional development policies through rigorous research and analysis.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                Research Achievements & Partnerships
              </Typography>
              
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  International Collaborations
                </Typography>
                <Typography variant="body2">
                  DDU maintains active research partnerships with universities across Africa, Europe, and North America. Notable collaborations include joint research projects with:
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="University of Nairobi (Kenya) on water resource management" />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Technical University of Munich (Germany) on renewable energy" />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="University of California (USA) on agricultural technology" />
                  </ListItem>
                </List>
              </Paper>
              
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Publications & Impact
                </Typography>
                <Typography variant="body2">
                  In the past five years, DDU researchers have published over 500 papers in international journals, with particular strength in:
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Agricultural sciences and food security" />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Renewable energy and environmental engineering" />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Public health and infectious disease control" />
                  </ListItem>
                </List>
              </Paper>
              
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Research Funding
                </Typography>
                <Typography variant="body2">
                  DDU has secured over $5 million in research grants in the last three years from organizations including the World Bank, African Development Bank, European Union, and various UN agencies.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Paper elevation={3} sx={{ 
                p: 2.5, 
                bgcolor: '#e8f4fd',
                borderRadius: 2,
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1 }}>
                  Research Opportunities
                </Typography>
                <Typography variant="body2" paragraph>
                  Dire Dawa University welcomes collaboration with researchers, institutions, and industry partners. We offer various opportunities for engagement:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Joint research projects with international partners" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Visiting researcher positions" />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Postgraduate research opportunities" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Industry-academia collaborative research" />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={closeModal} 
            variant="outlined"
            color="primary"
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={closeModal}
            startIcon={<SchoolIcon />}
          >
            Back to LTMS
          </Button>
        </DialogActions>
      </Dialog>

      {/* Library Modal */}
      <Dialog
        open={activeModal === 'library'}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #0a1232 0%, #1a237e 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Dire Dawa University Library
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={closeModal}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography paragraph>
                The Dire Dawa University Library System serves as the intellectual hub of our academic community, providing comprehensive resources and services to support teaching, learning, and research activities across all disciplines.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                Library Resources
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Physical Collections
                </Typography>
                <Typography variant="body2" paragraph>
                  Our library houses over 100,000 print volumes, including textbooks, reference materials, journals, and rare Ethiopian manuscripts. The collection spans all academic disciplines taught at the university, with particular strength in engineering, agriculture, and Ethiopian studies.
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Digital Resources
                </Typography>
                <Typography variant="body2" paragraph>
                  The library provides access to over 50,000 e-books and more than 30,000 electronic journals through subscriptions to major academic databases including JSTOR, ScienceDirect, IEEE Xplore, and African Journals Online.
                </Typography>
                <Typography variant="body2">
                  Our digital repository contains theses, dissertations, and research publications by DDU faculty and students, preserving and showcasing the university's intellectual output.
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Specialized Collections
                </Typography>
                <Typography variant="body2">
                  The library maintains special collections including the Ethiopian Heritage Collection, which contains historical documents, maps, and photographs related to Ethiopia's rich cultural and historical legacy, and the Technical Reference Collection, which houses standards, patents, and technical reports.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                Services & Facilities
              </Typography>
              
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Library Spaces
                </Typography>
                <Typography variant="body2">
                  The main library building spans 15,000 square meters across four floors, featuring:
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Silent study areas with 500 individual carrels" />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="20 group study rooms equipped with smart boards" />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Computer lab with 150 workstations" />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Multimedia center for audiovisual materials" />
                  </ListItem>
                </List>
              </Paper>
              
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Academic Support Services
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Research Consultation" 
                      secondary="One-on-one assistance with research projects and literature reviews"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Information Literacy Workshops" 
                      secondary="Regular training on database searching, citation management, and academic integrity"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Document Delivery" 
                      secondary="Interlibrary loan services with partner institutions in Ethiopia and abroad"
                    />
                  </ListItem>
                </List>
              </Paper>
              
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Technology & Innovation
                </Typography>
                <Typography variant="body2">
                  The library employs modern library management systems, RFID technology for circulation, and a mobile app that allows users to search the catalog, renew loans, and access e-resources remotely.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Paper elevation={3} sx={{ 
                p: 2.5, 
                bgcolor: '#e8f4fd',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Box sx={{ 
                  bgcolor: '#bbdefb', 
                  borderRadius: '50%', 
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <SchoolIcon sx={{ fontSize: 32, color: '#0d47a1' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                    Library Hours & Access
                  </Typography>
                  <Typography variant="body2">
                    The main library is open from 8:00 AM to 10:00 PM on weekdays and 9:00 AM to 6:00 PM on weekends. During examination periods, the library extends its hours to 24/7 access. All DDU students, faculty, and staff have borrowing privileges, while external researchers can apply for special access permits.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={closeModal} 
            variant="outlined"
            color="primary"
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={closeModal}
            startIcon={<SchoolIcon />}
          >
            Back to LTMS
          </Button>
        </DialogActions>
      </Dialog>

      {/* Student Portal Modal */}
      <Dialog
        open={activeModal === 'student-portal'}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #0a1232 0%, #1a237e 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              DDU Student Portal
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={closeModal}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography paragraph>
                The Dire Dawa University Student Portal is your comprehensive digital gateway to academic resources, administrative services, and campus life. Designed to enhance your educational experience, the portal provides seamless access to essential tools and information throughout your academic journey.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                Academic Services
              </Typography>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#bbdefb', color: '#0d47a1', mr: 2 }}>
                    <MenuBookIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                      Course Registration
                    </Typography>
                    <Typography variant="body2">
                      Register for courses, view available classes, and manage your academic schedule. The system provides real-time information on course availability, prerequisites, and instructor details.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#bbdefb', color: '#0d47a1', mr: 2 }}>
                    <AssessmentIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                      Grade Tracking
                    </Typography>
                    <Typography variant="body2">
                      Access your academic records, including current and past grades, GPA calculation, and academic standing. The system provides detailed breakdowns of your performance across all courses and semesters.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#bbdefb', color: '#0d47a1', mr: 2 }}>
                    <CalendarTodayIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                      Academic Calendar
                    </Typography>
                    <Typography variant="body2">
                      Stay informed about important academic dates, including registration periods, examination schedules, holidays, and university events. The calendar integrates with your personal schedule for comprehensive planning.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                Student Resources
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Financial Management
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0, py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Tuition Payment" 
                      secondary="Secure online payment system for tuition and fees"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Scholarship Management" 
                      secondary="Apply for and track scholarships and financial aid"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Financial Statements" 
                      secondary="Access detailed statements of your university account"
                    />
                  </ListItem>
                </List>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Campus Life
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0, py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Housing Management" 
                      secondary="Apply for dormitories and manage housing preferences"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Student Organizations" 
                      secondary="Browse and join student clubs and organizations"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Event Calendar" 
                      secondary="Comprehensive listing of campus events and activities"
                    />
                  </ListItem>
                </List>
              </Box>
              
              <Paper elevation={3} sx={{ 
                p: 2.5, 
                bgcolor: '#e8f4fd',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Box sx={{ 
                  bgcolor: '#bbdefb', 
                  borderRadius: '50%', 
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <DevicesIcon sx={{ fontSize: 32, color: '#0d47a1' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                    Mobile Access
                  </Typography>
                  <Typography variant="body2">
                    The DDU Student Portal is fully responsive and available as a dedicated mobile app for both Android and iOS devices, ensuring you stay connected to your academic life anytime, anywhere.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                mb: 2
              }}>
                Getting Started
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ 
                    p: 2, 
                    height: '100%', 
                    borderRadius: 2,
                    border: '1px solid #e0e0e0'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1565c0', mr: 1.5 }}>
                        <LockIcon />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Step 1: Account Setup
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      Use your university-provided credentials to log in. First-time users will need to complete a one-time verification process and set up security questions for account recovery.
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ 
                    p: 2, 
                    height: '100%', 
                    borderRadius: 2,
                    border: '1px solid #e0e0e0'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1565c0', mr: 1.5 }}>
                        <PersonalVideoIcon />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Step 2: Profile Completion
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      Update your personal information, emergency contacts, and academic preferences. Upload a profile photo and customize your dashboard to prioritize the information most relevant to you.
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ 
                    p: 2, 
                    height: '100%', 
                    borderRadius: 2,
                    border: '1px solid #e0e0e0'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1565c0', mr: 1.5 }}>
                        <HelpIcon />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Step 3: Orientation
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      Complete the interactive portal tutorial to familiarize yourself with all available features. Access the help center for detailed guides, video tutorials, and FAQs to maximize your use of the portal.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={closeModal} 
            variant="outlined"
            color="primary"
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={closeModal}
            startIcon={<PersonIcon />}
          >
            Back to LTMS
          </Button>
        </DialogActions>
      </Dialog>

      {/* Career Opportunities Modal */}
      <Dialog
        open={activeModal === 'careers'}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #0a1232 0%, #1a237e 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WorkIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Career Opportunities at DDU
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={closeModal}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography paragraph>
                Dire Dawa University is committed to fostering career development and professional growth for students, alumni, and the wider community. Our comprehensive career services and employment opportunities are designed to bridge the gap between academic excellence and professional success.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                Career Development Services
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Career Counseling
                </Typography>
                <Typography variant="body2" paragraph>
                  Our professional career counselors provide personalized guidance to help students and alumni identify their strengths, interests, and career goals. Services include career assessment tools, one-on-one counseling sessions, and specialized workshops on career planning and development.
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Resume and Interview Preparation
                </Typography>
                <Typography variant="body2" paragraph>
                  Enhance your job application materials with expert assistance in resume writing, cover letter development, and portfolio creation. Our interview preparation services include mock interviews, feedback sessions, and workshops on effective communication and professional presentation.
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  Networking Opportunities
                </Typography>
                <Typography variant="body2">
                  Connect with industry professionals, alumni, and potential employers through our networking events, career fairs, and industry panels. Our alumni mentorship program pairs current students with successful graduates in their field of interest for guidance and professional connections.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                Employment Opportunities
              </Typography>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar sx={{ bgcolor: '#bbdefb', color: '#0d47a1', mr: 2 }}>
                    <BusinessCenterIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                      Job Placement Services
                    </Typography>
                    <Typography variant="body2">
                      Our dedicated job placement office works with employers across Ethiopia and internationally to identify suitable positions for our graduates. We maintain a comprehensive job board with opportunities ranging from entry-level positions to executive roles across various industries.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar sx={{ bgcolor: '#bbdefb', color: '#0d47a1', mr: 2 }}>
                    <SchoolIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                      Internship Programs
                    </Typography>
                    <Typography variant="body2">
                      Gain practical experience through our extensive internship network with partner organizations in government, private sector, and non-profit institutions. Our internship coordination office facilitates placements that align with academic requirements and career aspirations.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar sx={{ bgcolor: '#bbdefb', color: '#0d47a1', mr: 2 }}>
                    <WorkIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                      On-Campus Employment
                    </Typography>
                    <Typography variant="body2">
                      DDU offers numerous on-campus employment opportunities for current students, including research assistantships, teaching assistantships, administrative positions, and service roles. These positions provide valuable work experience while accommodating academic schedules.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                mb: 2
              }}>
                Industry Partnerships
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ 
                    p: 2.5, 
                    borderRadius: 2,
                    height: '100%',
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1.5 }}>
                      Corporate Collaborations
                    </Typography>
                    <Typography variant="body2">
                      DDU maintains strategic partnerships with leading national and international corporations across various sectors. These collaborations result in tailored training programs, sponsored research projects, and preferential recruitment opportunities for our graduates.
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ 
                    p: 2.5, 
                    borderRadius: 2,
                    height: '100%',
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1.5 }}>
                      Entrepreneurship Support
                    </Typography>
                    <Typography variant="body2">
                      Our Business Incubation Center provides comprehensive support for student and alumni entrepreneurs, including mentorship, seed funding, workspace, and networking opportunities. The center has successfully launched over 50 startups in technology, agriculture, and service sectors.
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ 
                    p: 2.5, 
                    borderRadius: 2,
                    height: '100%',
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1.5 }}>
                      Professional Development
                    </Typography>
                    <Typography variant="body2">
                      In collaboration with industry partners, DDU offers specialized certification programs, workshops, and continuing education courses designed to enhance professional skills and keep pace with industry developments. These programs are available to students, alumni, and professionals seeking career advancement.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Paper elevation={3} sx={{ 
                p: 2.5, 
                bgcolor: '#e8f4fd',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Box sx={{ 
                  bgcolor: '#bbdefb', 
                  borderRadius: '50%', 
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <EventIcon sx={{ fontSize: 32, color: '#0d47a1' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                    Upcoming Career Events
                  </Typography>
                  <Typography variant="body2">
                    Join us for our Annual Career Fair on October 15-16, 2023, featuring over 100 employers from diverse industries. Additionally, our monthly Career Development Workshops cover topics such as "Digital Skills for the Modern Workplace" and "Navigating the Global Job Market." Visit the Career Services office or check the online portal for registration details.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={closeModal} 
            variant="outlined"
            color="primary"
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={closeModal}
            startIcon={<WorkIcon />}
          >
            Back to LTMS
          </Button>
        </DialogActions>
      </Dialog>

      {/* Academic Calendar Modal */}
      <Dialog
        open={activeModal === 'academic-calendar'}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #0a1232 0%, #1a237e 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarTodayIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              DDU Academic Calendar
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={closeModal}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography paragraph>
                The Dire Dawa University Academic Calendar provides a comprehensive schedule of all academic activities, important dates, and events for the current academic year. This calendar serves as the official reference for planning your academic journey at DDU.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ 
                p: 2.5, 
                bgcolor: '#e8f4fd',
                borderRadius: 2,
                mb: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#bbdefb', color: '#0d47a1', mr: 2 }}>
                    <SchoolIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#0d47a1' }}>
                    2024-2025 Academic Year
                  </Typography>
                </Box>
                <Typography variant="body2">
                  The current academic year is divided into two semesters, with a short winter break and a longer summer break. Each semester consists of 16 weeks of instruction followed by a 2-week examination period.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                First Semester
              </Typography>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1.5 }}>
                  September 2024
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="September 2-6" 
                      secondary="New Student Orientation Week"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="September 9" 
                      secondary="First Semester Classes Begin"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="September 9-13" 
                      secondary="Add/Drop Period"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="September 11" 
                      secondary="Ethiopian New Year (No Classes)"
                    />
                  </ListItem>
                </List>
              </Paper>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1.5 }}>
                  October 2024
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="October 7-11" 
                      secondary="Mid-term Examination Week"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="October 18" 
                      secondary="Mid-term Grades Due"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="October 28" 
                      secondary="Last Day to Withdraw from Courses"
                    />
                  </ListItem>
                </List>
              </Paper>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1.5 }}>
                  November - December 2024
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="November 25-29" 
                      secondary="Registration for Second Semester"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="December 13" 
                      secondary="Last Day of Classes"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="December 16-27" 
                      secondary="Final Examination Period"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="December 30 - January 10" 
                      secondary="Winter Break"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                Second Semester
              </Typography>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1.5 }}>
                  January - February 2025
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="January 13" 
                      secondary="Second Semester Classes Begin"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="January 13-17" 
                      secondary="Add/Drop Period"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="January 20" 
                      secondary="Ethiopian Epiphany (No Classes)"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="February 10-14" 
                      secondary="Mid-term Examination Week"
                    />
                  </ListItem>
                </List>
              </Paper>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1.5 }}>
                  March - April 2025
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="March 3" 
                      secondary="Adwa Victory Day (No Classes)"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="March 10" 
                      secondary="Last Day to Withdraw from Courses"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="April 14-18" 
                      secondary="Registration for Summer Courses"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="April 25" 
                      secondary="Last Day of Classes"
                    />
                  </ListItem>
                </List>
              </Paper>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1.5 }}>
                  May - August 2025
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="May 1" 
                      secondary="International Workers' Day (No Classes)"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="May 5-16" 
                      secondary="Final Examination Period"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="May 28" 
                      secondary="Downfall of the Derg Regime (No Classes)"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="June 7" 
                      secondary="Graduation Ceremony"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="June 16 - August 22" 
                      secondary="Summer Session (Optional)"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                mb: 2
              }}>
                Important Academic Policies
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ 
                    p: 2, 
                    height: '100%', 
                    borderRadius: 2,
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1 }}>
                      Attendance Policy
                    </Typography>
                    <Typography variant="body2">
                      Students are expected to attend all scheduled classes. A minimum attendance of 80% is required to be eligible for final examinations. Students with medical or emergency absences should contact the Office of Student Affairs within 48 hours.
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ 
                    p: 2, 
                    height: '100%', 
                    borderRadius: 2,
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1 }}>
                      Examination Rules
                    </Typography>
                    <Typography variant="body2">
                      Students must present a valid university ID to enter examination halls. No electronic devices are permitted during examinations unless specifically authorized by the instructor. Make-up examinations are only granted for documented medical emergencies or university-approved activities.
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ 
                    p: 2, 
                    height: '100%', 
                    borderRadius: 2,
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1 }}>
                      Grading System
                    </Typography>
                    <Typography variant="body2">
                      DDU uses a 4.0 grade point system. A: 4.0 (90-100%), B+: 3.5 (85-89%), B: 3.0 (80-84%), C+: 2.5 (75-79%), C: 2.0 (70-74%), D: 1.0 (60-69%), F: 0.0 (below 60%). A minimum CGPA of 2.0 is required for graduation.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={closeModal} 
            variant="outlined"
            color="primary"
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={closeModal}
            startIcon={<CalendarTodayIcon />}
          >
            Back to LTMS
          </Button>
        </DialogActions>
      </Dialog>

      {/* News & Events Modal */}
      <Dialog
        open={activeModal === 'news-events'}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #0a1232 0%, #1a237e 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EventIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              DDU News & Events
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={closeModal}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography paragraph>
                Stay updated with the latest news, events, and announcements from Dire Dawa University. From academic achievements to cultural celebrations, this is your source for all university happenings.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 3
              }}>
                Latest News
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper elevation={3} sx={{ 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Box sx={{ 
                      height: 180, 
                      bgcolor: '#bbdefb', 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <SchoolIcon sx={{ fontSize: 64, color: '#0d47a1' }} />
                    </Box>
                    <Box sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#0d47a1', fontWeight: 600, bgcolor: '#e3f2fd', px: 1, py: 0.5, borderRadius: 1 }}>
                          ACADEMIC
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          April 25, 2025
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        DDU Ranked Among Top 10 Universities in Ethiopia
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                        Dire Dawa University has been ranked among the top 10 universities in Ethiopia according to the latest Higher Education Relevance and Quality Agency (HERQA) assessment. The university scored particularly high in research output and community engagement.
                      </Typography>
                      <Button 
                        variant="text" 
                        color="primary" 
                        size="small"
                        sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
                        endIcon={<ArrowForwardIcon />}
                      >
                        Read More
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={3} sx={{ 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Box sx={{ 
                      height: 180, 
                      bgcolor: '#e1f5fe', 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <BusinessCenterIcon sx={{ fontSize: 64, color: '#0288d1' }} />
                    </Box>
                    <Box sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#0288d1', fontWeight: 600, bgcolor: '#e1f5fe', px: 1, py: 0.5, borderRadius: 1 }}>
                          PARTNERSHIP
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          April 18, 2025
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        DDU Signs MoU with Ethiopian Airlines for Training Programs
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                        Dire Dawa University has signed a Memorandum of Understanding with Ethiopian Airlines to establish specialized training programs in aviation management, aircraft maintenance, and logistics. The partnership will provide students with industry-relevant skills and internship opportunities.
                      </Typography>
                      <Button 
                        variant="text" 
                        color="primary" 
                        size="small"
                        sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
                        endIcon={<ArrowForwardIcon />}
                      >
                        Read More
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={3} sx={{ 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Box sx={{ 
                      height: 180, 
                      bgcolor: '#e8f4fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <WorkIcon sx={{ fontSize: 64, color: '#2e7d32' }} />
                    </Box>
                    <Box sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600, bgcolor: '#e8f4fd', px: 1, py: 0.5, borderRadius: 1 }}>
                          RESEARCH
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          April 10, 2025
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        DDU Researchers Develop Drought-Resistant Crop Varieties
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                        A team of researchers from DDU's College of Agriculture has successfully developed drought-resistant varieties of teff and sorghum, staple crops in Ethiopia. The new varieties require 30% less water and have shown a 25% increase in yield during field trials in the eastern regions of the country.
                      </Typography>
                      <Button 
                        variant="text" 
                        color="primary" 
                        size="small"
                        sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
                        endIcon={<ArrowForwardIcon />}
                      >
                        Read More
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 3
              }}>
                Upcoming Events
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ 
                    p: 0, 
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    mb: { xs: 0, md: 2 }
                  }}>
                    <Box sx={{ 
                      width: { xs: '100%', sm: 120 },
                      height: { xs: 100, sm: 'auto' },
                      bgcolor: '#e3f2fd',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#0d47a1' }}>12</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0d47a1' }}>MAY</Typography>
                      <Typography variant="caption" sx={{ color: '#0d47a1' }}>2025</Typography>
                    </Box>
                    <Box sx={{ p: 2, flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Annual Technology Innovation Expo
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', mr: 2 }}>
                          May 12-14, 2025
                        </Typography>
                        <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          DDU Main Campus
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        Showcasing student and faculty innovations in technology, engineering, and digital solutions. Open to the public with demonstrations, workshops, and networking opportunities with industry partners.
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ 
                    p: 0, 
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    mb: { xs: 0, md: 2 }
                  }}>
                    <Box sx={{ 
                      width: { xs: '100%', sm: 120 },
                      height: { xs: 100, sm: 'auto' },
                      bgcolor: '#fff3e0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#e65100' }}>20</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e65100' }}>MAY</Typography>
                      <Typography variant="caption" sx={{ color: '#e65100' }}>2025</Typography>
                    </Box>
                    <Box sx={{ p: 2, flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        International Cultural Festival
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', mr: 2 }}>
                          May 20, 2025
                        </Typography>
                        <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          DDU Amphitheater
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        A celebration of cultural diversity featuring performances, exhibitions, and cuisine from Ethiopia's diverse regions and international student communities. The event promotes cultural exchange and global awareness.
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ 
                    p: 0, 
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' }
                  }}>
                    <Box sx={{ 
                      width: { xs: '100%', sm: 120 },
                      height: { xs: 100, sm: 'auto' },
                      bgcolor: '#f3e5f5',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#6a1b9a' }}>02</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6a1b9a' }}>JUN</Typography>
                      <Typography variant="caption" sx={{ color: '#6a1b9a' }}>2025</Typography>
                    </Box>
                    <Box sx={{ p: 2, flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Career Fair & Recruitment Day
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', mr: 2 }}>
                          June 2, 2025
                        </Typography>
                        <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          DDU Conference Center
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        Connect with over 50 employers from various industries offering job opportunities, internships, and career guidance. The event includes resume reviews, mock interviews, and professional networking sessions.
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ 
                    p: 0, 
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' }
                  }}>
                    <Box sx={{ 
                      width: { xs: '100%', sm: 120 },
                      height: { xs: 100, sm: 'auto' },
                      bgcolor: '#e0f2f1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#00695c' }}>07</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#00695c' }}>JUN</Typography>
                      <Typography variant="caption" sx={{ color: '#00695c' }}>2025</Typography>
                    </Box>
                    <Box sx={{ p: 2, flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Graduation Ceremony
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', mr: 2 }}>
                          June 7, 2025
                        </Typography>
                        <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          DDU Stadium
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        The annual commencement ceremony celebrating the achievements of the Class of 2025. The event will feature keynote speeches from distinguished alumni and government officials, followed by a reception for graduates and their families.
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 4 }}>
              <Paper elevation={3} sx={{ 
                p: 2.5, 
                bgcolor: '#e8f4fd',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Box sx={{ 
                  bgcolor: '#bbdefb', 
                  borderRadius: '50%', 
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <NotificationsIcon sx={{ fontSize: 32, color: '#0d47a1' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                    Stay Updated
                  </Typography>
                  <Typography variant="body2">
                    Subscribe to our monthly newsletter to receive updates on university news, events, and announcements directly in your inbox. You can also follow us on social media platforms for real-time updates and community engagement.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={closeModal} 
            variant="outlined"
            color="primary"
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={closeModal}
            startIcon={<EventIcon />}
          >
            Back to LTMS
          </Button>
        </DialogActions>
      </Dialog>

      {/* Publications Modal */}
      <Dialog
        open={activeModal === 'publications'}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #0a1232 0%, #1a237e 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MenuBookIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              DDU Publications
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={closeModal}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography paragraph>
                Dire Dawa University is committed to advancing knowledge through high-quality research and scholarly publications. Our faculty and students contribute to academic discourse through various publications, ranging from peer-reviewed journal articles to books and conference proceedings.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                Featured Publications
              </Typography>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 2.5 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Box sx={{ 
                    minWidth: { xs: '100%', sm: 180 },
                    height: { xs: 180, sm: 220 },
                    bgcolor: '#e3f2fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1
                  }}>
                    <MenuBookIcon sx={{ fontSize: 64, color: '#0d47a1' }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1 }}>
                      Journal of Ethiopian Studies
                    </Typography>
                    <Typography variant="body2" paragraph>
                      The Journal of Ethiopian Studies is a peer-reviewed academic journal published biannually by Dire Dawa University. It features original research articles, reviews, and scholarly commentaries on various aspects of Ethiopian history, culture, politics, economics, and development.
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Typography variant="caption" sx={{ bgcolor: '#e3f2fd', px: 1, py: 0.5, borderRadius: 1, color: '#0d47a1' }}>
                        Ethiopian Studies
                      </Typography>
                      <Typography variant="caption" sx={{ bgcolor: '#e3f2fd', px: 1, py: 0.5, borderRadius: 1, color: '#0d47a1' }}>
                        History
                      </Typography>
                      <Typography variant="caption" sx={{ bgcolor: '#e3f2fd', px: 1, py: 0.5, borderRadius: 1, color: '#0d47a1' }}>
                        Culture
                      </Typography>
                      <Typography variant="caption" sx={{ bgcolor: '#e3f2fd', px: 1, py: 0.5, borderRadius: 1, color: '#0d47a1' }}>
                        Development
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      size="small"
                      startIcon={<MenuBookIcon />}
                    >
                      Browse Journal
                    </Button>
                  </Box>
                </Box>
              </Paper>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 2.5 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Box sx={{ 
                    minWidth: { xs: '100%', sm: 180 },
                    height: { xs: 180, sm: 220 },
                    bgcolor: '#e8f5e9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1
                  }}>
                    <MenuBookIcon sx={{ fontSize: 64, color: '#2e7d32' }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2e7d32', mb: 1 }}>
                      Advances in Agricultural Sciences
                    </Typography>
                    <Typography variant="body2" paragraph>
                      This quarterly journal publishes cutting-edge research in agricultural sciences with a focus on sustainable farming practices, crop improvement, livestock management, and agricultural economics relevant to Ethiopia and the Horn of Africa region.
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Typography variant="caption" sx={{ bgcolor: '#e8f5e9', px: 1, py: 0.5, borderRadius: 1, color: '#2e7d32' }}>
                        Agriculture
                      </Typography>
                      <Typography variant="caption" sx={{ bgcolor: '#e8f5e9', px: 1, py: 0.5, borderRadius: 1, color: '#2e7d32' }}>
                        Sustainability
                      </Typography>
                      <Typography variant="caption" sx={{ bgcolor: '#e8f5e9', px: 1, py: 0.5, borderRadius: 1, color: '#2e7d32' }}>
                        Food Security
                      </Typography>
                      <Typography variant="caption" sx={{ bgcolor: '#e8f5e9', px: 1, py: 0.5, borderRadius: 1, color: '#2e7d32' }}>
                        Rural Development
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      color="success" 
                      size="small"
                      startIcon={<MenuBookIcon />}
                    >
                      Browse Journal
                    </Button>
                  </Box>
                </Box>
              </Paper>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Box sx={{ 
                    minWidth: { xs: '100%', sm: 180 },
                    height: { xs: 180, sm: 220 },
                    bgcolor: '#fff3e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1
                  }}>
                    <MenuBookIcon sx={{ fontSize: 64, color: '#e65100' }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#e65100', mb: 1 }}>
                      East African Journal of Engineering and Technology
                    </Typography>
                    <Typography variant="body2" paragraph>
                      A multidisciplinary engineering journal that publishes original research in civil, mechanical, electrical, and computer engineering with emphasis on technological solutions for regional development challenges.
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Typography variant="caption" sx={{ bgcolor: '#fff3e0', px: 1, py: 0.5, borderRadius: 1, color: '#e65100' }}>
                        Engineering
                      </Typography>
                      <Typography variant="caption" sx={{ bgcolor: '#fff3e0', px: 1, py: 0.5, borderRadius: 1, color: '#e65100' }}>
                        Technology
                      </Typography>
                      <Typography variant="caption" sx={{ bgcolor: '#fff3e0', px: 1, py: 0.5, borderRadius: 1, color: '#e65100' }}>
                        Innovation
                      </Typography>
                      <Typography variant="caption" sx={{ bgcolor: '#fff3e0', px: 1, py: 0.5, borderRadius: 1, color: '#e65100' }}>
                        Infrastructure
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      color="warning" 
                      size="small"
                      startIcon={<MenuBookIcon />}
                    >
                      Browse Journal
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                Publication Statistics
              </Typography>
              
              <Paper elevation={3} sx={{ p: 2.5, borderRadius: 2, mb: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 2 }}>
                  Research Output (2020-2025)
                </Typography>
                
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Journal Articles</Typography>
                    <Typography variant="body2" fontWeight="600">325</Typography>
                  </Box>
                  <Box sx={{ width: '100%', bgcolor: '#e0e0e0', height: 8, borderRadius: 4 }}>
                    <Box sx={{ width: '85%', bgcolor: '#1976d2', height: 8, borderRadius: 4 }} />
                  </Box>
                </Box>
                
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Conference Papers</Typography>
                    <Typography variant="body2" fontWeight="600">218</Typography>
                  </Box>
                  <Box sx={{ width: '100%', bgcolor: '#e0e0e0', height: 8, borderRadius: 4 }}>
                    <Box sx={{ width: '65%', bgcolor: '#1976d2', height: 8, borderRadius: 4 }} />
                  </Box>
                </Box>
                
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Books & Book Chapters</Typography>
                    <Typography variant="body2" fontWeight="600">87</Typography>
                  </Box>
                  <Box sx={{ width: '100%', bgcolor: '#e0e0e0', height: 8, borderRadius: 4 }}>
                    <Box sx={{ width: '40%', bgcolor: '#1976d2', height: 8, borderRadius: 4 }} />
                  </Box>
                </Box>
                
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Policy Briefs</Typography>
                    <Typography variant="body2" fontWeight="600">56</Typography>
                  </Box>
                  <Box sx={{ width: '100%', bgcolor: '#e0e0e0', height: 8, borderRadius: 4 }}>
                    <Box sx={{ width: '25%', bgcolor: '#1976d2', height: 8, borderRadius: 4 }} />
                  </Box>
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Patents</Typography>
                    <Typography variant="body2" fontWeight="600">12</Typography>
                  </Box>
                  <Box sx={{ width: '100%', bgcolor: '#e0e0e0', height: 8, borderRadius: 4 }}>
                    <Box sx={{ width: '15%', bgcolor: '#1976d2', height: 8, borderRadius: 4 }} />
                  </Box>
                </Box>
              </Paper>
              
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2,
                mt: 3
              }}>
                Research Areas
              </Typography>
              
              <List dense>
                <ListItem sx={{ py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Agricultural Sciences & Food Security" 
                  />
                </ListItem>
                <ListItem sx={{ py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Engineering & Sustainable Technology" 
                  />
                </ListItem>
                <ListItem sx={{ py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Health Sciences & Public Health" 
                  />
                </ListItem>
                <ListItem sx={{ py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Ethiopian History, Culture & Heritage" 
                  />
                </ListItem>
                <ListItem sx={{ py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Business, Economics & Development" 
                  />
                </ListItem>
                <ListItem sx={{ py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Environmental Science & Climate Change" 
                  />
                </ListItem>
                <ListItem sx={{ py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Education & Pedagogy" 
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                mb: 2
              }}>
                Publication Resources
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ 
                    p: 2.5, 
                    borderRadius: 2,
                    height: '100%',
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1 }}>
                      Digital Repository
                    </Typography>
                    <Typography variant="body2">
                      The DDU Digital Repository provides open access to the university's research output, including theses, dissertations, journal articles, and conference papers. All publications are indexed and searchable by author, title, subject, and date.
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ 
                    p: 2.5, 
                    borderRadius: 2,
                    height: '100%',
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1 }}>
                      Publication Support
                    </Typography>
                    <Typography variant="body2">
                      The Office of Research and Publication provides comprehensive support for faculty and student publications, including editorial assistance, statistical analysis, research design consultation, and funding for open access publication fees.
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ 
                    p: 2.5, 
                    borderRadius: 2,
                    height: '100%',
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1 }}>
                      Publication Ethics
                    </Typography>
                    <Typography variant="body2">
                      DDU is committed to maintaining the highest standards of publication ethics. All university publications adhere to international guidelines for research integrity, including proper attribution, ethical research methods, transparent reporting, and responsible authorship.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={closeModal} 
            variant="outlined"
            color="primary"
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={closeModal}
            startIcon={<MenuBookIcon />}
          >
            Back to LTMS
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alumni Modal */}
      <Dialog
        open={activeModal === 'alumni'}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #0a1232 0%, #1a237e 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              DDU Alumni Association
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={closeModal}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography paragraph>
                The Dire Dawa University Alumni Association connects graduates across generations, fostering lifelong relationships and supporting the continued growth of our alma mater. Join our vibrant community of over 25,000 alumni making an impact in Ethiopia and around the world.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={7}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                Alumni Benefits & Services
              </Typography>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#bbdefb', color: '#0d47a1', mr: 2 }}>
                    <BusinessCenterIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                      Career Development
                    </Typography>
                    <Typography variant="body2">
                      Access exclusive job postings, career counseling services, and professional development workshops. Our alumni career portal connects graduates with employment opportunities at leading organizations in Ethiopia and internationally.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#bbdefb', color: '#0d47a1', mr: 2 }}>
                    <SchoolIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                      Continuing Education
                    </Typography>
                    <Typography variant="body2">
                      Enjoy special rates on graduate programs, professional certificates, and executive education courses. Alumni have access to the university library, research facilities, and academic resources to support lifelong learning.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#bbdefb', color: '#0d47a1', mr: 2 }}>
                    <GroupsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                      Networking Opportunities
                    </Typography>
                    <Typography variant="body2">
                      Connect with fellow alumni through regional chapters, industry-specific groups, and social events. Our annual Alumni Homecoming Weekend and regular networking mixers provide valuable opportunities to build professional relationships.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2,
                mt: 4
              }}>
                Alumni Impact
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ 
                    p: 2, 
                    height: '100%', 
                    borderRadius: 2,
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1 }}>
                      Mentorship Program
                    </Typography>
                    <Typography variant="body2">
                      Our alumni mentorship program pairs experienced graduates with current students and recent alumni. Mentors provide guidance on career development, industry insights, and professional growth, helping the next generation of DDU graduates succeed.
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ 
                    p: 2, 
                    height: '100%', 
                    borderRadius: 2,
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1 }}>
                      Alumni Giving
                    </Typography>
                    <Typography variant="body2">
                      Alumni contributions support scholarships, research initiatives, and campus development projects. The DDU Alumni Fund has raised over 15 million Birr in the past five years, funding 200+ scholarships for deserving students from underrepresented communities.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                Notable Alumni
              </Typography>
              
              <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mb: 2.5 }}>
                <Box sx={{ 
                  height: 120, 
                  bgcolor: '#e3f2fd', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PersonIcon sx={{ fontSize: 64, color: '#0d47a1' }} />
                </Box>
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                    Dr. Ayana Bekele
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                    Class of 2010, Engineering
                  </Typography>
                  <Typography variant="body2">
                    Renowned engineer and entrepreneur who founded Ethiopia's leading renewable energy company. Dr. Bekele's solar power initiatives have brought electricity to over 100 rural communities across Ethiopia.
                  </Typography>
                </Box>
              </Paper>
              
              <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mb: 2.5 }}>
                <Box sx={{ 
                  height: 120, 
                  bgcolor: '#e8f5e9', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PersonIcon sx={{ fontSize: 64, color: '#2e7d32' }} />
                </Box>
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2e7d32', mb: 0.5 }}>
                    Dr. Makeda Haile
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                    Class of 2008, Medicine
                  </Typography>
                  <Typography variant="body2">
                    Leading public health expert who has worked with the WHO on disease prevention programs across Africa. Dr. Haile's research on infectious disease control has influenced health policy in multiple countries.
                  </Typography>
                </Box>
              </Paper>
              
              <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ 
                  height: 120, 
                  bgcolor: '#fff3e0', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PersonIcon sx={{ fontSize: 64, color: '#e65100' }} />
                </Box>
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#e65100', mb: 0.5 }}>
                    Ato Yonas Tadesse
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                    Class of 2012, Business Administration
                  </Typography>
                  <Typography variant="body2">
                    Successful entrepreneur and investor who has launched multiple technology startups. His e-commerce platform has revolutionized online shopping in Ethiopia and expanded to five other African countries.
                  </Typography>
                </Box>
              </Paper>
              
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2,
                mt: 4
              }}>
                Get Involved
              </Typography>
              
              <Paper elevation={3} sx={{ 
                p: 2.5, 
                bgcolor: '#e8f4fd',
                borderRadius: 2,
                mb: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#bbdefb', color: '#0d47a1', mr: 2 }}>
                    <EventIcon />
                  </Avatar>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1' }}>
                    Upcoming Alumni Events
                  </Typography>
                </Box>
                <List dense>
                  <ListItem sx={{ px: 0, py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Annual Alumni Homecoming" 
                      secondary="June 10-12, 2025 • DDU Main Campus"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Alumni Career Fair" 
                      secondary="July 25, 2025 • Addis Ababa Convention Center"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Regional Chapter Meetings" 
                      secondary="Various dates • Multiple locations"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Divider sx={{ mb: 3 }} />
              
              <Paper elevation={3} sx={{ 
                p: 2.5, 
                bgcolor: '#e8f4fd',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Box sx={{ 
                  bgcolor: '#bbdefb', 
                  borderRadius: '50%', 
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PersonAddIcon sx={{ fontSize: 32, color: '#0d47a1' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                    Join the Alumni Network
                  </Typography>
                  <Typography variant="body2">
                    Update your contact information, register for alumni events, and connect with fellow graduates through our online alumni portal. Membership in the DDU Alumni Association is free for all graduates. Stay connected to receive our quarterly newsletter and exclusive invitations to alumni events.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={closeModal} 
            variant="outlined"
            color="primary"
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={closeModal}
            startIcon={<SchoolIcon />}
          >
            Back to LTMS
          </Button>
        </DialogActions>
      </Dialog>

      {/* Support Services Modal */}
      <Dialog
        open={activeModal === 'support-services'}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #0a1232 0%, #1a237e 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SupportIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              DDU Support Services
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={closeModal}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography paragraph>
                Dire Dawa University offers comprehensive support services designed to enhance the academic, personal, and professional development of our students. Our dedicated support units work collaboratively to create an inclusive and supportive environment for all members of the university community.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                Academic Support
              </Typography>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#bbdefb', color: '#0d47a1', mr: 2 }}>
                    <MenuBookIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                      Academic Advising Center
                    </Typography>
                    <Typography variant="body2">
                      Our academic advisors provide guidance on course selection, degree requirements, academic policies, and educational planning. They help students develop personalized academic plans aligned with their career goals and monitor their progress throughout their studies.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#bbdefb', color: '#0d47a1', mr: 2 }}>
                    <SchoolIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                      Learning Resource Center
                    </Typography>
                    <Typography variant="body2">
                      The Learning Resource Center offers tutoring services, study skills workshops, writing assistance, and supplemental instruction for challenging courses. Peer tutors and professional staff provide one-on-one and group support in various subject areas.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#bbdefb', color: '#0d47a1', mr: 2 }}>
                    <AccessibilityNewIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                      Disability Support Services
                    </Typography>
                    <Typography variant="body2">
                      We provide accommodations and support services for students with disabilities to ensure equal access to educational opportunities. Services include assistive technology, note-taking assistance, extended testing time, and accessible learning materials.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                Student Wellness
              </Typography>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', mr: 2 }}>
                    <HealthAndSafetyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2e7d32', mb: 0.5 }}>
                      Health Services
                    </Typography>
                    <Typography variant="body2">
                      The University Health Center provides comprehensive healthcare services, including primary care, preventive services, health education, and emergency care. Our medical professionals offer consultations, treatments, vaccinations, and referrals to specialists when needed.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', mr: 2 }}>
                    <PsychologyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2e7d32', mb: 0.5 }}>
                      Counseling Center
                    </Typography>
                    <Typography variant="body2">
                      Our counseling services support students' mental health and emotional well-being through individual counseling, group therapy, crisis intervention, and psychological assessments. Professional counselors help students navigate personal challenges, stress, anxiety, and other mental health concerns.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', mr: 2 }}>
                    <FitnessCenterIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2e7d32', mb: 0.5 }}>
                      Recreation & Wellness
                    </Typography>
                    <Typography variant="body2">
                      Our recreation facilities and wellness programs promote physical fitness, stress management, and healthy lifestyle choices. Students can access fitness centers, sports facilities, wellness workshops, and recreational activities designed to enhance their overall well-being.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#1a237e', 
                fontWeight: 600,
                borderBottom: '2px solid #1a237e',
                pb: 1,
                mb: 2
              }}>
                Student Life & Development
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ 
                    p: 2.5, 
                    borderRadius: 2,
                    height: '100%',
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1 }}>
                      Career Services
                    </Typography>
                    <Typography variant="body2">
                      Our Career Services office assists students with career exploration, job search strategies, resume writing, interview preparation, and professional development. We organize career fairs, employer information sessions, and networking events to connect students with employment opportunities.
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ 
                    p: 2.5, 
                    borderRadius: 2,
                    height: '100%',
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1 }}>
                      Financial Aid Office
                    </Typography>
                    <Typography variant="body2">
                      The Financial Aid Office provides information and assistance with scholarships, grants, loans, and work-study opportunities. Our financial aid counselors help students understand their financial options, complete applications, and develop strategies to finance their education.
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ 
                    p: 2.5, 
                    borderRadius: 2,
                    height: '100%',
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 1 }}>
                      International Student Services
                    </Typography>
                    <Typography variant="body2">
                      We provide specialized support for international students, including visa assistance, cultural adjustment, academic support, and social integration. Our international student advisors organize orientation programs, cultural events, and workshops to enhance the international student experience.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Divider sx={{ mb: 3 }} />
              
              <Paper elevation={3} sx={{ 
                p: 2.5, 
                bgcolor: '#e8f4fd',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Box sx={{ 
                  bgcolor: '#bbdefb', 
                  borderRadius: '50%', 
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ContactSupportIcon sx={{ fontSize: 32, color: '#0d47a1' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d47a1', mb: 0.5 }}>
                    Contact Student Support
                  </Typography>
                  <Typography variant="body2">
                    For general inquiries about student support services, please contact the Office of Student Affairs at +251 25 111 2233 or studentaffairs@ddu.edu.et. Our support services are available Monday through Friday from 8:00 AM to 5:00 PM. For after-hours emergencies, please call our 24/7 helpline at +251 25 111 9999.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={closeModal} 
            variant="outlined"
            color="primary"
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={closeModal}
            startIcon={<SupportIcon />}
          >
            Back to LTMS
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Footer;
