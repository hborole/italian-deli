// Import the SQL db connection
const { query } = require('../configs/db.config');
const jwt = require('jsonwebtoken');
const Password = require('../services/password');

const BadRequestError = require('../errors/bad-request-error');

const signUp = async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  // Check if the user still exists
  const admins = await query('SELECT * FROM admins WHERE email = ?', [email]);

  if (admins.length > 0) {
    throw new BadRequestError('Email in use');
  }

  // Hash the password
  const hashedPassword = await Password.toHash(password);

  try {
    // Create a new user
    const newUser = await query(
      'INSERT INTO admins (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, first_name, last_name]
    );

    console.log(`User created successfully...`);

    // Generate a JWT
    const userJwt = jwt.sign(
      {
        id: newUser.insertId,
        email,
        first_name,
        isAdmin: true,
      },
      process.env.JWT_KEY
    );

    // Store it on session object
    req.session = { jwt: userJwt };

    return res.status(201).send({ message: 'User created successfully' });
  } catch (error) {
    console.log(error);
    throw new BadRequestError('Something went wrong');
  }
};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  // Check if the user still exists
  const admins = await query('SELECT * FROM admins WHERE email = ?', [email]);

  if (admins.length === 0) {
    throw new BadRequestError('Invalid credentials');
  }

  // Get the user
  const user = admins[0];

  // Check if the password is correct
  const passwordsMatch = await Password.compare(user.password, password);

  if (!passwordsMatch) {
    throw new BadRequestError('Invalid credentials');
  }

  // Generate a JWT
  const userJwt = jwt.sign(
    {
      id: user.id,
      email,
      first_name: user.first_name,
      isAdmin: true,
    },
    process.env.JWT_KEY
  );

  // Store it on session object
  req.session = { jwt: userJwt };

  return res.status(200).send({ message: 'User logged in successfully' });
};

const signOut = async (req, res) => {
  req.session = null;

  res.status(200).send({ message: 'User logged out' });
};

const currentUser = async (req, res) => {
  if (!req.currentUser) {
    return res.status(200).send({ currentUser: null });
  }

  return res.status(200).send({ currentUser: req.currentUser });
};

module.exports = {
  signUp,
  signIn,
  signOut,
  currentUser,
};
