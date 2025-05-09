import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Grid, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  FormHelperText, 
  IconButton, 
  Tooltip, 
  Chip, 
  Divider, 
  Tabs, 
  Tab, 
  InputAdornment,
  Badge,
  FormControlLabel,
  Checkbox,
  Alert,
  AlertTitle,
  Card, 
  CardContent, 
  CircularProgress, 
  Accordion,
  AccordionSummary, 
  AccordionDetails,
  Pagination, 
  Stack, 
  alpha, 
  TableContainer, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody,
  Skeleton,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  ExpandMore as ExpandMoreIcon, 
  AssignmentInd as AssignmentIndIcon, 
  Search as SearchIcon, 
  ArrowBack as ArrowBackIcon, 
  FilterList as FilterListIcon, 
  Send as SendIcon, 
  CheckCircle as CheckCircleIcon, 
  Close as CloseIcon, 
  School as SchoolIcon, 
  Business as BusinessIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  ViewList as ViewListIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  HourglassEmpty as HourglassEmptyIcon,
  PeopleAlt as PeopleAltIcon,
  Info as InfoIcon,
  Class as ClassIcon
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

const CourseCard = ({ course, onEdit, onDelete, onAssign, onSelfAssign, onApprove, onReject, onResubmitToDean, expanded, onExpand }) => {
  const { user } = useSelector((state) => state.auth);
  const isInstructor = user?.role === 'instructor';
  const isDepartmentHead = user?.role === 'department-head';
  const [instructorHours, setInstructorHours] = useState(null);

  useEffect(() => {
    const fetchInstructorHours = async () => {
      if (course.instructor && user) {
        // Only fetch hours if user has one of the required roles
        const requiredRoles = ['scientific-director', 'vice-director', 'department-head', 'finance'];
        if (requiredRoles.includes(user.role)) {
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
      }
    };

    fetchInstructorHours();
  }, [course.instructor, user]);

  // Department Head Permissions
  const canReviewCourse = isDepartmentHead && 
    course.department === user.department && 
    course.school === user.school;

  // Course Assignment Permissions
  const canAssignInstructor = canReviewCourse && 
    !course.instructor && // No instructor assigned
    !course.requestedBy; // No pending request
    // Removed the restriction for rejected courses so department heads can assign rejected courses

  // Instructor Permissions
  const canSelfAssign = isInstructor && 
    !course.instructor && 
    course.school === user.school &&
    (course.status !== 'pending' && // Not pending approval
     !(course.status === 'rejected' && course.requestedBy?._id === user._id)); // Can self-assign if rejected by someone else

  const canRequestApproval = isInstructor && 
    course.school === user.school &&
    course.status === 'rejected';

  const getRejectorRole = (rejectedBy, status) => {
    // If we have rejectedBy information, use that first
    if (rejectedBy && rejectedBy.role) {
      switch (rejectedBy.role) {
        case 'department-head':
          return 'Department Head';
        case 'school-dean':
          return 'School Dean';
        case 'vice-scientific-director':
          return 'Vice Scientific Director';
        case 'scientific-director':
          return 'Scientific Director';
        case 'finance':
          return 'Finance';
        default:
          return 'Administrator';
      }
    }
    
    // Fallback to status-based determination if rejectedBy is not available
    if (status === 'dean-rejected') {
      return 'School Dean';
    } else if (status === 'department-head-rejected') {
      return 'Department Head';
    } else if (status === 'vice-director-rejected') {
      return 'Vice Scientific Director';
    } else if (status === 'scientific-director-rejected') {
      return 'Scientific Director';
    } else {
      return 'Administrator';
    }
  };
  
  // Check if course was rejected by department head
  const isRejectedByDepartmentHead = (course) => {
    // If the course is pending, don't show rejection message even if it was previously rejected
    if (course.status === 'pending') {
      return false;
    }
    
    // Check if rejected by role
    if (course.rejectedBy && course.rejectedBy.role === 'department-head') {
      return true;
    }
    // Check if rejected by status
    if (course.status === 'department-head-rejected' || course.status === 'rejected') {
      return true;
    }
    return false;
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

  const handleExpandClick = (e) => {
    e.stopPropagation();
    onExpand(course._id);
  };

  // Check if the course is rejected
  const isRejected = course.status === 'rejected' || 
                    course.status === 'department-head-rejected' || 
                    course.status === 'dean-rejected' || 
                    course.status === 'vice-director-rejected' || 
                    course.status === 'scientific-director-rejected' || 
                    course.status === 'finance-rejected';
  
  // Format rejection date with time if available
  const rejectionDate = course.updatedAt ? new Date(course.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'Unknown';
  
  // Format rejection time if available
  const rejectionTime = course.updatedAt ? new Date(course.updatedAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }) : '';
  
  // Get rejection reason based on status
  let rejectionReason = 'No reason provided';
  
  // Always use the rejectionReason field regardless of status
  // This ensures we always show the correct rejection reason
  rejectionReason = course.rejectionReason || 'No reason provided';
  
  // For debugging
  if (course.status.includes('rejected')) {
    console.log(`Course ${course.code} rejection info:`, {
      status: course.status,
      reason: course.rejectionReason,
      rejectedBy: course.rejectedBy,
      deanRejectionDate: course.deanRejectionDate
    });
  }
  
  // Get rejector role
  const rejectorRole = getRejectorRole(course.rejectedBy, course.status);
                    
  return (
    <Box sx={{ position: 'relative', mb: 2 }}>
      <Paper
        elevation={2}
        sx={{
          mb: isRejected ? 0 : 2,
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          position: 'relative',
          ...(isRejected && {
            borderLeft: '4px solid',
            borderColor: 'error.main',
          }),
          '&:hover': {
            boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
            transform: 'translateY(-2px)'
          }
        }}
      >
        {/* Rejection banner for department head rejections - visible to all users */}
        {isRejectedByDepartmentHead(course) && (
          <Box 
            sx={{
              p: 1.5,
              bgcolor: (theme) => alpha(theme.palette.error.light, 0.1),
              borderBottom: '1px solid',
              borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <CancelIcon fontSize="small" color="error" />
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main' }}>
              Rejected by Department Head • {rejectionDate}
            </Typography>
          </Box>
        )}
        
        {/* Rejection banner for School Dean rejections - only visible to Department Heads */}
        {!isInstructor && course.status === 'dean-rejected' && (
          <Box 
            sx={{
              p: 1.5,
              bgcolor: (theme) => alpha(theme.palette.error.light, 0.1),
              borderBottom: '1px solid',
              borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <CancelIcon fontSize="small" color="error" />
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main' }}>
              Rejected by School Dean • {rejectionDate}
            </Typography>
          </Box>
        )}
      {/* Card Header */}
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 1.5, sm: 2 },
          borderBottom: expanded ? 1 : 0,
          borderColor: 'divider',
          bgcolor: (theme) => expanded ? alpha(theme.palette.primary.main, 0.04) : 'transparent'
        }}
      >
        {/* Course Title and Basic Info */}
        <Box sx={{ width: '100%' }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            gap: { xs: 1, sm: 1 }, 
            mb: 1,
            width: '100%'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                color: 'primary.main',
                lineHeight: 1.3,
                wordBreak: 'break-word'
              }}
            >
              {course.code} - {course.title}
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap', 
            gap: { xs: 0.75, sm: 1 }, 
            mb: { xs: 2, sm: 0 }
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                mb: { xs: 0.5, sm: 0 }
              }}
            >
              <BusinessIcon sx={{ fontSize: 16 }} />
              {course.department}
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 0.75,
              mt: { xs: 0.5, sm: 0 }
            }}>
              {course.instructor && (
                <Chip
                  label={`Instructor: ${course.instructor.name}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ 
                    height: 24,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    '& .MuiChip-label': {
                      px: { xs: 1, sm: 1.2 }
                    }
                  }}
                />
              )}
              {showRequestedBy && (
                <Chip
                  label={`Requested by: ${course.requestedBy.name}`}
                  color="info"
                  variant="outlined"
                  size="small"
                  sx={{ 
                    height: 24,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    '& .MuiChip-label': {
                      px: { xs: 1, sm: 1.2 }
                    }
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: { xs: 0.75, sm: 1 }, 
          alignItems: 'center',
          justifyContent: { xs: 'flex-start', sm: 'flex-end' },
          width: { xs: '100%', sm: 'auto' },
          mt: { xs: 1, sm: 0 }
        }}>
          {canReviewCourse && (
            <>
              {/* Show Edit/Delete buttons only if: */}
              {/* 1. Course is not yet approved by department head (status is pending or department-head-review) */}
              {/* 2. OR course was rejected by School Dean (status is dean-rejected) */}
              {/* 3. OR course is unassigned (no instructor assigned) */}
              {(course.status === 'pending' || 
                course.status === 'department-head-review' || 
                course.status === 'dean-rejected' ||
                !course.instructor) && (
                <>
                  <Tooltip title="Edit Course">
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(course);
                      }}
                      sx={{ bgcolor: alpha('#000', 0.04) }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Course">
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(course);
                      }}
                      sx={{ bgcolor: alpha('#000', 0.04) }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
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
                  sx={{ borderRadius: 1.5 }}
                >
                  Assign
                </Button>
              )}
              {course.status === 'pending' && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onApprove(course); }}
                    sx={{ borderRadius: 1.5 }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onReject(course); }}
                    sx={{ borderRadius: 1.5 }}
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
                  sx={{ borderRadius: 1.5 }}
                >
                  Resubmit
                </Button>
              )}
            </>
          )}
          {canSelfAssign && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AssignmentIndIcon />}
              onClick={(e) => { e.stopPropagation(); onSelfAssign(course); }}
              sx={{ borderRadius: 1.5 }}
            >
              Self-Assign
            </Button>
          )}
          <Tooltip title={expanded ? "Hide Details" : "Show Details"}>
            <IconButton 
              onClick={handleExpandClick}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
                bgcolor: alpha('#000', 0.04)
              }}
              size="small"
            >
              <ExpandMoreIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Expandable Content */}
      <Box
        sx={{
          maxHeight: expanded ? '1500px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.4s ease',
          p: expanded ? { xs: 2, md: 3 } : 0,
          pt: expanded ? { xs: 1.5, md: 2 } : 0
        }}
      >
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Course Details */}
          <Grid item xs={12} md={6}>
            <Box sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.light, 0.05),
              height: '100%',
              overflow: 'hidden'
            }}>
              <Typography 
                variant="subtitle1" 
                color="primary.main" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  pb: 1,
                  borderBottom: 1,
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.1)
                }}
              >
                <SchoolIcon fontSize="small" />
                Course Details
              </Typography>
              
              <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: { xs: 0.5, sm: 1 } }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Code
                  </Typography>
                  <Typography variant="body1">
                    {course.code}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Title
                  </Typography>
                  <Typography variant="body1">
                    {course.title}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Department
                  </Typography>
                  <Typography variant="body1">
                    {course.department}
                  </Typography>
                </Grid>
              </Grid>

              {course.instructor && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography 
                    variant="subtitle2" 
                    color="primary.main" 
                    sx={{ 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1.5
                    }}
                  >
                    <AssignmentIndIcon fontSize="small" />
                    Instructor Information
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {course.instructor.name}
                  </Typography>
                  
                  {instructorHours && (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          HDP Hours
                        </Typography>
                        <Typography variant="body1">
                          {instructorHours.hdpHour}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Position Hours
                        </Typography>
                        <Typography variant="body1">
                          {instructorHours.positionHour}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Batch Advisor Hours
                        </Typography>
                        <Typography variant="body1">
                          {instructorHours.batchAdvisor}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Total Hours
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {instructorHours.hdpHour + instructorHours.positionHour + instructorHours.batchAdvisor}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </>
              )}
            </Box>
          </Grid>

          {/* Course Hours */}
          <Grid item xs={12} md={6}>
            <Box sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.light, 0.05),
              height: '100%',
              overflow: 'hidden'
            }}>
              <Typography 
                variant="subtitle1" 
                color="primary.main" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  pb: 1,
                  borderBottom: 1,
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.1)
                }}
              >
                <PendingIcon fontSize="small" />
                Course Hours
              </Typography>
              
              <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: { xs: 0.5, sm: 1 } }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Credit Hours
                  </Typography>
                  <Typography variant="body1">
                    {course.Hourfor?.creaditHours || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Lecture Hours
                  </Typography>
                  <Typography variant="body1">
                    {course.Hourfor?.lecture || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Lab Hours
                  </Typography>
                  <Typography variant="body1">
                    {course.Hourfor?.lab || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tutorial Hours
                  </Typography>
                  <Typography variant="body1">
                    {course.Hourfor?.tutorial || 0}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              
              <Typography 
                variant="subtitle2" 
                color="primary.main" 
                sx={{ 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1.5
                }}
              >
                Sections
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Lecture
                  </Typography>
                  <Typography variant="body1">
                    {course.Number_of_Sections?.lecture || 0}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Lab
                  </Typography>
                  <Typography variant="body1">
                    {course.Number_of_Sections?.lab || 0}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tutorial
                  </Typography>
                  <Typography variant="body1">
                    {course.Number_of_Sections?.tutorial || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Rejection Information - Shown for rejected courses */}
          {isRejected && (
            <>
              {/* Show rejection reason - Always shown to the instructor who requested the course */}
              {/* Department heads can only see rejection details for courses rejected by School Deans */}
              {((isInstructor && course.requestedBy && course.requestedBy._id === user._id) || 
               /* Or if user is the instructor assigned to the course when it was rejected */
               (isInstructor && course.rejectedInstructor && course.rejectedInstructor.id === user._id) ||
               /* Or if user is a department head and the course was rejected by a School Dean */
               (isDepartmentHead && course.status === 'dean-rejected')) && (
                <Grid item xs={12}>
                  <Box 
                    sx={{ 
                      p: { xs: 2, sm: 3 }, 
                      mt: 2,
                      borderRadius: 2,
                      bgcolor: (theme) => alpha(theme.palette.error.light, 0.08),
                      border: '1px solid',
                      borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Typography 
                      variant="subtitle1" 
                      color="error.main" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        pb: 1,
                        borderBottom: 1,
                        borderColor: (theme) => alpha(theme.palette.error.main, 0.2)
                      }}
                    >
                      <CancelIcon fontSize="small" />
                      Rejection Information
                    </Typography>
                    
                    {/* Rejected By and Rejection Date/Time */}
                    <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <b>Rejected By:</b> {getRejectorRole(course.rejectedBy, course.status)}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <b>Rejection Date:</b> {rejectionDate}
                      </Typography>
                      {rejectionTime && (
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <b>Rejection Time:</b> {rejectionTime}
                        </Typography>
                      )}
                    </Box>
                    
                    <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 600, mt: 1 }}>
                      Reason:
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mt: 1.5 }}>
                      {rejectionReason}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </>
          )}
        </Grid>
      </Box>
    </Paper>
    {/* Removed the rejection indicator below the card */}
  </Box>
  );
};

const Courses = () => {
  const theme = useTheme();
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
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  
  // Handle course expansion - only one course can be expanded at a time
  const handleCourseExpand = (courseId) => {
    setExpandedCourseId(expandedCourseId === courseId ? null : courseId);
  };
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  
  // Filter states - removed semester and class year filters
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  const [resubmitCourse, setResubmitCourse] = useState(null);
  const [resubmitDialogOpen, setResubmitDialogOpen] = useState(false);
  const [confirmResubmitChecked, setConfirmResubmitChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selfAssignDialogOpen, setSelfAssignDialogOpen] = useState(false);
  const [courseToSelfAssign, setCourseToSelfAssign] = useState(null);
  const [isSelfAssigning, setIsSelfAssigning] = useState(false);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [courseToReject, setCourseToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectConfirmed, setRejectConfirmed] = useState(false);
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
        let availableInstructors;
        
        // For department heads, show all instructors in their school
        if (user?.role === 'department-head') {
          availableInstructors = result.filter(instructor => 
            instructor.school === user.school
          );
          
          if (availableInstructors.length === 0) {
            toast.warning(`No instructors available in ${user.school} school`);
          }
        } else {
          // For other roles, keep the original department filtering
          availableInstructors = result.filter(instructor => 
            instructor.department === user.department && 
            instructor.school === user.school
          );
          
          if (availableInstructors.length === 0) {
            toast.warning(`No instructors available in ${user.department} department of ${user.school}`);
          }
        }
        
        setInstructors(availableInstructors);
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

    // Make sure courses is defined before spreading
    let filtered = courses ? [...courses] : [];

    // For instructors, show only courses from their school
    if (user?.role === 'instructor' && user?.school) {
      filtered = filtered.filter(course => course.school === user.school);
    }

    // For department heads, show all courses from their school
    if (user?.role === 'department-head' && user?.school) {
      filtered = filtered.filter(course => course.school === user.school);
    }
    
    // For admin users, show all courses (no filtering by school)
    // This ensures admin users can see all courses in the system

    // Apply search filter
    if (filterValue) {
      const searchTerm = filterValue.toLowerCase();
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchTerm) ||
        course.code?.toLowerCase().includes(searchTerm) ||
        course.department?.toLowerCase().includes(searchTerm) ||
        course.instructor?.name?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply school filter
    if (filterSchool) {
      filtered = filtered.filter(course => course.school === filterSchool);
    }

    // Apply department filter
    if (filterDepartment) {
      filtered = filtered.filter(course => course.department === filterDepartment);
    }

    // Apply status filter - enhanced with more clear status categories
    if (filterStatus) {
      if (filterStatus === 'pending') {
        filtered = filtered.filter(course => 
          course.status === 'pending' || 
          course.status === 'dean-review' ||
          course.status === 'department-head-review'
        );
      } else if (filterStatus === 'approved') {
        filtered = filtered.filter(course => 
          course.status === 'department-head-approved' || 
          course.status === 'dean-approved' || 
          course.status === 'approved' ||
          course.status === 'vice-director-approved' || 
          course.status === 'scientific-director-approved' || 
          course.status === 'finance-approved'
        );
      } else if (filterStatus === 'rejected') {
        filtered = filtered.filter(course => 
          course.status === 'department-head-rejected' || 
          course.status === 'dean-rejected' || 
          course.status === 'rejected' ||
          course.status === 'vice-director-rejected' || 
          course.status === 'scientific-director-rejected' || 
          course.status === 'finance-rejected'
        );
      } else if (filterStatus === 'unassigned') {
        filtered = filtered.filter(course => 
          !course.instructor && !course.requestedBy
        );
      }
    }
    
    // Sort courses to prioritize pending, unassigned, and recently approved/assigned courses
    filtered.sort((a, b) => {
      // Priority 1: Pending courses (highest priority)
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      
      // Priority 2: Unassigned courses
      const aUnassigned = !a.instructor && !a.requestedBy;
      const bUnassigned = !b.instructor && !b.requestedBy;
      if (aUnassigned && !bUnassigned) return -1;
      if (!aUnassigned && bUnassigned) return 1;
      
      // Priority 3: Recently approved courses
      if (a.status === 'department-head-approved' && b.status !== 'department-head-approved') return -1;
      if (a.status !== 'department-head-approved' && b.status === 'department-head-approved') return 1;
      
      // Priority 4: Recently assigned courses (courses with instructors but not yet approved)
      const aRecentlyAssigned = a.instructor && a.status === 'dean-review';
      const bRecentlyAssigned = b.instructor && b.status === 'dean-review';
      if (aRecentlyAssigned && !bRecentlyAssigned) return -1;
      if (!aRecentlyAssigned && bRecentlyAssigned) return 1;
      
      // Priority 5: Dean rejected courses (need attention)
      if (a.status === 'dean-rejected' && b.status !== 'dean-rejected') return -1;
      if (a.status !== 'dean-rejected' && b.status === 'dean-rejected') return 1;
      
      // Default: Sort by update date (most recent first)
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });

    setFilteredCourses(filtered);
  }, [courses, filterValue, filterDepartment, filterStatus, user?.role, user?.school, user?.department]);

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
        pendingApprovals: filteredCourses.filter(course => 
          course.department === user.department && 
          course.status === 'pending'
        ),
        unassignedCourses: filteredCourses.filter(course => 
          course.school === user.school && 
          !course.instructor && 
          course.status !== 'pending'
        ),
        departmentCourses: filteredCourses.filter(course => 
          course.department === user.department
        ),
        allSchoolCourses: filteredCourses.filter(course => 
          course.school === user.school
        ),
        assignedCourses: filteredCourses.filter(course => 
          course.school === user.school && 
          course.instructor
        )
      };

      // Get the visible tabs based on data availability
      const visibleTabs = [];
      if (categorizedCoursesForDepartmentHead.pendingApprovals?.length > 0) {
        visibleTabs.push('pendingApprovals');
      }
      if (categorizedCoursesForDepartmentHead.unassignedCourses?.length > 0) {
        visibleTabs.push('unassignedCourses');
      }
      visibleTabs.push('departmentCourses', 'allSchoolCourses', 'assignedCourses');
      
      // Get the category to show based on the selected tab
      const categoryToShow = visibleTabs[selectedTab] || visibleTabs[0];
      
      return categorizedCoursesForDepartmentHead[categoryToShow]?.slice(startIndex, endIndex) || [];
    } else if (user?.role === 'instructor') {
      const categorizedCourses = {
        allCourses: filteredCourses,
        myAssigned: filteredCourses.filter(course => 
          course.instructor?._id === user._id
        ),
        available: filteredCourses.filter(course => 
          !course.instructor && 
          course.school === user.school &&
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
        schoolCourses: filteredCourses.filter(course => 
          course.school === user.school
        ),
        othersAssigned: filteredCourses.filter(course =>
          course.instructor && 
          course.instructor._id !== user._id &&
          course.school === user.school
        )
      };

      switch (selectedTab) {
        case 0: return categorizedCourses.allCourses?.slice(startIndex, endIndex) || [];
        case 1: return categorizedCourses.myAssigned?.slice(startIndex, endIndex) || [];
        case 2: return categorizedCourses.available?.slice(startIndex, endIndex) || [];
        case 3: return categorizedCourses.rejected?.slice(startIndex, endIndex) || [];
        case 4: return categorizedCourses.pending?.slice(startIndex, endIndex) || [];
        case 5: return categorizedCourses.schoolCourses?.slice(startIndex, endIndex) || [];
        case 6: return categorizedCourses.othersAssigned?.slice(startIndex, endIndex) || [];
        default: return [];
      }
    } else {
      // For admin and other roles, return a slice of filtered courses
      return filteredCourses?.slice(startIndex, endIndex) || [];
    }
  };

  // Get total count for pagination
  const getTotalCount = () => {
    if (user?.role === 'department-head') {
      const categorizedCoursesForDepartmentHead = {
        pendingApprovals: filteredCourses.filter(course => 
          course.department === user.department && 
          course.status === 'pending'
        ),
        unassignedCourses: filteredCourses.filter(course => 
          course.school === user.school && 
          !course.instructor && 
          course.status !== 'pending'
        ),
        departmentCourses: filteredCourses.filter(course => 
          course.department === user.department
        ),
        allSchoolCourses: filteredCourses.filter(course => 
          course.school === user.school
        ),
        assignedCourses: filteredCourses.filter(course => 
          course.school === user.school && 
          course.instructor
        )
      };

      // Get the visible tabs based on data availability
      const visibleTabs = [];
      if (categorizedCoursesForDepartmentHead.pendingApprovals?.length > 0) {
        visibleTabs.push('pendingApprovals');
      }
      if (categorizedCoursesForDepartmentHead.unassignedCourses?.length > 0) {
        visibleTabs.push('unassignedCourses');
      }
      visibleTabs.push('departmentCourses', 'allSchoolCourses', 'assignedCourses');
      
      // Get the category to show based on the selected tab
      const categoryToShow = visibleTabs[selectedTab] || visibleTabs[0];
      
      return categorizedCoursesForDepartmentHead[categoryToShow]?.length || 0;
    } else if (user?.role === 'instructor') {
      const categorizedCourses = {
        allCourses: filteredCourses,
        myAssigned: filteredCourses.filter(course => 
          course.instructor?._id === user._id
        ),
        available: filteredCourses.filter(course => 
          !course.instructor && 
          course.school === user.school &&
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
        schoolCourses: filteredCourses.filter(course => 
          course.school === user.school
        ),
        othersAssigned: filteredCourses.filter(course =>
          course.instructor && 
          course.instructor._id !== user._id &&
          course.school === user.school
        )
      };

      switch (selectedTab) {
        case 0: return categorizedCourses.allCourses?.length || 0;
        case 1: return categorizedCourses.myAssigned?.length || 0;
        case 2: return categorizedCourses.available?.length || 0;
        case 3: return categorizedCourses.rejected?.length || 0;
        case 4: return categorizedCourses.pending?.length || 0;
        case 5: return categorizedCourses.schoolCourses?.length || 0;
        case 6: return categorizedCourses.othersAssigned?.length || 0;
        default: return 0;
      }
    } else {
      // For admin and other roles, return the total count of filtered courses
      return filteredCourses?.length || 0;
    }
  };

  const handleFilterReset = () => {
    setFilterValue('');
    setFilterDepartment('');
    setFilterStatus('');
  };

  const formik = useFormik({
    initialValues: {
      title: selectedCourse?.title || '',
      code: selectedCourse?.code || '',
      school: selectedCourse?.school || '',
      department: selectedCourse?.department || '',
      classYear: selectedCourse?.classYear || '',
      // Removed semester from initial values
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

      // Update the course in the local state without refreshing
      // Find the course in the current filtered list
      const courseIndex = filteredCourses.findIndex(c => c._id === course._id);
      if (courseIndex !== -1) {
        // Create a new array with the updated course
        const newFilteredCourses = [...filteredCourses];
        newFilteredCourses[courseIndex] = {
          ...newFilteredCourses[courseIndex],
          status: 'pending',
          requestedBy: { _id: user._id, name: user.name }
        };
        
        // Update the filtered courses state directly
        setFilteredCourses(newFilteredCourses);
        
        // Also update the original courses array in Redux
        const updatedCourses = courses.map(c => {
          if (c._id === course._id) {
            return {
              ...c,
              status: 'pending',
              requestedBy: { _id: user._id, name: user.name }
            };
          }
          return c;
        });
        
        // Use the correct reducer action to update the Redux store
        dispatch({
          type: 'course/updateCourse',
          payload: {
            ...course,
            status: 'pending',
            requestedBy: { _id: user._id, name: user.name }
          }
        });
      }
      
      // Use a simpler approach with Material-UI's built-in notification system
      // Display a success message using the existing toast system
      toast.success('Course Assignment Request success! Please wait until the Department Head approves your request.', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'course-assignment-toast',
        style: {
          backgroundColor: '#4caf50',
          color: 'white',
          fontWeight: 500,
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          padding: '16px',
          fontSize: '16px',
          zIndex: 9999,
          marginTop: '80px', // Ensure it appears below the header
          marginBottom: '20px',
          width: 'auto',
          maxWidth: '90vw',
          minWidth: '280px'
        }
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
    if (!courseToReject || !rejectionReason.trim() || !rejectConfirmed) return;

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
      setRejectConfirmed(false);
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
      // Set loading state
      setIsSubmitting(true);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${resubmitCourse._id}/resubmit-to-dean`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          skipEmail: true // Skip email notification to avoid hitting email limits
        }),
      });

      let errorData;
      let isEmailLimitError = false;
      
      if (!response.ok) {
        errorData = await response.json();
        console.error('Resubmit error response:', errorData);
        
        // Check if this is an email limit error
        isEmailLimitError = errorData.message && errorData.message.includes('email limit is reached');
        
        // If it's not an email limit error, throw the error
        if (!isEmailLimitError) {
          throw new Error(errorData.message || 'Failed to resubmit course');
        }
      }

      // Update the course in the local state immediately
      const updatedCourses = courses.map(course => 
        course._id === resubmitCourse._id ? { ...course, status: 'dean-review' } : course
      );
      
      // Update filtered courses as well
      const updatedFilteredCourses = filteredCourses.map(course => 
        course._id === resubmitCourse._id ? { ...course, status: 'dean-review' } : course
      );
      
      // Close dialog and reset states
      setResubmitDialogOpen(false);
      setResubmitCourse(null);
      setConfirmResubmitChecked(false);
      
      // Update the local state first for immediate UI feedback
      setFilteredCourses(updatedFilteredCourses);
      
      // Show appropriate toast message
      if (isEmailLimitError) {
        toast.warning('Course resubmitted, but email notification failed due to email limit. The School Dean will still be able to review your course.');
      } else {
        toast.success('Course resubmitted to School Dean successfully');
      }
      
      // Then refresh from the server to ensure data consistency
      try {
        await dispatch(fetchCourses()).unwrap();
      } catch (refreshError) {
        console.error('Error refreshing courses after resubmit:', refreshError);
        // Even if refresh fails, we've already updated the UI
      }
    } catch (error) {
      console.error('Error resubmitting course:', error);
      toast.error(error.message || 'Failed to resubmit course');
    } finally {
      setIsSubmitting(false);
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
    if (!filteredCourses || !user) return {};

    const pendingApprovals = filteredCourses.filter(course => 
      course.department === user.department && 
      course.status === 'pending'
    );
    const unassignedCourses = filteredCourses.filter(course => 
      course.school === user.school && 
      !course.instructor && 
      course.status !== 'pending'
    );
    const departmentCourses = filteredCourses.filter(course => 
      course.department === user.department
    );
    const allSchoolCourses = filteredCourses.filter(course => 
      course.school === user.school
    );
    const assignedCourses = filteredCourses.filter(course => 
      course.school === user.school && 
      course.instructor
    );

    return {
      pendingApprovals,
      unassignedCourses,
      departmentCourses,
      allSchoolCourses,
      assignedCourses
    };
  }, [filteredCourses, user]);

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
        course.school === user.school &&
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

  useEffect(() => {
    if (user?.role === 'department-head') {
      const hasPendingApprovals = categorizedCoursesForDepartmentHead.pendingApprovals?.length > 0;
      const hasUnassignedCourses = categorizedCoursesForDepartmentHead.unassignedCourses?.length > 0;
      
      // Count visible tabs before the current selected tab
      let visibleTabCount = 0;
      if (hasPendingApprovals) visibleTabCount++;
      if (hasUnassignedCourses) visibleTabCount++;
      
      // If selected tab is higher than available tabs, reset to first tab
      if (selectedTab >= visibleTabCount + 3) { // +3 for the always visible tabs
        setSelectedTab(0);
      }
    }
  }, [categorizedCoursesForDepartmentHead, user?.role, selectedTab]);

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
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
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

      {/* Instructor Dashboard at the top */}
      {user?.role === 'instructor' && (
        <Box sx={{ mb: 4 }}>
          {/* Instructor Stats Summary */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: 'primary.main', 
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <SchoolIcon fontSize="small" />
              Course Control Panel
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: theme => alpha(theme.palette.success.main, 0.08),
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    transition: 'transform 0.2s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme => `0 8px 24px ${alpha(theme.palette.success.main, 0.2)}`
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AssignmentTurnedInIcon sx={{ fontSize: 24, color: 'success.main', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>My Courses</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {categorizedCourses.myAssigned?.length || 0}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: theme => alpha(theme.palette.info.main, 0.08),
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    transition: 'transform 0.2s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme => `0 8px 24px ${alpha(theme.palette.info.main, 0.2)}`
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AddCircleOutlineIcon sx={{ fontSize: 24, color: 'info.main', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Available</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {categorizedCourses.available?.length || 0}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: theme => alpha(theme.palette.warning.main, 0.08),
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    transition: 'transform 0.2s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme => `0 8px 24px ${alpha(theme.palette.warning.main, 0.2)}`
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HourglassEmptyIcon sx={{ fontSize: 24, color: 'warning.main', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Pending</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {categorizedCourses.pending?.length || 0}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: theme => alpha(theme.palette.error.main, 0.08),
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    transition: 'transform 0.2s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme => `0 8px 24px ${alpha(theme.palette.error.main, 0.2)}`
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CancelIcon sx={{ fontSize: 24, color: 'error.main', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Rejected</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {categorizedCourses.rejected?.length || 0}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}

      {/* Search and Filter Bar removed for Department Head */}
      {!isDepartmentHead && (
        <>
          <Paper elevation={2} sx={{ mb: 3, p: 3, borderRadius: 2, bgcolor: theme => alpha(theme.palette.background.paper, 0.95), backdropFilter: 'blur(20px)', boxShadow: theme => `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}` }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterListIcon fontSize="small" />
              Search & Filter
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              {/* Search field - takes more space */}
              <Grid item xs={12} md={6} lg={5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by course title, code, department or instructor..."
                  value={filterValue}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      }
                    }
                  }}
                />
              </Grid>
              
              {/* School filter removed for instructors */}

              {/* Department filter - inline */}
              <Grid item xs={12} sm={6} md={3} lg={2.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    label="Department"
                    sx={{ borderRadius: 1.5 }}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {/* Only show departments from instructor's school */}
                    {user?.role === 'instructor' && user?.school && departments[user.school] ? (
                      departments[user.school].map((dept) => (
                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                      ))
                    ) : (
                      // Fallback to show all departments grouped by school
                      Object.entries(departments).flatMap(([school, depts]) => [
                        <MenuItem key={`${school}-header`} disabled sx={{ fontWeight: 600, pl: 2 }}>
                          {school}
                        </MenuItem>,
                        ...depts.map((dept) => (
                          <MenuItem key={`${school}-${dept}`} value={dept} sx={{ pl: 4 }}>
                            {dept}
                          </MenuItem>
                        ))
                      ])
                    )}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Status filter - inline */}
              <Grid item xs={12} sm={6} md={3} lg={2.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                    sx={{ borderRadius: 1.5 }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="pending">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main' }} />
                        <Typography>Pending</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="approved">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
                        <Typography>Approved</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="rejected">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
                        <Typography>Rejected</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="unassigned">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'info.main' }} />
                        <Typography>Unassigned</Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Reset button */}
              <Grid item xs={12} sm={12} md={12} lg={2} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFilterValue('');
                    setFilterDepartment('');
                    setFilterStatus('');
                  }}
                  color="secondary"
                  startIcon={<RefreshIcon />}
                  sx={{ height: 40, borderRadius: 1.5 }}
                >
                  Reset Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Filter Dialog - Now removed since we have inline filters */}
        </>
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

      {/* Department Head Filter */}
      {isDepartmentHead && (
        <>
          {/* Header Section with Stats */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: 'primary.main' }}>
              Course Management Dashboard
            </Typography>
            
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {loading ? (
                // Skeleton loading for statistics cards
                <>
                  {[...Array(4)].map((_, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Skeleton variant="circular" width={28} height={28} sx={{ mr: 1 }} />
                          <Skeleton variant="text" width={150} height={32} />
                        </Box>
                        <Skeleton variant="text" width="40%" height={60} />
                      </Paper>
                    </Grid>
                  ))}
                </>
              ) : (
                // Actual statistics cards
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        bgcolor: theme => alpha(theme.palette.warning.main, 0.1),
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: theme => `0 8px 24px ${alpha(theme.palette.warning.main, 0.2)}`
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PendingIcon sx={{ fontSize: 28, color: 'warning.main', mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Pending Approvals</Typography>
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                        {categorizedCoursesForDepartmentHead.pendingApprovals?.length || 0}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        bgcolor: theme => alpha(theme.palette.info.main, 0.1),
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: theme => `0 8px 24px ${alpha(theme.palette.info.main, 0.2)}`
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AssignmentIndIcon sx={{ fontSize: 28, color: 'info.main', mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Unassigned Courses</Typography>
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main' }}>
                        {categorizedCoursesForDepartmentHead.unassignedCourses?.length || 0}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        bgcolor: theme => alpha(theme.palette.info.main, 0.1),
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: theme => `0 8px 24px ${alpha(theme.palette.info.main, 0.2)}`
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <BusinessIcon sx={{ fontSize: 28, color: 'info.main', mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Department Courses</Typography>
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main' }}>
                        {categorizedCoursesForDepartmentHead.departmentCourses?.length || 0}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        bgcolor: theme => alpha(theme.palette.success.main, 0.1),
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: theme => `0 8px 24px ${alpha(theme.palette.success.main, 0.2)}`
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AssignmentIndIcon sx={{ fontSize: 28, color: 'success.main', mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Assigned Courses</Typography>
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {categorizedCoursesForDepartmentHead.assignedCourses?.length || 0}
                      </Typography>
                    </Paper>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
          
          {/* Modern Filter Section */}
          <Paper 
            elevation={2} 
            sx={{ 
              mb: 4, 
              p: { xs: 2, sm: 3 }, 
              borderRadius: 3, 
              bgcolor: theme => alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(10px)',
              boxShadow: theme => `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? (
              // Skeleton loading for filter section
              <>
                <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 2, 
                  alignItems: { xs: 'stretch', md: 'flex-end' },
                  mb: 2
                }}>
                  <Skeleton variant="rectangular" height={40} sx={{ flexGrow: 1, borderRadius: 1 }} />
                  <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: 1 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
                </Box>
              </>
            ) : (
              // Actual filter section
              <>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                  Search & Filter Courses
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 2, 
                  alignItems: { xs: 'stretch', md: 'flex-end' },
                  mb: { xs: 2, md: 0 },
                  flexWrap: 'wrap'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    alignItems: { xs: 'stretch', md: 'flex-end' },
                    flexGrow: 1,
                    width: { xs: '100%', md: 'auto' }
                  }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search by course title, code, department or instructor..."
                      value={filterValue}
                      onChange={handleSearchChange}
                      sx={{ 
                        flexGrow: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderWidth: 1,
                          }
                        },
                        '& .MuiFormHelperText-root': {
                          marginLeft: 0,
                          marginRight: 0,
                          marginTop: 0.5,
                          lineHeight: 1.2,
                          fontSize: '0.7rem'
                        }
                      }}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                      }}
                      variant="outlined"
                    />
                    
                    <FormControl sx={{ minWidth: { xs: '100%', md: 220 } }}>
                      <InputLabel>Filter by Department</InputLabel>
                      <Select
                        size="small"
                        value={filterDepartment || ''}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        label="Filter by Department"
                        sx={{ 
                          borderRadius: 1.5,
                          '&:hover': {
                            boxShadow: theme => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                          }
                        }}
                      >
                        <MenuItem value="">All Departments</MenuItem>
                        {departments[user.school]?.map(dept => (
                          <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: { xs: '100%', md: 200 } }}>
                      <InputLabel>Filter by Status</InputLabel>
                      <Select
                        size="small"
                        value={filterStatus || ''}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        label="Filter by Status"
                        sx={{ 
                          borderRadius: 1.5,
                          '&:hover': {
                            boxShadow: theme => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                          }
                        }}
                      >
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: { xs: 'flex-end', md: 'center' },
                    alignItems: 'flex-end',
                    mt: { xs: 1, md: 0 },
                    mb: { xs: 1, md: 0 }
                  }}>
                    <Tooltip title="Reset all filters">
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setFilterValue('');
                          setFilterDepartment('');
                          setFilterStatus('');
                        }}
                        color="secondary"
                        sx={{ 
                          borderRadius: 1.5,
                          px: 3,
                          height: '40px',
                          '&:hover': {
                            boxShadow: theme => `0 0 0 2px ${alpha(theme.palette.secondary.main, 0.2)}`
                          }
                        }}
                        startIcon={<FilterListIcon />}
                      >
                        Reset Filters
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>
              </>
            )}
          </Paper>
          
          {/* Modern Tabs Section */}
          <Paper 
            elevation={2} 
            sx={{ 
              mb: 4, 
              borderRadius: 3, 
              overflow: 'hidden',
              bgcolor: theme => alpha(theme.palette.background.paper, 0.9),
              boxShadow: theme => `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            {loading ? (
              // Skeleton loading for tabs and content
              <>
                <Box sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  bgcolor: theme => alpha(theme.palette.primary.main, 0.05),
                  p: 1
                }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {[...Array(4)].map((_, index) => (
                      <Skeleton key={index} variant="rectangular" width={120} height={48} sx={{ borderRadius: 1 }} />
                    ))}
                  </Box>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={{ xs: 2, md: 3 }}>
                    {[...Array(6)].map((_, index) => (
                      <Grid item xs={12} md={6} lg={4} key={index}>
                        <Paper
                          elevation={1}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Skeleton variant="text" width="60%" height={24} />
                            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 4 }} />
                          </Box>
                          <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
                          <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
                          <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1 }} />
                          <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Skeleton variant="rectangular" width={90} height={36} sx={{ borderRadius: 1 }} />
                            <Skeleton variant="rectangular" width={90} height={36} sx={{ borderRadius: 1 }} />
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </>
            ) : (
              <>
                <Box sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  bgcolor: theme => alpha(theme.palette.primary.main, 0.05),
                }}>
                  <Tabs 
                    value={selectedTab} 
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      '& .MuiTabs-indicator': {
                        height: 3,
                        borderRadius: '3px 3px 0 0'
                      },
                      '& .MuiTab-root': {
                        transition: 'all 0.2s',
                        fontWeight: 500,
                        '&:hover': {
                          bgcolor: theme => alpha(theme.palette.primary.main, 0.05),
                        },
                        '&.Mui-selected': {
                          fontWeight: 600
                        }
                      }
                    }}
                  >
                {categorizedCoursesForDepartmentHead.pendingApprovals?.length > 0 && (
                  <Tab 
                    label={
                      <Badge 
                        badgeContent={categorizedCoursesForDepartmentHead.pendingApprovals?.length || 0} 
                        color="warning"
                        max={99}
                        sx={{ '& .MuiBadge-badge': { fontWeight: 600 } }}
                      >
                        <Box sx={{ px: 1, py: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PendingIcon sx={{ fontSize: 20 }} />
                          <span>Pending Approvals</span>
                        </Box>
                      </Badge>
                    } 
                  />
                )}
                
                {categorizedCoursesForDepartmentHead.unassignedCourses?.length > 0 && (
                  <Tab 
                    label={
                      <Badge 
                        badgeContent={categorizedCoursesForDepartmentHead.unassignedCourses?.length || 0} 
                        color="info"
                        max={99}
                        sx={{ '& .MuiBadge-badge': { fontWeight: 600 } }}
                      >
                        <Box sx={{ px: 1, py: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AssignmentIndIcon sx={{ fontSize: 20 }} />
                          <span>Unassigned Courses</span>
                        </Box>
                      </Badge>
                    } 
                  />
                )}
                
                <Tab 
                  label={
                    <Badge 
                      badgeContent={categorizedCoursesForDepartmentHead.departmentCourses?.length || 0} 
                      color="info"
                      max={99}
                      sx={{ '& .MuiBadge-badge': { fontWeight: 600 } }}
                    >
                      <Box sx={{ px: 1, py: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BusinessIcon sx={{ fontSize: 20 }} />
                        <span>Department Courses</span>
                      </Box>
                    </Badge>
                  } 
                />
                <Tab 
                  label={
                    <Badge 
                      badgeContent={categorizedCoursesForDepartmentHead.allSchoolCourses?.length || 0} 
                      color="primary"
                      max={99}
                      sx={{ '& .MuiBadge-badge': { fontWeight: 600 } }}
                    >
                      <Box sx={{ px: 1, py: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <SchoolIcon sx={{ fontSize: 20 }} />
                        <span>All School Courses</span>
                      </Box>
                    </Badge>
                  } 
                />
                <Tab 
                  label={
                    <Badge 
                      badgeContent={categorizedCoursesForDepartmentHead.assignedCourses?.length || 0} 
                      color="success"
                      max={99}
                      sx={{ '& .MuiBadge-badge': { fontWeight: 600 } }}
                    >
                      <Box sx={{ px: 1, py: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AssignmentIndIcon sx={{ fontSize: 20 }} />
                        <span>Assigned Courses</span>
                      </Box>
                    </Badge>
                  } 
                />
              </Tabs>
            </Box>
              </>
            )}
          </Paper>
        </>
      )}

      {/* Instructor Tabs - Premium Styled */}
      {user?.role === 'instructor' && (
        <Box sx={{ mb: 4 }}>
          {/* Enhanced Tab Navigation */}
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: theme => alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(12px)',
              boxShadow: theme => `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
              transition: 'all 0.3s ease',
              p: 0.5,
              position: 'relative',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #3f51b5 0%, #2196f3 50%, #00bcd4 100%)',
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
          {/* Create a list of visible tabs based on whether they have courses */}
          {(() => {
            const visibleTabs = [];
            
            // Always show All Courses tab
            visibleTabs.push({
              index: 0,
              label: (
                <Badge 
                  badgeContent={categorizedCourses.allCourses?.length || 0} 
                  color="info"
                  max={99}
                >
                  <Tooltip title="All courses in your school">
                    <Box sx={{ pr: 1 }}>All Courses</Box>
                  </Tooltip>
                </Badge>
              )
            });
            
            // Only show My Courses tab if there are assigned courses
            if (categorizedCourses.myAssigned?.length > 0) {
              visibleTabs.push({
                index: 1,
                label: (
                  <Badge 
                    badgeContent={categorizedCourses.myAssigned?.length || 0} 
                    color="success"
                    max={99}
                  >
                    <Box sx={{ pr: 1 }}>My Courses</Box>
                  </Badge>
                )
              });
            }
            
            // Only show Available tab if there are available courses
            if (categorizedCourses.available?.length > 0) {
              visibleTabs.push({
                index: 2,
                label: (
                  <Badge 
                    badgeContent={categorizedCourses.available?.length || 0} 
                    color="info"
                    max={99}
                  >
                    <Tooltip title="Unassigned courses available for self-assignment, including rejected courses from other instructors">
                      <Box sx={{ pr: 1 }}>Available</Box>
                    </Tooltip>
                  </Badge>
                )
              });
            }
            
            // Only show Rejected tab if there are rejected courses
            if (categorizedCourses.rejected?.length > 0) {
              visibleTabs.push({
                index: 3,
                label: (
                  <Badge 
                    badgeContent={categorizedCourses.rejected?.length || 0} 
                    color="error"
                    max={99}
                  >
                    <Tooltip title="Courses that were rejected when you requested them">
                      <Box sx={{ pr: 1 }}>Rejected</Box>
                    </Tooltip>
                  </Badge>
                )
              });
            }
            
            // Only show Pending tab if there are pending courses
            if (categorizedCourses.pending?.length > 0) {
              visibleTabs.push({
                index: 4,
                label: (
                  <Badge 
                    badgeContent={categorizedCourses.pending?.length || 0} 
                    color="warning"
                    max={99}
                  >
                    <Box sx={{ pr: 1 }}>Pending</Box>
                  </Badge>
                )
              });
            }
            
            // Always show School Courses tab
            visibleTabs.push({
              index: 5,
              label: (
                <Badge 
                  badgeContent={categorizedCourses.schoolCourses?.length || 0} 
                  color="primary"
                  max={99}
                >
                  <Tooltip title="All courses in your school">
                    <Box sx={{ pr: 1 }}>School Courses</Box>
                  </Tooltip>
                </Badge>
              )
            });
            
            // Always show Other Instructors tab
            visibleTabs.push({
              index: 6,
              label: (
                <Badge 
                  badgeContent={categorizedCourses.othersAssigned?.length || 0} 
                  color="default"
                  max={99}
                >
                  <Tooltip title="Courses assigned to other instructors in your school">
                    <Box sx={{ pr: 1 }}>Other Instructors</Box>
                  </Tooltip>
                </Badge>
              )
            });
            
            // Map the actual tab index to the visible tab index
            const tabIndexMap = visibleTabs.reduce((map, tab, i) => {
              map[tab.index] = i;
              return map;
            }, {});
            
            // Find the correct visible tab index based on the selected tab
            const visibleTabIndex = tabIndexMap[selectedTab] !== undefined ? tabIndexMap[selectedTab] : 0;
            
            return (
              <Tabs 
                value={visibleTabIndex} 
                onChange={(e, newValue) => {
                  // Map back to the actual tab index
                  const actualTabIndex = visibleTabs[newValue].index;
                  handleTabChange(e, actualTabIndex);
                }}
                variant="scrollable"
                scrollButtons="auto"
                TabIndicatorProps={{
                  sx: {
                    height: 4,
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)'
                  }
                }}
                sx={{
                  minHeight: 56,
                  '& .MuiTabs-flexContainer': {
                    gap: 1
                  },
                  '& .MuiTabs-scroller': {
                    px: 1,
                    py: 1
                  },
                  '& .MuiTab-root': {
                    minHeight: 48,
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    borderRadius: '8px',
                    px: 2,
                    '&:hover': {
                      color: 'primary.main',
                      opacity: 1,
                      backgroundColor: theme => alpha(theme.palette.primary.main, 0.05)
                    },
                    '&.Mui-selected': {
                      color: 'primary.main',
                      fontWeight: 600,
                      backgroundColor: theme => alpha(theme.palette.primary.main, 0.1)
                    }
                  },
                  '& .MuiBadge-badge': {
                    fontWeight: 600,
                    fontSize: '0.65rem',
                    minWidth: '20px',
                    height: '20px',
                    padding: '0 6px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }
                }}
              >
                {visibleTabs.map((tab, index) => {
                  // Determine the appropriate icon based on tab index
                  let TabIcon;
                  switch(tab.index) {
                    case 0: TabIcon = ViewListIcon; break;
                    case 1: TabIcon = AssignmentTurnedInIcon; break;
                    case 2: TabIcon = AddCircleOutlineIcon; break;
                    case 3: TabIcon = CancelIcon; break;
                    case 4: TabIcon = HourglassEmptyIcon; break;
                    case 5: TabIcon = SchoolIcon; break;
                    case 6: TabIcon = PeopleAltIcon; break;
                    default: TabIcon = ViewListIcon;
                  }
                  
                  return (
                    <Tab 
                      key={index} 
                      label={tab.label}
                      icon={<TabIcon fontSize="small" />}
                      iconPosition="start"
                      sx={{
                        borderRadius: '8px',
                        minHeight: 48,
                        py: 1.5,
                        transition: 'all 0.2s ease',
                        '&.Mui-selected': {
                          backgroundColor: theme => alpha(theme.palette.primary.main, 0.08),
                          transform: 'translateY(-2px)'
                        },
                        '&:hover': {
                          transform: 'translateY(-2px)'
                        }
                      }}
                    />
                  );
                })}
              </Tabs>
            );
          })()} 
          </Paper>
        </Box>
      )}

      {/* Course List */}
      {loading ? (
        <Grid container spacing={2}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} key={index}>
              <Paper
                elevation={2}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  p: { xs: 2, md: 3 },
                  mb: 0
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Skeleton variant="text" width={200} height={28} />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Skeleton variant="text" width={120} height={20} />
                      <Skeleton variant="text" width={150} height={20} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 }, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                    <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="circular" width={36} height={36} />
                    <Skeleton variant="circular" width={36} height={36} />
                  </Box>
                </Box>
                <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1, mt: 2 }} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          <Grid container spacing={0}>
            {(getCurrentPageItems() || []).map((course) => (
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
                  expanded={expandedCourseId === course._id}
                  onExpand={handleCourseExpand}
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
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: { xs: 2, md: 3 },
          pb: { xs: 1, md: 2 },
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          <IconButton
            aria-label="close"
            onClick={() => {
              setOpenDialog(false);
              formik.resetForm();
            }}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedCourse ? (
            <EditIcon color="primary" fontSize="small" />
          ) : (
            <AddIcon color="primary" fontSize="small" />
          )}
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            {selectedCourse ? 'Edit Course' : 'Add New Course'}
          </Typography>
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent sx={{ p: { xs: 2, md: 3 }, pt: { xs: 2, md: 2 }, overflowY: 'auto' }}>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Section Header: Basic Information */}
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 1,
                  mt: 1,
                  borderBottom: 1,
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  pb: 1
                }}>
                  <SchoolIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 600 }}>
                    Basic Information
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Course Title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderWidth: 1,
                      }
                    },
                    '& .MuiFormHelperText-root': {
                      marginLeft: 0,
                      marginRight: 0,
                      marginTop: 0.5,
                      lineHeight: 1.2,
                      fontSize: '0.7rem'
                    }
                  }}
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

              {/* Section Header: Credit Hours */}
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 1,
                  mt: 2,
                  borderBottom: 1,
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  pb: 1
                }}>
                  <PendingIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 600 }}>
                    Credit Hours
                  </Typography>
                </Box>
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

              {/* Section Header: Number of Sections */}
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 1,
                  mt: 2,
                  borderBottom: 1,
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  pb: 1
                }}>
                  <BusinessIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 600 }}>
                    Number of Sections
                  </Typography>
                </Box>
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
          <DialogActions sx={{ 
            p: { xs: 2, md: 3 }, 
            pt: 2,
            bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
            gap: 1,
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
            borderTop: 1,
            borderColor: 'divider'
          }}>
            <Button 
              onClick={() => {
                setOpenDialog(false);
                formik.resetForm();
              }}
              variant="outlined"
              color="secondary"
              startIcon={<CloseIcon />}
              sx={{ 
                borderRadius: 1.5,
                px: 2
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              startIcon={selectedCourse ? <EditIcon /> : <AddIcon />}
              sx={{ 
                borderRadius: 1.5,
                px: 2,
                fontWeight: 500
              }}
            >
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
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            maxWidth: 500,
            overflow: 'hidden',
            background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)'
          }
        }}
        TransitionProps={{
          sx: {
            transition: 'all 0.3s ease-out!important'
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          {/* Header with gradient background */}
          <Box sx={{ 
            background: 'linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)',
            p: 3,
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              position: 'absolute', 
              top: -15, 
              right: -15, 
              width: 120, 
              height: 120, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.1)' 
            }} />
            <Box sx={{ 
              position: 'absolute', 
              bottom: -30, 
              left: -30, 
              width: 160, 
              height: 160, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.05)' 
            }} />
            
            <Typography variant="h6" fontWeight={600} sx={{ position: 'relative', zIndex: 1 }}>
              Confirm Course Resubmission
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9, position: 'relative', zIndex: 1 }}>
              Review the information below before proceeding
            </Typography>
          </Box>
          
          <DialogContent sx={{ p: 0 }}>
            {/* Warning message */}
            <Box sx={{ 
              p: 2.5, 
              m: 3,
              mt: 3,
              mb: 2,
              bgcolor: alpha('#ff9800', 0.08), 
              color: 'warning.dark',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              border: '1px solid',
              borderColor: alpha('#ff9800', 0.2),
              boxShadow: `0 2px 8px ${alpha('#ff9800', 0.08)}`
            }}>
              <Avatar sx={{ bgcolor: alpha('#ff9800', 0.15), color: 'warning.main', width: 36, height: 36 }}>
                <WarningIcon fontSize="small" />
              </Avatar>
              <Typography variant="body2" fontWeight={500}>
                Are you sure you want to resubmit this course to the School Dean?
              </Typography>
            </Box>
            
            {resubmitCourse && (
              <Box sx={{ px: 3, pb: 3 }}>
                {/* Course details card */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="primary.dark" fontWeight={600} sx={{ 
                    mb: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <ClassIcon fontSize="small" />
                    Course Details
                  </Typography>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2.5, 
                      borderRadius: 2, 
                      bgcolor: alpha(theme.palette.primary.main, 0.03),
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.08)
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Code</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2" fontWeight={600} color="text.primary">{resubmitCourse.code}</Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Title</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2" fontWeight={600} color="text.primary">{resubmitCourse.title}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
                
                {/* Confirmation checklist */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="primary.dark" fontWeight={600} sx={{ 
                    mb: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <InfoIcon fontSize="small" />
                    Please confirm that you have:
                  </Typography>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.5)
                    }}
                  >
                    <Box sx={{ 
                      p: 0.5,
                      bgcolor: 'background.paper',
                    }}>
                      <List dense disablePadding>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircleIcon fontSize="small" color="success" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Reviewed the dean's rejection feedback"
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                        <Divider component="li" variant="middle" />
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircleIcon fontSize="small" color="success" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Made necessary changes to address the concerns"
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                        <Divider component="li" variant="middle" />
                        <ListItem sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircleIcon fontSize="small" color="success" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Verified all course information is correct"
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      </List>
                    </Box>
                  </Paper>
                </Box>
                
                {/* Confirmation checkbox */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    border: '1px dashed',
                    borderColor: alpha(theme.palette.primary.main, 0.2)
                  }}
                >
                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={
                      <Checkbox 
                        required 
                        color="primary" 
                        onChange={(e) => setConfirmResubmitChecked(e.target.checked)}
                        checked={confirmResubmitChecked}
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 22 } }}
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        I confirm that I have reviewed all the information and want to resubmit this course
                      </Typography>
                    }
                  />
                </Paper>
              </Box>
            )}
          </DialogContent>
          
          {/* Actions */}
          <Box sx={{ 
            px: 3, 
            py: 2.5, 
            borderTop: '1px solid', 
            borderColor: alpha(theme.palette.divider, 0.5),
            bgcolor: alpha(theme.palette.background.default, 0.5),
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2
          }}>
            <Button 
              onClick={() => {
                setResubmitDialogOpen(false);
                setResubmitCourse(null);
                setConfirmResubmitChecked(false);
              }}
              variant="outlined"
              color="inherit"
              sx={{ 
                borderRadius: 6,
                px: 3,
                textTransform: 'none',
                fontWeight: 500,
                borderColor: alpha(theme.palette.divider, 0.5),
                '&:hover': {
                  borderColor: alpha(theme.palette.divider, 0.8),
                  bgcolor: alpha(theme.palette.divider, 0.05)
                }
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              onClick={handleResubmitConfirm}
              color="primary"
              variant="contained"
              startIcon={<SendIcon />}
              disabled={!confirmResubmitChecked || isSubmitting}
              loading={isSubmitting}
              loadingPosition="start"
              sx={{ 
                borderRadius: 6,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)'
                }
              }}
            >
              {isSubmitting ? 'Resubmitting...' : 'Confirm Resubmit'}
            </LoadingButton>
          </Box>
        </Box>
      </Dialog>

      <DeleteConfirmationDialog 
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        courseToDelete={courseToDelete}
        isDeleting={isDeleting}
        handleDeleteConfirm={handleDeleteConfirm}
      />

      <SelfAssignDialog
        selfAssignDialogOpen={selfAssignDialogOpen}
        setSelfAssignDialogOpen={setSelfAssignDialogOpen}
        courseToSelfAssign={courseToSelfAssign}
        isSelfAssigning={isSelfAssigning}
        handleSelfAssign={handleSelfAssign}
      />

      {/* Reject Course Dialog */}
      <Dialog 
        open={rejectDialogOpen} 
        onClose={() => setRejectDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.error.main, 0.1)}`,
          }
        }}
      >
        <DialogTitle sx={{ 
          p: { xs: 2, md: 3 },
          pb: { xs: 1, md: 2 },
          bgcolor: (theme) => alpha(theme.palette.error.main, 0.04),
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          <IconButton
            aria-label="close"
            onClick={() => setRejectDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CloseIcon color="error" />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Reject Course
            </Typography>
          </Box>
          {courseToReject && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" color="error.main" sx={{ fontWeight: 500 }}>
                {courseToReject.code} - {courseToReject.title}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                <Chip 
                  size="small" 
                  label={`Department: ${courseToReject.department}`} 
                  color="default" 
                  variant="outlined"
                />
              </Box>
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          {courseToReject && (
            <>
              <DialogContentText>
                Please provide a reason for rejecting this course:
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
                sx={{
                  mt: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  }
                }}
              />
              
              <Box sx={{ mt: 3, p: 2, bgcolor: (theme) => alpha(theme.palette.background.default, 0.5), borderRadius: 2 }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                  Confirmation
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={rejectConfirmed} 
                      onChange={(e) => setRejectConfirmed(e.target.checked)}
                      color="error"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Are you sure you want to reject this course?
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        I confirm that I want to reject this course with the reason provided above
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start' }}
                />
                
                <Alert severity="warning" sx={{ mt: 2, borderRadius: 1.5 }}>
                  <AlertTitle>Course Rejection</AlertTitle>
                  Rejecting a course will send it back to the instructor for revision. 
                  Make sure your rejection reason is clear and constructive.
                </Alert>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 2.5, 
          bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
          gap: 1,
          bottom: 0,
          zIndex: 1,
          borderTop: 1,
          borderColor: 'divider'
        }}>
          <Button 
            onClick={() => setRejectDialogOpen(false)}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleRejectConfirm}
            loading={isRejecting}
            disabled={!rejectionReason.trim() || !rejectConfirmed}
            color="error"
            variant="contained"
            startIcon={<CloseIcon />}
          >
            Reject Course
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <ApproveCourseDialog />
      
      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
        toastStyle={{
          marginTop: '80px', // Ensure it appears below the header
          marginBottom: '20px',
          maxWidth: '90vw',
          width: 'auto',
          minWidth: '280px',
          fontSize: { xs: '14px', sm: '16px' },
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}
      />
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
  const [confirmed, setConfirmed] = useState(false);
  const differentDepartment = selectedInstructor && 
    instructors.find(i => i._id === selectedInstructor)?.department !== selectedCourse?.department;

  return (
    <Dialog
      open={openAssignDialog}
      onClose={() => !loadingInstructors && setOpenAssignDialog(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
        }
      }}
    >
      <DialogTitle sx={{ 
        p: { xs: 2, md: 3 },
        pb: { xs: 1, md: 2 },
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        <IconButton
          aria-label="close"
          onClick={() => !loadingInstructors && setOpenAssignDialog(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AssignmentIndIcon color="primary" />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Assign Course to Instructor
          </Typography>
        </Box>
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 500 }}>
            {selectedCourse?.code} - {selectedCourse?.title}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
            <Chip 
              size="small" 
              label={`Department: ${selectedCourse?.department}`} 
              color="default" 
              variant="outlined"
            />
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, md: 3 }, pt: { xs: 2, md: 2 } }}>
        <Box sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Select Instructor</InputLabel>
            <Select
              value={selectedInstructor}
              onChange={(e) => {
                setSelectedInstructor(e.target.value);
                setConfirmed(false); // Reset confirmation when instructor changes
              }}
              disabled={loadingInstructors || !hasInstructors}
              label="Select Instructor"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                }
              }}
            >
              {instructors.map((instructor) => (
                <MenuItem 
                  key={instructor._id} 
                  value={instructor._id}
                >
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="subtitle2">
                      {instructor.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Department: 
                      </Typography>
                      <Chip 
                        size="small" 
                        label={instructor.department} 
                        color={instructor.department !== selectedCourse?.department ? "warning" : "default"}
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {loadingInstructors 
                ? 'Loading instructors...' 
                : !hasInstructors
                  ? `No instructors available in ${user.school} school`
                  : `${instructors.length} instructor${instructors.length === 1 ? '' : 's'} available`}
            </FormHelperText>
          </FormControl>
          
          {selectedInstructor && (
            <Box sx={{ mt: 3, p: 2, bgcolor: (theme) => alpha(theme.palette.background.default, 0.5), borderRadius: 2 }}>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                Confirmation
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={confirmed} 
                    onChange={(e) => setConfirmed(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Are you sure you want to assign this course?
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      I confirm that I want to assign this course to the selected instructor
                      {differentDepartment && (
                        <Typography component="span" color="warning.main" sx={{ fontWeight: 500 }}>
                          {" from a different department"}
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start' }}
              />
              
              {differentDepartment && (
                <Alert severity="warning" sx={{ mt: 2, borderRadius: 1.5 }}>
                  <AlertTitle>Cross-Department Assignment</AlertTitle>
                  You are assigning a course to an instructor from a different department.
                  Please ensure this is intentional and follows your school's policies.
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        p: { xs: 2, md: 3 }, 
        pt: 2,
        bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
        gap: 1,
        position: 'sticky',
        bottom: 0,
        zIndex: 1,
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <Button 
          onClick={() => setOpenAssignDialog(false)}
          disabled={loadingInstructors}
          variant="outlined"
          color="secondary"
          startIcon={<CloseIcon />}
          sx={{ 
            borderRadius: 1.5,
            px: 2
          }}
        >
          Cancel
        </Button>
        <LoadingButton
          onClick={handleAssignCourse}
          loading={loadingInstructors}
          disabled={!selectedInstructor || !confirmed}
          variant="contained"
          color="primary"
          startIcon={<AssignmentIndIcon />}
          sx={{ 
            borderRadius: 1.5,
            px: 2,
            fontWeight: 500
          }}
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

const SelfAssignDialog = ({
  selfAssignDialogOpen,
  setSelfAssignDialogOpen,
  courseToSelfAssign,
  isSelfAssigning,
  handleSelfAssign
}) => {
  const [confirmed, setConfirmed] = useState(false);
  
  return (
    <Dialog
      open={selfAssignDialogOpen}
      onClose={() => !isSelfAssigning && setSelfAssignDialogOpen(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
        }
      }}
    >
      <DialogTitle sx={{ 
        p: { xs: 2, md: 3 },
        pb: { xs: 1, md: 2 },
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        <IconButton
          aria-label="close"
          onClick={() => !isSelfAssigning && setSelfAssignDialogOpen(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AssignmentIndIcon color="primary" />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Request Course Assignment
          </Typography>
        </Box>
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 500 }}>
            {courseToSelfAssign?.code} - {courseToSelfAssign?.title}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
            <Chip 
              size="small" 
              label={`Department: ${courseToSelfAssign?.department}`} 
              color="default" 
              variant="outlined"
            />
            <Chip 
              size="small" 
              label={`Semester: ${courseToSelfAssign?.semester}`} 
              color="default" 
              variant="outlined"
            />
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, md: 3 }, pt: { xs: 2, md: 2 } }}>
        <Alert severity="info" sx={{ mb: 2, borderRadius: 1 }}>
          <AlertTitle>Course Request Information</AlertTitle>
          Your request will be sent to the department head for approval. You will be notified once a decision is made.
        </Alert>
        
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={confirmed} 
                onChange={(e) => setConfirmed(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Are you sure you want to request this course?
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  I confirm that I want to request this course assignment and understand it requires department head approval
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start' }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        p: 2.5, 
        bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
        gap: 1,
        bottom: 0,
        zIndex: 1,
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <Button 
          onClick={() => setSelfAssignDialogOpen(false)}
          disabled={isSelfAssigning}
          variant="outlined"
          color="secondary"
          startIcon={<CloseIcon />}
          sx={{ 
            borderRadius: 1.5,
            px: 2
          }}
        >
          Cancel
        </Button>
        <LoadingButton
          onClick={() => handleSelfAssign(courseToSelfAssign)}
          loading={isSelfAssigning}
          disabled={!confirmed}
          variant="contained"
          color="primary"
          startIcon={<AssignmentIndIcon />}
          sx={{ 
            borderRadius: 1.5,
            px: 2,
            fontWeight: 500
          }}
        >
          Request Course
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default Courses;
