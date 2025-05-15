const { verifyToken } = require('./jwtutils');

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];  // The token should be sent in the Authorization header as 'Bearer <token>'
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }

  req.userId = decoded.id;  // Attach the user ID to the request object
  next();
};

module.exports = authenticateToken;
