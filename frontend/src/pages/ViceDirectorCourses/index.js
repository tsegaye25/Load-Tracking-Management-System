import React, { useEffect, useState } from 'react';
import {
  Container, Box, Typography, Card, CardContent, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Chip, CircularProgress, IconButton,
  Tooltip, alpha, TablePagination, Stack, Collapse, Divider
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';

// Row component for expandable table
const InstructorRow = ({ instructor, onApprove, onReject }) => {
  const [open, setOpen] = useState(false);

  const calculateTotalWorkload = (courses) => {
    return courses.reduce((total, course) => {
      const hours = course.Hourfor || {};
      return total + (
        (hours.creaditHours || 0) +
        (hours.lecture || 0) +
        (hours.lab || 0) +
        (hours.tutorial || 0) +
        (course.hdp || 0) +
        (course.position || 0) +
        (course.branchAdvisor || 0)
      );
    }, 0);
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{instructor.name}</TableCell>
        <TableCell>{instructor.school}</TableCell>
        <TableCell>{instructor.department}</TableCell>
        <TableCell align="center">{instructor.courses.length}</TableCell>
        <TableCell align="center">{calculateTotalWorkload(instructor.courses)}</TableCell>
        <TableCell align="center">
          <Stack direction="row" spacing={1} justifyContent="center">
            {instructor.courses.every(course => course.status === 'vice-director-approved') ? (
              <Button
                variant="outlined"
                color="success"
                size="small"
                startIcon={<CheckIcon />}
              >
                Approved & Forwarded
              </Button>
            ) : instructor.courses.every(course => course.status === 'dean-review') ? (
              <Button
                variant="outlined"
                color="warning"
                size="small"
                startIcon={<CloseIcon />}
              >
                Returned for Review
              </Button>
            ) : instructor.courses.every(course => course.status === 'dean-approved') ? (
              <>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => onApprove(instructor)}
                  size="small"
                  startIcon={<CheckIcon />}
                >
                  Forward to Scientific Director
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => onReject(instructor)}
                  size="small"
                  startIcon={<CloseIcon />}
                >
                  Return to School Dean
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                color="info"
                size="small"
              >
                Pending Dean Review
              </Button>
            )}
          </Stack>
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
                    <TableCell align="center">Credit Hours</TableCell>
                    <TableCell align="center">Lecture Hours</TableCell>
                    <TableCell align="center">Lab Hours</TableCell>
                    <TableCell align="center">Tutorial Hours</TableCell>
                    <TableCell align="center">Additional Hours</TableCell>
                    <TableCell align="center">Total Hours</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {instructor.courses.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell component="th" scope="row">
                        {course.code}
                      </TableCell>
                      <TableCell>{course.title}</TableCell>
                      <TableCell align="center">{course.Hourfor?.creaditHours || 0}</TableCell>
                      <TableCell align="center">{course.Hourfor?.lecture || 0}</TableCell>
                      <TableCell align="center">{course.Hourfor?.lab || 0}</TableCell>
                      <TableCell align="center">{course.Hourfor?.tutorial || 0}</TableCell>
                      <TableCell align="center">
                        {(course.hdp || 0) + (course.position || 0) + (course.branchAdvisor || 0)}
                      </TableCell>
                      <TableCell align="center">{course.totalHours}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={course.status.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                          color={
                            course.status === 'vice-director-approved' ? 'success' :
                            course.status === 'dean-review' ? 'warning' :
                            course.status === 'dean-approved' ? 'info' :
                            'info'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ 
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    fontWeight: 'bold'
                  }}>
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell align="center">
                      {instructor.courses.reduce((sum, course) => sum + (course.Hourfor?.creaditHours || 0), 0)}
                    </TableCell>
                    <TableCell align="center">
                      {instructor.courses.reduce((sum, course) => sum + (course.Hourfor?.lecture || 0), 0)}
                    </TableCell>
                    <TableCell align="center">
                      {instructor.courses.reduce((sum, course) => sum + (course.Hourfor?.lab || 0), 0)}
                    </TableCell>
                    <TableCell align="center">
                      {instructor.courses.reduce((sum, course) => sum + (course.Hourfor?.tutorial || 0), 0)}
                    </TableCell>
                    <TableCell align="center">
                      {instructor.courses.reduce((sum, course) => 
                        sum + (course.hdp || 0) + (course.position || 0) + (course.branchAdvisor || 0), 0
                      )}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      {instructor.courses.reduce((sum, course) => sum + (course.totalHours || 0), 0)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Sections & Additional Hours
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Number of Sections
                        </Typography>
                        {instructor.courses.map((course) => (
                          <Box key={course._id} sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              {course.code}:
                            </Typography>
                            <Box sx={{ pl: 2 }}>
                              <Typography variant="body2">
                                Lecture: {course.Number_of_Sections?.lecture || 0}
                              </Typography>
                              <Typography variant="body2">
                                Lab: {course.Number_of_Sections?.lab || 0}
                              </Typography>
                              <Typography variant="body2">
                                Tutorial: {course.Number_of_Sections?.tutorial || 0}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Additional Hours
                        </Typography>
                        {instructor.courses.map((course) => (
                          <Box key={course._id} sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              {course.code}:
                            </Typography>
                            <Box sx={{ pl: 2 }}>
                              <Typography variant="body2">
                                HDP: {course.hdp || 0}
                              </Typography>
                              <Typography variant="body2">
                                Position: {course.position || 0}
                              </Typography>
                              <Typography variant="body2">
                                Branch Advisor: {course.branchAdvisor || 0}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const ViceDirectorCourses = () => {
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
      
      // Group courses by instructor
      const instructorMap = new Map();
      data.data.forEach(course => {
        if (course.instructor) {
          const instructorId = course.instructor._id;
          if (!instructorMap.has(instructorId)) {
            instructorMap.set(instructorId, {
              _id: instructorId,
              name: course.instructor.name,
              school: course.instructor.school,
              department: course.instructor.department,
              courses: []
            });
          }
          instructorMap.get(instructorId).courses.push(course);
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

  const handleReviewSubmit = async (action) => {
    if (!selectedInstructor) return;

    try {
      setIsSubmitting(true);
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Process all courses for the instructor
      await Promise.all(selectedInstructor.courses.map(course => 
        fetch(`${baseURL}/api/v1/courses/${course._id}/vice-director-review`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            action,
            comment: action === 'reject' ? rejectionNotes : undefined
          })
        })
      ));

      toast.success(`Courses ${action}d successfully`);
      setReviewDialogOpen(false);
      setSelectedInstructor(null);
      setRejectionNotes('');
      fetchInstructorCourses();
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to ${action} courses`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprovalConfirm = () => {
    handleReviewSubmit('approve');
    setApprovalDialogOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.courses.some(course => 
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Course Review Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Review and approve courses by instructor workload
        </Typography>
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search instructors, schools, or departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  }}
                  size="small"
                />
                <IconButton onClick={fetchInstructorCourses} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Instructors Table */}
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
                  onReject={() => handleReviewClick(instructor, 'reject')}
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
      <Dialog
        open={reviewDialogOpen}
        onClose={() => !isSubmitting && setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div">
            Return Courses to School Dean
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
            Instructor: {selectedInstructor?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              The following courses will be returned to the School Dean for review:
            </Typography>
            <Box sx={{ mb: 3, pl: 2 }}>
              {selectedInstructor?.courses.map(course => (
                <Typography key={course._id} variant="body2">
                  • {course.code} - {course.title}
                </Typography>
              ))}
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Feedback for School Dean"
              placeholder="Please provide your feedback and concerns for the School Dean to review..."
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              required
              disabled={isSubmitting}
              helperText="This feedback will only be visible to the School Dean"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setReviewDialogOpen(false)}
            disabled={isSubmitting}
            color="inherit"
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={() => handleReviewSubmit('reject')}
            loading={isSubmitting}
            variant="contained"
            color="warning"
            disabled={!rejectionNotes}
          >
            Return to School Dean
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViceDirectorCourses;
