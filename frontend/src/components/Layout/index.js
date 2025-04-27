import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Container,
  Tooltip,
  ListItemButton,
  Divider,
  Stack,
  Chip,
  Link,
  Badge,
  InputBase,
  Button,
  Paper,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard,
  LibraryBooks,
  Person,
  School,
  Assignment,
  Group,
  Logout,
  Calculate,
  Payments,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import Footer from '../Footer';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [helpAnchorEl, setHelpAnchorEl] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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

  // Fetch unread feedback count
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
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationAnchorEl(null);
  };
  
  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };
  
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchValue.trim()) {
      // Implement search functionality here
      console.log('Searching for:', searchValue);
      // Navigate to search results page or filter current page
    }
  };
  
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    // Implement theme change functionality
  };
  
  const handleOpenHelp = (event) => {
    setHelpAnchorEl(event.currentTarget);
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

    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>
        <Box>
          <Typography variant="subtitle1">{user?.name}</Typography>
          <Typography variant="body2" color="textSecondary">
            {user?.role?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            disablePadding
            sx={{
              display: 'block',
              bgcolor: location.pathname === item.path ? 'action.selected' : 'transparent'
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
              <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                secondary={item.description}
                primaryTypographyProps={{
                  variant: 'body1',
                  color: location.pathname === item.path ? 'primary' : 'textPrimary'
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
      <Divider />
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
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 70%, #303f9f 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          height: 100, // Increased header height
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          borderRadius: { xs: '0', md: '0 0 20px 20px' },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #42a5f5 0%, #7e57c2 50%, #26a69a 100%)'
          }
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
          <Toolbar 
            disableGutters 
            sx={{ 
              minHeight: 100, // Increased toolbar height
              py: 1.5 // Increased padding
            }}
          >
            {/* User Profile Section - Moved to left side */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                background: 'rgba(255, 255, 255, 0.1)',
                py: 1,
                px: 2,
                borderRadius: '16px',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                mr: 3,
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)'
                }
              }}
            >
              <Tooltip title="Account settings">
                <IconButton 
                  onClick={handleOpenUserMenu} 
                  sx={{ 
                    p: 0.5,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <Avatar
                    alt={user?.name}
                    src={avatarUrl}
                    sx={{ 
                      width: 50, 
                      height: 50,
                      border: '2px solid rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                    }}
                  />
                </IconButton>
              </Tooltip>
              
              {/* User Info - Desktop */}
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                  }}
                >
                  {user?.name}
                </Typography>
                <Chip
                  size="small"
                  label={user?.role?.replace('-', ' ').toUpperCase()}
                  color="secondary"
                  sx={{ 
                    height: 24,
                    fontSize: '0.75rem',
                    textTransform: 'capitalize',
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '& .MuiChip-label': {
                      px: 1
                    }
                  }}
                />
              </Box>
            </Box>

            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                display: { sm: 'none' },
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Desktop Logo */}
            <Typography
              variant="h5"
              noWrap
              component="div"
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: 'white',
                textDecoration: 'none',
                marginRight: 2,
                textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                background: 'linear-gradient(90deg, #fff 0%, #e3f2fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -5,
                  left: 0,
                  width: '100%',
                  height: '2px',
                  background: '#42a5f5',
                  borderRadius: '2px'
                }
              }}
            >
              LTMS
            </Typography>

            {/* Search Bar - Desktop */}
            <Box 
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{ 
                display: { xs: 'none', md: 'flex' },
                position: 'relative',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                mr: 2,
                ml: 2,
                width: '240px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)'
                },
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
            >
              <IconButton 
                type="submit"
                sx={{ p: '10px', color: 'white' }}
                aria-label="search"
              >
                <SearchIcon />
              </IconButton>
              <InputBase
                sx={{ 
                  ml: 1, 
                  flex: 1, 
                  color: 'white',
                  '& ::placeholder': {
                    color: 'rgba(255, 255, 255, 0.7)'
                  }
                }}
                placeholder="Search..."
                inputProps={{ 'aria-label': 'search' }}
                value={searchValue}
                onChange={handleSearchChange}
              />
            </Box>
            
            {/* Center Title - Desktop */}
            <Box 
              sx={{ 
                flexGrow: 1,
                display: { xs: 'none', md: 'flex' },
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                py: 1,
                px: 3,
                borderRadius: '16px',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                  pointerEvents: 'none'
                }
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  background: 'linear-gradient(90deg, #fff 0%, #e3f2fd 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                DIRE DAWA UNIVERSITY
                <Typography 
                  component="div" 
                  variant="h6" 
                  sx={{ 
                    fontFamily: 'Nyala, Arial, sans-serif',
                    textAlign: 'center',
                    mt: 0.5,
                    opacity: 0.9,
                    color: '#fff'
                  }}
                >
                  ድሬዳዋ ዩኒቨርሲቲ
                </Typography>
              </Typography>
            </Box>

            {/* Center Title - Mobile */}
            <Box 
              sx={{ 
                flexGrow: 1,
                display: { xs: 'flex', md: 'none' },
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                py: 0.5,
                px: 2,
                borderRadius: 1
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                DDU
                <Typography 
                  component="div" 
                  variant="subtitle1" 
                  sx={{ 
                    fontFamily: 'Nyala, Arial, sans-serif',
                    textAlign: 'center',
                    opacity: 0.9
                  }}
                >
                  ድሬዳዋ ዩኒ
                </Typography>
              </Typography>
            </Box>

            {/* Additional Features Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              {/* Dark Mode Toggle */}
              <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                <IconButton 
                  onClick={toggleDarkMode} 
                  color="inherit"
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    mr: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              
              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton 
                  onClick={handleOpenNotifications} 
                  color="inherit"
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    mr: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.05)'
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
                  onClick={handleOpenHelp} 
                  color="inherit"
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <HelpIcon />
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
                  <Person fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Profile"
                  secondary={user?.email}
                />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
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
            mt: 1.5,
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
            <Person fontSize="small" />
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
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Notifications
          </Typography>
        </Box>
        {unreadCount > 0 ? (
          <Box>
            <MenuItem onClick={handleCloseNotifications}>
              <ListItemText 
                primary="New course feedback" 
                secondary="Vice Director has provided feedback on your course"
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </MenuItem>
            <MenuItem onClick={handleCloseNotifications}>
              <ListItemText 
                primary="Workload updated" 
                secondary="Your teaching workload has been updated"
                primaryTypographyProps={{ fontWeight: 'bold' }}
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
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              paddingTop: '100px', // Updated padding equal to AppBar height
              mt: '100px' // Updated margin top for AppBar
            },
            zIndex: (theme) => theme.zIndex.drawer
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
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              backgroundColor: (theme) => theme.palette.background.default,
              paddingTop: '100px', // Updated padding equal to AppBar height
              height: '100%',
              overflow: 'auto'
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
          mt: '100px', // Updated to match new AppBar height
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
  );
};

export default Layout;