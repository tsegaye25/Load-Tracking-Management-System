const Course = require('../models/courseModel');
const Payment = require('../models/paymentModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

// Get finance dashboard stats
exports.getFinanceDashboardStats = catchAsync(async (req, res, next) => {
  try {
    // Get all courses in finance stages
    const courses = await Course.find({
      status: {
        $in: [
          'scientific-director-approved',
          'finance-review',
          'finance-approved',
          'finance-rejected'
        ]
      }
    })
    .populate({
      path: 'instructor',
      select: 'name email department school',
      populate: {
        path: 'school',
        select: 'name'
      }
    })
    .lean();

    // Group courses by instructor and school
    const instructorStats = {};
    const schoolStats = {};

    // First pass: Group courses by instructor
    courses.forEach(course => {
      if (!course.instructor || !course.instructor._id || !course.instructor.school) return;

      const instructorId = course.instructor._id.toString();
      const schoolName = course.instructor.school.name;

      // Initialize instructor stats if not exists
      if (!instructorStats[instructorId]) {
        instructorStats[instructorId] = {
          name: course.instructor.name,
          school: schoolName,
          courses: [],
          hasApprovedPayment: false,
          hasRejectedPayment: false,
          hasPendingPayment: false,
          totalAmount: 0
        };
      }

      // Add course to instructor's courses
      instructorStats[instructorId].courses.push({
        status: course.status,
        creditHours: course.creditHours || 0,
        paymentRate: course.paymentRate || 1000
      });

      // Update instructor payment status based on course status
      if (course.status === 'finance-approved') {
        instructorStats[instructorId].hasApprovedPayment = true;
        instructorStats[instructorId].totalAmount += (course.creditHours || 0) * (course.paymentRate || 1000);
      } else if (course.status === 'finance-rejected') {
        instructorStats[instructorId].hasRejectedPayment = true;
      } else if (course.status === 'scientific-director-approved' || course.status === 'finance-review') {
        instructorStats[instructorId].hasPendingPayment = true;
      }

      // Initialize school stats if not exists
      if (!schoolStats[schoolName]) {
        schoolStats[schoolName] = {
          school: schoolName,
          totalInstructors: new Set(),
          pendingPayments: 0,
          approvedPayments: 0,
          rejectedPayments: 0,
          totalAmount: 0
        };
      }

      // Add instructor to school's set
      schoolStats[schoolName].totalInstructors.add(instructorId);
    });

    // Second pass: Calculate school statistics based on instructor statuses
    Object.values(instructorStats).forEach(instructor => {
      const schoolName = instructor.school;
      if (!schoolStats[schoolName]) return;

      if (instructor.hasPendingPayment) {
        schoolStats[schoolName].pendingPayments++;
      }
      if (instructor.hasApprovedPayment) {
        schoolStats[schoolName].approvedPayments++;
        schoolStats[schoolName].totalAmount += instructor.totalAmount;
      }
      if (instructor.hasRejectedPayment) {
        schoolStats[schoolName].rejectedPayments++;
      }
    });

    // Convert Sets to numbers for school stats
    Object.values(schoolStats).forEach(school => {
      school.totalInstructors = school.totalInstructors.size;
    });

    // Calculate total stats based on instructor statuses
    const totalStats = {
      totalInstructors: Object.keys(instructorStats).length,
      pendingPayments: Object.values(instructorStats).filter(i => i.hasPendingPayment).length,
      approvedPayments: Object.values(instructorStats).filter(i => i.hasApprovedPayment).length,
      rejectedPayments: Object.values(instructorStats).filter(i => i.hasRejectedPayment).length,
      totalAmount: Object.values(instructorStats).reduce((sum, instructor) => sum + instructor.totalAmount, 0)
    };

    // Get recent activity from payment history
    let recentActivity = [];
    
    // First get payment history
    const payments = await Payment.find({})
      .populate({
        path: 'instructor',
        select: 'name department school',
        populate: {
          path: 'school',
          select: 'name'
        }
      })
      .populate({
        path: 'paymentHistory.processedBy',
        select: 'name role'
      })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();
    
    // Process payment history
    const paymentActivities = payments
      .filter(payment => payment.paymentHistory && payment.paymentHistory.length > 0 && payment.instructor)
      .flatMap(payment => 
        payment.paymentHistory.map(history => ({
          type: history.status === 'approved' ? 'approved' : 
                history.status === 'rejected' ? 'rejected' : 'pending',
          instructor: payment.instructor ? payment.instructor.name : 'Unknown',
          department: payment.instructor ? payment.instructor.department : 'Unknown',
          school: payment.instructor && payment.instructor.school ? payment.instructor.school.name : 'Unknown',
          timestamp: history.processedAt,
          amount: history.amount || payment.totalPayment,
          processedBy: history.processedBy ? history.processedBy.name : 'System',
          remarks: history.remarks || ''
        }))
      )
      .filter(activity => 
        activity.instructor && 
        activity.school && 
        activity.timestamp instanceof Date && 
        !isNaN(activity.timestamp)
      );
    
    // Also get course approval history - include more activity types
    const courseActivities = courses
      .filter(course => course.approvalHistory && Array.isArray(course.approvalHistory))
      .flatMap(course => 
        course.approvalHistory
          .filter(history => {
            // Include more activity types
            return [
              'scientific-director-approved',
              'scientific-director-rejected',
              'finance-approved', 
              'finance-rejected',
              'finance-review',
              'vice-director-approved',
              'vice-director-rejected'
            ].includes(history.status);
          })
          .map(history => {
            // Determine activity type
            let type = 'pending';
            if (history.status.includes('approved')) type = 'approved';
            if (history.status.includes('rejected')) type = 'rejected';
            if (history.status.includes('review')) type = 'pending';
            
            // Determine activity category
            let category = 'finance';
            if (history.status.includes('scientific-director')) category = 'scientific';
            if (history.status.includes('vice-director')) category = 'vice';
            
            // Calculate amount if available
            const creditHours = course.creditHours || 0;
            const paymentRate = course.paymentRate || 0;
            const amount = (type === 'approved' && category === 'finance') ? creditHours * paymentRate : 0;
            
            // Create activity object
            return {
              type,
              category,
              status: history.status,
              instructor: course.instructor ? course.instructor.name : 'Unknown',
              department: course.instructor ? course.instructor.department : 'Unknown',
              school: course.instructor && course.instructor.school ? course.instructor.school.name : 'Unknown',
              timestamp: history.timestamp || history.date || new Date(),
              amount,
              course: course.title || course.code || 'Unknown Course',
              processedBy: history.user ? history.user.name : 'System',
              remarks: history.remarks || ''
            };
          })
      )
      .filter(activity => 
        activity.instructor && 
        activity.school && 
        activity.timestamp instanceof Date && 
        !isNaN(activity.timestamp)
      );
      
    // Combine both activities
    recentActivity = [...paymentActivities, ...courseActivities]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    res.status(200).json({
      status: 'success',
      data: {
        totalStats,
        schoolStats: Object.values(schoolStats),
        instructorStats: Object.values(instructorStats),
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error in getFinanceDashboardStats:', error);
    return next(new AppError('Error fetching finance dashboard statistics', 500));
  }
});

// Get courses for finance review
exports.getFinanceCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find({
    status: {
      $in: [
        'scientific-director-approved',
        'finance-review',
        'finance-approved',
        'finance-rejected'
      ]
    }
  })
  .populate({
    path: 'instructor',
    select: 'name email department school',
    populate: {
      path: 'school',
      select: 'name'
    }
  })
  .populate('school', 'name');

  // Get payments for these courses
  const courseIds = courses.map(course => course._id);
  const payments = await Payment.find({
    course: { $in: courseIds }
  });

  // Combine course and payment data
  const coursesWithPayments = courses.map(course => {
    const payment = payments.find(p => p.course.toString() === course._id.toString());
    return {
      ...course.toObject(),
      payment: payment || null
    };
  });

  res.status(200).json({
    status: 'success',
    data: {
      courses: coursesWithPayments
    }
  });
});

// Review course by finance
exports.reviewCourseByFinance = catchAsync(async (req, res, next) => {
  const { status, remarks } = req.body;
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Update course status
  course.status = status;
  
  // Add to approval history
  course.approvalHistory.push({
    status,
    approver: req.user._id,
    role: 'finance',
    date: Date.now(),
    notes: remarks
  });
  
  // If rejected, also store the rejection reason in the course's rejectionReason field
  if (status === 'finance-rejected') {
    course.rejectionReason = remarks || 'No reason provided';
    course.rejectionDate = Date.now();
  }

  await course.save();

  // Send notifications asynchronously
  const instructor = await User.findById(course.instructor).populate('school');
  const emailInstance = new Email();

  if (status === 'finance-approved') {
    // Send email in background without waiting
    emailInstance.send({
      email: instructor.email,
      subject: 'Course Approved by Finance',
      message: `Your course ${course.code}: ${course.title} has been approved by the finance department.`
    }).catch(error => {
      console.error('Error sending email:', error);
      // Don't throw error, just log it
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      course
    }
  });
});

// Handle instructor payment
// Get payment information for an instructor
exports.getInstructorPayments = catchAsync(async (req, res, next) => {
  const { instructorId } = req.params;
  const { academicYear, semester } = req.query;
  
  // Validate instructor ID
  if (!instructorId) {
    return next(new AppError('Instructor ID is required', 400));
  }
  
  try {
    // Find instructor
    const instructor = await User.findById(instructorId);
    if (!instructor) {
      return next(new AppError('Instructor not found', 404));
    }
    
    // Check if the user is the instructor or has finance role
    const isOwnRecord = req.user.role === 'instructor' && req.user._id.toString() === instructorId;
    const isFinance = req.user.role === 'finance';
    
    if (!isOwnRecord && !isFinance) {
      return next(new AppError('You do not have permission to view this payment information', 403));
    }
    
    // Find payment information
    const query = { instructor: instructorId };
    
    // Add filters if provided
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;
    
    const payment = await Payment.findOne(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        payment: payment || null
      }
    });
  } catch (error) {
    console.error('Error fetching instructor payment:', error);
    return next(new AppError('Error fetching payment information', 500));
  }
});

exports.handlePayment = catchAsync(async (req, res, next) => {
  const { totalLoad, paymentAmount, totalPayment, academicYear, semester } = req.body;
  const { instructorId } = req.params;

  // Validate input
  if (!totalLoad || totalLoad < 0) {
    return next(new AppError('Invalid total load', 400));
  }

  if (!paymentAmount || paymentAmount <= 0) {
    return next(new AppError('Invalid payment amount', 400));
  }

  if (!totalPayment || totalPayment <= 0) {
    return next(new AppError('Invalid total payment', 400));
  }

  // Verify calculation
  const calculatedTotal = Math.round((totalLoad * paymentAmount) * 100) / 100;
  const providedTotal = Math.round(totalPayment * 100) / 100;

  if (Math.abs(calculatedTotal - providedTotal) > 0.01) {
    return next(new AppError(
      `Total payment (${providedTotal}) must equal total load (${totalLoad}) multiplied by payment amount (${paymentAmount}). Expected: ${calculatedTotal}`,
      400
    ));
  }

  try {
    // Find instructor
    const instructor = await User.findById(instructorId);
    if (!instructor) {
      return next(new AppError('Instructor not found', 404));
    }

    // Generate a unique transaction reference for logging
    const tx_ref = Payment.generateTxRef(instructor._id);

    // Find existing payment
    let payment = await Payment.findOne({ 
      instructor: instructorId,
      academicYear,
      semester
    });

    if (payment) {
      // Check if payment amount is different
      if (Math.abs(payment.totalPayment - totalPayment) < 0.01) {
        return res.status(200).json({
          status: 'success',
          data: {
            payment,
            message: 'Payment already exists with the same amount'
          }
        });
      }

      try {
        // Update existing payment if amount is different
        payment = await Payment.findOneAndUpdate(
          { 
            _id: payment._id,
            instructor: instructorId,
            academicYear,
            semester
          },
          {
            $set: {
              totalLoad,
              paymentAmount,
              totalPayment,
              updatedAt: new Date()
            },
            $push: {
              paymentHistory: {
                status: 'pending',
                amount: totalPayment,
                processedBy: req.user._id,
                processedAt: new Date(),
                remarks: `Updated payment: ${totalPayment} ETB (${paymentAmount} ETB per load)`
              }
            }
          },
          { new: true, runValidators: true }
        );

        if (!payment) {
          return next(new AppError('Payment not found', 404));
        }
      } catch (updateError) {
        return next(new AppError('Error updating payment: ' + updateError.message, 500));
      }
    } else {
      try {
        // Create new payment
        payment = await Payment.create({
          instructor: instructorId,
          totalLoad,
          paymentAmount,
          totalPayment,
          academicYear,
          semester,
          tx_ref: Payment.generateTxRef(instructorId),
          status: 'pending',
          paymentHistory: [{
            status: 'pending',
            amount: totalPayment,
            processedBy: req.user._id,
            processedAt: new Date(),
            remarks: `Initial payment: ${totalPayment} ETB (${paymentAmount} ETB per load)`
          }]
        });
      } catch (createError) {
        return next(new AppError('Error creating payment: ' + createError.message, 500));
      }
    }

    // Send notification to instructor about payment
    try {
      const instructorUser = await User.findById(instructorId);
      if (instructorUser && instructorUser.email) {
        // Create notification for the instructor
        await new Email().sendPaymentNotification({
          email: instructorUser.email,
          subject: 'Payment Calculation Notification',
          name: instructorUser.name,
          totalLoad,
          paymentAmount,
          totalPayment,
          academicYear,
          semester,
          date: new Date().toLocaleDateString(),
          isUpdate: payment.paymentHistory.length > 1
        });
      }
    } catch (emailError) {
      console.error('Error sending payment notification email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      status: 'success',
      data: {
        payment
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return next(new AppError(error.message || 'Error processing payment', 500));
  }
});

// Create or update payment
exports.handlePaymentUpdate = catchAsync(async (req, res, next) => {
  const {
    totalLoad,
    paymentAmount,
    totalPayment,
    academicYear = new Date().getFullYear().toString(),
    semester = 'First',
    remarks = ''
  } = req.body;

  // Validate the input
  if (!totalLoad || totalLoad < 0) {
    return next(new AppError('Invalid total load', 400));
  }

  if (!paymentAmount || paymentAmount <= 0) {
    return next(new AppError('Invalid payment amount', 400));
  }

  if (!totalPayment || totalPayment <= 0) {
    return next(new AppError('Invalid total payment', 400));
  }

  // Verify the calculation
  const calculatedTotal = totalLoad * paymentAmount;
  if (Math.abs(calculatedTotal - totalPayment) > 0.01) { // Allow for small floating point differences
    return next(new AppError('Total payment calculation mismatch', 400));
  }

  const instructor = await User.findById(req.params.instructorId);
  if (!instructor) {
    return next(new AppError('No instructor found with that ID', 404));
  }

  let payment = await Payment.findOne({ 
    instructor: instructor._id,
    academicYear,
    semester
  });

  if (!payment) {
    // Create new payment
    payment = new Payment({
      instructor: instructor._id,
      totalLoad,
      paymentAmount,
      totalPayment,
      academicYear,
      semester,
      status: 'pending',
      paymentHistory: [{
        status: 'pending',
        amount: totalPayment,
        processedBy: req.user._id,
        processedAt: new Date(),
        remarks
      }]
    });
  } else {
    // Update existing payment
    payment.totalLoad = totalLoad;
    payment.paymentAmount = paymentAmount;
    payment.totalPayment = totalPayment;
    payment.remarks = remarks;
    payment.paymentHistory.push({
      status: 'pending',
      amount: totalPayment,
      processedBy: req.user._id,
      processedAt: new Date(),
      remarks
    });
  }

  await payment.save();

  res.status(200).json({
    status: 'success',
    data: {
      payment
    }
  });
});

// Get payment details for a course
exports.getPaymentDetails = catchAsync(async (req, res, next) => {
  const payment = await Payment.findOne({ course: req.params.id })
    .populate({
      path: 'course',
      select: 'code title instructor school department'
    })
    .populate({
      path: 'instructor',
      select: 'name email department school'
    });

  if (!payment) {
    return next(new AppError('No payment found for this course', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      payment
    }
  });
});

// Get payment details for an instructor
exports.getInstructorPayments = catchAsync(async (req, res, next) => {
  const { instructorId } = req.params;
  const { academicYear = new Date().getFullYear().toString(), semester = 'First' } = req.query;

  // Find instructor
  const instructor = await User.findById(instructorId);
  if (!instructor) {
    return next(new AppError('Instructor not found', 404));
  }

  // Find payment for instructor in current academic year and semester
  const payment = await Payment.findOne({ 
    instructor: instructorId,
    academicYear,
    semester
  });

  res.status(200).json({
    status: 'success',
    data: {
      payment
    }
  });
});
