const AppError = require('./appError');
const jwt = require('jsonwebtoken');
const catchAsync = require('./catchAsync');
const { promisify } = require('util');
const Student = require('../models/studentModel');

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET);
};

exports.loginFactory = (Model) =>
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password)
      return next(new AppError('Email or Password missing', 400));

    const doc = await Model.findOne({ email }).select('+password');
    if (!doc || !(await doc.comparePasswords(password, doc.password)))
      return next(new AppError('Incorrect Email or Password', 401));

    const token = signToken(doc._id, doc.role);
    doc.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        doc,
      },
    });
  });

exports.getMeFactory = (Model) =>
  catchAsync(async (req, res, next) => {
    let doc;
    if (Model === Student) {
      doc = await Model.findById(req.user.id).populate('midmarks');
    } else {
      doc = await Model.findById(req.user.id);
    }
    if (!doc) return next(new AppError('No such user', 404));

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.updateMeFactory = (Model) =>
  catchAsync(async (req, res, next) => {
    const user = await Model.findByIdAndUpdate(req.user.id, req.body, {
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

exports.protectFactory = (Model) =>
  catchAsync(async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    )
      token = req.headers.authorization.split(' ')[1];

    if (!token) return next(new AppError('You are not logged in!!!', 401));

    // console.log(token);

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);
    const findUser = await Model.findById(decoded.id);
    // console.log(findUser);
    if (!findUser) return next(new AppError('User not found', 401));

    if (findUser.changedPWDAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password.Plz login again', 401)
      );
    }

    req.user = findUser;
    next();
  });

exports.updateMyPasswordFactory = (Model) =>
  catchAsync(async (req, res, next) => {
    if (!req.body.passwordCurrent)
      return next(new AppError('Current password field is missing', 400));
    if (!req.body.password)
      return next(new AppError('Password field is missing', 400));
    const student = await Model.findById(req.user.id).select('+password');
    if (!student) return next(new AppError('User not found', 404));
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
        user: student,
      },
    });
  });
