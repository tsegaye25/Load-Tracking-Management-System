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
  useTheme,
  Skeleton,
  Checkbox,
  FormControlLabel
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
  Warning as WarningIcon,
  AccountBalance as FinanceIcon,
  FilterAlt as FilterAltIcon,
  RestartAlt as RestartAltIcon,
  ClearAll as ClearAllIcon
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
  const [confirmApproveChecked, setConfirmApproveChecked] = useState(false);
  const [confirmRejectChecked, setConfirmRejectChecked] = useState(false);
  const [confirmResubmitChecked, setConfirmResubmitChecked] = useState(false);

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
  
  // Calculate total workload using the formula:
  // Total Loads = (Lecture Hours * Number of Sections Lecture) + 
  //               (Lab Hours * 0.67 * Number of Sections Lab) + 
  //               (Tutorial Hours * 0.67 * Number of Sections Tutorial) + 
  //               HDP Hours + Position Hours + Batch Advisor Hours
  const totalWorkload = parseFloat(courses.reduce((sum, course) => {
    const lectureLoad = (course.Hourfor?.lecture || 0) * (course.Number_of_Sections?.lecture || 0);
    const labLoad = (course.Hourfor?.lab || 0) * 0.67 * (course.Number_of_Sections?.lab || 0);
    const tutorialLoad = (course.Hourfor?.tutorial || 0) * 0.67 * (course.Number_of_Sections?.tutorial || 0);
    return sum + lectureLoad + labLoad + tutorialLoad;
  }, 0) + (instructorHours ? instructorHours.hdpHour + instructorHours.positionHour + instructorHours.batchAdvisor : 0)).toFixed(2);
  
  // Calculate overload (Total Workload - 12)
  // If overload is negative, show 0
  const overload = Math.max(0, parseFloat((totalWorkload - 12).toFixed(2)));
  
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
      case 'finance-approved':
        return 'Approved by Finance';
      case 'finance-rejected':
        return 'Rejected by Finance';
      case 'finance-review':
        return 'Under Finance Review';
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
      setConfirmApproveChecked(false); // Reset checkbox state
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
    setConfirmResubmitChecked(false); // Reset checkbox state
  };

  const handleResubmitDialogClose = () => {
    setIsResubmitDialogOpen(false);
  };

  const handleResubmitConfirmed = () => {
    handleResubmitDialogClose();
    handleResubmitToViceDirector(selectedCoursesForResubmit);
  };

  const handleRejectDialogOpen = (courseIds) => {
    setSelectedCoursesForReject(courseIds);
    setIsRejectDialogOpen(true);
    setConfirmRejectChecked(false); // Reset checkbox state
  };

  const handleRejectDialogClose = () => {
    setIsRejectDialogOpen(false);
    setRejectReason('');
  };

  const handleRejectConfirmed = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('http://localhost:5000/api/v1/courses/reject-to-department', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          courseIds: selectedCoursesForReject,
          comment: rejectReason // The backend expects 'comment' parameter for rejection reason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject courses');
      }

      toast.success('Courses have been rejected and returned to Department Head');
      onStatusChange(selectedCoursesForReject[0], 'dean-rejected');
      handleRejectDialogClose();
    } catch (error) {
      console.error('Error rejecting courses:', error);
      toast.error(error.message || 'Failed to reject courses');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell padding="checkbox" sx={{ width: '40px' }}>
          <IconButton 
            size="small" 
            onClick={() => setOpen(!open)}
            aria-label={open ? "Collapse row" : "Expand row"}
            disabled={isLoading}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ pl: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="medium">{instructor}</Typography>
            {isLoading && (
              <CircularProgress size={16} sx={{ ml: 1 }} />
            )}
          </Box>
        </TableCell>
        <TableCell sx={{ pl: 2.5 }}>{department}</TableCell>
        <TableCell align="center">{totalCourses}</TableCell>
        <TableCell align="center">{totalWorkload}</TableCell>
        <TableCell align="center" sx={{ 
          color: totalWorkload > 12 ? 'success.main' : 'text.secondary', 
          fontWeight: totalWorkload > 12 ? 'bold' : 'normal' 
        }}>
          {Math.max(0, parseFloat((totalWorkload - 12).toFixed(2)))}
        </TableCell>
        <TableCell align="center">
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'center' }}>
            {!courses.every(course => course.status === 'vice-director-approved') && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {courses.some(course => course.status === 'vice-director-rejected') ? (
                  <>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
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
                        size="small"
                        sx={{
                          py: 0.8,
                          px: 1.5,
                          borderRadius: 1.5,
                          boxShadow: (theme) => `0 3px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
                          transition: 'all 0.3s',
                          fontWeight: 500,
                          textTransform: 'none',
                          fontSize: '0.85rem',
                          lineHeight: 1.2,
                          whiteSpace: 'normal',
                          textAlign: 'center',
                          minWidth: '130px',
                          minHeight: '50px',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: (theme) => `0 5px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                          },
                          '&:active': {
                            transform: 'translateY(0)',
                            boxShadow: (theme) => `0 2px 5px ${alpha(theme.palette.primary.main, 0.15)}`
                          }
                        }}
                      >
                        Resubmit to<br />Vice Director
                      </Button>
                    
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
                        size="small"
                        sx={{
                          py: 0.8,
                          px: 1.5,
                          borderRadius: 1.5,
                          boxShadow: (theme) => `0 3px 8px ${alpha(theme.palette.error.main, 0.2)}`,
                          transition: 'all 0.3s',
                          fontWeight: 500,
                          textTransform: 'none',
                          fontSize: '0.85rem',
                          lineHeight: 1.2,
                          whiteSpace: 'normal',
                          textAlign: 'center',
                          minWidth: '160px',
                          minHeight: '50px',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: (theme) => `0 5px 12px ${alpha(theme.palette.error.main, 0.3)}`
                          },
                          '&:active': {
                            transform: 'translateY(0)',
                            boxShadow: (theme) => `0 2px 5px ${alpha(theme.palette.error.main, 0.15)}`
                          }
                        }}
                      >
                        Return to<br />Department Head
                      </Button>
                    </Box>
                  </>
                ) : (
                  courses.some(course => !['dean-approved', 'dean-rejected', 'vice-director-approved', 'scientific-director-approved', 'finance-approved'].includes(course.status)) && (
                    <>
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleReviewClick('approve')}
                          disabled={isLoading || courses.some(course => course.status === 'scientific-director-approved')}
                          startIcon={<CheckCircleIcon />}
                          size="small"
                          sx={{
                            py: 0.8,
                            px: 1.5,
                            borderRadius: 1.5,
                            boxShadow: (theme) => `0 3px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
                            transition: 'all 0.3s',
                            fontWeight: 500,
                            textTransform: 'none',
                            fontSize: '0.85rem',
                            lineHeight: 1.2,
                            whiteSpace: 'normal',
                            textAlign: 'center',
                            minWidth: '130px',
                            minHeight: '50px',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: (theme) => `0 5px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                            },
                            '&:active': {
                              transform: 'translateY(0)',
                              boxShadow: (theme) => `0 2px 5px ${alpha(theme.palette.primary.main, 0.15)}`
                            }
                          }}
                        >
                          Approve All
                        </Button>
                        
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
                          size="small"
                          sx={{
                            py: 0.8,
                            px: 1.5,
                            borderRadius: 1.5,
                            boxShadow: (theme) => `0 3px 8px ${alpha(theme.palette.error.main, 0.2)}`,
                            transition: 'all 0.3s',
                            fontWeight: 500,
                            textTransform: 'none',
                            fontSize: '0.85rem',
                            lineHeight: 1.2,
                            whiteSpace: 'normal',
                            textAlign: 'center',
                            minWidth: '130px',
                            minHeight: '50px',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: (theme) => `0 5px 12px ${alpha(theme.palette.error.main, 0.3)}`
                            },
                            '&:active': {
                              transform: 'translateY(0)',
                              boxShadow: (theme) => `0 2px 5px ${alpha(theme.palette.error.main, 0.15)}`
                            }
                          }}
                        >
                          Reject All
                        </Button>
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
                {/* Finance Approved Status */}
                {statusCounts['finance-approved'] > 0 && (
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
                    <FinanceIcon sx={{ color: alpha('#388e3c', 0.7) }} />
                    <Typography variant="subtitle2" sx={{ color: alpha('#2e7d32', 0.85), fontWeight: 600 }}>
                      Approved by Finance
                    </Typography>
                  </Box>
                )}
                
                {/* Finance Rejected Status */}
                {statusCounts['finance-rejected'] > 0 && (
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 1, 
                    bgcolor: alpha(theme.palette.error.main, 0.04),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.error.main, 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    boxShadow: `0 1px 2px ${alpha('#000', 0.05)}`
                  }}>
                    <FinanceIcon sx={{ color: alpha(theme.palette.error.main, 0.7) }} />
                    <Typography variant="subtitle2" sx={{ color: alpha(theme.palette.error.main, 0.85), fontWeight: 600 }}>
                      Rejected by Finance
                    </Typography>
                  </Box>
                )}
                
                {/* Finance Review Status */}
                {statusCounts['finance-review'] > 0 && (
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 1, 
                    bgcolor: alpha(theme.palette.info.main, 0.04),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.info.main, 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    boxShadow: `0 1px 2px ${alpha('#000', 0.05)}`
                  }}>
                    <FinanceIcon sx={{ color: alpha(theme.palette.info.main, 0.7) }} />
                    <Typography variant="subtitle2" sx={{ color: alpha(theme.palette.info.main, 0.85), fontWeight: 600 }}>
                      Under Finance Review
                    </Typography>
                  </Box>
                )}
                
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
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: { xs: 2, md: 3 } }}>
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
              <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 1, borderRadius: 2, overflow: 'hidden', width: '100%' }}>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', py: 2 }}>Code</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', py: 2, minWidth: 180 }}>Title</TableCell>
                      <TableCell colSpan={4} align="center" sx={{ bgcolor: alpha('#42a5f5', 0.1), borderBottom: `1px solid ${alpha('#42a5f5', 0.2)}` }}>
                        Hours for
                      </TableCell>
                      <TableCell colSpan={3} align="center" sx={{ bgcolor: alpha('#66bb6a', 0.1), borderBottom: `1px solid ${alpha('#66bb6a', 0.2)}` }}>
                        Number of Sections
                      </TableCell>
                      <TableCell align="center" sx={{ bgcolor: alpha('#ff9800', 0.1), borderBottom: `1px solid ${alpha('#ff9800', 0.2)}` }}>
                        Workload
                      </TableCell>
                      <TableCell align="center" sx={{ bgcolor: alpha('#9c27b0', 0.1), borderBottom: `1px solid ${alpha('#9c27b0', 0.2)}` }}>
                        Status
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell />
                      <TableCell />
                      <TableCell align="center" sx={{ bgcolor: alpha('#42a5f5', 0.05), fontWeight: 600, fontSize: '0.875rem' }}>Credit</TableCell>
                      <TableCell align="center" sx={{ bgcolor: alpha('#42a5f5', 0.05), fontWeight: 600, fontSize: '0.875rem' }}>Lecture</TableCell>
                      <TableCell align="center" sx={{ bgcolor: alpha('#42a5f5', 0.05), fontWeight: 600, fontSize: '0.875rem' }}>Lab</TableCell>
                      <TableCell align="center" sx={{ bgcolor: alpha('#42a5f5', 0.05), fontWeight: 600, fontSize: '0.875rem' }}>Tutorial</TableCell>
                      <TableCell align="center" sx={{ bgcolor: alpha('#66bb6a', 0.05), fontWeight: 600, fontSize: '0.875rem' }}>Lecture</TableCell>
                      <TableCell align="center" sx={{ bgcolor: alpha('#66bb6a', 0.05), fontWeight: 600, fontSize: '0.875rem' }}>Lab</TableCell>
                      <TableCell align="center" sx={{ bgcolor: alpha('#66bb6a', 0.05), fontWeight: 600, fontSize: '0.875rem' }}>Tutorial</TableCell>
                      <TableCell align="center" sx={{ bgcolor: alpha('#ff9800', 0.05), fontWeight: 600, fontSize: '0.875rem' }}>Total</TableCell>
                      <TableCell sx={{ bgcolor: alpha('#9c27b0', 0.05), fontWeight: 600, fontSize: '0.875rem', textAlign: 'center' }}>Status</TableCell>
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
                            <Typography variant="body1" fontWeight="medium" sx={{ fontSize: '0.9rem' }}>
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
                          <Typography variant="body1" sx={{ fontSize: '0.9rem', maxWidth: 250 }} noWrap>
                            {course.title}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body1" fontWeight="medium" sx={{ fontSize: '0.9rem', color: 'primary.dark' }}>
                            {course.Hourfor?.creaditHours || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body1" sx={{ fontSize: '0.9rem', color: alpha('#42a5f5', 0.9) }}>
                            {course.Hourfor?.lecture || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body1" sx={{ fontSize: '0.9rem', color: alpha('#42a5f5', 0.9) }}>
                            {course.Hourfor?.lab || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body1" sx={{ fontSize: '0.9rem', color: alpha('#42a5f5', 0.9) }}>
                            {course.Hourfor?.tutorial || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body1" sx={{ fontSize: '0.9rem', color: alpha('#66bb6a', 0.9) }}>
                            {course.Number_of_Sections?.lecture || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body1" sx={{ fontSize: '0.9rem', color: alpha('#66bb6a', 0.9) }}>
                            {course.Number_of_Sections?.lab || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body1" sx={{ fontSize: '0.9rem', color: alpha('#66bb6a', 0.9) }}>
                            {course.Number_of_Sections?.tutorial || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="(Lecture Hours × Lecture Sections) + (Lab Hours × 0.67 × Lab Sections) + (Tutorial Hours × 0.67 × Tutorial Sections)">
                            <Box sx={{ 
                              display: 'inline-flex', 
                              bgcolor: alpha('#ff9800', 0.1), 
                              px: 1.5, 
                              py: 0.5, 
                              borderRadius: 1,
                              border: `1px solid ${alpha('#ff9800', 0.2)}`
                            }}>
                              <Typography variant="body1" fontWeight="medium" sx={{ fontSize: '0.9rem', color: 'warning.dark' }}>
                                {parseFloat((
                                  (course.Hourfor?.lecture || 0) * (course.Number_of_Sections?.lecture || 0) +
                                  (course.Hourfor?.lab || 0) * 0.67 * (course.Number_of_Sections?.lab || 0) +
                                  (course.Hourfor?.tutorial || 0) * 0.67 * (course.Number_of_Sections?.tutorial || 0)
                                ).toFixed(2))}
                              </Typography>
                            </Box>
                          </Tooltip>
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
                      <TableCell align="center">
                        <Typography variant="subtitle2">
                          {courses.reduce((sum, course) => sum + (course.Hourfor?.creaditHours || 0), 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle2">
                          {courses.reduce((sum, course) => sum + (course.Hourfor?.lecture || 0), 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle2">
                          {courses.reduce((sum, course) => sum + (course.Hourfor?.lab || 0), 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle2">
                          {courses.reduce((sum, course) => sum + (course.Hourfor?.tutorial || 0), 0)}
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

              {/* Additional Hours Section - Compact Card */}
              <Box sx={{ mt: 3, mb: 3 }}>
                <Card variant="outlined">
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <Typography variant="subtitle1" color="primary" fontWeight="medium">
                          Additional Hours
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={9}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">HDP:</Typography>
                            <Typography variant="body2" fontWeight="medium">{instructorHours?.hdpHour || 0}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">Position:</Typography>
                            <Typography variant="body2" fontWeight="medium">{instructorHours?.positionHour || 0}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">Batch Advisor:</Typography>
                            <Typography variant="body2" fontWeight="medium">{instructorHours?.batchAdvisor || 0}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                            <Typography variant="body2" color="text.secondary">Total:</Typography>
                            <Typography variant="body2" fontWeight="bold" color="primary.main">
                              {instructorHours ? instructorHours.hdpHour + instructorHours.positionHour + instructorHours.batchAdvisor : 0}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>

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
        <DialogTitle sx={{ 
          textAlign: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Confirm Course Approval
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            p: 2,
            borderRadius: 1,
            bgcolor: theme => alpha(theme.palette.info.main, 0.05)
          }}>
            <InfoIcon color="info" sx={{ mr: 2 }} />
            <Typography variant="body1">
              Are you sure you want to approve <strong>{processingCourses.length} courses</strong> for <strong>{instructor}</strong>?
              This will send them to the Vice Scientific Director for final review.
            </Typography>
          </Box>
          <Box sx={{ 
            mt: 3, 
            p: 2.5, 
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid',
            borderColor: 'divider',
            maxHeight: '250px',
            overflow: 'auto'
          }}>
            <Typography 
              variant="subtitle2" 
              gutterBottom 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: 'primary.main',
                fontWeight: 600,
                mb: 2
              }}
            >
              <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
              Courses to be approved:
            </Typography>
            <Grid container spacing={1}>
              {processingCourses.map(course => (
                <Grid item xs={12} sm={6} key={course._id}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    border: '1px solid transparent',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}>
                    <Box 
                      sx={{ 
                        width: 10, 
                        height: 10, 
                        borderRadius: '50%', 
                        bgcolor: 'primary.main',
                        mr: 1.5,
                        boxShadow: '0 0 0 3px rgba(63,81,181,0.2)',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': {
                            boxShadow: '0 0 0 0 rgba(63,81,181,0.4)'
                          },
                          '70%': {
                            boxShadow: '0 0 0 6px rgba(63,81,181,0)'
                          },
                          '100%': {
                            boxShadow: '0 0 0 0 rgba(63,81,181,0)'
                          }
                        }
                      }} 
                    />
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700, 
                          lineHeight: 1.4,
                          color: 'primary.dark',
                          fontSize: '0.9rem',
                          letterSpacing: '0.02em',
                          display: 'flex',
                          alignItems: 'center',
                          '&::before': {
                            content: '""',
                            display: 'inline-block',
                            width: '3px',
                            height: '3px',
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            mr: 0.8,
                            opacity: 0.7
                          }
                        }}
                      >
                        {course.code}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="textSecondary"
                        sx={{ 
                          display: 'block', 
                          lineHeight: 1.3,
                          mt: 0.5,
                          fontSize: '0.75rem',
                          maxWidth: '95%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {course.title}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
          <Box sx={{ 
            mt: 3, 
            p: 3.5, 
            borderRadius: 3, 
            background: 'linear-gradient(145deg, rgba(63,81,181,0.08) 0%, rgba(63,81,181,0.03) 100%)',
            border: '1px solid',
            borderColor: theme => alpha(theme.palette.primary.main, 0.2),
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              width: '5px',
              height: '100%',
              background: 'linear-gradient(180deg, #3f51b5 0%, #2196f3 100%)',
              borderTopLeftRadius: '12px',
              borderBottomLeftRadius: '12px'
            },
            '&:hover': {
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
              borderColor: theme => alpha(theme.palette.primary.main, 0.3),
              transform: 'translateY(-3px)'
            }
          }}>
            <FormControl required>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={confirmApproveChecked} 
                    onChange={(e) => setConfirmApproveChecked(e.target.checked)}
                    color="primary"
                    sx={{ 
                      '& .MuiSvgIcon-root': { 
                        fontSize: 28,
                        transition: 'transform 0.2s ease'
                      },
                      '&.Mui-checked .MuiSvgIcon-root': {
                        transform: 'scale(1.1)'
                      }
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600,
                        color: confirmApproveChecked ? 'primary.main' : 'text.primary',
                        transition: 'color 0.2s ease'
                      }}
                    >
                      I confirm that I want to approve these courses
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 0.5, 
                        color: 'text.secondary',
                        maxWidth: '90%'
                      }}
                    >
                      By checking this box, you confirm that you have reviewed all the courses and approve them to be sent to the Vice Director.
                    </Typography>
                  </Box>
                }
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'space-between', 
          pb: 3, 
          px: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          mt: 2,
          pt: 2
        }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)}
            variant="outlined"
            sx={{ 
              width: 120,
              borderRadius: 2,
              py: 1.2,
              borderWidth: '1.5px',
              '&:hover': {
                borderWidth: '1.5px',
                bgcolor: alpha(theme.palette.error.main, 0.05)
              }
            }}
            color="error"
            disabled={isSubmitting}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <LoadingButton 
            onClick={handleConfirmApprove}
            variant="contained"
            color="primary"
            sx={{ 
              width: 140,
              py: 1.2,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                transform: 'translateY(-2px)'
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }
            }}
            loading={isSubmitting}
            loadingPosition="start"
            startIcon={<CheckCircleIcon />}
            disabled={!confirmApproveChecked}
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
        <DialogTitle id="resubmit-dialog-title" sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'info.main' }}>
            Resubmit Courses to Vice Director
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            p: 2,
            borderRadius: 1,
            bgcolor: theme => alpha(theme.palette.info.main, 0.05)
          }}>
            <ForwardIcon color="info" sx={{ mr: 2 }} />
            <Typography variant="body1">
              Are you sure you want to resubmit <strong>{selectedCoursesForResubmit.length} course(s)</strong> to the Vice Scientific Director for review?
              This action will send the courses back for another review.
            </Typography>
          </Box>
          <Box sx={{ 
            mt: 3, 
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
                    checked={confirmResubmitChecked} 
                    onChange={(e) => setConfirmResubmitChecked(e.target.checked)}
                    color="info"
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    I confirm that I want to resubmit these courses
                  </Typography>
                }
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'space-between', 
          pb: 3, 
          px: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          mt: 2,
          pt: 2
        }}>
          <Button 
            onClick={handleResubmitDialogClose} 
            color="inherit"
            variant="outlined"
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleResubmitConfirmed}
            loading={isLoading}
            color="info"
            variant="contained"
            disabled={!confirmResubmitChecked}
            sx={{ 
              minWidth: 140,
              py: 1,
              boxShadow: 2,
              '&.Mui-disabled': {
                backgroundColor: theme => alpha(theme.palette.info.main, 0.3),
                color: 'white'
              }
            }}
            startIcon={<ForwardIcon />}
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
        <DialogTitle id="reject-dialog-title" sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.main' }}>
            Reject Courses and Return to Department Head
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            p: 2,
            borderRadius: 1,
            bgcolor: theme => alpha(theme.palette.warning.main, 0.05)
          }}>
            <WarningIcon color="warning" sx={{ mr: 2 }} />
            <Typography variant="body1">
              Are you sure you want to reject <strong>{selectedCoursesForReject.length} course(s)</strong> and return them to the Department Head?
            </Typography>
          </Box>
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
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            borderRadius: 1, 
            bgcolor: theme => alpha(theme.palette.error.main, 0.05),
            border: '1px solid',
            borderColor: theme => alpha(theme.palette.error.main, 0.2),
            display: 'flex',
            alignItems: 'center'
          }}>
            <FormControl required>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={confirmRejectChecked} 
                    onChange={(e) => setConfirmRejectChecked(e.target.checked)}
                    color="error"
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    I confirm that I want to reject these courses
                  </Typography>
                }
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'space-between', 
          pb: 3, 
          px: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          mt: 2,
          pt: 2
        }}>
          <Button 
            onClick={handleRejectDialogClose} 
            color="inherit"
            variant="outlined"
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleRejectConfirmed}
            loading={isLoading}
            color="error"
            variant="contained"
            disabled={!rejectReason.trim() || !confirmRejectChecked}
            sx={{ 
              minWidth: 160,
              py: 1,
              boxShadow: 2,
              '&.Mui-disabled': {
                backgroundColor: theme => alpha(theme.palette.error.main, 0.3),
                color: 'white'
              }
            }}
            startIcon={<CancelIcon />}
          >
            Reject and Return
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};



// Skeleton loader for instructor rows
const TableRowSkeleton = () => {
  return (
    <TableRow>
      <TableCell padding="checkbox">
        <Skeleton variant="circular" width={24} height={24} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={150} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={120} />
      </TableCell>
      <TableCell align="right">
        <Skeleton variant="text" width={50} />
      </TableCell>
      <TableCell align="right">
        <Skeleton variant="text" width={80} />
      </TableCell>
      <TableCell>
        <Skeleton variant="rectangular" width={120} height={32} />
      </TableCell>
    </TableRow>
  );
};

const SchoolCourses = () => {
  const theme = useTheme();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Separate state for initial loading
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0); // For pagination
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedCards, setExpandedCards] = useState({});
  const [instructorWorkloads, setInstructorWorkloads] = useState({});

  // Get status text function
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
      case 'finance-approved':
        return 'Approved by Finance';
      case 'finance-rejected':
        return 'Rejected by Finance';
      case 'finance-review':
        return 'Under Finance Review';
      default:
        return 'Pending Review';
    }
  };

  // Get status color function
  const getStatusColor = (status) => {
    switch (status) {
      case 'dean-approved':
      case 'finance-approved':
        return 'success';
      case 'dean-rejected':
      case 'vice-director-rejected':
      case 'scientific-director-rejected':
      case 'finance-rejected':
        return 'error';
      case 'finance-review':
        return 'info';
      default:
        return 'warning';
    }
  };

  // Fetch instructor workload data
  const fetchInstructorWorkload = async (instructorId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/users/hours/${instructorId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setInstructorWorkloads(prev => ({
          ...prev,
          [instructorId]: data.data
        }));
      }
    } catch (error) {
      console.error('Error fetching instructor hours:', error);
    }
  };

  // Fetch all courses and handle pagination client-side
  const fetchCourses = async () => {
    // Reset loading state
    setLoading(true);
    try {
      setLoading(true);
      setError(null);
      
      // Add query parameters for filtering
      // The backend doesn't support pagination yet, so we'll fetch all courses
      const url = new URL('http://localhost:5000/api/v1/courses/school-courses');
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
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
      
      // Set total count for pagination based on the actual number of courses
      setTotalCount(allCourses.length);
      
      // Fetch workload data for each instructor
      const instructorIds = new Set();
      allCourses.forEach(course => {
        if (course.instructor?._id) {
          instructorIds.add(course.instructor._id);
        }
      });
      
      // Fetch workload data for each unique instructor
      Array.from(instructorIds).forEach(id => {
        fetchInstructorWorkload(id);
      });
      
      return allCourses;
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to fetch courses. Please try again.');
      toast.error('Failed to fetch courses');
      return [];
    } finally {
      // Delay setting loading to false for smoother UX
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [refreshKey]); // Refetch when refreshKey changes

  const handleRefresh = async () => {
    // Show loading state
    setLoading(true);
    
    // Clear existing data for a more visible refresh effect
    setCourses([]);
    
    // Reset to first page
    setPage(0);
    
    // Fetch fresh data
    await fetchCourses();
    
    // Show success message
    toast.success('Data refreshed successfully');
  };
  
  const handleChangePage = (event, newPage) => {
    // Just update the page number - no need to refetch since we have all data
    setPage(newPage);
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

  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      await fetchCourses(20, 0); // Fetch first page with larger size
      setInitialLoading(false);
    };
    
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle filter changes
  useEffect(() => {
    // Reset to first page when filters change
    setPage(0);
    
    // Don't refetch if we're still in initial loading
    if (!initialLoading) {
      // No need to refetch - we'll filter client-side
      // Just force a re-render to apply the filters
      setRefreshKey(prev => prev + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterDepartment, initialLoading]);
  
  // Function to reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterDepartment('');
    setPage(0);
    toast.info('Filters have been reset');
  };

  // Group courses by instructor with optimized filtering
  const groupedByInstructor = useMemo(() => {
    // Apply client-side filtering for all filters
    const filtered = courses
      .filter(course => {
        // Apply all filters client-side
        const matchesSearch = searchTerm === '' || 
          (course.instructor?.name && course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (course.code && course.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (course.title && course.title.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Special handling for status filter
        let matchesStatus = true;
        if (filterStatus) {
          // Map the UI filter values to actual status values
          switch (filterStatus) {
            case 'pending':
              matchesStatus = ['pending', 'department-head-approved'].includes(course.status);
              break;
            case 'dean-approved':
              // Include all approval states from any role
              matchesStatus = [
                'dean-approved',
                'vice-director-approved',
                'scientific-director-approved',
                'finance-approved'
              ].includes(course.status);
              break;
            case 'dean-rejected':
              // Include all rejection states from any role
              matchesStatus = [
                'dean-rejected',
                'vice-director-rejected',
                'scientific-director-rejected',
                'finance-rejected'
              ].includes(course.status);
              break;
            case 'vice-director-approved':
              matchesStatus = course.status === 'vice-director-approved';
              break;
            case 'vice-director-rejected':
              matchesStatus = course.status === 'vice-director-rejected';
              break;
            default:
              matchesStatus = !filterStatus || course.status === filterStatus;
          }
        }
        const matchesDepartment = !filterDepartment || course.department === filterDepartment;
        
        return matchesSearch && matchesStatus && matchesDepartment;
      });
      
    // Group by instructor
    const grouped = filtered.reduce((acc, course) => {
      const instructorName = course.instructor?.name || 'Unknown Instructor';
      if (!acc[instructorName]) {
        acc[instructorName] = [];
      }
      acc[instructorName].push(course);
      return acc;
    }, {});
    
    // Update total count for pagination based on the number of instructor groups
    const totalGroups = Object.keys(grouped).length;
    setTotalCount(totalGroups);
    
    return grouped;
  }, [courses, searchTerm, filterStatus, filterDepartment]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Course Review
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Review and manage course assignments for your school
          </Typography>
        </Box>
        <LoadingButton
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          loading={loading}
          loadingPosition="start"
          sx={{ minWidth: '120px' }}
        >
          Refresh
        </LoadingButton>
      </Box>

      {/* Search and Filters */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2.5, sm: 3 }, 
          mb: { xs: 3, md: 4 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: theme => alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            pointerEvents: 'none',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
            zIndex: 1
          }
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2.5, 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: 'primary.dark',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: '40px',
              height: '3px',
              bgcolor: 'primary.main',
              borderRadius: '4px'
            }
          }}
        >
          <FilterAltIcon fontSize="small" color="primary" sx={{ 
            bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
            p: 0.5,
            borderRadius: '8px'
          }} />
          Filter Courses
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by course code, title or instructor"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" sx={{ 
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 0.7 },
                        '50%': { opacity: 1 },
                        '100%': { opacity: 0.7 }
                      }
                    }} />
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 0 0 2px rgba(63, 81, 181, 0.2)'
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 2px rgba(63, 81, 181, 0.3)'
                  }
                }
              }}
              sx={{ 
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'divider',
                    transition: 'all 0.2s'
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.light'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: '1.5px'
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              fullWidth
              select
              variant="outlined"
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              InputProps={{ 
                sx: { 
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 0 0 2px rgba(63, 81, 181, 0.2)'
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 2px rgba(63, 81, 181, 0.3)'
                  }
                } 
              }}
              sx={{ 
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'divider',
                    transition: 'all 0.2s'
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.light'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: '1.5px'
                  }
                }
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="pending">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    bgcolor: 'warning.main' 
                  }} />
                  Pending Review
                </Box>
              </MenuItem>
              <MenuItem value="dean-approved">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    bgcolor: 'success.main' 
                  }} />
                  Approved (Any Stage)
                </Box>
              </MenuItem>
              <MenuItem value="dean-rejected">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    bgcolor: 'error.main' 
                  }} />
                  Rejected (Any Stage)
                </Box>
              </MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              fullWidth
              select
              variant="outlined"
              label="Department"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              InputProps={{ 
                sx: { 
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 0 0 2px rgba(63, 81, 181, 0.2)'
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 2px rgba(63, 81, 181, 0.3)'
                  }
                } 
              }}
              sx={{ 
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'divider',
                    transition: 'all 0.2s'
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.light'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: '1.5px'
                  }
                }
              }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleResetFilters}
              startIcon={<RestartAltIcon />}
              sx={{ 
                height: '56px',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                background: 'linear-gradient(90deg, #7e57c2 0%, #5c6bc0 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(90deg, #673ab7 0%, #3f51b5 100%)',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      {/* Mobile Card View for Small Screens */}
      <Box sx={{ 
        display: { xs: 'block', md: 'none' },
        mb: 3
      }}>
        {initialLoading ? (
          // Enhanced mobile loading skeleton
          Array.from(new Array(3)).map((_, index) => (
            <Paper 
              key={index}
              sx={{ 
                p: 2, 
                mb: 2, 
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                overflow: 'hidden'
              }}
            >
              {/* Header with instructor info */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ ml: 2 }}>
                    <Skeleton variant="text" width={120} height={24} />
                    <Skeleton variant="text" width={80} height={20} />
                  </Box>
                </Box>
                <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '16px' }} />
              </Box>
              
              {/* Status summary section */}
              <Box sx={{ mb: 2 }}>
                <Skeleton variant="text" width={100} height={20} sx={{ mb: 1 }} />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Skeleton variant="rounded" width={120} height={36} sx={{ borderRadius: '4px' }} />
                  <Skeleton variant="rounded" width={140} height={36} sx={{ borderRadius: '4px' }} />
                </Box>
              </Box>
              
              {/* Workload summary preview */}
              <Box sx={{ pt: 1.5, mt: 1.5, borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                <Skeleton variant="text" width={140} height={20} sx={{ mb: 1 }} />
                
                {/* Credit hours section */}
                <Box sx={{ mb: 1.5 }}>
                  <Grid container spacing={1.5}>
                    {Array.from(new Array(3)).map((_, i) => (
                      <Grid item xs={4} key={i}>
                        <Skeleton variant="rounded" height={60} sx={{ borderRadius: '4px' }} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                
                {/* Section counts */}
                <Box sx={{ mb: 1.5 }}>
                  <Skeleton variant="text" width={120} height={20} sx={{ mb: 1 }} />
                  <Grid container spacing={1.5}>
                    {Array.from(new Array(3)).map((_, i) => (
                      <Grid item xs={4} key={i}>
                        <Skeleton variant="rounded" height={50} sx={{ borderRadius: '4px' }} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                
                {/* Additional hours preview */}
                <Skeleton variant="text" width={130} height={20} sx={{ mb: 1 }} />
                <Skeleton variant="rounded" height={40} sx={{ borderRadius: '4px', mb: 1 }} />
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Skeleton variant="rounded" width="48%" height={40} sx={{ borderRadius: '4px' }} />
                  <Skeleton variant="rounded" width="48%" height={40} sx={{ borderRadius: '4px' }} />
                </Box>
              </Box>
            </Paper>
          ))
        ) : error ? (
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
              <InfoIcon sx={{ mr: 1 }} />
              <Typography>{error}</Typography>
            </Box>
          </Paper>
        ) : Object.entries(groupedByInstructor).length === 0 ? (
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <InfoIcon sx={{ mb: 1, color: 'info.main' }} />
              <Typography variant="body1">No courses found</Typography>
            </Box>
          </Paper>
        ) : (
          Object.entries(groupedByInstructor)
            .map(([instructor, courses]) => {
              const department = courses[0]?.department || 'N/A';
              const totalCourses = courses.length;
              
              // Calculate total workload using the same formula as desktop view
              // including HDP Hours, Position Hours, and Batch Advisor Hours
              const instructorId = courses[0]?.instructor?._id;
              const additionalHours = instructorId ? (
                (instructorWorkloads[instructorId]?.hdpHour || 0) + 
                (instructorWorkloads[instructorId]?.positionHour || 0) + 
                (instructorWorkloads[instructorId]?.batchAdvisor || 0)
              ) : 0;
              
              const totalWorkload = parseFloat(courses.reduce((sum, course) => {
                const lectureLoad = (course.Hourfor?.lecture || 0) * (course.Number_of_Sections?.lecture || 0);
                const labLoad = (course.Hourfor?.lab || 0) * 0.67 * (course.Number_of_Sections?.lab || 0);
                const tutorialLoad = (course.Hourfor?.tutorial || 0) * 0.67 * (course.Number_of_Sections?.tutorial || 0);
                return sum + lectureLoad + labLoad + tutorialLoad;
              }, 0) + additionalHours).toFixed(2);
              
              // Calculate overload (Total Workload - 12)
              // If overload is negative, show 0
              const overload = Math.max(0, parseFloat((totalWorkload - 12).toFixed(2)));
              
              // Calculate status counts
              const statusCounts = courses.reduce((acc, course) => {
                acc[course.status] = (acc[course.status] || 0) + 1;
                return acc;
              }, {});
              
              return (
                <Paper 
                  key={instructor}
                  sx={{ 
                    p: 0, 
                    mb: 2.5, 
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {/* Header Section with Gradient */}
                  <Box sx={{ 
                    p: 2, 
                    background: 'linear-gradient(90deg, rgba(63,81,181,0.08) 0%, rgba(63,81,181,0.03) 100%)',
                    borderBottom: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        '&::before': {
                          content: '""',
                          display: 'inline-block',
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          mr: 1,
                          boxShadow: '0 0 0 2px rgba(63,81,181,0.2)'
                        }
                      }}>
                        {instructor}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ ml: 1.5 }}>
                        {department}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Chip 
                        size="small" 
                        label={getStatusText(courses[0]?.status)}
                        color={getStatusColor(courses[0]?.status)}
                        variant="outlined"
                        sx={{ height: 24 }}
                      />
                    </Box>
                  </Box>
                  
                  {/* Status Summary */}
                  <Box sx={{ p: 2, pt: 1.5 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ 
                      display: 'block', 
                      mb: 1,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem'
                    }}>
                      Status Summary
                    </Typography>
                    
                    <Grid container spacing={1} sx={{ mb: 1.5 }}>
                      {statusCounts['dean-approved'] > 0 && (
                        <Grid item>
                          <Chip 
                            size="small" 
                            color="success" 
                            icon={<CheckCircleIcon />}
                            label={`${statusCounts['dean-approved']} Approved`}
                            sx={{ height: 28 }}
                          />
                        </Grid>
                      )}
                      {statusCounts['dean-rejected'] > 0 && (
                        <Grid item>
                          <Chip 
                            size="small" 
                            color="error" 
                            icon={<CancelIcon />}
                            label={`${statusCounts['dean-rejected']} Rejected`}
                            sx={{ height: 28 }}
                          />
                        </Grid>
                      )}
                      {statusCounts['pending'] > 0 && (
                        <Grid item>
                          <Chip 
                            size="small" 
                            color="warning" 
                            icon={<PendingIcon />}
                            label={`${statusCounts['pending']} Pending`}
                            sx={{ height: 28 }}
                          />
                        </Grid>
                      )}
                      {statusCounts['vice-director-rejected'] > 0 && (
                        <Grid item>
                          <Chip 
                            size="small" 
                            color="warning" 
                            icon={<WarningIcon />}
                            label={`${statusCounts['vice-director-rejected']} Returned`}
                            sx={{ height: 28 }}
                          />
                        </Grid>
                      )}
                    </Grid>
                    
                    {/* Quick Actions */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      mt: 1.5,
                      flexWrap: 'wrap',
                      justifyContent: 'flex-start'
                    }}>
                      {courses.some(course => course.status === 'vice-director-rejected') && (
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={<ForwardIcon sx={{ fontSize: 16 }} />}
                            sx={{ fontSize: '0.75rem', py: 0.5 }}
                          >
                            Resubmit to<br />Vice Director
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon sx={{ fontSize: 16 }} />}
                            sx={{ fontSize: '0.75rem', py: 0.5 }}
                          >
                            Return to<br />Department Head
                          </Button>
                        </Box>
                      )}
                      {courses.some(course => course.status === 'pending') && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                          sx={{ fontSize: '0.75rem', py: 0.5 }}
                        >
                          Approve
                        </Button>
                      )}
                      {courses.some(course => course.status === 'pending') && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            py: 1.2,
                            px: 2,
                            borderRadius: 2,
                            boxShadow: (theme) => `0 4px 10px ${alpha(theme.palette.error.main, 0.25)}`,
                            transition: 'all 0.3s',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            lineHeight: 1.2,
                            whiteSpace: 'normal',
                            textAlign: 'center',
                            minHeight: '64px',
                            width: '160px',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: (theme) => `0 6px 15px ${alpha(theme.palette.error.main, 0.35)}`
                            },
                            '&:active': {
                              transform: 'translateY(0)',
                              boxShadow: (theme) => `0 2px 5px ${alpha(theme.palette.error.main, 0.2)}`
                            }
                          }}
                        >
                          Reject<br />All
                        </Button>
                      )}
                    </Box>
                  </Box>
                  
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => {
                      setExpandedCards(prev => ({
                        ...prev,
                        [instructor]: !prev[instructor]
                      }));
                    }}
                    endIcon={expandedCards[instructor] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    sx={{ mt: 1 }}
                  >
                    {expandedCards[instructor] ? 'Hide Details' : 'View Details'}
                  </Button>
                  
                  <Collapse in={expandedCards[instructor]} timeout="auto" unmountOnExit>
                    <Box sx={{ 
                      p: 2, 
                      pt: 1.5, 
                      borderTop: '1px solid', 
                      borderColor: alpha(theme.palette.primary.main, 0.1),
                      bgcolor: alpha(theme.palette.background.paper, 0.5)
                    }}>
                      <Typography 
                        variant="subtitle2" 
                        color="primary.main" 
                        gutterBottom
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          '&::before': {
                            content: '""',
                            display: 'inline-block',
                            width: '3px',
                            height: '16px',
                            borderRadius: '2px',
                            bgcolor: 'primary.main',
                            mr: 1,
                            opacity: 0.7
                          }
                        }}
                      >
                        Course Details ({courses.length})
                      </Typography>
                      
                      {/* Workload Summary */}
                      <Box sx={{ mb: 3 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ 
                              p: 1.5, 
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: alpha(theme.palette.primary.main, 0.15),
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%'
                            }}>
                              <Typography variant="caption" color="textSecondary" fontWeight={500}>
                                Total Workload
                              </Typography>
                              <Typography variant="h6" color="primary.dark" fontWeight={600}>
                                {totalWorkload}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ 
                              p: 1.5, 
                              bgcolor: alpha(theme.palette.success.main, 0.05),
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: alpha(theme.palette.success.main, 0.15),
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%'
                            }}>
                              <Typography variant="caption" color="textSecondary" fontWeight={500}>
                                Overload
                              </Typography>
                              <Typography variant="h6" color="success.dark" fontWeight={600}>
                                {overload}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                      
                      {/* Course List */}
                      <Box sx={{ mt: 1.5 }}>
                        <Box sx={{ 
                          display: 'grid',
                          gridTemplateColumns: '1fr 2fr 1fr',
                          gap: 1,
                          p: 1,
                          borderBottom: '1px solid',
                          borderColor: alpha(theme.palette.divider, 0.7),
                          mb: 1
                        }}>
                          <Typography variant="caption" color="textSecondary" fontWeight={600}>Code</Typography>
                          <Typography variant="caption" color="textSecondary" fontWeight={600}>Title</Typography>
                          <Typography variant="caption" color="textSecondary" fontWeight={600} align="center">Status</Typography>
                        </Box>
                        
                        {courses.map((course) => {
                          // Calculate course workload
                          const courseWorkload = parseFloat((
                            (course.Hourfor?.lecture || 0) * (course.Number_of_Sections?.lecture || 0) +
                            (course.Hourfor?.lab || 0) * 0.67 * (course.Number_of_Sections?.lab || 0) +
                            (course.Hourfor?.tutorial || 0) * 0.67 * (course.Number_of_Sections?.tutorial || 0)
                          ).toFixed(2));
                          
                          return (
                            <Box 
                              key={course._id}
                              sx={{ 
                                display: 'grid',
                                gridTemplateColumns: '1fr 2fr 1fr',
                                gap: 1,
                                p: 1,
                                borderBottom: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.3),
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.03)
                                }
                              }}
                            >
                              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                                {course.code}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                fontSize: '0.8rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {course.title}
                                <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="caption" color="warning.dark" fontWeight="medium" sx={{ 
                                    bgcolor: alpha('#ff9800', 0.1), 
                                    px: 0.75, 
                                    py: 0.25, 
                                    borderRadius: 0.5,
                                    fontSize: '0.7rem',
                                    display: 'inline-flex'
                                  }}>
                                    WL: {courseWorkload}
                                  </Typography>
                                </Box>
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Chip 
                                  size="small"
                                  label={course.status}
                                  color={
                                    course.status === 'vice-director-rejected' ? 'error' :
                                    course.status === 'vice-director-approved' ? 'success' :
                                    course.status === 'scientific-director-approved' ? 'success' :
                                    'default'
                                  }
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                      {/* Course Summary */}
                      <Box sx={{ 
                        mt: 2, 
                        pt: 1.5, 
                        borderTop: '1px dashed', 
                        borderColor: alpha(theme.palette.divider, 0.5)
                      }}>
                        <Typography variant="caption" color="textSecondary" fontWeight={500} sx={{
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'flex',
                          alignItems: 'center',
                          '&::before': {
                            content: '""',
                            display: 'inline-block',
                            width: '3px',
                            height: '10px',
                            borderRadius: '2px',
                            bgcolor: 'primary.main',
                            mr: 1,
                            opacity: 0.7
                          }
                        }}>
                          Workload Summary ({courses.length} Courses)
                        </Typography>
                        
                        {/* Removed Credit Hours, Lecture, Lab/Tutorial, and Number of Sections as requested */}
                        
                        {/* Additional Hours */}
                        <Typography variant="caption" color="textSecondary" fontWeight={500} sx={{
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          mt: 2.5,
                          mb: 1,
                          display: 'block',
                          display: 'flex',
                          alignItems: 'center',
                          '&::before': {
                            content: '""',
                            display: 'inline-block',
                            width: '3px',
                            height: '10px',
                            borderRadius: '2px',
                            bgcolor: 'info.main',
                            mr: 1,
                            opacity: 0.7
                          }
                        }}>
                          Additional Hours
                        </Typography>
                        
                        <Grid container spacing={1.5}>
                          {/* Total Additional Hours */}
                          <Grid item xs={12}>
                            <Box sx={{ 
                              p: 1, 
                              bgcolor: alpha(theme.palette.info.main, 0.03),
                              borderRadius: 1,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              border: '1px solid',
                              borderColor: alpha(theme.palette.info.main, 0.1),
                              mb: 1
                            }}>
                              <Typography variant="caption" color="textSecondary">
                                Total Additional Hours
                              </Typography>
                              <Typography variant="body2" fontWeight="medium" color="info.dark">
                                {courses[0]?.instructor?._id && instructorWorkloads[courses[0].instructor._id] ? 
                                  (instructorWorkloads[courses[0].instructor._id].hdpHour || 0) + 
                                  (instructorWorkloads[courses[0].instructor._id].positionHour || 0) + 
                                  (instructorWorkloads[courses[0].instructor._id].batchAdvisor || 0) : 
                                  'N/A'}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          {/* HDP Hours */}
                          <Grid item xs={6}>
                            <Box sx={{ 
                              p: 1, 
                              bgcolor: alpha(theme.palette.info.main, 0.03),
                              borderRadius: 1,
                              textAlign: 'center',
                              border: '1px solid',
                              borderColor: alpha(theme.palette.info.main, 0.1)
                            }}>
                              <Typography variant="caption" color="textSecondary" display="block">
                                HDP Hours
                              </Typography>
                              <Typography variant="body2" fontWeight="medium" color="info.dark">
                                {courses[0]?.instructor?._id && instructorWorkloads[courses[0].instructor._id]?.hdpHour || '0'}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          {/* Position Hours */}
                          <Grid item xs={6}>
                            <Box sx={{ 
                              p: 1, 
                              bgcolor: alpha(theme.palette.info.main, 0.03),
                              borderRadius: 1,
                              textAlign: 'center',
                              border: '1px solid',
                              borderColor: alpha(theme.palette.info.main, 0.1)
                            }}>
                              <Typography variant="caption" color="textSecondary" display="block">
                                Position Hours
                              </Typography>
                              <Typography variant="body2" fontWeight="medium" color="info.dark">
                                {courses[0]?.instructor?._id && instructorWorkloads[courses[0].instructor._id]?.positionHour || '0'}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          {/* Batch Advisor Hours */}
                          <Grid item xs={12}>
                            <Box sx={{ 
                              p: 1, 
                              bgcolor: alpha(theme.palette.info.main, 0.03),
                              borderRadius: 1,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              border: '1px solid',
                              borderColor: alpha(theme.palette.info.main, 0.1),
                              mt: 0.5
                            }}>
                              <Typography variant="caption" color="textSecondary">
                                Batch Advisor Hours
                              </Typography>
                              <Typography variant="body2" fontWeight="medium" color="info.dark">
                                {courses[0]?.instructor?._id && instructorWorkloads[courses[0].instructor._id]?.batchAdvisor || '0'}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          {/* Total Workload */}
                          <Grid item xs={12}>
                            <Box sx={{ 
                              p: 1.5, 
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              borderRadius: 1,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              border: '1px solid',
                              borderColor: alpha(theme.palette.primary.main, 0.15),
                              mt: 1.5,
                              boxShadow: `0 1px 2px ${alpha('#000', 0.05)}`
                            }}>
                              <Typography variant="body2" color="primary.main" fontWeight={500}>
                                Total Workload ({courses.length} Courses)
                              </Typography>
                              <Typography variant="body1" fontWeight={600} color="primary.dark">
                                {totalWorkload} hrs
                              </Typography>
                            </Box>
                          </Grid>
                          
                          {/* Overload */}
                          <Grid item xs={12}>
                            <Box sx={{ 
                              p: 1.5, 
                              bgcolor: alpha(theme.palette.success.main, 0.05),
                              borderRadius: 1,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              border: '1px solid',
                              borderColor: alpha(theme.palette.success.main, 0.15),
                              mt: 1,
                              boxShadow: `0 1px 2px ${alpha('#000', 0.05)}`
                            }}>
                              <Typography variant="body2" color="success.main" fontWeight={500}>
                                Overload (Total - 12 hrs)
                              </Typography>
                              <Typography variant="body1" fontWeight={600} color="success.dark">
                                {Math.max(0, parseFloat((totalWorkload - 12).toFixed(2)))} hrs
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Collapse>
                </Paper>
              );
            })
        )}
        
        {/* Mobile Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <TablePagination
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[5, 10, 15, 20, 25]}
            onRowsPerPageChange={(event) => {
              const newRowsPerPage = parseInt(event.target.value, 10);
              setRowsPerPage(newRowsPerPage);
              setPage(0);
            }}
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
            }
            sx={{ 
              '.MuiTablePagination-toolbar': {
                flexWrap: 'wrap',
                gap: 1
              }
            }}
          />
        </Box>
      </Box>
      
      {/* Desktop Table View */}
      <TableContainer 
        component={Paper} 
        variant="outlined"
        sx={{ 
          display: { xs: 'none', md: 'block' },
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: theme => `0 4px 20px ${alpha(theme.palette.common.black, 0.07)}`,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            pointerEvents: 'none',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
            zIndex: 1
          }
        }}
      >
        <Table>
          <TableHead sx={{ 
            background: 'linear-gradient(90deg, rgba(63,81,181,0.08) 0%, rgba(63,81,181,0.03) 100%)',
            borderBottom: '2px solid',
            borderColor: theme => alpha(theme.palette.primary.main, 0.1)
          }}>
            <TableRow>
              <TableCell padding="checkbox" sx={{ width: '40px' }} />
              <TableCell sx={{ 
                fontWeight: 600, 
                py: 2,
                fontSize: '0.95rem',
                color: 'primary.dark',
                letterSpacing: '0.02em',
                width: '18%',
                pl: 2
              }}>Instructor</TableCell>
              <TableCell sx={{ 
                fontWeight: 600, 
                py: 2,
                fontSize: '0.95rem',
                color: 'primary.dark',
                letterSpacing: '0.02em',
                width: '18%',
                pl: 1
              }}>Department</TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 600, 
                py: 2,
                fontSize: '0.95rem',
                color: 'primary.dark',
                letterSpacing: '0.02em',
                width: '12%'
              }}>Total Courses</TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 600, 
                py: 2,
                fontSize: '0.95rem',
                color: 'primary.dark',
                letterSpacing: '0.02em',
                width: '14%'
              }}>Total Workload</TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 600, 
                py: 2,
                fontSize: '0.95rem',
                color: 'success.dark',
                letterSpacing: '0.02em',
                width: '12%'
              }}>Overload</TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 600, 
                py: 2,
                fontSize: '0.95rem',
                color: 'primary.dark',
                letterSpacing: '0.02em',
                width: '18%'
              }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {initialLoading ? (
              // Show multiple skeleton rows during initial loading
              Array.from(new Array(5)).map((_, index) => (
                <TableRowSkeleton key={index} />
              ))
            ) : loading ? (
              // Show fewer skeleton rows during subsequent loading
              Array.from(new Array(2)).map((_, index) => (
                <TableRowSkeleton key={index} />
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    p: 4, 
                    color: 'error.main',
                    bgcolor: theme => alpha(theme.palette.error.main, 0.05),
                    borderRadius: 2,
                    m: 2
                  }}>
                    <InfoIcon sx={{ mr: 2, fontSize: 30 }} />
                    <Typography variant="h6">{error}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : Object.entries(groupedByInstructor).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    p: 5,
                    m: 2,
                    bgcolor: theme => alpha(theme.palette.info.main, 0.05),
                    borderRadius: 2
                  }}>
                    <InfoIcon sx={{ mb: 2, color: 'info.main', fontSize: 40 }} />
                    <Typography variant="h6" gutterBottom>No courses found</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Try changing your filters or search criteria
                    </Typography>
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
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 15, 20, 25]}
          onRowsPerPageChange={(event) => {
            const newRowsPerPage = parseInt(event.target.value, 10);
            setRowsPerPage(newRowsPerPage);
            setPage(0); // Reset to first page
          }}
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
          sx={{ 
            borderTop: '1px solid',
            borderColor: 'divider',
            '.MuiTablePagination-toolbar': {
              flexWrap: 'wrap',
              gap: 1,
              p: { xs: 1, sm: 2 }
            },
            '.MuiTablePagination-displayedRows': {
              fontWeight: 500,
              display: { xs: 'none', sm: 'block' }
            },
            '.MuiTablePagination-selectLabel': {
              fontWeight: 500,
              display: { xs: 'none', sm: 'block' }
            }
          }}
        />
      </TableContainer>
    </Box>
  );
};

export default SchoolCourses;
