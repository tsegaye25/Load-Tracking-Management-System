const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Protect all routes after this middleware - requires authentication
router.use(protect);
// Restrict to admin role only
router.use(restrictTo('admin'));

// Admin dashboard data
router.get('/dashboard-data', adminController.getDashboardData);

// Admin user management routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Admin course management routes
router.get('/courses', adminController.getAllCourses);
router.get('/courses/:id', adminController.getCourse);
router.patch('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// Admin statistics routes
router.get('/statistics/users', adminController.getUserStatistics);
router.get('/statistics/courses', adminController.getCourseStatistics);
router.get('/statistics/schools', adminController.getSchoolStatistics);
router.get('/statistics/departments', adminController.getDepartmentStatistics);
router.get('/statistics/recent-activity', adminController.getRecentActivity);

module.exports = router;
