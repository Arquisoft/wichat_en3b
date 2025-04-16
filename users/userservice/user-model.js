const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true, 
      minlength: 3, 
      maxlength: 15, 
      match: /^\w+$/,
    },
    password: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now, 
    },
    refreshToken: {
      type: String,
    },
    coins: {
      type: Number,
      default: 1000, // Default coins for new users
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User