const express = require('express');
const {
  getAllStudents,
  postStudents,
  updateStudent,
  deleteStudent,
  getStudent,
  findSection,
  promoteStudents,
  postMidMarks,
  addSemGrade,
  updateAttendances,
  postPrediction,
  postClassPrediction,
} = require('./../controllers/studentController');

const {
  protect,
  restrictTo,
  loginStudent,
  protectStudent,
} = require('./../controllers/authController');
const { getMe } = require('../controllers/studentController');
const router = express.Router();

router.post('/login', loginStudent);
router.get('/find/me', protectStudent, getMe);

router.post('/promote', protect, restrictTo('admin'), promoteStudents);
router.get('/fi/findSections/:year', protect, findSection);
// router.post('/midMarks', postMidMarks);
router.post('/semgrade', protect, restrictTo('admin'), addSemGrade);
router.patch('/attendance', protect, restrictTo('teacher'), updateAttendances);

router
  .route('/')
  .get(protect, restrictTo('admin', 'teacher'), getAllStudents)
  .post(protect, restrictTo('admin'), postStudents);
router
  .route('/:id')
  .get(protect, getStudent)
  .patch(updateStudent)
  .delete(deleteStudent);

// router.route('/:year').get(getAllStudents);
//Prediction routes

router.post('/predict', protectStudent, postPrediction);
router.post(
  '/teacher-predict',
  protect,
  restrictTo('teacher'),
  postClassPrediction
);

module.exports = router;
