const express = require('express');
const courseController = require('../controllers/courseController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Routes accessible by both admin and instructors
router.get('/', authController.restrictTo('admin', 'instructor', 'department-head'), courseController.getAllCourses);
router.get('/my-courses', courseController.getMyCourses);
router.get('/:id', authController.restrictTo('admin', 'instructor', 'department-head'), courseController.getCourse);

// Allow instructors to self-assign courses
router.patch(
  '/:id/self-assign',
  authController.restrictTo('instructor'),
  courseController.selfAssignCourse
);

// Course assignment approval routes
router.patch(
  '/:id/approve-assignment',
  authController.restrictTo('department-head'),
  courseController.approveCourseAssignment
);

router.patch(
  '/:id/reject-assignment',
  authController.restrictTo('department-head'),
  courseController.rejectCourseAssignment
);

// Routes accessible only by admin
router.use(authController.restrictTo('department-head', 'admin'));
router.post('/', courseController.createCourse);
router.patch('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);
router.patch('/:id/assign', courseController.assignCourse);

// Course approval routes
router.patch(
  '/:id/approve',
  authController.restrictTo(
    'department-head',
    'school-dean',
    'vice-scientific-director',
    'scientific-director',
    'finance'
  ),
  courseController.approveCourse
);

router.patch(
  '/:id/reject',
  authController.restrictTo(
    'department-head',
    'school-dean',
    'vice-scientific-director',
    'scientific-director',
    'finance'
  ),
  courseController.rejectCourse
);

module.exports = router;
