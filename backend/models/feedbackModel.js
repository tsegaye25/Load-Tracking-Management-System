const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, 'Feedback must have a message']
    },
    sender: {
      id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Feedback must have a sender']
      },
      name: String,
      role: String,
      avatar: String
    },
    receiver: {
      id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Feedback must have a receiver']
      },
      name: String,
      role: String,
      avatar: String
    },
    status: {
      type: String,
      enum: ['read', 'unread'],
      default: 'unread'
    },
    replyTo: {
      type: mongoose.Schema.ObjectId,
      ref: 'Feedback'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate for replies
feedbackSchema.virtual('replies', {
  ref: 'Feedback',
  foreignField: 'replyTo',
  localField: '_id'
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
