const express = require(`express`);
const cors = require(`cors`);
const session = require(`express-session`);
const quizRoutes = require(`./routes/quiz`);
const helmet = require(`helmet`);
const app = express();

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

app.use(express.json());

app.use(helmet());

app.use((req, res, next) => {
  const apiKey = req.headers['X-API-KEY'];
  if (!apiKey || apiKey !== process.env.APP_API_KEY) {
    //result of the below console log is( Incorrect API Key, header: undefinedENV: key_19d7fb7f26639442d350b5c3924f19c107efd8b6 )
    console.log("Incorrect API Key, header: " + apiKey + "ENV: " + process.env.APP_API_KEY)
    return res.status(403).send('Invalid API Key');
  }
  console.log("Key is fine")
  next();
});

app.use((req, res, next) => {
  const allowedOrigins = ['https://quiz.matt-hall.dev', 'http://localhost:3000'];
  const origin = req.get('origin');
  console.log("This is origin " + origin)
  let isProduction = origin === 'https://quiz.matt-hall.dev';
  if (allowedOrigins.includes(origin)) {
    cors({
      origin: origin,
      credentials: true,
    })(req, res, next);

    session({
      secret: process.env.SESSION_SECRET,
      proxy: true,
      resave: true,
      saveUninitialized: true,
      cookie: {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,                    
        maxAge: 300000,
      },
    })(req, res, next);
  } else {
    next(new Error('Not allowed by CORS'));
  }
});

app.use("/user", userRoutes);

app.use("/quiz", quizRoutes);

app.use("/", async function auth(req, res) {
  if (req.session.user) {
    const userId = req.session.user.id;
    try {
      const results = await pool.query(
        "SELECT username, total_score FROM users WHERE id = $1",
        [userId]
      );
      if (results.rowCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      const user = results.rows[0];
      res
        .status(200)
        .json({ username: user.username, score: user.total_score });
    } catch (dbErr) {
      return res.status(500).json({ error: "Database error" });
    }
  } else {
    res.status(403).json({ error: "No active session" });
  }
});

app.listen(process.env.PORT);
