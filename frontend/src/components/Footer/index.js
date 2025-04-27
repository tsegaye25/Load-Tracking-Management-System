import React from 'react';
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
  Button
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
  School as SchoolIcon
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { text: 'About Us', href: '#' },
    { text: 'Academic Programs', href: '#' },
    { text: 'Research', href: '#' },
    { text: 'Library', href: '#' },
    { text: 'Student Portal', href: '#' },
    { text: 'Career Opportunities', href: '#' }
  ];

  const resources = [
    { text: 'Academic Calendar', href: '#' },
    { text: 'News & Events', href: '#' },
    { text: 'Publications', href: '#' },
    { text: 'Alumni', href: '#' },
    { text: 'Support Services', href: '#' }
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

  return (
    <Box
      component="footer"
      sx={{
        background: (theme) => `linear-gradient(135deg, #1a237e 0%, #283593 100%)`,
        color: 'white',
        pt: 8,
        pb: 4,
        position: 'relative',
        width: '100vw',
        maxWidth: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.15)',
        left: 0,
        right: 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: (theme) => `linear-gradient(90deg, 
            #42a5f5 0%, 
            #7e57c2 50%, 
            #26a69a 100%)`
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          pointerEvents: 'none',
          opacity: 0.3,
          zIndex: 0
        }
      }}
    >
      <Container 
        maxWidth="xl" 
        sx={{ 
          px: { xs: 2, sm: 3, md: 4, lg: 5 },
          mx: 'auto',
          position: 'relative',
          zIndex: 1 // Ensure content appears above the background pattern
        }}
      >
        <Grid container spacing={4}>
          {/* University Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #fff 0%, #e3f2fd 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                <SchoolIcon sx={{ mr: 1, fontSize: 30, color: '#90caf9' }} />
                Dire Dawa University
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, opacity: 0.9, lineHeight: 1.8 }}>
                Empowering minds, transforming futures. Join us in our pursuit of excellence in education,
                research, and innovation at Dire Dawa University.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderRadius: 8,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
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
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                position: 'relative',
                display: 'inline-block',
                pb: 1,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '40px',
                  height: '3px',
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
                  href={link.href}
                  color="inherit"
                  sx={{
                    textDecoration: 'none',
                    opacity: 0.8,
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
          <Grid item xs={12} sm={6} md={2}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                position: 'relative',
                display: 'inline-block',
                pb: 1,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '40px',
                  height: '3px',
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
                  href={link.href}
                  color="inherit"
                  sx={{
                    textDecoration: 'none',
                    opacity: 0.8,
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

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                position: 'relative',
                display: 'inline-block',
                pb: 1,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '40px',
                  height: '3px',
                  borderRadius: '3px',
                  backgroundColor: '#42a5f5'
                }
              }}
            >
              Contact Us
            </Typography>
            <Stack spacing={2}>
              {contactInfo.map((info) => (
                <Link
                  key={info.text}
                  href={info.href}
                  color="inherit"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    opacity: 0.8,
                    '&:hover': {
                      opacity: 1
                    }
                  }}
                >
                  <Box sx={{
                    mr: 2,
                    backgroundColor: 'rgba(66, 165, 245, 0.2)',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      backgroundColor: 'rgba(66, 165, 245, 0.3)'
                    }
                  }}>
                    {info.icon}
                  </Box>
                  {info.text}
                </Link>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ 
          my: 4, 
          borderColor: 'rgba(255, 255, 255, 0.1)', 
          width: '100%',
          '&::before, &::after': {
            borderColor: 'rgba(255, 255, 255, 0.1)'
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
            letterSpacing: '0.5px'
          }}>
            {currentYear} Dire Dawa University. All rights reserved.
          </Typography>

          {/* Social Links */}
          <Stack direction="row" spacing={1}>
            {socialLinks.map((link) => (
              <IconButton
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(66, 165, 245, 0.3)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
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
  );
};

export default Footer;
