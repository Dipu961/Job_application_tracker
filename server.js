const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;
const Database = require('better-sqlite3');
const db = new Database('./db/database.db');
require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';
const saltRounds = 10;

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Create tables if not exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    dob TEXT,
    email TEXT UNIQUE,
    password TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT,
    position TEXT,
    status TEXT,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
)`).run();

// JWT helper
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '2h' });
}

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const token = req.cookies.token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const user = jwt.verify(token, SECRET_KEY);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Serve register page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

// Handle user registration
app.post('/register', async (req, res) => {
  let { firstName, lastName, dob, email, password, confirmPassword } = req.body;

  // Basic input validation
  if (!validator.isEmail(email)) {
    return res.redirect('/register?error=Invalid email');
  }
  if (!firstName || !lastName || !dob || !password || !confirmPassword) {
    return res.redirect('/register?error=Missing fields');
  }
  if (password !== confirmPassword) {
    return res.redirect('/register?error=Passwords do not match');
  }
  if (password.length < 6) {
    return res.redirect('/register?error=Password too short');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const stmt = db.prepare('INSERT INTO users (firstName, lastName, dob, email, password) VALUES (?, ?, ?, ?, ?)');
    stmt.run(firstName, lastName, dob, email, hashedPassword);
    res.redirect('/?success=Registration successful! Please login.');
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.redirect('/register?error=Email already registered');
    } else {
      console.error(err);
      res.redirect('/register?error=Server error');
    }
  }
});

// Handle login POST
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!validator.isEmail(username) || !password) {
    return res.redirect('/?error=Invalid credentials');
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(username);
  if (!user) {
    // User not found
    return res.redirect('/?error=User not registered');
  }

  const match = await bcrypt.compare(password, user.password);
  if (match) {
    // Generate JWT token and set as httpOnly cookie
    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/index');
  } else {
    // Wrong password
    return res.redirect('/?error=Invalid password');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

// Serve job tracker page
app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// API: Get all jobs (protected route, only user's jobs)
app.get('/api/jobs', authenticateToken, (req, res) => {
  const jobs = db.prepare('SELECT * FROM jobs WHERE user_id = ?').all(req.user.id);
  res.json(jobs);
});

// API: Add new job (protected route, associate with user)
app.post('/api/jobs', authenticateToken, (req, res) => {
  const { company, position, status } = req.body;
  if (!company || !position || !status) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  db.prepare('INSERT INTO jobs (company, position, status, user_id) VALUES (?, ?, ?, ?)')
    .run(company, position, status, req.user.id);
  res.json({ message: 'Job added!' });
});

// API: Delete job (only if it belongs to the user)
app.delete('/api/jobs/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM jobs WHERE id = ? AND user_id = ?').run(id, req.user.id);
  res.json({ message: 'Job deleted!' });
});

// API: Update job (only if it belongs to the user)
app.put('/api/jobs/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { company, position, status } = req.body;
  if (!company || !position || !status) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  db.prepare('UPDATE jobs SET company = ?, position = ?, status = ? WHERE id = ? AND user_id = ?')
    .run(company, position, status, id, req.user.id);
  res.json({ message: 'Job updated!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});