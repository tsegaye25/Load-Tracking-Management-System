const Course = require('../models/courseModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

exports.getAllCourses = catchAsync(async (req, res, next) => {
  // Get courses based on user role
  let query = {};

  if (req.user.role === 'instructor' || req.user.role === 'department-head') {
    // For instructors and department heads, get all courses in their school
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

  // Check if course is from instructor's department and school
  if (course.department !== req.user.department || course.school !== req.user.school) {
    return next(new AppError('You can only select courses from your department', 403));
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
  const departmentStats = {};
  instructors.forEach(instructor => {
    const dept = instructor.department || 'Unassigned';
    if (!departmentStats[dept]) {
      departmentStats[dept] = {
        totalInstructors: 0,
        assignedInstructors: 0,
        totalCourses: 0,
        averageWorkload: 0,
        instructors: []
      };
    }
    
    const instructorCourses = courses.filter(c => 
      c.instructor && c.instructor._id.toString() === instructor._id.toString()
    );
    
    departmentStats[dept].totalInstructors++;
    if (instructorCourses.length > 0) {
      departmentStats[dept].assignedInstructors++;
    }
    departmentStats[dept].totalCourses += instructorCourses.length;
    departmentStats[dept].instructors.push({
      name: instructor.name,
      email: instructor.email,
      coursesCount: instructorCourses.length,
      workload: instructor.workload || 0
    });
  });

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
        await emailInstance.send({
          email: viceDirector.email,
          subject: `Course Ready for Review: ${course.code}`,
          message: `
            A new course is ready for your review:
            
            Course Details:
            - Code: ${course.code}
            - Title: ${course.title}
            - Department: ${course.department}
            - Instructor: ${course.instructor ? course.instructor.name : 'Not assigned'}
            
            The course has been approved by the School Dean and requires your review.
          `
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
        await emailInstance.send({
          email: departmentHead.email,
          subject: 'Course Rejected: ${course.code}',
          message: `
            The following course has been rejected by the School Dean:
            
            Course Details:
            - Code: ${course.code}
            - Title: ${course.title}
            - Department: ${course.department}
            - Instructor: ${course.instructor ? course.instructor.name : 'Not assigned'}
            
            Rejection Reason:
            ${rejectionReason}
            
            Please review the feedback and make necessary changes before resubmitting.
          `
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
      status: { 
        $in: [
          'dean-approved',
          'vice-director-approved',
          'vice-director-rejected',
          'dean-review'
        ]
      },
      instructor: { $exists: true, $ne: null }
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
      message: 'Error fetching courses for vice director review'
    });
  }
};

// Review course by vice scientific director
exports.reviewCourseByViceDirector = catchAsync(async (req, res, next) => {
  const { action, comment } = req.body;
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (course.status !== 'dean-approved') {
    return next(new AppError('Course is not ready for vice director review', 400));
  }

  const historyEntry = {
    status: action === 'approve' ? 'vice-director-approved' : 'resubmitted-to-dean',
    approver: req.user._id,
    role: 'vice-scientific-director',
    comment: comment,
    date: Date.now()
  };

  // Update course status and add to history
  course.status = action === 'approve' ? 'vice-director-approved' : 'dean-review';
  course.approvalHistory.push(historyEntry);
  
  if (action === 'reject') {
    course.viceDirectorRejectionNotes = comment;
  }

  await course.save();

  // Send notifications
  if (action === 'approve') {
    // Send notification to scientific director
    await sendEmail({
      email: 'scientific.director@example.com', // Replace with actual email
      subject: 'Course Ready for Final Review',
      message: `Course ${course.code} - ${course.title} has been approved by the Vice Scientific Director and is ready for your review.`
    });
  } else {
    // Send notification to school dean
    const dean = await User.findOne({ 
      role: 'school-dean',
      school: course.school
    });

    if (dean) {
      await sendEmail({
        email: dean.email,
        subject: 'Course Requires Review - Feedback from Vice Scientific Director',
        message: `Course ${course.code} - ${course.title} has been returned for review by the Vice Scientific Director.\n\nFeedback: ${comment}`
      });
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      course
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
          'dean-review'
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

    // Calculate basic stats
    const totalCourses = courses.length;
    const pendingReview = courses.filter(c => c.status === 'dean-approved').length;
    const approved = courses.filter(c => c.status === 'vice-director-approved').length;
    const returned = courses.filter(c => c.status === 'dean-review').length;

    // Calculate workload by school
    const schoolWorkload = courses.reduce((acc, course) => {
      const schoolName = course.school?.name || 'Unassigned';
      if (!acc[schoolName]) {
        acc[schoolName] = {
          name: schoolName,
          totalWorkload: 0,
          courseCount: 0
        };
      }
      
      const workload = (
        (course.Hourfor?.creaditHours || 0) +
        (course.Hourfor?.lecture || 0) +
        (course.Hourfor?.lab || 0) +
        (course.Hourfor?.tutorial || 0) +
        (course.hdp || 0) +
        (course.position || 0) +
        (course.branchAdvisor || 0)
      );
      
      acc[schoolName].totalWorkload += workload;
      acc[schoolName].courseCount += 1;
      return acc;
    }, {});

    // Status distribution for pie chart
    const statusDistribution = [
      { name: 'Pending Review', value: pendingReview },
      { name: 'Approved', value: approved },
      { name: 'Returned to Dean', value: returned }
    ];

    // Get recent activity from approval history
    const recentActivity = courses
      .filter(course => course.approvalHistory && course.approvalHistory.length > 0)
      .flatMap(course => 
        course.approvalHistory.map(history => ({
          courseCode: course.code,
          courseTitle: course.title,
          type: history.status === 'vice-director-approved' ? 'approval' : 'return',
          description: history.notes || 
            (history.status === 'vice-director-approved' 
              ? 'Course forwarded to Scientific Director'
              : 'Course returned to School Dean'),
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
        returned,
        workloadBySchool: Object.values(schoolWorkload),
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
    const courses = await Course.find({
      status: { 
        $in: [
          'vice-director-approved',
          'approved',
          'rejected'
        ]
      },
      instructor: { $exists: true, $ne: null }
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
    const { action, notes } = req.body;

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

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const historyEntry = {
      status: newStatus,
      date: new Date(),
      notes: notes || '',
      reviewedBy: req.user._id
    };

    // Update all courses
    await Promise.all(courses.map(async (course) => {
      course.status = newStatus;
      course.approvalHistory.push(historyEntry);
      await course.save();
    }));

    // Send notifications
    const instructor = await User.findById(instructorId).populate('school');
    const viceDirector = await User.findOne({ role: 'vice-scientific-director' });

    if (action === 'approve') {
      // Send approval notification to instructor
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
      // Send rejection notification to vice director
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
          'approved',
          'rejected'
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

    // Calculate basic stats
    const totalCourses = courses.length;
    const pendingReview = courses.filter(c => c.status === 'vice-director-approved').length;
    const approved = courses.filter(c => c.status === 'approved').length;
    const rejected = courses.filter(c => c.status === 'rejected').length;

    // Calculate workload by school
    const schoolWorkload = courses.reduce((acc, course) => {
      const schoolName = course.school?.name || 'Unassigned';
      if (!acc[schoolName]) {
        acc[schoolName] = {
          name: schoolName,
          totalWorkload: 0,
          courseCount: 0
        };
      }
      
      const workload = (
        (course.Hourfor?.creaditHours || 0) +
        (course.Hourfor?.lecture || 0) +
        (course.Hourfor?.lab || 0) +
        (course.Hourfor?.tutorial || 0) +
        (course.hdp || 0) +
        (course.position || 0) +
        (course.branchAdvisor || 0)
      );
      
      acc[schoolName].totalWorkload += workload;
      acc[schoolName].courseCount += 1;
      return acc;
    }, {});

    // Status distribution for pie chart
    const statusDistribution = [
      { name: 'Pending Final Review', value: pendingReview },
      { name: 'Approved', value: approved },
      { name: 'Returned to Vice Director', value: rejected }
    ];

    // Get recent activity from approval history
    const recentActivity = courses
      .filter(course => course.approvalHistory && course.approvalHistory.length > 0)
      .flatMap(course => 
        course.approvalHistory.map(history => ({
          courseCode: course.code,
          courseTitle: course.title,
          type: history.status === 'approved' ? 'approval' : 'return',
          description: history.notes || 
            (history.status === 'approved' 
              ? 'Course given final approval'
              : 'Course returned to Vice Director'),
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
        workloadBySchool: Object.values(schoolWorkload),
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
