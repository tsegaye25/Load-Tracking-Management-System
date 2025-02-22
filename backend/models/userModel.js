const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number']
  },
  photo: String,
  role: {
    type: String,
    enum: ['instructor', 'department-head', 'school-dean', 'vice-scientific-director', 'scientific-director', 'finance', 'admin'],
    default: 'instructor'
  },
  school: {
    type: String,
    required: [true, 'Please provide your school']
  },
  department: {
    type: String,
    required: [true, 'Please provide your department'],
    validate: {
      validator: function(dept) {
        const departments = {
          'College of Business and Economics': [
            'Management',
            'Accounting and Finance',
            'Economics',
            'Public Administration',
            'Logistics and Supply Chain Management',
            'Marketing Management',
            'Tourism and Hotel Management'
          ]
        };
        return departments[this.school]?.includes(dept) || true; // Allow other departments for other schools
      },
      message: 'Invalid department for the selected school'
    }
  },
  position: String,
  batchAdvisor: {
    type: Number,
    default: 0
  },
  avatar: {
    type: String,
    default: 'default-avatar.jpg'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  totalLoad: {
    type: Number,
    default: 0
  },
  courses: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Course'
  }],
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// Instance method to check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
