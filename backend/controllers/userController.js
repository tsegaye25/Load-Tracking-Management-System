const User = require('../models/userModel');
const Course = require('../models/courseModel'); // Added this line
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  const filteredBody = filterObj(req.body, 'name', 'email', 'phone', 'department', 'position', 'batchAdvisor');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find()
    .populate({
      path: 'courses',
      select: 'title code totalHours school department instructor',
      populate: {
        path: 'instructor',
        select: 'name'
      }
    });

  // For each instructor, also get courses where they are assigned as instructor
  const usersWithAllCourses = await Promise.all(users.map(async user => {
    if (user.role === 'instructor') {
      const assignedCourses = await Course.find({ instructor: user._id })
        .select('title code totalHours school department');
      
      // Convert to plain object to modify
      const userObj = user.toObject();
      
      // Ensure no duplicate courses
      const courseIds = new Set(userObj.courses.map(c => c._id.toString()));
      const additionalCourses = assignedCourses.filter(c => !courseIds.has(c._id.toString()));
      
      userObj.courses = [...userObj.courses, ...additionalCourses];
      return userObj;
    }
    return user;
  }));

  res.status(200).json({
    status: 'success',
    data: {
      users: usersWithAllCourses
    }
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  let user = await User.findById(req.params.id)
    .populate({
      path: 'courses',
      select: 'title code totalHours school department instructor',
      populate: {
        path: 'instructor',
        select: 'name'
      }
    });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  if (user.role === 'instructor') {
    const assignedCourses = await Course.find({ instructor: user._id })
      .select('title code totalHours school department');
    
    // Convert to plain object to modify
    const userObj = user.toObject();
    
    // Ensure no duplicate courses
    const courseIds = new Set(userObj.courses.map(c => c._id.toString()));
    const additionalCourses = assignedCourses.filter(c => !courseIds.has(c._id.toString()));
    
    userObj.courses = [...userObj.courses, ...additionalCourses];
    user = userObj;
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  // Filter out unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'name',
    'email',
    'role',
    'school',
    'department',
    'phone',
    'active'
  );

  const user = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.getInstructors = catchAsync(async (req, res, next) => {
  const instructors = await User.find({ role: 'instructor' })
    .select('name email department school currentLoad')
    .populate('courses');

  res.status(200).json({
    status: 'success',
    data: {
      instructors
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
