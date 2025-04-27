const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./auth-model');
const cookieParser = require('cookie-parser');
const { check, validationResult } = require('express-validator');
const app = express();
const port = 8002;

// Middleware to parse JSON in request body
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "accessTokenSecret";
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "refreshTokenSecret";

// Function to validate required fields in the request body
function validateRequiredFields(req, requiredFields) {
  for (const field of requiredFields)
    if (!(field in req.body))
      throw new Error(`Missing required field: ${field}`);
}

// Route for user login
app.post('/login', [
  check('username').isLength({ min: 3 }).trim().escape(),
  check('password').isLength({ min: 3 }).trim().escape()
], async (req, res) => {
  try {
    // Check if required fields are present in the request body
    validateRequiredFields(req, ['username', 'password']);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().toString() });
    }

    const username = req.body.username.toString();
    const password = req.body.password.toString();

    // Find the user by username in the database
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign({ userId: user._id, username: username, role: user.role }, accessTokenSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id, username: username, role: user.role }, refreshTokenSecret, { expiresIn: '7d' });

    user.refreshToken = refreshToken;
    await user.save();

    // Set the token in a cookie
    res.cookie("jwt", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    // Respond with the token and user information
    res.json({ accessToken, username: username, createdAt: user.createdAt });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post("/logout", async (req, res) => {
  res.clearCookie("jwt");
  res.json({ message: "Logged out successfully" });
});

// Used to check the validity of the token
app.get("/refresh", async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) return res.status(403).json({ error: "Forbidden" });
  const refreshToken = cookies.jwt;

  const user = await User.findOne({ refreshToken }).exec();
  if (!user) return res.status(403).json({ error: "Forbidden" });

  jwt.verify(refreshToken,
    "refreshTokenSecret",
    (err, decoded) => {
      if (err || user.username !== decoded.username) return res.status(403).json({ error: "Forbidden" });

      const accessToken = jwt.sign({ userId: user._id, username: user.username, role: user.role }, accessTokenSecret, { expiresIn: '15m' });
      res.status(200).json({ username: user.username, accessToken });
    }
  );
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Auth Service listening at http://localhost:${port}`);
});

server.on('close', () => {
  // Close the Mongoose connection
  mongoose.connection.close();
});

module.exports = server;