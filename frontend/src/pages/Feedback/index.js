import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Skeleton,
  IconButton,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
} from '@mui/material';
import {
  Reply as ReplyIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

const Feedback = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const isDepartmentHead = user?.role === 'department-head';
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const getAvatarUrl = (user) => {
    if (!user) return null;
    const avatar = user.avatar || '/uploads/profile-images/default-avatar.jpg';
    if (avatar.startsWith('data:') || avatar.startsWith('blob:') || avatar.startsWith('http')) {
      return avatar;
    }
    return `${baseURL}${avatar}`;
  };

  const getDefaultAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || '')}&background=random`;
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to load feedbacks');
      }

      const data = await response.json();
      setFeedbacks(data.data.feedbacks);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error(error.message || 'Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

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
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error marking feedback as read:', error);
      toast.error(error.message || 'Failed to mark feedback as read');
    }
  };

  const handleOpenReply = (feedback) => {
    navigate('/feedback/compose', {
      state: {
        replyTo: feedback,
        receiverId: feedback.sender._id,
        receiverName: feedback.sender.name
      }
    });
  };

  const renderFeedbackItem = (feedback) => {
    const isReply = !!feedback.replyTo;
    const senderAvatar = getAvatarUrl(feedback.sender) || getDefaultAvatar(feedback.sender.name);
    const receiverAvatar = getAvatarUrl(feedback.receiver) || getDefaultAvatar(feedback.receiver.name);

    return (
      <ListItem
        key={feedback._id}
        sx={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          bgcolor: feedback.status === 'unread' ? 'action.hover' : 'transparent',
          borderRadius: 1,
          my: 1,
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
          <ListItemAvatar>
            <Avatar 
              src={senderAvatar}
              alt={feedback.sender.name || 'User'}
              sx={{ width: 40, height: 40 }}
            >
              <PersonIcon />
            </Avatar>
          </ListItemAvatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" component="div">
              {feedback.sender.name}
              <Chip
                size="small"
                label={feedback.sender.role}
                sx={{ ml: 1, textTransform: 'capitalize' }}
              />
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(feedback.createdAt), 'PPpp')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {feedback.status === 'unread' && feedback.receiver._id === user?.id && (
              <IconButton
                size="small"
                onClick={() => handleMarkAsRead(feedback._id)}
                title="Mark as read"
              >
                <MarkEmailReadIcon />
              </IconButton>
            )}
            {/* Show reply icon for both department heads and instructors when viewing messages from the other role */}
            {!isReply && feedback.sender._id !== user?.id && 
             ((isDepartmentHead && feedback.sender.role === 'instructor') || 
              (!isDepartmentHead && feedback.sender.role === 'department-head')) && (
              <IconButton
                size="small"
                onClick={() => handleOpenReply(feedback)}
                title="Reply to feedback"
              >
                <ReplyIcon />
              </IconButton>
            )}
            {feedback.sender._id === user?.id && (
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedFeedback(feedback);
                  setOpenConfirmDelete(true);
                }}
                title="Delete"
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        <Box sx={{ pl: 7, width: '100%' }}>
          {isReply && feedback.replyTo && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Replying to feedback from {feedback.replyTo.sender.name}
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'action.hover' }}>
                <Typography variant="body2" color="text.secondary">
                  {feedback.replyTo.message}
                </Typography>
              </Paper>
            </Box>
          )}
          <Typography variant="body1">{feedback.message}</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, pl: 7 }}>
          <Typography variant="caption" color="text.secondary">
            To: {feedback.receiver.name}
          </Typography>
          <Avatar
            src={receiverAvatar}
            alt={feedback.receiver.name || 'Receiver'}
            sx={{ width: 24, height: 24, ml: 1 }}
          >
            <PersonIcon />
          </Avatar>
        </Box>
      </ListItem>
    );
  };

  const DeleteConfirmDialog = () => (
    <Dialog
      open={openConfirmDelete}
      onClose={() => setOpenConfirmDelete(false)}
    >
      <DialogTitle>Delete Feedback</DialogTitle>
      <DialogContent>
        Are you sure you want to delete this feedback?
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenConfirmDelete(false)}>Cancel</Button>
        <Button onClick={handleDelete} color="error">Delete</Button>
      </DialogActions>
    </Dialog>
  );

  // Function to render skeleton feedback items
  const renderSkeletonFeedback = () => {
    return (
      <Box sx={{ width: '100%' }}>
        {[1, 2, 3, 4, 5].map((item) => (
          <Box key={item} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
              <Skeleton 
                variant="circular" 
                width={40} 
                height={40} 
                sx={{ 
                  mr: 2,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1)
                }} 
              />
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Skeleton 
                    variant="text" 
                    width={120} 
                    height={24} 
                    sx={{ 
                      mr: 1,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1)
                    }} 
                  />
                  <Skeleton 
                    variant="rounded" 
                    width={80} 
                    height={20} 
                    sx={{ 
                      borderRadius: 1,
                      bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1)
                    }} 
                  />
                </Box>
                <Skeleton 
                  variant="text" 
                  width={150} 
                  height={16} 
                  sx={{ 
                    bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.1)
                  }} 
                />
              </Box>
              <Skeleton 
                variant="circular" 
                width={30} 
                height={30} 
                sx={{ 
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1)
                }} 
              />
            </Box>
            <Skeleton 
              variant="rounded" 
              height={60} 
              sx={{ 
                ml: 7, 
                mb: 1,
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.7)
              }} 
            />
            <Skeleton 
              variant="text" 
              width="40%" 
              height={16} 
              sx={{ 
                ml: 7,
                bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.1)
              }} 
            />
            <Divider sx={{ my: 2 }} />
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Feedback
          </Typography>
          <Button
            component={Link}
            to="/feedback/compose"
            variant="contained"
            startIcon={<AddIcon />}
          >
            New Feedback
          </Button>
        </Box>
        <Breadcrumbs>
          <MuiLink component={Link} to="/dashboard" underline="hover" color="inherit">
            Dashboard
          </MuiLink>
          <Typography color="text.primary">Feedback</Typography>
        </Breadcrumbs>
      </Box>

      <Paper 
        elevation={1} 
        sx={{ 
          p: 3,
          borderRadius: 2,
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: 3
          }
        }}
      >
        {loading ? (
          <Box sx={{ width: '100%' }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Box key={item} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Skeleton variant="text" width={120} height={24} sx={{ mr: 1 }} />
                      <Skeleton variant="rounded" width={80} height={20} />
                    </Box>
                    <Skeleton variant="text" width={150} height={16} />
                  </Box>
                  <Skeleton variant="circular" width={30} height={30} />
                </Box>
                <Skeleton variant="rounded" height={60} sx={{ ml: 7, mb: 1 }} />
                <Skeleton variant="text" width="40%" height={16} sx={{ ml: 7 }} />
                <Divider sx={{ my: 2 }} />
              </Box>
            ))}
          </Box>
        ) : feedbacks.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No feedbacks found
          </Alert>
        ) : (
          <List>
            {feedbacks.map((feedback, index) => (
              <React.Fragment key={feedback._id}>
                {renderFeedbackItem(feedback)}
                {feedback.replies && feedback.replies.map((reply) => (
                  renderFeedbackItem(reply)
                ))}
                {index < feedbacks.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      <DeleteConfirmDialog />
    </Container>
  );
};

export default Feedback;
