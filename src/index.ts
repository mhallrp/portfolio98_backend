import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { Pool } from 'pg';

const app = express();

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : undefined,
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

app.use(cors({
  origin: ["https://portfolio98.matt-hall.dev", "http://localhost:3000"],
  credentials: true
}));


app.use("/", function auth(req:Request, res:Response, next:NextFunction) {
  if (process.env.APP_API_KEY !== req.get("X-API-Key")) {
    return res.status(403).json({ error: "Forbidden" });
  } else {
    next();
  }
});

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    proxy: true,
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 3600000,
    },
  })
);

app.use("/user", userRoutes);

app.use("/quiz", quizRoutes);

app.use("/score", scoreRoutes);

app.use("/generate", generateRoutes);

interface UserData{
  name:string;
  score:number;
}

const response = (res:Response, success:boolean, code:number, data:UserData) => {
  res.status(code).json({ success, data });
};

app.use("/", async function auth(req:Request, res) {
  if (req.session.user) {
    const userId = req.session.user.id;
    try {
      const results = await pool.query(
        "SELECT username, total_score FROM users WHERE id = $1",
        [userId]
      );
      if (results.rowCount === 0) {
        response(res, false, 404, { name: "", score: 0 });
      } else {
        const user = results.rows[0];
        response(res, true, 200, {
          name: user.username,
          score: user.total_score,
        });
      }
    } catch (dbErr) {
      response(res, false, 500, { name: "", score: 0 });
    }
  } else {
    response(res, false, 403, { name: "", score: 0 });
  }
});

app.listen(process.env.PORT);
