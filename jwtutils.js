const jwt = require('jsonwebtoken');
require('dotenv').config();

// Function to generate JWT
const generateToken = (userId) => {
  const payload = { id: userId };
  const secret = process.env.SECRET_KEY;
  const options = { expiresIn: '1h' }; // Token expires in 1 hour
  return jwt.sign(payload, secret, options);
};

// Function to verify JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
