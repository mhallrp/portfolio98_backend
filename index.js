const userRoutes = require('./routes/users');
const quizRoutes = require('./routes/quiz');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const http = require('http');
const jwt = require('jsonwebtoken');
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.use(session({
  secret: 'your_secret_key',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  }
}));
app.use(cors({
  origin: "https://mhallrp.github.io",
  credentials: true,
}));

// PUBLIC USER ROUTES TO ALLOW LOGIN
app.use("/user", userRoutes);

//USER AUTHENTICATION AND SUBSEQUENT QUIZ LOGIN
app.use("/", function auth(req, res, next) {
  res.set('Cache-Control', 'no-store');
  console.log("something")
  if (req.session.authorization) {
    let token = req.session.authorization['accessToken'];
    jwt.verify(token, 'access', (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else {
        console.log('JWT Verification Error:', err);
        return res.send('Hello World!');
      }
    });
  } else {
    console.log('No authorization token found in session');
    return res.status(403).json({ message: "User not logged in" });
  }
});

app.use("/quiz", quizRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});