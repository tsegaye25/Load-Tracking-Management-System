import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Container, Typography, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Grid,
  useMediaQuery, useTheme,
  IconButton, Card, CardContent, Divider, FormControl,
  InputLabel, Select, Chip, CircularProgress, Accordion,
  AccordionSummary, AccordionDetails, Paper, InputAdornment, Tooltip,
  Avatar, Badge, Tabs, Tab, LinearProgress, Skeleton, Switch, FormControlLabel,
  Alert, Snackbar, Pagination, TableContainer,
  Table, TableHead, TableBody, TableRow, TableCell, TableSortLabel, Menu,
  ListItemIcon, Checkbox
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useFormik } from 'formik';
import { register, getAllUsers, updateUser, deleteUser, setLoading, setUsers } from '../../store/authSlice';
import { toast } from 'react-toastify';
import { useSnackbar } from 'notistack';

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.auth);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  
  // View mode state (card or table) with responsive default
  const [viewMode, setViewMode] = useState('card');
  
  // Handle responsive view mode
  useEffect(() => {
    const handleResize = () => {
      // Force card view on small screens (less than 600px width)
      if (window.innerWidth < 600 && viewMode === 'table') {
        setViewMode('card');
      }
    };
    
    // Set initial view based on screen size
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up event listener
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]); // 'card' or 'table'
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedSchool, setExpandedSchool] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  
  // Action menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuUser, setMenuUser] = useState(null);
  
  // Refresh state
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (selectedUser) {
      formik.setValues({
        name: selectedUser.name || '',
        email: selectedUser.email || '',
        phone: selectedUser.phone || '',
        role: selectedUser.role || '',
        school: selectedUser.school || '',
        department: selectedUser.department || '',
        hdpHour: selectedUser.hdpHour || 0,
        positionHour: selectedUser.positionHour || 0,
        batchAdvisor: selectedUser.batchAdvisor || 0,
      });
    } else {
      formik.resetForm();
    }
  }, [selectedUser]);

  const schools = [
    'College of Business and Economics',
    'College of Computing and Informatics',
    'College of Engineering',
    'College of Natural Sciences',
    'Others University Staff Members'
  ];

  const departments = {
    'College of Business and Economics': [
      'Management',
      'Accounting and Finance',
      'Economics',
      'Public Administration',
      'Logistics and Supply Chain Management',
      'Marketing Management',
      'Tourism and Hotel Management'
    ],
    'College of Computing and Informatics': ['Software Engineering', 'Computer Science', 'Information Technology'],
    'College of Engineering': ['Mechanical', 'Electrical', 'Civil'],
    'College of Natural Sciences': ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
    'Others University Staff Members': ['Central Office']
  };

  const roles = [
    { value: 'instructor', label: 'Instructor' },
    { value: 'department-head', label: 'Department Head' },
    { value: 'school-dean', label: 'School Dean' },
    { value: 'vice-scientific-director', label: 'Vice Scientific Director' },
    { value: 'scientific-director', label: 'Scientific Director' },
    { value: 'finance', label: 'Finance Officer' },
  ];

  const rolesWithoutSchoolDept = ['finance', 'scientific-director', 'vice-scientific-director'];
  const rolesWithOnlySchool = ['school-dean'];

  const formik = useFormik({
    initialValues: {
      name: selectedUser?.name || '',
      email: selectedUser?.email || '',
      phone: selectedUser?.phone || '',
      role: selectedUser?.role || 'instructor',
      school: selectedUser?.school || '',
      department: selectedUser?.department || '',
      hdpHour: selectedUser?.hdpHour || 0,
      positionHour: selectedUser?.positionHour || 0,
      batchAdvisor: selectedUser?.batchAdvisor || 0,
      password: '',
      passwordConfirm: ''
    },
    validate: values => {
      const errors = {};
      
      // Required fields validation
      if (!values.name) errors.name = 'Name is required';
      if (!values.email) errors.email = 'Email is required';
      if (!values.phone) errors.phone = 'Phone is required';
      if (!values.role) errors.role = 'Role is required';
      
      // Email validation
      if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
      }

      // Phone validation
      if (values.phone && !/^\+?[0-9]{10,}$/.test(values.phone)) {
        errors.phone = 'Invalid phone number';
      }

      // School and department validation for roles that need them
      if (!rolesWithoutSchoolDept.includes(values.role)) {
        if (!values.school) errors.school = 'School is required';
        if (!rolesWithOnlySchool.includes(values.role) && !values.department) {
          errors.department = 'Department is required';
        }
      }

      // Hour validations only for instructors
      if (values.role === 'instructor') {
        if (values.hdpHour < 0) errors.hdpHour = 'HDP hours cannot be negative';
        if (values.positionHour < 0) errors.positionHour = 'Position hours cannot be negative';
        if (values.batchAdvisor < 0) errors.batchAdvisor = 'Batch advisor hours cannot be negative';
      }

      // Password validation for new users
      if (!selectedUser) {
        if (!values.password) errors.password = 'Password is required';
        if (!values.passwordConfirm) errors.passwordConfirm = 'Please confirm your password';
        if (values.password !== values.passwordConfirm) {
          errors.passwordConfirm = 'Passwords do not match';
        }
        if (values.password && values.password.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        }
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        // Set submitting state to true immediately
        setIsSubmitting(true);
        dispatch(setLoading(true));
        const userData = { ...values };
        
        // Only include hour fields for instructors
        if (values.role !== 'instructor') {
          delete userData.hdpHour;
          delete userData.positionHour;
          delete userData.batchAdvisor;
        }

        if (selectedUser) {
          // Correctly pass the userData directly to updateUser with id as a separate parameter
          await dispatch(updateUser({ id: selectedUser._id, ...userData })).unwrap();
          toast.success('User updated successfully');
        } else {
          await dispatch(register(userData)).unwrap();
          toast.success('User created successfully');
        }
        
        // Refresh the users list to ensure we have the latest data
        await dispatch(getAllUsers());
        setLastRefreshed(new Date());
        handleCloseDialog();
      } catch (error) {
        toast.error(error || 'Failed to save user');
      } finally {
        dispatch(setLoading(false));
      }
    },
  });

  useEffect(() => {
    if (rolesWithoutSchoolDept.includes(formik.values.role)) {
      formik.setFieldValue('school', 'Others University Staff Members');
      formik.setFieldValue('department', 'Central Office');
    } else if (rolesWithOnlySchool.includes(formik.values.role)) {
      formik.setFieldValue('department', 'Dean Office');
    }
  }, [formik.values.role]);

  const shouldShowSchoolDept = !rolesWithoutSchoolDept.includes(formik.values.role);
  const shouldShowDepartment = !rolesWithoutSchoolDept.includes(formik.values.role) && !rolesWithOnlySchool.includes(formik.values.role);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDeleteDialogOpen = (user) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setUserToDelete(null);
    setOpenDeleteDialog(false);
    setDeleteConfirmed(false); // Reset the confirmation checkbox
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(setLoading(true));
      await dispatch(deleteUser(userToDelete._id)).unwrap();
      const updatedUsers = users.filter(user => user._id !== userToDelete._id);
      dispatch(setUsers(updatedUsers));
      toast.success('User deleted successfully');
      handleDeleteDialogClose();
    } catch (error) {
      toast.error(error || 'Failed to delete user');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setIsSubmitting(false); // Reset the submitting state
    formik.resetForm();
  };

  const renderPasswordFields = () => {
    if (selectedUser) return null; // Don't show password fields when editing

    return (
      <>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="password"
            label="Password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="password"
            label="Confirm Password"
            name="passwordConfirm"
            value={formik.values.passwordConfirm}
            onChange={formik.handleChange}
            error={formik.touched.passwordConfirm && Boolean(formik.errors.passwordConfirm)}
            helperText={formik.touched.passwordConfirm && formik.errors.passwordConfirm}
          />
        </Grid>
      </>
    );
  };

  // Get unique schools and departments for filters
  const uniqueSchools = [...new Set(users.filter(user => user.school).map(user => user.school))];
  const uniqueDepartments = [...new Set(users.filter(user => user.department).map(user => user.department))];

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.phone?.toString().toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesSchool = filterSchool === 'all' || user.school === filterSchool;
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;

    return matchesSearch && matchesRole && matchesSchool && matchesDepartment;
  });

  // Group filtered users by school for accordion display
  const groupedUsers = filteredUsers.reduce((acc, user) => {
    const school = user.school || 'Unassigned';
    if (!acc[school]) {
      acc[school] = [];
    }
    acc[school].push(user);
    return acc;
  }, {});

  const handleAccordionChange = (school) => (event, isExpanded) => {
    setExpandedSchool(isExpanded ? school : null);
  };

  // Calculate user statistics
  const userStats = useMemo(() => {
    const stats = {
      total: users.length,
      byRole: {},
      bySchool: {},
      byDepartment: {}
    };
    
    users.forEach(user => {
      // Count by role
      if (user.role) {
        stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
      }
      
      // Count by school
      if (user.school) {
        stats.bySchool[user.school] = (stats.bySchool[user.school] || 0) + 1;
      }
      
      // Count by department
      if (user.department) {
        stats.byDepartment[user.department] = (stats.byDepartment[user.department] || 0) + 1;
      }
    });
    
    return stats;
  }, [users]);
  
  // Handle refresh
  const handleRefresh = () => {
    dispatch(getAllUsers());
    setLastRefreshed(new Date());
    enqueueSnackbar('User list refreshed', { variant: 'success' });
  };
  
  // Handle view mode toggle
  const handleViewModeChange = (event) => {
    setViewMode(event.target.checked ? 'table' : 'card');
  };
  
  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Handle action menu
  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setMenuUser(user);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUser(null);
  };
  
  // Handle view user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setOpenViewDialog(true);
    handleMenuClose();
  };
  
  // Handle pagination
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  
  // Sort users
  const sortedUsers = useMemo(() => {
    if (!sortConfig.key) return filteredUsers;
    
    return [...filteredUsers].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredUsers, sortConfig]);
  
  // Paginate users for table view
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedUsers, currentPage, rowsPerPage]);
  
  // Calculate total pages
  const totalPages = Math.ceil(sortedUsers.length / rowsPerPage);
  
  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header Section with Stats */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: (theme) => `0 8px 20px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)'}`,
          border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
        }} 
        elevation={0}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 2, sm: 0 }, mb: 3 }}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700, 
                color: (theme) => theme.palette.mode === 'dark' ? 'primary.light' : 'primary.dark',
                letterSpacing: '-0.5px'
              }}
            >
              Users Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage all system users and their permissions
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
            <Tooltip title="Refresh user data">
              <IconButton 
                onClick={handleRefresh} 
                sx={{ 
                  bgcolor: 'rgba(25, 118, 210, 0.08)', 
                  '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.15)' } 
                }}
              >
                <RefreshIcon color="primary" />
              </IconButton>
            </Tooltip>
            <Box 
              sx={{ 
                display: { xs: 'none', sm: 'flex' }, 
                alignItems: 'center', 
                bgcolor: 'rgba(0, 0, 0, 0.04)', 
                borderRadius: 3, 
                px: 1, 
                py: 0.5 
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  mr: 1, 
                  fontWeight: viewMode === 'card' ? 600 : 400,
                  color: viewMode === 'card' ? 'primary.main' : 'text.secondary'
                }}
              >
                Card
              </Typography>
              <Switch
                checked={viewMode === 'table'}
                onChange={handleViewModeChange}
                color="primary"
                size="small"
                sx={{ 
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    opacity: 0.3,
                  }
                }}
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 1, 
                  fontWeight: viewMode === 'table' ? 600 : 400,
                  color: viewMode === 'table' ? 'primary.main' : 'text.secondary'
                }}
              >
                Table
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{ 
                borderRadius: 2, 
                background: '#4a6fa1',
                boxShadow: '0 4px 12px rgba(74, 111, 161, 0.2)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(74, 111, 161, 0.3)',
                },
                width: { xs: 'auto', sm: 'auto' },
                whiteSpace: 'nowrap'
              }}
            >
              Add User
            </Button>
          </Box>
        </Box>
        
        {/* User Statistics */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3} lg={2.4} xl={2}>
            <Paper 
              sx={{ 
                p: 2.5, 
                borderRadius: 3, 
                height: '100%',
                bgcolor: 'primary.main',
                boxShadow: (theme) => `0 6px 16px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(74, 111, 161, 0.15)'}`,
                color: 'primary.contrastText',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: (theme) => `0 8px 20px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(74, 111, 161, 0.2)'}`,
                }
              }}
              elevation={0}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.25)', 
                    width: 50, 
                    height: 50,
                    border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)'}`
                  }}
                >
                  <PersonIcon fontSize="medium" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{userStats.total}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>Total Users</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              sx={{ 
                p: 2.5, 
                borderRadius: 3, 
                height: '100%',
                bgcolor: 'success.main',
                boxShadow: (theme) => `0 6px 16px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(94, 139, 126, 0.15)'}`,
                color: 'success.contrastText',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: (theme) => `0 8px 20px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(94, 139, 126, 0.2)'}`,
                }
              }}
              elevation={0}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.25)', 
                    width: 50, 
                    height: 50,
                    border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)'}`
                  }}
                >
                  <SchoolIcon fontSize="medium" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{userStats.byRole['instructor'] || 0}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>Instructors</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              sx={{ 
                p: 2.5, 
                borderRadius: 3, 
                height: '100%',
                bgcolor: 'info.main',
                boxShadow: (theme) => `0 6px 16px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(126, 123, 140, 0.15)'}`,
                color: 'info.contrastText',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: (theme) => `0 8px 20px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(126, 123, 140, 0.2)'}`,
                }
              }}
              elevation={0}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.25)', 
                    width: 50, 
                    height: 50,
                    border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)'}`
                  }}
                >
                  <BusinessIcon fontSize="medium" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{Object.keys(userStats.bySchool).length}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>Schools</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              sx={{ 
                p: 2.5, 
                borderRadius: 3, 
                height: '100%',
                bgcolor: 'warning.main',
                boxShadow: (theme) => `0 6px 16px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(106, 141, 115, 0.15)'}`,
                color: 'warning.contrastText',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: (theme) => `0 8px 20px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(106, 141, 115, 0.2)'}`,
                }
              }}
              elevation={0}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.25)', 
                    width: 50, 
                    height: 50,
                    border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)'}`
                  }}
                >
                  <AccessTimeIcon fontSize="medium" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{Object.keys(userStats.byDepartment).length}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>Departments</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Search and Filter Section */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: (theme) => `0 8px 25px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)'}`,
          border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
        }} 
        elevation={0}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 2, sm: 0 }, mb: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              fontWeight: 600,
              color: '#1e293b'
            }}
          >
            <FilterListIcon sx={{ color: '#3a7bd5' }} />
            Filters & Search
          </Typography>
          <Tooltip title="Clear All Filters">
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon />}
              onClick={() => {
                setSearchTerm('');
                setFilterRole('all');
                setFilterSchool('all');
                setFilterDepartment('all');
                setCurrentPage(1);
              }}
              sx={{
                borderRadius: 2,
                borderColor: 'rgba(58, 123, 213, 0.5)',
                color: '#3a7bd5',
                '&:hover': {
                  borderColor: '#3a7bd5',
                  backgroundColor: 'rgba(58, 123, 213, 0.04)'
                }
              }}
            >
              Clear All
            </Button>
          </Tooltip>
        </Box>
        
        <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search Users"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              placeholder="Search by name, email, or phone"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#3a7bd5' }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                      edge="end"
                      sx={{ color: '#94a3b8' }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  p: 2, 
                  borderRadius: 2,
                  mb: 2,
                  bgcolor: 'background.paper',
                  boxShadow: (theme) => `0 4px 15px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)'}`,
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => `0 6px 20px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`,
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 4px 12px rgba(58, 123, 213, 0.15)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#3a7bd5',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  '&.Mui-focused': {
                    color: '#3a7bd5',
                  },
                },
                '& .MuiInputBase-input': {
                  '&::placeholder': {
                    color: '#94a3b8',
                    opacity: 0.7,
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'text.secondary' : '#64748b', '&.Mui-focused': { color: 'primary.main' } }}>Role</InputLabel>
              <Select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
                label="Role"
                sx={{ 
                  borderRadius: 2,
                  boxShadow: (theme) => `0 2px 8px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'}`,
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: { 
                      maxHeight: 300,
                      bgcolor: 'background.paper',
                      boxShadow: (theme) => `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)'}`,
                      borderRadius: 2,
                      mt: 0.5,
                      '& .MuiMenuItem-root': {
                        px: 2,
                        py: 1.5,
                        borderRadius: 1,
                        mx: 0.5,
                        my: 0.25,
                        '&:hover': {
                          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(58, 123, 213, 0.15)' : 'rgba(58, 123, 213, 0.08)',
                        },
                        '&.Mui-selected': {
                          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(58, 123, 213, 0.2)' : 'rgba(58, 123, 213, 0.12)',
                          '&:hover': {
                            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(58, 123, 213, 0.25)' : 'rgba(58, 123, 213, 0.16)',
                          },
                        },
                      }
                    }
                  }
                }}
              >
                <MenuItem value="all">All Roles</MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                    {filterRole === role.value && (
                      <Box component="span" sx={{ ml: 1, color: 'primary.main' }}>
                        ({userStats.byRole[role.value] || 0})
                      </Box>
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'text.secondary' : '#64748b', '&.Mui-focused': { color: 'primary.main' } }}>School</InputLabel>
              <Select
                value={filterSchool}
                onChange={(e) => {
                  setFilterSchool(e.target.value);
                  // If changing school, reset department filter if it's not in the new school
                  if (e.target.value !== 'all' && filterDepartment !== 'all') {
                    const deptInSchool = departments[e.target.value]?.includes(filterDepartment);
                    if (!deptInSchool) setFilterDepartment('all');
                  }
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
                label="School"
                sx={{ 
                  borderRadius: 2,
                  boxShadow: (theme) => `0 2px 8px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'}`,
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: { maxHeight: 300 }
                  }
                }}
              >
                <MenuItem value="all">All Schools</MenuItem>
                {uniqueSchools.map((school) => (
                  <MenuItem key={school} value={school}>
                    {school}
                    {filterSchool === school && (
                      <Box component="span" sx={{ ml: 1, color: 'primary.main' }}>
                        ({userStats.bySchool[school] || 0})
                      </Box>
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={filterDepartment}
                onChange={(e) => {
                  setFilterDepartment(e.target.value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
                label="Department"
                sx={{ borderRadius: 2 }}
                MenuProps={{
                  PaperProps: {
                    sx: { maxHeight: 300 }
                  }
                }}
              >
                <MenuItem value="all">All Departments</MenuItem>
                {/* Show only departments from selected school if a school is selected */}
                {filterSchool !== 'all' ? (
                  departments[filterSchool]?.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                      {filterDepartment === dept && (
                        <Box component="span" sx={{ ml: 1, color: 'primary.main' }}>
                          ({userStats.byDepartment[dept] || 0})
                        </Box>
                      )}
                    </MenuItem>
                  ))
                ) : (
                  uniqueDepartments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                      {filterDepartment === dept && (
                        <Box component="span" sx={{ ml: 1, color: 'primary.main' }}>
                          ({userStats.byDepartment[dept] || 0})
                        </Box>
                      )}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {/* Active Filters Display */}
        {(searchTerm || filterRole !== 'all' || filterSchool !== 'all' || filterDepartment !== 'all') && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {searchTerm && (
              <Chip 
                label={`Search: ${searchTerm}`}
                onDelete={() => setSearchTerm('')}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {filterRole !== 'all' && (
              <Chip 
                label={`Role: ${roles.find(r => r.value === filterRole)?.label || filterRole}`}
                onDelete={() => setFilterRole('all')}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {filterSchool !== 'all' && (
              <Chip 
                label={`School: ${filterSchool}`}
                onDelete={() => setFilterSchool('all')}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {filterDepartment !== 'all' && (
              <Chip 
                label={`Department: ${filterDepartment}`}
                onDelete={() => setFilterDepartment('all')}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Results Summary */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body1" fontWeight="medium" color="primary.main">
            Results
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Showing {filteredUsers.length} of {users.length} users
            {searchTerm && ` matching "${searchTerm}"`}
            {filterRole !== 'all' && ` with role "${roles.find(r => r.value === filterRole)?.label || filterRole}"`}
            {filterSchool !== 'all' && ` in "${filterSchool}"`}
            {filterDepartment !== 'all' && ` from "${filterDepartment}" department`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>

      {loading ? (
        /* Skeleton Loading */
        <>
          {/* Skeleton for Statistics Cards */}
          <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
            {[...Array(4)].map((_, index) => (
              <Grid item xs={12} sm={6} md={3} lg={2.4} xl={2} key={`stat-skeleton-${index}`}>
                <Paper sx={{ p: 2.5, borderRadius: 3, height: '100%', bgcolor: 'background.paper' }} elevation={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant="circular" width={50} height={50} />
                    <Box sx={{ width: '100%' }}>
                      <Skeleton variant="text" width="60%" height={36} />
                      <Skeleton variant="text" width="90%" height={20} />
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
          
          {/* Skeleton for Content - Table or Cards based on viewMode */}
          {viewMode === 'table' && !isMobile ? (
            /* Table Skeleton */
            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3, mb: 3 }} elevation={1}>
              <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)', width: '100%' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {['Name', 'Email', 'Role', 'School', 'Department', 'Actions'].map((header) => (
                        <TableCell key={header}>
                          <Skeleton variant="text" width={header === 'Actions' ? 80 : 120} height={24} />
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...Array(8)].map((_, index) => (
                      <TableRow key={`row-skeleton-${index}`}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Skeleton variant="circular" width={32} height={32} />
                            <Skeleton variant="text" width={120} />
                          </Box>
                        </TableCell>
                        <TableCell><Skeleton variant="text" width={160} /></TableCell>
                        <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                        <TableCell><Skeleton variant="text" width={100} /></TableCell>
                        <TableCell><Skeleton variant="text" width={120} /></TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Skeleton variant="circular" width={30} height={30} />
                            <Skeleton variant="circular" width={30} height={30} />
                            <Skeleton variant="circular" width={30} height={30} />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : (
            /* Card Skeleton */
            <Accordion expanded sx={{ mb: 2, borderRadius: '8px !important', overflow: 'hidden' }}>
              <AccordionSummary sx={{ bgcolor: 'background.paper', borderRadius: '8px 8px 0 0' }}>
                <Skeleton variant="text" width={200} height={32} />
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {[...Array(6)].map((_, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={`card-skeleton-${index}`}>
                      <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }} elevation={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Box>
                            <Skeleton variant="text" width={120} height={28} />
                            <Skeleton variant="text" width={180} height={20} />
                            <Skeleton variant="text" width={140} height={20} />
                          </Box>
                          <Skeleton variant="rounded" width={80} height={24} />
                        </Box>
                        <Skeleton variant="rounded" width="100%" height={100} sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Skeleton variant="circular" width={36} height={36} />
                          <Skeleton variant="circular" width={36} height={36} />
                          <Skeleton variant="circular" width={36} height={36} />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}
        </>
      ) : viewMode === 'table' && !isMobile ? (
        /* Table View */
        <Paper 
          sx={{ 
            width: '100%', 
            overflow: 'hidden', 
            borderRadius: 3, 
            mb: 3,
            bgcolor: 'background.paper',
            boxShadow: (theme) => `0 10px 30px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'}`,
            border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
          }} 
          elevation={0}
        >
          <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)', width: '100%' }}>
            <Table stickyHeader sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(58, 123, 213, 0.1)' : 'rgba(58, 123, 213, 0.04)' }}>
                  <TableCell 
                    sx={{ 
                      fontWeight: 600,
                      color: (theme) => theme.palette.mode === 'dark' ? 'text.primary' : '#1e293b',
                      fontSize: '0.875rem',
                      borderBottom: (theme) => `2px solid ${theme.palette.mode === 'dark' ? 'rgba(58, 123, 213, 0.3)' : 'rgba(58, 123, 213, 0.2)'}`,
                      py: 2
                    }}
                  >
                    <TableSortLabel
                      active={sortConfig.key === 'name'}
                      direction={sortConfig.key === 'name' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('name')}
                      sx={{
                        '& .MuiTableSortLabel-icon': {
                          color: sortConfig.key === 'name' ? '#3a7bd5 !important' : undefined
                        },
                        color: sortConfig.key === 'name' ? '#3a7bd5' : 'inherit',
                        fontWeight: sortConfig.key === 'name' ? 700 : 600,
                      }}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <TableSortLabel
                      active={sortConfig.key === 'email'}
                      direction={sortConfig.key === 'email' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('email')}
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <TableSortLabel
                      active={sortConfig.key === 'role'}
                      direction={sortConfig.key === 'role' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('role')}
                    >
                      Role
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <TableSortLabel
                      active={sortConfig.key === 'school'}
                      direction={sortConfig.key === 'school' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('school')}
                    >
                      School
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <TableSortLabel
                      active={sortConfig.key === 'department'}
                      direction={sortConfig.key === 'department' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('department')}
                    >
                      Department
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow 
                    key={user._id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { bgcolor: 'rgba(58, 123, 213, 0.04)' },
                      transition: 'all 0.2s ease',
                      borderLeft: '3px solid transparent',
                      '&:hover': {
                        borderLeft: '3px solid #3a7bd5',
                        bgcolor: 'rgba(58, 123, 213, 0.04)',
                        transform: 'translateX(2px)'
                      }
                    }}
                  >
                    <TableCell component="th" scope="row">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">{user.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={roles.find(r => r.value === user.role)?.label || user.role}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ height: 24 }}
                      />
                    </TableCell>
                    <TableCell>{user.school || 'N/A'}</TableCell>
                    <TableCell>{user.department || 'N/A'}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleViewUser(user)}
                            sx={{ 
                              bgcolor: 'action.hover',
                              '&:hover': { bgcolor: 'action.selected' }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setSelectedUser(user);
                              setOpenDialog(true);
                            }}
                            sx={{ 
                              bgcolor: 'action.hover',
                              '&:hover': { bgcolor: 'action.selected' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteDialogOpen(user)}
                            sx={{ 
                              bgcolor: 'action.hover',
                              '&:hover': { bgcolor: 'action.selected' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination for Table View */}
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination 
              count={totalPages} 
              page={currentPage} 
              onChange={handlePageChange} 
              color="primary" 
              showFirstButton 
              showLastButton
              size="medium"
            />
          </Box>
        </Paper>
      ) : (
        /* Card View - Original Accordion Layout */
        Object.entries(groupedUsers).map(([school, schoolUsers]) => (
          <Accordion 
            key={school}
            expanded={expandedSchool === school}
            onChange={handleAccordionChange(school)}
            sx={{
              mb: 2,
              '&:before': { display: 'none' },
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px !important',
              overflow: 'hidden',
              '&:first-of-type': {
                borderRadius: '8px !important',
              },
              '&:last-of-type': {
                borderRadius: '8px !important',
              },
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                background: (theme) => theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
                  : 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
                color: '#ffffff',
                '& .MuiAccordionSummary-expandIconWrapper': {
                  color: '#ffffff',
                },
                '&:hover': {
                  background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #1a252f 0%, #2c3e50 100%)'
                    : 'linear-gradient(135deg, #3b5998 0%, #192440 100%)',
                },
                borderRadius: '8px 8px 0 0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography variant="h6">
                  {school} ({schoolUsers.length} users)
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Grid container spacing={2}>
                {schoolUsers.map((user) => (
                  <Grid item xs={12} sm={12} md={6} lg={4} key={user._id}>
                    <Paper 
                      sx={{ 
                        p: 3,
                        height: '100%',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        },
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {user.name}
                          </Typography>
                          <Typography color="textSecondary" variant="body2" gutterBottom>
                            {user.email}
                          </Typography>
                          <Typography color="textSecondary" variant="body2">
                            {user.phone || 'No phone'}
                          </Typography>
                        </Box>
                        <Box>
                          <Chip
                            label={roles.find(r => r.value === user.role)?.label || user.role}
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={{ 
                              height: 24,
                              mb: 1
                            }}
                          />
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 2.5,
                              bgcolor: 'background.default',
                              borderColor: 'divider',
                              height: '100%',
                              overflow: 'hidden'
                            }}
                          >
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ mb: 1.5 }}>
                              User Information
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <Typography variant="body2" sx={{ mb: 1, display: 'flex', flexDirection: 'column' }}>
                                  <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.5 }}>Role</Box>
                                  <Box component="span" sx={{ fontWeight: 'medium' }}>
                                    {roles.find(r => r.value === user.role)?.label || user.role}
                                  </Box>
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="body2" sx={{ mb: 1, display: 'flex', flexDirection: 'column' }}>
                                  <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.5 }}>School</Box>
                                  <Box component="span" sx={{ fontWeight: 'medium', wordBreak: 'break-word' }}>
                                    {user.school || 'N/A'}
                                  </Box>
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ mb: 1, display: 'flex', flexDirection: 'column' }}>
                                  <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.5 }}>Department</Box>
                                  <Box component="span" sx={{ fontWeight: 'medium', wordBreak: 'break-word' }}>
                                    {user.department || 'N/A'}
                                  </Box>
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ mb: 1, display: 'flex', flexDirection: 'column' }}>
                                  <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.5 }}>Phone</Box>
                                  <Box component="span" sx={{ fontWeight: 'medium' }}>
                                    {user.phone || 'Not provided'}
                                  </Box>
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="body2" sx={{ display: 'flex', flexDirection: 'column' }}>
                                  <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.5 }}>Email</Box>
                                  <Box component="span" sx={{ fontWeight: 'medium', wordBreak: 'break-word' }}>
                                    {user.email}
                                  </Box>
                                </Typography>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>

                        {/* Hour Allocations - Only for instructors */}
                        {user.role === 'instructor' && (
                          <Grid item xs={12}>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2.5,
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(156, 137, 184, 0.08)' : 'rgba(106, 90, 205, 0.04)',
                                borderColor: (theme) => theme.palette.mode === 'dark' ? '#9c89b8' : '#6a5acd',
                                borderWidth: '1px',
                                borderRadius: 2,
                                boxShadow: (theme) => `0 2px 8px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(106, 90, 205, 0.1)'}`,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                              }}
                            >
                              <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ mb: 1.5 }}>
                                Hour Allocations
                              </Typography>
                              <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                                <Grid item xs={12} sm={4}>
                                  <Box sx={{ 
                                    textAlign: 'center', 
                                    p: 1.5, 
                                    borderRadius: 1,
                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(156, 137, 184, 0.15)' : 'rgba(106, 90, 205, 0.08)',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                  }}>
                                    <Typography variant="h5" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#9c89b8' : '#6a5acd', fontWeight: 600 }}>
                                      {user.hdpHour || 0}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                      HDP Hours
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Box sx={{ 
                                    textAlign: 'center', 
                                    p: 1.5, 
                                    borderRadius: 1,
                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(156, 137, 184, 0.15)' : 'rgba(106, 90, 205, 0.08)',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                  }}>
                                    <Typography variant="h5" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#9c89b8' : '#6a5acd', fontWeight: 600 }}>
                                      {user.positionHour || 0}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                      Position Hours
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Box sx={{ 
                                    textAlign: 'center', 
                                    p: 1.5, 
                                    borderRadius: 1,
                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(156, 137, 184, 0.15)' : 'rgba(106, 90, 205, 0.08)',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                  }}>
                                    <Typography variant="h5" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#9c89b8' : '#6a5acd', fontWeight: 600 }}>
                                      {user.batchAdvisor || 0}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                      Batch Advisor
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12}>
                                  <Divider sx={{ my: 2 }} />
                                  <Box sx={{ 
                                    textAlign: 'center',
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.15)' : 'rgba(25, 118, 210, 0.08)',
                                  }}>
                                    <Typography variant="subtitle1" color="primary" fontWeight="medium">
                                      Total: {(user.hdpHour || 0) + (user.positionHour || 0) + (user.batchAdvisor || 0)} Hours
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Paper>
                          </Grid>
                        )}
                      </Grid>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => {
                            setSelectedUser(user);
                            setOpenDialog(true);
                          }}
                          sx={{ 
                            bgcolor: 'action.hover',
                            '&:hover': { bgcolor: 'action.selected' }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteDialogOpen(user)}
                          sx={{ 
                            bgcolor: 'action.hover',
                            '&:hover': { bgcolor: 'action.selected' }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon color="error" />
            Confirm User Deletion
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography id="delete-dialog-description" variant="body1" gutterBottom>
              Are you sure you want to delete this user? This action cannot be undone.
            </Typography>
            {userToDelete && (
              <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" gutterBottom>
                  User Details:
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {userToDelete.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Email:</strong> {userToDelete.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Role:</strong> {roles.find(r => r.value === userToDelete.role)?.label || userToDelete.role}
                    </Typography>
                  </Grid>
                  {userToDelete.department && (
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Department:</strong> {userToDelete.department}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}
            
            {/* Confirmation Checkbox */}
            <Box sx={{
              mt: 3, 
              p: 2, 
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.2)' : 'rgba(211, 47, 47, 0.1)', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'error.main'
            }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={deleteConfirmed}
                    onChange={(e) => setDeleteConfirmed(e.target.checked)}
                    sx={{ 
                      color: 'error.main',
                      '&.Mui-checked': { color: 'error.main' }
                    }}
                  />
                }
                label={
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'error.dark',
                      textShadow: (theme) => theme.palette.mode === 'dark' ? '0px 0px 1px rgba(0,0,0,0.5)' : 'none'
                    }}
                  >
                    I am sure I want to delete this user and understand this action cannot be undone
                  </Typography>
                }
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDeleteDialogClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            disabled={!deleteConfirmed}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={formik.values.role}
                      onChange={formik.handleChange}
                      error={formik.touched.role && Boolean(formik.errors.role)}
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          {role.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Hour Fields - Only for instructors */}
                {formik.values.role === 'instructor' && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ mt: 2 }}>
                        Hour Allocations
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="HDP Hours"
                        name="hdpHour"
                        value={formik.values.hdpHour}
                        onChange={formik.handleChange}
                        error={formik.touched.hdpHour && Boolean(formik.errors.hdpHour)}
                        helperText={formik.touched.hdpHour && formik.errors.hdpHour}
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Position Hours"
                        name="positionHour"
                        value={formik.values.positionHour}
                        onChange={formik.handleChange}
                        error={formik.touched.positionHour && Boolean(formik.errors.positionHour)}
                        helperText={formik.touched.positionHour && formik.errors.positionHour}
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Batch Advisor Hours"
                        name="batchAdvisor"
                        value={formik.values.batchAdvisor}
                        onChange={formik.handleChange}
                        error={formik.touched.batchAdvisor && Boolean(formik.errors.batchAdvisor)}
                        helperText={formik.touched.batchAdvisor && formik.errors.batchAdvisor}
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="body2" color="primary">
                          Total Hours: {(Number(formik.values.hdpHour) || 0) + 
                                      (Number(formik.values.positionHour) || 0) + 
                                      (Number(formik.values.batchAdvisor) || 0)}
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}

                {/* School and Department Fields */}
                {!rolesWithoutSchoolDept.includes(formik.values.role) && (
                  <>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>School</InputLabel>
                        <Select
                          name="school"
                          value={formik.values.school}
                          onChange={formik.handleChange}
                          error={formik.touched.school && Boolean(formik.errors.school)}
                        >
                          {schools.map((school) => (
                            <MenuItem key={school} value={school}>
                              {school}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    {!rolesWithOnlySchool.includes(formik.values.role) && (
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Department</InputLabel>
                          <Select
                            name="department"
                            value={formik.values.department}
                            onChange={formik.handleChange}
                            error={formik.touched.department && Boolean(formik.errors.department)}
                            disabled={!formik.values.school}
                          >
                            {(departments[formik.values.school] || []).map((dept) => (
                              <MenuItem key={dept} value={dept}>
                                {dept}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                  </>
                )}

                {/* Password Fields for New Users */}
                {!selectedUser && (
                  <>
                    {renderPasswordFields()}
                  </>
                )}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isSubmitting}>Cancel</Button>
            {isSubmitting ? (
              <LoadingButton
                loading
                variant="contained"
                color="primary"
              >
                {selectedUser ? 'Updating...' : 'Adding...'}
              </LoadingButton>
            ) : (
              <Button type="submit" variant="contained" color="primary">
                {selectedUser ? 'Update User' : 'Add User'}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>

      {/* User Details View Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            {selectedUser?.name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          User Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12} md={6}>
                <Paper elevation={0} variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                      <Typography variant="body1">{selectedUser.name}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                      <Typography variant="body1">{selectedUser.email}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                      <Typography variant="body1">{selectedUser.phone || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Role</Typography>
                      <Chip
                        label={roles.find(r => r.value === selectedUser.role)?.label || selectedUser.role}
                        color="primary"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              {/* School & Department */}
              <Grid item xs={12} md={6}>
                <Paper elevation={0} variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Organization
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">School</Typography>
                      <Typography variant="body1">{selectedUser.school || 'Not assigned'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Department</Typography>
                      <Typography variant="body1">{selectedUser.department || 'Not assigned'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              {/* Hour Allocations - Only for instructors */}
              {selectedUser.role === 'instructor' && (
                <Grid item xs={12}>
                  <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Hour Allocations
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 2 }}>
                          <Typography variant="h4">{selectedUser.hdpHour || 0}</Typography>
                          <Typography variant="body2">HDP Hours</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText', borderRadius: 2 }}>
                          <Typography variant="h4">{selectedUser.positionHour || 0}</Typography>
                          <Typography variant="body2">Position Hours</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText', borderRadius: 2 }}>
                          <Typography variant="h4">{selectedUser.batchAdvisor || 0}</Typography>
                          <Typography variant="body2">Batch Advisor Hours</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText', borderRadius: 2 }}>
                          <Typography variant="h4">
                            {(Number(selectedUser.hdpHour) || 0) + 
                             (Number(selectedUser.positionHour) || 0) + 
                             (Number(selectedUser.batchAdvisor) || 0)}
                          </Typography>
                          <Typography variant="body2">Total Hours</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
              
              {/* System Information */}
              <Grid item xs={12}>
                <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    System Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">User ID</Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{selectedUser._id}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
                      <Typography variant="body2">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'Not available'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setOpenViewDialog(false)}
            color="inherit"
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => {
              setOpenViewDialog(false);
              setOpenDialog(true);
            }}
          >
            Edit User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 180, borderRadius: 2 }
        }}
      >
        <MenuItem onClick={() => handleViewUser(menuUser)}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" color="info" />
          </ListItemIcon>
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          setSelectedUser(menuUser);
          setOpenDialog(true);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="primary" />
          </ListItemIcon>
          Edit User
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeleteDialogOpen(menuUser);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete User
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Users;
