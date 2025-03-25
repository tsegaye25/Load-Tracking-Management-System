const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course must have a title'],
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Course must have a code'],
    unique: true,
    trim: true,
    uppercase: true
  },
  school: {
    type: String,
    required: [true, 'Course must belong to a school'],
    enum: [
      'College of Business and Economics',
      'College of Computing and Informatics',
      'College of Engineering',
      'College of computational and natural sciences',
      'College of Law'
    ]
  },
  department: {
    type: String,
    required: [true, 'Course must belong to a department'],
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
        return departments[this.school]?.includes(dept) || true;
      },
      message: 'Invalid department for the selected school'
    }
  },
  classYear: {
    type: String,
    required: [true, 'Please specify the class year'],
    enum: ['First', 'Second', 'Third', 'Fourth', 'Fifth']
  },
  semester: {
    type: String,
    required: [true, 'Please specify the semester'],
    enum: ['First', 'Second']
  },
  Hourfor: {
    creaditHours: {
      type: Number,
      required: [true, 'Please specify credit hours']
    },
    lecture: {
      type: Number,
      required: [true, 'Please specify lecture hours']
    },
    lab: {
      type: Number,
      default: 0
    },
    tutorial: {
      type: Number,
      default: 0
    }
  },
  Number_of_Sections: {
    lecture: {
      type: Number,
      required: [true, 'Please specify number of lecture sections']
    },
    lab: {
      type: Number,
      default: 0
    },
    tutorial: {
      type: Number,
      default: 0
    }
  },
  hdp: {
    type: Number,
    default: 0
  },
  position: {
    type: Number,
    default: 0
  },
  branchAdvisor: {
    type: Number,
    default: 0
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  requestedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: [
      'pending', 
      'approved', 
      'rejected', 
      'unassigned',
      'dean-review',
      'dean-approved',
      'dean-rejected',
      'vice-director-review',
      'vice-director-approved',
      'vice-director-rejected'
    ],
    default: 'unassigned'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  rejectionDate: {
    type: Date
  },
  rejectedBy: {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['department-head', 'school-dean', 'vice-director']
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  rejectedInstructor: {
    id: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String,
    department: String
  },
  deanRejectionDate: {
    type: Date
  },
  approvalHistory: [{
    status: {
      type: String,
      enum: [
        'pending', 
        'approved', 
        'rejected',
        'dean-review',
        'dean-approved',
        'dean-rejected',
        'vice-director-review',
        'vice-director-approved',
        'vice-director-rejected',
        'resubmitted-to-dean'
      ]
    },
    approver: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    role: String,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  totalHours: {
    type: Number,
    default: function() {
      const hours = this.Hourfor;
      return (hours.creaditHours || 0) + (hours.lecture || 0) + (hours.lab || 0) + (hours.tutorial || 0);
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware to populate instructor details
courseSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'instructor',
    select: 'name email department school'
  })
  .populate({
    path: 'requestedBy',
    select: 'name email department school'
  })
  .populate({
    path: 'rejectedBy.user',
    select: 'name role department school'
  });
  next();
});

module.exports = mongoose.model('Course', courseSchema);
