const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isMobilePhone, isEmail } = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  phno: {
    type: String,
    validate: {
      validator: function (ph) {
        return isMobilePhone(ph, 'en-IN');
      },
      message: 'A user must have a valid phone number',
    },
  },
  role: {
    type: String,
    default: 'teacher',
  },
  designation: {
    type: String,
  },
  email: {
    type: String,
    validate: [isEmail, 'A user must have a valid email'],
    unique: true,
    required: [true, 'A user must contain an email'],
  },
  password: {
    type: String,
    select: false,
    required: [true, 'A user must contain a password'],
  },
  changedpasswordAt: Date,
  profilePhoto: {
    type: String, // URL to the teacher's profile photo
  },
  qualification: {
    type: String, // Example: "Ph.D.", "M.Tech", "M.Sc", "B.Ed"
  },
  experience: {
    type: Number, // Number of years of teaching experience
  },
  subjects: [
    {
      type: String, // Example: "Data Structures", "Machine Learning"
    },
  ],
  classesAssigned: [
    {
      year: Number, // Example: 1st, 2nd, 3rd, 4th year
      section: String, // Example: "A", "B"
    },
  ],
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePasswords = async (originalPass, hashPass) => {
  return await bcrypt.compare(originalPass, hashPass);
};

userSchema.methods.changedPWDAfter = function (JWTtimestamp) {
  if (this.changedpasswordAt) {
    const changedTS = parseInt(this.changedpasswordAt.getTime() / 1000, 10);
    return changedTS > JWTtimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
