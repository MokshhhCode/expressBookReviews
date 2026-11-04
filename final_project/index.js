const express = require('express');
const session = require('express-session');
const customerRoutes = require('./router/auth_users.js').authenticated;
const generalRoutes = require('./router/general.js').general;

const app = express();
app.use(express.json());
app.use('/customer', session({
  secret: process.env.SESSION_SECRET || 'book-review-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'strict' }
}));
app.use('/customer', customerRoutes);
app.use('/', generalRoutes);

const PORT = process.env.PORT || 5000;
if (require.main === module) app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
module.exports = app;
