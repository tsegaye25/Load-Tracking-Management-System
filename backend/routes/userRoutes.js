const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

// Public routes
router.post('/login', authController.login);

// Protect all routes after this middleware
router.use(authController.protect);

// Protected routes
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.get('/instructors', userController.getInstructors);

// Admin only routes
router.use(authController.restrictTo('admin'));
router.post('/signup', authController.signup); 
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
