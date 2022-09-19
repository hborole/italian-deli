require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/configs/db.config.js');

const app = express();

app.use(cors());

app.get('/', async (req, res) => {
  await db.query(`SELECT * FROM users`, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(result);
    }
  });
});

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
