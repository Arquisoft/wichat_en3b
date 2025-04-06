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



// Function to validate required fields in the request body
function validateRequiredFields(req, requiredFields) {

  const passwordRegExp = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  const usernameRegex = /^\w+$/;


  for (const field of requiredFields) {
    
    if (!(field in req.body)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (!usernameRegex.test(req.body.username)) {
    throw new Error('The username is not valid. It needs a number, a special character and at least a capital letter and a lowercase letter.');
  }

  if (!passwordRegExp.test(req.body.password)) {
    throw new Error('Password must have at least one capital letter, one digit and one special character.');
  }

  if(!req.body.password || req.body.password.length < 8)
    throw new Error('The lenght of the password must be of 8 characters or more. ')
  
}

app.post('/adduser', async (req, res) => {
  try {
    // Check if required fields are present in the request body
    validateRequiredFields(req, ['username', 'password']);

    const usersOnSystem = await User.find({ username: req.body.username }).lean();
    if (usersOnSystem.length > 0) {
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

    const questions = req.body.questions;
    const score = questions.reduce((acc, question) => acc + (question.isCorrect ? question.pointsIncrement : 0), 0);
    const correctRate = questions.reduce((acc, question) => acc + (question.isCorrect ? 1 : 0), 0) / questions.length;
    const gameMode = [...new Set(questions.map(question => question.mode))];
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
    for (const mode of newGame.gameMode) {
      // Filter questions for the current mode
      const modeQuestions = questions.filter(question => question.mode === mode);
      if (modeQuestions.length === 0) continue; // Skip if no questions for this mode

      // Calculate partial statistics for the current mode
      const score = modeQuestions.reduce((acc, question) => acc + (question.isCorrect ? question.pointsIncrement : 0), 0);
      const correctRate = modeQuestions.reduce((acc, question) => acc + (question.isCorrect ? 1 : 0), 0) / modeQuestions.length;
      const questionsAnswered = modeQuestions.length;

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

app.get('/userstats/user/:username', async (req, res) => {
  try {
    const username = req.params.username;

    const userStats = await UserStatistics.find({ username: username });

    res.json({ message: `Fetched statistics for user: ${username}`, stats: userStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/userstats/mode/:mode', async (req, res) => {
  try {
    const mode = req.params.mode;

    let userStats;
    if (mode === "all") {
      // Aggregate user statistics for all modes
      userStats = await UserStatistics.aggregate([
        {
          $group: {
            _id: "$username",
            username: { $first: "$username" },
            totalScore: { $sum: "$totalScore" },
            correctRate: { $avg: "$correctRate" },
            totalQuestions: { $sum: "$totalQuestions" },
            totalGamesPlayed: { $sum: "$totalGamesPlayed" },
          }
        },
      ]);
    } else {
      // Find user statistics for a specific mode
      userStats = await UserStatistics.find({ mode: mode });
    }

    res.json({ message: `Fetched statistics for mode: ${mode}`, stats: userStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/userstats/:username/:mode', async (req, res) => {
  try {
    const username = req.params.username;
    const mode = req.params.mode;

    let userStats;
    if (mode === "all") {
      // Fetch all user statistics for the given username
      const stats = await UserStatistics.find({ username: username });

      if (stats.length === 0) {
        return res.json({ message: `No statistics found for user: ${username}`, stats: {} });
      }

      // Calculate weighted average accuracy
      let totalCorrectAnswers = 0;
      let totalQuestionsAnswered = 0;

      stats.forEach(stat => {
        const correctAnswersForMode = stat.correctRate * stat.totalQuestions;
        totalCorrectAnswers += correctAnswersForMode;
        totalQuestionsAnswered += stat.totalQuestions;
      });

      const weightedAccuracy = totalQuestionsAnswered > 0
        ? totalCorrectAnswers / totalQuestionsAnswered
        : 0;

      userStats = {
        username: username,
        totalScore: stats.reduce((sum, stat) => sum + stat.totalScore, 0),
        correctRate: weightedAccuracy, // Use weighted accuracy
        totalGamesPlayed: stats.reduce((sum, stat) => sum + stat.totalGamesPlayed, 0),
        totalQuestions: totalQuestionsAnswered, // Total questions answered
      };
    } else {
      // Find user statistics for a specific mode
      userStats = await UserStatistics.findOne({ username: username, mode: mode });
    }

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