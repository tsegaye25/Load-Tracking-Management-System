import React, { useEffect, useState } from 'react';
import {
  Container, Box, Typography, Card, CardContent, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Chip, CircularProgress, IconButton,
  Tooltip, alpha, TablePagination, Stack, Collapse, Divider,
  useTheme, MenuItem
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
  Reply as ReplyIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';
import axios from 'axios';

// Row component for expandable table
const InstructorRow = ({ instructor, onApprove, onReject }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [bulkRejectDialogOpen, setBulkRejectDialogOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [bulkRejectionNotes, setBulkRejectionNotes] = useState('');
  
  const allCoursesApproved = instructor.courses.every(course => 
    course.status === 'vice-director-approved' || course.status === 'scientific-director-approved'
  );

  const allCoursesRejected = instructor.courses.every(course => 
    course.status === 'vice-director-rejected'
  );

  const scientificDirectorApproved = instructor.courses.every(course => 
    course.status === 'scientific-director-approved'
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

      toast.success(`Successfully approved all courses for ${instructor.name}`);
      setConfirmDialogOpen(false);
      onApprove(); // Refresh the list
      window.location.reload(); // Force page refresh to update all statuses
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
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/courses/bulk-approve-vice-director/${instructor._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            courseIds: rejectableCourses.map(course => course._id),
            action: 'reject',
            notes: bulkRejectionNotes
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject courses');
      }

      toast.success(`Successfully rejected all courses for ${instructor.name}`);
      setBulkRejectDialogOpen(false);
      setBulkRejectionNotes('');
      onApprove(); // Refresh the list
      window.location.reload(); // Force page refresh to update all statuses
    } catch (error) {
      console.error('Error in instructor bulk rejection:', error);
      toast.error(`Failed to reject courses for ${instructor.name}`);
    } finally {
      setIsRejecting(false);
    }
  };

  const renderStatusBox = () => {
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

    if (allCoursesApproved) {
      return (
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 1, 
          bgcolor: scientificDirectorApproved ? alpha('#66bb6a', 0.04) : alpha('#42a5f5', 0.04),
          border: '1px solid',
          borderColor: scientificDirectorApproved ? alpha('#66bb6a', 0.15) : alpha('#42a5f5', 0.15),
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          boxShadow: `0 1px 2px ${alpha('#000', 0.05)}`
        }}>
          {scientificDirectorApproved ? (
            <CheckIcon sx={{ color: alpha('#388e3c', 0.7) }} />
          ) : (
            <ForwardIcon sx={{ color: alpha('#1976d2', 0.7) }} />
          )}
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: scientificDirectorApproved ? alpha('#2e7d32', 0.85) : alpha('#1565c0', 0.85), 
              fontWeight: 600 
            }}
          >
            {scientificDirectorApproved ? 
              'Approved by Scientific Director' : 
              'Approved & Forwarded to Scientific Director'}
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
          {instructor.courses.reduce((sum, course) => sum + (course.totalWorkload || 0), 0)}
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
              >
                Reject All
              </Button>
            </Stack>
          )}
          {(allCoursesApproved || allCoursesRejected) && renderStatusBox()}
        </TableCell>
      </TableRow>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialogOpen(false)}
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
          >
            Confirm Approval
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Bulk Rejection Dialog */}
      <Dialog
        open={bulkRejectDialogOpen}
        onClose={() => setBulkRejectDialogOpen(false)}
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setBulkRejectDialogOpen(false);
              setBulkRejectionNotes('');
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
            disabled={!bulkRejectionNotes.trim()}
            autoFocus
          >
            Confirm Rejection
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              {/* Additional Hours Section - Show only once */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Additional Hours
                </Typography>
                <Grid container spacing={2}>
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
              <Typography variant="h6" gutterBottom component="div">
                Courses
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Credit Hours</TableCell>
                    <TableCell>Lecture Hours</TableCell>
                    <TableCell>Lab Hours</TableCell>
                    <TableCell>Tutorial Hours</TableCell>
                    <TableCell>Status</TableCell>
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
                      <TableCell>
                        <Chip 
                          label={course.status} 
                          color={
                            course.status === 'vice-director-approved' ? 'primary' :
                            course.status === 'vice-director-rejected' ? 'error' :
                            course.status === 'scientific-director-approved' ? 'success' :
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
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const ViceDirectorCourses = () => {
  const theme = useTheme();
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

      // Call API for each instructor's courses
      await Promise.all(
        coursesToApprove.map(async ({ instructorId, courses }) => {
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
        })
      );

      toast.success('Successfully approved all eligible courses');
      setBulkApprovalDialogOpen(false);
      fetchInstructorCourses(); // Refresh the list
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
      setInstructors(instructorList);
      setTotalInstructors(instructorList.length);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorCourses();
  }, [page, rowsPerPage]);

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
  const filteredInstructors = instructors.filter(instructor => {
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
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/courses/bulk-approve-vice-director/${instructor._id}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                courseIds: rejectableCourses.map(course => course._id),
                action: 'reject',
                notes: bulkRejectionNotes,
                returnToDean: true
              })
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to reject courses for ${instructor.name}`);
          }
        })
      );

      toast.success('Successfully rejected all eligible courses and returned to Dean for review');
      setBulkRejectDialogOpen(false);
      setBulkRejectionNotes('');
      fetchInstructorCourses();
      window.location.reload();
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
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredInstructors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No instructors found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredInstructors.map((instructor) => (
                <InstructorRow
                  key={instructor._id}
                  instructor={instructor}
                  onApprove={() => handleReviewClick(instructor, 'approve')}
                  onReject={() => handleRejectClick(instructor)}
                />
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalInstructors}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      {/* Approval Confirmation Dialog */}
      <Dialog
        open={approvalDialogOpen}
        onClose={() => !isSubmitting && setApprovalDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div">
            Confirm Course Approval
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
            Instructor: {selectedInstructor?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              The following courses will be forwarded to the Scientific Director for final review:
            </Typography>
            <Box sx={{ mb: 3, pl: 2 }}>
              {selectedInstructor?.courses.map(course => (
                <Box key={course._id} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    • {course.code} - {course.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                    Total Hours: {course.totalHours}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Typography variant="body2" color="info.main" sx={{ mt: 2 }}>
              Total Workload: {selectedInstructor?.courses.reduce((sum, course) => sum + (course.totalHours || 0), 0)} hours
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setApprovalDialogOpen(false)}
            disabled={isSubmitting}
            color="inherit"
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleApprovalConfirm}
            loading={isSubmitting}
            variant="contained"
            color="success"
          >
            Confirm & Forward to Scientific Director
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Courses</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Please provide a reason for rejecting the courses for instructor: {selectedInstructorForReject?.name}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <LoadingButton
            onClick={handleReject}
            loading={loading}
            variant="contained"
            color="warning"
            disabled={!rejectionReason.trim()}
          >
            Reject Courses
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Bulk Approval Confirmation Dialog */}
      <Dialog
        open={bulkApprovalDialogOpen}
        onClose={() => setBulkApprovalDialogOpen(false)}
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setBulkApprovalDialogOpen(false)}
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
            autoFocus
          >
            Confirm Bulk Approval
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Bulk Rejection Confirmation Dialog */}
      <Dialog
        open={bulkRejectDialogOpen}
        onClose={() => setBulkRejectDialogOpen(false)}
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setBulkRejectDialogOpen(false);
              setBulkRejectionNotes('');
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
            disabled={!bulkRejectionNotes.trim()}
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
