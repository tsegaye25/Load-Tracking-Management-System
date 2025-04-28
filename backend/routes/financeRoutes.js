const express = require('express');
const financeController = require('../controllers/financeController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Create a custom middleware to check if user is finance or the instructor accessing their own data
const restrictToFinanceOrSelf = (req, res, next) => {
  // Allow finance users to access everything
  if (req.user.role === 'finance') {
    return next();
  }
  
  // Allow instructors to access only their own payment data
  if (req.user.role === 'instructor' && req.params.instructorId === req.user._id.toString()) {
    return next();
  }
  
  // Otherwise, deny access
  return res.status(403).json({
    status: 'fail',
    message: 'You do not have permission to perform this action'
  });
};

// Routes that only finance can access
router.use(
  [
    '/dashboard',
    '/courses',
    '/courses/:id/review'
  ],
  authController.restrictTo('finance')
);

// Dashboard routes
router.get('/dashboard', financeController.getFinanceDashboardStats);

// Course management routes
router.get('/courses', financeController.getFinanceCourses);
router.patch('/courses/:id/review', financeController.reviewCourseByFinance);

// Payment routes - accessible by finance and the instructor themselves
router.post('/instructors/:instructorId/payments', authController.restrictTo('finance'), financeController.handlePayment);
router.get('/instructors/:instructorId/payments', restrictToFinanceOrSelf, financeController.getInstructorPayments);

module.exports = router;
