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

  // Populate instructor details
  query = query.populate({
    path: 'instructor',
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
  const course = await Course.findById(req.params.id);

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
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
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

exports.deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findByIdAndDelete(req.params.id);

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      courseId: req.params.id
    }
  });
});

exports.getMyCourses = catchAsync(async (req, res, next) => {
  // For instructors, get courses they're assigned to
  const courses = await Course.find({ instructor: req.user._id })
    .populate({
      path: 'instructor',
      select: 'name email department school'
    })
    .select(
      'title code school department classYear semester ' +
      'Hourfor Number_of_Sections hdp position BranchAdvisor totalHours ' +
      'instructor'
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
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  const instructor = await User.findById(req.body.instructorId);
  if (!instructor) {
    return next(new AppError('No instructor found with that ID', 404));
  }

  if (instructor.role !== 'instructor') {
    return next(new AppError('Selected user is not an instructor', 400));
  }

  // Check if instructor's current load would exceed maximum
  const maxLoad = 12; // Maximum allowed load
  const newLoad = instructor.currentLoad + (course.totalHours || 0);
  
  if (newLoad > maxLoad) {
    return next(new AppError(`Assignment would exceed instructor's maximum load of ${maxLoad} hours`, 400));
  }

  // Update course with new instructor
  course.instructor = instructor._id;
  await course.save();

  // Update instructor's courses and load using findByIdAndUpdate to skip validation
  if (!instructor.courses.includes(course._id)) {
    await User.findByIdAndUpdate(
      instructor._id,
      {
        $push: { courses: course._id },
        $set: { currentLoad: newLoad }
      },
      { new: true, runValidators: false }
    );
  }

  // Get fully populated course data
  const populatedCourse = await Course.findById(course._id)
    .populate({
      path: 'instructor',
      select: 'name email department school currentLoad'
    });

  res.status(200).json({
    status: 'success',
    data: {
      course: populatedCourse
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
