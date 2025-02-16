const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const { loginFactory, protectFactory } = require('../utils/handleFactory');
const Student = require('../models/studentModel');

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET);
};

exports.signupUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  const token = signToken(user._id, user.role);
  user.password = undefined;

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

exports.login = loginFactory(User);

// catchAsync(async (req, res, next) => {
//   const { email, password } = req.body;

//   if (!email || !password)
//     return next(new AppError('Email or Password missing', 400));

//   const user = await User.findOne({ email }).select('+password');
//   if (!user || !(await user.comparePasswords(password, user.password)))
//     return next(new AppError('Incorrect Email or Password', 401));

//   const token = signToken(user._id, user.role);
//   user.password = undefined;

//   res.status(200).json({
//     status: 'success',
//     token,
//     data: {
//       user,
//     },
//   });
// });

exports.loginStudent = loginFactory(Student);

exports.protect = protectFactory(User);

exports.protectStudent = protectFactory(Student);

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`You don't have permission to perform this operation`, 403)
      );
    }
    next();
  };
};

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  if(!req.body.passwordCurrent) return next(new AppError("Current password field is missing",400));
  if(!req.body.password) return next(new AppError("Password field is missing",400));
  const student = await Student.findById(req.user.id).select('+password');
  if (!student) return next(new AppError('Student not found', 404));
  if (
    !(await student.comparePasswords(
      req.body.passwordCurrent,
      student.password
    ))
  )
    return next(new AppError('Current password is wrong', 400));
  student.password = req.body.password;
  await student.save();
  const token = signToken(req.user.id, student.role);
  student.password = undefined;
  res.status(200).json({
    status: 'success',
    token,
    data: {
      student,
    },
  });
});
