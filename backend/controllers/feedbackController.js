const Feedback = require('../models/feedbackModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create feedback
exports.createFeedback = catchAsync(async (req, res, next) => {
  const { message, receiverId } = req.body;

  // Create feedback with sender and receiver information
  const feedback = await Feedback.create({
    message,
    sender: {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role
    },
    receiver: {
      id: receiverId
    },
    status: 'unread'
  });

  // Populate receiver details
  await feedback.populate('receiver.id', 'name role department');

  res.status(201).json({
    status: 'success',
    data: {
      feedback
    }
  });
});

// Get all feedbacks for instructor
exports.getInstructorFeedbacks = catchAsync(async (req, res, next) => {
  const feedbacks = await Feedback.find({
    $or: [
      { // Feedback sent by instructor to department head
        'sender.id': req.user.id,
        'receiver.id': { $exists: true }
      },
      { // Feedback received by instructor from department head
        'receiver.id': req.user.id,
        'sender.role': 'department-head'
      },
      { // Replies to instructor's feedback
        replyTo: { $exists: true },
        $or: [
          { 'sender.id': req.user.id },
          { 'receiver.id': req.user.id }
        ]
      }
    ]
  })
  .populate('sender.id', 'name role department avatar')
  .populate('receiver.id', 'name role department avatar')
  .populate({
    path: 'replyTo',
    populate: {
      path: 'sender.id receiver.id',
      select: 'name role department avatar'
    }
  })
  .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: feedbacks.length,
    data: {
      feedbacks
    }
  });
});

// Get all feedbacks for department head
exports.getDepartmentHeadFeedbacks = catchAsync(async (req, res, next) => {
  const feedbacks = await Feedback.find({ 
    $or: [
      { // Main feedbacks received from instructors
        'receiver.id': req.user.id,
        replyTo: { $exists: false }
      },
      { // All feedbacks sent by department head
        'sender.id': req.user.id
      },
      { // All replies
        replyTo: { $exists: true },
        $or: [
          { 'sender.id': req.user.id },
          { 'receiver.id': req.user.id }
        ]
      }
    ]
  })
  .sort('-createdAt')
  .populate('receiver.id', 'name role department avatar')
  .populate('sender.id', 'name role department avatar')
  .populate({
    path: 'replyTo',
    populate: {
      path: 'sender.id receiver.id',
      select: 'name role department avatar'
    }
  });

  res.status(200).json({
    status: 'success',
    results: feedbacks.length,
    data: {
      feedbacks
    }
  });
});

// Mark feedback as read
exports.markAsRead = catchAsync(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return next(new AppError('No feedback found with that ID', 404));
  }

  // Check if the user is the receiver or sender of the feedback
  const isReceiver = feedback.receiver.id.toString() === req.user.id;
  const isSender = feedback.sender.id.toString() === req.user.id;

  if (!isReceiver && !isSender) {
    return next(new AppError('You can only mark feedbacks related to you as read', 403));
  }

  feedback.status = 'read';
  await feedback.save();

  res.status(200).json({
    status: 'success',
    data: {
      feedback
    }
  });
});

// Reply to feedback
exports.replyToFeedback = catchAsync(async (req, res, next) => {
  const originalFeedback = await Feedback.findById(req.params.id)
    .populate('sender.id', 'name role department')
    .populate('receiver.id', 'name role department');

  if (!originalFeedback) {
    return next(new AppError('No feedback found with that ID', 404));
  }

  // Create a new feedback as reply
  const replyFeedback = await Feedback.create({
    sender: {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role
    },
    receiver: {
      id: originalFeedback.sender.id._id,
      name: originalFeedback.sender.name,
      role: originalFeedback.sender.role
    },
    message: req.body.message,
    status: 'unread',
    replyTo: originalFeedback._id
  });

  // Populate the reply feedback
  await replyFeedback.populate([
    { path: 'sender.id', select: 'name role department' },
    { path: 'receiver.id', select: 'name role department' }
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      feedback: replyFeedback
    }
  });
});

// Update feedback
exports.updateFeedback = catchAsync(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.id)
    .populate('sender.id', 'name role department avatar')
    .populate('receiver.id', 'name role department avatar');

  if (!feedback) {
    return next(new AppError('No feedback found with that ID', 404));
  }

  // Check if the user is the sender of the feedback
  if (feedback.sender.id._id.toString() !== req.user.id) {
    return next(new AppError('You can only update your own feedback', 403));
  }

  feedback.message = req.body.message;
  await feedback.save();

  res.status(200).json({
    status: 'success',
    data: {
      feedback
    }
  });
});

// Delete feedback
exports.deleteFeedback = catchAsync(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.id)
    .populate('sender.id', 'name role department')
    .populate('receiver.id', 'name role department');

  if (!feedback) {
    return next(new AppError('No feedback found with that ID', 404));
  }

  // Check if the user is the sender of the feedback
  if (feedback.sender.id._id.toString() !== req.user.id) {
    return next(new AppError('You can only delete your own feedback', 403));
  }

  // Delete the feedback and any replies
  await Feedback.deleteMany({
    $or: [
      { _id: req.params.id },
      { replyTo: req.params.id }
    ]
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
