const Course = require('../models/courseModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

exports.getAllCourses = catchAsync(async (req, res, next) => {
  // Build query
  let query = Course.find();

  // If user is instructor, only show courses from their school
  if (req.user.role === 'instructor') {
    query = query.where('school').equals(req.user.school);
  }

  if (req.user.role === 'department-head') {
    query = query.where('school').equals(req.user.school);
  }



  // Populate instructor and requestedBy details
  query = query.populate({
    path: 'instructor',
    select: 'name email department school'
  })
  .populate({
    path: 'requestedBy',
    select: 'name email department school'
  });

  // Execute query
  const courses = await query;

  res.status(200).json({
    status: 'success',
    results: courses.length,
    data: {
      courses
    }
  });
});

exports.getCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate({
      path: 'instructor',
      select: 'name email department school'
    })
    .populate({
      path: 'requestedBy',
      select: 'name email department school'
    });

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      course
    }
  });
});

exports.createCourse = catchAsync(async (req, res, next) => {
  const newCourse = await Course.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      course: newCourse
    }
  });
});

exports.updateCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  
  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Check department head permission
  await checkDepartmentHeadPermission(req, course);

  // Only allow certain roles to update courses
  if (!['admin', 'department-head'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to update courses', 403));
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      course: updatedCourse
    }
  });
});

exports.deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  
  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Check department head permission
  await checkDepartmentHeadPermission(req, course);

  // Only allow certain roles to delete courses
  if (!['admin', 'department-head'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to delete courses', 403));
  }

  await Course.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getMyCourses = catchAsync(async (req, res, next) => {
  // For instructors, get courses they're assigned to
  const courses = await Course.find({ instructor: req.user._id })
    .populate({
      path: 'instructor',
      select: 'name email department school'
    })
    .populate({
      path: 'requestedBy',
      select: 'name email department school'
    })
    .select(
      'title code school department classYear semester ' +
      'Hourfor Number_of_Sections hdp position BranchAdvisor totalHours ' +
      'instructor requestedBy'
    );

  res.status(200).json({
    status: 'success',
    results: courses.length,
    data: {
      courses
    }
  });
});

exports.assignCourse = catchAsync(async (req, res, next) => {
  const { instructorId } = req.body;
  const courseId = req.params.id;

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Check if instructor exists
  const instructor = await User.findById(instructorId);
  if (!instructor || instructor.role !== 'instructor') {
    return next(new AppError('Invalid instructor', 400));
  }

  // Check if course is already assigned
  if (course.instructor) {
    return next(new AppError('Course is already assigned to an instructor', 400));
  }

  // If user is department head, ensure they can only assign courses from their department
  if (req.user.role === 'department-head' && course.department !== req.user.department) {
    return next(new AppError('You can only assign courses from your department', 403));
  }

  // Assign the course
  course.instructor = instructorId;
  await course.save();

  res.status(200).json({
    status: 'success',
    data: {
      course
    }
  });
});

exports.selfAssignCourse = catchAsync(async (req, res, next) => {
  // Get the course
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Check if course is already assigned or pending approval
  if (course.status !== 'unassigned') {
    return next(new AppError('This course is not available for selection', 400));
  }

  // Check if course is from instructor's school
  if (course.school !== req.user.school) {
    return next(new AppError('You can only select courses from your school', 403));
  }

  // Update course status to pending and store the requesting instructor
  course.status = 'pending';
  course.requestedBy = req.user._id;
  course.approvalHistory.push({
    status: 'pending',
    approver: req.user._id,
    role: 'instructor',
    comment: 'Course selection request submitted'
  });

  await course.save();

  // Find department head of the course's department
  const departmentHead = await User.findOne({
    department: course.department,
    school: course.school,
    role: 'department-head'
  });

  // Send notification email to department head
  if (departmentHead) {
    try {
      await sendEmail({
        email: departmentHead.email,
        subject: 'Course Assignment Request Pending Approval',
        message: `A new course assignment request requires your approval:\n\n` +
                `Course: ${course.code} - ${course.title}\n` +
                `Course Department: ${course.department}\n` +
                `Instructor: ${req.user.name}\n` +
                `Instructor Department: ${req.user.department}\n\n` +
                `Please review this request in the LTMS system.`
      });
    } catch (err) {
      console.log('Error sending email:', err);
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Course selection request submitted for approval',
    data: {
      course
    }
  });
});

exports.approveCourseAssignment = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate({
      path: 'instructor',
      select: 'name email department school'
    })
    .populate({
      path: 'requestedBy',
      select: 'name email department school'
    });

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Verify the course is pending approval
  if (course.status !== 'pending') {
    return next(new AppError('This course is not pending approval', 400));
  }

  // Verify approver is department head of the same department
  if (req.user.role !== 'department-head' || 
      req.user.department !== course.department || 
      req.user.school !== course.school) {
    return next(new AppError('You are not authorized to approve this request', 403));
  }

  // Check if course is already assigned to another instructor
  const existingAssignment = await Course.findOne({
    _id: { $ne: course._id }, // exclude current course
    instructor: { $exists: true, $ne: null },
    code: course.code,
    semester: course.semester,
    classYear: course.classYear,
    status: 'approved'
  });

  if (existingAssignment) {
    return next(new AppError('This course is already assigned to another instructor for this semester', 400));
  }

  // Update course status and assign instructor
  course.status = 'approved';
  course.instructor = course.requestedBy;
  course.approvalHistory.push({
    status: 'approved',
    approver: req.user._id,
    role: 'department-head',
    comment: req.body.comment || 'Course assignment approved'
  });

  await course.save();

  // Send notification email to instructor
  const instructor = await User.findById(course.requestedBy);
  if (instructor) {
    try {
      await sendEmail({
        email: instructor.email,
        subject: 'Course Assignment Request Approved',
        message: `Your course assignment request has been approved:\n\n` +
                `Course: ${course.code} - ${course.title}\n` +
                `Department: ${course.department}\n\n` +
                `You can now access this course in the LTMS system.`
      });
    } catch (err) {
      console.log('Error sending email:', err);
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Course assignment approved',
    data: {
      course
    }
  });
});

exports.rejectCourseAssignment = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Verify the course is pending approval
  if (course.status !== 'pending') {
    return next(new AppError('This course is not pending approval', 400));
  }

  // Verify rejector is department head of the same department
  if (req.user.role !== 'department-head' || 
      req.user.department !== course.department || 
      req.user.school !== course.school) {
    return next(new AppError('You are not authorized to reject this request', 403));
  }

  // Update course status
  course.status = 'unassigned';
  course.requestedBy = undefined;
  course.approvalHistory.push({
    status: 'rejected',
    approver: req.user._id,
    role: 'department-head',
    comment: req.body.comment || 'Course assignment rejected'
  });

  await course.save();

  // Send notification email to instructor
  const instructor = await User.findById(course.requestedBy);
  if (instructor) {
    try {
      await sendEmail({
        email: instructor.email,
        subject: 'Course Assignment Request Rejected',
        message: `Your course assignment request has been rejected:\n\n` +
                `Course: ${course.code} - ${course.title}\n` +
                `Department: ${course.department}\n\n` +
                `Reason: ${req.body.comment || 'No reason provided'}`
      });
    } catch (err) {
      console.log('Error sending email:', err);
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Course assignment rejected',
    data: {
      course
    }
  });
});

exports.approveCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  const role = req.user.role;
  const approvalField = getApprovalField(role);
  
  course.approvalFlow[approvalField] = {
    approved: true,
    date: Date.now(),
    remarks: req.body.remarks
  };

  if (role === 'finance') {
    course.status = 'approved';
    
    // Notify instructor
    const instructor = await User.findById(course.instructor);
    await sendEmail({
      email: instructor.email,
      subject: 'Course Assignment Approved',
      message: `Your course assignment for ${course.title} has been fully approved.`
    });
  }

  await course.save();

  res.status(200).json({
    status: 'success',
    data: {
      course
    }
  });
});

exports.rejectCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  const role = req.user.role;
  const approvalField = getApprovalField(role);
  
  course.approvalFlow[approvalField] = {
    approved: false,
    date: Date.now(),
    remarks: req.body.remarks
  };

  course.status = 'rejected';
  
  // Notify instructor
  const instructor = await User.findById(course.instructor);
  await sendEmail({
    email: instructor.email,
    subject: 'Course Assignment Rejected',
    message: `Your course assignment for ${course.title} has been rejected. Remarks: ${req.body.remarks}`
  });

  await course.save();

  res.status(200).json({
    status: 'success',
    data: {
      course
    }
  });
});

const getApprovalField = (role) => {
  const roleMap = {
    'department-head': 'departmentHead',
    'school-dean': 'schoolDean',
    'vice-scientific-director': 'viceScientificDirector',
    'scientific-director': 'scientificDirector',
    'finance': 'finance'
  };
  return roleMap[role];
};

const checkDepartmentHeadPermission = async (req, course) => {
  if (req.user.role === 'department-head') {
    if (course.department !== req.user.department || course.school !== req.user.school) {
      throw new AppError('You do not have permission to manage courses outside your department', 403);
    }
  }
};
