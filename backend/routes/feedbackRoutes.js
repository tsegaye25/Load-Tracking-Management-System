const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Create feedback
router.post('/', feedbackController.createFeedback);

// Get feedbacks based on role
router.get(
  '/department-head',
  authController.restrictTo('department-head'),
  feedbackController.getDepartmentHeadFeedbacks
);

router.get(
  '/instructor',
  authController.restrictTo('instructor'),
  feedbackController.getInstructorFeedbacks
);

// Get unread feedback count
router.get(
  '/unread-count',
  authController.protect,
  feedbackController.getUnreadCount
);

// Mark feedback as read - accessible to both department heads and instructors
router.patch('/:id/mark-read', feedbackController.markAsRead);

// Mark feedback as read
router.patch(
  '/:id/read',
  authController.protect,
  feedbackController.markAsRead
);

// Reply to feedback - accessible to both department heads and instructors
router.post(
  '/:id/reply',
  authController.restrictTo('department-head', 'instructor'),
  feedbackController.createFeedback
);

// Update and delete own feedback
router.patch('/:id', feedbackController.updateFeedback);
router.delete('/:id', feedbackController.deleteFeedback);

module.exports = router;
