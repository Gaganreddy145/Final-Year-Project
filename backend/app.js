const express = require('express');
const studentRouter = require('./routes/studentRoutes');
const midMarksRouter = require('./routes/midMarksRoutes');
const userRouter = require('./routes/userRoutes');
// const cors = require('cors');

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH,PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// app.use(cors());
// app.use(cors({
//   origin: "http://localhost:5173", // or the URL of your frontend
//   credentials: true,
//   allowedHeaders: ["Authorization", "Content-Type"] // Explicitly allow the Authorization header
// }));

app.use('/api/students', studentRouter);
app.use('/api/marks', midMarksRouter);
app.use('/api/users', userRouter);

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
  });
});

module.exports = app;
