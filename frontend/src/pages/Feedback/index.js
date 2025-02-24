import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Send as SendIcon,
  Reply as ReplyIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
 

const Feedback = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [openNewFeedback, setOpenNewFeedback] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openReply, setOpenReply] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [departmentHeads, setDepartmentHeads] = useState([]);
  const isDepartmentHead = user?.role === 'department-head';
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const getAvatarUrl = (user) => {
    if (!user) return null;
    const avatar = user.avatar || user.photo;
    if (!avatar) return null;
    if (avatar.startsWith('data:') || avatar.startsWith('blob:') || avatar.startsWith('http')) {
      return avatar;
    }
    return `${baseURL}${avatar}`;
  };

  const getDefaultAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || '')}&background=random`;
  };

  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [editMessage, setEditMessage] = useState('');

  const handleDelete = async () => {
    try {
      const response = await fetch(`${baseURL}/api/v1/feedbacks/${selectedFeedback._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Feedback deleted successfully');
        fetchFeedbacks();
        setOpenConfirmDelete(false);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error(error.message || 'Failed to delete feedback');
    }
  };

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
      const response = await fetch(`${baseURL}/api/v1/feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: message.trim(),
          receiverId: isDepartmentHead ? selectedInstructor : departmentHeads[0]._id
        })
      });

      if (response.ok) {
        toast.success('Feedback sent successfully');
        setMessage('');
        setSelectedInstructor('');
        setOpenNewFeedback(false);
        fetchFeedbacks();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send feedback');
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast.error(error.message || 'Failed to send feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    try {
      if (!selectedFeedback || !message.trim()) {
        toast.error('Please write a message before sending');
        return;
      }

      setLoading(true);
      const response = await fetch(
        `${baseURL}/api/v1/feedbacks/${selectedFeedback._id}/reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            message: message.trim()
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send reply');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('Reply sent successfully');
        setMessage('');
        setOpenReply(false);
        setSelectedFeedback(null);
        await fetchFeedbacks(); // Wait for feedbacks to be fetched
      } else {
        throw new Error(data.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(error.message || 'Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (feedbackId) => {
    try {
      const response = await fetch(`${baseURL}/api/v1/feedbacks/${feedbackId}/mark-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Feedback marked as read');
        fetchFeedbacks();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to mark feedback as read');
      }
    } catch (error) {
      console.error('Error marking feedback as read:', error);
      toast.error(error.message || 'Failed to mark feedback as read');
    }
  };

  const handleEditFeedback = async (feedbackId, updatedMessage) => {
    try {
      const response = await fetch(`${baseURL}/api/v1/feedbacks/${feedbackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: updatedMessage })
      });

      if (response.ok) {
        toast.success('Feedback updated successfully');
        setOpenEdit(false);
        setMessage('');
        fetchFeedbacks();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error(error.message || 'Failed to update feedback');
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const endpoint = isDepartmentHead ? 'department-head' : 'instructor';
      const response = await fetch(`${baseURL}/api/v1/feedbacks/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data.data.feedbacks);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error(error.message || 'Failed to fetch feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentHeads = async () => {
    try {
      const encodedDepartment = encodeURIComponent(user.department);
      const response = await fetch(
        `${baseURL}/api/v1/users/department-heads/${encodedDepartment}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setDepartmentHeads(data.data.departmentHeads);
        if (data.data.departmentHeads.length > 0) {
          setSelectedInstructor(data.data.departmentHeads[0]._id);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch department heads');
      }
    } catch (error) {
      console.error('Error fetching department heads:', error);
      toast.error(error.message || 'Failed to fetch department heads');
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await fetch(
        `${baseURL}/api/v1/users/instructors/department/${user.department}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInstructors(data.data.instructors);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
      toast.error(error.message || 'Failed to fetch instructors');
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    if (isDepartmentHead) {
      fetchInstructors();
    } else {
      fetchDepartmentHeads();
    }
  }, [isDepartmentHead]);

  const MessageTextField = ({ value, onChange, placeholder, rows = 12 }) => (
    <Box
      sx={{
        mt: 2,
        position: 'relative',
        '& .MuiTextField-root': {
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: '#fff',
            boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
          },
          '&.Mui-focused': {
            backgroundColor: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }
        },
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          '& fieldset': {
            borderWidth: '1px',
            borderColor: 'rgba(0, 0, 0, 0.1)',
          },
          '&:hover fieldset': {
            borderColor: 'primary.main',
            borderWidth: '1px',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'primary.main',
            borderWidth: '2px',
          }
        }
      }}
    >
      <TextField
        fullWidth
        multiline
        rows={rows}
        variant="outlined"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        inputProps={{
          maxLength: 1000,
          style: {
            fontSize: '1.1rem',
            lineHeight: '1.6',
            padding: '20px',
            color: '#2c3e50',
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
          }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: '4px 8px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: value.length >= 900 ? 'error.main' : 'text.secondary',
            fontWeight: 500,
          }}
        >
          {value.length}/1000
        </Typography>
      </Box>
    </Box>
  );

  const FeedbackItem = ({ feedback }) => {
    const isReply = feedback.replyTo;
    const isOwner = feedback.sender.id._id === user.id;
    const isSentFeedback = isOwner && !isReply;
    const canManageMessage = isOwner;

    return (
      <ListItem
        alignItems="flex-start"
        sx={{
          ...(isReply && {
            pl: 8,
            bgcolor: isOwner ? 'primary.light' : 'action.hover',
            borderLeft: '3px solid',
            borderColor: isOwner ? 'secondary.main' : 'primary.main'
          }),
          ...(isSentFeedback && {
            bgcolor: 'rgb(225, 230, 255)',
            borderLeft: '3px solid',
            borderColor: 'primary.main'
          })
        }}
        secondaryAction={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Mark as Read Button */}
            {feedback.status === 'unread' && !isOwner && (
              <IconButton
                edge="end"
                onClick={() => handleMarkAsRead(feedback._id)}
                title="Mark as read"
              >
                <MarkEmailReadIcon />
              </IconButton>
            )}

            {/* Reply Button for Department Head */}
            {isDepartmentHead && !isReply && !isOwner && (
              <IconButton
                edge="end"
                onClick={() => {
                  setSelectedFeedback(feedback);
                  setOpenReply(true);
                }}
                title="Reply"
              >
                <ReplyIcon />
              </IconButton>
            )}

            {/* Edit/Delete Actions for Message Owner */}
            {canManageMessage && (
              <>
                <IconButton
                  edge="end"
                  onClick={() => {
                    setSelectedFeedback(feedback);
                    setMessage(feedback.message);
                    setOpenEdit(true);
                  }}
                  title="Edit"
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => setOpenConfirmDelete(true)}
                  title="Delete"
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </Box>
        }
      >
        <ListItemAvatar>
          <Avatar 
            src={getAvatarUrl(feedback.sender.id) || getDefaultAvatar(feedback.sender.name)}
            alt={feedback.sender.name}
            sx={{ 
              width: 50, 
              height: 50,
              border: '2px solid',
              borderColor: isOwner ? 'secondary.main' : 'primary.main'
            }}
          />
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isSentFeedback ? (
                  <>
                    <span style={{ fontWeight: 'bold' }}>To:</span> {feedback.receiver.name}
                    <Chip 
                      size="small" 
                      label={`${feedback.receiver.role === 'department-head' ? 'Department Head' : 'Instructor'}`}
                      color="primary" 
                      variant="outlined"
                    />
                    <Chip 
                      size="small" 
                      label="Sent" 
                      color="secondary" 
                      sx={{ ml: 1 }}
                    />
                  </>
                ) : (
                  <>
                    <span style={{ fontWeight: 'bold' }}>From:</span> {feedback.sender.name}
                    <Chip 
                      size="small" 
                      label={feedback.sender.role === 'department-head' ? 'Department Head' : 'Instructor'}
                      color={feedback.sender.role === 'department-head' ? 'primary' : 'secondary'}
                    />
                    {feedback.sender.department && (
                      <Chip 
                        size="small" 
                        label={`Dept: ${feedback.sender.department}`}
                        variant="outlined"
                        color="info"
                      />
                    )}
                  </>
                )}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 'auto' }}>
                <Chip
                  size="small"
                  label={feedback.status}
                  color={feedback.status === 'unread' ? 'error' : 'success'}
                />
                {isReply && (
                  <Chip
                    size="small"
                    label="Reply"
                    color="info"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          }
          secondary={
            <>
              <Typography 
                component="div" 
                variant="body2" 
                color="text.primary"
                sx={{ 
                  mt: 1,
                  backgroundColor: isReply ? (isOwner ? 'primary.light' : 'action.hover') : 'transparent',
                  p: isReply ? 1 : 0,
                  borderRadius: 1
                }}
              >
                {feedback.message}
              </Typography>
              <Box sx={{ 
                mt: 1, 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(feedback.createdAt), 'MMM d, yyyy HH:mm')}
                </Typography>
                {feedback.updatedAt && feedback.updatedAt !== feedback.createdAt && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    (edited)
                  </Typography>
                )}
              </Box>
            </>
          }
        />

        {/* Edit Dialog */}
        <Dialog open={openEdit && selectedFeedback?._id === feedback._id} onClose={() => setOpenEdit(false)} maxWidth={false} PaperProps={{
          sx: {
            minHeight: '75vh',
            maxHeight: '90vh',
            width: '80vw',
            maxWidth: '1400px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            '& .MuiDialogTitle-root': {
              padding: '24px 40px',
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid rgba(0,0,0,0.1)'
            },
            '& .MuiDialogContent-root': {
              padding: '32px 40px'
            },
            '& .MuiDialogActions-root': {
              padding: '16px 40px',
              borderTop: '1px solid rgba(0,0,0,0.1)'
            }
          }
        }}>
          <DialogTitle>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              Edit Feedback
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
                Edit your message
              </Typography>
              <MessageTextField
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Edit your feedback message..."
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setOpenEdit(false)}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                px: 3
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              onClick={() => handleEditFeedback(selectedFeedback._id, message)}
              variant="contained"
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                px: 3
              }}
            >
              Save Changes
            </LoadingButton>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openConfirmDelete} onClose={() => setOpenConfirmDelete(false)}>
          <DialogTitle>Delete Feedback</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this feedback? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirmDelete(false)}>Cancel</Button>
            <LoadingButton
              onClick={handleDelete}
              color="error"
              variant="contained"
            >
              Delete
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </ListItem>
    );
  };

  const NewFeedbackDialog = () => (
    <Dialog 
      open={openNewFeedback} 
      onClose={() => setOpenNewFeedback(false)} 
      maxWidth={false} 
      PaperProps={{
        sx: {
          minHeight: '75vh',
          maxHeight: '90vh',
          width: '80vw',
          maxWidth: '1400px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          '& .MuiDialogTitle-root': {
            padding: '24px 40px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid rgba(0,0,0,0.1)'
          },
          '& .MuiDialogContent-root': {
            padding: '32px 40px'
          },
          '& .MuiDialogActions-root': {
            padding: '16px 40px',
            borderTop: '1px solid rgba(0,0,0,0.1)'
          }
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={getAvatarUrl(user) || getDefaultAvatar(user?.name)}
            alt={user?.name}
            sx={{ width: 40, height: 40 }}
          />
          <Typography variant="h6">
            {isDepartmentHead ? 'Send Feedback to Instructor' : 'Send Feedback to Department Head'}
          </Typography>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSendFeedback}>
        <DialogContent>
          {isDepartmentHead ? (
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Select Instructor</InputLabel>
              <Select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                label="Select Instructor"
              >
                {instructors.map((instructor) => (
                  <MenuItem key={instructor._id} value={instructor._id}>
                    {instructor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            departmentHeads.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Loading department head information...
              </Alert>
            ) : null
          )}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
              Write your message
            </Typography>
            <MessageTextField
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your feedback message here..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenNewFeedback(false)}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              px: 3
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
            disabled={!message.trim() || (isDepartmentHead && !selectedInstructor)}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              px: 3
            }}
          >
            Send Feedback
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );

  const ReplyDialog = () => (
    <Dialog
      open={openReply}
      onClose={() => {
        setOpenReply(false);
        setSelectedFeedback(null);
        setMessage('');
      }}
      maxWidth={false}
      PaperProps={{
        sx: {
          minHeight: '75vh',
          maxHeight: '90vh',
          width: '80vw',
          maxWidth: '1400px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          '& .MuiDialogTitle-root': {
            padding: '24px 40px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid rgba(0,0,0,0.1)'
          },
          '& .MuiDialogContent-root': {
            padding: '32px 40px'
          },
          '& .MuiDialogActions-root': {
            padding: '16px 40px',
            borderTop: '1px solid rgba(0,0,0,0.1)'
          }
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={getAvatarUrl(selectedFeedback?.sender.id) || getDefaultAvatar(selectedFeedback?.sender.name)}
            alt={selectedFeedback?.sender.name}
            sx={{ width: 40, height: 40 }}
          />
          <Typography variant="h6">Reply to Feedback</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Original Message:
            </Typography>
            <Typography variant="body1">
              {selectedFeedback?.message}
            </Typography>
          </Box>
          <Typography variant="subtitle2" color="text.secondary">
            Write your reply:
          </Typography>
          <MessageTextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your reply here..."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={() => {
            setOpenReply(false);
            setSelectedFeedback(null);
            setMessage('');
          }}
          variant="outlined"
          sx={{ 
            borderRadius: '8px',
            textTransform: 'none',
            px: 3
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleReply}
          variant="contained"
          disabled={!message.trim()}
          sx={{ 
            borderRadius: '8px',
            textTransform: 'none',
            px: 3
          }}
        >
          Send Reply
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            {isDepartmentHead ? 'Instructor Feedback' : 'Feedback to Department Head'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewFeedback(true)}
          >
            New Feedback
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : feedbacks.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No feedbacks found
          </Alert>
        ) : (
          <List>
            {feedbacks.map((feedback, index) => (
              <React.Fragment key={feedback._id}>
                <FeedbackItem feedback={feedback} />
                {feedback.replies && feedback.replies.map((reply) => (
                  <FeedbackItem key={reply._id} feedback={reply} />
                ))}
                {index < feedbacks.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      <NewFeedbackDialog />
      <ReplyDialog />
    </Container>
  );
};

export default Feedback;
