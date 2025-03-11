import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Paper,
  InputAdornment,
  CircularProgress,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PendingOutlined as PendingIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';

const InstructorRow = ({ instructor, courses, onStatusChange }) => {
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

  // Calculate totals
  const totalCourses = courses.length;
  const totalWorkload = courses.reduce((sum, course) => sum + (course.totalWorkload || 0), 0);
  const department = courses[0]?.department || 'N/A';

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
    // Filter courses that can be reviewed (not already approved/rejected)
    const reviewableCourses = courses.filter(
      course => !['dean-approved', 'dean-rejected'].includes(course.status)
    );
    setProcessingCourses(reviewableCourses);
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
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Process all courses in sequence
      for (const course of processingCourses) {
        try {
          const response = await fetch(`${baseURL}/api/v1/courses/${course._id}/dean-review`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              status: action === 'approve' ? 'dean-approved' : 'dean-rejected',
              rejectionReason: action === 'approve' ? undefined : `${selectedCourse}: ${rejectionNotes}`
            })
          });

          if (!response.ok) {
            const data = await response.json();
            errors[course._id] = data.message || `Failed to process review for ${course.code}`;
            continue;
          }

          const data = await response.json();
          onStatusChange(course._id, action === 'approve' ? 'dean-approved' : 'dean-rejected');
          successCount++;
        } catch (error) {
          errors[course._id] = `Network error while processing ${course.code}`;
        }
      }

      setProcessingErrors(errors);
      setReviewDialogOpen(false);
      setSelectedCourse('');
      setRejectionNotes('');

      if (successCount > 0) {
        toast.success(action === 'approve' ? 
          `${successCount} courses have been approved and sent to Vice Scientific Director` : 
          `${successCount} courses have been rejected and sent back to Department Head`);
      }

      if (Object.keys(errors).length > 0) {
        toast.error(`Failed to process ${Object.keys(errors).length} courses. Please check the details and try again.`);
      }
    } catch (error) {
      console.error('Error in batch processing:', error);
      toast.error('Failed to start batch processing. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  // Check course statuses
  const statusCounts = useMemo(() => courses.reduce((counts, course) => {
    counts[course.status] = (counts[course.status] || 0) + 1;
    return counts;
  }, {}), [courses]);

  const allCoursesApproved = statusCounts['dean-approved'] === courses.length;
  const allCoursesRejected = statusCounts['dean-rejected'] === courses.length;
  const hasReviewableCourses = courses.some(course => !['dean-approved', 'dean-rejected'].includes(course.status));

  // Get status color and text
  const getStatusInfo = () => {
    if (allCoursesApproved) return { label: 'All Approved', color: 'success' };
    if (allCoursesRejected) return { label: 'All Rejected', color: 'error' };
    if (!hasReviewableCourses) return { label: 'Mixed Status', color: 'warning' };
    return { label: 'Pending Review', color: 'info' };
  };

  const statusInfo = getStatusInfo();

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
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle2">{instructor}</Typography>
            <Tooltip title={`${statusCounts['dean-approved'] || 0} approved, ${statusCounts['dean-rejected'] || 0} rejected, ${courses.length - (statusCounts['dean-approved'] || 0) - (statusCounts['dean-rejected'] || 0)} pending`}>
              <Chip 
                label={statusInfo.label}
                color={statusInfo.color}
                size="small"
                sx={{ ml: 1 }}
              />
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
          <Box sx={{ display: 'flex', gap: 1 }}>
            {hasReviewableCourses && !isLoading && (
              <>
                <Tooltip title={`Approve ${courses.length - (statusCounts['dean-approved'] || 0) - (statusCounts['dean-rejected'] || 0)} pending courses`}>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => handleReviewClick('approve')}
                  >
                    Approve All
                  </Button>
                </Tooltip>
                <Tooltip title={`Reject ${courses.length - (statusCounts['dean-approved'] || 0) - (statusCounts['dean-rejected'] || 0)} pending courses`}>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={() => handleReviewClick('reject')}
                  >
                    Reject All
                  </Button>
                </Tooltip>
              </>
            )}
            {isLoading && (
              <Typography variant="body2" color="textSecondary">
                Processing...
              </Typography>
            )}
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
                                {workloadStats.hdpHours + workloadStats.positionHours + workloadStats.branchAdvisorHours}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">HDP Hours:</Typography>
                                <Typography variant="body2" fontWeight="medium">{workloadStats.hdpHours}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Position Hours:</Typography>
                                <Typography variant="body2" fontWeight="medium">{workloadStats.positionHours}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Branch Advisor Hours:</Typography>
                                <Typography variant="body2" fontWeight="medium">{workloadStats.branchAdvisorHours}</Typography>
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
                        icon={<ErrorIcon />}
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
                      <TableCell align="center" colSpan={4} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <Tooltip title="Total hours allocated for course credit, lectures, labs, and tutorials">
                          <Typography variant="subtitle2" color="primary">Credit Hours</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center" colSpan={3} sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
                        <Tooltip title="Number of sections for lectures, labs, and tutorials">
                          <Typography variant="subtitle2" color="secondary">Number of Sections</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center" colSpan={3} sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                        <Tooltip title="Additional hours for HDP, position duties, and branch advisory">
                          <Typography variant="subtitle2" color="info">Additional Hours</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell />
                      <TableCell />
                      {/* Credit Hours Subheaders */}
                      <TableCell align="right" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <Tooltip title="Total credit hours for the course">
                          <Typography variant="body2" color="primary">Credit</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <Tooltip title="Hours allocated for lectures">
                          <Typography variant="body2" color="primary">Lecture</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <Tooltip title="Hours allocated for laboratory sessions">
                          <Typography variant="body2" color="primary">Lab</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <Tooltip title="Hours allocated for tutorials">
                          <Typography variant="body2" color="primary">Tutorial</Typography>
                        </Tooltip>
                      </TableCell>
                      {/* Section Numbers Subheaders */}
                      <TableCell align="right" sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
                        <Tooltip title="Number of lecture sections">
                          <Typography variant="body2" color="secondary">Lecture</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
                        <Tooltip title="Number of laboratory sections">
                          <Typography variant="body2" color="secondary">Lab</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
                        <Tooltip title="Number of tutorial sections">
                          <Typography variant="body2" color="secondary">Tutorial</Typography>
                        </Tooltip>
                      </TableCell>
                      {/* Additional Hours Subheaders */}
                      <TableCell align="right" sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                        <Tooltip title="Higher Diploma Program hours">
                          <Typography variant="body2" color="info">HDP</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                        <Tooltip title="Position-related duty hours">
                          <Typography variant="body2" color="info">Position</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                        <Tooltip title="Branch advisory hours">
                          <Typography variant="body2" color="info">Branch</Typography>
                        </Tooltip>
                      </TableCell>
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
                            : course.status === 'dean-approved'
                              ? alpha(theme.palette.success.main, 0.05)
                              : course.status === 'dean-rejected'
                                ? alpha(theme.palette.error.main, 0.05)
                                : 'inherit',
                          '&:hover': {
                            bgcolor: processingErrors[course._id] 
                              ? alpha(theme.palette.error.main, 0.15)
                              : course.status === 'dean-approved'
                                ? alpha(theme.palette.success.main, 0.1)
                                : course.status === 'dean-rejected'
                                  ? alpha(theme.palette.error.main, 0.1)
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
                                <ErrorIcon 
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
                        {/* Credit Hours */}
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {course.Hourfor?.creaditHours || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {course.Hourfor?.lecture || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {course.Hourfor?.lab || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {course.Hourfor?.tutorial || 0}
                          </Typography>
                        </TableCell>
                        {/* Number of Sections */}
                        <TableCell align="right">
                          <Typography variant="body2">
                            {course.Number_of_Sections?.lecture || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {course.Number_of_Sections?.lab || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {course.Number_of_Sections?.tutorial || 0}
                          </Typography>
                        </TableCell>
                        {/* Additional Hours */}
                        <TableCell align="right">
                          <Typography variant="body2">
                            {course.hdp || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {course.position || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {course.branchAdvisor || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {course.status === 'dean-approved' && (
                            <Tooltip title="Course has been approved and sent to Vice Scientific Director">
                              <Chip 
                                label="Approved" 
                                color="success" 
                                size="small"
                                icon={<CheckCircleIcon />}
                                sx={{ 
                                  '& .MuiChip-icon': { 
                                    fontSize: 16,
                                    mr: -0.5 
                                  }
                                }}
                              />
                            </Tooltip>
                          )}
                          {course.status === 'dean-rejected' && (
                            <Tooltip title="Course has been rejected and sent back to Department Head">
                              <Chip 
                                label="Rejected" 
                                color="error" 
                                size="small"
                                icon={<CancelIcon />}
                                sx={{ 
                                  '& .MuiChip-icon': { 
                                    fontSize: 16,
                                    mr: -0.5 
                                  }
                                }}
                              />
                            </Tooltip>
                          )}
                          {!['dean-approved', 'dean-rejected'].includes(course.status) && (
                            <Tooltip title="Course is pending review">
                              <Chip 
                                label="Pending" 
                                color="warning" 
                                size="small"
                                icon={<PendingIcon />}
                                sx={{ 
                                  '& .MuiChip-icon': { 
                                    fontSize: 16,
                                    mr: -0.5 
                                  }
                                }}
                              />
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

<TableRow sx={{ 
  bgcolor: alpha(theme.palette.primary.main, 0.05),
  fontWeight: 'bold'
}}>
  <TableCell colSpan={2}>
    <Typography variant="subtitle2">TOTALS</Typography>
  </TableCell>
  <TableCell align="right">
    <Tooltip title="Total Credit Hours">
      <Typography variant="subtitle2">{workloadStats.creditHours}</Typography>
    </Tooltip>
  </TableCell>
  <TableCell align="right">
    <Tooltip title="Total Lecture Hours">
      <Typography variant="subtitle2">{workloadStats.lectureHours}</Typography>
    </Tooltip>
  </TableCell>
  <TableCell align="right">
    <Tooltip title="Total Lab Hours">
      <Typography variant="subtitle2">{workloadStats.labHours}</Typography>
    </Tooltip>
  </TableCell>
  <TableCell align="right">
    <Tooltip title="Total Tutorial Hours">
      <Typography variant="subtitle2">{workloadStats.tutorialHours}</Typography>
    </Tooltip>
  </TableCell>
  <TableCell align="right">
    <Tooltip title="Total Lecture Sections">
      <Typography variant="subtitle2">{workloadStats.lectureSections}</Typography>
    </Tooltip>
  </TableCell>
  <TableCell align="right">
    <Tooltip title="Total Lab Sections">
      <Typography variant="subtitle2">{workloadStats.labSections}</Typography>
    </Tooltip>
  </TableCell>
  <TableCell align="right">
    <Tooltip title="Total Tutorial Sections">
      <Typography variant="subtitle2">{workloadStats.tutorialSections}</Typography>
    </Tooltip>
  </TableCell>
  <TableCell align="right">
    <Tooltip title="Total HDP Hours">
      <Typography variant="subtitle2">{workloadStats.hdpHours}</Typography>
    </Tooltip>
  </TableCell>
  <TableCell align="right">
    <Tooltip title="Total Position Hours">
      <Typography variant="subtitle2">{workloadStats.positionHours}</Typography>
    </Tooltip>
  </TableCell>
  <TableCell align="right">
    <Tooltip title="Total Branch Hours">
      <Typography variant="subtitle2">{workloadStats.branchHours}</Typography>
    </Tooltip>
  </TableCell>
  <TableCell />
</TableRow>

                  </TableBody>
                </Table>
              </TableContainer>
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
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/courses/school-courses`, {
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
                    <ErrorIcon sx={{ mr: 1 }} />
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
                .map(([instructor, courses]) => (
                  <InstructorRow 
                    key={instructor} 
                    instructor={instructor} 
                    courses={courses}
                    onStatusChange={handleStatusChange}
                  />
                ))}
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
