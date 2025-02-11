const express = require('express');
const {
  getAllMarks,
  postMarks,
  getMark,
  postMidMarks,
} = require('./../controllers/midMarksController');

const router = express.Router();

router.post('/midMarks', postMidMarks);
router.route('/').get(getAllMarks).post(postMarks);

router.route('/:id').get(getMark);

module.exports = router;
