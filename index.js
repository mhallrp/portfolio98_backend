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
    sameSite: 'strict',
  }
}));

app.use(cors({
  origin: "https://quiz.matt-hall.dev",
  credentials: true,
}));

app.use("/user", userRoutes);

app.use("/", function auth(req, res, next) {
  var origin = req.get('origin');
  console.log("this is origin " + origin)
  res.set('Cache-Control', 'no-store');
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

app.listen(PORT);