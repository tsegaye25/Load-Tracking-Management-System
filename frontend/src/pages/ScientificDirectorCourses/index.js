import React, { useState, useEffect } from 'react';
import { LoadingButton } from '@mui/lab';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  alpha,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const InstructorRow = ({ instructor, onApprove, onReject }) => {
  const [open, setOpen] = useState(false);

  const calculateTotalWorkload = (courses) => {
    return courses.reduce((sum, course) => sum + (course.totalHours || 0), 0);
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
        <TableCell>{instructor.school?.name}</TableCell>
        <TableCell>{instructor.department}</TableCell>
        <TableCell align="center">{instructor.courses.length}</TableCell>
        <TableCell align="center">{calculateTotalWorkload(instructor.courses)}</TableCell>
        <TableCell align="center">
          <Stack direction="row" spacing={1} justifyContent="center">
            {instructor.courses.every(course => course.status === 'approved') ? (
              <Button
                variant="outlined"
                color="success"
                size="small"
                startIcon={<CheckIcon />}
              >
                Final Approval Complete
              </Button>
            ) : instructor.courses.every(course => course.status === 'rejected') ? (
              <Button
                variant="outlined"
                color="warning"
                size="small"
                startIcon={<CloseIcon />}
              >
                Returned to Vice Director
              </Button>
            ) : instructor.courses.every(course => course.status === 'vice-director-approved') ? (
              <>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => onApprove(instructor)}
                  size="small"
                  startIcon={<CheckIcon />}
                >
                  Give Final Approval
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => onReject(instructor)}
                  size="small"
                  startIcon={<CloseIcon />}
                >
                  Return to Vice Director
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                color="info"
                size="small"
              >
                Pending Vice Director
              </Button>
            )}
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Courses
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
                            course.status === 'approved' ? 'success' :
                            course.status === 'rejected' ? 'error' :
                            course.status === 'vice-director-approved' ? 'info' :
                            'default'
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
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/courses/scientific-director-courses`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      setInstructors(data.data.instructorWorkloads || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      enqueueSnackbar('Failed to fetch courses', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleReviewClick = (instructor, action) => {
    setSelectedInstructor(instructor);
    if (action === 'reject') {
      setReviewDialogOpen(true);
    } else {
      setApprovalDialogOpen(true);
    }
  };

  const handleApprovalConfirm = () => {
    handleReviewSubmit('approve');
    setApprovalDialogOpen(false);
  };

  const handleReviewSubmit = async (action) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/courses/review-by-scientific-director/${selectedInstructor._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            action,
            notes: rejectionNotes
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      enqueueSnackbar(
        action === 'approve' 
          ? 'Courses approved successfully' 
          : 'Courses returned to Vice Director',
        { variant: 'success' }
      );

      setRejectionNotes('');
      setReviewDialogOpen(false);
      fetchInstructors();
    } catch (error) {
      console.error('Error submitting review:', error);
      enqueueSnackbar('Failed to submit review', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Course Final Review
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Review and approve courses forwarded by Vice Scientific Director
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Instructor</TableCell>
              <TableCell>School</TableCell>
              <TableCell>Department</TableCell>
              <TableCell align="center">Total Courses</TableCell>
              <TableCell align="center">Total Workload</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {instructors
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((instructor) => (
                <InstructorRow
                  key={instructor._id}
                  instructor={instructor}
                  onApprove={() => handleReviewClick(instructor, 'approve')}
                  onReject={() => handleReviewClick(instructor, 'reject')}
                />
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={instructors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
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
            Confirm Final Course Approval
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
            Instructor: {selectedInstructor?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              The following courses will be given final approval:
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
            Confirm Final Approval
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
        <DialogTitle>Return Courses to Vice Director</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
            Please provide feedback for the Vice Director:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Feedback"
            fullWidth
            multiline
            rows={4}
            value={rejectionNotes}
            onChange={(e) => setRejectionNotes(e.target.value)}
            disabled={isSubmitting}
            required
          />
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
            disabled={!rejectionNotes.trim()}
          >
            Return to Vice Director
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ScientificDirectorCourses;
