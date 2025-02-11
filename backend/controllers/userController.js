const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { getMeFactory } = require('../utils/handleFactory');

exports.getMe = getMeFactory(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    runValidators: true,
    new: true,
  });

  if (!user) return next(new AppError('No such user', 404));

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new AppError('No such user', 404));

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.postUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user)
    return next(new AppError(`No user found with ${req.params.id}`, 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllTeachers = catchAsync(async (req, res, next) => {
  const teachers = await User.find({ role: 'teacher' });

  res.status(200).json({
    status: 'success',
    results: teachers.length,
    data: {
      teachers,
    },
  });
});
