import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { updateProfile } from '../../store/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      phone: user?.phone || '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      department: Yup.string().required('Department is required'),
      phone: Yup.string().required('Phone number is required'),
    }),
    onSubmit: async (values) => {
      const success = await dispatch(updateProfile(values));
      if (success) {
        setIsEditing(false);
      }
    },
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Card>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={formik.values.department}
                  onChange={formik.handleChange}
                  error={formik.touched.department && Boolean(formik.errors.department)}
                  helperText={formik.touched.department && formik.errors.department}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  {!isEditing ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setIsEditing(false);
                          formik.resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;
