const mongoose = require('mongoose');

// 사용자 스키마 정의
const userSchema = new mongoose.Schema({
  googleId:     { type: String, required: true, unique: true },
  email:        { type: String, required: true },
  displayName:  { type: String },
  preferences: {
    favoriteGenres: { type: [String], default: [] },
    favoriteActors: { type: [String], default: [] },
    gender:         { type: String, default: '' }, // 남성, 여성, 기타 등
    age:            { type: String, default: '' }  // 예: "20대", "30대"
  }
}, {
  timestamps: true // createdAt, updatedAt 자동 생성
});

module.exports = mongoose.model('User', userSchema);