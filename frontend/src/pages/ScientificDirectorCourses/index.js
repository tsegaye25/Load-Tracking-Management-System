import React, { useState, useEffect, useMemo } from 'react';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  alpha,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  School as SchoolIcon,
  Refresh as RefreshIcon,
  Forward as ForwardIcon,
  Reply as ReplyIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

// Row component for expandable table
const InstructorRow = ({ instructor, onApprove, onReject }) => {
  const [open, setOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const calculateTotalWorkload = (courses) => {
    return courses.reduce((sum, course) => sum + (course.totalHours || 0), 0);
  };

  // Check course statuses
  const isApproved = instructor.courses.every(course => 
    course.status === 'scientific-director-approved'
  );
  const isRejected = instructor.courses.every(course => 
    course.status === 'scientific-director-rejected'
  );

  const handleAction = async (action) => {
    setActionLoading(action);
    if (action === 'approve') {
      await onApprove();
    } else {
      await onReject();
    }
    setActionLoading('');
  };

  const renderActionButtons = () => {
    if (isApproved) {
      return (
        <Tooltip title="Courses are approved and forwarded to Finance">
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<ForwardIcon />}
            disabled
            sx={{
              minWidth: 250,
              '& .MuiButton-startIcon': { mr: 0.5 }
            }}
          >
            Approved & Forwarded to Finance
          </Button>
        </Tooltip>
      );
    }

    return (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Tooltip title="Approve and forward to Finance">
          <span>
            <LoadingButton
              size="small"
              variant="contained"
              color="success"
              startIcon={<ForwardIcon />}
              loading={actionLoading === 'approve'}
              onClick={() => handleAction('approve')}
              sx={{
                minWidth: 200,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.shadows[4]
                }
              }}
            >
              Forward to Finance
            </LoadingButton>
          </span>
        </Tooltip>
        {!isRejected && (
          <Tooltip title="Return to Vice-Director for review">
            <span>
              <LoadingButton
                size="small"
                variant="contained"
                color="warning"
                startIcon={<ReplyIcon />}
                loading={actionLoading === 'reject'}
                onClick={() => handleAction('reject')}
                sx={{
                  minWidth: 200,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.shadows[4]
                  }
                }}
              >
                Return to Vice-Director
              </LoadingButton>
            </span>
          </Tooltip>
        )}
      </Stack>
    );
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
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
        <TableCell>{instructor.school}</TableCell>
        <TableCell>{instructor.department}</TableCell>
        <TableCell align="center">{instructor.courses.length}</TableCell>
        <TableCell align="center">{calculateTotalWorkload(instructor.courses)}</TableCell>
        <TableCell align="center">
          {renderActionButtons()}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                Course Details
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Course Code</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell align="right">Credit Hours</TableCell>
                    <TableCell align="right">Lecture</TableCell>
                    <TableCell align="right">Lab</TableCell>
                    <TableCell align="right">Tutorial</TableCell>
                    <TableCell align="right">Total Hours</TableCell>
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
                      <TableCell align="right">{course.Hourfor?.creaditHours || 0}</TableCell>
                      <TableCell align="right">{course.Hourfor?.lecture || 0}</TableCell>
                      <TableCell align="right">{course.Hourfor?.lab || 0}</TableCell>
                      <TableCell align="right">{course.Hourfor?.tutorial || 0}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={course.totalHours}
                          color="primary"
                          sx={{ minWidth: 60 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={course.status.replace(/-/g, ' ').toUpperCase()}
                          color={
                            course.status === 'vice-director-approved'
                              ? 'info'
                              : course.status === 'approved'
                              ? 'success'
                              : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell colSpan={6} align="right" sx={{ fontWeight: 'bold' }}>
                      Course Hours Total:
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {instructor.courses.reduce((sum, course) => sum + course.totalHours, 0)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                  <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.info.main, 0.05) }}>
                    <TableCell colSpan={6} align="right" sx={{ fontWeight: 'bold' }}>
                      Additional Hours:
                    </TableCell>
                    <TableCell align="right" colSpan={2}>
                      <Stack spacing={1}>
                        <Chip
                          size="small"
                          label={`HDP: ${instructor.hdpHour}`}
                          color="info"
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={`Position: ${instructor.positionHour}`}
                          color="info"
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={`Advisor: ${instructor.batchAdvisor}`}
                          color="info"
                          variant="outlined"
                        />
                      </Stack>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ 
                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.05),
                    '& > td': { fontWeight: 'bold' }
                  }}>
                    <TableCell colSpan={6} align="right">
                      Grand Total (Course Hours + Additional Hours):
                    </TableCell>
                    <TableCell align="right" colSpan={2}>
                      <Chip
                        label={instructor.totalWorkload}
                        color="success"
                        sx={{ minWidth: 60 }}
                      />
                    </TableCell>
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

const ScientificDirectorCourses = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Add filter states
  const [filters, setFilters] = useState({
    school: '',
    department: '',
    status: ''
  });

  const token = localStorage.getItem('token');
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Get unique schools and departments
  const schools = useMemo(() => 
    [...new Set(instructors.map(i => i.school))].filter(Boolean).sort(),
    [instructors]
  );

  // Get departments based on selected school
  const departments = useMemo(() => {
    if (!filters.school) {
      // Show all departments when no school is selected
      return [...new Set(instructors.map(i => i.department))].filter(Boolean).sort();
    }
    // Show only departments from selected school
    return [...new Set(
      instructors
        .filter(i => i.school === filters.school)
        .map(i => i.department)
    )].filter(Boolean).sort();
  }, [instructors, filters.school]);

  const filteredInstructors = useMemo(() => {
    return instructors.filter(instructor => {
      const matchesSearch = searchTerm === '' || 
        instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.courses.some(course =>
          course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.code?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesSchool = !filters.school || instructor.school === filters.school;
      const matchesDepartment = !filters.department || instructor.department === filters.department;
      
      const matchesStatus = !filters.status || instructor.courses.some(course => {
        if (filters.status === 'approved') return course.status === 'scientific-director-approved';
        if (filters.status === 'rejected') return course.status === 'scientific-director-rejected';
        if (filters.status === 'pending') {
          return !['scientific-director-approved', 'scientific-director-rejected'].includes(course.status);
        }
        return true;
      });

      return matchesSearch && matchesSchool && matchesDepartment && matchesStatus;
    });
  }, [instructors, searchTerm, filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => {
      // If changing school, reset department only if a school is selected
      if (field === 'school' && value !== '') {
        return { 
          ...prev, 
          [field]: value,
          department: '' // Reset department only when selecting a specific school
        };
      }
      return { ...prev, [field]: value };
    });
    setPage(0); // Reset to first page when filter changes
  };

  const handleResetFilters = () => {
    setFilters({ school: '', department: '', status: '' });
    setSearchTerm('');
    setPage(0);
  };

  // Function to handle opening the approval dialog
  const handleOpenApprovalDialog = (instructor) => {
    setSelectedInstructor(instructor);
    setApprovalDialogOpen(true);
  };

  // Function to handle opening the reject dialog
  const handleOpenRejectDialog = (instructor) => {
    setSelectedInstructor(instructor);
    setRejectDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedInstructor?._id) {
      enqueueSnackbar('No instructor selected', { variant: 'error' });
      return;
    }

    setIsSubmitting(true);

    // Optimistic update
    const updatedInstructors = instructors.map(instructor => {
      if (instructor._id === selectedInstructor._id) {
        return {
          ...instructor,
          courses: instructor.courses.map(course => ({
            ...course,
            status: 'scientific-director-approved'
          }))
        };
      }
      return instructor;
    });
    setInstructors(updatedInstructors);
    setApprovalDialogOpen(false);
    setSelectedInstructor(null); // Clear selected instructor

    try {
      const response = await fetch(`${baseUrl}/api/v1/courses/scientific-director/bulk-approve/${selectedInstructor._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          instructorId: selectedInstructor._id,
          action: 'approve'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve courses');
      }

      // Show success message with course count
      const courseCount = data.data?.courses?.length || selectedInstructor.courses.length;
      enqueueSnackbar(
        `Successfully approved ${courseCount} courses for ${selectedInstructor.name}. ${
          data.message?.includes('email') ? ' (Email notifications may be delayed)' : ''
        }`, 
        { 
          variant: 'success',
          autoHideDuration: 5000
        }
      );

      // Refresh to ensure sync with server
      await fetchInstructors();
    } catch (error) {
      console.error('Error approving courses:', error);
      
      // Revert optimistic update on error
      const revertedInstructors = instructors.map(instructor => {
        if (instructor._id === selectedInstructor._id) {
          return {
            ...instructor,
            courses: instructor.courses.map(course => ({
              ...course,
              status: 'vice-director-approved' // Revert to previous status
            }))
          };
        }
        return instructor;
      });
      setInstructors(revertedInstructors);

      if (error.message?.toLowerCase().includes('email')) {
        enqueueSnackbar('Courses approved, but email notifications may be delayed', { 
          variant: 'warning',
          autoHideDuration: 5000
        });
        // Still refresh data even if email failed
        await fetchInstructors();
      } else {
        enqueueSnackbar(error.message || 'Failed to approve courses', { 
          variant: 'error',
          autoHideDuration: 5000
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedInstructor?._id) {
      enqueueSnackbar('No instructor selected', { variant: 'error' });
      return;
    }

    if (!rejectionReason.trim()) {
      enqueueSnackbar('Please provide a rejection reason', { variant: 'error' });
      return;
    }

    setIsSubmitting(true);

    // Optimistic update
    const updatedInstructors = instructors.map(instructor => {
      if (instructor._id === selectedInstructor._id) {
        return {
          ...instructor,
          courses: instructor.courses.map(course => ({
            ...course,
            status: 'scientific-director-rejected'
          }))
        };
      }
      return instructor;
    });
    setInstructors(updatedInstructors);
    setRejectDialogOpen(false);
    setRejectionReason('');
    setSelectedInstructor(null); // Clear selected instructor

    try {
      const response = await fetch(`${baseUrl}/api/v1/courses/scientific-director/bulk-approve/${selectedInstructor._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          instructorId: selectedInstructor._id,
          action: 'reject',
          rejectionReason: rejectionReason
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject courses');
      }

      // Show success message with course count
      const courseCount = data.data?.courses?.length || selectedInstructor.courses.length;
      enqueueSnackbar(
        `Successfully rejected ${courseCount} courses for ${selectedInstructor.name}. ${
          data.message?.includes('email') ? ' (Email notifications may be delayed)' : ''
        }`, 
        { 
          variant: 'warning',
          autoHideDuration: 5000
        }
      );

      // Refresh to ensure sync with server
      await fetchInstructors();
    } catch (error) {
      console.error('Error rejecting courses:', error);

      // Revert optimistic update on error
      const revertedInstructors = instructors.map(instructor => {
        if (instructor._id === selectedInstructor._id) {
          return {
            ...instructor,
            courses: instructor.courses.map(course => ({
              ...course,
              status: 'vice-director-approved' // Revert to previous status
            }))
          };
        }
        return instructor;
      });
      setInstructors(revertedInstructors);
      
      if (error.message?.toLowerCase().includes('email')) {
        enqueueSnackbar('Courses rejected, but email notifications may be delayed', { 
          variant: 'warning',
          autoHideDuration: 5000
        });
        // Still refresh data even if email failed
        await fetchInstructors();
      } else {
        enqueueSnackbar(error.message || 'Failed to reject courses', { 
          variant: 'error',
          autoHideDuration: 5000
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      
      // Fetch courses first
      const coursesResponse = await fetch(`${baseUrl}/api/v1/courses/scientific-director-courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!coursesResponse.ok) {
        throw new Error('Failed to fetch courses');
      }

      const coursesData = await coursesResponse.json();
      const instructorWorkloads = coursesData.data?.instructorWorkloads || [];

      // Fetch hours for all instructors in parallel
      const instructorsWithDetails = await Promise.all(
        instructorWorkloads.map(async (instructor) => {
          try {
            // Fetch additional hours
            const hoursResponse = await fetch(`${baseUrl}/api/v1/users/${instructor._id}/hours`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            let additionalHours = { hdpHour: 0, positionHour: 0, batchAdvisor: 0 };
            if (hoursResponse.ok) {
              const hoursData = await hoursResponse.json();
              additionalHours = hoursData.data;
            }

            // Calculate total workload
            const totalWorkload = instructor.courses.reduce((sum, course) => {
              const courseHours = (
                (course.Hourfor?.creaditHours || 0) +
                (course.Hourfor?.lecture || 0) +
                (course.Hourfor?.lab || 0) +
                (course.Hourfor?.tutorial || 0)
              );
              return sum + courseHours;
            }, 0);

            return {
              ...instructor,
              hdpHour: additionalHours.hdpHour || 0,
              positionHour: additionalHours.positionHour || 0,
              batchAdvisor: additionalHours.batchAdvisor || 0,
              totalWorkload: totalWorkload + 
                (additionalHours.hdpHour || 0) + 
                (additionalHours.positionHour || 0) + 
                (additionalHours.batchAdvisor || 0)
            };
          } catch (error) {
            console.error('Error fetching hours for instructor:', instructor._id, error);
            return instructor;
          }
        })
      );

      setInstructors(instructorsWithDetails);
    } catch (error) {
      console.error('Error:', error);
      enqueueSnackbar('Failed to fetch courses', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch instructors on component mount
  useEffect(() => {
    fetchInstructors();
  }, []);

  const paginatedInstructors = filteredInstructors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={400} height={24} sx={{ mb: 2 }} />
        </Box>

        <Paper sx={{ mb: 2, p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <Skeleton variant="rectangular" height={40} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Skeleton variant="rectangular" height={40} />
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                {['Instructor', 'School', 'Department', 'Courses', 'Total Hours', 'Actions'].map((header) => (
                  <TableCell key={header}>
                    <Skeleton variant="text" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton variant="circular" width={20} height={20} />
                  </TableCell>
                  {[...Array(6)].map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Course Review
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Review and approve courses or return them to Vice Director
        </Typography>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or course..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="School"
              value={filters.school}
              onChange={(e) => handleFilterChange('school', e.target.value)}
            >
              <MenuItem value="">All Schools</MenuItem>
              {schools.map(school => (
                <MenuItem key={school} value={school}>{school}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Department"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map(dept => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="pending">Pending Review</MenuItem>
              <MenuItem value="approved">Forwarded to Finance</MenuItem>
              <MenuItem value="rejected">Returned to Vice-Director</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleResetFilters}
              disabled={!searchTerm && !Object.values(filters).some(Boolean)}
              fullWidth
            >
              Reset Filters
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={1}>
            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
              onClick={fetchInstructors}
              disabled={loading}
              fullWidth
            >
              {loading ? '...' : 'Refresh'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Instructor</TableCell>
              <TableCell>School</TableCell>
              <TableCell>Department</TableCell>
              <TableCell align="center">Courses</TableCell>
              <TableCell align="center">Total Hours</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInstructors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No instructors found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedInstructors.map((instructor) => (
                <InstructorRow
                  key={instructor._id}
                  instructor={instructor}
                  onApprove={() => handleOpenApprovalDialog(instructor)}
                  onReject={() => handleOpenRejectDialog(instructor)}
                />
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredInstructors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Approval Dialog */}
      <Dialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        aria-labelledby="approve-dialog-title"
      >
        <DialogTitle id="approve-dialog-title">
          Forward Courses to Finance
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve and forward all courses for {selectedInstructor?.name} to Finance?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
          <LoadingButton
            onClick={handleApprove}
            loading={isSubmitting}
            variant="contained"
            color="success"
            startIcon={<ForwardIcon />}
          >
            Forward to Finance
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        aria-labelledby="reject-dialog-title"
      >
        <DialogTitle id="reject-dialog-title">
          Return Courses to Vice-Director
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for returning these courses to the Vice-Director for review.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Return"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <LoadingButton
            onClick={handleReject}
            loading={isSubmitting}
            variant="contained"
            color="warning"
            startIcon={<ReplyIcon />}
          >
            Return to Vice-Director
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ScientificDirectorCourses;