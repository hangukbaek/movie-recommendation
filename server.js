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
  displayName:  String,
  preferences: {
    favoriteGenres: { type: [String], default: [] },
    favoriteActors: { type: [String], default: [] },
  }
}, { timestamps: true });

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

// 정적 파일 서빙 (index.html, main.js, style.css 등)
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
    // profile에서 필요한 정보 추출
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
// 5-1) 로그인 시작
app.get("/auth/google", (req, res, next) => {
  // passport 0.6.x 이상: req.logout(callback)
  req.logout(err => {
    if (err) console.error("Logout error:", err);
    const redirect = req.query.redirect || "/";
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: redirect
    })(req, res, next);
  });
});


// 5-2) 콜백 처리
app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login-failed" }),
  async (req, res) => {
    try {
      // req.user 에서 profile info 꺼내기
      const { googleId, email, displayName } = req.user;

      // DB에 upsert (없으면 생성, 있으면 업데이트)
      const user = await User.findOneAndUpdate(
        { googleId },
        { $set: { email, displayName } },
        { new: true, upsert: true }
      );

      // JWT 발급 (payload에 user._id 사용)
      const token = jwt.sign(
        { userId: user._id, googleId: user.googleId },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      // state 로 넘어온 redirect URL 에 token 붙여서 리다이렉트
      const redirect = req.query.state || "/";
      const hasQuery = redirect.includes("?");
      const delimiter = hasQuery ? "&" : "?";
      const redirectUrl = `${redirect}${delimiter}token=${token}`;

      res.redirect(redirectUrl);
    } catch (err) {
      console.error("OAuth 콜백 처리 중 오류:", err);
      res.redirect("/login-failed");
    }
  }
);

// ----------------------
// 6) 로그인 실패 라우트
// ----------------------
app.get("/login-failed", (req, res) => {
  res.send("로그인 실패! 다시 시도하세요.");
});

// ----------------------
// 7) JWT 검증용 예시 API
// ----------------------
app.get("/api/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ message: "Profile data", userData: decoded });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});

// ----------------------
// 8) 사용자 선호 설정 저장 API
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

  const { favoriteGenres, favoriteActors } = req.body;
  const updates = {};
  if (favoriteGenres) updates["preferences.favoriteGenres"] = favoriteGenres;
  if (favoriteActors) updates["preferences.favoriteActors"] = favoriteActors;

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
// 9) 서버 시작
// ----------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
