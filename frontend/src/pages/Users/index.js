import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Container, Typography, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Grid,
  IconButton, Card, CardContent, Divider, FormControl,
  InputLabel, Select, Chip, CircularProgress, Accordion,
  AccordionSummary, AccordionDetails, Paper, InputAdornment, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useFormik } from 'formik';
import { register, getAllUsers, updateUser, deleteUser, setLoading, setUsers } from '../../store/authSlice';
import { toast } from 'react-toastify';

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.auth);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

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
        dispatch(setLoading(true));
        const userData = { ...values };
        
        // Only include hour fields for instructors
        if (values.role !== 'instructor') {
          delete userData.hdpHour;
          delete userData.positionHour;
          delete userData.batchAdvisor;
        }

        if (selectedUser) {
          await dispatch(updateUser({ id: selectedUser._id, userData })).unwrap();
          toast.success('User updated successfully');
        } else {
          await dispatch(register(userData)).unwrap();
          toast.success('User created successfully');
        }
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

  // State for expanded accordions
  const [expandedSchool, setExpandedSchool] = useState(null);

  const handleAccordionChange = (school) => (event, isExpanded) => {
    setExpandedSchool(isExpanded ? school : null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Users Management
        </Typography>
      </Box>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search Users"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                label="Role"
              >
                <MenuItem value="all">All Roles</MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>School</InputLabel>
              <Select
                value={filterSchool}
                onChange={(e) => setFilterSchool(e.target.value)}
                label="School"
              >
                <MenuItem value="all">All Schools</MenuItem>
                {uniqueSchools.map((school) => (
                  <MenuItem key={school} value={school}>
                    {school}
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
                onChange={(e) => setFilterDepartment(e.target.value)}
                label="Department"
              >
                <MenuItem value="all">All Departments</MenuItem>
                {uniqueDepartments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={0.5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="Clear Filters">
              <IconButton 
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('all');
                  setFilterSchool('all');
                  setFilterDepartment('all');
                }}
                size="small"
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Summary */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          Showing {filteredUsers.length} of {users.length} users
          {searchTerm && ` matching "${searchTerm}"`}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add User
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
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
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiAccordionSummary-expandIconWrapper': {
                  color: 'primary.contrastText',
                },
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography variant="h6">
                  {school} ({schoolUsers.length} users)
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {schoolUsers.map((user) => (
                  <Grid item xs={12} md={6} key={user._id}>
                    <Paper 
                      sx={{ 
                        p: 3,
                        height: '100%',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        }
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
                              p: 1.5,
                              bgcolor: 'background.default',
                              borderColor: 'divider'
                            }}
                          >
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                              User Information
                            </Typography>
                            <Grid container spacing={1}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2">
                                  <strong>Role:</strong> {roles.find(r => r.value === user.role)?.label || user.role}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2">
                                  <strong>School:</strong> {user.school || 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2">
                                  <strong>Phone:</strong> {user.phone || 'Not provided'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2">
                                  <strong>Department:</strong> {user.department || 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="body2">
                                  <strong>Email:</strong> {user.email}
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
                                p: 1.5,
                                bgcolor: 'background.default',
                                borderColor: 'divider'
                              }}
                            >
                              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Hour Allocations
                              </Typography>
                              <Grid container spacing={1}>
                                <Grid item xs={4}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6" color="primary">
                                      {user.hdpHour || 0}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      HDP Hours
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={4}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6" color="primary">
                                      {user.positionHour || 0}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      Position Hours
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={4}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6" color="primary">
                                      {user.batchAdvisor || 0}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      Batch Advisor
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12}>
                                  <Divider sx={{ my: 1 }} />
                                  <Box sx={{ textAlign: 'center' }}>
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
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedUser ? 'Update User' : 'Add User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Users;
