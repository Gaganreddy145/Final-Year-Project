const mongoose = require('mongoose');

const midMarksSchema = new mongoose.Schema({
  sname: {
    type: String,
    required: [true, 'Must have a subject name'],
    enum: {
      values: [
        'discrete mathematical structures',
        'english',
        'computer programming with c and numerical methods (cpnm)',
        'engineering mathematics 1',
        'engineering chemistry',
        'digital logic design (dld)',
        'electrical and electronics engineering (eee)',
        'engineering graphics',
        'engineering physics',
        'engineering mathematics 2',
        'object oriented programming through java',
        'operating systems',
        'computer organization and architecture',
        'data structures',
        'probability, statistics and queuing theory',
        'managerial economics',
        'formal languages and automata theory',
        'database management systems',
        'design and analysis of algorithms',
        'microprocessors & microcontrollers',
        'data warehousing and data mining',
        'compiler design',
        'computer networks',
        'open elective 1',
        'elective 1',
        'object oriented software engineering',
        'web technologies',
        'artificial intelligence',
        'open elective 2',
        'elective 2',
        'open elective 4',
        'open elective 3',
        'elective 5',
        'elective 4',
        'elective 3',
      ],
      message: 'Only some subjects are supported',
    },
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
