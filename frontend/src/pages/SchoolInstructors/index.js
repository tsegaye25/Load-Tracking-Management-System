import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const SchoolInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseURL}/api/v1/users/school-instructors`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();

        if (data.status === 'success') {
          const deptSet = new Set();
          data.data.instructorStats.forEach(instructor => {
            if (instructor.department) {
              deptSet.add(instructor.department);
            }
          });

          setInstructors(data.data.instructorStats);
          setFilteredInstructors(data.data.instructorStats);
          setDepartments(Array.from(deptSet));
        }
      } catch (error) {
        console.error('Error fetching instructors:', error);
        toast.error('Failed to load instructor data');
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, [baseURL]);

  // Filter instructors based on search term and department
  useEffect(() => {
    let filtered = [...instructors];
    
    if (searchTerm) {
      filtered = filtered.filter(instructor => 
        instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(instructor => 
        instructor.department === filterDepartment
      );
    }
    
    setFilteredInstructors(filtered);
  }, [searchTerm, filterDepartment, instructors]);

  const getOverloadStatus = (overloadHours) => {
    if (overloadHours > 0) {
      return <Chip label={`Overload: ${overloadHours}h`} color="error" size="small" />;
    }
    return null;
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          School Instructors Overview
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Manage instructor workloads and course assignments
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Instructors
              </Typography>
              <Typography variant="h5">
                {instructors.filter(i => i.role === 'instructor').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Departments
              </Typography>
              <Typography variant="h5">
                {departments.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Overloaded Instructors
              </Typography>
              <Typography variant="h5">
                {instructors.filter(i => i.overloadHours > 0).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Courses Assigned
              </Typography>
              <Typography variant="h5">
                {instructors.reduce((sum, i) => sum + i.courseCount, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search instructors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            variant="outlined"
            label="Department"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <MenuItem value="all">All Departments</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Instructors List */}
      {filteredInstructors.map((instructor) => (
        <Accordion key={instructor._id} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle1">{instructor.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {instructor.email}
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="body2">
                  Department: {instructor.department}
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="body2">
                  Courses: {instructor.courseCount}
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="body2">
                  Total Load: {instructor.totalLoad}h
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                {getOverloadStatus(instructor.overloadHours)}
                {instructor.overloadHours > 0 && (
                  <Typography variant="body2" color="error">
                    Additional Pay: ${(instructor.overloadHours * 100).toFixed(2)}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Course Code</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Credit Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {instructor.courses.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell>{course.code}</TableCell>
                      <TableCell>{course.title}</TableCell>
                      <TableCell>{course.department}</TableCell>
                      <TableCell>{course.classYear}</TableCell>
                      <TableCell>{course.creditHours}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

export default SchoolInstructors;
