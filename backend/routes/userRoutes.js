const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

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
router.get('/instructors', userController.getInstructors);

// Get instructors by department
router.get(
  '/instructors/department/:department',
  authController.protect,
  authController.restrictTo('department-head'),
  userController.getInstructorsByDepartment
);

// Get department heads by department
router.get(
  '/department-heads/:department',
  authController.protect,
  authController.restrictTo('instructor'),
  userController.getDepartmentHeadsByDepartment
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
