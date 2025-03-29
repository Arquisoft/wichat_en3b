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
        //Add statistics for the new user
        await (new UserStatistics({ username: newUser.username })).save();
        res.json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message }); 
    }});

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
  try{
    
    const userStats = await UserStatistics.findOne({ username: newGame.username });

    let oldTotalGamesPlayed = userStats.totalGamesPlayed;
    let oldAvgScore = userStats.avgScore;
    let oldHighScore = userStats.highScore;
    let oldCorrectRate = userStats.correctRate;

    await UserStatistics.findOneAndUpdate({ username: newGame.username }, {
      $inc: { totalGamesPlayed: 1 },
      $set:{
        avgScore: calculateNewAvg(newGame.score, oldTotalGamesPlayed, oldAvgScore),
        highscore : oldHighScore < newGame.score ? newGame.score : oldHighScore,
        correctRate: calculateNewAvg(newGame.correctRate, oldTotalGamesPlayed, oldCorrectRate)
      }
    });
  }catch(error){
    console.log(error);
  }

}

function calculateNewAvg(newRate, totalGamesPlayed, oldAvg) {

    let newAvg = (totalGamesPlayed * oldAvg + newRate) / (totalGamesPlayed + 1);

    return newAvg;
}

app.get('/userstats/:username', async (req, res) => {
  try {
      const userId = req.params.username;

      const userStats = await UserStatistics.findOne({ username: userId });

      if (!userStats) {
          return res.status(404).json({ error: 'User statistics not found' });
      }

      res.json(userStats);
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