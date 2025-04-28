const express = require('express');
const financeController = require('../controllers/financeController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Special route for instructors to view their own payments - must be before the finance restriction
router.get('/instructors/:instructorId/payments', financeController.getInstructorPayments);

// Restrict remaining routes to finance roles only
router.use(authController.restrictTo('finance'));

// Dashboard routes
router.get('/dashboard', financeController.getFinanceDashboardStats);

// Course management routes
router.get('/courses', financeController.getFinanceCourses);
router.patch('/courses/:id/review', financeController.reviewCourseByFinance);

// Payment routes
router.post('/instructors/:instructorId/payments', financeController.handlePayment);

module.exports = router;
