import { Router } from "express";
import { Pool } from "pg";

const router = Router();

module.exports = (pool:Pool) => {
  router.get("/trivia", async (req, res) => {
    const categoryId = req.query.category;
  
    try {
      const queryResult = await pool.query("SELECT DISTINCT category FROM quiz");
      const categories = queryResult.rows.map((row) => row.category);
  
      if (categoryId !== undefined && typeof categoryId === "number") {
        const categoryIdAsNumber = categoryId as number;
  
        if (categoryIdAsNumber >= 0 && categoryIdAsNumber < categories.length) {
          const category = categories.reverse()[categoryIdAsNumber];
          const query = `
            SELECT question, correct_answer, incorrect_answers FROM quiz
            WHERE category = '${category}'
            ORDER BY RANDOM()
            LIMIT 10;
          `;
  
          const { rows } = await pool.query(query);
          res.json(rows);
        } else {
          res.status(400).json({ error: "Invalid category ID" });
        }
      } else {
        res.status(400).json({ error: "Invalid category ID" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });
  

  router.get("/categories", async (req, res) => {
    try {
      const queryResult = await pool.query(
        "SELECT DISTINCT category FROM quiz"
      );
      const categories = queryResult.rows.map((row) => ({
        name: row.category,
      }));
      res.json(categories.reverse());
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).send("Failed to fetch categories");
    }
  });

  return router;
};
