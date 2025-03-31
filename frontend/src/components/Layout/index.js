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
  Link
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
  Logout
} from '@mui/icons-material';
import Footer from '../Footer';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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
          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          boxShadow: 6,
          height: 80,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar 
            disableGutters 
            sx={{ 
              minHeight: 80,
              py: 1
            }}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                display: { sm: 'none' },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
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
                textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              LTMS
            </Typography>

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
                borderRadius: 1,
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
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
                    opacity: 0.9
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

            {/* User Profile Section */}
            <Box 
              sx={{ 
                flexGrow: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                background: 'rgba(255, 255, 255, 0.1)',
                py: 1,
                px: 2,
                borderRadius: 1,
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
              }}
            >
              {/* User Info - Desktop */}
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    textAlign: 'right',
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
              
              <Tooltip title="Account settings">
                <IconButton 
                  onClick={handleOpenUserMenu} 
                  sx={{ 
                    p: 0.5,
                    ml: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <Avatar
                    alt={user?.name}
                    src={avatarUrl}
                    sx={{ 
                      width: 45, 
                      height: 45,
                      border: '2px solid rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                    }}
                  />
                </IconButton>
              </Tooltip>
              
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
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

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
              borderRight: '1px solid rgba(0, 0, 0, 0.12)'
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
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              backgroundColor: (theme) => theme.palette.background.default
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
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          minHeight: `calc(100vh - 80px)` // Subtract AppBar height
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        <Box
          sx={{
            width: '100%',
            position: 'relative',
            bottom: 0,
            left: 0,
            zIndex: (theme) => theme.zIndex.drawer + 2,
            mt: 4
          }}
        >
          <Footer />
        </Box>
      </Box>
      
    </Box>
  );
};

export default Layout;
