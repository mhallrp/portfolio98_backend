const express = require(`express`);
const cors = require(`cors`);
const session = require(`express-session`);

const helmet = require(`helmet`);
const app = express();
let origin = undefined;
const { Pool } = require("pg");
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

pool.connect((err) => {
  if (err) {
    console.error("Error connecting to PostgreSQL Database:", err);
    return;
  }
  console.log("Connected to PostgreSQL Database!");
});

const userRoutes = require("./routes/users")(pool);
const quizRoutes = require(`./routes/quiz`)(pool);
const scoreRoutes = require(`./routes/score`)(pool);
const generateRoutes = require(`./routes/generate`);

app.use(express.json());

app.use(helmet());

app.use(
  cors({
    origin: ["http://localhost:3000", "https://portfolio98.matt-hall.dev"],
    credentials: true,
  })
);

app.use("/", function auth(req, res, next) {
  origin = req.get("origin");
  if (process.env.APP_API_KEY !== req.get("X-API-Key")) {
    console.log("ORIGIN FORBIDDEN!")
    return res.status(403).json({ error: "Forbidden origin" });
  } else {
    console.log("ORIGIN ALL GOOD")
    next();
  }
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    proxy: true,
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      sameSite: origin === "https://portfolio98.matt-hall.dev" ? "none" : "lax",
      secure: origin === "https://portfolio98.matt-hall.dev",
      maxAge: 3600000,
    },
  })
);

app.use("/user", userRoutes);

app.use("/quiz", quizRoutes);

app.use("/score", scoreRoutes);

app.use("/generate", generateRoutes);

const response = (res, success, code, data = null) => {
  res.status(code).json({ success, data });
};

app.use("/", async function auth(req, res) {
  if (req.session.user) {
    const userId = req.session.user.id;
    try {
      const results = await pool.query(
        "SELECT username, total_score FROM users WHERE id = $1",
        [userId]
      );
      if (results.rowCount === 0) {
        response(res, false, 404, { name: "", score: 0 } );
      } else {
        const user = results.rows[0];
        response(res, true, 200, { name: user.username, score: user.total_score });
      }
    } catch (dbErr) {
      response(res, false, 500, { name: "", score: 0 } );
    }
  } else {
    response(res, false, 403, { name: "", score: 0 } );
  }
});

app.listen(process.env.PORT);
