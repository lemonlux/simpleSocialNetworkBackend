const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generateToken = (id, email) => {
  if (!id || !email) {
    throw new Error('Email or id not found');
  }

  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const verifyToken = (token) => {
  if (!token) throw new Error('Token not found');

  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
