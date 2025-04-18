require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use(session({
  secret: "my_session_secret",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// .env
const PORT = process.env.PORT || 3000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, "/")));

/**
 * Passport Google Strategy
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      // scope: ["profile", "email"] 를 authenticate 단계에서 지정 가능
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // profile: 구글 사용자 정보
        const user = {
          googleId: profile.id,
          email: profile.emails?.[0].value || null,
          displayName: profile.displayName,
        };
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

/**
 * 1) GET /auth/google
 *    로그인 시작: 여기서 redirect 파라미터를 state로 넘김
 */
app.get("/auth/google", (req, res, next) => {
  const redirect = req.query.redirect || "/"; 
  // 사용자가 없으면 기본("/")으로

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirect 
    // passport-google-oauth20가 자동으로 ?state=...를 callback에 전달
  })(req, res, next);
});

/**
 * 2) GET /auth/google/callback
 *    구글 로그인 완료 후 돌아오는 콜백
 */
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login-failed" }),
  (req, res) => {
    // 인증 성공 → req.user
    const user = req.user;

    // JWT 발급
    const token = jwt.sign(
      {
        googleId: user.googleId,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 어디로 돌아갈지: passport가 state로 넘겨준 값 = req.query.state
    const redirect = req.query.state || "/";
    // 예) "/movies?genre=SF"

    // 1) 토큰을 쿼리파라미터로 붙이는 방법
    // "/movies?genre=SF" + (구분자 ? or &) + "token=..."
    // 구분자를 결정해야 함 (원본 URL에 이미 ?가 있으면 &를 써야 함)
    const hasQuery = redirect.includes("?");
    const delimiter = hasQuery ? "&" : "?";
    const redirectUrl = `${redirect}${delimiter}token=${token}`;

    // 최종적으로 이전 화면 + token 으로 보냄
    res.redirect(redirectUrl);
  }
);

/**
 * 3) 예시: 로그인 실패 라우트
 */
app.get("/login-failed", (req, res) => {
  res.send("로그인 실패! 다시 시도하세요.");
});

/**
 * 4) 예시: JWT 확인용 라우트
 */
app.get("/api/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ message: "Profile data", userData: decoded });
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
