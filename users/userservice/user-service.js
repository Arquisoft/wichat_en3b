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
  for (const field of requiredFields) {
    if (!(field in req.body)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

app.post('/adduser', async (req, res) => {
  try {
    // Check if required fields are present in the request body
    validateRequiredFields(req, ['username', 'password']);

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
    validateRequiredFields(req, ['username', 'score', 'correctRate', 'gameMode']);

    const MAX_GAMES = 100;

    const gameCount = await Game.countDocuments({ username: req.body.username });

    //Deletes the oldest game when max capacity is reached
    if (gameCount >= MAX_GAMES) {
      const oldestGame = await Game.findOne({ username: req.body.username }).sort({ createdAt: 1 });
      if (oldestGame) {
        await Game.findByIdAndDelete(oldestGame._id);
      }
    }

    const newGame = new Game({
      username: req.body.username,
      score: req.body.score,
      correctRate: req.body.correctRate,
      gameMode: req.body.gameMode,
    });

    await newGame.save();
    calculateUserStatistics(newGame);
    res.json(newGame);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Function only called when a new game is added
async function calculateUserStatistics(newGame) {
  try {
    const userStats = await UserStatistics.findOne({ username: newGame.username, mode: newGame.gameMode });

    // Create a new user statistics entry if it doesn't exist
    if (!userStats) {
      const newUserStats = new UserStatistics({
        username: newGame.username,
        mode: newGame.gameMode[0], // temporary fix for mode (this depends on how we save the stats for each question during game)
        totalScore: newGame.score,
        correctRate: newGame.correctRate,
        totalGamesPlayed: 1,
      });
      await newUserStats.save();
      return;
    }

    let oldTotalGamesPlayed = userStats.totalGamesPlayed;
    let oldTotalScore = userStats.totalScore;
    let oldCorrectRate = userStats.correctRate;

    await UserStatistics.findOneAndUpdate({ username: newGame.username, mode: newGame.gameMode }, {
      $inc: { totalGamesPlayed: 1 },
      $set: {
        totalScore: oldTotalScore + newGame.score,
        correctRate: calculateNewAvg(newGame.correctRate, oldTotalGamesPlayed, oldCorrectRate)
      }
    });
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

    res.json({message: `Fetched statistics for user: ${username}`, stats: userStats});
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
            totalGamesPlayed: { $sum: "$totalGamesPlayed" },
          }
        },
      ]);
    } else {
      // Find user statistics for a specific mode
      userStats = await UserStatistics.find({ mode: mode });
    }

    res.json({message: `Fetched statistics for mode: ${mode}`, stats: userStats});
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