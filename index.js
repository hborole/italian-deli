// express app config
const express = require('express');
require('dotenv').config();
require('express-async-errors');
const cors = require('cors');

// db config
const db = require('./src/configs/db.config.js');

// errors
const errorHandler = require('./src/middlewares/error-handler.js');
const NotFoundError = require('./src/errors/not-found-error.js');

// routes
const authRoutes = require('./src/routes/auth.routes.js');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

db.connect((err) => {
  if (err) {
    console.log('Error connecting to Db', err);
    return;
  }

  console.log('Connection established');

  app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
  });
});
