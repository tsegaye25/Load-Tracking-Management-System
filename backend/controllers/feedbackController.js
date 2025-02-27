const Feedback = require('../models/feedbackModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create feedback
exports.createFeedback = catchAsync(async (req, res, next) => {
  const { message, receiverId } = req.body;
  const isReply = !!req.params.id;

  let feedbackData = {
    message,
    sender: {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role,
      avatar: req.user.avatar
    },
    receiver: {
      id: receiverId
    },
    status: 'unread'
  };

  // If this is a reply, add the replyTo field and get original feedback details
  if (isReply) {
    const originalFeedback = await Feedback.findById(req.params.id)
      .populate('sender.id', 'name role department avatar')
      .populate('receiver.id', 'name role department avatar');

    if (!originalFeedback) {
      return next(new AppError('No feedback found with that ID', 404));
    }

    // For replies, set the receiver to the original sender
    feedbackData.receiver.id = originalFeedback.sender.id._id;
    feedbackData.replyTo = originalFeedback._id;
  }

  // Create the feedback
  const feedback = await Feedback.create(feedbackData);

  // Populate the feedback with user details
  await feedback.populate([
    { path: 'sender.id', select: 'name role department avatar' },
    { path: 'receiver.id', select: 'name role department avatar' },
    {
      path: 'replyTo',
      populate: [
        { path: 'sender.id', select: 'name role department avatar' },
        { path: 'receiver.id', select: 'name role department avatar' }
      ]
    }
  ]);

  // Convert to plain object and restructure data
  const responseData = feedback.toObject();
  if (responseData.sender.id) {
    responseData.sender = {
      _id: responseData.sender.id._id,
      name: responseData.sender.id.name,
      role: responseData.sender.id.role,
      department: responseData.sender.id.department,
      avatar: responseData.sender.id.avatar
    };
  }
  if (responseData.receiver.id) {
    responseData.receiver = {
      _id: responseData.receiver.id._id,
      name: responseData.receiver.id.name,
      role: responseData.receiver.id.role,
      department: responseData.receiver.id.department,
      avatar: responseData.receiver.id.avatar
    };
  }

  res.status(201).json({
    status: 'success',
    data: {
      feedback: responseData
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
  .populate({
    path: 'sender.id',
    select: 'name role department avatar photo'
  })
  .populate({
    path: 'receiver.id',
    select: 'name role department avatar photo'
  })
  .populate({
    path: 'replyTo',
    populate: [
      {
        path: 'sender.id',
        select: 'name role department avatar photo'
      },
      {
        path: 'receiver.id',
        select: 'name role department avatar photo'
      }
    ]
  })
  .sort('-createdAt');

  // Update sender and receiver info in each feedback
  const updatedFeedbacks = feedbacks.map(feedback => {
    const doc = feedback.toObject();
    if (doc.sender.id) {
      doc.sender = {
        _id: doc.sender.id._id,
        name: doc.sender.id.name,
        role: doc.sender.id.role,
        department: doc.sender.id.department,
        avatar: doc.sender.id.avatar || doc.sender.id.photo
      };
    }
    if (doc.receiver.id) {
      doc.receiver = {
        _id: doc.receiver.id._id,
        name: doc.receiver.id.name,
        role: doc.receiver.id.role,
        department: doc.receiver.id.department,
        avatar: doc.receiver.id.avatar || doc.receiver.id.photo
      };
    }
    return doc;
  });

  res.status(200).json({
    status: 'success',
    results: feedbacks.length,
    data: {
      feedbacks: updatedFeedbacks
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
  .populate({
    path: 'sender.id',
    select: 'name role department avatar photo'
  })
  .populate({
    path: 'receiver.id',
    select: 'name role department avatar photo'
  })
  .populate({
    path: 'replyTo',
    populate: [
      {
        path: 'sender.id',
        select: 'name role department avatar photo'
      },
      {
        path: 'receiver.id',
        select: 'name role department avatar photo'
      }
    ]
  })
  .sort('-createdAt');

  // Update sender and receiver info in each feedback
  const updatedFeedbacks = feedbacks.map(feedback => {
    const doc = feedback.toObject();
    if (doc.sender.id) {
      doc.sender = {
        _id: doc.sender.id._id,
        name: doc.sender.id.name,
        role: doc.sender.id.role,
        department: doc.sender.id.department,
        avatar: doc.sender.id.avatar || doc.sender.id.photo
      };
    }
    if (doc.receiver.id) {
      doc.receiver = {
        _id: doc.receiver.id._id,
        name: doc.receiver.id.name,
        role: doc.receiver.id.role,
        department: doc.receiver.id.department,
        avatar: doc.receiver.id.avatar || doc.receiver.id.photo
      };
    }
    return doc;
  });

  res.status(200).json({
    status: 'success',
    results: feedbacks.length,
    data: {
      feedbacks: updatedFeedbacks
    }
  });
});

// Get unread feedback count
exports.getUnreadCount = catchAsync(async (req, res, next) => {
  const count = await Feedback.countDocuments({
    'receiver.id': req.user.id,
    status: 'unread'
  });

  res.status(200).json({
    status: 'success',
    data: {
      unreadCount: count
    }
  });
});

// Mark feedback as read
exports.markAsRead = catchAsync(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.id);
  
  if (!feedback) {
    return next(new AppError('No feedback found with that ID', 404));
  }

  if (feedback.receiver.id.toString() !== req.user.id.toString()) {
    return next(new AppError('You can only mark your own received feedback as read', 403));
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
    .populate('sender.id', 'name role department avatar')
    .populate('receiver.id', 'name role department avatar');

  if (!originalFeedback) {
    return next(new AppError('No feedback found with that ID', 404));
  }

  // Create a new feedback as reply
  const replyFeedback = await Feedback.create({
    sender: {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role,
      avatar: req.user.avatar
    },
    receiver: {
      id: originalFeedback.sender.id._id,
      name: originalFeedback.sender.name,
      role: originalFeedback.sender.role,
      avatar: originalFeedback.sender.avatar
    },
    message: req.body.message,
    status: 'unread',
    replyTo: originalFeedback._id
  });

  // Populate the reply feedback
  await replyFeedback.populate([
    { path: 'sender.id', select: 'name role department avatar' },
    { path: 'receiver.id', select: 'name role department avatar' }
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
    .populate('sender.id', 'name role department avatar')
    .populate('receiver.id', 'name role department avatar');

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
