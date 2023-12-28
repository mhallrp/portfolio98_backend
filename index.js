const userRoutes = require(`./routes/users`)
const quizRoutes = require(`./routes/quiz`)
const express = require(`express`)
const cors = require (`cors`)
const session = require(`express-session`)
const jwt = require(`jsonwebtoken`)
const app = express()
const helmet = require(`helmet`)

app.use(express.json());

app.use(helmet());

app.use(session({
  secret: process.env.SESSION_SECRET,
  proxy: true,
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure:true
  }
}));

app.use(cors({
  origin: "https://quiz.matt-hall.dev",
  credentials: true,
}));

app.use("/user", userRoutes);

app.use("/", function auth(req, res, next) {
  const origin = req.get('origin');
  if (origin !== "https://quiz.matt-hall.dev") {
    return res.status(403).send("Forbidden origin");
  }
  res.set('Cache-Control', 'no-store');
  if (req.session.authorization) {
    let token = req.session.authorization['accessToken'];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).send("Invalid token");
      }
      req.user = user;
      if (req.path.startsWith("/quiz")) {
        next();
      } else {
        res.status(200).send("Session active");
      }
    });
  } else {
    res.status(403).send("No active session");
  }
});

app.use("/quiz", quizRoutes);

app.listen(process.env.PORT);