import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Box, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Grid,
  IconButton, Card, CardContent, Divider, FormControl,
  InputLabel, Select, Chip, CircularProgress, Accordion,
  AccordionSummary, AccordionDetails, FormHelperText,
  Pagination, Stack, alpha, DialogContentText
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, 
  ExpandMore as ExpandMoreIcon, AssignmentInd as AssignmentIndIcon, 
  Search as SearchIcon, ArrowBack as ArrowBackIcon, 
  FilterList as FilterListIcon, Send as SendIcon
} from '@mui/icons-material';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { fetchCourses, createCourse, assignCourse, deleteCourse, updateCourseById } from '../../store/courseSlice';
import { getInstructors } from '../../store/authSlice';
import { toast } from 'react-toastify';

const formatDate = (dateString) => {
  if (!dateString) return 'Not Available';
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) 
    ? date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Not Available';
};

const CourseCard = ({ course, onEdit, onDelete, onAssign, onSelfAssign, onApprove, onReject, onResubmitToDean }) => {
  const { user } = useSelector((state) => state.auth);
  const isDepartmentHead = user?.role === 'department-head';
  const isInstructor = user?.role === 'instructor';

  // Check if the course is from the department head's department
  const isFromDepartmentHeadDepartment = isDepartmentHead && 
    course.department === user.department &&
    course.school === user.school;

  // Check if course is unassigned
  const isUnassigned = !course.instructor;

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          '& .MuiAccordionSummary-content': {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexGrow: 1
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
          <Box>
            <Typography variant="h6">
              {course.code} - {course.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {course.school} | {course.department}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {course.status !== 'unassigned' && (
              <Chip
                label={`Status: ${course.status}`}
                color={getStatusColor(course.status)}
                size="small"
              />
            )}
            {course.instructor && (
              <Chip
                label={`Instructor: ${course.instructor.name}`}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {isDepartmentHead && course.status === 'pending' && course.requestedBy && (
              <Chip
                label={`Requested by: ${course.requestedBy.name}`}
                color="info"
                variant="outlined"
                size="small"
              />
            )}
          </Stack>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isFromDepartmentHeadDepartment && (
            <>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(course);
                }}
                title="Edit"
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(course);
                }}
                title="Delete"
              >
                <DeleteIcon />
              </IconButton>
              {isUnassigned && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssign(course);
                  }}
                  title="Assign Instructor"
                  color="primary"
                >
                  <AssignmentIndIcon />
                </IconButton>
              )}
            </>
          )}
          {isInstructor && isUnassigned && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AssignmentIndIcon />}
              onClick={(e) => { e.stopPropagation(); onSelfAssign(course._id); }}
              sx={{ ml: 1 }}
            >
              Self-Assign
            </Button>
          )}
          {isDepartmentHead && course.status === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={(e) => { e.stopPropagation(); onApprove(course._id); }}
                sx={{ ml: 1 }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={(e) => { e.stopPropagation(); onReject(course._id, 'Please provide a reason for rejection'); }}
                sx={{ ml: 1 }}
              >
                Reject
              </Button>
            </>
          )}
          {isDepartmentHead && course.status === 'dean-rejected' && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={(e) => { e.stopPropagation(); onResubmitToDean(course); }}
              sx={{ ml: 1 }}
              startIcon={<SendIcon />}
            >
              Resubmit to Dean
            </Button>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Course Information
            </Typography>
            <Box sx={{ ml: 2 }}>
              <Typography variant="body2">
                <strong>Class Year:</strong> {course.classYear} Year
              </Typography>
              <Typography variant="body2">
                <strong>Semester:</strong> {course.semester} Semester
              </Typography>
              <Typography variant="body2">
                <strong>School:</strong> {course.school}
              </Typography>
              <Typography variant="body2">
                <strong>Department:</strong> {course.department}
              </Typography>
              {course.instructor && (
                <>
                  <Typography variant="body2">
                    <strong>Instructor:</strong> {course.instructor.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Instructor Email:</strong> {course.instructor.email}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Department:</strong> {course.instructor.department}
                  </Typography>
                </>
              )}
              {isDepartmentHead && course.status === 'pending' && course.requestedBy && (
                <>
                  <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1 }}>
                    Request Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Requested By:</strong> {course.requestedBy.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Instructor Email:</strong> {course.requestedBy.email}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Department:</strong> {course.requestedBy.department}
                  </Typography>
                  {course.approvalHistory && course.approvalHistory.length > 0 && (
                    <Typography variant="body2">
                      <strong>Requested On:</strong> {new Date(course.approvalHistory[0].date).toLocaleDateString()}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </Grid>

          {/* Credit Hours */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Credit Hours
            </Typography>
            <Box sx={{ ml: 2 }}>
              <Typography variant="body2">
                <strong>Credit Hours:</strong> {course.Hourfor?.creaditHours || 0}
              </Typography>
              <Typography variant="body2">
                <strong>Lecture Hours:</strong> {course.Hourfor?.lecture || 0}
              </Typography>
              <Typography variant="body2">
                <strong>Lab Hours:</strong> {course.Hourfor?.lab || 0}
              </Typography>
              <Typography variant="body2">
                <strong>Tutorial Hours:</strong> {course.Hourfor?.tutorial || 0}
              </Typography>
            </Box>
          </Grid>

          {/* Sections */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Number of Sections
            </Typography>
            <Box sx={{ ml: 2 }}>
              <Typography variant="body2">
                <strong>Lecture Sections:</strong> {course.Number_of_Sections?.lecture || 0}
              </Typography>
              <Typography variant="body2">
                <strong>Lab Sections:</strong> {course.Number_of_Sections?.lab || 0}
              </Typography>
              <Typography variant="body2">
                <strong>Tutorial Sections:</strong> {course.Number_of_Sections?.tutorial || 0}
              </Typography>
            </Box>
          </Grid>

          {/* Additional Hours */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Additional Hours
            </Typography>
            <Box sx={{ ml: 2 }}>
              <Typography variant="body2">
                <strong>HDP Hours:</strong> {course.hdp || 0}
              </Typography>
              <Typography variant="body2">
                <strong>Position Hours:</strong> {course.position || 0}
              </Typography>
              <Typography variant="body2">
                <strong>Branch Advisor Hours:</strong> {course.BranchAdvisor || 0}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', color: 'primary.main' }}>
                <strong>Total Hours:</strong> {course.totalHours || 0}
              </Typography>
            </Box>
          </Grid>

          {/* Rejection Information - Only show if course is rejected by dean and user is department head */}
          {course.status === 'dean-rejected' && (
            <Grid item xs={12}>
              <Card sx={{ mt: 2, bgcolor: (theme) => alpha(theme.palette.error.main, 0.05) }}>
                <CardContent>
                  <Typography variant="subtitle1" color="error" gutterBottom>
                    Course Status: Rejected by Dean
                  </Typography>
                  {isDepartmentHead && (
                    <>
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="body2">
                          <strong>Rejected Date:</strong> {formatDate(course.deanRejectionDate)}
                        </Typography>
                        {course.approvalHistory && course.approvalHistory.length > 0 && (
                          course.approvalHistory
                            .filter(history => history.status === 'dean-rejected')
                            .map((history, index) => (
                              <Box key={index} sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                  <strong>Rejection Reason:</strong>
                                </Typography>
                                <Typography variant="body2" color="error.dark" sx={{ ml: 2, mt: 0.5 }}>
                                  {history.comment}
                                </Typography>
                              </Box>
                            ))
                        )}
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => onResubmitToDean(course)}
                            startIcon={<SendIcon />}
                          >
                            Resubmit to Dean
                          </Button>
                        </Box>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

const SchoolCard = ({ school, courses, onSchoolClick, isSelected }) => {
  const courseCount = courses.filter(course => course.school === school).length;
  
  return (
    <Card 
      sx={{ 
        cursor: 'pointer',
        transform: isSelected ? 'scale(1.02)' : 'none',
        boxShadow: isSelected ? 6 : 1,
        transition: 'all 0.2s ease-in-out'
      }}
      onClick={() => onSchoolClick(school)}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {school}
        </Typography>
        <Typography color="text.secondary">
          {courseCount} {courseCount === 1 ? 'Course' : 'Courses'}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Courses = () => {
  const dispatch = useDispatch();
  const { courses, loading } = useSelector((state) => state.course);
  const { user } = useSelector((state) => state.auth);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filterValue, setFilterValue] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  
  // Additional filter states
  const [filterSchool, setFilterSchool] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterClassYear, setFilterClassYear] = useState('');
  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  const [resubmitCourse, setResubmitCourse] = useState(null);
  const [resubmitDialogOpen, setResubmitDialogOpen] = useState(false);

  const fetchInstructorsList = async () => {
    try {
      setLoadingInstructors(true);
      const result = await dispatch(getInstructors());
      console.log('Fetched instructors:', result);
      
      if (Array.isArray(result)) {
        const availableInstructors = result.filter(instructor => 
          instructor.department === user.department && 
          instructor.school === user.school
        );
        console.log('Filtered instructors:', availableInstructors);
        setInstructors(availableInstructors);
        
        if (availableInstructors.length === 0) {
          toast.warning(`No instructors available in ${user.department} department of ${user.school}`);
        }
      } else {
        console.error('Invalid instructors data:', result);
        toast.error('Failed to load instructors: Invalid data format');
      }
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
      toast.error(error.message || 'Failed to load instructors');
    } finally {
      setLoadingInstructors(false);
    }
  };

  useEffect(() => {
    dispatch(fetchCourses());
    if (user?.role === 'department-head') {
      fetchInstructorsList();
    }
  }, [dispatch, user]);

  const schools = [
    'College of Business and Economics',
    'College of Computing and Informatics',
    'College of Engineering',
    'College of Natural Sciences'
  ];

  const departments = {
    'College of Business and Economics': [
      'Management',
      'Accounting and Finance',
      'Economics',
      'Public Administration',
      'Logistics and Supply Chain Management',
      'Marketing Management',
      'Tourism and Hotel Management'
    ],
    'College of Computing and Informatics': ['Software Engineering', 'Computer Science', 'Information Technology'],
    'College of Engineering': ['Mechanical', 'Electrical', 'Civil'],
    'College of Natural Sciences': ['Mathematics', 'Physics', 'Chemistry', 'Biology']
  };

  useEffect(() => {
    if (courses) {
      let filtered = [...courses];
      
      // Filter by search value if any
      if (filterValue) {
        filtered = filtered.filter(course => 
          (course.title?.toLowerCase() || '').includes(filterValue.toLowerCase()) ||
          (course.code?.toLowerCase() || '').includes(filterValue.toLowerCase()) ||
          (course.department?.toLowerCase() || '').includes(filterValue.toLowerCase())
        );
      }

      // Apply additional filters
      if (filterSchool) {
        filtered = filtered.filter(course => course.school === filterSchool);
      }
      if (filterDepartment) {
        filtered = filtered.filter(course => course.department === filterDepartment);
      }
      if (filterSemester) {
        filtered = filtered.filter(course => course.semester === filterSemester);
      }
      if (filterClassYear) {
        filtered = filtered.filter(course => course.classYear === filterClassYear);
      }

      // If user is instructor, only show courses from their school
      if (user?.role === 'instructor' && user?.school) {
        filtered = filtered.filter(course => course?.school === user.school);
      }

      // Filter by selected school
      if (selectedSchool) {
        filtered = filtered.filter(course => course.school === selectedSchool);
      }

      setFilteredCourses(filtered);
    }
  }, [courses, filterValue, user, selectedSchool, filterSchool, filterDepartment, filterSemester, filterClassYear]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Get current courses for pagination
  const indexOfLastCourse = page * rowsPerPage;
  const indexOfFirstCourse = indexOfLastCourse - rowsPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  const handleFilterReset = () => {
    setFilterSchool('');
    setFilterDepartment('');
    setFilterSemester('');
    setFilterClassYear('');
  };

  const formik = useFormik({
    initialValues: {
      title: selectedCourse?.title || '',
      code: selectedCourse?.code || '',
      school: selectedCourse?.school || '',
      department: selectedCourse?.department || '',
      classYear: selectedCourse?.classYear || '',
      semester: selectedCourse?.semester || '',
      Hourfor: {
        creaditHours: selectedCourse?.Hourfor?.creaditHours || '',
        lecture: selectedCourse?.Hourfor?.lecture || '',
        lab: selectedCourse?.Hourfor?.lab || '',
        tutorial: selectedCourse?.Hourfor?.tutorial || ''
      },
      Number_of_Sections: {
        lecture: selectedCourse?.Number_of_Sections?.lecture || '',
        lab: selectedCourse?.Number_of_Sections?.lab || '',
        tutorial: selectedCourse?.Number_of_Sections?.tutorial || ''
      },
      hdp: selectedCourse?.hdp || '',
      position: selectedCourse?.position || '',
      BranchAdvisor: selectedCourse?.BranchAdvisor || ''
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Required'),
      code: Yup.string().required('Required'),
      school: Yup.string().required('Required'),
      department: Yup.string().required('Required'),
      classYear: Yup.string().required('Required'),
      semester: Yup.string().required('Required'),
      Hourfor: Yup.object({
        creaditHours: Yup.number().required('Required'),
        lecture: Yup.number().required('Required'),
        lab: Yup.number().required('Required'),
        tutorial: Yup.number().required('Required')
      }),
      Number_of_Sections: Yup.object({
        lecture: Yup.number().required('Required'),
        lab: Yup.number().required('Required'),
        tutorial: Yup.number().required('Required')
      }),
      hdp: Yup.number().required('Required'),
      position: Yup.number().required('Required'),
      BranchAdvisor: Yup.number().required('Required')
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (selectedCourse) {
          await dispatch(updateCourseById({ id: selectedCourse._id, courseData: values }));
          toast.success('Course updated successfully!');
        } else {
          // For department heads, automatically set school and department
          if (user?.role === 'department-head') {
            values.school = user.school;
            values.department = user.department;
          }
          await dispatch(createCourse(values));
          toast.success('Course created successfully!');
        }
        setOpenDialog(false);
        formik.resetForm();
      } catch (error) {
        console.error('Error:', error);
        toast.error(error.message || 'An error occurred');
      }
    },
  });

  const classYears = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
  const semesters = ['First', 'Second'];

  const handleAssignClick = (course) => {
    setSelectedCourse(course);
    setSelectedInstructor('');
    setOpenAssignDialog(true);
  };

  const handleAssignCourse = async () => {
    if (!selectedInstructor) {
      toast.error('Please select an instructor');
      return;
    }

    try {
      setLoadingInstructors(true);
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseURL}/api/v1/courses/${selectedCourse._id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ instructorId: selectedInstructor })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to assign course');
      }

      toast.success('Course assigned successfully');
      setOpenAssignDialog(false);
      setSelectedInstructor('');
      dispatch(fetchCourses());
    } catch (error) {
      console.error('Error assigning course:', error);
      toast.error(error.message || 'Failed to assign course');
    } finally {
      setLoadingInstructors(false);
    }
  };

  const handleSelfAssign = async (courseId) => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${baseURL}/api/v1/courses/${courseId}/self-assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to assign course');
      }

      toast.success('Course assigned successfully');
      dispatch(fetchCourses());
    } catch (error) {
      toast.error(error.message || 'An error occurred while assigning the course');
      console.error('Error assigning course:', error);
    }
  };

  const handleApprove = async (courseId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/courses/${courseId}/dean-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          status: 'dean-approved'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve course');
      }

      toast.success('Course approved successfully');
      dispatch(fetchCourses()); // Refresh the courses list
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to approve course');
    }
  };

  const handleReject = async (courseId, rejectionReason) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/courses/${courseId}/dean-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          status: 'dean-rejected',
          rejectionReason
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject course');
      }

      toast.success('Course rejected successfully');
      dispatch(fetchCourses()); // Refresh the courses list
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to reject course');
    }
  };

  const handleResubmitClick = (course) => {
    setResubmitCourse(course);
    setResubmitDialogOpen(true);
  };

  const handleResubmitConfirm = async () => {
    if (!resubmitCourse) return;

    try {
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseURL}/api/v1/courses/${resubmitCourse._id}/resubmit-to-dean`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to resubmit course');
      }

      toast.success('Course resubmitted to School Dean successfully');
      setResubmitDialogOpen(false);
      setResubmitCourse(null);
      dispatch(fetchCourses()); // Refresh the courses list
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to resubmit course');
    }
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    formik.setValues({
      title: course.title,
      code: course.code,
      school: course.school,
      department: course.department,
      classYear: course.classYear,
      semester: course.semester,
      Hourfor: course.Hourfor,
      Number_of_Sections: course.Number_of_Sections,
      hdp: course.hdp,
      position: course.position,
      BranchAdvisor: course.BranchAdvisor
    });
    setOpenDialog(true);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      const result = await dispatch(deleteCourse(courseId));
      if (result) {
        toast.success('Course deleted successfully');
        dispatch(fetchCourses());
      }
    }
  };

  const handleSearchChange = (event) => {
    setFilterValue(event.target.value);
  };

  const isDepartmentHead = user?.role === 'department-head';
  const isInstructor = user?.role === 'instructor';

  const AssignmentDialog = () => {
    const hasInstructors = Array.isArray(instructors) && instructors.length > 0;
    
    return (
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign Course: {selectedCourse?.code} - {selectedCourse?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Course Details
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Department:</strong> {selectedCourse?.department}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>School:</strong> {selectedCourse?.school}
              </Typography>
              <Typography variant="body2">
                <strong>Total Hours:</strong> {selectedCourse?.totalHours}
              </Typography>
            </Box>
            
            <FormControl fullWidth>
              <InputLabel id="instructor-select-label">Select Instructor</InputLabel>
              <Select
                labelId="instructor-select-label"
                id="instructor-select"
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                label="Select Instructor"
                disabled={loadingInstructors}
              >
                {loadingInstructors && (
                  <MenuItem value="" disabled>
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                      <CircularProgress size={20} sx={{ mr: 2 }} />
                      Loading instructors...
                    </Box>
                  </MenuItem>
                )}
                
                {!loadingInstructors && !hasInstructors && (
                  <MenuItem value="" disabled>
                    <Box sx={{ py: 1 }}>
                      <Typography color="text.secondary">
                        No instructors available in {user.school}
                      </Typography>
                    </Box>
                  </MenuItem>
                )}
                
                {!loadingInstructors && hasInstructors && (
                  <MenuItem value="">
                    <Box sx={{ py: 1 }}>
                      <Typography color="text.secondary">
                        <em>Select an instructor ({instructors.length} available)</em>
                      </Typography>
                    </Box>
                  </MenuItem>
                )}
                
                {!loadingInstructors && hasInstructors && 
                  instructors.map((instructor) => (
                    <MenuItem 
                      key={instructor._id} 
                      value={instructor._id}
                    >
                      <Box sx={{ py: 1 }}>
                        <Typography variant="subtitle2">
                          {instructor.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {instructor.department} • {instructor.school}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                }
              </Select>
              <FormHelperText>
                {loadingInstructors 
                  ? 'Loading instructors...' 
                  : !hasInstructors
                    ? `No instructors available in ${user.school}`
                    : `${instructors.length} instructor${instructors.length === 1 ? '' : 's'} available in ${user.school}`}
              </FormHelperText>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={() => setOpenAssignDialog(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssignCourse} 
            variant="contained" 
            color="primary"
            disabled={!selectedInstructor || loadingInstructors}
            startIcon={loadingInstructors ? <CircularProgress size={20} /> : <AssignmentIndIcon />}
          >
            {loadingInstructors ? 'Loading...' : 'Assign Course'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Courses Management
        </Typography>
        {(isDepartmentHead) && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedCourse(null);
              formik.resetForm();
              // Pre-fill school and department for department heads
              if (isDepartmentHead) {
                formik.setValues({
                  ...formik.initialValues,
                  school: user.school,
                  department: user.department
                });
              }
              setOpenDialog(true);
            }}
          >
            Add Course
          </Button>
        )}
      </Box>

      {/* Search and Filter Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search courses..."
          value={filterValue}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setOpenFilterDialog(true)}
        >
          Filters
        </Button>
      </Box>

      {/* Filter Dialog */}
      <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)}>
        <DialogTitle>Filter Courses</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>School</InputLabel>
              <Select
                value={filterSchool}
                onChange={(e) => setFilterSchool(e.target.value)}
                label="School"
              >
                <MenuItem value="">All Schools</MenuItem>
                {schools.map((school) => (
                  <MenuItem key={school} value={school}>{school}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                label="Department"
                disabled={!filterSchool}
              >
                <MenuItem value="">All Departments</MenuItem>
                {filterSchool && departments[filterSchool]?.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Semester</InputLabel>
              <Select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                label="Semester"
              >
                <MenuItem value="">All Semesters</MenuItem>
                {semesters.map((sem) => (
                  <MenuItem key={sem} value={sem}>{sem} Semester</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Class Year</InputLabel>
              <Select
                value={filterClassYear}
                onChange={(e) => setFilterClassYear(e.target.value)}
                label="Class Year"
              >
                <MenuItem value="">All Years</MenuItem>
                {classYears.map((year) => (
                  <MenuItem key={year} value={year}>{year} Year</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFilterReset}>Reset</Button>
          <Button onClick={() => setOpenFilterDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Schools Grid */}
      {!selectedSchool && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {schools.map((school) => (
            <Grid item xs={12} sm={6} md={3} key={school}>
              <SchoolCard
                school={school}
                courses={courses || []}
                onSchoolClick={setSelectedSchool}
                isSelected={selectedSchool === school}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Selected School Header */}
      {selectedSchool && (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => setSelectedSchool(null)}
          >
            Back to Schools
          </Button>
          <Typography variant="h5">
            {selectedSchool}
          </Typography>
        </Box>
      )}

      {/* Course List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {currentCourses.map((course) => (
              <Grid item xs={12} key={course._id}>
                <CourseCard
                  course={course}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAssign={handleAssignClick}
                  onSelfAssign={handleSelfAssign}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onResubmitToDean={handleResubmitClick}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {filteredCourses.length > 0 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Stack spacing={2}>
                <Pagination
                  count={Math.ceil(filteredCourses.length / rowsPerPage)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Stack>
            </Box>
          )}
        </>
      )}

      {/* No Courses Message */}
      {!loading && filteredCourses.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No courses found {selectedSchool ? `in ${selectedSchool}` : ''}
          </Typography>
        </Box>
      )}

      {/* Course Form Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCourse ? 'Edit Course' : 'Add Course'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Course Title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Course Code"
                  name="code"
                  value={formik.values.code}
                  onChange={formik.handleChange}
                  error={formik.touched.code && Boolean(formik.errors.code)}
                  helperText={formik.touched.code && formik.errors.code}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>School</InputLabel>
                  <Select
                    name="school"
                    value={formik.values.school}
                    onChange={(e) => {
                      formik.setFieldValue('school', e.target.value);
                      formik.setFieldValue('department', '');
                    }}
                    error={formik.touched.school && Boolean(formik.errors.school)}
                    disabled={isDepartmentHead} // Disable for department heads
                  >
                    {schools.map((school) => (
                      <MenuItem key={school} value={school}>
                        {school}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department"
                    value={formik.values.department}
                    onChange={formik.handleChange}
                    error={formik.touched.department && Boolean(formik.errors.department)}
                    disabled={isDepartmentHead} // Disable for department heads
                  >
                    {formik.values.school && departments[formik.values.school] ? 
                      departments[formik.values.school].map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      )) : null}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Class Year</InputLabel>
                  <Select
                    name="classYear"
                    value={formik.values.classYear}
                    onChange={formik.handleChange}
                    error={formik.touched.classYear && Boolean(formik.errors.classYear)}
                  >
                    {classYears.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year} Year
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.classYear && formik.errors.classYear && (
                    <FormHelperText error>{formik.errors.classYear}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    name="semester"
                    value={formik.values.semester}
                    onChange={formik.handleChange}
                    error={formik.touched.semester && Boolean(formik.errors.semester)}
                  >
                    {semesters.map((sem) => (
                      <MenuItem key={sem} value={sem}>
                        {sem} Semester
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.semester && formik.errors.semester && (
                    <FormHelperText error>{formik.errors.semester}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Credit Hours */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Credit Hours
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Credit Hours"
                  name="Hourfor.creaditHours"
                  type="number"
                  value={formik.values.Hourfor.creaditHours}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.Hourfor?.creaditHours &&
                    Boolean(formik.errors.Hourfor?.creaditHours)
                  }
                  helperText={
                    formik.touched.Hourfor?.creaditHours &&
                    formik.errors.Hourfor?.creaditHours
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Lecture Hours"
                  name="Hourfor.lecture"
                  type="number"
                  value={formik.values.Hourfor.lecture}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.Hourfor?.lecture &&
                    Boolean(formik.errors.Hourfor?.lecture)
                  }
                  helperText={
                    formik.touched.Hourfor?.lecture &&
                    formik.errors.Hourfor?.lecture
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Lab Hours"
                  name="Hourfor.lab"
                  type="number"
                  value={formik.values.Hourfor.lab}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.Hourfor?.lab &&
                    Boolean(formik.errors.Hourfor?.lab)
                  }
                  helperText={
                    formik.touched.Hourfor?.lab &&
                    formik.errors.Hourfor?.lab
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tutorial Hours"
                  name="Hourfor.tutorial"
                  type="number"
                  value={formik.values.Hourfor.tutorial}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.Hourfor?.tutorial &&
                    Boolean(formik.errors.Hourfor?.tutorial)
                  }
                  helperText={
                    formik.touched.Hourfor?.tutorial &&
                    formik.errors.Hourfor?.tutorial
                  }
                />
              </Grid>

              {/* Number of Sections */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Number of Sections
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Lecture Sections"
                  name="Number_of_Sections.lecture"
                  type="number"
                  value={formik.values.Number_of_Sections.lecture}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.Number_of_Sections?.lecture &&
                    Boolean(formik.errors.Number_of_Sections?.lecture)
                  }
                  helperText={
                    formik.touched.Number_of_Sections?.lecture &&
                    formik.errors.Number_of_Sections?.lecture
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Lab Sections"
                  name="Number_of_Sections.lab"
                  type="number"
                  value={formik.values.Number_of_Sections.lab}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.Number_of_Sections?.lab &&
                    Boolean(formik.errors.Number_of_Sections?.lab)
                  }
                  helperText={
                    formik.touched.Number_of_Sections?.lab &&
                    formik.errors.Number_of_Sections?.lab
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Tutorial Sections"
                  name="Number_of_Sections.tutorial"
                  type="number"
                  value={formik.values.Number_of_Sections.tutorial}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.Number_of_Sections?.tutorial &&
                    Boolean(formik.errors.Number_of_Sections?.tutorial)
                  }
                  helperText={
                    formik.touched.Number_of_Sections?.tutorial &&
                    formik.errors.Number_of_Sections?.tutorial
                  }
                />
              </Grid>

              {/* Additional Hours */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Additional Hours
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="HDP Hours"
                  name="hdp"
                  type="number"
                  value={formik.values.hdp}
                  onChange={formik.handleChange}
                  error={formik.touched.hdp && Boolean(formik.errors.hdp)}
                  helperText={formik.touched.hdp && formik.errors.hdp}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Position Hours"
                  name="position"
                  type="number"
                  value={formik.values.position}
                  onChange={formik.handleChange}
                  error={formik.touched.position && Boolean(formik.errors.position)}
                  helperText={formik.touched.position && formik.errors.position}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Branch Advisor Hours"
                  name="BranchAdvisor"
                  type="number"
                  value={formik.values.BranchAdvisor}
                  onChange={formik.handleChange}
                  error={formik.touched.BranchAdvisor && Boolean(formik.errors.BranchAdvisor)}
                  helperText={formik.touched.BranchAdvisor && formik.errors.BranchAdvisor}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenDialog(false);
              formik.resetForm();
            }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedCourse ? 'Update Course' : 'Create Course'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <AssignmentDialog />

      {/* Resubmit Confirmation Dialog */}
      <Dialog 
        open={resubmitDialogOpen} 
        onClose={() => {
          setResubmitDialogOpen(false);
          setResubmitCourse(null);
        }}
      >
        <DialogTitle>Confirm Course Resubmission</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to resubmit this course to the School Dean?
          </DialogContentText>
          {resubmitCourse && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Course Details:
              </Typography>
              <Typography variant="body2">
                <strong>Code:</strong> {resubmitCourse.code}
              </Typography>
              <Typography variant="body2">
                <strong>Title:</strong> {resubmitCourse.title}
              </Typography>
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                Please confirm that you have:
              </Typography>
              <Box component="ul" sx={{ mt: 1, mb: 2 }}>
                <Typography component="li" variant="body2">
                  • Reviewed the dean's rejection feedback
                </Typography>
                <Typography component="li" variant="body2">
                  • Made necessary changes to address the concerns
                </Typography>
                <Typography component="li" variant="body2">
                  • Verified all course information is correct
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setResubmitDialogOpen(false);
              setResubmitCourse(null);
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleResubmitConfirm}
            color="primary"
            variant="contained"
            startIcon={<SendIcon />}
          >
            Confirm Resubmission
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Courses;