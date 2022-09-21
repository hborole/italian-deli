// Import the SQL db connection
const { query } = require('../configs/db.config');
const BadRequestError = require('../errors/bad-request-error');

const signUp = async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  // Check if the user still exists
  const users = await query('SELECT * FROM users WHERE email = ?', [email]);

  if (users.length > 0) {
    throw new BadRequestError('Email in use');
  }

  try {
    // Create a new user
    const newUser = await query(
      'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
      [email, password, first_name, last_name]
    );

    console.log(`User created successfully...`, newUser);
    res.status(201).send();
  } catch (error) {
    console.log(error);
    throw new BadRequestError('Something went wrong');
  }
};

const signIn = async (req, res) => {
  res.send('Sign in route');
};

const signOut = async (req, res) => {
  res.send('Sign out route');
};

const currentUser = async (req, res) => {
  res.send('Current user');
};

module.exports = {
  signUp,
  signIn,
  signOut,
  currentUser,
};
