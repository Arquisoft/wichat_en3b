const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    createdAt: Date,
    refreshToken: String
});

const User = mongoose.model('User', userSchema);

module.exports = User