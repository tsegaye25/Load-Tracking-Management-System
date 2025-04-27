const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Payment must be associated with an instructor']
  },
  tx_ref: {
    type: String,
    required: [true, 'Transaction reference is required'],
    unique: true,
    trim: true
  },
  totalLoad: {
    type: Number,
    required: [true, 'Total load is required'],
    min: [0, 'Total load cannot be negative']
  },
  paymentAmount: {
    type: Number,
    required: [true, 'Payment amount per hour is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  totalPayment: {
    type: Number,
    required: [true, 'Total payment is required'],
    min: [0, 'Total payment cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending'
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    default: () => new Date().getFullYear().toString()
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: ['First', 'Second'],
    default: 'First'
  },
  remarks: {
    type: String,
    trim: true
  },
  paymentHistory: [{
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid']
    },
    amount: Number,
    processedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    processedAt: {
      type: Date,
      default: Date.now
    },
    remarks: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Function to generate tx_ref
paymentSchema.statics.generateTxRef = function(instructorId) {
  return `PAY-${instructorId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create unique tx_ref if not provided
paymentSchema.pre('save', function(next) {
  if (!this.tx_ref) {
    this.tx_ref = this.constructor.generateTxRef(this.instructor);
  }
  next();
});

// Handle tx_ref for findOneAndUpdate
paymentSchema.pre('findOneAndUpdate', function(next) {
  if (!this._update.$set) {
    this._update.$set = {};
  }
  if (!this._update.$set.tx_ref) {
    const instructorId = this._conditions.instructor;
    this._update.$set.tx_ref = this.model.generateTxRef(instructorId);
  }
  next();
});

// Validate total payment before saving
paymentSchema.pre('save', function(next) {
  const calculatedTotal = Math.round((this.totalLoad * this.paymentAmount) * 100) / 100;
  const providedTotal = Math.round(this.totalPayment * 100) / 100;
  
  if (Math.abs(calculatedTotal - providedTotal) > 0.01) {
    return next(new Error(`Total payment (${providedTotal}) must equal total load (${this.totalLoad}) multiplied by payment amount (${this.paymentAmount}). Expected: ${calculatedTotal}`));
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
