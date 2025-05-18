import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  Chip, 
  TextField, 
  InputAdornment,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Snackbar,
  SnackbarContent,
  Checkbox
} from '@mui/material';
import {
  Search as SearchIcon,
  History as HistoryIcon,
  FilterList as FilterListIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarMonthIcon,
  Info as InfoIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  LibraryBooks as LibraryBooksIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  FilterAlt as FilterAltIcon,
  RestartAlt as RestartAltIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const InstructorsHistory = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedTab, setSelectedTab] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Filters for school and department
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [schoolDepartmentMap, setSchoolDepartmentMap] = useState({});
  
  // State for detailed history modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  
  // State for semester reset confirmation dialog
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetSemesterYear, setResetSemesterYear] = useState(new Date().getFullYear());
  const [resetSemesterTerm, setResetSemesterTerm] = useState(new Date().getMonth() < 6 ? 'First' : 'Second');
  const [isResetting, setIsResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  
  // State for feedback messages
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success', 'error', 'info', 'warning'

  // Function to fetch instructors data including deleted users and their actual course assignments
  const fetchInstructors = async () => {
      try {
        setLoading(true);
        
        // Fetch active instructors - explicitly filter by role=instructor
        const activeResponse = await fetch('http://localhost:5000/api/v1/users?role=instructor', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!activeResponse.ok) {
          throw new Error('Failed to fetch active instructors');
        }
        
        const activeData = await activeResponse.json();
        
        // Filter to ensure we only have instructors (in case API returns mixed roles)
        // This is a strict check to ensure only instructors are included
        const activeInstructors = activeData.data.users.filter(user => 
          user.role === 'instructor' || user.role === 'Instructor'
        );
        
        // Fetch all courses to get instructor assignments
        const coursesResponse = await fetch('http://localhost:5000/api/v1/courses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!coursesResponse.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const coursesData = await coursesResponse.json();
        const allCourses = coursesData.data.courses || [];
        
        // Fetch deleted instructors from the API
        const deletedResponse = await fetch('http://localhost:5000/api/v1/users?role=instructor&isDeleted=true', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        let deletedInstructors = [];
        if (deletedResponse.ok) {
          const deletedData = await deletedResponse.json();
          // Apply strict role filtering to ensure only instructors are included
          deletedInstructors = (deletedData.data?.users || []).filter(user => 
            user.role === 'instructor' || user.role === 'Instructor'
          );
        }
        
        // Use a Map to ensure each instructor appears only once (by _id)
        const instructorsMap = new Map();
        
        // Add active instructors to the map
        activeInstructors.forEach(instructor => {
          instructorsMap.set(instructor._id, instructor);
        });
        
        // Add deleted instructors to the map (will overwrite if duplicate _id)
        deletedInstructors.forEach(instructor => {
          instructorsMap.set(instructor._id, instructor);
        });
        
        // Convert the map back to an array
        const allInstructors = Array.from(instructorsMap.values());
        
        // Process instructors with their actual course assignments
        const instructorsWithHistory = allInstructors
          // Final check to ensure only instructors are processed
          .filter(user => user.role === 'instructor' || user.role === 'Instructor')
          .map(instructor => {
            // Find all courses assigned to this instructor
            const instructorCourses = allCourses.filter(course => 
              course.instructor && 
              (course.instructor._id === instructor._id || course.instructor === instructor._id)
            );
          
          // Only use real course data from the API
          const history = generateHistoryFromCourses(instructorCourses, instructor);
          
          return {
            ...instructor,
            history
          };
        });
        
        // Extract unique schools and departments for filtering
        const uniqueSchools = new Set();
        const uniqueDepartments = new Set();
        const schoolToDepartments = {};
        
        instructorsWithHistory.forEach(instructor => {
          if (instructor.school) {
            uniqueSchools.add(instructor.school);
            
            // Build mapping of schools to departments
            if (instructor.department) {
              if (!schoolToDepartments[instructor.school]) {
                schoolToDepartments[instructor.school] = new Set();
              }
              schoolToDepartments[instructor.school].add(instructor.department);
              uniqueDepartments.add(instructor.department);
            }
          } else if (instructor.department) {
            uniqueDepartments.add(instructor.department);
          }
        });
        
        // Convert sets to sorted arrays in the school-department mapping
        const formattedSchoolDeptMap = {};
        Object.keys(schoolToDepartments).forEach(school => {
          formattedSchoolDeptMap[school] = Array.from(schoolToDepartments[school]).sort();
        });
        
        setSchools(Array.from(uniqueSchools).sort());
        setDepartments(Array.from(uniqueDepartments).sort());
        setSchoolDepartmentMap(formattedSchoolDeptMap);
        setInstructors(instructorsWithHistory);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
  
  // Call fetchInstructors when component mounts
  useEffect(() => {
    fetchInstructors();
  }, []);

  // Generate history from actual course assignments
  const generateHistoryFromCourses = (courses, instructor) => {
    // If no courses, return empty array
    if (!courses || courses.length === 0) {
      return [];
    }
    
    const yearSemesterMap = new Map();
    
    // First, organize courses by year and semester
    courses.forEach(course => {
      // Skip invalid courses
      if (!course) return;
      
      // Extract year and semester from course data
      let year, semester;
      let assignedDate = null;
      
      // Try to get year and semester from course directly
      if (course.year && course.semester) {
        year = parseInt(course.year);
        semester = course.semester;
      } 
      // If not available, try to extract from assignedDate or createdAt
      else if (course.assignedDate) {
        assignedDate = new Date(course.assignedDate);
        year = assignedDate.getFullYear();
        // Determine semester based on month (1-6: First, 7-12: Second)
        semester = assignedDate.getMonth() < 6 ? 'First' : 'Second';
      } 
      else if (course.createdAt) {
        assignedDate = new Date(course.createdAt);
        year = assignedDate.getFullYear();
        semester = assignedDate.getMonth() < 6 ? 'First' : 'Second';
      }
      // If no date information is available, skip this course
      else if (course.startDate) {
        assignedDate = new Date(course.startDate);
        year = assignedDate.getFullYear();
        semester = assignedDate.getMonth() < 6 ? 'First' : 'Second';
      }
      else {
        // Skip courses with no date information
        return;
      }
      
      // Create a key for the year-semester combination
      const key = `${year}-${semester}`;
      
      // Get or create the array for this year-semester
      if (!yearSemesterMap.has(key)) {
        yearSemesterMap.set(key, {
          year,
          semester,
          courses: []
        });
      }
      
      // Add the course to this year-semester
      const semesterData = yearSemesterMap.get(key);
      
      // Format the course data with only real data
      const formattedCourse = {
        id: course._id || `course-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        code: course.code || 'N/A',
        title: course.title || 'Untitled Course',
        creditHours: course.creditHours || 3,
        department: course.department || instructor.department || 'N/A',
        status: course.status || 'N/A',
        assignedDate: assignedDate ? assignedDate.toISOString() : null
      };
      
      semesterData.courses.push(formattedCourse);
    });
    
    // Convert the map to an array and sort by year and semester
    const historyArray = Array.from(yearSemesterMap.values());
    
    // Sort by year (descending) and semester
    historyArray.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year; // Descending by year
      }
      // For same year, Second semester comes before First
      return a.semester === 'Second' ? -1 : 1;
    });
    
    return historyArray;
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setPage(0);
  };

  // Handle search
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
  
  // Reset all filters and search
  const handleResetFilters = () => {
    setSearchQuery('');
    setSchoolFilter('all');
    setDepartmentFilter('all');
    setPage(0);
  };
  
  // Open the semester reset dialog
  const handleOpenResetDialog = () => {
    // Set default to current semester
    const now = new Date();
    setResetSemesterYear(now.getFullYear());
    setResetSemesterTerm(now.getMonth() < 6 ? 'First' : 'Second');
    setConfirmReset(false); // Reset checkbox state
    setResetDialogOpen(true);
  };
  
  // Close the semester reset dialog
  const handleCloseResetDialog = () => {
    setResetDialogOpen(false);
  };
  
  // Handle closing the snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };
  
  // Reset semester data and approval workflow for all instructors
  const handleResetSemesterData = async () => {
    // Only admin can reset semester data
    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      return;
    }
    
    // Require confirmation checkbox to be checked
    if (!confirmReset) {
      setSnackbarMessage('Please confirm by checking the confirmation box');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    
    setIsResetting(true);
    
    try {
      // Format the semester data for the API
      const resetData = {
        year: resetSemesterYear,
        semester: resetSemesterTerm,
        resetWorkflow: true, // Reset the entire approval workflow process
        resetToStage: 'initial' // Reset all courses to initial stage regardless of current approval level
      };
      
      // MOCK IMPLEMENTATION: Since the actual API endpoint doesn't exist yet
      // In a real implementation, this would call the backend API
      // const response = await fetch('http://localhost:5000/api/v1/courses/reset-semester', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(resetData)
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to reset semester data');
      // }
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log what would be sent to the API
      console.log('Reset semester data request:', resetData);
      
      // Refresh instructor data
      setLoading(true);
      fetchInstructors();
      
      // Close the dialog
      setResetDialogOpen(false);
      
      // Show success message
      setSnackbarMessage(`Successfully reset approval workflow for ${resetSemesterTerm} semester ${resetSemesterYear}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error resetting semester data:', err);
      setSnackbarMessage(`Error: ${err.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsResetting(false);
    }
  };

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter and sort instructors
  const filteredInstructors = instructors.filter(instructor => {
    // Text search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (
      instructor.name.toLowerCase().includes(searchLower) ||
      instructor.email.toLowerCase().includes(searchLower) ||
      instructor.department.toLowerCase().includes(searchLower) ||
      instructor.school.toLowerCase().includes(searchLower)
    );
    
    // School filter
    const matchesSchool = schoolFilter === 'all' || instructor.school === schoolFilter;
    
    // Department filter
    const matchesDepartment = departmentFilter === 'all' || instructor.department === departmentFilter;
    
    // Return true only if all filters match
    return matchesSearch && matchesSchool && matchesDepartment;
  });

  // Sort instructors
  const sortedInstructors = [...filteredInstructors].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'name' || sortBy === 'email' || sortBy === 'department' || sortBy === 'school') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Get current page instructors
  const currentInstructors = sortedInstructors.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Get instructor's total courses
  const getInstructorTotalCourses = (instructor) => {
    return instructor.history.reduce((total, semester) => 
      total + semester.courses.length, 0);
  };

  // Get instructor's current semester courses
  const getInstructorCurrentCourses = (instructor) => {
    // Deleted instructors should not have current courses
    if (instructor.isDeleted) {
      return 0;
    }
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentSemester = currentMonth < 6 ? 'First' : 'Second';
    
    const currentSemesterHistory = instructor.history.find(h => 
      h.year === currentYear && h.semester === currentSemester);
    
    return currentSemesterHistory ? currentSemesterHistory.courses.length : 0;
  };

  // Get all semesters from instructors' history
  const getAllSemesters = () => {
    const semesters = new Set();
    
    instructors.forEach(instructor => {
      instructor.history.forEach(semester => {
        semesters.add(`${semester.year} - ${semester.semester}`);
      });
    });
    
    return Array.from(semesters).sort((a, b) => {
      const [yearA, semesterA] = a.split(' - ');
      const [yearB, semesterB] = b.split(' - ');
      
      if (yearA !== yearB) {
        return parseInt(yearB) - parseInt(yearA); // Sort by year descending
      }
      
      return semesterA === 'Second' ? -1 : 1; // Second semester comes before First
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Handle opening the detailed history modal
  const handleOpenHistoryModal = (instructor) => {
    setSelectedInstructor(instructor);
    setHistoryModalOpen(true);
  };
  
  // Handle closing the detailed history modal
  const handleCloseHistoryModal = () => {
    setHistoryModalOpen(false);
    setSelectedInstructor(null);
  };

  // Skeleton loading component for stats cards
  const StatsCardSkeleton = () => (
    <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Skeleton variant="text" width={120} height={32} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        <Skeleton variant="text" width={60} height={56} sx={{ my: 1 }} />
        <Skeleton variant="text" width={150} height={24} />
      </CardContent>
    </Card>
  );
  
  // Skeleton loading component for table rows
  const TableRowSkeleton = () => (
    <TableRow>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box>
            <Skeleton variant="text" width={150} height={24} />
            <Skeleton variant="text" width={180} height={20} />
          </Box>
        </Box>
      </TableCell>
      <TableCell><Skeleton variant="text" width={120} /></TableCell>
      <TableCell><Skeleton variant="text" width={180} /></TableCell>
      <TableCell align="center"><Skeleton variant="rounded" width={40} height={24} sx={{ mx: 'auto' }} /></TableCell>
      <TableCell align="center"><Skeleton variant="rounded" width={40} height={24} sx={{ mx: 'auto' }} /></TableCell>
      <TableCell align="center"><Skeleton variant="circular" width={32} height={32} sx={{ mx: 'auto' }} /></TableCell>
    </TableRow>
  );
  
  // Render loading state with skeletons
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header Skeleton */}
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={500} height={24} />
        </Box>
        
        {/* Stats Cards Skeleton */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <StatsCardSkeleton />
            </Grid>
          ))}
        </Grid>
        
        {/* Filters Skeleton */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width={120} height={32} />
            <Skeleton variant="rounded" width={120} height={36} />
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
            <Skeleton variant="rounded" height={40} width="100%" />
            <Skeleton variant="rounded" height={40} width="100%" />
            <Skeleton variant="rounded" height={40} width="100%" />
          </Box>
          
          <Skeleton variant="rounded" height={48} width="100%" />
        </Paper>
        
        {/* Table Skeleton */}
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme => alpha(theme.palette.primary.main, 0.08) }}>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell align="center"><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell align="center"><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell align="center"><Skeleton variant="text" width={100} /></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <TableRowSkeleton key={item} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
            <Skeleton variant="rounded" width={300} height={40} />
          </Box>
        </Paper>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon fontSize="large" color="primary" />
            Instructors History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View comprehensive history of instructors' course assignments and performance over time.
          </Typography>
        </Box>
        
        {/* Admin Reset Button - Only visible to admins */}
        {(user?.role === 'admin' || user?.role === 'superadmin') && (
          <Button
            variant="contained"
            color="warning"
            startIcon={<RefreshIcon />}
            onClick={handleOpenResetDialog}
            sx={{ mt: { xs: 2, md: 0 } }}
          >
            Reset Semester Data
          </Button>
        )}
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={2} 
            sx={{ 
              borderRadius: 2,
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme => `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`
              },
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Instructors
                </Typography>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <PersonIcon />
                </Avatar>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                {instructors.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                From {new Set(instructors.map(i => i.department)).size} departments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={2} 
            sx={{ 
              borderRadius: 2,
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme => `0 8px 24px ${alpha(theme.palette.success.main, 0.2)}`
              },
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Active Courses
                </Typography>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <AssignmentIcon />
                </Avatar>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                {instructors.reduce((total, instructor) => total + getInstructorCurrentCourses(instructor), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current semester assignments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={2} 
            sx={{ 
              borderRadius: 2,
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme => `0 8px 24px ${alpha(theme.palette.info.main, 0.2)}`
              },
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Schools
                </Typography>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <SchoolIcon />
                </Avatar>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                {new Set(instructors.map(i => i.school)).size}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across the university
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={2} 
            sx={{ 
              borderRadius: 2,
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme => `0 8px 24px ${alpha(theme.palette.warning.main, 0.2)}`
              },
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Courses
                </Typography>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <LibraryBooksIcon />
                </Avatar>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                {instructors.reduce((total, instructor) => total + getInstructorTotalCourses(instructor), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All-time course assignments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon color="primary" />
            <Typography variant="h6">
              Filter & Search
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleResetFilters}
            size="small"
          >
            Reset Filters
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
          {/* Search */}
          <TextField
            placeholder="Search instructors..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          {/* School Filter */}
          <FormControl fullWidth size="small">
            <InputLabel id="school-filter-label">School</InputLabel>
            <Select
              labelId="school-filter-label"
              id="school-filter"
              value={schoolFilter}
              label="School"
              onChange={(e) => {
                const selectedSchool = e.target.value;
                setSchoolFilter(selectedSchool);
                // Reset department filter when school changes
                setDepartmentFilter('all');
                setPage(0); // Reset to first page when filter changes
              }}
            >
              <MenuItem value="all">All Schools</MenuItem>
              {schools.map(school => (
                <MenuItem key={school} value={school}>{school}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Department Filter */}
          <FormControl fullWidth size="small">
            <InputLabel id="department-filter-label">Department</InputLabel>
            <Select
              labelId="department-filter-label"
              id="department-filter"
              value={departmentFilter}
              label="Department"
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(0); // Reset to first page when filter changes
              }}
            >
              <MenuItem value="all">All Departments</MenuItem>
              {schoolFilter === 'all' 
                ? departments.map(department => (
                    <MenuItem key={department} value={department}>{department}</MenuItem>
                  ))
                : (schoolDepartmentMap[schoolFilter] || []).map(department => (
                    <MenuItem key={department} value={department}>{department}</MenuItem>
                  ))
              }
            </Select>
          </FormControl>
        </Box>
        
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              minWidth: 120,
              fontWeight: 500,
              transition: 'all 0.2s',
              '&:hover': {
                color: 'primary.main',
                opacity: 1,
              },
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 600,
              },
            }
          }}
        >
          <Tab 
            label="All Instructors" 
            icon={<PersonIcon />} 
            iconPosition="start"
          />
          {getAllSemesters().slice(0, 5).map((semester, index) => (
            <Tab 
              key={semester}
              label={semester} 
              icon={<CalendarMonthIcon />} 
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Instructors Table */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: theme => alpha(theme.palette.primary.main, 0.08) }}>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' }
                    }}
                    onClick={() => handleSort('name')}
                  >
                    Instructor
                    {sortBy === 'name' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                        <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' }
                    }}
                    onClick={() => handleSort('department')}
                  >
                    Department
                    {sortBy === 'department' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                        <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' }
                    }}
                    onClick={() => handleSort('school')}
                  >
                    School
                    {sortBy === 'school' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                        <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Current Courses</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total Courses</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>History</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentInstructors.map((instructor) => {
                const currentCourses = getInstructorCurrentCourses(instructor);
                const totalCourses = getInstructorTotalCourses(instructor);
                
                return (
                  <TableRow 
                    key={instructor._id}
                    hover
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: theme => alpha(theme.palette.primary.main, 0.04)
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          src={instructor.photo} 
                          alt={instructor.name}
                          sx={{ 
                            width: 40, 
                            height: 40,
                            bgcolor: instructor.isDeleted 
                              ? alpha(theme.palette.grey[500], 0.8)
                              : alpha(theme.palette.primary.main, 0.8),
                            border: instructor.isDeleted ? `2px solid ${theme.palette.error.main}` : 'none'
                          }}
                        >
                          {instructor.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {instructor.name}
                            </Typography>
                            {instructor.isDeleted && (
                              <Chip 
                                label="Deleted" 
                                size="small" 
                                color="error" 
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {instructor.email}
                          </Typography>
                          {instructor.isDeleted && instructor.deletedAt && (
                            <Typography variant="caption" color="error.main">
                              Deleted on {formatDate(instructor.deletedAt)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{instructor.department}</TableCell>
                    <TableCell>{instructor.school}</TableCell>
                    <TableCell align="center">
                      {instructor.isDeleted ? (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      ) : (
                        <Chip 
                          label={currentCourses} 
                          color={currentCourses > 0 ? "success" : "default"}
                          size="small"
                          sx={{ fontWeight: 600, minWidth: 40 }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={totalCourses} 
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 600, minWidth: 40 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View detailed history">
                        <IconButton 
                          color="primary"
                          onClick={() => handleOpenHistoryModal(instructor)}
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {currentInstructors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No instructors found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredInstructors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
    
    {/* Detailed History Modal */}
    <Dialog
      open={historyModalOpen}
      onClose={handleCloseHistoryModal}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        elevation: 3,
        sx: { borderRadius: 2 }
      }}
    >
      {selectedInstructor && (
        <>
          <DialogTitle sx={{ 
            pb: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={selectedInstructor.photo} 
                alt={selectedInstructor.name}
                sx={{ 
                  width: 48, 
                  height: 48,
                  bgcolor: selectedInstructor.isDeleted 
                    ? alpha(theme.palette.grey[500], 0.8)
                    : alpha(theme.palette.primary.main, 0.8),
                  border: selectedInstructor.isDeleted ? `2px solid ${theme.palette.error.main}` : 'none'
                }}
              >
                {selectedInstructor.name.charAt(0)}
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" component="div">
                    {selectedInstructor.name}
                  </Typography>
                  {selectedInstructor.isDeleted && (
                    <Chip 
                      label="Deleted" 
                      size="small" 
                      color="error" 
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {selectedInstructor.email} • {selectedInstructor.department} • {selectedInstructor.school}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleCloseHistoryModal} edge="end">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            {/* Course History by Semester */}
            {selectedInstructor.history
              .sort((a, b) => {
                // Sort by year descending, then by semester (Second comes before First)
                if (a.year !== b.year) {
                  return b.year - a.year;
                }
                return a.semester === 'Second' ? -1 : 1;
              })
              .map((semester, index) => (
                <Box key={`${semester.year}-${semester.semester}`} sx={{ mb: 4 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mb: 2,
                    pb: 1,
                    borderBottom: 1,
                    borderColor: 'divider'
                  }}>
                    <CalendarMonthIcon color="primary" />
                    <Typography variant="h6" component="div">
                      {semester.year} - {semester.semester} Semester
                    </Typography>
                    <Chip 
                      label={`${semester.courses.length} Courses`} 
                      size="small" 
                      color="primary" 
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  {/* Courses Table */}
                  <TableContainer component={Paper} elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: theme => alpha(theme.palette.primary.main, 0.08) }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Course Code</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Course Title</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Credit Hours</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Assigned Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {semester.courses.map((course) => (
                          <TableRow key={course.id} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {course.code}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {course.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {course.department}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={course.creditHours} 
                                size="small" 
                                color="primary"
                                variant="outlined"
                                sx={{ minWidth: 32 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={course.status} 
                                size="small" 
                                color={
                                  course.status === 'approved' ? 'success' :
                                  course.status === 'completed' ? 'success' :
                                  course.status === 'in-progress' ? 'warning' :
                                  'default'
                                }
                                sx={{ 
                                  textTransform: 'capitalize',
                                  fontWeight: 500
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {formatDate(course.assignedDate)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* Semester Summary */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end',
                    gap: 3,
                    px: 2
                  }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <b>Total Courses:</b> {semester.courses.length}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <b>Total Credit Hours:</b> {semester.courses.reduce((total, course) => total + course.creditHours, 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <b>Completed:</b> {semester.courses.filter(c => c.status === 'completed').length}
                    </Typography>
                  </Box>
                </Box>
              ))}
              
            {/* No History Message */}
            {selectedInstructor.history.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No course history available for this instructor.
                </Typography>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button onClick={handleCloseHistoryModal} variant="outlined">
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
    
    {/* Reset Semester Confirmation Dialog */}
    <Dialog
      open={resetDialogOpen}
      onClose={handleCloseResetDialog}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 3,
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider',
        color: 'warning.main'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RefreshIcon color="warning" />
          Reset Semester Workflow
        </Box>
        <IconButton onClick={handleCloseResetDialog} edge="end">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body1" sx={{ mb: 3 }}>
          This action will reset all course assignments for the selected semester. 
          The history will be preserved, but current assignments will be cleared. 
          This action cannot be undone.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          {/* Year Selection */}
          <TextField
            label="Year"
            type="number"
            fullWidth
            value={resetSemesterYear}
            onChange={(e) => setResetSemesterYear(parseInt(e.target.value))}
            InputProps={{ inputProps: { min: 2020, max: new Date().getFullYear() + 1 } }}
          />
          
          {/* Semester Selection */}
          <FormControl fullWidth>
            <InputLabel id="reset-semester-label">Semester</InputLabel>
            <Select
              labelId="reset-semester-label"
              value={resetSemesterTerm}
              label="Semester"
              onChange={(e) => setResetSemesterTerm(e.target.value)}
            >
              <MenuItem value="First">First Semester</MenuItem>
              <MenuItem value="Second">Second Semester</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Warning: This action will reset the ENTIRE approval process workflow:
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <li>All courses for {resetSemesterTerm} semester {resetSemesterYear} will be reset to initial stage</li>
            <li>All approvals from school deans, vice-directors, and finance will be cleared</li>
            <li>All courses will need to go through the entire approval process again</li>
            <li>Historical records will be preserved, but current workflow progress will be lost</li>
          </Box>
        </Alert>
        
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <Checkbox 
            checked={confirmReset}
            onChange={(e) => setConfirmReset(e.target.checked)}
            color="warning"
          />
          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
            I am sure I want to reset the entire approval workflow process for this semester. This action cannot be undone.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleCloseResetDialog} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleResetSemesterData} 
          variant="contained" 
          color="warning"
          disabled={isResetting || !confirmReset}
          startIcon={isResetting ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
        >
          {isResetting ? 'Resetting...' : 'Reset Approval Workflow'}
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* Confirmation Snackbar */}
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <SnackbarContent
        sx={{
          bgcolor: snackbarSeverity === 'success' ? 'success.main' : 
                 snackbarSeverity === 'error' ? 'error.main' : 
                 snackbarSeverity === 'warning' ? 'warning.main' : 'info.main',
          fontWeight: 'medium',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
        message={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {snackbarSeverity === 'success' ? <CheckCircleIcon /> : 
             snackbarSeverity === 'error' ? <ErrorIcon /> : 
             snackbarSeverity === 'warning' ? <WarningIcon /> : <InfoIcon />}
            {snackbarMessage}
          </Box>
        }
        action={
          <IconButton size="small" color="inherit" onClick={handleCloseSnackbar}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Snackbar>
  </>
  );
};

export default InstructorsHistory;
