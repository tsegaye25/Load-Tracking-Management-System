import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Collapse,
  Tooltip,
  alpha,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Alert,
  AlertTitle,
  MenuItem,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  TablePagination,
  InputAdornment,
  useTheme
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PendingOutlined as PendingIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Forward as ForwardIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';
import axios from 'axios';

const InstructorRow = ({ instructor, instructorId, courses, onStatusChange }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingCourses, setProcessingCourses] = useState([]);
  const [processingErrors, setProcessingErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [instructorHours, setInstructorHours] = useState(null);
  const [isResubmitDialogOpen, setIsResubmitDialogOpen] = useState(false);
  const [selectedCoursesForResubmit, setSelectedCoursesForResubmit] = useState([]);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedCoursesForReject, setSelectedCoursesForReject] = useState([]);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const fetchInstructorHours = async () => {
      if (instructorId) {
        try {
          const response = await fetch(`http://localhost:5000/api/v1/users/hours/${instructorId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await response.json();
          if (data.status === 'success') {
            setInstructorHours(data.data);
          }
        } catch (error) {
          console.error('Error fetching instructor hours:', error);
        }
      } else {
        console.warn('No instructor ID available for:', instructor);
      }
    };

    fetchInstructorHours();
  }, [instructorId, instructor]);

  // Calculate totals and status counts
  const totalCourses = courses.length;
  const totalWorkload = courses.reduce((sum, course) => sum + (course.totalWorkload || 0), 0);
  const department = courses[0]?.department || 'N/A';

  // Calculate status counts
  const statusCounts = courses.reduce((acc, course) => {
    acc[course.status] = (acc[course.status] || 0) + 1;
    return acc;
  }, {});

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'dean-approved':
        return 'Approved & Forwarded to Vice-Director';
      case 'dean-rejected':
        return 'Returned to Department Head for Review';
      case 'vice-director-rejected':
        return 'Rejected by Vice-Director';
        case 'scientific-director-rejected':
          return 'Rejected by Scientific Director';
          case 'finance-rejected':
            return 'Rejected by Finance';
      default:
        return 'Pending Review';
    }
  };

  // Calculate workload breakdowns
  const workloadStats = useMemo(() => courses.reduce((stats, course) => {
    stats.creditHours += course.Hourfor?.creaditHours || 0;
    stats.lectureHours += course.Hourfor?.lecture || 0;
    stats.labHours += course.Hourfor?.lab || 0;
    stats.tutorialHours += course.Hourfor?.tutorial || 0;
    stats.lectureSections += course.Number_of_Sections?.lecture || 0;
    stats.labSections += course.Number_of_Sections?.lab || 0;
    stats.tutorialSections += course.Number_of_Sections?.tutorial || 0;
    stats.hdpHours += course.hdp || 0;
    stats.positionHours += course.position || 0;
    stats.branchAdvisorHours += course.branchAdvisor || 0;
    return stats;
  }, {
    creditHours: 0,
    lectureHours: 0,
    labHours: 0,
    tutorialHours: 0,
    lectureSections: 0,
    labSections: 0,
    tutorialSections: 0,
    hdpHours: 0,
    positionHours: 0,
    branchAdvisorHours: 0
  }), [courses]);

  const handleReviewClick = (action) => {
    // Include all courses for approval, regardless of their current status
    setProcessingCourses(courses);
    setProcessingErrors({});
    setReviewAction(action);
    
    if (action === 'approve') {
      setConfirmDialogOpen(true);
    } else {
      setReviewDialogOpen(true);
    }
  };

  const handleConfirmApprove = () => {
    setConfirmDialogOpen(false);
    handleReviewSubmit('approve');
  };

  const handleReviewSubmit = async (action) => {
    setIsSubmitting(true);
    setIsLoading(true);
    setProcessingErrors({});
    const errors = {};
    let successCount = 0;

    try {
      const baseURL = 'http://localhost:5000';
      
      // Use bulk approval endpoint
      try {
        const response = await fetch(`${baseURL}/api/v1/courses/bulk-dean-review`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            courseIds: processingCourses.map(course => course._id)
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          toast.error(data.message || 'Failed to process courses');
          return;
        }

        // Update UI for all approved courses
        processingCourses.forEach(course => {
          onStatusChange(course._id, 'dean-approved');
        });

        toast.success(`Successfully approved ${processingCourses.length} courses`);
      } catch (error) {
        console.error('Error in bulk processing:', error);
        toast.error('Failed to process courses. Please try again.');
      }

      setReviewDialogOpen(false);
      setSelectedCourse('');
      setRejectionNotes('');
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const handleResubmitToViceDirector = async (courseIds) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        'http://localhost:5000/api/v1/courses/resubmit-to-vice-director',
        { courseIds },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('Courses resubmitted to Vice Scientific Director successfully');
        onStatusChange(courseIds, 'pending');
      } else {
        toast.error('Failed to resubmit courses');
      }
    } catch (error) {
      console.error('Error resubmitting courses:', error);
      toast.error('Error resubmitting courses to Vice Scientific Director');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResubmitDialogOpen = (courseIds) => {
    setSelectedCoursesForResubmit(courseIds);
    setIsResubmitDialogOpen(true);
  };

  const handleResubmitDialogClose = () => {
    setIsResubmitDialogOpen(false);
    setSelectedCoursesForResubmit([]);
  };

  const handleResubmitConfirmed = async () => {
    await handleResubmitToViceDirector(selectedCoursesForResubmit);
    handleResubmitDialogClose();
  };

  const handleRejectDialogOpen = (courseIds) => {
    setSelectedCoursesForReject(courseIds);
    setIsRejectDialogOpen(true);
  };

  const handleRejectDialogClose = () => {
    setIsRejectDialogOpen(false);
    setSelectedCoursesForReject([]);
    setRejectReason('');
  };

  const handleRejectConfirmed = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        'http://localhost:5000/api/v1/courses/reject-to-department',
        { 
          courseIds: selectedCoursesForReject,
          comment: rejectReason
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('Courses rejected and returned to Department Head successfully');
        onStatusChange(selectedCoursesForReject, 'dean-rejected');
      } else {
        toast.error('Failed to reject courses');
      }
    } catch (error) {
      console.error('Error rejecting courses:', error);
      toast.error('Error rejecting courses');
    } finally {
      setIsLoading(false);
      handleRejectDialogClose();
    }
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell padding="checkbox">
          <IconButton 
            size="small" 
            onClick={() => setOpen(!open)}
            aria-label={open ? "Collapse row" : "Expand row"}
            disabled={isLoading}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle2">{instructor}</Typography>
            <Tooltip title={getStatusText('dean-approved')}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: 1 }}>
                {statusCounts['dean-approved'] > 0 && (
                  <Chip 
                    size="small" 
                    color="success" 
                    label={statusCounts['dean-approved']}
                    icon={<CheckCircleIcon />}
                  />
                )}
                {statusCounts['dean-rejected'] > 0 && (
                  <Chip 
                    size="small" 
                    color="error" 
                    label={statusCounts['dean-rejected']}
                    icon={<CancelIcon />}
                  />
                )}
                {statusCounts['vice-director-rejected'] > 0 && (
                  <Chip 
                    size="small" 
                    color="warning" 
                    label={statusCounts['vice-director-rejected']}
                    icon={<PendingIcon />}
                  />
                )}
              </Box>
            </Tooltip>
            {isLoading && (
              <CircularProgress size={16} sx={{ ml: 1 }} />
            )}
          </Box>
        </TableCell>
        <TableCell>{department}</TableCell>
        <TableCell align="right">{totalCourses}</TableCell>
        <TableCell align="right">{totalWorkload}</TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {!courses.every(course => course.status === 'vice-director-approved') && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {courses.some(course => course.status === 'vice-director-rejected') ? (
                  <>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleResubmitDialogOpen(
                          courses
                            .filter(course => course.status === 'vice-director-rejected')
                            .map(course => course._id)
                        )}
                        startIcon={<CheckCircleIcon />}
                        disabled={isLoading}
                      >
                        Resubmit to Vice Director
                      </Button>
                      <Typography variant="caption" color="primary">
                        Will be forwarded to Vice-Director for review
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleRejectDialogOpen(
                          courses
                            .filter(course => course.status === 'vice-director-rejected')
                            .map(course => course._id)
                        )}
                        disabled={isLoading}
                        startIcon={<CancelIcon />}
                      >
                        Reject All
                      </Button>
                      <Typography variant="caption" color="error">
                        Will be returned to Department Head for review
                      </Typography>
                    </Box>
                  </>
                ) : (
                  courses.some(course => !['dean-approved', 'dean-rejected', 'vice-director-approved', 'scientific-director-approved', 'finance-approved'].includes(course.status)) && (
                    <>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleReviewClick('approve')}
                          disabled={isLoading || courses.some(course => course.status === 'scientific-director-approved')}
                          startIcon={<CheckCircleIcon />}
                        >
                          Approve All
                        </Button>
                        <Typography variant="caption" color="primary">
                          Will be forwarded to Vice Director for review
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleRejectDialogOpen(
                            courses
                              .filter(course => !['dean-approved', 'dean-rejected', 'vice-director-approved', 'scientific-director-approved'].includes(course.status))
                              .map(course => course._id)
                          )}
                          disabled={isLoading || courses.some(course => course.status === 'scientific-director-approved')}
                          startIcon={<CancelIcon />}
                        >
                          Reject All
                        </Button>
                        <Typography variant="caption" color="error">
                          Will be returned to Department Head for review
                        </Typography>
                      </Box>
                    </>
                  )
                )}
                {isLoading && (
                  <CircularProgress size={20} />
                )}
              </Box>
            )}
            <Box sx={{ mt: 1 }}>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {statusCounts['scientific-director-approved'] > 0 && (
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 1, 
                    bgcolor: alpha('#66bb6a', 0.04),
                    border: '1px solid',
                    borderColor: alpha('#66bb6a', 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    boxShadow: `0 1px 2px ${alpha('#000', 0.05)}`
                  }}>
                    <CheckCircleIcon sx={{ color: alpha('#388e3c', 0.7) }} />
                    <Typography variant="subtitle2" sx={{ color: alpha('#2e7d32', 0.85), fontWeight: 600 }}>
                      Approved by Scientific Director
                    </Typography>
                  </Box>
                )}
                {statusCounts['vice-director-approved'] > 0 && (
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 1, 
                    bgcolor: alpha('#42a5f5', 0.04),
                    border: '1px solid',
                    borderColor: alpha('#42a5f5', 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    boxShadow: `0 1px 2px ${alpha('#000', 0.05)}`
                  }}>
                    <ForwardIcon sx={{ color: alpha('#1976d2', 0.7) }} />
                    <Typography variant="subtitle2" sx={{ color: alpha('#1565c0', 0.85), fontWeight: 500 }}>
                      Approved & Forwarded to Scientific Director
                    </Typography>
                  </Box>
                )}
                {statusCounts['dean-approved'] > 0 && (
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 1, 
                    bgcolor: alpha('#42a5f5', 0.04),
                    border: '1px solid',
                    borderColor: alpha('#42a5f5', 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    boxShadow: `0 1px 2px ${alpha('#000', 0.05)}`
                  }}>
                    <ForwardIcon sx={{ color: alpha('#1976d2', 0.7) }} />
                    <Typography variant="subtitle2" sx={{ color: alpha('#1565c0', 0.85), fontWeight: 500 }}>
                      Approved & Forwarded to Vice Director
                    </Typography>
                  </Box>
                )}
                {statusCounts['dean-rejected'] > 0 && (
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 1, 
                    bgcolor: alpha('#ef5350', 0.04),
                    border: '1px solid',
                    borderColor: alpha('#ef5350', 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    boxShadow: `0 1px 2px ${alpha('#000', 0.05)}`
                  }}>
                    <CancelIcon sx={{ color: alpha('#d32f2f', 0.7) }} />
                    <Typography variant="subtitle2" sx={{ color: alpha('#c62828', 0.85), fontWeight: 500 }}>
                      Returned to Department Head
                    </Typography>
                  </Box>
                )}
                {statusCounts['vice-director-rejected'] > 0 && (
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 1, 
                    bgcolor: alpha('#ffa726', 0.04),
                    border: '1px solid',
                    borderColor: alpha('#ffa726', 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    boxShadow: `0 1px 2px ${alpha('#000', 0.05)}`
                  }}>
                    <WarningIcon sx={{ color: alpha('#f57c00', 0.7) }} />
                    <Typography variant="subtitle2" sx={{ color: alpha('#ef6c00', 0.85), fontWeight: 500 }}>
                      Rejected by Vice-Director
                    </Typography>
                  </Box>
                )}
                {Object.keys(statusCounts).length === 0 && (
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 1, 
                    bgcolor: alpha('#90a4ae', 0.04),
                    border: '1px solid',
                    borderColor: alpha('#90a4ae', 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    boxShadow: `0 1px 2px ${alpha('#000', 0.05)}`
                  }}>
                    <InfoIcon sx={{ color: alpha('#546e7a', 0.7) }} />
                    <Typography variant="subtitle2" sx={{ color: alpha('#455a64', 0.85) }}>
                      No courses to review
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ m: 2 }}>
              {/* Workload Summary */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Workload Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Course Hours
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Credit Hours
                            </Typography>
                            <Typography variant="h6">
                              {workloadStats.creditHours}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Total Hours
                            </Typography>
                            <Typography variant="h6">
                              {workloadStats.lectureHours + workloadStats.labHours + workloadStats.tutorialHours}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                              <Typography variant="body2" color="textSecondary">
                                Breakdown
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                <Typography variant="body2">Lecture: {workloadStats.lectureHours}</Typography>
                                <Typography variant="body2">Lab: {workloadStats.labHours}</Typography>
                                <Typography variant="body2">Tutorial: {workloadStats.tutorialHours}</Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Sections
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" color="textSecondary">
                                Total Sections
                              </Typography>
                              <Typography variant="h6">
                                {workloadStats.lectureSections + workloadStats.labSections + workloadStats.tutorialSections}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Lecture Sections:</Typography>
                                <Typography variant="body2" fontWeight="medium">{workloadStats.lectureSections}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Lab Sections:</Typography>
                                <Typography variant="body2" fontWeight="medium">{workloadStats.labSections}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Tutorial Sections:</Typography>
                                <Typography variant="body2" fontWeight="medium">{workloadStats.tutorialSections}</Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Additional Hours
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" color="textSecondary">
                                Total Additional Hours
                              </Typography>
                              <Typography variant="h6">
                                {instructorHours ? 
                                  instructorHours.hdpHour + instructorHours.positionHour + instructorHours.batchAdvisor :
                                  'Loading...'}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">HDP Hours:</Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {instructorHours?.hdpHour || 0}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Position Hours:</Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {instructorHours?.positionHour || 0}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Batch Advisor Hours:</Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {instructorHours?.batchAdvisor || 0}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* Course Details Table */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Courses ({courses.length})
                </Typography>
                <Box>
                  {Object.keys(processingErrors).length > 0 && (
                    <Tooltip title="Some courses failed to process. Check the error indicators for details.">
                      <Chip
                        label={`${Object.keys(processingErrors).length} Errors`}
                        color="error"
                        size="small"
                        icon={<InfoIcon />}
                        sx={{ mr: 1 }}
                      />
                    </Tooltip>
                  )}
                </Box>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Credit Hours</TableCell>
                      <TableCell colSpan={3} align="center">Number of Sections</TableCell>
                      <TableCell colSpan={3} align="center">
                        <Tooltip title="These hours are specific to the instructor and are the same across all their courses">
                          
                        </Tooltip>
                      </TableCell>
                        <TableCell>Status</TableCell>
                      
                    </TableRow>
                    <TableRow>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell align="center">Lecture</TableCell>
                      <TableCell align="center">Lab</TableCell>
                      <TableCell align="center">Tutorial</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow 
                        key={course._id}
                        sx={{
                          bgcolor: processingErrors[course._id]
                            ? alpha(theme.palette.error.main, 0.1)
                            : course.status === 'vice-director-approved'
                              ? alpha(theme.palette.success.main, 0.05)
                              : course.status === 'dean-approved'
                                ? alpha(theme.palette.success.main, 0.05)
                                : course.status === 'dean-rejected'
                                  ? alpha(theme.palette.error.main, 0.05)
                                  : course.status === 'vice-director-rejected'
                                    ? alpha(theme.palette.warning.main, 0.05)
                                    : course.status === 'scientific-director-approved'
                                      ? alpha(theme.palette.success.main, 0.05)
                                      : 'inherit',
                          '&:hover': {
                            bgcolor: processingErrors[course._id] 
                              ? alpha(theme.palette.error.main, 0.15)
                              : course.status === 'vice-director-approved'
                                ? alpha(theme.palette.success.main, 0.1)
                                : course.status === 'dean-approved'
                                  ? alpha(theme.palette.success.main, 0.1)
                                  : course.status === 'dean-rejected'
                                    ? alpha(theme.palette.error.main, 0.1)
                                    : course.status === 'vice-director-rejected'
                                      ? alpha(theme.palette.warning.main, 0.1)
                                      : course.status === 'scientific-director-approved'
                                        ? alpha(theme.palette.success.main, 0.1)
                                        : theme.palette.action.hover
                          }
                        }}
                      >
                        <TableCell component="th" scope="row">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="medium">
                              {course.code}
                            </Typography>
                            {processingErrors[course._id] && (
                              <Tooltip title={processingErrors[course._id]}>
                                <InfoIcon 
                                  color="error" 
                                  fontSize="small" 
                                  sx={{ ml: 1, cursor: 'help' }} 
                                />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {course.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {course.Hourfor?.creaditHours || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {course.Number_of_Sections?.lecture || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {course.Number_of_Sections?.lab || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {course.Number_of_Sections?.tutorial || 0}
                          </Typography>
                        </TableCell>
                        
                       
                        <TableCell>
                          <Chip 
                            label={course.status === 'vice-director-rejected' ? 'Rejected' : course.status}
                            color={
                              course.status === 'vice-director-rejected' ? 'error' :
                              course.status === 'vice-director-approved' ? 'success' :
                              course.status === 'scientific-director-approved' ? 'success' :
                              'default'
                            }
                            size="small"
                            icon={course.status === 'vice-director-rejected' ? <CancelIcon /> : undefined}
                          />
                        </TableCell>
                        
                      </TableRow>
                    ))}
                    {/* Totals Row */}
                    <TableRow sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      fontWeight: 'bold'
                    }}>
                      <TableCell colSpan={2}>
                        <Typography variant="subtitle2">TOTALS</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {courses.reduce((sum, course) => sum + (course.Hourfor?.creaditHours || 0), 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle2">
                          {courses.reduce((sum, course) => sum + (course.Number_of_Sections?.lecture || 0), 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle2">
                          {courses.reduce((sum, course) => sum + (course.Number_of_Sections?.lab || 0), 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle2">
                          {courses.reduce((sum, course) => sum + (course.Number_of_Sections?.tutorial || 0), 0)}
                        </Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Rejection Details Section - Single common section for all rejected courses */}
              {courses.some(course => course.status === 'vice-director-rejected') && (
                <Box 
                  sx={{ 
                    mt: 4,
                    p: 3,
                    backgroundColor: (theme) => alpha(theme.palette.error.main, 0.05),
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'error.light'
                  }}
                >
                  <Typography variant="h6" color="error" gutterBottom>
                    Courses Rejected by Vice Scientific Director
                  </Typography>

                  {/* Rejected Courses List */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Rejected Courses:
                    </Typography>
                    <Grid container spacing={1}>
                      {courses
                        .filter(course => course.status === 'vice-director-rejected')
                        .map(course => (
                          <Grid item xs={12} sm={6} md={4} key={course._id}>
                            <Typography variant="body2">
                              • {course.code} - {course.title}
                            </Typography>
                          </Grid>
                        ))}
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Common Rejection Details */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Rejection Reason:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          whiteSpace: 'pre-wrap',
                          backgroundColor: 'background.paper',
                          p: 2,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        {courses
                          .find(course => course.status === 'vice-director-rejected')
                          ?.approvalHistory
                          ?.filter(h => h.status === 'vice-director-rejected')
                          .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.comment || 'No reason provided'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Rejection Details:
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>Date:</strong> {(() => {
                            const rejectionHistory = courses
                              .find(course => course.status === 'vice-director-rejected')
                              ?.approvalHistory
                              ?.filter(h => h.status === 'vice-director-rejected')
                              .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                            return rejectionHistory ? 
                              new Date(rejectionHistory.date).toLocaleDateString() : 'N/A';
                          })()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Total Courses:</strong> {courses.filter(c => c.status === 'vice-director-rejected').length}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              )}
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                {courses.some(course => course.status === 'vice-director-rejected') && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleResubmitToViceDirector(
                      courses
                        .filter(course => course.status === 'vice-director-rejected')
                        .map(course => course._id)
                    )}
                    startIcon={<CheckCircleIcon />}
                  >
                    Resubmit to Vice Director
                  </Button>
                )}
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {/* Confirmation Dialog for Approval */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => !isSubmitting && setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          Confirm Course Approval
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" align="center" sx={{ mt: 2 }}>
            Are you sure you want to approve {processingCourses.length} courses for {instructor}?
            This will send them to the Vice Scientific Director for final review.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Courses to be approved:
            </Typography>
            {processingCourses.map(course => (
              <Typography key={course._id} variant="body2" color="textSecondary">
                • {course.code} - {course.title}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)}
            variant="outlined"
            sx={{ width: 120 }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <LoadingButton 
            onClick={handleConfirmApprove}
            variant="contained"
            color="primary"
            sx={{ width: 120 }}
            loading={isSubmitting}
            loadingPosition="start"
            startIcon={<CheckCircleIcon />}
          >
            Approve
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Review Dialog - Only for Rejection */}
      <Dialog 
        open={reviewDialogOpen} 
        onClose={() => !isSubmitting && setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Reject Courses
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please select a course and provide rejection notes.
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Course</InputLabel>
            <Select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              required
            >
              {courses.map((course) => (
                <MenuItem key={course._id} value={course._id}>
                  {course.code} - {course.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Rejection Notes"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={rejectionNotes}
            onChange={(e) => setRejectionNotes(e.target.value)}
            required
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setReviewDialogOpen(false);
              setSelectedCourse('');
              setRejectionNotes('');
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <LoadingButton 
            onClick={() => handleReviewSubmit('reject')} 
            variant="contained" 
            color="error"
            loading={isSubmitting}
            loadingPosition="start"
            startIcon={<CancelIcon />}
            disabled={!selectedCourse || !rejectionNotes}
          >
            Reject
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Resubmit Confirmation Dialog */}
      <Dialog
        open={isResubmitDialogOpen}
        onClose={handleResubmitDialogClose}
        aria-labelledby="resubmit-dialog-title"
        aria-describedby="resubmit-dialog-description"
      >
        <DialogTitle id="resubmit-dialog-title">
          Resubmit Courses to Vice Director
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="resubmit-dialog-description">
            Are you sure you want to resubmit {selectedCoursesForResubmit.length} course(s) to the Vice Scientific Director for review?
            This action will send the courses back for another review.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResubmitDialogClose} color="inherit">
            Cancel
          </Button>
          <LoadingButton
            onClick={handleResubmitConfirmed}
            loading={isLoading}
            color="primary"
            variant="contained"
            autoFocus
          >
            Resubmit
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog
        open={isRejectDialogOpen}
        onClose={handleRejectDialogClose}
        aria-labelledby="reject-dialog-title"
        aria-describedby="reject-dialog-description"
      >
        <DialogTitle id="reject-dialog-title">
          Reject Courses and Return to Department Head
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="reject-dialog-description" sx={{ mb: 2 }}>
            Are you sure you want to reject {selectedCoursesForReject.length} course(s) and return them to the Department Head?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="rejection-reason"
            label="Rejection Reason"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectDialogClose} color="inherit">
            Cancel
          </Button>
          <LoadingButton
            onClick={handleRejectConfirmed}
            loading={isLoading}
            color="error"
            variant="contained"
            disabled={!rejectReason.trim()}
          >
            Reject and Return
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

const SchoolCourses = () => {
  const theme = useTheme();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/v1/courses/school-courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch courses');
      }

      const data = await response.json();
      
      if (!data.data.departments) {
        throw new Error('Invalid data structure received from server');
      }

      // Convert departments object to array of courses
      const allCourses = Object.values(data.data.departments).flat();
      
      // Extract unique departments
      const deptSet = new Set(allCourses.map(course => course.department));
      setDepartments(Array.from(deptSet));

      // Set courses
      setCourses(allCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to fetch courses. Please try again.');
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [refreshKey]); // Refetch when refreshKey changes

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleStatusChange = async (courseId, newStatus) => {
    // Update local state optimistically
    const updatedCourses = courses.map(course => 
      course._id === courseId ? { ...course, status: newStatus } : course
    );
    setCourses(updatedCourses);
    
    // Fetch fresh data after a short delay to ensure backend sync
    setTimeout(() => {
      handleRefresh();
    }, 1000);
  };

  // Filter courses based on search and filters
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = !searchTerm || 
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.instructor?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = !filterDepartment || course.department === filterDepartment;
      const matchesYear = !filterYear || course.classYear === filterYear;
      const matchesSemester = !filterSemester || course.semester === filterSemester;

      return matchesSearch && matchesDepartment && matchesYear && matchesSemester;
    });
  }, [courses, searchTerm, filterDepartment, filterYear, filterSemester]);

  // Group filtered courses by instructor
  const groupedByInstructor = useMemo(() => {
    const grouped = {};
    filteredCourses.forEach(course => {
      const instructorName = course.instructor?.name || 'Unassigned';
      if (!grouped[instructorName]) {
        grouped[instructorName] = [];
      }
      grouped[instructorName].push(course);
    });
    return grouped;
  }, [filteredCourses]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Course Review
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Review and manage course assignments for your school
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Search and Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            variant="outlined"
            label="Search"
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
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            select
            variant="outlined"
            label="Year"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <MenuItem value="">All Years</MenuItem>
            {['First', 'Second', 'Third', 'Fourth', 'Fifth'].map((year) => (
              <MenuItem key={year} value={year}>
                {year} Year
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            select
            variant="outlined"
            label="Semester"
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
          >
            <MenuItem value="">All Semesters</MenuItem>
            {['First', 'Second'].map((semester) => (
              <MenuItem key={semester} value={semester}>
                {semester} Semester
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            select
            variant="outlined"
            label="Department"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <MenuItem value="">All Departments</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Instructor</TableCell>
              <TableCell>Department</TableCell>
              <TableCell align="right">Total Courses</TableCell>
              <TableCell align="right">Total Workload</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography>Loading courses...</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3, color: 'error.main' }}>
                    <InfoIcon sx={{ mr: 1 }} />
                    <Typography>{error}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : Object.entries(groupedByInstructor).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                    <InfoIcon sx={{ mr: 1, color: 'info.main' }} />
                    <Typography>No courses found</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : Object.entries(groupedByInstructor)
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(([instructor, courses]) => {
                  // Get instructor ID from the first course
                  const instructorId = courses[0]?.instructor?._id;
                  return (
                    <InstructorRow 
                      key={instructor} 
                      instructor={instructor} 
                      instructorId={instructorId}
                      courses={courses}
                      onStatusChange={handleStatusChange}
                    />
                  );
                })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={Object.keys(groupedByInstructor).length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[10]}
        />
      </TableContainer>
    </Box>
  );
};

export default SchoolCourses;
