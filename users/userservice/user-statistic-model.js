const mongoose = require('mongoose');

const userStatisticSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  mode: {
    type: String,
    required: true,
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  correctRate: {
    type: Number,
    default: 0,
  },
  totalGamesPlayed: {
    type: Number,
    default: 0,
  },
});

const UserStatistics = mongoose.model('UserStatistic', userStatisticSchema);

module.exports = UserStatistics;