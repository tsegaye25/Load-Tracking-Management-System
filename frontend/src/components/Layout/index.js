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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Book,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  People,
  Feedback as FeedbackIcon,
  AccountCircle
} from '@mui/icons-material';
import Footer from '../Footer';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Courses', icon: <Book />, path: '/courses' },
    ...(user?.role === 'instructor' || user?.role === 'department-head'
      ? [{ text: 'Feedback', icon: <FeedbackIcon />, path: '/feedback' }] 
      : []
    ),
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    ...(user?.role === 'admin' ? [{ text: 'Users', icon: <People />, path: '/users' }] : []),
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main' }}>
          LTMS
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
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
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Profile"
                    secondary={user?.email}
                  />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
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
