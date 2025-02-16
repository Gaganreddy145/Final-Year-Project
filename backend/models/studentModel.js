const mongoose = require('mongoose');
const { isMobilePhone, isEmail } = require('validator');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema(
  {
    rollno: {
      type: Number,
      unique: true,
      required: [true, 'A student must have a roll number'],
    },
    name: {
      type: String,
      required: [true, 'A student must have a name'],
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    year: {
      type: Number,
      required: true,
      default: 1,
      enum: {
        values: [1, 2, 3, 4],
        message: 'Year must only contain 1 to 4',
      },
    },
    currentSem: {
      type: Number,
      default: 1,
      enum: {
        values: [1, 2],
        message: 'Current Semester can have only 1 or 2',
      },
    },
    password: {
      type: String,
      select: false,
    },
    changedpasswordAt: Date,
    phno: {
      type: String,
      validate: {
        validator: function (ph) {
          return isMobilePhone(ph, 'en-IN');
        },
        message: 'A student must have a valid phone number',
      },
    },
    email: {
      type: String,
      required: [true, 'A student must have a email'],
      unique: true,
      validate: [isEmail, 'A student must have a valid email'],
    },
    status: {
      type: String,
      default: 'pending',
    },
    role: {
      type: String,
      default: 'student',
    },
    section: {
      type: String,
      default: 'A',
      enum: {
        values: ['A', 'B', 'C'],
        message: 'Section must contain A to C',
      },
    },
    semgrade: [
      {
        type: Number,
        min: [0, 'Semester grade must have min value of 0'],
        max: [10, 'Semester grade cannot have greater than 10'],
      },
    ],
    attendance: [
      {
        type: Number,
        min: [0, 'Attendance percentage cannot be less than 0'],
        max: [100, 'Attendance percentage cannot be more than 100'],
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentSchema.virtual('midmarks', {
  ref: 'Mid',
  foreignField: 'sid',
  localField: '_id',
});

studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

studentSchema.pre(/^find/, function (next) {
  this.find({ status: { $ne: 'completed' } });
  next();
});

studentSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.changedpasswordAt = Date.now() - 1000;
  next();
});

studentSchema.methods.comparePasswords = async (originalPass, hashPass) => {
  return await bcrypt.compare(originalPass, hashPass);
};

studentSchema.methods.changedPWDAfter = function (JWTtimestamp) {
  if (this.changedpasswordAt) {
    const changedTS = parseInt(this.changedpasswordAt.getTime() / 1000, 10);
    console.log(changedTS > JWTtimestamp);
    return changedTS > JWTtimestamp;
  }
  return false;
};

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
