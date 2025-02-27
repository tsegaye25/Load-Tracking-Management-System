import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const ComposeFeedback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [departmentHeads, setDepartmentHeads] = useState([]);
  const isDepartmentHead = user?.role === 'department-head';
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Get reply data from location state if it exists
  const replyTo = location.state?.replyTo;
  const receiverId = location.state?.receiverId;
  const receiverName = location.state?.receiverName;

  useEffect(() => {
    if (isDepartmentHead && receiverId) {
      setSelectedInstructor(receiverId);
    }
  }, [isDepartmentHead, receiverId]);

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        setLoadingRecipients(true);
        const endpoint = isDepartmentHead ? 'instructors' : 'department-heads';
        const response = await fetch(`${baseURL}/api/v1/users/${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recipients');
        }

        const data = await response.json();
        if (isDepartmentHead) {
          setInstructors(data.data.instructors);
        } else {
          setDepartmentHeads(data.data.departmentHeads);
        }
      } catch (error) {
        console.error('Error fetching recipients:', error);
        toast.error(error.message || 'Failed to load recipients');
      } finally {
        setLoadingRecipients(false);
      }
    };

    fetchRecipients();
  }, [isDepartmentHead, baseURL]);

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (isDepartmentHead && !selectedInstructor) {
      toast.error('Please select an instructor');
      return;
    }

    try {
      setLoading(true);
      const url = replyTo 
        ? `${baseURL}/api/v1/feedbacks/${replyTo._id}/reply`
        : `${baseURL}/api/v1/feedbacks`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: message.trim(),
          receiverId: isDepartmentHead ? selectedInstructor : departmentHeads[0]?._id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send feedback');
      }

      toast.success(replyTo ? 'Reply sent successfully' : 'Feedback sent successfully');
      navigate('/feedback');
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast.error(error.message || 'Failed to send feedback');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRecipients) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton 
            component={Link} 
            to="/feedback"
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {replyTo ? 'Reply to Feedback' : 'Compose Feedback'}
          </Typography>
        </Box>
        <Breadcrumbs>
          <MuiLink component={Link} to="/dashboard" underline="hover" color="inherit">
            Dashboard
          </MuiLink>
          <MuiLink component={Link} to="/feedback" underline="hover" color="inherit">
            Feedback
          </MuiLink>
          <Typography color="text.primary">
            {replyTo ? 'Reply' : 'Compose'}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSendFeedback}>
          {isDepartmentHead ? (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="instructor-select-label">To</InputLabel>
              <Select
                labelId="instructor-select-label"
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                label="To"
                required
                disabled={!!replyTo}
              >
                {instructors.map((instructor) => (
                  <MenuItem key={instructor._id} value={instructor._id}>
                    {instructor.name} - {instructor.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : departmentHeads.length > 0 ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                To: {departmentHeads[0].name} ({departmentHeads[0].email})
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="error">
                No department head found for your department
              </Typography>
            </Box>
          )}

          {replyTo && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Original Message:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                <Typography variant="body2">
                  {replyTo.message}
                </Typography>
              </Paper>
            </Box>
          )}

          <TextField
            multiline
            rows={12}
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            placeholder={replyTo ? "Write your reply here..." : "Write your feedback message here..."}
            required
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                fontFamily: 'inherit',
                fontSize: '1rem',
                lineHeight: '1.5',
              }
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              component={Link}
              to="/feedback"
              variant="outlined"
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              loading={loading}
              loadingPosition="start"
              startIcon={<SendIcon />}
              variant="contained"
              disabled={!message.trim() || (isDepartmentHead && !selectedInstructor) || (!isDepartmentHead && departmentHeads.length === 0)}
            >
              {replyTo ? 'Send Reply' : 'Send Feedback'}
            </LoadingButton>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ComposeFeedback;
