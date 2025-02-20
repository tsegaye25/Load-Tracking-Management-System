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
        return departments[this.school]?.includes(dept) || true; // Allow other departments for other schools
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
  BranchAdvisor: {
    type: Number,
    default: 0
  },
  Sum: {
    type: Number,
    default: 0
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['unassigned', 'pending', 'approved', 'rejected'],
    default: 'unassigned'
  },
  approvalFlow: {
    departmentHead: {
      approved: { type: Boolean, default: false },
      date: Date,
      remarks: String
    },
    schoolDean: {
      approved: { type: Boolean, default: false },
      date: Date,
      remarks: String
    },
    viceScientificDirector: {
      approved: { type: Boolean, default: false },
      date: Date,
      remarks: String
    },
    scientificDirector: {
      approved: { type: Boolean, default: false },
      date: Date,
      remarks: String
    },
    finance: {
      approved: { type: Boolean, default: false },
      date: Date,
      remarks: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate total load before saving
courseSchema.pre('save', function(next) {
  // Calculate lecture load
  const lectureLoad = this.Hourfor.lecture * this.Number_of_Sections.lecture;
  
  // Calculate lab load
  const labLoad = this.Hourfor.lab * this.Number_of_Sections.lab;
  
  // Calculate tutorial load
  const tutorialLoad = this.Hourfor.tutorial * this.Number_of_Sections.tutorial;
  
  // Calculate additional loads
  const hdpLoad = this.hdp || 0;
  const positionLoad = this.position || 0;
  const branchAdvisorLoad = this.BranchAdvisor || 0;
  
  // Set total load
  this.totalLoad = lectureLoad + labLoad + tutorialLoad + hdpLoad + positionLoad + branchAdvisorLoad;
  
  next();
});

// Add totalLoad to schema
courseSchema.add({
  totalLoad: {
    type: Number,
    default: 0
  }
});

courseSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'instructor',
    select: 'name email department'
  });
  next();
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
