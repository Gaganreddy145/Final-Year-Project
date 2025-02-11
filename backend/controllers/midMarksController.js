const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Mid = require('./../models/midMarksModel');
const Student = require('./../models/studentModel');
const mongoose = require('mongoose');

exports.getAllMarks = catchAsync(async (req, res, next) => {
  const midMarks = await Mid.find();

  res.status(200).json({
    status: 'success',
    results: midMarks.length,
    data: {
      midMarks,
    },
  });
});

exports.getMark = catchAsync(async (req, res, next) => {
  const midMark = await Mid.findById(req.params.id);

  if (!midMark) return next(new AppError('No marks found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      midMark,
    },
  });
});

exports.postMarks = catchAsync(async (req, res, next) => {
  const midMark = await Mid.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      midMark,
    },
  });
});

exports.deleteMark = catchAsync(async (req, res, next) => {
  const midMark = await Mid.findByIdAndDelete(req.params.id);

  if (!midMark) return next(new AppError('No marks found', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.postMidMarks = catchAsync(async (req, res, next) => {
  const { midMarks } = req.body;
  const addedIdsMarks = [];

  for (const obj of midMarks) {
    const student = await Student.findOne({ rollno: obj.rollno });
    if (!student) {
      return next(new AppError('No such rollnumber', 404));
    }
    const newObjData = {
      ...obj,
      sid: student._id,
      year: student.year,
      semno: student.currentSem,
    };
    addedIdsMarks.push(newObjData);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const marks = await Mid.insertMany(addedIdsMarks, {
      session,
      validateBeforeSave: true,
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: 'success',
      data: {
        marks,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      status: 'fail',
      message: 'Error inserting students',
      error: error.message,
    });
  }

  // console.log(addedIdsMarks);
  // res.status(201).json({
  //   status: 'success',
  //   data: {
  //     addedIdsMarks,
  //   },
  // });
});
