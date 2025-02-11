const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();
const app = require('./app');

mongoose
  .connect(process.env.DATABASE_CLOUD)
  .then(() => console.log('DB connected successfully'));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
