const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

// Protected routes
router.get('/me', userController.getMe);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.patch('/updateMyPassword', authController.updatePassword);

// Get instructors (department head only, filtered by their department)
router.get(
  '/instructors',
  authController.restrictTo('department-head'),
  userController.getInstructors
);

// Get all department heads (for instructors)
router.get(
  '/department-heads',
  authController.restrictTo('instructor'),
  userController.getDepartmentHeads
);

// Get department heads by department
router.get(
  '/department-heads/:department',
  authController.restrictTo('instructor'),
  userController.getDepartmentHeadsByDepartment
);

// Get instructors by department
router.get(
  '/instructors/department/:department',
  authController.restrictTo('department-head'),
  userController.getInstructorsByDepartment
);

// Admin only routes
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
