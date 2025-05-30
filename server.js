// server.js
require("dotenv").config();                // .env 로드
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

// ----------------------
// 1) MongoDB 연결
// ----------------------
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/movie_recommend";
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ----------------------
// 2) User 모델 정의
// ----------------------
const userSchema = new mongoose.Schema({
  googleId:     { type: String, required: true, unique: true },
  email:        { type: String, required: true },
  displayName:  { type: String },
  preferences: {
    favoriteGenres: { type: [String], default: [] },
    gender:         { type: String, default: '' },
    age:            { type: String, default: '' }
  }
}, {
  timestamps: true
});
const User = mongoose.model("User", userSchema);

// ----------------------
// 3) Express & 미들웨어
// ----------------------
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(session({
  secret: "my_session_secret",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "/")));

// ----------------------
// 4) Passport 구글 OAuth
// ----------------------
passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL:  "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    const userInfo = {
      googleId:    profile.id,
      email:       profile.emails?.[0].value || "",
      displayName: profile.displayName
    };
    done(null, userInfo);
  }
));
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// ----------------------
// 5) OAuth Redirect 흐름
// ----------------------
app.get("/auth/google", (req, res, next) => {
  const redirect = req.query.redirect || "/";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirect,
    prompt: "select_account"
  })(req, res, next);
});
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login-failed" }),
  async (req, res) => {
    try {
      const { googleId, email, displayName } = req.user;
      const user = await User.findOneAndUpdate(
        { googleId },
        { $set: { email, displayName } },
        { new: true, upsert: true }
      );
      const token = jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      const redirect = req.query.state || "/";
      const delimiter = redirect.includes("?") ? "&" : "?";
      res.redirect(`${redirect}${delimiter}token=${token}`);
    } catch (err) {
      console.error("OAuth 콜백 처리 중 오류:", err);
      res.redirect("/login-failed");
    }
  }
);

// ----------------------
// 6) 로그인 실패
// ----------------------
app.get("/login-failed", (req, res) => {
  res.send("로그인 실패! 다시 시도하세요.");
});

// ----------------------
// 7) 프로필 조회
// ----------------------
app.get("/api/profile", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ message: "Profile data", userData: user });
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

// ----------------------
// 8) 선호 설정 저장
// ----------------------
app.post("/api/user/preferences", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  const token = authHeader.replace("Bearer ", "");
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
  const { favoriteGenres, gender, age } = req.body;
  const updates = {};
  if (favoriteGenres) updates["preferences.favoriteGenres"] = favoriteGenres;
  if (gender)         updates["preferences.gender"] = gender;
  if (age)            updates["preferences.age"] = age;
  try {
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: updates },
      { new: true }
    );
    return res.json({ success: true, preferences: user.preferences });
  } catch (err) {
    console.error("선호 정보 저장 실패:", err);
    return res.status(500).json({ error: "DB update failed" });
  }
});

// ----------------------
// 9) 사용자 선호 장르만 조회
// ----------------------
app.get("/api/user/genres", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const genres = user.preferences.favoriteGenres || [];
    return res.json({ success: true, genres });
  } catch (err) {
    console.error("장르 조회 실패:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
});

// ----------------------
// 10) 장르 기반 추천 영화 제공
// ----------------------
const TMDB_API_KEY = '999dc9586a0cbbaf8d1f914c3b6bcdff'; 

app.get("/api/recommendations", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  const token = authHeader.replace("Bearer ", "");
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const genreName = req.query.genre;
  if (!genreName) return res.status(400).json({ error: "genre is required" });

  const genreMap = {
    액션: 'Action',
    코미디: 'Comedy',
    SF: 'Science Fiction',
    로맨스: 'Romance',
    공포: 'Horror',
    스릴러: 'Thriller',
    음악: 'Music',
    애니메이션: 'Animation',
    다큐멘터리: 'Documentary',
    판타지: 'Fantasy'
  };

  const translatedGenre = genreMap[genreName] || genreName;

  try {
    const genreListRes = await axios.get(`https://api.themoviedb.org/3/genre/movie/list`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "en-US"
      }
    });

    const genreData = genreListRes.data.genres;
    const matched = genreData.find(g => g.name === translatedGenre);
    if (!matched) return res.status(404).json({ error: "Unknown genre" });

    const movieRes = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        with_genres: matched.id,
        sort_by: "popularity.desc",
        language: "ko-KR",
        page: 1
      }
    });

    return res.json({ results: movieRes.data.results });
  } catch (err) {
    console.error("TMDB 호출 실패:", err.message);
    return res.status(500).json({ error: "TMDB API error" });
  }
});

// ----------------------
// 11) 서버 시작
// ----------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
