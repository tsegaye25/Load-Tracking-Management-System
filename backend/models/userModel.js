const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require("crypto")

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
    default: function() {
      if (this.role === 'admin') return 'Administration';
      return ['finance', 'scientific-director', 'vice-scientific-director'].includes(this.role) 
        ? 'Others University Staff Members' 
        : undefined;
    },
    required: function() {
      if (this.role === 'admin') return false;
      return !['finance', 'scientific-director', 'vice-scientific-director'].includes(this.role);
    }
  },
  department: {
    type: String,
    default: function() {
      if (this.role === 'admin') return 'System Administration';
      if (['finance', 'scientific-director', 'vice-scientific-director'].includes(this.role)) {
        return 'Central Office';
      }
      if (this.role === 'school-dean') {
        return 'Dean Office';
      }
      return undefined;
    },
    required: function() {
      if (this.role === 'admin') return false;
      return !['finance', 'scientific-director', 'vice-scientific-director', 'school-dean'].includes(this.role);
    },
    validate: {
      validator: function(dept) {
        if (['finance', 'scientific-director', 'vice-scientific-director'].includes(this.role)) {
          return true;
        }
        if (this.role === 'school-dean') {
          return dept === 'Dean Office';
        }
        if (this.role === 'admin') {
          return dept === 'System Administration';
        }
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
          'College of Natural Sciences': ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
          'Others University Staff Members': ['Central Office']
        };
        return departments[this.school]?.includes(dept) || true;
      },
      message: 'Invalid department for the selected school'
    }
  },
  positionHour: {
    type: Number,
    default: 0,
    validate: {
      validator: function(val) {
        return val >= 0;
      },
      message: 'Position hours cannot be negative'
    }
  },
  hdpHour: {
    type: Number,
    default: 0,
    validate: {
      validator: function(val) {
        return val >= 0;
      },
      message: 'HDP hours cannot be negative'
    }
  },
  batchAdvisor: {
    type: Number,
    default: 0,
    validate: {
      validator: function(val) {
        return val >= 0;
      },
      message: 'Batch advisor hours cannot be negative'
    }
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

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
