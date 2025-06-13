require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");

const app = express();

// 환경 변수
const PORT = process.env.PORT || 3000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

// 미들웨어
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
  secret: "my_session_secret",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// 정적 파일 제공
app.use(express.static(path.join(__dirname)));

// Google OAuth 설정
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = {
        googleId: profile.id,
        email: profile.emails?.[0].value || null,
        displayName: profile.displayName,
      };
      done(null, user);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// 구글 로그인 시작
app.get("/auth/google", (req, res, next) => {
  const redirect = req.query.redirect || "/";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirect,
  })(req, res, next);
});

// 로그인 콜백 처리
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login-failed" }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      {
        googleId: user.googleId,
        email: user.email,
        displayName: user.displayName,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const redirect = req.query.state || "/";
    const hasQuery = redirect.includes("?");
    const delimiter = hasQuery ? "&" : "?";
    const redirectUrl = `${redirect}${delimiter}token=${token}`;
    res.redirect(redirectUrl);
  }
);

// 로그인 실패
app.get("/login-failed", (req, res) => {
  res.send("로그인에 실패했습니다. 다시 시도해주세요.");
});

// JWT 토큰 검증용 API
app.get("/api/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ message: "Profile data", userData: decoded });
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

// 마이페이지 파일 제공
app.get("/mypage.html", (req, res) => {
  res.sendFile(path.join(__dirname, "mypage.html"));
});

// 루트 페이지 제공
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ 서버가 실행 중입니다: http://localhost:${PORT}`);
});
