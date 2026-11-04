const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');
const router = express.Router();
const users = [];
const JWT_SECRET = process.env.JWT_SECRET || 'book-review-assignment-secret';

const isValid = username => typeof username === 'string' && username.trim().length > 0 && !users.some(user => user.username === username.trim());
const authenticatedUser = (username, password) => users.some(user => user.username === username && user.password === password);

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!authenticatedUser(username, password)) return res.status(401).json({ message: 'Invalid username or password' });
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '2h' });
  req.session.authorization = { token, username };
  return res.status(200).json({ message: 'User successfully logged in', token });
});

router.use('/auth', (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.session.authorization?.token;
  if (!token) return res.status(401).json({ message: 'Authorization required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET).username;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

router.put('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  const review = req.body?.review;
  if (typeof review !== 'string' || !review.trim()) return res.status(400).json({ message: 'A non-empty review is required' });
  book.reviews[req.user] = review.trim();
  return res.status(200).json({ message: 'Review added/updated successfully', reviews: book.reviews });
});

router.delete('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (!Object.hasOwn(book.reviews, req.user)) return res.status(404).json({ message: 'Review not found' });
  delete book.reviews[req.user];
  return res.status(200).json({ message: 'Review deleted successfully', reviews: book.reviews });
});

module.exports.authenticated = router;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;
