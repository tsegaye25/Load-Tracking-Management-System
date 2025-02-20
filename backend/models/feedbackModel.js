const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Feedback must have a sender']
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Feedback must have a receiver']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course'
  },
  message: {
    type: String,
    required: [true, 'Feedback must have a message']
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

feedbackSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'sender',
    select: 'name role department'
  }).populate({
    path: 'receiver',
    select: 'name role department'
  }).populate({
    path: 'course',
    select: 'title'
  });
  next();
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
