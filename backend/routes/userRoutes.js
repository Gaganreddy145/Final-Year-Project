const express = require('express');
const {
  getAllUsers,
  postUser,
  deleteUser,
  getMe,
  updateMe,
  getAllTeachers,
  getUser,
} = require('./../controllers/userController');
const {
  signupUser,
  login,
  protect,
  restrictTo,
} = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', login);

router.route('/').get(protect, getAllUsers).post(protect, postUser);
router.route('/:id').delete(protect, restrictTo('admin'), deleteUser).get(protect,getUser);

router.route('/find/me').get(protect, getMe).patch(protect, updateMe);
router.get('/admin/all-teachers', protect, restrictTo('admin'), getAllTeachers);

module.exports = router;
