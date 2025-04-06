const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    correctRate: {
      type: Number,
      required: true,
    },
    gameTopic:{
        type: [String],
        required: true,
    }
},{ timestamps: true }); 

const Game = mongoose.model('GameStatistic', gameSchema);

module.exports = Game;