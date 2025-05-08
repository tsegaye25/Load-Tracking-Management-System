const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Course = require('../models/courseModel');
const User = require('../models/userModel');

/**
 * Get comprehensive dashboard data for admin
 */
exports.getDashboardData = catchAsync(async (req, res, next) => {
  // Get user statistics
  const totalUsers = await User.countDocuments();
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get course statistics
  const totalCourses = await Course.countDocuments();
  const coursesByStatus = await Course.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const coursesBySchool = await Course.aggregate([
    {
      $group: {
        _id: '$school',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get school and department statistics
  const schools = await Course.distinct('school');
  
  const departmentsBySchool = await Course.aggregate([
    {
      $group: {
        _id: { school: '$school', department: '$department' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.school',
        departments: { 
          $push: { 
            name: '$_id.department', 
            count: '$count' 
          } 
        },
        totalCourses: { $sum: '$count' }
      }
    }
  ]);

  // Get recent activity (latest updated courses)
  const recentActivity = await Course.find()
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate({
      path: 'instructor',
      select: 'name email department school'
    })
    .populate({
      path: 'requestedBy',
      select: 'name email department school'
    });

  res.status(200).json({
    status: 'success',
    data: {
      users: {
        total: totalUsers,
        byRole: usersByRole
      },
      courses: {
        total: totalCourses,
        byStatus: coursesByStatus,
        bySchool: coursesBySchool
      },
      schools: {
        total: schools.length,
        list: schools
      },
      departments: {
        bySchool: departmentsBySchool
      },
      recentActivity
    }
  });
});

/**
 * Get all users with optional filtering
 */
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const { role, school, department, search } = req.query;
  
  // Build query
  const query = {};
  
  if (role && role !== 'all') {
    query.role = role;
  }
  
  if (school && school !== 'all') {
    query.school = school;
  }
  
  if (department && department !== 'all') {
    query.department = department;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  const users = await User.find(query).select('-password');
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

/**
 * Get a specific user by ID
 */
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  
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

/**
 * Update a user
 */
exports.updateUser = catchAsync(async (req, res, next) => {
  // Prevent password update through this route
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /updatePassword.', 400));
  }
  
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).select('-password');
  
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

/**
 * Delete a user
 */
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

/**
 * Get all courses with optional filtering
 */
exports.getAllCourses = catchAsync(async (req, res, next) => {
  const { status, school, department, search } = req.query;
  
  // Build query
  const query = {};
  
  if (status && status !== 'all') {
    query.status = status;
  }
  
  if (school && school !== 'all') {
    query.school = school;
  }
  
  if (department && department !== 'all') {
    query.department = department;
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }
  
  const courses = await Course.find(query)
    .populate({
      path: 'instructor',
      select: 'name email department school'
    })
    .populate({
      path: 'requestedBy',
      select: 'name email department school'
    });
  
  res.status(200).json({
    status: 'success',
    results: courses.length,
    data: {
      courses
    }
  });
});

/**
 * Get a specific course by ID
 */
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

/**
 * Update a course
 */
exports.updateCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
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

/**
 * Delete a course
 */
exports.deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  
  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Get user statistics
 */
exports.getUserStatistics = catchAsync(async (req, res, next) => {
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const usersBySchool = await User.aggregate([
    {
      $group: {
        _id: '$school',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const usersByDepartment = await User.aggregate([
    {
      $group: {
        _id: { school: '$school', department: '$department' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.school',
        departments: { 
          $push: { 
            name: '$_id.department', 
            count: '$count' 
          } 
        },
        totalUsers: { $sum: '$count' }
      }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      byRole: usersByRole,
      bySchool: usersBySchool,
      byDepartment: usersByDepartment
    }
  });
});

/**
 * Get course statistics
 */
exports.getCourseStatistics = catchAsync(async (req, res, next) => {
  const coursesByStatus = await Course.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const coursesBySchool = await Course.aggregate([
    {
      $group: {
        _id: '$school',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const coursesByDepartment = await Course.aggregate([
    {
      $group: {
        _id: { school: '$school', department: '$department' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.school',
        departments: { 
          $push: { 
            name: '$_id.department', 
            count: '$count' 
          } 
        },
        totalCourses: { $sum: '$count' }
      }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      byStatus: coursesByStatus,
      bySchool: coursesBySchool,
      byDepartment: coursesByDepartment
    }
  });
});

/**
 * Get school statistics
 */
exports.getSchoolStatistics = catchAsync(async (req, res, next) => {
  const schools = await Course.distinct('school');
  
  const schoolStats = await Promise.all(schools.map(async (school) => {
    const courseCount = await Course.countDocuments({ school });
    const instructorCount = await User.countDocuments({ school, role: 'instructor' });
    const departmentHeadCount = await User.countDocuments({ school, role: 'department-head' });
    const departments = await Course.distinct('department', { school });
    
    return {
      name: school,
      courseCount,
      instructorCount,
      departmentHeadCount,
      departmentCount: departments.length,
      departments
    };
  }));
  
  res.status(200).json({
    status: 'success',
    data: {
      schools: schoolStats
    }
  });
});

/**
 * Get department statistics
 */
exports.getDepartmentStatistics = catchAsync(async (req, res, next) => {
  const departmentStats = await Course.aggregate([
    {
      $group: {
        _id: { school: '$school', department: '$department' },
        courseCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        let: { dept: '$_id.department', sch: '$_id.school' },
        pipeline: [
          { 
            $match: { 
              $expr: { 
                $and: [
                  { $eq: ['$department', '$$dept'] },
                  { $eq: ['$school', '$$sch'] },
                  { $eq: ['$role', 'instructor'] }
                ]
              }
            }
          }
        ],
        as: 'instructors'
      }
    },
    {
      $addFields: {
        instructorCount: { $size: '$instructors' }
      }
    },
    {
      $project: {
        _id: 0,
        school: '$_id.school',
        department: '$_id.department',
        courseCount: 1,
        instructorCount: 1
      }
    },
    {
      $sort: { school: 1, department: 1 }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      departments: departmentStats
    }
  });
});

/**
 * Get recent activity
 */
exports.getRecentActivity = catchAsync(async (req, res, next) => {
  const recentActivity = await Course.find()
    .sort({ updatedAt: -1 })
    .limit(20)
    .populate({
      path: 'instructor',
      select: 'name email department school'
    })
    .populate({
      path: 'requestedBy',
      select: 'name email department school'
    });
  
  res.status(200).json({
    status: 'success',
    data: {
      recentActivity
    }
  });
});
