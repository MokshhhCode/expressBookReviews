const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');
const router = express.Router();

router.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (!isValid(username)) return res.status(409).json({ message: 'User already exists' });
  users.push({ username: username.trim(), password });
  return res.status(201).json({ message: 'User successfully registered' });
});

router.get('/', (_req, res) => res.status(200).json(books));
router.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.status(200).json(book) : res.status(404).json({ message: 'Book not found' });
});
router.get('/author/:author', (req, res) => {
  const author = decodeURIComponent(req.params.author).toLocaleLowerCase();
  const matches = Object.fromEntries(Object.entries(books).filter(([, book]) => book.author.toLocaleLowerCase() === author));
  return Object.keys(matches).length ? res.status(200).json(matches) : res.status(404).json({ message: 'No books found for author' });
});
router.get('/title/:title', (req, res) => {
  const title = decodeURIComponent(req.params.title).toLocaleLowerCase();
  const matches = Object.fromEntries(Object.entries(books).filter(([, book]) => book.title.toLocaleLowerCase().includes(title)));
  return Object.keys(matches).length ? res.status(200).json(matches) : res.status(404).json({ message: 'No books found for title' });
});
router.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.status(200).json(book.reviews) : res.status(404).json({ message: 'Book not found' });
});

// Assignment task 11: asynchronous Axios lookups against this API.
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
async function getAllBooks() { return (await axios.get(`${BASE_URL}/`)).data; }
async function getBookByISBN(isbn) { return (await axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`)).data; }
async function getBooksByAuthor(author) { return (await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`)).data; }
async function getBooksByTitle(title) { return (await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)).data; }

module.exports.general = router;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
