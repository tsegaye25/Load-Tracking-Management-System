import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Box, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Grid,
  IconButton, Card, CardContent, Divider, FormControl,
  InputLabel, Select, Chip, CircularProgress, Accordion,
  AccordionSummary, AccordionDetails, Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { register, getAllUsers, updateUser, deleteUser } from '../../store/authSlice';
import { toast } from 'react-toastify';

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.auth);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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
      });
    } else {
      formik.resetForm();
    }
  }, [selectedUser]);

  const schools = [
    'College of Business and Economics',
    'College of Computing and Informatics',
    'College of Engineering',
    'College of Natural Sciences'
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
    'College of Natural Sciences': ['Mathematics', 'Physics', 'Chemistry', 'Biology']
  };

  const roles = [
    { value: 'instructor', label: 'Instructor' },
    { value: 'department-head', label: 'Department Head' },
    { value: 'school-dean', label: 'School Dean' },
    { value: 'vice-scientific-director', label: 'Vice Scientific Director' },
    { value: 'scientific-director', label: 'Scientific Director' },
    { value: 'finance', label: 'Finance Officer' },
  ];

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      role: 'instructor',
      school: '',
      department: '',
      password: '',
      passwordConfirm: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      phone: Yup.string().required('Phone number is required'),
      role: Yup.string().required('Role is required'),
      school: Yup.string().required('School is required'),
      department: Yup.string().required('Department is required'),
      password: !selectedUser && Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      passwordConfirm: !selectedUser && Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password')
    }),
    onSubmit: async (values) => {
      try {
        const userData = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          role: values.role,
          school: values.school,
          department: values.department,
          ...((!selectedUser) && {
            password: values.password,
            passwordConfirm: values.passwordConfirm
          })
        };

        if (selectedUser) {
          const result = await dispatch(updateUser({ 
            id: selectedUser._id, 
            userData
          }));
          if (result) {
            handleClose();
          }
        } else {
          const result = await dispatch(register(userData));
          if (result) {
            handleClose();
          }
        }
      } catch (error) {
        console.error('User operation failed:', error);
        toast.error('Operation failed. Please try again.');
      }
    },
  });

  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const result = await dispatch(deleteUser(userId));
      if (result) {
        toast.success('User deleted successfully');
        dispatch(getAllUsers());
      }
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    formik.resetForm();
  };

  const renderPasswordFields = () => {
    if (selectedUser) return null; // Don't show password fields when editing

    return (
      <>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="passwordConfirm"
            name="passwordConfirm"
            label="Confirm Password"
            type="password"
            value={formik.values.passwordConfirm}
            onChange={formik.handleChange}
            error={formik.touched.passwordConfirm && Boolean(formik.errors.passwordConfirm)}
            helperText={formik.touched.passwordConfirm && formik.errors.passwordConfirm}
          />
        </Grid>
      </>
    );
  };

  // Group users by school
  const groupedUsers = users?.reduce((acc, user) => {
    if (!acc[user.school]) {
      acc[user.school] = {};
    }
    if (!acc[user.school][user.department]) {
      acc[user.school][user.department] = [];
    }
    acc[user.school][user.department].push(user);
    return acc;
  }, {});

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add User
        </Button>
      </Box>

      {schools.map((school) => (
        <Accordion key={school} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{school}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {groupedUsers?.[school] ? (
              Object.entries(groupedUsers[school]).map(([department, departmentUsers]) => (
                <Box key={department} mb={3}>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    {department}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={3}>
                    {departmentUsers.map((user) => (
                      <Grid item xs={12} sm={12} md={6} key={user._id}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box>
                                <Typography variant="h6" gutterBottom color="primary">
                                  {user.name}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary">
                                  {user.email}
                                </Typography>
                              </Box>
                              <Box>
                                <IconButton color="primary" onClick={() => handleEdit(user)}>
                                  <EditIcon />
                                </IconButton>
                                <IconButton color="error" onClick={() => handleDelete(user._id)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Basic Information
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                  <Typography>
                                    <strong>Role:</strong> {user.role}
                                  </Typography>
                                  <Typography>
                                    <strong>School:</strong> {user.school}
                                  </Typography>
                                  <Typography>
                                    <strong>Department:</strong> {user.department}
                                  </Typography>
                                </Box>
                              </Grid>

                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Contact Information
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                  <Typography>
                                    <strong>Phone:</strong> {user.phone || 'Not provided'}
                                  </Typography>
                                </Box>
                              </Grid>

                              {user.role === 'instructor' && (
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                                    Teaching Load Information
                                  </Typography>
                                  <Box sx={{ mt: 1 }}>
                                    <Typography>
                                      <strong>Current Load:</strong> {user.currentLoad || 0}
                                    </Typography>
                                    <Typography>
                                      <strong>Maximum Load:</strong> {user.maxLoad || 0}
                                    </Typography>
                                    <Typography>
                                      <strong>Remaining Load:</strong> {(user.maxLoad || 0) - (user.currentLoad || 0)}
                                    </Typography>
                                  </Box>
                                </Grid>
                              )}

                              {user.role === 'instructor' && (
                                <Box mt={2}>
                                  <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    Assigned Courses ({user.courses?.length || 0})
                                  </Typography>
                                  {user.courses?.length > 0 ? (
                                    <Box sx={{ 
                                      display: 'flex', 
                                      flexDirection: 'column',
                                      gap: 1,
                                      maxHeight: user.courses.length > 4 ? '200px' : 'auto',
                                      overflowY: user.courses.length > 4 ? 'auto' : 'visible',
                                      p: 1,
                                      '&::-webkit-scrollbar': {
                                        width: '8px'
                                      },
                                      '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: 'rgba(0,0,0,0.2)',
                                        borderRadius: '4px'
                                      }
                                    }}>
                                      {user.courses.map((course, index) => (
                                        <Paper
                                          key={course._id}
                                          variant="outlined"
                                          sx={{ p: 1 }}
                                        >
                                          <Typography variant="subtitle2">
                                            {index + 1}. {course.code} - {course.title}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {course.school} | {course.department}
                                          </Typography>
                                          <Typography variant="caption" color="primary" sx={{ display: 'block' }}>
                                            {course.totalHours} hours
                                          </Typography>
                                        </Paper>
                                      ))}
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      No courses assigned yet
                                    </Typography>
                                  )}
                                </Box>
                              )}

                              <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                                  Account Status
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography component="span">
                                      <strong>Status:</strong>
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={user.active ? 'Active' : 'Inactive'}
                                      color={user.active ? 'success' : 'error'}
                                    />
                                  </Box>
                                  <Typography>
                                    <strong>Last Login:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))
            ) : (
              <Typography color="textSecondary">No users in this school</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="phone"
                  name="phone"
                  label="Phone"
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
                    id="role"
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    error={formik.touched.role && Boolean(formik.errors.role)}
                  >
                    <MenuItem value="instructor">Instructor</MenuItem>
                    <MenuItem value="department-head">Department Head</MenuItem>
                    <MenuItem value="school-dean">School Dean</MenuItem>
                    <MenuItem value="vice-scientific-director">Vice Scientific Director</MenuItem>
                    <MenuItem value="scientific-director">Scientific Director</MenuItem>
                    <MenuItem value="finance">Finance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>School</InputLabel>
                  <Select
                    id="school"
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
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    id="department"
                    name="department"
                    value={formik.values.department}
                    onChange={formik.handleChange}
                    error={formik.touched.department && Boolean(formik.errors.department)}
                  >
                    {departments[formik.values.school]?.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {renderPasswordFields()}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedUser ? 'Update User' : 'Add User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Users;
