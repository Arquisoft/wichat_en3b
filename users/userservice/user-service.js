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
    }});


app.post('/addGame', async (req, res) => {
    try {
        validateRequiredFields(req, ['userId', 'playedAt', 'score', 'correctRate', 'gameMode']);

        const MAX_GAMES = 100;

        const gameCount = await Game.countDocuments({ userId: req.body.userId });

        //Deletes the oldest game when max capacity is reached
        if (gameCount >= MAX_GAMES) {
          const oldestGame = await Game.findOne({ userId: req.body.userId }).sort({ createdAt: 1 });
          if (oldestGame) {
            await Game.findByIdAndDelete(oldestGame._id);
          }
        }

        const newGame = new Game({
            userId: req.body.userId,
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
    /* const userStats = await UserStatistics.findOneAndDelete({ userId: newGame.userId });

    if (!userStats) {
      userStats = new UserStatistics({
        userId: newGame.userId
      });
    }

    userStats.totalGamesPlayed += 1;
    userStats.avgScore = calculateAvgScore(newGame.score, userStats.totalGamesPlayed, userStats.avgScore);
    userStats.highScore = userStats.highScore < newGame.score ? newGame.score : userStats.highScore;
    userStats.correctRate = calculateCorrectRate(newGame.correctRate, userStsats.totalGamesPlayed, userStats.correctRate);

    await userStats.save();  */
    const userStats = await UserStatistics.findOne({ userId: newGame.userId });

    let oldTotalGamesPlayed = userStats?.totalGamesPlayed || 0;
    let oldAvgScore = userStats?.avgScore || 0;
    let oldHighScore = userStats?.highScore || 0;
    let oldCorrectRate = userStats?.correctRate || 0;

    const newuserStats = await UserStatistics.findOneAndUpdate({ userId: newGame.userId }, {
      $setOnInsert: { userId: newGame.userId },
      $set:{
        totalGamesPlayed: oldTotalGamesPlayed + 1,
        avgScore: calculateAvgScore(newGame.score, oldTotalGamesPlayed, oldAvgScore),
        highscore : oldHighScore < newGame.score ? newGame.score : oldHighScore,
        correctRate: calculateCorrectRate(newGame.correctRate, oldTotalGamesPlayed, oldCorrectRate)
      }
    }, { upsert: true, new: true });
  }catch(error){
    console.log(error);
  }

}

function calculateCorrectRate(gameRate, totalGamesPlayed, CorrectRate) {

    let newCorrectRate = (totalGamesPlayed * CorrectRate + gameRate) / (totalGamesPlayed + 1);

    return newCorrectRate;
}

function calculateAvgScore(newScore, totalGamesPlayed, avgScore) {

    let newAvgScore = (totalGamesPlayed * avgScore + newScore) / (totalGamesPlayed + 1);

    return newAvgScore;
}

const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});

// Listen for the 'close' event on the Express.js server
server.on('close', () => {
    // Close the Mongoose connection
    mongoose.connection.close();
  });

module.exports = server