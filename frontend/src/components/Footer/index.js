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
        backgroundColor: (theme) => theme.palette.primary.dark,
        color: 'white',
        pt: 8,
        pb: 4,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: (theme) => `linear-gradient(90deg, 
            ${theme.palette.primary.light} 0%, 
            ${theme.palette.secondary.main} 50%, 
            ${theme.palette.primary.light} 100%)`
        }
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* University Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ mr: 1, fontSize: 30 }} />
                Dire Dawa University
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
                Empowering minds, transforming futures. Join us in our pursuit of excellence in education,
                research, and innovation at Dire Dawa University.
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Learn More About DDU
              </Button>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
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
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
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
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
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
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex'
                  }}>
                    {info.icon}
                  </Box>
                  {info.text}
                </Link>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'center' },
            gap: 2
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
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
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
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
