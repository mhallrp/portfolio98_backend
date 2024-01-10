const express = require('express');
const router = express.Router();
const axios = require('axios');
const maxRetries = 3;
const retryDelay = 3000;

module.exports = (pool) => {

// async function fetchTrivia(categoryId, attempt = 1) {
//     try {
//         const response = await axios.get(`https://opentdb.com/api.php?amount=10&category=${categoryId}`);
//         return response;
//     } catch (error) {
//         if (attempt < maxRetries) {
//             console.log(`Attempt ${attempt} failed, retrying in ${retryDelay}ms...`);
//             await new Promise(resolve => setTimeout(resolve, retryDelay));
//             return fetchTrivia(categoryId, attempt + 1);
//         } else {
//             throw error;
//         }
//     }
// }

router.get('/trivia', async (req, res) => {
    const categoryId = req.query.category;

    try {

        const queryResult = await pool.query("SELECT DISTINCT category FROM quiz");
        const categories = queryResult.rows.map((row) => (row.category));
        const category = categories[categoryId]
        const query = `
          SELECT * FROM quiz
          WHERE category = '${category}'
          ORDER BY RANDOM()
          LIMIT 10;
        `;
    
        const { rows } = await pool.query(query);
        res.json(rows);
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
});

router.get('/categories', async (req, res) => {
    try {
        const queryResult = await pool.query("SELECT DISTINCT category FROM quiz");
        const categories = queryResult.rows.map((row, index) => ({
            id: index,
            name: row.category
        }));
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send("Failed to fetch categories");
    }
});

return router

}