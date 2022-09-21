// express app config
const express = require('express');
require('dotenv').config();
require('express-async-errors');
const cors = require('cors');
const cookieSession = require('cookie-session');

// db config
const { db } = require('./src/configs/db.config');

// errors
const errorHandler = require('./src/middlewares/error-handler');
const NotFoundError = require('./src/errors/not-found-error');

// routes
const authRoutes = require('./src/routes/auth.routes');
const categoryRoutes = require('./src/routes/category.routes');
const currentUser = require('./src/middlewares/current-user');

const app = express();

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
  })
);

app.use('/api/auth', authRoutes);

// Let's extract the current user if required for authentication purposes
app.use(currentUser);

app.use('/api/categories', categoryRoutes);

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
