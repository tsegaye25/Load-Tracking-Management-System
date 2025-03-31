const express = require('express');
const courseController = require('../controllers/courseController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Vice Scientific Director specific routes
router.get(
  '/vice-director-courses',
  authController.restrictTo('vice-scientific-director'),
  courseController.getViceDirectorCourses
);

router.post(
  '/:id/vice-director-review',
  authController.restrictTo('vice-scientific-director'),
  courseController.reviewCourseByViceDirector
);

router.get(
  '/vice-director-dashboard',
  authController.protect,
  authController.restrictTo('vice-scientific-director'),
  courseController.getViceDirectorDashboardStats
);

// School dean specific routes - these must come before /:id routes
router.get(
  '/school-courses',
  authController.restrictTo('school-dean'),
  courseController.getSchoolCourses
);

router.post(
  '/bulk-dean-review',
  authController.restrictTo('school-dean'),
  courseController.bulkReviewCoursesByDean
);

router.get(
  '/school-workload',
  authController.restrictTo('school-dean'),
  courseController.getSchoolWorkload
);

router.post(
  '/resubmit-to-vice-director',
  authController.restrictTo('school-dean'),
  courseController.resubmitToViceDirector
);

router.post(
  '/reject-to-department',
  authController.restrictTo('school-dean'),
  courseController.rejectToDepartment
);

router
  .route('/')
  .get(courseController.getAllCourses)
  .post(
    authController.restrictTo('department-head', 'admin'),
    courseController.createCourse
  );

router.get('/my-courses', courseController.getMyCourses);

// Course assignment routes
router.post(
  '/:id/assign',
  authController.restrictTo('department-head'),
  courseController.assignCourse
);

router.post(
  '/:id/self-assign',
  authController.restrictTo('instructor'),
  courseController.selfAssignCourse
);

router.post(
  '/:id/approve-assignment',
  authController.restrictTo('department-head'),
  courseController.approveCourseAssignment
);

router.post(
  '/:id/reject-assignment',
  authController.restrictTo('department-head'),
  courseController.rejectCourseAssignment
);

// Course review routes
router.post(
  '/:id/department-head-review',
  authController.restrictTo('department-head'),
  courseController.reviewCourseByDepartmentHead
);

router.post(
  '/:id/dean-review',
  authController.restrictTo('school-dean'),
  courseController.reviewCourseByDean
);

// Course resubmission route
router.post(
  '/:id/resubmit-to-dean',
  authController.restrictTo('department-head'),
  courseController.resubmitToDean
);

// Resubmit rejected courses to Vice Director
router.post(
  '/resubmit-to-vice-director',
  authController.protect,
  authController.restrictTo('school-dean'),
  courseController.resubmitToViceDirector
);

// Reject courses and return to department head
router.post(
  '/reject-to-department',
  authController.protect,
  authController.restrictTo('school-dean'),
  courseController.rejectToDepartment
);

// Scientific director routes
router.get(
  '/scientific-director-dashboard',
  authController.protect,
  authController.restrictTo('scientific-director'),
  courseController.getScientificDirectorDashboardStats
);

router.get(
  '/scientific-director-courses',
  authController.protect,
  authController.restrictTo('scientific-director'),
  courseController.getScientificDirectorCourses
);

router.post(
  '/review-by-scientific-director/:instructorId',
  authController.protect,
  authController.restrictTo('scientific-director'),
  courseController.reviewCourseByScientificDirector
);

router.post(
  '/scientific-director/bulk-approve/:instructorId',
  authController.protect,
  authController.restrictTo('scientific-director'),
  courseController.bulkApproveByScientificDirector
);

router.post(
  '/bulk-approve-vice-director/:instructorId',
  authController.protect,
  authController.restrictTo('vice-scientific-director'),
  courseController.bulkApproveByViceDirector
);

// These routes must come after all specific routes
router
  .route('/:id')
  .get(courseController.getCourse)
  .patch(
    authController.restrictTo('department-head', 'admin'),
    courseController.updateCourse
  )
  .delete(
    authController.restrictTo('department-head', 'admin'),
    courseController.deleteCourse
  );

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
