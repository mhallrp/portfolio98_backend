import { Router } from "express";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const router = Router();

module.exports = (pool: Pool) => {
  router.post("/register", async (req, res) => {
    const { username, password } = req.body.user;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      pool.query(
        "SELECT username FROM users WHERE username = $1",
        [username],
        (err, result) => {
          if (err) {
            return res.status(500).json({ message: "Database error" });
          } else if (result.rows.length > 0) {
            return res.status(403).json({ message: "User already exists" });
          } else {
            pool.query(
              "INSERT INTO users (username, password) VALUES ($1, $2)",
              [username, hashedPassword],
              (insertErr) => {
                if (insertErr) {
                  return res
                    .status(500)
                    .json({ message: "Database error on user creation" });
                }
                return res
                  .status(200)
                  .json({ message: "User added successfully" });
              }
            );
          }
        }
      );
    } catch (hashErr) {
      return res.status(500).json({ message: "Error" });
    }
  });

  router.post("/login", async (req, res) => {
    const { username, password } = req.body.user;
    if (!username || !password) {
      return res.status(400).json({ message: "Incomplete data" });
    }
    pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
      async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.rowCount === 0)
          return res.status(401).json({ message: "Invalid credentials" });
        const user = results.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword)
          return res.status(401).json({ message: "Invalid credentials" });
        req.session.user = { id: user.id, username: user.username };
        return res
          .status(200)
          .json({
            message: "Login successful",
            name: user.username,
            score: user.total_score,
          });
      }
    );
  });

  router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logout successful" });
    });
  });

  return router;
};
