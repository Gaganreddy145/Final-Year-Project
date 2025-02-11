const mongoose = require('mongoose');

const midMarksSchema = new mongoose.Schema({
  sname: {
    type: String,
    required: [true, 'Must have a subject name'],
  },
  marks: {
    type: Number,
    min: 0,
    max: 30,
    required: [true, 'Must have marks'],
  },
  sid: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
    required: [true, 'Must have reference'],
  },
  mno: {
    type: Number,
    required: [true, 'Must specify the mid number'],
  },
  semno: {
    type: Number,
    required: [true, 'Must specify the semester number'],
  },
  year: {
    type: Number,
    required: [true, 'Must specify the year'],
  },
});

midMarksSchema.index(
  { sid: 1, sname: 1, mno: 1, year: 1, semno: 1 },
  { unique: true }
);

const Mid = mongoose.model('Mid', midMarksSchema);

module.exports = Mid;
