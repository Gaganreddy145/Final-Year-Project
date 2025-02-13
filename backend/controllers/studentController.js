const mongoose = require('mongoose');
const Student = require('./../models/studentModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
// const Mid = require('../models/midMarksModel');
const bcrypt = require('bcryptjs');
const { getMeFactory } = require('../utils/handleFactory');
const sendEmail = require('../utils/email');
const findSubject = require('../utils/matchSubject');

exports.getMe = getMeFactory(Student);

exports.getAllStudents = catchAsync(async (req, res, next) => {
  let query;

  const filterOpts = { ...req.query };
  if (filterOpts.year) filterOpts.year = filterOpts.year * 1;

  query = Student.find(filterOpts);
  // const studentData = await Student.find(filter);
  const studentData = await query;
  res.status(200).json({
    status: 'success',
    results: studentData.length,
    data: {
      students: studentData,
    },
  });
});

exports.getStudent = catchAsync(async (req, res, next) => {
  // console.log(req.params.id);
  const student = await Student.findById(req.params.id).populate('midmarks');

  if (!student)
    return next(
      new AppError(`No student found with the ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: 'success',
    data: {
      student,
    },
  });
});

exports.postStudents = catchAsync(async (req, res, next) => {
  const { students } = req.body;

  const formattedStudents = await Promise.all(
    students.map(async (student) => {
      const hashedPassword = await bcrypt.hash(student.password, 10);
      return {
        ...student,
        rollno: student.rollno * 1,
        password: hashedPassword,
      };
    })
  );

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const insertedStudents = await Student.insertMany(formattedStudents, {
      session,
      validateBeforeSave: true,
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: 'success',
      results: insertedStudents.length,
      data: { insertedStudents },
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
});

exports.updateStudent = catchAsync(async (req, res, next) => {
  if (req.body.password)
    return next(new AppError('This route is not for Password updation', 400));

  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });

  if (!student)
    return next(
      new AppError(`No student found with the ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: 'success',
    data: {
      student,
    },
  });
});

exports.deleteStudent = catchAsync(async (req, res, next) => {
  const student = await Student.findByIdAndDelete(req.params.id);

  if (!student)
    return next(
      new AppError(`No student found with the ${req.params.id}`, 404)
    );

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.findSection = catchAsync(async (req, res, next) => {
  // const students = await Student.find({},{name,section});
  const sections = await Student.aggregate([
    { $match: { year: req.params.year * 1 } },
    {
      $group: {
        _id: '$section',
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      sections,
    },
  });
});

exports.promoteStudents = catchAsync(async (req, res, next) => {
  const { studentIds } = req.body;
  const updatedIds = [];

  for (const id of studentIds) {
    const student = await Student.findById(id);
    if (student.year === 4 && student.currentSem === 2) {
      await Student.updateOne({ _id: id }, { status: 'completed' });
      updatedIds.push(id); // Directly push the ID
    } else {
      var updatedStudent;
      if (student.currentSem === 2) {
        updatedStudent = await Student.findByIdAndUpdate(
          id,
          { year: student.year + 1, currentSem: 1 },
          { new: true }
        );
      } else {
        updatedStudent = await Student.findByIdAndUpdate(
          id,
          { currentSem: student.currentSem + 1 },
          { new: true }
        );
      }
      updatedIds.push(updatedStudent._id);
    }
  }

  res.status(200).json({
    status: 'success',
    data: { updatedIds },
  });
});

exports.addSemGrade = catchAsync(async (req, res, next) => {
  // Think
  const { grades } = req.body; //Grades with roll no's

  const formattedGrades = []; //Grades with id's
  for (const grade of grades) {
    const { rollno } = grade;
    const student = await Student.findOne({ rollno });
    if (!student) {
      return next(new AppError(`No such student with rollno ${rollno}`, 404));
    }

    const allowedSemGradeCount =
      (student.year - 1) * 2 + (student.currentSem - 1);
    if (student.semgrade.length >= allowedSemGradeCount) {
      return next(
        new AppError(
          `Student (${rollno}) is studing in year ${student.year} of sem ${
            student.currentSem
          }, how can we upload sem: ${student.semgrade.length + 1} grade`,
          400
        )
      );
    }

    const newData = { ...grade, id: student._id };
    formattedGrades.push(newData);
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const gradeStudent of formattedGrades) {
      const { id, sem } = gradeStudent;
      const student = await Student.findById(id).session(session);
      student.semgrade.push(sem);
      await student.save({ session });
    }
    await session.commitTransaction();

    session.endSession();
    res.status(201).json({
      status: 'success',
      message: 'Successfully updated the semester grades',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      status: 'fail',
      message: error.message || 'Something went wrong!!!',
    });
  }
});

exports.updateAttendances = catchAsync(async (req, res, next) => {
  const { attendances } = req.body;
  const formattedAttendances = [];
  for (const attendance of attendances) {
    const { rollno } = attendance;
    const student = await Student.findOne({ rollno });

    if (!student)
      return next(new AppError(`No such student with rollno ${rollno}`, 404));
    if (
      student.year * 2 <= student.attendance.length ||
      student.currentSem * student.year <= student.attendance.length
    ) {
      return next(
        new AppError(
          `Student (${rollno}) is studing in year ${student.year} of sem: ${
            student.currentSem
          }, how can we upload sem: ${
            student.attendance.length + 1
          } attendance`,
          400
        )
      );
    }
    const newData = { ...attendance, id: student._id };
    formattedAttendances.push(newData);
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const attendance of formattedAttendances) {
      const { id, percentage } = attendance;
      const student = await Student.findById(id).session(session);
      student.attendance.push(percentage);
      await student.save({ session });
    }
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: 'success',
      message: 'Successfully updated the attendances',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      status: 'fail',
      message: error.message || 'Something went wrong',
    });
  }
});

//Prediction

const calculateAverage = (array) => {
  let sum = array.reduce((acc, curr) => acc + curr, 0);
  if (!sum) return 0;

  let average = sum / array.length;
  return average;
};

exports.postPrediction = catchAsync(async (req, res, next) => {
  if (req.user.semgrade.length > 0) {
    const avgSemGrade = calculateAverage(req.user.semgrade);
    req.body.prev_sem_grade = avgSemGrade;
  }
  const avgAttendance = calculateAverage(req.user.attendance);
  req.body.attendance = avgAttendance;
  const calculateSemNumber = (req.user.year - 1) * 2 + req.user.currentSem;
  req.body.semester = calculateSemNumber === 1 ? 1 : 2;

  const response = await fetch('http://localhost:5000/predict_student', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body),
  });

  if (!response.ok) {
    return next(new AppError('Something went wrong in flask', response.status));
  }

  const result = await response.json();

  res.status(200).json({
    status: 'success',
    data: {
      result,
    },
  });
});

exports.postClassPrediction = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization;
  // console.log(token);

  const { year, section } = req.body;
  const requestedStudentsPromise = await fetch(
    `http://localhost:3000/api/students/?year=${year * 1}&section=${section}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    }
  );

  if (!requestedStudentsPromise.ok) {
    const result = await requestedStudentsPromise.json();
    return next(
      new AppError(
        result.message || 'Something went wrong from server',
        requestedStudentsPromise.status
      )
    );
  }

  const requestedStudents = await requestedStudentsPromise.json();
  if (requestedStudents.data.students.length === 0) {
    return next(new AppError('No students found!!!', 404));
  }

  let formattedStudentsData = [];
  for (const student of requestedStudents.data.students) {
    const { semgrade, attendance, currentSem, year, rollno } = student;
    let semester = (year - 1) * 2 + currentSem;
    // (Optional) Adjust semester if needed.
    semester = semester === 1 ? 1 : 2;
    const avgSemGrade = calculateAverage(semgrade);
    const avgAttendance = calculateAverage(attendance);

    if (semester === 2 && semgrade.length === 0) {
      return next(new AppError('Some fields are missing', 400));
    }

    const obj = {
      rollno,
      semester,
      entrance_exam_score: 78,
      high_school_marks: 80,
      attendance: avgAttendance,
    };

    if (semester === 2) {
      obj.prev_sem_grade = avgSemGrade;
    }
    // if (parseInt(avgSemGrade) !== 0) {
    //   obj.prev_sem_grade = avgSemGrade;
    // }

    formattedStudentsData.push(obj);
  }

  const predictionPromise = await fetch(
    'http://localhost:5000/predict_students',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedStudentsData),
    }
  );

  if (!predictionPromise.ok) {
    return next(new AppError('Something went wrong in flask', 500));
  }

  const result = await predictionPromise.json();

  res.status(200).json({
    status: 'success',
    data: {
      results: result.results,
      summary: result.summary,
    },
  });
});

exports.postEmail = catchAsync(async (req, res, next) => {
  const performances = req.body.performances;
  let formattedData = [];
  for (const performance of performances) {
    const student = await Student.findOne({
      rollno: performance.rollno,
    }).select('email');
    if (!student)
      return next(
        new AppError(`No such student with rollno: ${performance.rollno}`, 404)
      );
    const addedData = { ...performance, email: student.email };
    formattedData.push(addedData);
  }
  // console.log(formattedData);
  for (const performance of formattedData) {
    let { email, predicted_pass_fail, performance_category } = performance;
    if (performance_category === 'Medium') performance_category = 'Average';
    const message = `Dear Student, \n Your Overall Performance is ${performance_category}. \n You will be ${predicted_pass_fail}ed in the examination.`;
    // console.log(performance);
    try {
      await sendEmail({
        email,
        subject: `Prediction results of Student Performance`,
        message,
      });
    } catch (error) {
      return next(new AppError('There is an error send emails', 500));
    }
  }

  res.status(200).json({
    status: 'success',
  });
});

exports.getSubjectsLagPrediction = catchAsync(async (req, res, next) => {
  const year = req.user.year;
  const semno = req.user.currentSem;
  const sid = req.user._id;

  const fetchCurrentSemMarksPromise = await fetch(
    `http://localhost:3000/api/marks?year=${year}&semno=${semno}&sid=${sid}`
  );
  if (!fetchCurrentSemMarksPromise.ok) {
    return next(new AppError('Something went wrong'));
  }
  const fetchCurrentSemMarks = await fetchCurrentSemMarksPromise.json();
  const subjectMarksCurrentSem = fetchCurrentSemMarks.data.midMarks;
  if (subjectMarksCurrentSem.length === 0) {
    return next(new AppError('No marks for current sem', 400));
  }

  const subjectMarks = {};

  subjectMarksCurrentSem.forEach((mark) => {
    if (!subjectMarks[mark.sname]) {
      subjectMarks[mark.sname] = [];
    }
    subjectMarks[mark.sname].push(mark.marks);
  });

  // Step 3: Calculate the average for each subject
  let subjectAverages = {};

  for (const subject in subjectMarks) {
    const marks = subjectMarks[subject];
    const average = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;
    subjectAverages[subject] = average;
  }
  const semester = (year - 1) * 2 + semno;

  let formattedSubjectNames = {};

  for (const subject of Object.keys(subjectAverages)) {
    const actualSubName = findSubject(subject);
    if (actualSubName) {
      const key = `${actualSubName}_mark`;
      formattedSubjectNames[key] = subjectAverages[subject];
    }
  }

  formattedSubjectNames.semester = semester;
  const laggingSubjectsPromise = await fetch(
    'http://localhost:5000/predict_lagging_subjects',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedSubjectNames),
    }
  );

  if (!laggingSubjectsPromise.ok) {
    return next(new AppError('Something went wrong at Flask', 500));
  }

  const laggingSubjectsResult = await laggingSubjectsPromise.json();

  res.status(200).json({
    status: 'success',
    results: laggingSubjectsResult.lagging_subjects.length,
    data: {
      lagging_subjects: laggingSubjectsResult.lagging_subjects,
    },
  });
});
