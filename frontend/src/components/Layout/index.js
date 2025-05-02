import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { 
  Menu, MenuItem, IconButton, Typography, Toolbar, Box, AppBar, 
  CssBaseline, Divider, Drawer, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Container, Avatar, Tooltip, Chip, Badge,
  Link, Button, Paper, Switch, FormControlLabel, Stack, InputBase
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  AccountCircle,
  Logout,
  Person,
  Info,
  ContactSupport,
  LibraryBooks,
  Group,
  Assignment,
  School,
  Calculate,
  Payments,
  Search as SearchIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import Footer from '../Footer';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3); // Set to 3 to show sample notifications
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  // Search state removed
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [helpAnchorEl, setHelpAnchorEl] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Add state for mobile menu
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  const isMobileMenuOpen = Boolean(mobileMenuAnchorEl);
  
  // Function to handle mobile menu
  const handleMobileMenuOpen = (event) => {
    // If the menu is already open and the same button is clicked, close it
    if (isMobileMenuOpen) {
      setMobileMenuAnchorEl(null);
    } else {
      setMobileMenuAnchorEl(event.currentTarget);
    }
  };
  
  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };
  
  // Create a theme instance based on the dark mode state
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: darkMode ? '#90caf9' : '#1565c0',
          },
          secondary: {
            main: darkMode ? '#ce93d8' : '#7b1fa2',
          },
          background: {
            default: darkMode ? '#121212' : '#e0e0e0',
            paper: darkMode ? '#1e1e1e' : '#f0f0f0',
          },
          text: {
            primary: darkMode ? '#e0e0e0' : '#212121',
            secondary: darkMode ? '#aaaaaa' : '#424242',
          },
          action: {
            active: darkMode ? '#90caf9' : '#1976d2',
          },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                background: darkMode 
                  ? 'linear-gradient(135deg, #0a1232 0%, #1a237e 60%, #303f9f 100%)'
                  : 'linear-gradient(135deg, #0d47a1 0%, #1565c0 60%, #1976d2 100%)',
              }
            }
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: darkMode ? '#121212' : '#ffffff',
                color: darkMode ? '#e0e0e0' : 'rgba(0, 0, 0, 0.87)',
              }
            }
          },
          MuiTableContainer: {
            styleOverrides: {
              root: {
                backgroundColor: darkMode ? 'rgba(42, 42, 42, 0.3)' : undefined,
              }
            }
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                '& .MuiTableCell-head': {
                  color: darkMode ? '#e0e0e0' : undefined,
                }
              }
            }
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderBottomColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : undefined,
              }
            }
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: darkMode ? '#1e1e1e' : undefined,
              }
            }
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
              }
            }
          },
          MuiDialogTitle: {
            styleOverrides: {
              root: {
                backgroundColor: darkMode ? '#2a2a2a' : '#f5f5f5',
              }
            }
          },
          MuiDialogContent: {
            styleOverrides: {
              root: {
                backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                color: darkMode ? '#e0e0e0' : 'rgba(0, 0, 0, 0.87)',
              }
            }
          },
          MuiDialogActions: {
            styleOverrides: {
              root: {
                backgroundColor: darkMode ? '#2a2a2a' : '#f5f5f5',
              }
            }
          }
        }
      }),
    [darkMode]
  );

  useEffect(() => {
    if (user?.avatar) {
      if (user.avatar.startsWith('data:') || user.avatar.startsWith('blob:')) {
        setAvatarUrl(user.avatar);
      } else {
        const fullAvatarUrl = user.avatar.startsWith('http')
          ? user.avatar
          : `${baseURL}${user.avatar}`;
        setAvatarUrl(fullAvatarUrl);
      }
    } else {
      setAvatarUrl(`${baseURL}/uploads/profile-images/default-avatar.jpg`);
    }
  }, [user?.avatar, baseURL]);

  // Add global styles for dark mode to ensure all dialogs and papers respect dark theme
  useEffect(() => {
    // Create a style element
    const styleEl = document.createElement('style');
    
    // Add dark mode overrides
    if (darkMode) {
      styleEl.innerHTML = `
        .MuiPaper-root, .MuiDialog-paper, .MuiDialogTitle-root, 
        .MuiDialogContent-root, .MuiDialogActions-root {
          background-color: #1e1e1e !important;
          color: #e0e0e0 !important;
        }
        .MuiDialogTitle-root, .MuiDialogActions-root {
          background-color: #2a2a2a !important;
        }
        [style*="background-color: #e8f4fd"], 
        [style*="background-color: #e3f2fd"], 
        [style*="background-color: #bbdefb"] {
          background-color: rgba(25, 118, 210, 0.1) !important;
          color: #90caf9 !important;
        }
        [style*="background-color: #e8f5e9"] {
          background-color: rgba(46, 125, 50, 0.1) !important;
          color: #81c784 !important;
        }
        /* Fix hard-to-read blue text in dark mode */
        [style*="color: rgb(26, 35, 126)"],
        [style*="color: #1a237e"],
        [style*="color: #0d47a1"],
        [style*="color: #1565c0"] {
          color: #90caf9 !important; /* Lighter blue for better visibility */
        }
        /* Ensure all headings are visible */
        h1, h2, h3, h4, h5, h6, 
        .MuiTypography-h1, .MuiTypography-h2, .MuiTypography-h3, 
        .MuiTypography-h4, .MuiTypography-h5, .MuiTypography-h6,
        .MuiTypography-subtitle1, .MuiTypography-subtitle2 {
          color: #e0e0e0 !important;
        }
        /* Ensure all links are visible */
        a, .MuiLink-root {
          color: #90caf9 !important;
        }
      `;
    } else {
      styleEl.innerHTML = '';
    }
    
    // Add to document head
    document.head.appendChild(styleEl);
    
    // Clean up
    return () => {
      document.head.removeChild(styleEl);
    };
  }, [darkMode]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user && (user.role === 'instructor' || user.role === 'department-head')) {
        try {
          const response = await fetch(`${baseURL}/api/v1/feedbacks/unread-count`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await response.json();
          if (data.status === 'success') {
            setUnreadCount(data.data.unreadCount);
          }
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      }
    };

    fetchUnreadCount();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, baseURL]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    dispatch(logout());
    // Force navigation to public dashboard
    window.location.href = '/';
  };
  
  const handleOpenNotifications = (event) => {
    if (event) {
      setNotificationAnchorEl(event.currentTarget);
    } else {
      const notificationButtonRef = document.getElementById('notification-button');
      setNotificationAnchorEl(notificationButtonRef);
    }
  };

  const handleCloseNotifications = () => {
    setNotificationAnchorEl(null);
  };
  
  // Search functionality removed as requested
  
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    // Theme will automatically update due to the useMemo dependency
    
    // Apply dark mode to body element for consistent background
    if (newMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
      document.body.style.backgroundColor = '#121212';
      document.body.style.color = '#e0e0e0';
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      document.body.style.backgroundColor = '#e0e0e0';
      document.body.style.color = '#212121';
    }
  };
  
  const handleOpenHelp = (event) => {
    if (event) {
      setHelpAnchorEl(event.currentTarget);
    } else {
      const helpButtonRef = document.getElementById('help-button');
      setHelpAnchorEl(helpButtonRef);
    }
  };
  
  const handleCloseHelp = () => {
    setHelpAnchorEl(null);
  };

  const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Courses', icon: <LibraryBooks />, path: '/courses' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
    { text: 'Users', icon: <Group />, path: '/users' },
  ];

  const instructorMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Courses', icon: <LibraryBooks />, path: '/courses' },
    { text: 'Feedback', icon: <Assignment />, path: '/feedback', badge: unreadCount > 0 ? unreadCount : null },
    { text: 'Profile', icon: <Person />, path: '/profile' },
  ];

  const departmentHeadMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Courses', icon: <LibraryBooks />, path: '/courses' },
    { text: 'Feedback', icon: <Assignment />, path: '/feedback', badge: unreadCount > 0 ? unreadCount : null },
    { text: 'Profile', icon: <Person />, path: '/profile' },
  ];

  const schoolDeanMenuItems = [
    { 
      text: 'Dashboard', 
      icon: <Dashboard />, 
      path: '/school-dean/dashboard',
      description: 'Overview and statistics'
    },
    { 
      text: 'Courses', 
      icon: <LibraryBooks />, 
      path: '/school-dean/courses',
      description: 'Course and workload details'
    },
    { 
      text: 'Profile', 
      icon: <Person />, 
      path: '/profile',
      description: 'Your profile settings'
    }
  ];

  const viceDirectorMenuItems = [
    { 
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/vice-director/dashboard',
      description: 'Overview and statistics'
    },
    { 
      text: 'Course Management',
      icon: <LibraryBooks />,
      path: '/vice-director/courses',
      description: 'Review and manage courses'
    },
    {
      text: 'Profile',
      icon: <Person />,
      path: '/profile',
      description: 'Your profile settings'
    }
  ];

  const scientificDirectorMenuItems = [
    { 
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/scientific-director/dashboard',
      description: 'Overview and final approval statistics'
    },
    { 
      text: 'Course Management',
      icon: <LibraryBooks />,
      path: '/scientific-director/courses',
      description: 'Final review of approved courses'
    },
    {
      text: 'Profile',
      icon: <Person />,
      path: '/profile',
      description: 'Your profile settings'
    }
  ];

  const financeMenuItems = [
    { 
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/finance/dashboard',
      description: 'Financial overview and statistics'
    },
    { 
      text: 'Course Management',
      icon: <Payments />,
      path: '/finance/courses',
      description: 'Review and process course payments'
    },
    {
      text: 'Payment Calculator',
      icon: <Calculate />,
      path: '/finance/payment-calculator',
      description: 'Calculate instructor payments'
    },
    {
      text: 'Profile',
      icon: <Person />,
      path: '/profile',
      description: 'Your profile settings'
    }
  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminMenuItems;
      case 'instructor':
        return instructorMenuItems;
      case 'department-head':
        return departmentHeadMenuItems;
      case 'school-dean':
        return schoolDeanMenuItems;
      case 'vice-scientific-director':
        return viceDirectorMenuItems;
      case 'scientific-director':
        return scientificDirectorMenuItems;
      case 'finance':
        return financeMenuItems;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const drawer = (

    <Box sx={{ 
        bgcolor: darkMode ? 'rgb(30, 30, 30)' : '#e8e8e8', 
        color: darkMode ? 'white' : '#212529',
        height: '100%',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
        borderRight: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)'
    }}>
        <Box sx={{ 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            color: 'white',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            mb: 1,
            position: 'relative',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #42a5f5, #1e88e5)',
                opacity: 0.7
            }
        }}>
            <Avatar 
                src={avatarUrl}
                alt={user?.name || 'User'}
                sx={{ 
                    width: 48, 
                    height: 48,
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.4)'
                    }
                }}
            />
            
            <Box>
                <Typography variant="subtitle1" sx={{ color: darkMode ? 'white' : '#212529', fontWeight: 500 }}>{user?.name}</Typography>
                <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                    {user?.role?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Typography>
            </Box>
        </Box>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 1 }} />
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            disablePadding
            sx={{
              display: 'block',
              bgcolor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
            }}
          >
            <ListItemButton
              component={Link}
              to={item.path}
              sx={{
                minHeight: 48,
                px: 2.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: 2, color: darkMode ? 'white' : 'primary.main' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                secondary={item.description}
                primaryTypographyProps={{
                  variant: 'body1',
                  color: darkMode ? 'white' : 'text.primary',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                }}
                secondaryTypographyProps={{
                  color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
                }}
              />
              {item.badge && (
                <Chip
                  size="small"
                  color="error"
                  label={item.badge}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 1 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', bgcolor: 'background.default', color: 'text.primary' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: darkMode ? 'rgb(30, 30, 30)' : 'linear-gradient(135deg, #0d47a1 0%, #1565c0 60%, #1976d2 100%)',
          boxShadow: '0 5px 25px rgba(0,0,0,0.25)',
          height: 110, // Increased header height
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          borderRadius: '0', // Sharp corners with no border radius
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #42a5f5 0%, #7e57c2 50%, #26a69a 100%)'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-.895 3-2s-.895-2-3-2-3 .895-3 2 .895 3 3 2zm63 31c1.657 0 3-.895 3-2s-.895-2-3-2-3 .895-3 2 .895 3 3 2zM34 90c1.657 0 3-.895 3-2s-.895-2-3-2-3 .895-3 2 .895 3 3 2zM12 60c1.657 0 3-.895 3-2s-.895-2-3-2-3 .895-3 2 .895 3 3 2z\' fill=\'%23ffffff\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
            pointerEvents: 'none',
            opacity: 0.5,
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="xl" sx={{ px: 0, position: 'relative', overflow: 'visible' }}>
          <Toolbar 
            disableGutters 
            sx={{ 
              minHeight: 110, // Increased toolbar height to match AppBar
              py: 1.5, // Increased padding
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              width: '100%',
              pr: '200px', // Add right padding to make space for the profile section
              pl: 0 // Remove left padding completely
            }}
          >
            {/* LTMS Logo and Title - Fixed Position for All Screen Sizes */}
            <Box 
              sx={{ 
                display: { xs: 'none', md: 'flex' }, // Hide on mobile
                alignItems: 'center',
                position: 'fixed',
                left: '20px',
                top: '15px',
                height: '80px',
                zIndex: 1500,
                gap: { xs: 1, sm: 1.5, md: 2 },
                background: 'transparent',
                py: 1,
                transition: 'all 0.3s ease'
              }}
            >
              <Box 
                sx={{ 
                  width: { xs: 45, sm: 60, md: 75 }, 
                  height: { xs: 45, sm: 60, md: 75 }, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0,
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}
              >
                <img 
                  src="/images/ddu.png" 
                  alt="Dire Dawa University Logo" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    display: 'block'
                  }} 
                />
              </Box>
              <Box sx={{ display: { xs: 'block', sm: 'block' } }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    color: 'white',
                    lineHeight: 1.2,
                    fontSize: { xs: '0.85rem', sm: '1rem', md: '1.25rem' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  LTMS
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    opacity: 0.9,
                    color: 'white',
                    display: { xs: 'none', sm: 'block' },
                    letterSpacing: '0.5px',
                    position: 'relative',
                    zIndex: 1200,
                    fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.75rem' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  Load Tracking Management System
                </Typography>
              </Box>
            </Box>

          

            {/* Additional Features Section - Positioned to the right */}
            <Box sx={{ 
              flexGrow: 0, 
              display: { xs: 'none', md: 'flex' }, // Hide on mobile
              alignItems: 'center', 
              gap: 1,
              background: 'transparent',
              py: 1,
              px: 2,
              transition: 'all 0.3s ease',
              position: 'fixed',
              right: '250px',
              top: '15px',
              height: '80px',
              zIndex: 1200
            }}>
              
              {/* Current Time Display */}
              <Box 
                sx={{ 
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  px: 1.5,
                  py: 0.5,
                  mr: 2,
                  border: '1px solid',
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'medium',
                    color: 'white',
                    letterSpacing: '0.5px',
                    fontFamily: 'monospace'
                  }}
                >
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Typography>
              </Box>

              {/* Dark Mode Toggle */}
              <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                <IconButton 
                  onClick={toggleDarkMode} 
                  color="inherit" 
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    }
                  }}
                >
                  {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>

              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton 
                  id="notification-button"
                  onClick={handleOpenNotifications} 
                  color="inherit" 
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    }
                  }}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Help Menu */}
              <Tooltip title="Help & Resources">
                <IconButton 
                  id="help-button"
                  onClick={handleOpenHelp} 
                  color="inherit"
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    }
                  }}
                >
                  <HelpIcon />
                </IconButton>
              </Tooltip>
              


            </Box>
          </Toolbar>
        </Container>
        
        {/* Center Title for Small Screens */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            position: 'fixed',
            left: '50%',
            top: '25px',
            transform: 'translateX(-50%)',
            zIndex: 1400,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              fontSize: { xs: '1rem', sm: '1.1rem' },
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              letterSpacing: '0.5px'
            }}
          >
            Load Tracking Management System
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.7rem',
              textAlign: 'center',
              letterSpacing: '0.4px'
            }}
          >
            Dire Dawa University
          </Typography>
        </Box>
        
        {/* User Profile Section - Moved to right side */}
        <Box 
          sx={{ 
            display: { xs: 'none', md: 'flex' }, // Hide on mobile
            alignItems: 'center', 
            gap: 1,
            background: 'transparent',
            py: 1,
            px: 2,
            transition: 'all 0.3s ease',
            position: 'fixed',
            right: '20px',
            top: '15px',
            height: '80px',
            zIndex: 1300
          }}
        >
                <Box sx={{ display: { xs: 'none', md: 'block' }, mr: 2 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: '#fff',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      textAlign: 'right',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {user?.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={user?.role?.replace('-', ' ').toUpperCase()}
                    color="primary"
                    sx={{ 
                      height: 22,
                      fontSize: '0.7rem',
                      textTransform: 'capitalize',
                      fontWeight: 'bold',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(4px)',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      '& .MuiChip-label': {
                        px: 1
                      }
                    }}
                  />
                </Box>
                <Tooltip title="Account settings">
                  <IconButton 
                    onClick={handleOpenUserMenu} 
                    sx={{ 
                      p: 0.5,
                      transition: 'all 0.3s ease',
                      backgroundColor: 'transparent',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    <Avatar
                      alt={user?.name}
                      src={avatarUrl}
                      sx={{ 
                        width: 55, 
                        height: 55,
                        background: 'transparent',
                        border: '2px solid #fff',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
                        }
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </Box>
            
            {/* User Menu */}
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  borderRadius: '12px',
                  mt: 1.5,
                  overflow: 'visible',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
            >
              <MenuItem onClick={() => {
                handleClose();
                navigate('/profile');
              }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Profile"
                  secondary={user?.email}
                />
              </MenuItem>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 1 }} />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            </Menu>
      </AppBar>

      {/* Help Menu Popup */}
      <Menu
        anchorEl={helpAnchorEl}
        open={Boolean(helpAnchorEl)}
        onClose={handleCloseHelp}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: '12px',
            minWidth: 200,
            overflow: 'visible',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem onClick={handleCloseHelp}>
          <ListItemIcon>
            <School fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="User Guide" />
        </MenuItem>
        <MenuItem onClick={handleCloseHelp}>
          <ListItemIcon>
            <Assignment fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="FAQ" />
        </MenuItem>
        <MenuItem onClick={handleCloseHelp}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Contact Support" />
        </MenuItem>
      </Menu>
      
      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleCloseNotifications}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: '12px',
            mt: 1.5,
            width: 320,
            maxHeight: 400,
            overflow: 'auto',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <Typography variant="h6" sx={{ 
            color: 'white', 
            fontWeight: 600,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            background: 'linear-gradient(90deg, #f5f5f5 0%, #bbdefb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '1px',
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem' }
          }}>
            Dire Dawa University
          </Typography>
        </Box>
        {unreadCount > 0 ? (
          <Box>
            <MenuItem onClick={() => {
              handleCloseNotifications();
              navigate('/courses');
            }}>
              <ListItemIcon>
                <LibraryBooks fontSize="small" sx={{ color: '#42a5f5' }} />
              </ListItemIcon>
              <ListItemText 
                primary="New course feedback" 
                secondary="Vice Director has provided feedback on your course"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondaryTypographyProps={{ color: 'text.secondary', fontSize: '0.75rem' }}
              />
            </MenuItem>
            <MenuItem onClick={() => {
              handleCloseNotifications();
              navigate('/workload');
            }}>
              <ListItemIcon>
                <Assignment fontSize="small" sx={{ color: '#66bb6a' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Workload updated" 
                secondary="Your teaching workload has been updated"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondaryTypographyProps={{ color: 'text.secondary', fontSize: '0.75rem' }}
              />
            </MenuItem>
            <MenuItem onClick={() => {
              handleCloseNotifications();
              navigate('/dashboard');
            }}>
              <ListItemIcon>
                <Dashboard fontSize="small" sx={{ color: '#ec407a' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Dashboard updates" 
                secondary="New statistics available on your dashboard"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondaryTypographyProps={{ color: 'text.secondary', fontSize: '0.75rem' }}
              />
            </MenuItem>
          </Box>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </Box>
        )}
        <Box sx={{ p: 1, borderTop: '1px solid rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <Button 
            size="small" 
            onClick={() => {
              handleCloseNotifications();
              navigate('/notifications');
            }}
          >
            View All
          </Button>
        </Box>
      </Menu>

      {/* Mobile Menu Button - Only visible on small screens */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          right: '20px',
          top: '25px',
          zIndex: 1500
        }}
      >
        <IconButton
          onClick={handleMobileMenuOpen}
          sx={{
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
            borderRadius: '50%',
            padding: 1
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </Box>
      
      {/* Sidebar Toggle Button - Only visible on small screens */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          left: '20px',
          top: '25px',
          zIndex: 1500
        }}
      >
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ 
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
            borderRadius: '50%',
            padding: 1
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>
      
      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchorEl}
        id="mobile-menu"
        keepMounted
        open={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            borderRadius: '12px',
            minWidth: 200,
            bgcolor: darkMode ? 'rgb(30, 30, 30)' : '#ffffff',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: darkMode ? 'rgb(30, 30, 30)' : '#ffffff',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Profile Info */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Avatar
              src={avatarUrl}
              alt={user?.name}
              sx={{ width: 40, height: 40 }}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {user?.role?.replace('-', ' ').toUpperCase()}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Toggle Dark Mode */}
        <MenuItem onClick={() => { toggleDarkMode(); handleMobileMenuClose(); }}>
          <ListItemIcon>
            {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText primary={darkMode ? "Light Mode" : "Dark Mode"} />
        </MenuItem>
        
        {/* Notifications */}
        <MenuItem onClick={(event) => { 
          handleOpenNotifications(event); 
          handleMobileMenuClose(); 
        }}>
          <ListItemIcon>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon fontSize="small" />
            </Badge>
          </ListItemIcon>
          <ListItemText primary="Notifications" />
        </MenuItem>
        
        {/* Help */}
        <MenuItem onClick={(event) => { 
          handleOpenHelp(event); 
          handleMobileMenuClose(); 
        }}>
          <ListItemIcon>
            <HelpIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Help & Resources" />
        </MenuItem>
        
        <Divider />
        
        {/* Profile */}
        <MenuItem onClick={() => { navigate('/profile'); handleMobileMenuClose(); }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        
        {/* Logout */}
        <MenuItem onClick={() => { handleLogout(); handleMobileMenuClose(); }}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: darkMode ? '#1e1e1e' : '#e8e8e8',
              marginTop: '110px', // Add margin top to match header height
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: darkMode ? '#1e1e1e' : '#e8e8e8',
              marginTop: '110px', // Add margin top to match header height
              height: 'calc(100% - 110px)', // Adjust height to account for header
              overflow: 'visible',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          mt: 14, // Increased margin top to account for fixed header
          pt: 3, // Add padding top separately
          display: 'flex',
          flexDirection: 'column',
          minHeight: `calc(100vh - 100px)`, // Updated to subtract new AppBar height
          position: 'relative',
          zIndex: 1, // Lower z-index than AppBar
          pb: 0 // Remove bottom padding to allow footer to touch bottom
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
      
      {/* Footer - positioned outside main content to extend full width */}
      <Box
        sx={{
          position: 'relative',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          mt: 30, // Add margin top to create gap between content and footer
          zIndex: (theme) => theme.zIndex.drawer + 2
        }}
      >
        <Footer />
      </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;