// user-service.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./user-model')
const UserStatistics = require('./user-statistic-model')
const Game = require('./game-model')
const app = express();
const port = 8001;

// Middleware to parse JSON in request body
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);

const checkInput = (input) => {
  return  String(input).replace(/[^a-zA-Z0-9_]/g, '');
};

function validateRequiredFields(req, requiredFields) {
  for (const field of requiredFields) {
    if (!(field in req.body)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

// Function to validate required fields in the request body
function validateUser(req) {
  validateRequiredFields(req, ['username', 'password']);

  const passwordRegExp = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  const usernameRegExp = /^\w+$/;

  if (!usernameRegExp.test(req.body.username)) {
    throw new Error(`The username is not valid.`);
  }

  if (!passwordRegExp.test(req.body.password)) {
    throw new Error(`Password must have at least one capital letter, one digit and one special character.`);
  }

  if(!req.body.password || req.body.password.length < 8)
    throw new Error(`The length of the password must be of 8 characters or more. `); 
  
  if (req.body.username.length < 3) {
    throw new Error(`The length of the username is not valid.`);
  }
}

app.post('/adduser', async (req, res) => {
  try {
    // Check if required fields are present in the request body
    validateUser(req);

    // Sanitize username to prevent MongoDB injection attacks
    const checkedUsername  = checkInput(req.body.username);

    const existingUsers = await User.find({ username: checkedUsername }).lean();
    if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
    }

    // Encrypt the password before saving it
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
    });

    await newUser.save();
    res.json(newUser);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
      res.status(400).json({ error: "Username already taken" });
    } 
    res.status(400).json({ error: error.message });

  }
});

//Saves a completed game to the database and updates the user stats
app.post('/addgame', async (req, res) => {
  try {
    validateRequiredFields(req, ['username', 'questions']);

    const MAX_GAMES = 100;

    const gameCount = await Game.countDocuments({ username: req.body.username });

    //Deletes the oldest game when max capacity is reached
    if (gameCount >= MAX_GAMES) {
      const oldestGame = await Game.findOne({ username: req.body.username }).sort({ createdAt: 1 });
      if (oldestGame) {
        await Game.findByIdAndDelete(oldestGame._id);
      }
    }

    // Calculate game statistics
    const questions = req.body.questions;
    const score = questions.reduce((acc, question) => acc + (question.isCorrect ? question.pointsIncrement : 0), 0);
    const correctRate = questions.reduce((acc, question) => acc + (question.isCorrect ? 1 : 0), 0) / questions.length;
    const gameMode = [...new Set(questions.map(question => question.mode))];
    // Create a new game entry
    const newGame = new Game({
      username: req.body.username,
      score: score,
      correctRate: correctRate,
      gameMode: gameMode,
    });

    await newGame.save();
    calculateUserStatistics(newGame, questions);
    res.json(newGame);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Function only called when a new game is added
async function calculateUserStatistics(newGame, questions) {
  try {
    for (const mode of [...newGame.gameMode, "all"]) {
      let score;
      let correctRate;
      let questionsAnswered;
      // Calculate statistics for the current mode
      if (mode === "all") {
        // Get global statistics from the game
        score = newGame.score;
        correctRate = newGame.correctRate;
        questionsAnswered = questions.length;
      } else {
        // Filter questions for the current mode
        const modeQuestions = questions.filter(question => question.mode === mode);
        
        // Calculate partial statistics for the current mode
        score = modeQuestions.reduce((acc, question) => acc + (question.isCorrect ? question.pointsIncrement : 0), 0);
        correctRate = modeQuestions.reduce((acc, question) => acc + (question.isCorrect ? 1 : 0), 0) / modeQuestions.length;
        questionsAnswered = modeQuestions.length;
      }

      // Find existing user statistics for the current mode
      const userStats = await UserStatistics.findOne({ username: newGame.username, mode: mode });

      if (!userStats) {
        // Create a new user statistics entry if it doesn't exist
        const newUserStats = new UserStatistics({
          username: newGame.username,
          mode: mode,
          totalScore: score,
          correctRate: correctRate,
          totalQuestions: questionsAnswered,
          totalGamesPlayed: 1,
        });
        await newUserStats.save();
      } else {
        // Update existing user statistics
        const oldTotalGamesPlayed = userStats.totalGamesPlayed;
        const oldTotalScore = userStats.totalScore;
        const oldCorrectRate = userStats.correctRate;

        await UserStatistics.findOneAndUpdate(
          { username: newGame.username, mode: mode },
          {
            $inc: { totalGamesPlayed: 1, totalQuestions: questionsAnswered },
            $set: {
              totalScore: oldTotalScore + score,
              correctRate: calculateNewAvg(correctRate, oldTotalGamesPlayed, oldCorrectRate),
            },
          }
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
}

function calculateNewAvg(newRate, totalGamesPlayed, oldAvg) {
  return (totalGamesPlayed * oldAvg + newRate) / (totalGamesPlayed + 1);
}

// Find user statistics for a specific user
app.get('/userstats/user/:username', async (req, res) => {
  try {
    const username = req.params.username;

    const userStats = await UserStatistics.find({ username: username });

    res.json({ message: `Fetched statistics for user: ${username}`, stats: userStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Find user statistics for a specific mode
app.get('/userstats/mode/:mode', async (req, res) => {
  try {
    const mode = req.params.mode;

    const userStats = await UserStatistics.find({ mode: mode });

    res.json({ message: `Fetched statistics for mode: ${mode}`, stats: userStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Find user statistics for a specific user and mode
app.get('/userstats/:username/:mode', async (req, res) => {
  try {
    const username = req.params.username;
    const mode = req.params.mode;

    const userStats = await UserStatistics.findOne({ username: username, mode: mode });

    res.json({ message: `Fetched statistics for user ${username} in mode ${mode}`, stats: userStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});

// Listen for the 'close' event on the Express.js server
server.on('close', () => {
  // Close the Mongoose connection
  mongoose.connection.close();
});

module.exports = server