import React, { useEffect, useState } from 'react';
import {
  Container, Box, Typography, Card, CardContent, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Chip, CircularProgress, IconButton,
  Tooltip, alpha, TablePagination, Stack, Collapse, Divider,
  useTheme, MenuItem, Skeleton, Fade, Alert, FormControlLabel, Checkbox
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Forward as ForwardIcon,
  Reply as ReplyIcon,
  Info as InfoIcon,
  AccountBalance as FinanceIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useSnackbar } from 'notistack';

// Row component for expandable table
const InstructorRow = ({ instructor, onApprove, onReject, onResubmit, index, isSelected, onSelectInstructor, onUpdateInstructor }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [bulkRejectDialogOpen, setBulkRejectDialogOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [bulkRejectionNotes, setBulkRejectionNotes] = useState('');
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [resubmitDialogOpen, setResubmitDialogOpen] = useState(false);
  const [resubmitConfirmed, setResubmitConfirmed] = useState(false);
  const [returnToDeanDialogOpen, setReturnToDeanDialogOpen] = useState(false);
  const [returnToDeanConfirmed, setReturnToDeanConfirmed] = useState(false);
  const [approveAllConfirmed, setApproveAllConfirmed] = useState(false);
  const [rejectAllConfirmed, setRejectAllConfirmed] = useState(false);

  const allCoursesApproved = instructor.courses.every(course => 
    course.status === 'vice-director-approved' || 
    course.status === 'scientific-director-approved' ||
    course.status === 'finance-approved' ||
    course.status === 'finance-rejected' ||
    course.status === 'finance-review'
  );

  const allCoursesRejected = instructor.courses.every(course => 
    course.status === 'vice-director-rejected'
  );

  const scientificDirectorApproved = instructor.courses.every(course => 
    course.status === 'scientific-director-approved' ||
    course.status === 'finance-approved' ||
    course.status === 'finance-rejected' ||
    course.status === 'finance-review'
  );
  
  // Check for scientific director rejection
  const scientificDirectorRejected = instructor.courses.every(course => 
    course.status === 'scientific-director-rejected'
  );
  
  // Check finance status
  const isFinanceApproved = instructor.courses.every(course => 
    course.status === 'finance-approved'
  );
  
  const isFinanceRejected = instructor.courses.every(course => 
    course.status === 'finance-rejected'
  );
  
  const isFinanceReview = instructor.courses.every(course => 
    course.status === 'finance-review'
  );

  const hasApprovableCourses = instructor.courses.some(course => 
    course.status === 'dean-approved' && 
    !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
  );

  const handleBulkApproveClick = () => {
    if (allCoursesApproved) {
      toast.info('All courses are already approved');
      return;
    }

    const approvableCourses = instructor.courses.filter(course => 
      course.status === 'dean-approved' && 
      !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
    );

    if (approvableCourses.length === 0) {
      toast.info('No courses available for approval');
      return;
    }

    setConfirmDialogOpen(true);
  };

  const handleBulkApproveInstructor = async () => {
    try {
      setIsApproving(true);
      const approvableCourses = instructor.courses.filter(course => 
        course.status === 'dean-approved' && 
        !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
      );

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/courses/bulk-approve-vice-director/${instructor._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            courseIds: approvableCourses.map(course => course._id),
            action: 'approve'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve courses');
      }

      // Update the local state to reflect the changes
      const updatedCourses = instructor.courses.map(course => {
        if (approvableCourses.some(ac => ac._id === course._id)) {
          return { ...course, status: 'vice-director-approved' };
        }
        return course;
      });
      
      // Update the instructor in the parent component
      const updatedInstructor = { ...instructor, courses: updatedCourses };
      onUpdateInstructor(updatedInstructor);
      
      toast.success(`Successfully approved all courses for ${instructor.name}`);
      setConfirmDialogOpen(false);
      onApprove(); // Refresh the list
    } catch (error) {
      console.error('Error in instructor bulk approval:', error);
      toast.error(`Failed to approve courses for ${instructor.name}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleBulkRejectClick = () => {
    if (allCoursesApproved) {
      toast.info('All courses are already approved or rejected');
      return;
    }

    const rejectableCourses = instructor.courses.filter(course => 
      course.status === 'dean-approved' && 
      !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
    );

    if (rejectableCourses.length === 0) {
      toast.info('No courses available for rejection');
      return;
    }

    setBulkRejectDialogOpen(true);
  };

  const handleBulkRejectInstructor = async () => {
    try {
      setIsRejecting(true);
      const rejectableCourses = instructor.courses.filter(course => 
        course.status === 'dean-approved' && 
        !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
      );

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/courses/bulk-reject/${instructor._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            courseIds: rejectableCourses.map(course => course._id),
            notes: bulkRejectionNotes
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject courses');
      }

      // Update the local state to reflect the changes
      const updatedCourses = instructor.courses.map(course => {
        if (rejectableCourses.some(rc => rc._id === course._id)) {
          return { ...course, status: 'vice-director-rejected' };
        }
        return course;
      });
      
      // Update the instructor in the parent component
      const updatedInstructor = { ...instructor, courses: updatedCourses };
      onUpdateInstructor(updatedInstructor);
      
      toast.success(`Successfully rejected all courses for ${instructor.name}`);
      setBulkRejectDialogOpen(false);
      setBulkRejectionNotes('');
      onApprove(); // Refresh the list
    } catch (error) {
      console.error('Error in instructor bulk rejection:', error);
      toast.error(`Failed to reject courses for ${instructor.name}`);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleResubmitClick = async () => {
    try {
      setIsResubmitting(true);
      const resubmittableCourses = instructor.courses.filter(course => 
        course.status === 'scientific-director-rejected'
      );

      if (resubmittableCourses.length === 0) {
        toast.info('No courses available for resubmission');
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/courses/bulk-resubmit/${instructor._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            courseIds: resubmittableCourses.map(course => course._id)
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to resubmit courses');
      }

      toast.success(`Successfully resubmitted all courses for ${instructor.name}`);
      onApprove(); // Refresh the list
      window.location.reload(); // Force page refresh to update all statuses
    } catch (error) {
      console.error('Error in instructor bulk resubmission:', error);
      toast.error(`Failed to resubmit courses for ${instructor.name}`);
    } finally {
      setIsResubmitting(false);
    }
  };

  const handleResubmitConfirm = () => {
    setResubmitConfirmed(true);
    handleResubmitClick();
  };

  const handleReturnToDeanClick = async () => {
    try {
      setIsRejecting(true);
      const rejectableCourses = instructor.courses.filter(course => 
        course.status === 'scientific-director-rejected'
      );

      if (rejectableCourses.length === 0) {
        toast.info('No courses available for rejection');
        return;
      }

      if (!bulkRejectionNotes.trim()) {
        toast.error('Please provide rejection notes');
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/courses/bulk-reject/${instructor._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            courseIds: rejectableCourses.map(course => course._id),
            notes: bulkRejectionNotes
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject courses');
      }

      toast.success(`Successfully returned courses to Dean for ${instructor.name}`);
      setReturnToDeanDialogOpen(false);
      setBulkRejectionNotes('');
      setReturnToDeanConfirmed(false);
      onReject(); // Refresh the list
    } catch (error) {
      console.error('Error in instructor bulk rejection:', error);
      toast.error(`Failed to return courses to Dean for ${instructor.name}`);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleReturnToDeanConfirm = () => {
    setReturnToDeanConfirmed(true);
    handleReturnToDeanClick();
  };

  const renderStatusBox = () => {
    // Show finance approved status
    if (isFinanceApproved) {
      return (
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
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: alpha('#2e7d32', 0.85), 
              fontWeight: 600 
            }}
          >
            Finance Approved
          </Typography>
        </Box>
      );
    }
    
    // Show finance rejected status
    if (isFinanceRejected) {
      return (
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
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: alpha(theme.palette.error.main, 0.85), 
              fontWeight: 600 
            }}
          >
            Finance Rejected
          </Typography>
        </Box>
      );
    }
    
    // Show finance review status
    if (isFinanceReview) {
      return (
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
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: alpha(theme.palette.info.main, 0.85), 
              fontWeight: 600 
            }}
          >
            Under Finance Review
          </Typography>
        </Box>
      );
    }

    // Show vice director rejected status
    if (allCoursesRejected) {
      return (
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
          <ReplyIcon sx={{ color: alpha(theme.palette.error.main, 0.7) }} />
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: alpha(theme.palette.error.main, 0.85), 
              fontWeight: 600 
            }}
          >
            Returned to Dean for Review
          </Typography>
        </Box>
      );
    }

    // Show scientific director approved status
    if (scientificDirectorApproved) {
      return (
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
          <CheckIcon sx={{ color: alpha('#388e3c', 0.7) }} />
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: alpha('#2e7d32', 0.85), 
              fontWeight: 600 
            }}
          >
            Approved by Scientific Director
          </Typography>
        </Box>
      );
    }
    
    // Show vice director approved status
    if (allCoursesApproved) {
      return (
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
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: alpha('#1565c0', 0.85), 
              fontWeight: 600 
            }}
          >
            Approved & Forwarded to Scientific Director
          </Typography>
        </Box>
      );
    }

    return null;
  };

  return (
    <>
      <TableRow 
        sx={{ 
          '& > *': { borderBottom: 'unset' },
          bgcolor: scientificDirectorApproved ? alpha(theme.palette.success.main, 0.04) : 
                  allCoursesApproved ? alpha(theme.palette.primary.main, 0.04) :
                  allCoursesRejected ? alpha(theme.palette.error.main, 0.04) : 'inherit'
        }}
        data-instructor-id={instructor._id}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {instructor.name}
        </TableCell>
        <TableCell>{instructor.department}</TableCell>
        <TableCell>{instructor.school}</TableCell>
        <TableCell align="center">{instructor.courses.length}</TableCell>
        <TableCell align="center">
          {(() => {
            // Calculate total workload using the correct formula
            const courseLoads = instructor.courses.reduce((sum, course) => {
              const lectureLoad = (course.Hourfor?.lecture || 0) * (course.Number_of_Sections?.lecture || 1);
              const labLoad = (course.Hourfor?.lab || 0) * 0.67 * (course.Number_of_Sections?.lab || 1);
              const tutorialLoad = (course.Hourfor?.tutorial || 0) * 0.67 * (course.Number_of_Sections?.tutorial || 1);
              const courseLoad = lectureLoad + labLoad + tutorialLoad;
              return sum + courseLoad;
            }, 0);
            
            // Add additional hours
            const hdpHours = instructor.hours?.hdpHour || 0;
            const positionHours = instructor.hours?.positionHour || 0;
            const batchAdvisorHours = instructor.hours?.batchAdvisor || 0;
            const totalAdditionalHours = hdpHours + positionHours + batchAdvisorHours;
            
            // Total loads = course loads + additional hours
            const totalLoads = courseLoads + totalAdditionalHours;
            
            return Math.round(totalLoads * 100) / 100; // Round to 2 decimal places
          })()}
        </TableCell>
        <TableCell align="center">
          {(() => {
            // Calculate total workload using the correct formula
            const courseLoads = instructor.courses.reduce((sum, course) => {
              const lectureLoad = (course.Hourfor?.lecture || 0) * (course.Number_of_Sections?.lecture || 1);
              const labLoad = (course.Hourfor?.lab || 0) * 0.67 * (course.Number_of_Sections?.lab || 1);
              const tutorialLoad = (course.Hourfor?.tutorial || 0) * 0.67 * (course.Number_of_Sections?.tutorial || 1);
              const courseLoad = lectureLoad + labLoad + tutorialLoad;
              return sum + courseLoad;
            }, 0);
            
            // Add additional hours
            const hdpHours = instructor.hours?.hdpHour || 0;
            const positionHours = instructor.hours?.positionHour || 0;
            const batchAdvisorHours = instructor.hours?.batchAdvisor || 0;
            const totalAdditionalHours = hdpHours + positionHours + batchAdvisorHours;
            
            // Total loads = course loads + additional hours
            const totalLoads = courseLoads + totalAdditionalHours;
            
            // Calculate overload
            const overload = totalLoads - 12;
            const roundedOverload = Math.round(overload * 100) / 100;
            // Show 0 instead of negative values
            const displayValue = roundedOverload > 0 ? roundedOverload : 0;
            
            return (
              <Tooltip title="Overload = Total Loads - 12 (shows 0 if negative)">
                <Chip 
                  label={displayValue} 
                  color={roundedOverload > 0 ? "success" : "default"} 
                  size="small" 
                  sx={{ 
                    minWidth: 40,
                    height: { xs: 22, sm: 24 },
                    fontSize: { xs: '0.7rem', sm: '0.75rem' } 
                  }} 
                />
              </Tooltip>
            );
          })()}
        </TableCell>
        <TableCell>
          {hasApprovableCourses && (
            <Stack direction="row" spacing={1}>
              <LoadingButton
                variant="contained"
                color="primary"
                size="small"
                onClick={handleBulkApproveClick}
                loading={isApproving}
                startIcon={<CheckIcon />}
              >
                Approve All
              </LoadingButton>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={handleBulkRejectClick}
                startIcon={<CloseIcon />}
                data-action="reject"
              >
                Reject All
              </Button>
            </Stack>
          )}
          {(allCoursesApproved || allCoursesRejected) && renderStatusBox()}
          {scientificDirectorRejected && (
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => setResubmitDialogOpen(true)}
                startIcon={<ReplyIcon />}
              >
                Resubmit to S.D
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => setReturnToDeanDialogOpen(true)}
                startIcon={<CloseIcon />}
              >
                Return to Dean
              </Button>
            </Stack>
          )}
        </TableCell>
      </TableRow>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false);
          setApproveAllConfirmed(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Course Approval
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              You are about to approve all eligible courses for:
            </Typography>
            <Box sx={{ 
              mb: 1,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.15),
            }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ForwardIcon sx={{ color: theme.palette.primary.main }} />
                {instructor.name} ({instructor.courses.filter(course => 
                  course.status === 'dean-approved' && 
                  !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
                ).length} courses)
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
              All selected courses will be approved and forwarded to the Scientific Director for final review.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={approveAllConfirmed}
                    onChange={(e) => setApproveAllConfirmed(e.target.checked)}
                    name="approveAllConfirmed"
                  />
                }
                label="I confirm that I want to approve all eligible courses for this instructor."
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setConfirmDialogOpen(false);
              setApproveAllConfirmed(false);
            }}
            color="inherit"
            disabled={isApproving}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleBulkApproveInstructor}
            loading={isApproving}
            color="primary"
            variant="contained"
            autoFocus
            disabled={!approveAllConfirmed}
          >
            Confirm Approval
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Bulk Rejection Dialog */}
      <Dialog
        open={bulkRejectDialogOpen}
        onClose={() => {
          setBulkRejectDialogOpen(false);
          setRejectAllConfirmed(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Course Rejection
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              You are about to reject all eligible courses for:
            </Typography>
            <Box sx={{ 
              mb: 1,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.error.main, 0.04),
              border: '1px solid',
              borderColor: alpha(theme.palette.error.main, 0.15),
            }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CloseIcon sx={{ color: theme.palette.error.main }} />
                {instructor.name} ({instructor.courses.filter(course => 
                  course.status === 'dean-approved' && 
                  !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
                ).length} courses)
              </Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              margin="normal"
              label="Rejection Notes (Required)"
              value={bulkRejectionNotes}
              onChange={(e) => setBulkRejectionNotes(e.target.value)}
              error={!bulkRejectionNotes.trim()}
              helperText={!bulkRejectionNotes.trim() ? "Please provide a reason for rejection" : ""}
              required
            />
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rejectAllConfirmed}
                    onChange={(e) => setRejectAllConfirmed(e.target.checked)}
                    name="rejectAllConfirmed"
                  />
                }
                label="I confirm that I want to reject all eligible courses for this instructor."
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setBulkRejectDialogOpen(false);
              setBulkRejectionNotes('');
              setRejectAllConfirmed(false);
            }}
            color="inherit"
            disabled={isRejecting}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleBulkRejectInstructor}
            loading={isRejecting}
            color="error"
            variant="contained"
            disabled={!bulkRejectionNotes.trim() || !rejectAllConfirmed}
            autoFocus
          >
            Confirm Rejection
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Resubmit Confirmation Dialog */}
      <Dialog
        open={resubmitDialogOpen}
        onClose={() => {
          setResubmitDialogOpen(false);
          setResubmitConfirmed(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Resubmission
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              You are about to resubmit all rejected courses for:
            </Typography>
            <Box sx={{ 
              mb: 1,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.15),
            }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReplyIcon sx={{ color: theme.palette.primary.main }} />
                {instructor.name} ({instructor.courses.filter(course => 
                  course.status === 'scientific-director-rejected'
                ).length} courses)
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
              All selected courses will be resubmitted to the Scientific Director for review.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to proceed?
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={resubmitConfirmed}
                    onChange={(e) => setResubmitConfirmed(e.target.checked)}
                    name="resubmitConfirmed"
                  />
                }
                label="I confirm that I want to resubmit the courses."
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setResubmitDialogOpen(false);
              setResubmitConfirmed(false);
            }}
            color="inherit"
            disabled={isResubmitting}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleResubmitConfirm}
            loading={isResubmitting}
            color="primary"
            variant="contained"
            disabled={!resubmitConfirmed}
            autoFocus
          >
            Confirm Resubmission
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Return to Dean Confirmation Dialog */}
      <Dialog
        open={returnToDeanDialogOpen}
        onClose={() => {
          setReturnToDeanDialogOpen(false);
          setReturnToDeanConfirmed(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Return to Dean
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              You are about to return all rejected courses to the Dean for:
            </Typography>
            <Box sx={{ 
              mb: 1,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.error.main, 0.04),
              border: '1px solid',
              borderColor: alpha(theme.palette.error.main, 0.15),
            }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CloseIcon sx={{ color: theme.palette.error.main }} />
                {instructor.name} ({instructor.courses.filter(course => 
                  course.status === 'scientific-director-rejected'
                ).length} courses)
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
              All selected courses will be returned to the Dean for review.
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="error.main" gutterBottom>
                Rejection Reason (Required)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                margin="normal"
                label="Explain why these courses are being returned to the Dean"
                value={bulkRejectionNotes}
                onChange={(e) => setBulkRejectionNotes(e.target.value)}
                error={!bulkRejectionNotes.trim()}
                helperText={!bulkRejectionNotes.trim() ? "Please provide a reason for returning these courses" : ""}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'error.main',
                    },
                  },
                }}
              />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to proceed?
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={returnToDeanConfirmed}
                    onChange={(e) => setReturnToDeanConfirmed(e.target.checked)}
                    name="returnToDeanConfirmed"
                  />
                }
                label="I confirm that I want to return the courses to the Dean."
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setReturnToDeanDialogOpen(false);
              setBulkRejectionNotes('');
              setReturnToDeanConfirmed(false);
            }}
            color="inherit"
            disabled={isRejecting}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleReturnToDeanConfirm}
            loading={isRejecting}
            color="error"
            variant="contained"
            disabled={!returnToDeanConfirmed || !bulkRejectionNotes.trim()}
            autoFocus
          >
            Confirm Return to Dean
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              {/* Additional Hours Section - Show only once */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Additional Hours
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2">HDP Hours:</Typography>
                    <Typography>{instructor.hours?.hdpHour || 0}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2">Position Hours:</Typography>
                    <Typography>{instructor.hours?.positionHour || 0}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2">Batch Advisor Hours:</Typography>
                    <Typography>{instructor.hours?.batchAdvisor || 0}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" color="primary">Total Additional Hours:</Typography>
                    <Typography color="primary" fontWeight="bold">
                      {(instructor.hours?.hdpHour || 0) + 
                       (instructor.hours?.positionHour || 0) + 
                       (instructor.hours?.batchAdvisor || 0)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Courses Section */}
              <Typography variant="h6" gutterBottom component="div" sx={{ mt: 2 }}>
                Courses
              </Typography>
              
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Title</TableCell>
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
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell sx={{ bgcolor: alpha('#42a5f5', 0.05) }}>Credit</TableCell>
                    <TableCell sx={{ bgcolor: alpha('#42a5f5', 0.05) }}>Lecture</TableCell>
                    <TableCell sx={{ bgcolor: alpha('#42a5f5', 0.05) }}>Lab</TableCell>
                    <TableCell sx={{ bgcolor: alpha('#42a5f5', 0.05) }}>Tutorial</TableCell>
                    <TableCell sx={{ bgcolor: alpha('#66bb6a', 0.05) }}>Lecture</TableCell>
                    <TableCell sx={{ bgcolor: alpha('#66bb6a', 0.05) }}>Lab</TableCell>
                    <TableCell sx={{ bgcolor: alpha('#66bb6a', 0.05) }}>Tutorial</TableCell>
                    <TableCell sx={{ bgcolor: alpha('#ff9800', 0.05) }}></TableCell>
                    <TableCell sx={{ bgcolor: alpha('#9c27b0', 0.05) }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {instructor.courses.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell component="th" scope="row">
                        {course.code}
                      </TableCell>
                      <TableCell>{course.title}</TableCell>
                      <TableCell>{course.Hourfor?.creaditHours || 0}</TableCell>
                      <TableCell>{course.Hourfor?.lecture || 0}</TableCell>
                      <TableCell>{course.Hourfor?.lab || 0}</TableCell>
                      <TableCell>{course.Hourfor?.tutorial || 0}</TableCell>
                      <TableCell>{course.Number_of_Sections?.lecture || 0}</TableCell>
                      <TableCell>{course.Number_of_Sections?.lab || 0}</TableCell>
                      <TableCell>{course.Number_of_Sections?.tutorial || 0}</TableCell>
                      <TableCell>
                        <Tooltip title="(Lecture Hours * Lecture Sections) + (Lab Hours * 0.67 * Lab Sections) + (Tutorial Hours * 0.67 * Tutorial Sections)">
                          <Chip
                            label={
                              Math.round((
                                ((course.Hourfor?.lecture || 0) * (course.Number_of_Sections?.lecture || 1)) +
                                ((course.Hourfor?.lab || 0) * 0.67 * (course.Number_of_Sections?.lab || 1)) +
                                ((course.Hourfor?.tutorial || 0) * 0.67 * (course.Number_of_Sections?.tutorial || 1))
                              ) * 100) / 100
                            }
                            size="small"
                            color="warning"
                            sx={{ minWidth: 40, fontSize: '0.75rem' }}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={course.status} 
                          color={
                            course.status === 'vice-director-approved' ? 'primary' :
                            course.status === 'vice-director-rejected' ? 'error' :
                            course.status === 'scientific-director-approved' ? 'success' :
                            course.status === 'scientific-director-rejected' ? 'error' :
                            'default'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Total Row */}
                  <TableRow sx={{ 
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    fontWeight: 'bold'
                  }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>Total Hours</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {instructor.courses.reduce((sum, course) => sum + (course.Hourfor?.creaditHours || 0), 0)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {instructor.courses.reduce((sum, course) => sum + (course.Hourfor?.lecture || 0), 0)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {instructor.courses.reduce((sum, course) => sum + (course.Hourfor?.lab || 0), 0)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {instructor.courses.reduce((sum, course) => sum + (course.Hourfor?.tutorial || 0), 0)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {instructor.courses.reduce((sum, course) => sum + (course.Number_of_Sections?.lecture || 0), 0)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {instructor.courses.reduce((sum, course) => sum + (course.Number_of_Sections?.lab || 0), 0)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {instructor.courses.reduce((sum, course) => sum + (course.Number_of_Sections?.tutorial || 0), 0)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {Math.round(instructor.courses.reduce((sum, course) => {
                        const courseLoad = 
                          ((course.Hourfor?.lecture || 0) * (course.Number_of_Sections?.lecture || 1)) +
                          ((course.Hourfor?.lab || 0) * 0.67 * (course.Number_of_Sections?.lab || 1)) +
                          ((course.Hourfor?.tutorial || 0) * 0.67 * (course.Number_of_Sections?.tutorial || 1));
                        return sum + courseLoad;
                      }, 0) * 100) / 100}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                  
                  {/* Add Course Hours Total Row with the correct formula */}
                  <TableRow sx={{ 
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.15),
                    fontWeight: 'bold'
                  }}>
                    <TableCell colSpan={9} align="right" sx={{ fontWeight: 'bold' }}>
                      Course Hours Total:
                    </TableCell>
                    <TableCell align="right" colSpan={2}>
                      <Tooltip title="Total Loads = (Lecture Hours * Number of Sections Lecture) + (Lab Hours * 0.67 * Number of Sections Lab) + (Tutorial Hours * 0.67 * Number of Sections Tutorial)">
                        <Chip
                          label={
                            Math.round(instructor.courses.reduce((sum, course) => {
                              // Calculate each course's load using the correct formula
                              const lectureLoad = (course.Hourfor?.lecture || 0) * (course.Number_of_Sections?.lecture || 1);
                              const labLoad = (course.Hourfor?.lab || 0) * 0.67 * (course.Number_of_Sections?.lab || 1);
                              const tutorialLoad = (course.Hourfor?.tutorial || 0) * 0.67 * (course.Number_of_Sections?.tutorial || 1);
                              const courseLoad = lectureLoad + labLoad + tutorialLoad;
                              return sum + courseLoad;
                            }, 0) * 100) / 100
                          }
                          color="primary"
                          sx={{ 
                            minWidth: 60, 
                            fontWeight: 'bold',
                            fontSize: '0.875rem'
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  
                  {/* Add Additional Hours Row */}
                  <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.info.main, 0.1) }}>
                    <TableCell colSpan={9} align="right" sx={{ fontWeight: 'bold' }}>
                      Additional Hours:
                    </TableCell>
                    <TableCell align="right" colSpan={2}>
                      <Tooltip title="HDP Hours + Position Hours + Batch Advisor Hours">
                        <Chip
                          label={
                            (instructor.hours?.hdpHour || 0) + 
                            (instructor.hours?.positionHour || 0) + 
                            (instructor.hours?.batchAdvisor || 0)
                          }
                          color="info"
                          sx={{ 
                            minWidth: 60, 
                            fontWeight: 'bold',
                            fontSize: '0.875rem'
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  
                  {/* Add Total Loads Row */}
                  <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.success.main, 0.1) }}>
                    <TableCell colSpan={9} align="right" sx={{ fontWeight: 'bold' }}>
                      Total Loads:
                    </TableCell>
                    <TableCell align="right" colSpan={2}>
                      <Tooltip title="Course Hours Total + Additional Hours">
                        {(() => {
                          // Calculate course loads
                          const courseLoads = instructor.courses.reduce((sum, course) => {
                            const lectureLoad = (course.Hourfor?.lecture || 0) * (course.Number_of_Sections?.lecture || 1);
                            const labLoad = (course.Hourfor?.lab || 0) * 0.67 * (course.Number_of_Sections?.lab || 1);
                            const tutorialLoad = (course.Hourfor?.tutorial || 0) * 0.67 * (course.Number_of_Sections?.tutorial || 1);
                            const courseLoad = lectureLoad + labLoad + tutorialLoad;
                            return sum + courseLoad;
                          }, 0);
                          
                          // Add additional hours
                          const additionalHours = 
                            (instructor.hours?.hdpHour || 0) + 
                            (instructor.hours?.positionHour || 0) + 
                            (instructor.hours?.batchAdvisor || 0);
                          
                          // Calculate total loads
                          const totalLoads = courseLoads + additionalHours;
                          
                          return (
                            <Chip
                              label={Math.round(totalLoads * 100) / 100}
                              color="success"
                              sx={{ 
                                minWidth: 60, 
                                fontWeight: 'bold',
                                fontSize: '0.875rem'
                              }}
                            />
                          );
                        })()} 
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  
                  {/* Add Overload Row */}
                  <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.warning.main, 0.05) }}>
                    <TableCell colSpan={9} align="right" sx={{ fontWeight: 'bold' }}>
                      Overload:
                    </TableCell>
                    <TableCell align="right" colSpan={2}>
                      {(() => {
                        // Calculate course loads
                        const courseLoads = instructor.courses.reduce((sum, course) => {
                          const lectureLoad = (course.Hourfor?.lecture || 0) * (course.Number_of_Sections?.lecture || 1);
                          const labLoad = (course.Hourfor?.lab || 0) * 0.67 * (course.Number_of_Sections?.lab || 1);
                          const tutorialLoad = (course.Hourfor?.tutorial || 0) * 0.67 * (course.Number_of_Sections?.tutorial || 1);
                          const courseLoad = lectureLoad + labLoad + tutorialLoad;
                          return sum + courseLoad;
                        }, 0);
                        
                        // Add additional hours
                        const additionalHours = 
                          (instructor.hours?.hdpHour || 0) + 
                          (instructor.hours?.positionHour || 0) + 
                          (instructor.hours?.batchAdvisor || 0);
                        
                        // Calculate total loads
                        const totalLoads = courseLoads + additionalHours;
                        
                        // Calculate overload (Total Loads - 12)
                        const overload = totalLoads - 12;
                        const roundedOverload = Math.round(overload * 100) / 100;
                        // Show 0 instead of negative values
                        const displayValue = roundedOverload > 0 ? roundedOverload : 0;
                        
                        return (
                          <Chip
                            label={displayValue}
                            color={roundedOverload > 0 ? "success" : "default"}
                            sx={{ 
                              minWidth: 60, 
                              fontWeight: 'bold',
                              fontSize: '0.875rem'
                            }}
                          />
                        );
                      })()} 
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              {/* Scientific Director Rejection Details - Only show when rejected */}
              {scientificDirectorRejected && (
                <Box sx={{ 
                  mt: 4, 
                  p: 3, 
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.error.main, 0.04),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.error.main, 0.15),
                  width: '100%'
                }}>
                  <Typography variant="subtitle1" sx={{ 
                    mb: 1.5, 
                    color: theme.palette.error.dark,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <CloseIcon fontSize="small" />
                    Rejection Details
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Rejected By:
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Scientific Director
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Rejection Date:
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {instructor.courses[0]?.updatedAt ? new Date(instructor.courses[0].updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Rejection Reason:
                      </Typography>
                      <Paper elevation={0} sx={{ 
                        p: 2, 
                        bgcolor: alpha(theme.palette.error.main, 0.02),
                        border: '1px solid',
                        borderColor: alpha(theme.palette.error.main, 0.1),
                        borderRadius: 1
                      }}>
                        <Typography variant="body1">
                          {instructor.courses[0]?.rejectionReason || 'No reason provided'}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        These courses need to be reviewed and resubmitted by the Vice Director.
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const TableRowSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton variant="text" /></TableCell>
    <TableCell><Skeleton variant="text" /></TableCell>
    <TableCell><Skeleton variant="text" /></TableCell>
    <TableCell><Skeleton variant="text" /></TableCell>
    <TableCell><Skeleton variant="text" /></TableCell>
    <TableCell><Skeleton variant="text" width={120} /></TableCell>
    <TableCell align="right">
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
      </Stack>
    </TableCell>
  </TableRow>
);

const ViceDirectorCourses = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalInstructors, setTotalInstructors] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedInstructorForReject, setSelectedInstructorForReject] = useState(null);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [bulkApprovalDialogOpen, setBulkApprovalDialogOpen] = useState(false);
  const [coursesToApprove, setCoursesToApprove] = useState([]);
  const [bulkRejectDialogOpen, setBulkRejectDialogOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [bulkRejectionNotes, setBulkRejectionNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [bulkApprovalConfirmed, setBulkApprovalConfirmed] = useState(false);
  const [bulkRejectionConfirmed, setBulkRejectionConfirmed] = useState(false);

  // Prepare bulk approval
  const handleBulkApprovalClick = () => {
    const eligibleCourses = instructors
      .filter(instructor => 
        instructor.courses.some(course => 
          course.status === 'dean-approved' && 
          !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
        )
      )
      .map(instructor => ({
        instructorId: instructor._id,
        instructorName: instructor.name,
        courses: instructor.courses
          .filter(course => 
            course.status === 'dean-approved' && 
            !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
          )
      }))
      .filter(item => item.courses.length > 0);

    if (eligibleCourses.length === 0) {
      toast.info('No courses available for bulk approval');
      return;
    }

    setCoursesToApprove(eligibleCourses);
    setBulkApprovalDialogOpen(true);
  };

  // Add bulk approval function
  const handleBulkApprove = async () => {
    try {
      setIsSubmitting(true);
      
      if (coursesToApprove.length === 0) {
        toast.info('No courses available for bulk approval');
        return;
      }

      // Keep track of all updated instructors
      const updatedInstructorsList = [];

      // Call API for each instructor's courses
      await Promise.all(
        coursesToApprove.map(async ({ instructorId, courses, instructorName }) => {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/courses/bulk-approve-vice-director/${instructorId}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                courseIds: courses.map(course => course._id),
                action: 'approve'
              })
            }
          );

          if (!response.ok) {
            throw new Error('Failed to approve courses');
          }

          // Find the full instructor object
          const instructor = instructors.find(i => i._id === instructorId);
          if (instructor) {
            // Update the courses status locally
            const updatedCourses = instructor.courses.map(course => {
              if (courses.some(c => c._id === course._id)) {
                return { ...course, status: 'vice-director-approved' };
              }
              return course;
            });
            
            // Add to the list of updated instructors
            updatedInstructorsList.push({ ...instructor, courses: updatedCourses });
          }
        })
      );

      // Update the instructors state with all the changes
      setInstructors(prevInstructors => {
        return prevInstructors.map(instructor => {
          const updatedInstructor = updatedInstructorsList.find(ui => ui._id === instructor._id);
          return updatedInstructor || instructor;
        });
      });

      toast.success('Successfully approved all eligible courses');
      setBulkApprovalDialogOpen(false);
      setBulkApprovalConfirmed(false);
    } catch (error) {
      console.error('Error in bulk approval:', error);
      toast.error('Failed to complete bulk approval');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/courses/vice-director-courses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      
      // Group courses by instructor and fetch instructor hours
      const instructorMap = new Map();
      const instructorPromises = [];

      data.data.forEach(course => {
        if (course.instructor) {
          const instructorId = course.instructor._id;
          if (!instructorMap.has(instructorId)) {
            instructorMap.set(instructorId, {
              _id: instructorId,
              name: course.instructor.name,
              school: course.instructor.school,
              department: course.instructor.department,
              courses: [],
              hours: null
            });
            // Fetch instructor hours
            const promise = fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/users/hours/${instructorId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }).then(res => res.json());
            instructorPromises.push({ id: instructorId, promise });
          }
          instructorMap.get(instructorId).courses.push(course);
        }
      });

      // Wait for all instructor hours to be fetched
      const hoursResults = await Promise.all(instructorPromises.map(({ promise }) => promise));
      instructorPromises.forEach(({ id }, index) => {
        if (instructorMap.has(id) && hoursResults[index].status === 'success') {
          instructorMap.get(id).hours = hoursResults[index].data;
        }
      });

      const instructorList = Array.from(instructorMap.values());
      
      // Sort instructors to prioritize those with pending or not approved courses
      const sortedInstructorList = instructorList.sort((a, b) => {
        // Check if instructor A has pending/not approved courses
        const aHasPendingCourses = a.courses.some(course => 
          course.status === 'dean-approved' || 
          course.status === 'scientific-director-rejected'
        );
        
        // Check if instructor B has pending/not approved courses
        const bHasPendingCourses = b.courses.some(course => 
          course.status === 'dean-approved' || 
          course.status === 'scientific-director-rejected'
        );
        
        // Prioritize instructors with pending courses
        if (aHasPendingCourses && !bHasPendingCourses) return -1;
        if (!aHasPendingCourses && bHasPendingCourses) return 1;
        
        // If both have the same status, sort alphabetically by name
        return a.name.localeCompare(b.name);
      });
      
      setInstructors(sortedInstructorList);
      setTotalInstructors(sortedInstructorList.length);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorCourses();
  }, []);
  
  // Reset to first page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, filterStatus, filterSchool, filterDepartment]);

  const handleReviewClick = (instructor, action) => {
    setSelectedInstructor(instructor);
    if (action === 'reject') {
      setReviewDialogOpen(true);
    } else {
      setApprovalDialogOpen(true);
    }
  };

  const handleApprove = async (instructor) => {
    setIsSubmitting(true);
    const errors = [];
    let successCount = 0;

    try {
      // Process all courses for the instructor
      for (const course of instructor.courses) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/courses/${course._id}/vice-director-review`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              action: 'approve'
            })
          });

          if (!response.ok) {
            const data = await response.json();
            errors.push(`Failed to approve ${course.code}: ${data.message}`);
            continue;
          }

          successCount++;
          // Update course status in the UI without removing it
          const updatedInstructors = instructors.map(inst => {
            if (inst._id === instructor._id) {
              return {
                ...inst,
                courses: inst.courses.map(c => {
                  if (c._id === course._id) {
                    return { ...c, status: 'vice-director-approved' };
                  }
                  return c;
                })
              };
            }
            return inst;
          });
          setInstructors(updatedInstructors);
        } catch (error) {
          errors.push(`Error processing ${course.code}: ${error.message}`);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully approved ${successCount} courses`);
      }

      if (errors.length > 0) {
        toast.error(`Failed to process some courses: ${errors.join(', ')}`);
      }
    } catch (error) {
      toast.error('Error processing approval');
    } finally {
      setIsSubmitting(false);
      setApprovalDialogOpen(false);
    }
  };

  const handleRejectClick = (instructor) => {
    // Instead of showing a second dialog, use the instructor's bulk reject dialog directly
    if (instructor && instructor.courses && instructor.courses.length > 0) {
      // Check if any courses are eligible for rejection
      const eligibleCourses = instructor.courses.filter(course => 
        course.status === 'dean-approved' && 
        !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
      );
      
      if (eligibleCourses.length > 0) {
        // Use the existing bulk reject functionality in the instructor row
        const instructorRow = document.querySelector(`[data-instructor-id="${instructor._id}"]`);
        if (instructorRow) {
          const rejectButton = instructorRow.querySelector('[data-action="reject"]');
          if (rejectButton) {
            rejectButton.click();
            return;
          }
        }
      }
    }
    
    // Fallback to the old method if something goes wrong
    setSelectedInstructorForReject(instructor);
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      const courseIds = selectedInstructorForReject.courses.map(course => course._id);
      
      for (const courseId of courseIds) {
        await axios.post(`http://localhost:5000/api/v1/courses/${courseId}/vice-director-review`, {
          action: 'reject',
          comment: rejectionReason,
          instructorId: selectedInstructorForReject._id
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      setRejectDialogOpen(false);
      setRejectionReason('');
      fetchInstructorCourses();
      toast.success('Courses rejected successfully');
    } catch (error) {
      console.error('Error rejecting courses:', error);
      toast.error(error.response?.data?.message || 'Error rejecting courses');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalConfirm = () => {
    handleApprove(selectedInstructor);
    setApprovalDialogOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle selecting an instructor for bulk operations
  const handleSelectInstructor = (instructorId) => {
    setSelectedInstructors(prev => {
      if (prev.includes(instructorId)) {
        return prev.filter(id => id !== instructorId);
      } else {
        return [...prev, instructorId];
      }
    });
  };

  // Get unique schools and departments
  const schools = [...new Set(instructors.map(instructor => instructor.school))].sort();
  const allDepartments = [...new Set(instructors.map(instructor => instructor.department))].sort();
  
  // Get filtered departments based on selected school
  const departments = filterSchool === 'all' 
    ? allDepartments // Show all departments when no school selected
    : [...new Set(instructors
        .filter(instructor => instructor.school === filterSchool)
        .map(instructor => instructor.department)
      )].sort();

  // Handle school change
  const handleSchoolChange = (event) => {
    const newSchool = event.target.value;
    setFilterSchool(newSchool);
    // Only reset department if the selected department doesn't exist in the new school
    if (newSchool !== 'all') {
      const departmentsInNewSchool = [...new Set(instructors
        .filter(instructor => instructor.school === newSchool)
        .map(instructor => instructor.department)
      )];
      if (!departmentsInNewSchool.includes(filterDepartment)) {
        setFilterDepartment('all');
      }
    }
  };

  // Filter instructors based on search and filters
  let filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = searchTerm.trim() === '' ||
      instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.courses.some(course => course.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSchool = filterSchool === 'all' || instructor.school === filterSchool;
    const matchesDepartment = filterDepartment === 'all' || instructor.department === filterDepartment;
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'pending' && instructor.courses.some(course => 
        course.status === 'dean-approved' && 
        !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
      )) ||
      (filterStatus === 'approved' && instructor.courses.every(course => 
        course.status === 'vice-director-approved' || course.status === 'scientific-director-approved'
      )) ||
      (filterStatus === 'rejected' && instructor.courses.every(course => 
        course.status === 'vice-director-rejected'
      ));

    return matchesSearch && matchesSchool && matchesDepartment && matchesStatus;
  });
  
  // Update total count for pagination
  const filteredInstructorsCount = filteredInstructors.length;
  
  // Sort instructors: pending at top, then by most recent status change
  filteredInstructors.sort((a, b) => {
    // Check if instructor has pending courses (dean-approved)
    const aHasPending = a.courses.some(course => 
      course.status === 'dean-approved' && 
      !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
    );
    
    const bHasPending = b.courses.some(course => 
      course.status === 'dean-approved' && 
      !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
    );
    
    // Pending instructors always come first
    if (aHasPending && !bHasPending) return -1;
    if (!aHasPending && bHasPending) return 1;
    
    // If both are pending or both are not pending, sort by most recent update
    // Find the most recently updated course for each instructor
    const aLatestUpdate = Math.max(...a.courses.map(course => new Date(course.updatedAt).getTime()));
    const bLatestUpdate = Math.max(...b.courses.map(course => new Date(course.updatedAt).getTime()));
    
    // Sort by most recent update (descending)
    return bLatestUpdate - aLatestUpdate;
  });
  
  // Apply pagination to the filtered and sorted instructors
  const paginatedInstructors = filteredInstructors.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleBulkReject = async () => {
    try {
      setIsSubmitting(true);
      const eligibleInstructors = instructors.filter(instructor => 
        instructor.courses.some(course => 
          course.status === 'dean-approved' && 
          !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
        )
      );

      if (eligibleInstructors.length === 0) {
        toast.info('No courses available for rejection');
        setBulkRejectDialogOpen(false);
        return;
      }

      await Promise.all(
        eligibleInstructors.map(async (instructor) => {
          const rejectableCourses = instructor.courses.filter(course => 
            course.status === 'dean-approved' && 
            !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
          );

          if (rejectableCourses.length === 0) return;

          const response = await fetch(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/courses/bulk-reject/${instructor._id}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                courseIds: rejectableCourses.map(course => course._id),
                notes: bulkRejectionNotes,
                returnToDean: true
              })
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to reject courses for ${instructor.name}`);
          }

          // Update the courses status locally
          const updatedCourses = instructor.courses.map(course => {
            if (rejectableCourses.some(rc => rc._id === course._id)) {
              return { ...course, status: 'vice-director-rejected' };
            }
            return course;
          });
          
          // Add to the list of updated instructors
          const updatedInstructor = { ...instructor, courses: updatedCourses };
          setInstructors(prevInstructors => {
            return prevInstructors.map(inst => {
              if (inst._id === instructor._id) {
                return updatedInstructor;
              }
              return inst;
            });
          });
        })
      );

      toast.success('Successfully rejected all selected courses');
      setBulkRejectDialogOpen(false);
      setBulkRejectionNotes('');
      setBulkRejectionConfirmed(false);
      setSelectedInstructors([]);
    } catch (error) {
      console.error('Error in bulk rejection:', error);
      toast.error('Failed to reject some courses');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom>
        Vice Scientific Director Course Review
      </Typography>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          {/* Search Field - Full width on mobile, 1/3 on tablet, 1/4 on desktop */}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <TextField
              fullWidth
              label="Search by Instructor or Course"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
            />
          </Grid>

          {/* Filters Container - Full width on mobile, 2/3 on tablet, 3/4 on desktop */}
          <Grid item xs={12} sm={6} md={8} lg={9}>
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1, sm: 2 },
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap'
            }}>
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 1, sm: 2 },
                flexDirection: { xs: 'column', sm: 'row' },
                flexGrow: 1,
                width: { xs: '100%', sm: 'auto' }
              }}>
                {/* Status Filter */}
                <TextField
                  select
                  size="small"
                  label="Status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  sx={{ 
                    minWidth: { xs: '100%', sm: 120 },
                    flex: { xs: '1', sm: '0 0 auto' }
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending Review</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Returned to Dean</MenuItem>
                </TextField>

                {/* School Filter */}
                <TextField
                  select
                  size="small"
                  label="School"
                  value={filterSchool}
                  onChange={handleSchoolChange}
                  sx={{ 
                    minWidth: { xs: '100%', sm: 150 },
                    flex: { xs: '1', sm: '0 0 auto' }
                  }}
                >
                  <MenuItem value="all">All Schools</MenuItem>
                  {schools.map(school => (
                    <MenuItem key={school} value={school}>{school}</MenuItem>
                  ))}
                </TextField>

                {/* Department Filter */}
                <TextField
                  select
                  size="small"
                  label="Department"
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  sx={{ 
                    minWidth: { xs: '100%', sm: 150 },
                    flex: { xs: '1', sm: '0 0 auto' }
                  }}
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  {departments.map(department => (
                    <MenuItem key={department} value={department}>{department}</MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Refresh Button */}
              <Button
                variant="outlined"
                onClick={fetchInstructorCourses}
                disabled={loading}
                startIcon={<RefreshIcon />}
                sx={{ 
                  width: { xs: '100%', sm: 'auto' },
                  ml: { sm: 'auto' }
                }}
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Bulk Actions Section */}
      <Box sx={{ 
        display: 'grid', 
        gap: 2,
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        mb: 3
      }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleBulkApprovalClick}
          disabled={!instructors.some(instructor => 
            instructor.courses.some(course => 
              course.status === 'dean-approved' && 
              !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
            )
          )}
          startIcon={<CheckIcon />}
          sx={{ 
            height: '48px',
            boxShadow: (theme) => `0 1px 3px ${alpha(theme.palette.primary.main, 0.3)}`
          }}
        >
          Bulk Approve All Eligible Courses
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            const hasRejectableCourses = instructors.some(instructor => 
              instructor.courses.some(course => 
                course.status === 'dean-approved' && 
                !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
              )
            );
            
            if (!hasRejectableCourses) {
              toast.info('No courses available for rejection');
              return;
            }
            setBulkRejectDialogOpen(true);
          }}
          disabled={!instructors.some(instructor => 
            instructor.courses.some(course => 
              course.status === 'dean-approved' && 
              !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
            )
          )}
          startIcon={<CloseIcon />}
          sx={{ 
            height: '48px',
            boxShadow: (theme) => `0 1px 3px ${alpha(theme.palette.error.main, 0.3)}`
          }}
        >
          Bulk Reject All Eligible Courses
        </Button>
      </Box>

      {/* Table Section */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Instructor Name</TableCell>
              <TableCell>School</TableCell>
              <TableCell>Department</TableCell>
              <TableCell align="center">Total Courses</TableCell>
              <TableCell align="center">Total Workload</TableCell>
              <TableCell align="center">Overload</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(rowsPerPage)].map((_, index) => (
                <TableRowSkeleton key={index} />
              ))
            ) : filteredInstructors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No instructors found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedInstructors.map((instructor, index) => (
                <InstructorRow
                  key={instructor._id}
                  instructor={instructor}
                  onApprove={fetchInstructorCourses}
                  onReject={fetchInstructorCourses}
                  onResubmit={fetchInstructorCourses}
                  index={index}
                  isSelected={selectedInstructors.includes(instructor._id)}
                  onSelectInstructor={handleSelectInstructor}
                  onUpdateInstructor={(updatedInstructor) => {
                    // Update the instructor in the instructors array
                    setInstructors(prevInstructors => 
                      prevInstructors.map(inst => 
                        inst._id === updatedInstructor._id ? updatedInstructor : inst
                      )
                    );
                  }}
                />
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredInstructorsCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>



      {/* Bulk Approval Confirmation Dialog */}
      <Dialog
        open={bulkApprovalDialogOpen}
        onClose={() => {
          setBulkApprovalDialogOpen(false);
          setBulkApprovalConfirmed(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Bulk Course Approval
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              You are about to approve courses for the following instructors:
            </Typography>
            {coursesToApprove.map((item) => (
              <Box key={item.instructorId} sx={{ 
                mb: 1,
                p: 1.5,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.15),
              }}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ForwardIcon sx={{ color: theme.palette.primary.main }} />
                  {item.instructorName} ({item.courses.length} {item.courses.length === 1 ? 'course' : 'courses'})
                </Typography>
              </Box>
            ))}
            <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
              All selected courses will be approved and forwarded to the Scientific Director for final review.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to proceed?
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={bulkApprovalConfirmed}
                    onChange={(e) => setBulkApprovalConfirmed(e.target.checked)}
                    name="bulkApprovalConfirmed"
                  />
                }
                label="I confirm that I want to approve the courses."
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setBulkApprovalDialogOpen(false);
              setBulkApprovalConfirmed(false);
            }}
            color="inherit"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleBulkApprove}
            loading={isSubmitting}
            color="primary"
            variant="contained"
            disabled={!bulkApprovalConfirmed}
            autoFocus
          >
            Confirm Bulk Approval
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Bulk Rejection Confirmation Dialog */}
      <Dialog
        open={bulkRejectDialogOpen}
        onClose={() => {
          setBulkRejectDialogOpen(false);
          setBulkRejectionConfirmed(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Bulk Course Rejection
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              You are about to reject courses for the following instructors:
            </Typography>
            {instructors.filter(instructor => 
              instructor.courses.some(course => 
                course.status === 'dean-approved' && 
                !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
              )
            ).map((instructor) => (
              <Box key={instructor._id} sx={{ 
                mb: 1,
                p: 1.5,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.error.main, 0.04),
                border: '1px solid',
                borderColor: alpha(theme.palette.error.main, 0.15),
              }}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloseIcon sx={{ color: theme.palette.error.main }} />
                  {instructor.name} ({instructor.courses.filter(course => 
                    course.status === 'dean-approved' && 
                    !['vice-director-approved', 'vice-director-rejected', 'scientific-director-approved'].includes(course.status)
                  ).length} courses)
                </Typography>
              </Box>
            ))}
            <TextField
              fullWidth
              multiline
              rows={4}
              margin="normal"
              label="Rejection Notes (Required)"
              value={bulkRejectionNotes}
              onChange={(e) => setBulkRejectionNotes(e.target.value)}
              error={!bulkRejectionNotes.trim()}
              helperText={!bulkRejectionNotes.trim() ? "Please provide a reason for rejection" : ""}
              required
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to proceed?
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={bulkRejectionConfirmed}
                    onChange={(e) => setBulkRejectionConfirmed(e.target.checked)}
                    name="bulkRejectionConfirmed"
                  />
                }
                label="I confirm that I want to reject the courses."
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setBulkRejectDialogOpen(false);
              setBulkRejectionNotes('');
              setBulkRejectionConfirmed(false);
            }}
            color="inherit"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleBulkReject}
            loading={isSubmitting}
            color="error"
            variant="contained"
            disabled={!bulkRejectionConfirmed || !bulkRejectionNotes.trim()}
            autoFocus
          >
            Confirm Bulk Rejection
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViceDirectorCourses;
