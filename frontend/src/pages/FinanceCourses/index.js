import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { 
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Fade,
  Alert,
  Collapse,
  Divider,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  alpha
} from '@mui/material';
import {
  Check as ApproveIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as RejectIcon,
  Calculate as CalculateIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  WarningAmber as WarningAmberIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { baseURL } from '../../config';

const FinanceCourses = () => {
  const [courses, setCourses] = useState([]);
  const [instructorHours, setInstructorHours] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [viewPaymentDialogOpen, setViewPaymentDialogOpen] = useState(false);
  const [expandedInstructor, setExpandedInstructor] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    type: '',
    reason: '',
    confirmChecked: false
  });

  const handleReasonChange = (event) => {
    setConfirmDialog(prev => ({
      ...prev,
      reason: event.target.value
    }));
  };
  const [paymentDetails, setPaymentDetails] = useState({
    baseAmount: '',
    hdpAllowance: '0',
    positionAllowance: '0',
    branchAdvisorAllowance: '0',
    overloadHours: '0',
    remarks: ''
  });
  const { enqueueSnackbar } = useSnackbar();

  const handleConfirmDialogClose = () => {
    setConfirmDialog({
      open: false,
      title: '',
      message: '',
      onConfirm: null,
      type: '',
      reason: '',
      confirmChecked: false
    });
  };

  // Extract unique schools and departments from courses
  useEffect(() => {
    if (courses.length > 0) {
      const uniqueSchools = [...new Set(courses.map(course => course.school))];
      setSchools(uniqueSchools);

      // Reset department filter when changing schools
      if (filterSchool === 'all') {
        const allDepartments = [...new Set(courses.map(course => course.department))];
        setDepartments(allDepartments);
      } else {
        const schoolDepartments = [...new Set(
          courses
            .filter(course => course.school === filterSchool)
            .map(course => course.department)
        )];
        setDepartments(schoolDepartments);
        // Reset department filter if current department is not in the new school
        if (!schoolDepartments.includes(filterDepartment)) {
          setFilterDepartment('all');
        }
      }
    }
  }, [courses, filterSchool]);

  // Filter and search logic
  const filteredCourses = useMemo(() => {
    return courses
      .filter(course => {
        const matchesSearch = searchTerm === '' || 
          course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.instructor?.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
        const matchesSchool = filterSchool === 'all' || course.school === filterSchool;
        const matchesDepartment = filterDepartment === 'all' || course.department === filterDepartment;

        return matchesSearch && matchesStatus && matchesSchool && matchesDepartment;
      })
      .sort((a, b) => {
        // Define priority order for statuses
        const statusPriority = {
          'scientific-director-approved': 1, // Pending review for finance
          'finance-review': 1, // In review
          'finance-approved': 2,
          'finance-rejected': 2,
          'pending': 3,
          'default': 4
        };

        // Get priority for each status, default to lowest priority if status not found
        const priorityA = statusPriority[a.status] || statusPriority.default;
        const priorityB = statusPriority[b.status] || statusPriority.default;

        // Sort by priority first
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // If same priority, sort by date (assuming newer items should be first)
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      });
  }, [courses, searchTerm, filterStatus, filterSchool, filterDepartment]);



  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch courses first
      const coursesResponse = await fetch(`${baseURL}/api/v1/finance/courses?populate=instructor`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!coursesResponse.ok) {
        throw new Error('Failed to fetch courses');
      }

      const coursesData = await coursesResponse.json();
      const courses = coursesData.data?.courses || [];

      // Get unique instructor IDs
      const instructorIds = [...new Set(courses
        .filter(course => course.instructor?._id)
        .map(course => course.instructor._id)
      )];

      // Fetch hours for all instructors in parallel
      const instructorHoursMap = {};
      await Promise.all(
        instructorIds.map(async (instructorId) => {
          try {
            const hoursResponse = await fetch(`${baseURL}/api/v1/users/${instructorId}/hours`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (hoursResponse.ok) {
              const hoursData = await hoursResponse.json();
              if (hoursData.status === 'success' && hoursData.data) {
                instructorHoursMap[instructorId] = {
                  hdpHour: Number(hoursData.data.hdpHour || 0),
                  positionHour: Number(hoursData.data.positionHour || 0),
                  batchAdvisor: Number(hoursData.data.batchAdvisor || 0)
                };
              }
            }
          } catch (error) {
            console.error('Error fetching hours for instructor:', instructorId, error);
          }
        })
      );

      setInstructorHours(instructorHoursMap);
      setCourses(courses);
    } catch (error) {
      console.error('Error:', error);
      enqueueSnackbar('Failed to fetch courses', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handlePaymentCalculation = (course) => {
    setSelectedCourse(course);
    // Get instructor hours
    const instructorId = course.instructor?._id;
   
    const hours = instructorHours[instructorId] || {
      hdpHour: 0,
      positionHour: 0,
      batchAdvisor: 0
    };

    // If there's existing payment data, load it
    if (course.payment) {
      setPaymentDetails({
        baseAmount: course.payment.baseAmount.toString(),
        hdpAllowance: course.payment.additionalPayments.hdpAllowance.toString(),
        positionAllowance: course.payment.additionalPayments.positionAllowance.toString(),
        branchAdvisorAllowance: course.payment.additionalPayments.branchAdvisorAllowance.toString(),
        overloadHours: course.payment.additionalPayments.overloadHours.toString(),
        remarks: course.payment.remarks || ''
      });
    } else {
      // Set initial values based on instructor hours
      setPaymentDetails({
        baseAmount: '',
        hdpAllowance: hours.hdpHour.toString(),
        positionAllowance: hours.positionHour.toString(),
        branchAdvisorAllowance: hours.batchAdvisor.toString(),
        overloadHours: '0',
        remarks: ''
      });
    }
    setPaymentDialogOpen(true);
  };

  const handleViewPayment = (course) => {
    setSelectedCourse(course);
    setViewPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/finance/courses/${selectedCourse._id}/payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...paymentDetails,
            academicYear: new Date().getFullYear().toString(),
            semester: 'First' // You might want to make this dynamic
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit payment details');
      }

      enqueueSnackbar('Payment details saved successfully', { variant: 'success' });
      setPaymentDialogOpen(false);
      fetchCourses(); // Refresh the course list
    } catch (error) {
      console.error('Error submitting payment:', error);
      enqueueSnackbar('Failed to save payment details', { variant: 'error' });
    }
  };

  const handleReviewSubmit = async (courseId, status, reason = '') => {
    try {
      
      const response = await fetch(
        `${baseURL}/api/v1/finance/courses/${courseId}/review`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            status: status === 'approved' ? 'finance-approved' : 'finance-rejected',
            remarks: reason || 'Course reviewed by finance department'
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update course status');
      }

      const data = await response.json();
      

      if (data.status !== 'success') {
        throw new Error(data.message || 'Failed to update course status');
      }

      return true; // Return success
    } catch (error) {
      console.error('Error updating course:', error);
      throw error; // Re-throw to handle in bulk update
    }
  };

  const handleBulkReviewSubmit = async (instructorId, courses, status, reason = '') => {
    try {
      setLoadingStates(prev => ({ ...prev, [instructorId]: true }));

      const results = await Promise.allSettled(
        courses.map(course => handleReviewSubmit(course._id, status, reason))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        const message = status === 'approved' ?
          `✅ Payment approved for ${successful} courses. Instructors will be notified.` :
          `❌ Payment rejected for ${successful} courses. Scientific director will be notified.`;
        enqueueSnackbar(message, { 
          variant: 'success',
          autoHideDuration: 4000,
          
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
      }
      if (failed > 0) {
        enqueueSnackbar(`⚠️ Failed to process ${failed} courses. Please try again.`, { 
          variant: 'error',
          autoHideDuration: 5000
        });
      }

      // Refresh the course list and reset loading state
      await fetchCourses();
    } catch (error) {
      console.error('Error in bulk update:', error);
      enqueueSnackbar('❌ System error: Failed to process courses', { variant: 'error' });
    } finally {
      setLoadingStates(prev => ({ ...prev, [instructorId]: false }));
    }
  };

  const calculateTotalPayment = () => {
    const base = parseFloat(paymentDetails.baseAmount) || 0;
    const hdp = parseFloat(paymentDetails.hdpAllowance) || 0;
    const position = parseFloat(paymentDetails.positionAllowance) || 0;
    const advisor = parseFloat(paymentDetails.branchAdvisorAllowance) || 0;
    const overload = parseFloat(paymentDetails.overloadHours) || 0;
    return base + hdp + position + advisor + overload;
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'scientific-director-approved':
        return 'info';
      case 'finance-review':
        return 'warning';
      case 'finance-approved':
        return 'success';
      case 'finance-rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount);
  };

  // Group courses by instructor
  const coursesByInstructor = filteredCourses.reduce((acc, course) => {
    const instructorId = course.instructor?._id || 'unassigned';
    const instructorName = course.instructor?.name || 'Unassigned';
    if (!acc[instructorId]) {
      acc[instructorId] = {
        instructor: {
          name: instructorName,
          department: course.department || 'N/A',
          school: course.school || 'N/A'
        },
        courses: []
      };
    }
    acc[instructorId].courses.push(course);
    return acc;
  }, {});

  // Get paginated instructors
  const instructorEntries = Object.entries(coursesByInstructor);
  const totalInstructors = instructorEntries.length;
  const paginatedInstructors = instructorEntries
    .slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: { xs: 2, sm: 3, md: 4 }, 
        px: { xs: 1.5, sm: 2, md: 3 },
      }}
    >
      <Fade in={true} timeout={800}>
        <Box>
          <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
              sx={{ 
                mb: 2,
                pb: 2,
                borderBottom: 1,
                borderColor: 'divider'
              }}
            >
              <CalculateIcon 
                sx={{ 
                  fontSize: { xs: 24, sm: 30, md: 36 },
                  background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  borderRadius: '50%',
                  padding: 1,
                  color: 'white',
                  boxShadow: 2
                }} 
              />
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 600,
                  color: (theme) => theme.palette.grey[800],
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}
              >
                Course Management
              </Typography>
            </Stack>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                maxWidth: 'md', 
                mb: { xs: 2, sm: 3 },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Manage and review course assignments, credit hours, and approvals for all instructors
            </Typography>

        {/* Search and Filter Bar */}
        <Paper 
          sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            mb: { xs: 2, sm: 3 },
            borderRadius: 2,
            boxShadow: theme => theme.shadows[isMobile ? 1 : 2],
            transition: 'box-shadow 0.3s ease',
            '&:hover': {
              boxShadow: theme => theme.shadows[isMobile ? 2 : 3]
            }
          }} 
          elevation={1}
        >
          <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder={isMobile ? "Search courses..." : "Search by course code, title, or instructor..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  )
                }}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme => theme.palette.primary.light,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                  sx={{
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme => theme.palette.primary.light,
                    },
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="scientific-director-approved">Pending Review</MenuItem>
                  <MenuItem value="finance-approved">Approved</MenuItem>
                  <MenuItem value="finance-rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={6} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>School</InputLabel>
                <Select
                  value={filterSchool}
                  onChange={(e) => {
                    setFilterSchool(e.target.value);
                    setFilterDepartment('all'); // Reset department when school changes
                  }}
                  label="School"
                  sx={{
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme => theme.palette.primary.light,
                    },
                  }}
                >
                  <MenuItem value="all">All Schools</MenuItem>
                  {schools.map(school => (
                    <MenuItem key={school} value={school}>{school}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={6} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  label="Department"
                  sx={{
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme => theme.palette.primary.light,
                    },
                  }}
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={0.5} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Tooltip title="Reset Filters">
                <IconButton
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterSchool('all');
                    setFilterDepartment('all');
                  }}
                  size="small"
                >
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      
      {loading ? (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Stack spacing={2}>
            {[...Array(3)].map((_, index) => (
              <Box key={index}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="20%" />
                  </Box>
                </Stack>
                <Skeleton variant="rectangular" height={60} />
              </Box>
            ))}
          </Stack>
        </Paper>
      ) : courses.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No courses available for review
        </Alert>
      ) : (
        <Paper elevation={1} sx={{ mt: 2 }}>
          <TableContainer>
            <Table size="medium" sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Instructor</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>School</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Total Load</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Total Courses</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInstructors.map(([instructorId, { instructor, courses }]) => (
                <React.Fragment key={instructorId}>
                  <TableRow
                    hover
                    onClick={() => setExpandedInstructor(expandedInstructor === instructorId ? null : instructorId)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: expandedInstructor === instructorId ? (theme) => alpha(theme.palette.primary.main, 0.05) : 'inherit',
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05)
                      },
                      transition: 'background-color 0.2s ease',
                      '& td': {
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                        padding: { xs: '8px 6px', sm: '16px' }
                      }
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '12px',
                            backgroundColor: (theme) => theme.palette.primary.lighter,
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          <PersonIcon 
                            color="primary" 
                            sx={{ fontSize: '1.5rem' }}
                          />
                        </Box>
                        <Typography 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '1rem',
                            color: (theme) => theme.palette.grey[800]
                          }}
                        >
                          {instructor.name}
                        </Typography>
                        <IconButton
                          size="medium"
                          sx={{
                            ml: 'auto',
                            width: 36,
                            height: 36,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: (theme) => theme.palette.primary.lighter,
                              transform: 'scale(1.1)'
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedInstructor(expandedInstructor === instructorId ? null : instructorId);
                          }}
                        >
                          <ExpandMoreIcon
                            sx={{
                              transform: expandedInstructor === instructorId ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s'
                            }}
                          />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    {!isMobile && (
                      <>
                        <TableCell>{instructor.school}</TableCell>
                        <TableCell>{instructor.department || 'N/A'}</TableCell>
                      </>
                    )}
                    <TableCell>
                      {(() => {
                        // Calculate course load
                        const courseLoad = courses.reduce((total, course) => {
                          const lectureLoad = (course.Hourfor?.lecture || 0) * (course.Number_of_Sections?.lecture || 0);
                          const labLoad = (course.Hourfor?.lab || 0) * (course.Number_of_Sections?.lab || 0);
                          const tutorialLoad = (course.Hourfor?.tutorial || 0) * (course.Number_of_Sections?.tutorial || 0);
                          return total + lectureLoad + labLoad + tutorialLoad;
                        }, 0);

                        // Get additional hours
                        const hdpHours = instructorHours[instructorId]?.hdpHour || 0;
                        const positionHours = instructorHours[instructorId]?.positionHour || 0;
                        const batchAdvisorHours = instructorHours[instructorId]?.batchAdvisor || 0;

                        // Calculate total load
                        const totalLoad = courseLoad + hdpHours + positionHours + batchAdvisorHours;

                        return (
                          <Tooltip 
                            title={
                              <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" sx={{ color: 'grey.100', mb: 1 }}>Load Breakdown</Typography>
                                <Stack spacing={0.5}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'grey.300' }}>Course Load:</Typography>
                                    <Typography variant="body2" sx={{ color: 'primary.light' }}>{courseLoad}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'grey.300' }}>HDP Hours:</Typography>
                                    <Typography variant="body2" sx={{ color: 'secondary.light' }}>{hdpHours}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'grey.300' }}>Position Hours:</Typography>
                                    <Typography variant="body2" sx={{ color: 'info.light' }}>{positionHours}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'grey.300' }}>Batch Advisor:</Typography>
                                    <Typography variant="body2" sx={{ color: 'warning.light' }}>{batchAdvisorHours}</Typography>
                                  </Box>
                                  <Divider sx={{ my: 1, borderColor: 'grey.700' }} />
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                    <Typography variant="subtitle2" sx={{ color: 'grey.100' }}>Total Load:</Typography>
                                    <Typography variant="subtitle2" sx={{ color: 'success.light' }}>{totalLoad}</Typography>
                                  </Box>
                                </Stack>
                              </Box>
                            }
                            arrow
                            placement="right"
                            componentsProps={{
                              tooltip: {
                                sx: {
                                  bgcolor: 'grey.900',
                                  '& .MuiTooltip-arrow': {
                                    color: 'grey.900'
                                  }
                                }
                              }
                            }}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              gap: 0.5,
                              cursor: 'help'
                            }}>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>{totalLoad}</Typography>
                              <InfoIcon sx={{ 
                                fontSize: '1rem', 
                                color: 'primary.main',
                                opacity: 0.8,
                                transition: 'opacity 0.2s',
                                '&:hover': {
                                  opacity: 1
                                }
                              }} />
                            </Box>
                          </Tooltip>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${courses.length} Course${courses.length !== 1 ? 's' : ''}`}
                        color="primary"
                        size="medium"
                        sx={{
                          borderRadius: '10px',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          py: 0.5,
                          '& .MuiChip-label': {
                            px: 2
                          },
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {courses.some(course => course.status === 'scientific-director-approved') ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            disabled={loadingStates[instructorId]}
                            startIcon={
                              loadingStates[instructorId] ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <ApproveIcon sx={{ fontSize: '0.875rem' }} />
                              )
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDialog({
                                open: true,
                                type: 'accept',
                                title: '🔔 Payment Approval Confirmation',
                                message: (
                                  `Are you sure you want to approve payment for ${courses.filter(c => c.status === 'scientific-director-approved').length} courses from ${instructor.name}?

` +
                                  `This action will:
` +
                                  `• Process payment for all selected courses
` +
                                  `• Notify the instructor
` +
                                  `• Update course status to finance-approved
` +
                                  `
Please confirm to proceed.`
                                ),
                                reason: '',
                                onConfirm: async () => {
                                  const coursesToApprove = courses.filter(c => c.status === 'scientific-director-approved');
                                  await handleBulkReviewSubmit(instructorId, coursesToApprove, 'approved');
                                  setConfirmDialog({ ...confirmDialog, open: false });
                                }
                              });
                            }}
                            sx={{
                              borderRadius: '6px',
                              textTransform: 'none',
                              fontWeight: 600,
                              px: 1.25,
                              py: 0.375,
                              fontSize: '0.75rem',
                              minHeight: 0,
                              minWidth: 0,
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                              }
                            }}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outlined"
                            color="warning"
                            size="small"
                            startIcon={<RejectIcon sx={{ fontSize: '0.875rem' }} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDialog({
                                open: true,
                                type: 'return',
                                title: '⚠️ Return to Scientific Director',
                                message: (
                                  `Are you sure you want to return ${courses.filter(c => c.status === 'scientific-director-approved').length} courses from ${instructor.name} to the Scientific Director?

` +
                                  `This action will:
` +
                                  `• Return courses for further review
` +
                                  `• Notify the Scientific Director
` +
                                  `• Update course status to pending review
` +
                                  `
Please provide a detailed reason for returning these courses:`
                                ),
                                reason: '',
                                onConfirm: async (reason) => {
                                  if (!reason?.trim()) {
                                    enqueueSnackbar('⚠️ Please provide a reason for returning the courses', { 
                                      variant: 'warning',
                                      autoHideDuration: 3000
                                    });
                                    return;
                                  }
                                  const coursesToReturn = courses.filter(c => c.status === 'scientific-director-approved');
                                  await handleBulkReviewSubmit(instructorId, coursesToReturn, 'rejected', reason);
                                  handleConfirmDialogClose();
                                }
                              });
                            }}
                            sx={{
                              borderRadius: '6px',
                              textTransform: 'none',
                              fontWeight: 600,
                              px: 1.25,
                              py: 0.375,
                              fontSize: '0.75rem',
                              minHeight: 0,
                              minWidth: 0,
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                              }
                            }}
                          >
                            Return to Review
                          </Button>
                        </Stack>
                      ) : courses.every(course => course.status === 'finance-approved') ? (
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'success.main',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            fontWeight: 600
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: '1rem' }} />
                          Payment Approved
                        </Typography>
                      ) : courses.every(course => course.status === 'finance-rejected') ? (
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'error.main',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            fontWeight: 600
                          }}
                        >
                          <CancelIcon sx={{ fontSize: '1rem' }} />
                          Payment Rejected
                        </Typography>
                      ) : null}
                    </TableCell>
                  </TableRow>
                  {expandedInstructor === instructorId && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ py: 0 }}>
                        <Collapse in={true} timeout="auto">
                          <Box>
                            {/* Instructor Hours Summary */}
                            <Box sx={{ 
                              p: { xs: 2, md: 3 },
                              bgcolor: 'background.paper',
                              borderRadius: 1,
                              mx: { xs: 1, md: 2 },
                              my: { xs: 1, md: 2 },
                              boxShadow: 1
                            }}>
                              <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'text.primary' }}>
                                Additional Hours
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Box sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                                    }
                                  }}>
                                    <Stack spacing={1} alignItems="center">
                                      <Typography variant="subtitle2" color="text.secondary">
                                        HDP Hours
                                      </Typography>
                                      <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                                        {instructorHours[instructorId]?.hdpHour || 0}
                                      </Typography>
                                    </Stack>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Box sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                                    }
                                  }}>
                                    <Stack spacing={1} alignItems="center">
                                      <Typography variant="subtitle2" color="text.secondary">
                                        Position Hours
                                      </Typography>
                                      <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 600 }}>
                                        {instructorHours[instructorId]?.positionHour || 0}
                                      </Typography>
                                    </Stack>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Box sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                                    }
                                  }}>
                                    <Stack spacing={1} alignItems="center">
                                      <Typography variant="subtitle2" color="text.secondary">
                                        Batch Advisor
                                      </Typography>
                                      <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
                                        {instructorHours[instructorId]?.batchAdvisor || 0}
                                      </Typography>
                                    </Stack>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Box sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                                    }
                                  }}>
                                    <Stack spacing={1} alignItems="center">
                                      <Typography variant="subtitle2" color="text.secondary">
                                        Total Hours
                                      </Typography>
                                      <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                                        {(instructorHours[instructorId]?.hdpHour || 0) + 
                                         (instructorHours[instructorId]?.positionHour || 0) + 
                                         (instructorHours[instructorId]?.batchAdvisor || 0)}
                                      </Typography>
                                    </Stack>
                                  </Box>
                                </Grid>
                              </Grid>
                              {/* Total Hours */}
                              {/* <Box sx={{ mt: 3 }}>
                                <Paper 
                                  elevation={3} 
                                  sx={{ 
                                    p: 3, 
                                    textAlign: 'center', 
                                    bgcolor: 'success.light',
                                    maxWidth: 300,
                                    mx: 'auto'
                                  }}
                                >
                                  <Typography variant="subtitle1" color="success.contrastText" gutterBottom>
                                    Total Additional Hours
                                  </Typography>
                                  <Typography variant="h3" color="success.contrastText">
                                    {(instructorHours[instructorId]?.hdpHour || 0) + 
                                     (instructorHours[instructorId]?.positionHour || 0) + 
                                     (instructorHours[instructorId]?.batchAdvisor || 0)}
                                  </Typography>
                                </Paper>
                              </Box> */}
                            </Box>

                            {/* Course Details Table */}
                            <Box 
                              sx={{ 
                                p: { xs: 2, md: 3 }, 
                                bgcolor: (theme) => theme.palette.grey[50],
                                borderRadius: 1,
                                mx: { xs: 1, md: 2 },
                                my: { xs: 1, md: 2 },
                                boxShadow: 'inset 0 2px 8px 0 rgba(0,0,0,0.04)'
                              }}>
                            <Table size="medium" sx={{
                              '& .MuiTableCell-root': {
                                py: 1.5,
                                px: 2,
                                '&:first-of-type': {
                                  pl: 3
                                },
                                '&:last-of-type': {
                                  pr: 3
                                }
                              }
                            }}>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 600, color: (theme) => theme.palette.grey[700] }}>Course Code</TableCell>
                                  <TableCell sx={{ fontWeight: 600, color: (theme) => theme.palette.grey[700] }}>Title</TableCell>
                                  <TableCell align="center" colSpan={4} sx={{ 
                                    fontWeight: 600, 
                                    color: (theme) => theme.palette.grey[700],
                                    borderBottom: (theme) => `2px solid ${theme.palette.primary.light}`
                                  }}>Hours</TableCell>
                                  <TableCell align="center" colSpan={3} sx={{ 
                                    fontWeight: 600, 
                                    color: (theme) => theme.palette.grey[700],
                                    borderBottom: (theme) => `2px solid ${theme.palette.secondary.light}`
                                  }}>Number of Sections</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ borderBottom: 'none' }}></TableCell>
                                  <TableCell sx={{ borderBottom: 'none' }}></TableCell>
                                  <TableCell align="center" sx={{ 
                                    fontWeight: 600, 
                                    color: (theme) => theme.palette.grey[600],
                                    fontSize: '0.875rem'
                                  }}>Credit</TableCell>
                                  <TableCell align="center" sx={{ 
                                    fontWeight: 600, 
                                    color: (theme) => theme.palette.grey[600],
                                    fontSize: '0.875rem'
                                  }}>Lecture</TableCell>
                                  <TableCell align="center" sx={{ 
                                    fontWeight: 600, 
                                    color: (theme) => theme.palette.grey[600],
                                    fontSize: '0.875rem'
                                  }}>Lab</TableCell>
                                  <TableCell align="center" sx={{ 
                                    fontWeight: 600, 
                                    color: (theme) => theme.palette.grey[600],
                                    fontSize: '0.875rem'
                                  }}>Tutorial</TableCell>
                                  <TableCell align="center" sx={{ 
                                    fontWeight: 600, 
                                    color: (theme) => theme.palette.grey[600],
                                    fontSize: '0.875rem'
                                  }}>Lecture</TableCell>
                                  <TableCell align="center" sx={{ 
                                    fontWeight: 600, 
                                    color: (theme) => theme.palette.grey[600],
                                    fontSize: '0.875rem'
                                  }}>Lab</TableCell>
                                  <TableCell align="center" sx={{ 
                                    fontWeight: 600, 
                                    color: (theme) => theme.palette.grey[600],
                                    fontSize: '0.875rem'
                                  }}>Tutorial</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {courses.map((course) => (
                                  <TableRow key={course._id} sx={{
                                    '&:hover': {
                                      bgcolor: 'action.hover'
                                    }
                                  }}>
                                    <TableCell>{course.code}</TableCell>
                                    <TableCell>{course.title}</TableCell>
                                    {/* Hours */}
                                    <TableCell align="center" sx={{ color: 'primary.main' }}>{course.Hourfor?.creaditHours || 0}</TableCell>
                                    <TableCell align="center" sx={{ color: 'primary.main' }}>{course.Hourfor?.lecture || 0}</TableCell>
                                    <TableCell align="center" sx={{ color: 'primary.main' }}>{course.Hourfor?.lab || 0}</TableCell>
                                    <TableCell align="center" sx={{ color: 'primary.main' }}>{course.Hourfor?.tutorial || 0}</TableCell>
                                    {/* Number of Sections */}
                                    <TableCell align="center" sx={{ color: 'secondary.main' }}>{course.Number_of_Sections?.lecture || 0}</TableCell>
                                    <TableCell align="center" sx={{ color: 'secondary.main' }}>{course.Number_of_Sections?.lab || 0}</TableCell>
                                    <TableCell align="center" sx={{ color: 'secondary.main' }}>{course.Number_of_Sections?.tutorial || 0}</TableCell>
                                  </TableRow>
                                ))}
                                {/* Totals row */}
                                <TableRow sx={{ 
                                  bgcolor: (theme) => theme.palette.grey[50],
                                  '& td': { fontWeight: 600 }
                                }}>
                                  <TableCell colSpan={2}>Total</TableCell>
                                  {/* Hours totals */}
                                  <TableCell align="center">
                                    {courses.reduce((sum, course) => sum + (course.Hourfor?.creaditHours || 0), 0)}
                                  </TableCell>
                                  <TableCell align="center">
                                    {courses.reduce((sum, course) => sum + (course.Hourfor?.lecture || 0), 0)}
                                  </TableCell>
                                  <TableCell align="center">
                                    {courses.reduce((sum, course) => sum + (course.Hourfor?.lab || 0), 0)}
                                  </TableCell>
                                  <TableCell align="center">
                                    {courses.reduce((sum, course) => sum + (course.Hourfor?.tutorial || 0), 0)}
                                  </TableCell>
                                  {/* Sections totals */}
                                  <TableCell align="center">
                                    {courses.reduce((sum, course) => sum + (course.Number_of_Sections?.lecture || 0), 0)}
                                  </TableCell>
                                  <TableCell align="center">
                                    {courses.reduce((sum, course) => sum + (course.Number_of_Sections?.lab || 0), 0)}
                                  </TableCell>
                                  <TableCell align="center">
                                    {courses.reduce((sum, course) => sum + (course.Number_of_Sections?.tutorial || 0), 0)}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
            <TablePagination
              component="div"
              count={totalInstructors}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10]}
              sx={{
                '.MuiTablePagination-selectLabel, .MuiTablePagination-select, .MuiTablePagination-selectIcon': {
                  display: 'none',
                },
                '.MuiTablePagination-displayedRows': {
                  margin: 0,
                }
              }}
            />
          </Box>
        </Paper>
      )}

      {/* Payment Calculation Dialog */}
      {/* View Payment Details Dialog */}
      <Dialog
        open={viewPaymentDialogOpen}
        onClose={() => setViewPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Payment Details - {selectedCourse?.code}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {selectedCourse?.payment ? (
              <>
                <Typography variant="body1">
                  <strong>Base Amount:</strong> {formatCurrency(selectedCourse.payment.baseAmount || 0)}
                </Typography>
                <Typography variant="body1">
                  <strong>HDP Allowance:</strong> {formatCurrency(selectedCourse.payment.hdpAllowance || 0)}
                </Typography>
                <Typography variant="body1">
                  <strong>Position Allowance:</strong> {formatCurrency(selectedCourse.payment.positionAllowance || 0)}
                </Typography>
                <Typography variant="body1">
                  <strong>Branch Advisor Allowance:</strong> {formatCurrency(selectedCourse.payment.branchAdvisorAllowance || 0)}
                </Typography>
                <Typography variant="body1">
                  <strong>Overload Hours Payment:</strong> {formatCurrency(selectedCourse.payment.overloadHours || 0)}
                </Typography>
                <Divider />
                <Typography variant="h6" color="primary">
                  <strong>Total Payment:</strong> {formatCurrency(selectedCourse.payment.totalAmount || 0)}
                </Typography>
                {selectedCourse.payment.remarks && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Remarks:</strong> {selectedCourse.payment.remarks}
                  </Typography>
                )}
              </>
            ) : (
              <Alert severity="info">No payment details available</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewPaymentDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Calculation Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24,
            px: { xs: 1, sm: 2 },
            py: { xs: 1, sm: 1.5 }
          }
        }}
      >
        <DialogTitle>
          Calculate Payment - {selectedCourse?.code}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Base Amount"
              type="number"
              value={paymentDetails.baseAmount}
              onChange={(e) => setPaymentDetails({
                ...paymentDetails,
                baseAmount: e.target.value
              })}
              fullWidth
              required
            />
            <TextField
              label="HDP Allowance"
              type="number"
              value={paymentDetails.hdpAllowance}
              onChange={(e) => setPaymentDetails({
                ...paymentDetails,
                hdpAllowance: e.target.value
              })}
              fullWidth
            />
            <TextField
              label="Position Allowance"
              type="number"
              value={paymentDetails.positionAllowance}
              onChange={(e) => setPaymentDetails({
                ...paymentDetails,
                positionAllowance: e.target.value
              })}
              fullWidth
            />
            <TextField
              label="Branch Advisor Allowance"
              type="number"
              value={paymentDetails.branchAdvisorAllowance}
              onChange={(e) => setPaymentDetails({
                ...paymentDetails,
                branchAdvisorAllowance: e.target.value
              })}
              fullWidth
            />
            <TextField
              label="Overload Hours Payment"
              type="number"
              value={paymentDetails.overloadHours}
              onChange={(e) => setPaymentDetails({
                ...paymentDetails,
                overloadHours: e.target.value
              })}
              fullWidth
            />
            <TextField
              label="Remarks"
              multiline
              rows={3}
              value={paymentDetails.remarks}
              onChange={(e) => setPaymentDetails({
                ...paymentDetails,
                remarks: e.target.value
              })}
              fullWidth
            />
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Total Payment
              </Typography>
              <Typography variant="h5" color="primary">
                {formatCurrency(calculateTotalPayment())}
              </Typography>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePaymentSubmit}
            variant="contained"
            disabled={!paymentDetails.baseAmount}
          >
            Save Payment Details
          </Button>
        </DialogActions>
      </Dialog>
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.08)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            p: 3,
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            '& .MuiTypography-root': {
              fontSize: '1.25rem',
              fontWeight: 700,
              color: (theme) => theme.palette.grey[800]
            }
          }}
        >
          {confirmDialog.type === 'accept' ? (
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: '1.75rem' }} />
          ) : (
            <WarningAmberIcon color="warning" sx={{ fontSize: '1.75rem' }} />
          )}
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent 
          sx={{ 
            px: 3,
            pb: 2,
            pt: '16px !important',
          }}
        >
          <Typography 
            sx={{ 
              mb: confirmDialog.type === 'return' ? 3 : 0,
              color: (theme) => theme.palette.grey[600],
              lineHeight: 1.6
            }}
          >
            {confirmDialog.message}
          </Typography>
          {confirmDialog.type === 'return' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason for Return"
              placeholder="Please provide a reason for returning these courses to review"
              value={confirmDialog.reason || ''}
              onChange={(e) => setConfirmDialog(prev => ({ ...prev, reason: e.target.value }))}
              sx={{ 
                mt: 2,
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: (theme) => theme.palette.grey[50],
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.grey[100],
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                  }
                }
              }}
            />
          )}
          
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            borderRadius: 1, 
            bgcolor: theme => alpha(theme.palette.info.main, 0.05),
            border: '1px solid',
            borderColor: theme => alpha(theme.palette.info.main, 0.2),
            display: 'flex',
            alignItems: 'center'
          }}>
            <FormControl required>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={Boolean(confirmDialog.confirmChecked)} 
                    onChange={(e) => setConfirmDialog(prev => ({ ...prev, confirmChecked: e.target.checked }))}
                    color={confirmDialog.type === 'accept' ? "success" : "warning"}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    I am sure I want to {confirmDialog.type === 'accept' ? 'accept' : 'return'} these courses
                  </Typography>
                }
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions 
          sx={{ 
            px: 3, 
            pb: 3,
            gap: 1,
          }}
        >
          <Button
            onClick={handleConfirmDialogClose}
            variant="outlined"
            color="inherit"
            size="small"
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
              py: 0.75,
              fontSize: '0.875rem',
              borderRadius: '6px',
              borderColor: (theme) => theme.palette.grey[300],
              color: (theme) => theme.palette.grey[600],
              '&:hover': {
                borderColor: (theme) => theme.palette.grey[400],
                backgroundColor: (theme) => theme.palette.grey[50],
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => confirmDialog.onConfirm(confirmDialog.reason)}
            variant="contained"
            size="small"
            color={confirmDialog.type === 'accept' ? 'success' : 'warning'}
            disabled={!confirmDialog.confirmChecked || (confirmDialog.type === 'return' && !confirmDialog.reason?.trim())}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
              py: 0.75,
              fontSize: '0.875rem',
              borderRadius: '6px',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
              },
              '&.Mui-disabled': {
                backgroundColor: theme => alpha(theme.palette[confirmDialog.type === 'accept' ? 'success' : 'warning'].main, 0.3),
                color: 'white'
              }
            }}
          >
            {confirmDialog.type === 'accept' ? 'Accept' : 'Return'}
          </Button>
        </DialogActions>
      </Dialog>
          </Box>
        </Fade>
    </Container>
  );
};

export default FinanceCourses;
