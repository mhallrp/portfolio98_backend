const express = require("express");
const router = express.Router();

module.exports = (pool) => {
  router.post("/setscore", async (req, res) => {
    try {
      const { score, name } = req.body;
      await pool.query(
        "UPDATE users SET total_score = $1 WHERE username = $2",
        [score, name]
      );
      console.log("All updated fine");
      res.status(200).send("Score updated successfully.");
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while updating the score.");
    }
  });

  return router;
};
