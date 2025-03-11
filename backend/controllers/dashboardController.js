const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Course = require('../models/courseModel');
const User = require('../models/userModel');

exports.getDashboardData = catchAsync(async (req, res, next) => {
  const user = req.user;
  let dashboardData = {
    totalCourses: 0,
    pendingApprovals: 0,
    stats: {}
  };

  switch (user.role) {
    case 'school-dean':
      const schoolCourses = await Course.find({ school: user.school });
      const pendingReviews = await Course.countDocuments({
        school: user.school,
        status: 'pending_dean_review'
      });
      
      dashboardData = {
        totalCourses: schoolCourses.length,
        pendingApprovals: pendingReviews,
        stats: {
          approved: await Course.countDocuments({ school: user.school, status: 'approved' }),
          rejected: await Course.countDocuments({ school: user.school, status: 'rejected' }),
          pending: pendingReviews
        }
      };
      break;

    case 'department-head':
      const deptCourses = await Course.find({ 
        school: user.school,
        department: user.department
      });
      
      dashboardData = {
        totalCourses: deptCourses.length,
        pendingApprovals: await Course.countDocuments({
          school: user.school,
          department: user.department,
          status: 'pending_assignment'
        }),
        stats: {
          assigned: await Course.countDocuments({
            school: user.school,
            department: user.department,
            instructor: { $exists: true, $ne: null }
          }),
          unassigned: await Course.countDocuments({
            school: user.school,
            department: user.department,
            instructor: { $exists: false }
          })
        }
      };
      break;

    case 'instructor':
      const instructorCourses = await Course.find({ instructor: user._id });
      const totalHours = instructorCourses.reduce((sum, course) => 
        sum + (course.totalHours || 0), 0);
      
      dashboardData = {
        totalCourses: instructorCourses.length,
        totalHours,
        stats: {
          approved: instructorCourses.filter(c => c.status === 'approved').length,
          pending: instructorCourses.filter(c => c.status === 'pending_dean_review').length,
          rejected: instructorCourses.filter(c => c.status === 'rejected').length
        }
      };
      break;

    default:
      return next(new AppError('Invalid user role for dashboard', 400));
  }

  res.status(200).json({
    status: 'success',
    data: dashboardData
  });
});
