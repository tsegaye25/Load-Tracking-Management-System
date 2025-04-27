const Course = require('../models/courseModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const mongoose = require('mongoose');

exports.getAllCourses = catchAsync(async (req, res, next) => {
  // Get courses based on user role
  let query = {};

  if (req.user.role === 'instructor') {
    // For instructors, get all courses in their school
    query = { school: req.user.school };
  } else if (req.user.role === 'department-head') {
    // For department heads, get all courses in their school
    query = { school: req.user.school };
  } else if (req.user.role === 'school-dean') {
    query = { school: req.user.school };
  }


  const courses = await Course.find(query)
    .populate({
      path: 'instructor',
      select: 'name email department school'
    })
    .populate({
      path: 'requestedBy',
      select: 'name email department school'
    })
    .sort({ department: 1, classYear: 1, semester: 1 });

  
  if (!courses || courses.length === 0) {
    return res.status(200).json({
      status: 'success',
      data: {
        courses: []
      }
    });
  }

  res.status(200).json({
    status: 'success',
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
  if (req.user.role === 'department-head') {
    if (course.department !== req.user.department || course.school !== req.user.school) {
      return next(new AppError('You can only delete courses from your department', 403));
    }

    // Check if course has an instructor assigned
    if (course.instructor) {
      return next(new AppError('Cannot delete a course that has an instructor assigned', 400));
    }

    // Check if course is in approval process
    if (course.status !== 'unassigned' && course.status !== 'pending') {
      return next(new AppError('Cannot delete a course that is in the approval process', 400));
    }
  }

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

  // If user is department head, ensure they can only assign courses from their school
  if (req.user.role === 'department-head' && course.school !== req.user.school) {
    return next(new AppError('You can only assign courses from your school', 403));
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
  const course = await Course.findById(req.params.id)
    .populate('requestedBy', 'name email _id');
    
  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Check if course is already assigned
  if (course.instructor) {
    return next(new AppError('This course is already assigned to an instructor', 400));
  }

  // Check if course is pending approval
  if (course.status === 'pending') {
    return next(new AppError('This course is pending approval', 400));
  }

  // Check if course was previously rejected for this instructor
  if (course.status === 'rejected' && course.requestedBy?._id.toString() === req.user._id.toString()) {
    return next(new AppError('You cannot request this course again as it was previously rejected', 400));
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
    date: Date.now(),
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
      const emailInstance = new Email();
      await emailInstance.send({
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
      const emailInstance = new Email();
      await emailInstance.send({
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
    date: Date.now(),
    comment: req.body.comment || 'Course assignment rejected'
  });

  await course.save();

  // Send notification email to instructor
  const instructor = await User.findById(course.requestedBy);
  if (instructor) {
    try {
      const emailInstance = new Email();
      await emailInstance.send({
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
    const emailInstance = new Email();
    await emailInstance.send({
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
  const emailInstance = new Email();
  await emailInstance.send({
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

// Get all courses in school (for school dean)
exports.getSchoolCourses = catchAsync(async (req, res, next) => {
  // Verify user is school dean
  if (req.user.role !== 'school-dean') {
    return next(new AppError('You do not have permission to access school courses', 403));
  }

  // Get all courses in the dean's school with assigned instructors
  const courses = await Course.find({ 
    school: req.user.school,
    instructor: { $exists: true, $ne: null }  // Only get courses with assigned instructors
  })
    .populate({
      path: 'instructor',
      select: 'name email department school totalLoad hdp position branchAdvisor'
    })
    .select('code title department school classYear semester Hourfor Number_of_Sections hdp position branchAdvisor totalHours status approvalHistory')
    .sort({ department: 1, classYear: 1, semester: 1 });

  // Group courses by department for easier frontend processing
  const coursesByDepartment = {};
  courses.forEach(course => {
    const dept = course.department;
    if (!coursesByDepartment[dept]) {
      coursesByDepartment[dept] = [];
    }
    coursesByDepartment[dept].push({
      ...course.toObject(),
      instructorName: course.instructor?.name,
      instructorEmail: course.instructor?.email,
      status: course.status,
      approvalHistory: course.approvalHistory,
      // Map workload values directly from the course
      hdpHours: course.hdp || 0,
      positionHours: course.position || 0,
      branchAdvisorHours: course.branchAdvisor || 0,
      totalWorkload: (course.hdp || 0) + (course.position || 0) + (course.branchAdvisor || 0) + (course.totalHours || 0),
      // Add computed hours for easier frontend access
      lectureHours: course.Hourfor?.lecture || 0,
      labHours: course.Hourfor?.lab || 0,
      tutorialHours: course.Hourfor?.tutorial || 0,
      lectureSections: course.Number_of_Sections?.lecture || 0,
      labSections: course.Number_of_Sections?.lab || 0,
      tutorialSections: course.Number_of_Sections?.tutorial || 0
    });
  });

  res.status(200).json({
    status: 'success',
    data: {
      school: req.user.school,
      departments: coursesByDepartment
    }
  });
});

// Get workload statistics for all instructors in school
exports.getSchoolWorkload = catchAsync(async (req, res, next) => {
  const dean = await User.findById(req.user.id);
  if (!dean || !dean.school) {
    return next(new AppError('School dean information not found', 404));
  }

  // Get all instructors in the school
  const instructors = await User.find({
    role: 'instructor',
    school: dean.school
  }).select('name email department workload');

  // Get all courses assigned to instructors in the school
  const courses = await Course.find({
    school: dean.school,
    instructor: { $exists: true }
  }).populate('instructor', 'name department');

  // Calculate statistics by department
  const departmentStats = instructors.reduce((acc, instructor) => {
    const dept = instructor.department || 'Unassigned';
    
    if (!acc[dept]) {
      acc[dept] = {
        totalInstructors: 0,
        assignedInstructors: 0,
        totalCourses: 0,
        averageWorkload: 0,
        instructors: []
      };
    }

    acc[dept].totalInstructors++;
    
    if (instructor.workload > 0) {
      acc[dept].assignedInstructors++;
    }
    acc[dept].totalCourses += instructor.coursesCount;
    acc[dept].instructors.push({
      name: instructor.name,
      email: instructor.email,
      coursesCount: instructor.coursesCount,
      workload: instructor.workload || 0
    });

    return acc;
  }, {});

  // Calculate averages
  Object.keys(departmentStats).forEach(dept => {
    const stats = departmentStats[dept];
    stats.averageWorkload = stats.totalCourses / (stats.totalInstructors || 1);
  });

  res.status(200).json({
    status: 'success',
    data: {
      school: dean.school,
      departmentStats
    }
  });
});

// School Dean course review
exports.reviewCourseByDean = catchAsync(async (req, res, next) => {
  const { status, rejectionReason } = req.body;

  // Validate status
  if (!['dean-approved', 'dean-rejected'].includes(status)) {
    return next(new AppError('Invalid status. Must be dean-approved or dean-rejected', 400));
  }

  const course = await Course.findById(req.params.id)
    .populate({
      path: 'instructor',
      select: 'name email department school'
    });

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Verify user is school dean and course belongs to their school
  if (req.user.role !== 'school-dean' || course.school !== req.user.school) {
    return next(new AppError('You do not have permission to review this course', 403));
  }

  // Update course status and rejection details if rejected
  course.status = status;
  if (status === 'dean-rejected') {
    if (!rejectionReason) {
      return next(new AppError('Rejection reason is required when rejecting a course', 400));
    }
    course.rejectionReason = rejectionReason;
    course.deanRejectionDate = new Date();
  } else {
    // Clear rejection details if approved
    course.rejectionReason = undefined;
    course.deanRejectionDate = undefined;
  }

  // Add to approval history
  course.approvalHistory.push({
    status,
    approver: req.user._id,
    role: 'school-dean',
    date: Date.now(),
    comment: status === 'dean-rejected' ? rejectionReason : 'Course approved by School Dean'
  });

  await course.save();

  // Send notifications
  try {
    if (status === 'dean-approved') {
      // Send notification to vice scientific director
      const viceDirector = await User.findOne({ role: 'vice-scientific-director' });
      if (viceDirector && viceDirector.email) {
        const emailInstance = new Email();
        const emailSubject = `Course Ready for Review: ${course.code}`;
        const emailMessage = `
          A new course is ready for your review:
          
          Course Details:
          - Code: ${course.code}
          - Title: ${course.title}
          - Department: ${course.department}
          - Instructor: ${course.instructor ? course.instructor.name : 'Not assigned'}
          
          The course has been approved by the School Dean and requires your review.
        `;

        await emailInstance.send({
          email: viceDirector.email,
          subject: emailSubject,
          message: emailMessage
        });
      }
    } else {
      // Send notification to department head
      const departmentHead = await User.findOne({ 
        role: 'department-head',
        department: course.department,
        school: course.school
      });

      if (departmentHead && departmentHead.email) {
        const emailInstance = new Email();
        const emailSubject = `Course Rejected: ${course.code}`;
        const emailMessage = `
          The following course has been rejected by the School Dean:
          
          Course Details:
          - Code: ${course.code}
          - Title: ${course.title}
          - Department: ${course.department}
          - Instructor: ${course.instructor ? course.instructor.name : 'Not assigned'}
          
          Rejection Reason:
          ${rejectionReason}
          
          Please review the feedback and make necessary changes before resubmitting.
        `;

        await emailInstance.send({
          email: departmentHead.email,
          subject: emailSubject,
          message: emailMessage
        });
      }
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
    // Don't fail the request if notifications fail
  }

  res.status(200).json({
    status: 'success',
    data: {
      course
    }
  });
});

// Resubmit rejected course to dean
exports.resubmitToDean = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate({
      path: 'instructor',
      select: 'name email department school'
    });

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Verify user is department head and course belongs to their department
  if (req.user.role !== 'department-head' || 
      course.department !== req.user.department || 
      course.school !== req.user.school) {
    return next(new AppError('You do not have permission to resubmit this course', 403));
  }

  // Verify course was previously rejected by dean
  if (course.status !== 'dean-rejected') {
    return next(new AppError('Only dean-rejected courses can be resubmitted', 400));
  }

  // Update course status to pending dean review
  course.status = 'dean-review';
  course.deanRejectionDate = undefined;
  
  // Add to approval history
  course.approvalHistory.push({
    status: 'resubmitted-to-dean',
    approver: req.user._id,
    role: 'department-head',
    date: Date.now(),
    comment: 'Course resubmitted after addressing dean\'s feedback'
  });

  await course.save();

  // Send notification to school dean
  const schoolDean = await User.findOne({ 
    role: 'school-dean',
    school: course.school
  });

  if (schoolDean && schoolDean.email) {
    const emailInstance = new Email();
    await emailInstance.send({
      email: schoolDean.email,
      subject: `Course Resubmitted for Review: ${course.code}`,
      message: `
        The following course has been resubmitted for your review:
        
        Course Details:
        - Code: ${course.code}
        - Title: ${course.title}
        - Department: ${course.department}
        - Instructor: ${course.instructor ? course.instructor.name : 'Not assigned'}
        
        The department head has addressed the previous rejection feedback and resubmitted the course for your review.
        Please review the updated course details.
      `
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      course
    }
  });
});

// Get courses for vice scientific director review
exports.getViceDirectorCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      instructor: { $exists: true, $ne: null },
      $or: [
        { status: 'dean-approved' },
        { status: 'vice-director-approved' },
        { status: 'vice-director-rejected' },
        { status: 'scientific-director-approved' },
        { status: 'scientific-director-rejected' },
        { status: 'finance-review' },
        { status: 'finance-approved' },
        { status: 'finance-rejected' }
      ]
    })
    .populate({
      path: 'instructor',
      select: 'name email department school',
      match: { role: 'instructor' }
    })
    .populate({
      path: 'requestedBy',
      select: 'name email department'
    })
    .lean();

    // Filter out courses where instructor population failed
    const validCourses = courses.filter(course => course.instructor);

    // Calculate total workload for each instructor
    const instructorWorkloads = validCourses.reduce((acc, course) => {
      const instructorId = course.instructor._id.toString();
      if (!acc[instructorId]) {
        acc[instructorId] = {
          instructor: course.instructor,
          totalWorkload: 0,
          courses: []
        };
      }

      // Calculate course workload (only course-specific hours)
      const workload = (
        (course.Hourfor?.creaditHours || 0) +
        (course.Hourfor?.lecture || 0) +
        (course.Hourfor?.lab || 0) +
        (course.Hourfor?.tutorial || 0)
      );

      acc[instructorId].totalWorkload += workload;
      acc[instructorId].courses.push(course);

      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      data: validCourses,
      instructorWorkloads: Object.values(instructorWorkloads)
    });
  } catch (error) {
    console.error('Error in getViceDirectorCourses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching courses'
    });
  }
};

// Review course by vice scientific director
exports.reviewCourseByViceDirector = catchAsync(async (req, res, next) => {
  const { action, comment, instructorId } = req.body;
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name email department school');

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Only reject if this course belongs to the specified instructor
  if (action === 'reject' && instructorId && 
      course.instructor._id.toString() !== instructorId.toString()) {
    return next(new AppError('Course does not belong to the specified instructor', 400));
  }

  // Update course status based on action
  course.status = action === 'approve' ? 'vice-director-approved' : 'vice-director-rejected';
  
  // Add to approval history
  course.approvalHistory.push({
    status: course.status,
    approver: req.user._id,
    role: 'vice-scientific-director',
    date: Date.now(),
    comment: comment || 'Reviewed by Vice Scientific Director'
  });

  await course.save();

  // Try to send notification email, but don't block if it fails
  try {
    const emailInstance = new Email();
    
    if (action === 'approve') {
      // Notify scientific director
      const scientificDirector = await User.findOne({ role: 'scientific-director' });
      if (scientificDirector && scientificDirector.email) {
        await emailInstance.send({
          email: scientificDirector.email,
          subject: `Course ${course.code} Ready for Review`,
          message: `Course ${course.code} has been approved by Vice Scientific Director and is ready for your review.`
        }).catch(error => {
          console.error('Failed to send email to scientific director:', error);
        });
      }
    } else {
      // Notify school dean and instructor about rejection
      const dean = await User.findOne({ 
        role: 'school-dean',
        school: course.instructor.school
      });

      if (dean && dean.email) {
        await emailInstance.send({
          email: dean.email,
          subject: `Course ${course.code} Rejected by Vice Scientific Director`,
          message: `Course ${course.code} has been rejected.\n\nReason: ${comment}`
        }).catch(error => {
          console.error('Failed to send email to dean:', error);
        });
      }

      if (course.instructor && course.instructor.email) {
        await emailInstance.send({
          email: course.instructor.email,
          subject: `Course ${course.code} Rejected by Vice Scientific Director`,
          message: `Your course ${course.code} has been rejected.\n\nReason: ${comment}`
        }).catch(error => {
          console.error('Failed to send email to instructor:', error);
        });
      }
    }
  } catch (emailError) {
    console.error('Error sending notification emails:', emailError);
    // Don't throw the error, continue with the response
  }

  res.status(200).json({
    status: 'success',
    data: {
      course
    }
  });
});

// Bulk approve courses by vice director
exports.bulkApproveByViceDirector = catchAsync(async (req, res, next) => {
  const { courseIds, action } = req.body;
  const instructorId = req.params.instructorId;

  // Validate input
  if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
    return next(new AppError('Please provide valid course IDs', 400));
  }

  if (!['approve', 'reject'].includes(action)) {
    return next(new AppError('Invalid action', 400));
  }

  // Get all courses
  const courses = await Course.find({
    _id: { $in: courseIds },
    instructor: instructorId,
    status: 'dean-approved' // Only allow dean-approved courses
  }).populate({
    path: 'instructor',
    select: 'name email department school'
  });

  if (courses.length === 0) {
    return next(new AppError('No eligible courses found for approval', 404));
  }

  const newStatus = action === 'approve' ? 'vice-director-approved' : 'vice-director-rejected';
  const historyEntry = {
    status: newStatus,
    date: new Date(),
    notes: req.body.notes || '',
    reviewedBy: req.user._id
  };

  // Update all courses
  const updatedCourses = await Promise.all(
    courses.map(async (course) => {
      course.status = newStatus;
      course.approvalHistory.push(historyEntry);
      return course.save();
    })
  );

  // Send notifications
  try {
    const emailInstance = new Email();
    const instructor = courses[0].instructor;

    // Notify instructor
    await emailInstance.sendCourseStatusUpdate({
      email: instructor.email,
      name: instructor.name,
      courses: courses.map(c => c.code).join(', '),
      status: newStatus,
      notes: historyEntry.notes
    });

    // If approved, notify Scientific Director
    if (action === 'approve') {
      const scientificDirectors = await User.find({ role: 'scientific-director' });
      await Promise.all(
        scientificDirectors.map(director =>
          emailInstance.sendCourseForReview({
            email: director.email,
            name: director.name,
            instructorName: instructor.name,
            department: instructor.department,
            school: instructor.school,
            courses: courses.map(c => c.code).join(', ')
          })
        )
      );
    }
  } catch (error) {
    console.error('Email notification error:', error);
  }

  res.status(200).json({
    status: 'success',
    message: `Successfully ${action}d all courses`,
    data: {
      courses: updatedCourses
    }
  });
});

exports.getViceDirectorDashboardStats = async (req, res) => {
  try {
    // Get all relevant courses
    const courses = await Course.find({
      status: {
        $in: [
          'dean-approved',
          'vice-director-approved',
          'vice-director-rejected'
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
    .populate('school', 'name')
    .lean();

    // Calculate overall stats
    const totalCourses = courses.length;
    const pendingReview = courses.filter(c => c.status === 'dean-approved').length;
    const approved = courses.filter(c => c.status === 'vice-director-approved').length;
    const rejected = courses.filter(c => c.status === 'vice-director-rejected').length;

    // Calculate school stats
    const schoolStats = courses.reduce((acc, course) => {
      const schoolName = course.school?.name || 'Unassigned';
      
      if (!acc[schoolName]) {
        acc[schoolName] = {
          school: schoolName,
          totalCourses: 0,
          pendingReview: 0,
          approved: 0,
          rejected: 0
        };
      }

      acc[schoolName].totalCourses++;
      
      if (course.status === 'dean-approved') {
        acc[schoolName].pendingReview++;
      } else if (course.status === 'vice-director-approved') {
        acc[schoolName].approved++;
      } else if (course.status === 'vice-director-rejected') {
        acc[schoolName].rejected++;
      }

      return acc;
    }, {});

    // Status distribution for pie chart
    const statusDistribution = [
      { name: 'Pending Review', value: pendingReview },
      { name: 'Approved', value: approved },
      { name: 'Rejected', value: rejected }
    ];

    // Get recent activity
    const recentActivity = courses
      .filter(course => course.approvalHistory && course.approvalHistory.length > 0)
      .flatMap(course => 
        course.approvalHistory.map(history => ({
          course: `${course.code} - ${course.title}`,
          department: course.instructor?.department || 'Unassigned',
          school: course.school?.name || 'Unassigned',
          type: history.status === 'vice-director-approved' ? 'approved' : 'rejected',
          timestamp: history.date
        }))
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.status(200).json({
      status: 'success',
      data: {
        totalCourses,
        pendingReview,
        approved,
        rejected,
        schoolStats: Object.values(schoolStats),
        statusDistribution,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error in getViceDirectorDashboardStats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching dashboard statistics'
    });
  }
};

exports.getScientificDirectorCourses = async (req, res) => {
  try {
    // First, check how many courses exist with different statuses
    const viceDirectorApprovedCount = await Course.countDocuments({
      status: 'vice-director-approved'
    });
    
    const scientificDirectorRejectedCount = await Course.countDocuments({
      status: 'scientific-director-rejected'
    });
    
    console.log(`Found ${viceDirectorApprovedCount} courses with vice-director-approved status`);
    console.log(`Found ${scientificDirectorRejectedCount} courses with scientific-director-rejected status`);
    
    // Query to include all relevant statuses for Scientific Director
    const query = {
      instructor: { $exists: true, $ne: null },
      status: { $in: [
        'vice-director-approved',       // Courses approved by Vice Director awaiting Scientific Director review
        'scientific-director-approved',  // Courses already approved by Scientific Director
        'scientific-director-rejected',  // Courses rejected by Scientific Director
        'finance-approved',             // Courses that passed through Scientific Director and were approved by Finance
        'finance-rejected',             // Courses that passed through Scientific Director and were rejected by Finance
        'finance-review'                // Courses that passed through Scientific Director and are under Finance review
      ]}
    };
    
    const courses = await Course.find(query)
    .populate({
      path: 'instructor',
      select: 'name email department school',
      populate: {
        path: 'school',
        select: 'name'
      }
    })
    .populate('school', 'name')
    .populate({
      path: 'approvalHistory.approver',
      select: 'name email role'
    })
    .lean();

    // Filter out courses where instructor population failed
    const validCourses = courses.filter(course => course.instructor);

    // Calculate total workload for each instructor
    const instructorWorkloads = validCourses.reduce((acc, course) => {
      const instructorId = course.instructor._id.toString();
      if (!acc[instructorId]) {
        acc[instructorId] = {
          _id: course.instructor._id,
          name: course.instructor.name,
          email: course.instructor.email,
          department: course.instructor.department,
          school: course.instructor.school,
          totalWorkload: 0,
          courses: []
        };
      }

      // Calculate course workload
      const workload = (
        (course.Hourfor?.creaditHours || 0) +
        (course.Hourfor?.lecture || 0) +
        (course.Hourfor?.lab || 0) +
        (course.Hourfor?.tutorial || 0) +
        (course.hdp || 0) +
        (course.position || 0) +
        (course.branchAdvisor || 0)
      );
      
      course.totalHours = workload;
      acc[instructorId].totalWorkload += workload;
      acc[instructorId].courses.push(course);

      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      data: {
        instructorWorkloads: Object.values(instructorWorkloads)
      }
    });
  } catch (error) {
    console.error('Error in getScientificDirectorCourses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching courses for scientific director review'
    });
  }
};

exports.reviewCourseByScientificDirector = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { action, notes, rejectionReason } = req.body;
    const rejectionMessage = rejectionReason || notes || 'No reason provided';

    // Find all courses for the instructor that are in vice-director-approved status
    const courses = await Course.find({
      instructor: instructorId,
      status: 'vice-director-approved'
    });

    if (!courses.length) {
      return res.status(404).json({
        status: 'error',
        message: 'No courses found for review'
      });
    }

    const newStatus = action === 'approve' ? 'scientific-director-approved' : 'scientific-director-rejected';
  
    // Update each course individually to properly handle approval history
    for (const course of courses) {
      // Update status
      course.status = newStatus;
      course.scientificDirectorApproval = {
        status: newStatus,
        approvedBy: req.user._id,
        approvedAt: Date.now()
      };
      
      // Add to approval history
      course.approvalHistory.push({
        status: newStatus,
        approver: req.user._id,
        role: 'scientific-director',
        date: Date.now(),
        comment: action === 'approve' 
          ? 'Approved by Scientific Director' 
          : `Rejected by Scientific Director: ${rejectionMessage}`
      });
      
      // Add rejection reason if rejected
      if (action === 'reject') {
        course.rejectionReason = rejectionMessage;
      }
      
      // Save the course
      await course.save();
    }
  
    // No need for bulkWrite since we're saving each course individually
    // Send notifications
    const instructor = await User.findById(instructorId).populate('school');
    const viceDirector = await User.findOne({ role: 'vice-scientific-director' });

    if (action === 'approve') {
      // Notify instructor
      const emailInstance = new Email();
      await emailInstance.send({
        email: instructor.email,
        subject: 'Course Final Approval',
        message: `
          Your courses have been approved by the Scientific Director.
          
          Courses:
          ${courses.map(course => `- ${course.code}: ${course.title}`).join('\n')}
          
          Status: Final Approval Complete
        `
      });
    } else {
      // Notify vice director about rejection
      const emailInstance = new Email();
      await emailInstance.send({
        email: viceDirector.email,
        subject: 'Courses Returned for Review',
        message: `
          The following courses have been returned by the Scientific Director:
          
          Instructor: ${instructor.name}
          School: ${instructor.school.name}
          
          Courses:
          ${courses.map(course => `- ${course.code}: ${course.title}`).join('\n')}
          
          Feedback: ${notes}
          
          Please review and make necessary adjustments.
        `
      });
    }

    res.status(200).json({
      status: 'success',
      message: action === 'approve' ? 'Courses approved successfully' : 'Courses returned to Vice Director',
      data: courses
    });
  } catch (error) {
    console.error('Error in reviewCourseByScientificDirector:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error processing course review'
    });
  }
};

exports.getScientificDirectorDashboardStats = async (req, res) => {
  try {
    // Get all relevant courses
    const courses = await Course.find({
      status: {
        $in: [
          'vice-director-approved',
          'scientific-director-approved',
          'scientific-director-rejected'
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
    .populate('school', 'name')
    .lean();

    // Calculate overall stats
    const totalCourses = courses.length;
    const pendingReview = courses.filter(c => c.status === 'vice-director-approved').length;
    const approved = courses.filter(c => c.status === 'scientific-director-approved').length;
    const rejected = courses.filter(c => c.status === 'scientific-director-rejected').length;

    // Calculate school stats
    const schoolStats = courses.reduce((acc, course) => {
      const schoolName = course.school?.name || 'Unassigned';
      
      if (!acc[schoolName]) {
        acc[schoolName] = {
          school: schoolName,
          totalCourses: 0,
          pendingReview: 0,
          approved: 0,
          rejected: 0
        };
      }

      acc[schoolName].totalCourses++;
      
      if (course.status === 'vice-director-approved') {
        acc[schoolName].pendingReview++;
      } else if (course.status === 'scientific-director-approved') {
        acc[schoolName].approved++;
      } else if (course.status === 'scientific-director-rejected') {
        acc[schoolName].rejected++;
      }

      return acc;
    }, {});

    // Status distribution for pie chart
    const statusDistribution = [
      { name: 'Pending Review', value: pendingReview },
      { name: 'Approved', value: approved },
      { name: 'Rejected', value: rejected }
    ];

    // Get recent activity
    const recentActivity = courses
      .filter(course => course.approvalHistory && course.approvalHistory.length > 0)
      .flatMap(course => 
        course.approvalHistory.map(history => ({
          course: `${course.code} - ${course.title}`,
          department: course.instructor?.department || 'Unassigned',
          school: course.school?.name || 'Unassigned',
          type: history.status === 'scientific-director-approved' ? 'approved' : 'rejected',
          timestamp: history.date
        }))
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.status(200).json({
      status: 'success',
      data: {
        totalCourses,
        pendingReview,
        approved,
        rejected,
        schoolStats: Object.values(schoolStats),
        statusDistribution,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error in getScientificDirectorDashboardStats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching dashboard statistics'
    });
  }
};

exports.getApprovedInstructors = catchAsync(async (req, res, next) => {
  // Get all approved courses
  const approvedCourses = await Course.find({ 
    status: 'finance-approved',
    instructor: { $exists: true }
  }).populate({
    path: 'instructor',
    select: 'name email department school'
  });

  // Group courses by instructor
  const instructorMap = new Map();
  
  approvedCourses.forEach(course => {
    if (!course.instructor) return;
    
    const instructorId = course.instructor._id.toString();
    if (!instructorMap.has(instructorId)) {
      instructorMap.set(instructorId, {
        _id: course.instructor._id,
        name: course.instructor.name,
        email: course.instructor.email,
        department: course.instructor.department,
        school: course.instructor.school,
        courses: [],
        totalLoad: 0
      });
    }

    const instructor = instructorMap.get(instructorId);
    instructor.courses.push(course);

    // Calculate load for this course
    const creditHours = course.creditHours;
    const lectureLoad = (course.Hourfor?.lecture || 0) * (course.Number_of_Sections?.lecture || 0);
    const labLoad = (course.Hourfor?.lab || 0) * (course.Number_of_Sections?.lab || 0);
    const tutorialLoad = (course.Hourfor?.tutorial || 0) * (course.Number_of_Sections?.tutorial || 0);
    
    instructor.totalLoad += creditHours + lectureLoad + labLoad + tutorialLoad;
  });

  // Convert map to array
  const instructors = Array.from(instructorMap.values());

  res.status(200).json({
    status: 'success',
    data: instructors
  });
});

exports.bulkApproveByScientificDirector = catchAsync(async (req, res, next) => {
  const { instructorId, action, notes, rejectionReason } = req.body;
  const rejectionMessage = rejectionReason || notes || 'No reason provided';

  // Validate input
  if (!['approve', 'reject'].includes(action)) {
    return next(new AppError('Invalid action. Must be either approve or reject', 400));
  }

  if (!instructorId) {
    return next(new AppError('Instructor ID is required', 400));
  }

  // Find all courses for this instructor that are in vice-director-approved or finance-rejected status
  const courses = await Course.find({
    instructor: instructorId,
    status: { $in: ['vice-director-approved', 'finance-rejected'] }
  }).populate({
    path: 'instructor',
    select: 'name email department school'
  });

  if (!courses || courses.length === 0) {
    return next(new AppError('No eligible courses found for this instructor', 404));
  }

  const newStatus = action === 'approve' ? 'scientific-director-approved' : 'scientific-director-rejected';
  
  // Update each course individually to properly handle approval history
  for (const course of courses) {
    // Update status
    course.status = newStatus;
    course.scientificDirectorApproval = {
      status: newStatus,
      approvedBy: req.user._id,
      approvedAt: Date.now()
    };
    
    // Add to approval history
    course.approvalHistory.push({
      status: newStatus,
      approver: req.user._id,
      role: 'scientific-director',
      date: Date.now(),
      comment: action === 'approve' 
        ? 'Approved by Scientific Director' 
        : `Rejected by Scientific Director: ${rejectionMessage}`
    });
    
    // Add rejection reason if rejected
    if (action === 'reject') {
      course.rejectionReason = rejectionMessage;
    }
    
    // Save the course
    await course.save();
  }
  
  // No need for bulkWrite since we're saving each course individually
  // Send notifications
  const emailInstance = new Email();
  const instructor = courses[0].instructor;

  if (action === 'approve') {
    // Notify instructor
    await emailInstance.sendCourseApprovalNotification({
      email: instructor.email,
      name: instructor.name,
      approverRole: 'Scientific Director',
      courses: courses.map(c => c.code).join(', ')
    });

    // Notify finance
    const financeUsers = await User.find({ role: 'finance' });
    await Promise.all(financeUsers.map(user => 
      emailInstance.sendNewCourseNotification({
        email: user.email,
        name: user.name,
        courseCodes: courses.map(c => c.code).join(', '),
        instructorName: instructor.name
      })
    ));
  } else {
    // Notify vice director about rejection
    const viceDirectors = await User.find({ role: 'vice-scientific-director' });
    await Promise.all(viceDirectors.map(user => 
      emailInstance.sendCourseRejectionNotification({
        email: user.email,
        name: user.name,
        courseCodes: courses.map(c => c.code).join(', '),
        instructorName: instructor.name,
        rejectedBy: 'Scientific Director',
        reason: rejectionMessage
      })
    ));
  }

  res.status(200).json({
    status: 'success',
    message: `Successfully ${action === 'approve' ? 'approved' : 'rejected'} ${courses.length} courses`,
    data: {
      courses
    }
  });
});

// Department Head course review
exports.reviewCourseByDepartmentHead = catchAsync(async (req, res, next) => {
  const { status, rejectionReason } = req.body;

  // Validate status and rejection reason
  if (!['approved', 'rejected'].includes(status)) {
    return next(new AppError('Invalid status. Must be approved or rejected', 400));
  }

  if (status === 'rejected' && !rejectionReason?.trim()) {
    return next(new AppError('Rejection reason is required when rejecting a course', 400));
  }

  const course = await Course.findById(req.params.id)
    .populate({
      path: 'instructor',
      select: 'name email department school'
    })
    .populate({
      path: 'requestedBy',
      select: 'name email department school currentWorkload'
    });

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Verify user is department head and course belongs to their department
  if (req.user.role !== 'department-head' || 
      course.department !== req.user.department || 
      course.school !== req.user.school) {
    return next(new AppError('You do not have permission to review this course', 403));
  }

  // Update course status and handle instructor assignment
  course.status = status;
  
  if (status === 'approved') {
    // If approved, assign the requesting instructor to the course
    if (!course.requestedBy) {
      return next(new AppError('No instructor has requested this course', 400));
    }
    
    course.instructor = course.requestedBy._id;
    course.requestedBy = undefined; // Clear the request
    
    // Add to approval history
    course.approvalHistory.push({
      status: 'approved',
      approver: req.user._id,
      role: 'department-head',
      date: Date.now(),
      comment: `Course assigned to ${course.instructor.name}`,
      department: req.user.department,
      school: req.user.school
    });

    // Update instructor's workload if needed
    try {
      await User.findByIdAndUpdate(course.instructor, {
        $inc: { currentWorkload: course.creditHours }
      });
    } catch (error) {
      console.error('Error updating instructor workload:', error);
    }
  } else {
    // Store rejection details including the rejected instructor's info
    const rejectedInstructor = course.requestedBy;
    course.rejectionReason = rejectionReason.trim();
    course.rejectionDate = new Date();
    course.rejectedBy = {
      user: req.user._id,
      role: 'department-head',
      date: new Date()
    };
    course.rejectedInstructor = {
      id: rejectedInstructor._id,
      name: rejectedInstructor.name,
      email: rejectedInstructor.email,
      department: rejectedInstructor.department
    };
    
    // Clear requestedBy after storing rejection info
    course.requestedBy = undefined;
    
    // Add to approval history
    course.approvalHistory.push({
      status: 'rejected',
      approver: req.user._id,
      role: 'department-head',
      date: Date.now(),
      comment: `Rejected request from ${rejectedInstructor.name}: ${rejectionReason}`,
      department: req.user.department,
      school: req.user.school
    });
  }

  await course.save();

  // Send notifications based on the decision
  try {
    const emailInstance = new Email();
    
    if (status === 'approved') {
      // 1. Notify the approved instructor
      if (course.instructor && course.instructor.email) {
        await emailInstance.send({
          email: course.instructor.email,
          subject: `Course Assignment Approved: ${course.code}`,
          message: `
            Dear ${course.instructor.name},

            Your request to teach the following course has been approved:
            
            Course Details:
            - Code: ${course.code}
            - Title: ${course.title}
            - Department: ${course.department}
            - School: ${course.school}
            - Credit Hours: ${course.creditHours}
            
            Review Details:
            - Approved By: ${req.user.name}
            - Department: ${req.user.department}
            - Date: ${new Date().toLocaleString()}
            
            The course has been added to your teaching load.
            
            Best regards,
            LTMS System
          `
        });
      }

      // 2. Notify school dean about the new course assignment
      const schoolDean = await User.findOne({ 
        role: 'school-dean',
        school: course.school
      });

      if (schoolDean && schoolDean.email) {
        await emailInstance.send({
          email: schoolDean.email,
          subject: 'New Course Assignment: ${course.code}',
          message: `
            Dear School Dean,

            A new course assignment has been approved:
            
            Course Details:
            - Code: ${course.code}
            - Title: ${course.title}
            - Department: ${course.department}
            - School: ${course.school}
            - Credit Hours: ${course.creditHours}
            
            Instructor Details:
            - Name: ${course.instructor.name}
            - Department: ${course.instructor.department}
            
            Approved By:
            - Name: ${req.user.name}
            - Department: ${req.user.department}
            - Date: ${new Date().toLocaleString()}
            
            Best regards,
            LTMS System
          `
        });
      }
    } else {
      // 1. Send rejection notification to the requesting instructor
      if (course.rejectedInstructor.email) {
        await emailInstance.send({
          email: course.rejectedInstructor.email,
          subject: `Course Request Rejected: ${course.code}`,
          message: `
            Dear ${course.rejectedInstructor.name},

            Your request to teach the following course has been rejected:
            
            Course Details:
            - Code: ${course.code}
            - Title: ${course.title}
            - Department: ${course.department}
            - School: ${course.school}
            - Credit Hours: ${course.creditHours}
            
            Review Details:
            - Reviewed By: ${req.user.name}
            - Department: ${req.user.department}
            - Date: ${new Date().toLocaleString()}
            
            Rejection Reason:
            ${rejectionReason}
            
            If you have any questions, please contact your Department Head.
            
            Best regards,
            LTMS System
          `
        });
      }

      // 2. Notify other eligible instructors that the course is available
      const eligibleInstructors = await User.find({
        role: 'instructor',
        department: course.department,
        school: course.school,
        _id: { $ne: course.rejectedInstructor.id } // Exclude rejected instructor
      });

      for (const instructor of eligibleInstructors) {
        await emailInstance.send({
          email: instructor.email,
          subject: `Course Available for Request: ${course.code}`,
          message: `
            Dear ${instructor.name},

            A course in your department is available for teaching request:
            
            Course Details:
            - Code: ${course.code}
            - Title: ${course.title}
            - Department: ${course.department}
            - School: ${course.school}
            - Credit Hours: ${course.creditHours}
            
            If you are interested in teaching this course, you can submit a request through the LTMS system.
            
            Best regards,
            LTMS System
          `
        });
      }
    }
  } catch (error) {
    console.error('Error sending notification emails:', error);
  }

  res.status(200).json({
    status: 'success',
    data: {
      course
    }
  });
});

// Bulk review courses by dean
exports.bulkReviewCoursesByDean = catchAsync(async (req, res, next) => {
  const { courseIds } = req.body;

  if (!courseIds || !Array.isArray(courseIds)) {
    return next(new AppError('Please provide an array of course IDs', 400));
  }

  const courses = await Course.find({ 
    _id: { $in: courseIds },
    school: req.user.school
  }).populate({
    path: 'instructor',
    select: 'name email department school'
  });

  // Verify all courses belong to dean's school
  if (courses.length !== courseIds.length) {
    return next(new AppError('Some courses were not found or do not belong to your school', 404));
  }

  // Update all courses in a single transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update all courses
    const bulkOps = courses.map(course => ({
      updateOne: {
        filter: { _id: course._id },
        update: {
          $set: {
            status: 'dean-approved',
            rejectionReason: undefined,
            deanRejectionDate: undefined
          },
          $push: {
            approvalHistory: {
              status: 'dean-approved',
              approver: req.user._id,
              role: 'school-dean',
              date: Date.now(),
              comment: 'Course approved by School Dean'
            }
          }
        }
      }
    }));

    await Course.bulkWrite(bulkOps, { session });
    await session.commitTransaction();

    // Try to send notification email, but don't block if it fails
    try {
      const viceDirector = await User.findOne({ role: 'vice-scientific-director' });
      if (viceDirector && viceDirector.email) {
        const emailInstance = new Email();
        await emailInstance.send({
          email: viceDirector.email,
          subject: `Multiple Courses Ready for Review`,
          message: `
            ${courses.length} courses have been approved by the School Dean and are ready for your review.
            
            Course Details:
            ${courses.map(course => `- ${course.code}: ${course.title}`).join('\n')}
          `
        }).catch(error => {
          console.error('Email notification failed:', error);
          // Don't throw the error, just log it
        });
      }
    } catch (emailError) {
      console.error('Error sending notification:', emailError);
      // Don't throw the error, continue with the response
    }

    res.status(200).json({
      status: 'success',
      message: `Successfully approved ${courses.length} courses`,
      data: {
        courses: courses.map(course => course._id)
      }
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// Resubmit rejected courses to Vice Director
exports.resubmitToViceDirector = async (req, res) => {
  try {
    const { courseIds } = req.body;

    // Update all specified courses
    const updateResult = await Course.updateMany(
      {
        _id: { $in: courseIds },
        status: 'vice-director-rejected' // Only update if current status is rejected
      },
      {
        $set: { status: 'dean-approved' }, // Set status to dean-approved to send back to vice director
        $push: {
          approvalHistory: {
            status: 'dean-approved',
            date: new Date(),
            comment: 'Resubmitted to Vice Scientific Director for review',
            user: req.user._id
          }
        }
      }
    );

    if (updateResult.modifiedCount > 0) {
      // Get the updated courses to send notifications
      const updatedCourses = await Course.find({ _id: { $in: courseIds } })
        .populate('instructor')
        .populate('department');

      // Send notifications or emails here if needed
      
      res.json({
        success: true,
        message: `Successfully resubmitted ${updateResult.modifiedCount} courses to Vice Scientific Director`,
        modifiedCount: updateResult.modifiedCount
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'No courses were resubmitted. Please check if the courses are in the correct state.'
      });
    }
  } catch (error) {
    console.error('Error resubmitting courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error resubmitting courses to Vice Scientific Director',
      error: error.message
    });
  }
};

// Reject courses and return to department head
exports.rejectToDepartment = async (req, res) => {
  try {
    const { courseIds, comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Update all specified courses
    const updateResult = await Course.updateMany(
      {
        _id: { $in: courseIds }
      },
      {
        $set: { status: 'dean-rejected' },
        $push: {
          approvalHistory: {
            status: 'dean-rejected',
            date: new Date(),
            comment: comment,
            user: req.user._id
          }
        }
      }
    );

    if (updateResult.modifiedCount > 0) {
      // Get the updated courses to send notifications
      const updatedCourses = await Course.find({ _id: { $in: courseIds } })
        .populate('instructor')
        .populate('department');

      // Send notifications or emails here if needed
      
      res.json({
        success: true,
        message: `Successfully rejected ${updateResult.modifiedCount} courses and returned to Department Head`,
        modifiedCount: updateResult.modifiedCount
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'No courses were rejected. Please check if the courses are in the correct state.'
      });
    }
  } catch (error) {
    console.error('Error rejecting courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting courses',
      error: error.message
    });
  }
};

exports.getViceDirectorDashboardStats = async (req, res) => {
  try {
    // Get all relevant courses
    const courses = await Course.find({
      status: {
        $in: [
          'dean-approved',
          'vice-director-approved',
          'vice-director-rejected'
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
    .populate('school', 'name')
    .lean();

    // Calculate overall stats
    const totalCourses = courses.length;
    const pendingReview = courses.filter(c => c.status === 'dean-approved').length;
    const approved = courses.filter(c => c.status === 'vice-director-approved').length;
    const rejected = courses.filter(c => c.status === 'vice-director-rejected').length;

    // Calculate school stats
    const schoolStats = courses.reduce((acc, course) => {
      const schoolName = course.school?.name || 'Unassigned';
      
      if (!acc[schoolName]) {
        acc[schoolName] = {
          school: schoolName,
          totalCourses: 0,
          pendingReview: 0,
          approved: 0,
          rejected: 0
        };
      }

      acc[schoolName].totalCourses++;
      
      if (course.status === 'dean-approved') {
        acc[schoolName].pendingReview++;
      } else if (course.status === 'vice-director-approved') {
        acc[schoolName].approved++;
      } else if (course.status === 'vice-director-rejected') {
        acc[schoolName].rejected++;
      }

      return acc;
    }, {});

    // Status distribution for pie chart
    const statusDistribution = [
      { name: 'Pending Review', value: pendingReview },
      { name: 'Approved', value: approved },
      { name: 'Rejected', value: rejected }
    ];

    // Get recent activity
    const recentActivity = courses
      .filter(course => course.approvalHistory && course.approvalHistory.length > 0)
      .flatMap(course => 
        course.approvalHistory.map(history => ({
          course: `${course.code} - ${course.title}`,
          department: course.instructor?.department || 'Unassigned',
          school: course.school?.name || 'Unassigned',
          type: history.status === 'vice-director-approved' ? 'approved' : 'rejected',
          timestamp: history.date
        }))
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.status(200).json({
      status: 'success',
      data: {
        totalCourses,
        pendingReview,
        approved,
        rejected,
        schoolStats: Object.values(schoolStats),
        statusDistribution,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error in getViceDirectorDashboardStats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching dashboard statistics'
    });
  }
};

// Bulk approve by Vice Director
exports.bulkApproveByViceDirector = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { courseIds } = req.body;

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide valid course IDs'
      });
    }

    // Update all courses
    const updatePromises = courseIds.map(async (courseId) => {
      const course = await Course.findById(courseId);
      
      if (!course) {
        throw new Error(`Course with ID ${courseId} not found`);
      }

      if (course.status !== 'dean-approved') {
        throw new Error(`Course with ID ${courseId} is not in the correct status for approval`);
      }

      course.status = 'vice-director-approved';
      course.approvalHistory.push({
        status: 'vice-director-approved',
        approver: req.user._id,
        role: 'vice-scientific-director',
        comment: 'Approved by Vice Scientific Director'
      });

      return course.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      status: 'success',
      message: `Successfully approved all courses for instructor ${instructorId}`
    });
  } catch (error) {
    console.error('Error in bulkApproveByViceDirector:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error approving courses'
    });
  }
};

// Bulk resubmit to Scientific Director for courses rejected by Scientific Director
exports.bulkResubmitToScientificDirector = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { courseIds } = req.body;

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide valid course IDs'
      });
    }

    // Update all courses
    const updatePromises = courseIds.map(async (courseId) => {
      const course = await Course.findById(courseId);
      
      if (!course) {
        throw new Error(`Course with ID ${courseId} not found`);
      }

      if (course.status !== 'scientific-director-rejected') {
        throw new Error(`Course with ID ${courseId} is not in the correct status for resubmission`);
      }

      // Change status back to vice-director-approved to resubmit to scientific director
      course.status = 'vice-director-approved';
      course.rejectionReason = undefined; // Clear rejection reason
      course.approvalHistory.push({
        status: 'vice-director-approved',
        approver: req.user._id,
        role: 'vice-scientific-director',
        comment: 'Resubmitted to Scientific Director after rejection'
      });

      return course.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      status: 'success',
      message: `Successfully resubmitted all courses for instructor ${instructorId}`
    });
  } catch (error) {
    console.error('Error in bulkResubmitToScientificDirector:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error resubmitting courses'
    });
  }
};

// Bulk reject by Vice Director for courses rejected by Scientific Director
exports.bulkRejectByViceDirector = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { courseIds, notes } = req.body;

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide valid course IDs'
      });
    }

    if (!notes) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide rejection notes'
      });
    }

    // Update all courses
    const updatePromises = courseIds.map(async (courseId) => {
      const course = await Course.findById(courseId);
      
      if (!course) {
        throw new Error(`Course with ID ${courseId} not found`);
      }

      if (course.status !== 'scientific-director-rejected' && course.status !== 'dean-approved') {
        throw new Error(`Course with ID ${courseId} is not in the correct status for rejection. Current status: ${course.status}`);
      }

      // Change status to vice-director-rejected
      course.status = 'vice-director-rejected';
      course.rejectionReason = notes;
      course.approvalHistory.push({
        status: 'vice-director-rejected',
        approver: req.user._id,
        role: 'vice-scientific-director',
        comment: `Rejected by Vice Scientific Director: ${notes}`
      });

      return course.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      status: 'success',
      message: `Successfully rejected all courses for instructor ${instructorId}`
    });
  } catch (error) {
    console.error('Error in bulkRejectByViceDirector:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error rejecting courses'
    });
  }
};
