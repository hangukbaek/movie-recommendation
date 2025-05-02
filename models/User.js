// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId:     { type: String, required: true, unique: true },
  email:        { type: String, required: true },
  displayName:  String,
  preferences: {
    favoriteGenres: { type: [String], default: [] },
    favoriteActors: { type: [String], default: [] },
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
