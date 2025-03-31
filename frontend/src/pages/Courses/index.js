import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Box, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Grid,
  IconButton, Card, CardContent, Divider, FormControl,
  InputLabel, Select, Chip, CircularProgress, Accordion,
  AccordionSummary, AccordionDetails, FormHelperText,
  Pagination, Stack, alpha, DialogContentText, Tabs, Tab,
  Badge, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Tooltip
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, 
  ExpandMore as ExpandMoreIcon, AssignmentInd as AssignmentIndIcon, 
  Search as SearchIcon, ArrowBack as ArrowBackIcon, 
  FilterList as FilterListIcon, Send as SendIcon, AssignmentInd,
  CheckCircleIcon, CancelIcon
} from '@mui/icons-material';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { fetchCourses, createCourse, assignCourse, deleteCourse, updateCourseById, getMyCourses } from '../../store/courseSlice';
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
  const isInstructor = user?.role === 'instructor';
  const isDepartmentHead = user?.role === 'department-head';
  const [instructorHours, setInstructorHours] = useState(null);

  useEffect(() => {
    const fetchInstructorHours = async () => {
      if (course.instructor) {
        try {
          const response = await fetch(`http://localhost:5000/api/v1/users/hours/${course.instructor._id}`, {
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
      }
    };

    fetchInstructorHours();
  }, [course.instructor]);

  // Department Head Permissions
  const canReviewCourse = isDepartmentHead && 
    course.department === user.department && 
    course.school === user.school;

  // Course Assignment Permissions
  const canAssignInstructor = canReviewCourse && 
    !course.instructor && // No instructor assigned
    !course.requestedBy && // No pending request
    course.status !== 'rejected'; // Not rejected

  // Instructor Permissions
  const canSelfAssign = isInstructor && 
    !course.instructor && 
    course.department === user.department &&
    course.school === user.school &&
    (course.status !== 'pending' && // Not pending approval
     !(course.status === 'rejected' && course.requestedBy?._id === user._id)); // Can self-assign if rejected by someone else

  const canRequestApproval = isInstructor && 
    course.department === user.department && 
    course.school === user.school &&
    course.status === 'rejected';

  const getRejectorRole = (rejectedBy) => {
    if (!rejectedBy) return 'Department Head'; 
    switch (rejectedBy.role) {
      case 'department-head':
        return 'Department Head';
      case 'school-dean':
        return 'School Dean';
      case 'vice-director':
        return 'Vice Director';
      default:
        return 'Department Head'; 
    }
  };

  // Check if the course is from the department head's department
  // Removed the redundant isFromDepartmentHeadDepartment check since we already use canReviewCourse for all department head permissions

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'dean-approved': return 'success';
      case 'pending': return 'warning';
      case 'dean-rejected': return 'error';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  // Show requestedBy only for pending courses
  const showRequestedBy = course.status === 'pending' && course.requestedBy;

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
            <Chip
              label={course.status === 'rejected' && course.rejectedInstructor
                ? `Rejected: ${course.rejectedInstructor.name}`
                : `Status: ${course.status}`}
              color={getStatusColor(course.status)}
              size="small"
            />
            {course.instructor && (
              <Chip
                label={`Instructor: ${course.instructor.name}`}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {showRequestedBy && (
              <Chip
                label={`Requested by: ${course.requestedBy.name}`}
                color="info"
                variant="outlined"
                size="small"
              />
            )}
          </Stack>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {canReviewCourse && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {canAssignInstructor && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssign(course);
                  }}
                  startIcon={<AssignmentIndIcon />}
                  color="primary"
                >
                  Assign Instructor
                </Button>
              )}
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(course);
                }}
                title="Edit Course"
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(course);
                }}
                title="Delete Course"
              >
                <DeleteIcon />
              </IconButton>
              {course.status === 'pending' && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onApprove(course); }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onReject(course); }}
                  >
                    Reject
                  </Button>
                </Box>
              )}
              {course.status === 'dean-rejected' && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={(e) => { e.stopPropagation(); onResubmitToDean(course); }}
                  startIcon={<SendIcon />}
                >
                  Resubmit to Dean
                </Button>
              )}
            </Box>
          )}
          {canSelfAssign && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AssignmentIndIcon />}
              onClick={(e) => { e.stopPropagation(); onSelfAssign(course); }}
            >
              Self-Assign
            </Button>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          {/* Course and Instructor Information - First Row */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Course Details
            </Typography>
            <Box sx={{ ml: 2 }}>
              <Typography variant="body2">
                <strong>Code:</strong> {course.code}
              </Typography>
              <Typography variant="body2">
                <strong>Title:</strong> {course.title}
              </Typography>
              <Typography variant="body2">
                <strong>School:</strong> {course.school}
              </Typography>
              <Typography variant="body2">
                <strong>Department:</strong> {course.department}
              </Typography>
              {course.instructor && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    <strong>Instructor:</strong> {course.instructor.name}
                  </Typography>
                  {instructorHours && (
                    <>
                      <Typography variant="body2">
                        <strong>HDP Hours:</strong> {instructorHours.hdpHour}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Position Hours:</strong> {instructorHours.positionHour}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Batch Advisor Hours:</strong> {instructorHours.batchAdvisor}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', color: 'primary.main' }}>
                        <strong>Total Hours:</strong> {instructorHours.hdpHour + instructorHours.positionHour + instructorHours.batchAdvisor}
                      </Typography>
                    </>
                  )}
                </>
              )}
            </Box>
          </Grid>

          {/* Hours Information - Second Row */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Course Hours
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
              <Divider sx={{ my: 1 }} />
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

          {/* Rejection Information - Last Row */}
          {canRequestApproval && course.status === 'rejected' && (
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: 1,
                  background: (theme) => alpha(theme.palette.warning.light, 0.15),
                  border: '1px solid',
                  borderColor: 'warning.main',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 16,
                    width: 4,
                    height: '100%',
                    bgcolor: 'warning.main',
                    borderRadius: 1
                  }
                }}
              >
                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle1" color="warning.dark" gutterBottom sx={{ fontWeight: 600 }}>
                    Course Available for Request
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      {course.rejectedInstructor && (
                        <>
                          <Typography variant="body2" color="warning.dark">
                            <strong>Previously Requested By:</strong> {course.rejectedInstructor.name}
                          </Typography>
                          <Typography variant="body2" color="warning.dark">
                            <strong>Department:</strong> {course.rejectedInstructor.department}
                          </Typography>
                        </>
                      )}
                      <Typography variant="body2" color="warning.dark">
                        <strong>Rejected On:</strong> {formatDate(course.rejectedBy?.date || course.rejectionDate)}
                      </Typography>
                      <Typography variant="body2" color="warning.dark">
                        <strong>Reviewed By:</strong> {getRejectorRole(course.rejectedBy)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      {course.rejectionReason && (
                        <>
                          <Typography variant="body2" color="warning.dark">
                            <strong>Previous Request Rejected Because:</strong>
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="warning.dark"
                            sx={{ 
                              mt: 0.5,
                              pl: 2,
                              borderLeft: '2px solid',
                              borderColor: 'warning.main'
                            }}
                          >
                            {course.rejectionReason}
                          </Typography>
                        </>
                      )}
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => onSelfAssign(course)}
                      startIcon={<AssignmentIndIcon />}
                    >
                      Request This Course
                    </Button>
                  </Box>
                </Box>
              </Box>
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
  const { courses, loading } = useSelector((state) => {
    return state.course;
  });
  const { user } = useSelector((state) => {
    return state.auth;
  });
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [courseToAssign, setCourseToAssign] = useState(null);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filterValue, setFilterValue] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  
  // Additional filter states
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterClassYear, setFilterClassYear] = useState('');
  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  const [resubmitCourse, setResubmitCourse] = useState(null);
  const [resubmitDialogOpen, setResubmitDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selfAssignDialogOpen, setSelfAssignDialogOpen] = useState(false);
  const [courseToSelfAssign, setCourseToSelfAssign] = useState(null);
  const [isSelfAssigning, setIsSelfAssigning] = useState(false);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [courseToReject, setCourseToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [courseToApprove, setCourseToApprove] = useState(null);
  const [isApproving, setIsApproving] = useState(false);

  const [selectedTab, setSelectedTab] = useState(0);

  const API_BASE_URL = 'http://localhost:5000';

  const fetchInstructorsList = async () => {
    try {
      setLoadingInstructors(true);
      const result = await dispatch(getInstructors());
      
      if (Array.isArray(result)) {
        const availableInstructors = result.filter(instructor => 
          instructor.department === user.department && 
          instructor.school === user.school
        );
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
    if (user?.role === 'instructor') {
      dispatch(fetchCourses());
    } else if (user?.role === 'school-dean') {
      dispatch(getMyCourses());
    } else if (user?.role === 'department-head') {
      dispatch(fetchCourses()); // Fetch all courses to filter by school
    } else {
      dispatch(fetchCourses());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (!courses) return;

    let filtered = [...courses];

    // For instructors, show only courses from their school
    if (user?.role === 'instructor' && user?.school) {
      filtered = filtered.filter(course => course.school === user.school);
    }

    // For department heads, show only courses from their department
    if (user?.role === 'department-head' && user?.department) {
      filtered = filtered.filter(course => course.department === user.department);
    }

    // Apply search filter
    if (filterValue) {
      const searchTerm = filterValue.toLowerCase();
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchTerm) ||
        course.code?.toLowerCase().includes(searchTerm) ||
        course.department?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply other filters
    if (filterDepartment) {
      filtered = filtered.filter(course => course.department === filterDepartment);
    }
    if (filterSemester) {
      filtered = filtered.filter(course => course.semester === filterSemester);
    }
    if (filterClassYear) {
      filtered = filtered.filter(course => course.classYear === filterClassYear);
    }

    setFilteredCourses(filtered);
  }, [courses, filterValue, filterDepartment, filterSemester, filterClassYear, user?.role, user?.school, user?.department]);

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

  const classYears = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
  const semesters = ['First', 'Second'];

  const handlePageChange = (event, newPage) => {
    setPage(newPage - 1);
  };

  // Get current courses for pagination
  const getCurrentPageItems = () => {
    
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    if (user?.role === 'department-head') {
      const categorizedCoursesForDepartmentHead = {
        allSchoolCourses: courses.filter(course => course.school === user.school),
        departmentCourses: courses.filter(course => course.department === user.department),
        pendingApprovals: courses.filter(course => course.status === 'pending'),
        assignedCourses: courses.filter(course => course.instructor)
      };

      switch (selectedTab) {
        case 0: // All School Courses
          return categorizedCoursesForDepartmentHead.allSchoolCourses?.slice(startIndex, endIndex) || [];
        case 1: // Department Courses
          return categorizedCoursesForDepartmentHead.departmentCourses?.slice(startIndex, endIndex) || [];
        case 2: // Pending Approvals
          return categorizedCoursesForDepartmentHead.pendingApprovals?.slice(startIndex, endIndex) || [];
        case 3: // Assigned Courses
          return categorizedCoursesForDepartmentHead.assignedCourses?.slice(startIndex, endIndex) || [];
        default:
          return [];
      }
    } else if (user?.role === 'instructor') {
      const categorizedCourses = {
        allCourses: filteredCourses,
        myAssigned: filteredCourses.filter(course => 
          course.instructor?._id === user._id
        ),
        available: filteredCourses.filter(course => 
          !course.instructor && 
          course.department === user.department &&
          course.status !== 'pending'
        ),
        rejected: filteredCourses.filter(course => 
          course.department === user.department &&
          course.status === 'rejected' &&
          course.requestedBy?._id === user._id // Only show rejections for current instructor
        ),
        pending: filteredCourses.filter(course => 
          course.requestedBy?._id === user._id && 
          ['pending', 'dean-review'].includes(course.status)
        ),
        othersAssigned: filteredCourses.filter(course =>
          course.instructor && 
          course.instructor._id !== user._id
        )
      };

      switch (selectedTab) {
        case 0: return categorizedCourses.allCourses?.slice(startIndex, endIndex) || [];
        case 1: return categorizedCourses.myAssigned?.slice(startIndex, endIndex) || [];
        case 2: return categorizedCourses.available?.slice(startIndex, endIndex) || [];
        case 3: return categorizedCourses.rejected?.slice(startIndex, endIndex) || [];
        case 4: return categorizedCourses.pending?.slice(startIndex, endIndex) || [];
        case 5: return categorizedCourses.othersAssigned?.slice(startIndex, endIndex) || [];
        default: return [];
      }
    } else {
      return filteredCourses.slice(startIndex, endIndex);
    }
  };

  // Get total count for pagination
  const getTotalCount = () => {
    if (user?.role === 'department-head') {
      const categorizedCoursesForDepartmentHead = {
        allSchoolCourses: courses.filter(course => course.school === user.school),
        departmentCourses: courses.filter(course => course.department === user.department),
        pendingApprovals: courses.filter(course => course.status === 'pending'),
        assignedCourses: courses.filter(course => course.instructor)
      };

      switch (selectedTab) {
        case 0: return categorizedCoursesForDepartmentHead.allSchoolCourses?.length || 0;
        case 1: return categorizedCoursesForDepartmentHead.departmentCourses?.length || 0;
        case 2: return categorizedCoursesForDepartmentHead.pendingApprovals?.length || 0;
        case 3: return categorizedCoursesForDepartmentHead.assignedCourses?.length || 0;
        default: return 0;
      }
    } else if (user?.role === 'instructor') {
      const categorizedCourses = {
        allCourses: filteredCourses,
        myAssigned: filteredCourses.filter(course => 
          course.instructor?._id === user._id
        ),
        available: filteredCourses.filter(course => 
          !course.instructor && 
          course.department === user.department &&
          course.status !== 'pending'
        ),
        rejected: filteredCourses.filter(course => 
          course.department === user.department &&
          course.status === 'rejected' &&
          course.requestedBy?._id === user._id // Only show rejections for current instructor
        ),
        pending: filteredCourses.filter(course => 
          course.requestedBy?._id === user._id && 
          ['pending', 'dean-review'].includes(course.status)
        ),
        othersAssigned: filteredCourses.filter(course =>
          course.instructor && 
          course.instructor._id !== user._id
        )
      };

      switch (selectedTab) {
        case 0: return categorizedCourses.allCourses?.length || 0;
        case 1: return categorizedCourses.myAssigned?.length || 0;
        case 2: return categorizedCourses.available?.length || 0;
        case 3: return categorizedCourses.rejected?.length || 0;
        case 4: return categorizedCourses.pending?.length || 0;
        case 5: return categorizedCourses.othersAssigned?.length || 0;
        default: return 0;
      }
    } else {
      return filteredCourses.length;
    }
  };

  const handleFilterReset = () => {
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
      }
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
      })
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

  const handleAssignClick = async (course) => {
    setCourseToAssign(course);
    setOpenAssignDialog(true);
    await fetchInstructorsList(); // Fetch instructors when dialog opens
  };

  const handleAssignCourse = async () => {
    if (!courseToAssign || !selectedInstructor) return;

    try {
      setLoadingInstructors(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseToAssign._id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ instructorId: selectedInstructor })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign course');
      }

      toast.success('Course assigned successfully');
      setOpenAssignDialog(false);
      setCourseToAssign(null);
      setSelectedInstructor('');
      dispatch(fetchCourses()); // Refresh courses
    } catch (error) {
      console.error('Error assigning course:', error);
      toast.error(error.message || 'Failed to assign course');
    } finally {
      setLoadingInstructors(false);
    }
  };

  const handleSelfAssignClick = (course) => {
    setCourseToSelfAssign(course);
    setSelfAssignDialogOpen(true);
  };

  const handleSelfAssign = async (course) => {
    try {
      setIsSelfAssigning(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${course._id}/self-assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      let data;
      try {
        data = await response.json();
      } catch (err) {
        throw new Error('Server error. Please try again later.');
      }

      if (!response.ok) {
        let errorMessage = data?.message || 'Failed to assign course';
        if (errorMessage.includes('previously rejected')) {
          errorMessage = 'You cannot request this course as it was previously rejected for you. Please check the Rejected tab for details.';
        } else if (errorMessage.includes('pending approval')) {
          errorMessage = 'This course is currently pending approval. Please check the Pending tab.';
        } else if (errorMessage.includes('already assigned')) {
          errorMessage = 'This course has already been assigned to another instructor.';
        }
        throw new Error(errorMessage);
      }

      // Refresh courses after successful self-assignment
      dispatch(fetchCourses());
      toast.success('Course selection request submitted for approval', { 
        variant: 'success',
        autoHideDuration: 3000
      });
    } catch (error) {
      console.error('Error assigning course:', error);
      toast.error(error.message || 'An error occurred while assigning the course', { 
        variant: 'error',
        autoHideDuration: 5000
      });
    } finally {
      setIsSelfAssigning(false);
      setSelfAssignDialogOpen(false);
    }
  };

  const handleApprove = async (courseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/department-head-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          status: 'approved'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Approval error response:', errorData);
        throw new Error(errorData.message || 'Failed to approve course');
      }

      toast.success('Course approved successfully');
      dispatch(fetchCourses()); // Refresh the courses list
    } catch (error) {
      console.error('Error approving course:', error);
      toast.error(error.message || 'Failed to approve course');
    }
  };

  const handleApproveClick = (course) => {
    setCourseToApprove(course);
    setApproveDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!courseToApprove) return;

    try {
      setIsApproving(true);
      await handleApprove(courseToApprove._id);
      setApproveDialogOpen(false);
      setCourseToApprove(null);
    } catch (error) {
      console.error('Error in approval confirmation:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = (course) => {
    setCourseToReject(course);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!courseToReject || !rejectionReason.trim()) return;

    try {
      setIsRejecting(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseToReject._id}/department-head-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          status: 'rejected',
          rejectionReason
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Rejection error response:', errorData);
        throw new Error(errorData.message || 'Failed to reject course');
      }

      toast.success('Course rejected successfully');
      setRejectDialogOpen(false);
      setCourseToReject(null);
      setRejectionReason('');
      dispatch(fetchCourses()); // Refresh the courses list
    } catch (error) {
      console.error('Error rejecting course:', error);
      toast.error(error.message || 'Failed to reject course');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleResubmitClick = (course) => {
    setResubmitCourse(course);
    setResubmitDialogOpen(true);
  };

  const handleResubmitConfirm = async () => {
    if (!resubmitCourse) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${resubmitCourse._id}/resubmit-to-dean`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Resubmit error response:', errorData);
        throw new Error(errorData.message || 'Failed to resubmit course');
      }

      toast.success('Course resubmitted to School Dean successfully');
      setResubmitDialogOpen(false);
      setResubmitCourse(null);
      dispatch(fetchCourses()); // Refresh the courses list
    } catch (error) {
      console.error('Error resubmitting course:', error);
      toast.error(error.message || 'Failed to resubmit course');
    }
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    try {
      setIsDeleting(true);
      await dispatch(deleteCourse(courseToDelete._id)).unwrap();
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      // Refresh courses after deletion
      dispatch(fetchCourses());
    } catch (error) {
      console.error('Error deleting course:', error);
    } finally {
      setIsDeleting(false);
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
      Number_of_Sections: course.Number_of_Sections
    });
    setOpenDialog(true);
  };

  const handleSearchChange = (event) => {
    setFilterValue(event.target.value);
  };

  const isDepartmentHead = user?.role === 'department-head';
  const isInstructor = user?.role === 'instructor';

  const categorizedCoursesForDepartmentHead = useMemo(() => {
    if (!courses || !user) return {};

    const schoolCourses = courses.filter(course => course.school === user.school);
    const departmentCourses = schoolCourses.filter(course => course.department === user.department);
    const pendingApprovals = departmentCourses.filter(course => course.status === 'pending');
    const assignedCourses = departmentCourses.filter(course => course.instructor);

    return {
      allSchoolCourses: schoolCourses,
      departmentCourses,
      pendingApprovals,
      assignedCourses
    };
  }, [courses, user]);

  const categorizedCourses = useMemo(() => {

    if (!isInstructor || !filteredCourses) {
      return {
        allCourses: [],
        myAssigned: [],
        available: [],
        rejected: [],
        pending: [],
        othersAssigned: []
      };
    }

    const result = {
      allCourses: filteredCourses,
      myAssigned: filteredCourses.filter(course => 
        course.instructor?._id === user._id
      ),
      available: filteredCourses.filter(course => 
        !course.instructor && 
        course.department === user.department &&
        course.status !== 'pending'
      ),
      rejected: filteredCourses.filter(course => 
        course.department === user.department &&
        course.status === 'rejected' &&
        course.requestedBy?._id === user._id // Only show rejections for current instructor
      ),
      pending: filteredCourses.filter(course => 
        course.requestedBy?._id === user._id && 
        ['pending', 'dean-review'].includes(course.status)
      ),
      othersAssigned: filteredCourses.filter(course =>
        course.instructor && 
        course.instructor._id !== user._id
      )
    };


    return result;
  }, [filteredCourses, user, isInstructor]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setPage(0); // Reset page when changing tabs
  };

  const ApproveCourseDialog = () => (
    <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Approve Course Assignment</DialogTitle>
      <DialogContent>
        {courseToApprove && courseToApprove.requestedBy && (
          <>
            <DialogContentText>
              Are you sure you want to approve this course assignment?
            </DialogContentText>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Course Details:
              </Typography>
              <Typography variant="body1">
                <strong>Course:</strong> {courseToApprove.code} - {courseToApprove.title}
              </Typography>
              <Typography variant="body1">
                <strong>Department:</strong> {courseToApprove.department}
              </Typography>
              <Typography variant="body1">
                <strong>School:</strong> {courseToApprove.school}
              </Typography>
              
              <Typography variant="subtitle1" color="primary" sx={{ mt: 2 }} gutterBottom>
                Instructor Details:
              </Typography>
              <Typography variant="body1">
                <strong>Name:</strong> {courseToApprove.requestedBy.name}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {courseToApprove.requestedBy.email}
              </Typography>
              <Typography variant="body1">
                <strong>Department:</strong> {courseToApprove.requestedBy.department}
              </Typography>

              {courseToApprove.requestedBy.currentWorkload !== undefined && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="primary">
                    Current Workload:
                  </Typography>
                  <Typography variant="body2">
                    {courseToApprove.requestedBy.currentWorkload} credit hours
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    + {courseToApprove.creditHours} credit hours (this course)
                  </Typography>
                  <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>
                    Total After Approval:
                  </Typography>
                  <Typography variant="body2">
                    {courseToApprove.requestedBy.currentWorkload + courseToApprove.creditHours} credit hours
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
        <LoadingButton
          onClick={handleApproveConfirm}
          loading={isApproving}
          color="success"
          variant="contained"
        >
          Approve Assignment
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );

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
              <InputLabel>Department</InputLabel>
              <Select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                label="Department"
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments[user.school] && departments[user.school].map((dept) => (
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

      {/* Department Head Tabs */}
      {isDepartmentHead && (
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={
                <Badge 
                  badgeContent={categorizedCoursesForDepartmentHead.allSchoolCourses?.length || 0} 
                  color="primary"
                  max={99}
                >
                  <Box sx={{ pr: 1 }}>All School Courses</Box>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge 
                  badgeContent={categorizedCoursesForDepartmentHead.departmentCourses?.length || 0} 
                  color="primary"
                  max={99}
                >
                  <Box sx={{ pr: 1 }}>Department Courses</Box>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge 
                  badgeContent={categorizedCoursesForDepartmentHead.pendingApprovals?.length || 0} 
                  color="primary"
                  max={99}
                >
                  <Box sx={{ pr: 1 }}>Pending Approvals</Box>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge 
                  badgeContent={categorizedCoursesForDepartmentHead.assignedCourses?.length || 0} 
                  color="primary"
                  max={99}
                >
                  <Box sx={{ pr: 1 }}>Assigned Courses</Box>
                </Badge>
              } 
            />
          </Tabs>
        </Box>
      )}

      {/* Instructor Tabs */}
      {isInstructor && (
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={
                <Badge 
                  badgeContent={categorizedCourses.allCourses?.length || 0} 
                  color="info"
                  max={99}
                >
                  <Tooltip title="All courses in your school">
                    <Box sx={{ pr: 1 }}>All Courses</Box>
                  </Tooltip>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge 
                  badgeContent={categorizedCourses.myAssigned?.length || 0} 
                  color="success"
                  max={99}
                >
                  <Box sx={{ pr: 1 }}>My Courses</Box>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge 
                  badgeContent={categorizedCourses.available?.length || 0} 
                  color="info"
                  max={99}
                >
                  <Tooltip title="Unassigned courses available for self-assignment, including rejected courses from other instructors">
                    <Box sx={{ pr: 1 }}>Available</Box>
                  </Tooltip>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge 
                  badgeContent={categorizedCourses.rejected?.length || 0} 
                  color="error"
                  max={99}
                >
                  <Tooltip title="Courses that were rejected when you requested them">
                    <Box sx={{ pr: 1 }}>Rejected</Box>
                  </Tooltip>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge 
                  badgeContent={categorizedCourses.pending?.length || 0} 
                  color="warning"
                  max={99}
                >
                  <Box sx={{ pr: 1 }}>Pending</Box>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge 
                  badgeContent={categorizedCourses.othersAssigned?.length || 0} 
                  color="default"
                  max={99}
                >
                  <Box sx={{ pr: 1 }}>Other Instructors</Box>
                </Badge>
              } 
            />
          </Tabs>
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
            {getCurrentPageItems().map((course) => (
              <Grid item xs={12} key={course._id}>
                <CourseCard
                  course={course}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onAssign={handleAssignClick}
                  onSelfAssign={handleSelfAssignClick}
                  onApprove={handleApproveClick}
                  onReject={handleReject}
                  onResubmitToDean={handleResubmitClick}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {getTotalCount() > 0 && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(getTotalCount() / rowsPerPage)}
                page={page + 1}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}

          {/* Empty state message */}
          {getTotalCount() === 0 && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body1" color="textSecondary">
                {user?.role === 'instructor' ? (
                  selectedTab === 0 ? "No courses found in your school" :
                  selectedTab === 1 ? "You haven't been assigned any courses yet" :
                  selectedTab === 2 ? "No courses available for self-assignment" :
                  selectedTab === 3 ? "None of your course requests have been rejected" :
                  selectedTab === 4 ? "No pending course requests" :
                  "No courses assigned to other instructors"
                ) : (
                  "No courses found"
                )}
              </Typography>
              {selectedTab === 2 && user?.role === 'instructor' && (
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                  Available courses include unassigned courses and those rejected for other instructors
                </Typography>
              )}
            </Box>
          )}
        </>
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

      <AssignCourseDialog
        instructors={instructors}
        openAssignDialog={openAssignDialog}
        setOpenAssignDialog={setOpenAssignDialog}
        selectedCourse={courseToAssign}
        selectedInstructor={selectedInstructor}
        setSelectedInstructor={setSelectedInstructor}
        loadingInstructors={loadingInstructors}
        handleAssignCourse={handleAssignCourse}
        user={user}
      />

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
              <Typography variant="subtitle2" color="primary" gutterBottom>
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

      <DeleteConfirmationDialog 
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        courseToDelete={courseToDelete}
        isDeleting={isDeleting}
        handleDeleteConfirm={handleDeleteConfirm}
      />

      {/* Self-Assign Confirmation Dialog */}
      <Dialog
        open={selfAssignDialogOpen}
        onClose={() => !isSelfAssigning && setSelfAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Self-Assign Course</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to self-assign the course "{courseToSelfAssign?.code} - {courseToSelfAssign?.title}"?
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Department: {courseToSelfAssign?.department} | School: {courseToSelfAssign?.school}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Credit Hours: {courseToSelfAssign?.creditHours} | 
              Lecture: {courseToSelfAssign?.lectureHours}h | 
              Lab: {courseToSelfAssign?.labHours}h | 
              Tutorial: {courseToSelfAssign?.tutorialHours}h
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={() => setSelfAssignDialogOpen(false)}
            disabled={isSelfAssigning}
            variant="outlined"
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={() => handleSelfAssign(courseToSelfAssign)}
            loading={isSelfAssigning}
            variant="contained"
            color="primary"
            startIcon={<AssignmentIndIcon />}
          >
            Confirm Self-Assignment
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Reject Course Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Course</DialogTitle>
        <DialogContent>
          {courseToReject && (
            <>
              <DialogContentText>
                Please provide a reason for rejecting the course: <strong>{courseToReject.code} - {courseToReject.title}</strong>
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Rejection Reason"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                error={!rejectionReason.trim()}
                helperText={!rejectionReason.trim() ? 'Rejection reason is required' : ''}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <LoadingButton
            onClick={handleRejectConfirm}
            loading={isRejecting}
            disabled={!rejectionReason.trim()}
            color="error"
            variant="contained"
          >
            Reject Course
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <ApproveCourseDialog />
    </Container>
  );
};

const AssignCourseDialog = ({
  instructors,
  openAssignDialog,
  setOpenAssignDialog,
  selectedCourse,
  selectedInstructor,
  setSelectedInstructor,
  loadingInstructors,
  handleAssignCourse,
  user
}) => {
  const hasInstructors = instructors.length > 0;

  return (
    <Dialog
      open={openAssignDialog}
      onClose={() => !loadingInstructors && setOpenAssignDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Assign Course to Instructor
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
          {selectedCourse?.code} - {selectedCourse?.title}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Department: {selectedCourse?.department} | School: {selectedCourse?.school}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Select Instructor</InputLabel>
            <Select
              value={selectedInstructor}
              onChange={(e) => setSelectedInstructor(e.target.value)}
              disabled={loadingInstructors || !hasInstructors}
              label="Select Instructor"
            >
              {instructors.map((instructor) => (
                <MenuItem 
                  key={instructor._id} 
                  value={instructor._id}
                >
                  <Box sx={{ py: 1 }}>
                    <Typography variant="subtitle2">
                      {instructor.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Department: {instructor.department} • School: {instructor.school?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Current Workload: {instructor.totalWorkload || 0} hours
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {loadingInstructors 
                ? 'Loading instructors...' 
                : !hasInstructors
                  ? `No instructors available in ${user.department} department of ${user.school}`
                  : `${instructors.length} instructor${instructors.length === 1 ? '' : 's'} available`}
            </FormHelperText>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button 
          onClick={() => setOpenAssignDialog(false)}
          disabled={loadingInstructors}
          variant="outlined"
        >
          Cancel
        </Button>
        <LoadingButton
          onClick={handleAssignCourse}
          loading={loadingInstructors}
          disabled={!selectedInstructor}
          variant="contained"
          color="primary"
          startIcon={<AssignmentIndIcon />}
        >
          Assign Course
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

const DeleteConfirmationDialog = ({ 
  deleteDialogOpen, 
  setDeleteDialogOpen, 
  courseToDelete, 
  isDeleting, 
  handleDeleteConfirm 
}) => (
  <Dialog
    open={deleteDialogOpen}
    onClose={() => !isDeleting && setDeleteDialogOpen(false)}
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle>Delete Course</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete the course "{courseToDelete?.code} - {courseToDelete?.title}"? 
        This action cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ p: 2.5 }}>
      <Button 
        onClick={() => setDeleteDialogOpen(false)}
        disabled={isDeleting}
        variant="outlined"
      >
        Cancel
      </Button>
      <LoadingButton
        onClick={handleDeleteConfirm}
        loading={isDeleting}
        variant="contained"
        color="error"
        startIcon={<DeleteIcon />}
      >
        Delete Course
      </LoadingButton>
    </DialogActions>
  </Dialog>
);

export default Courses;