const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/trivia', async (req, res) => {
    const categoryId = req.query.category;
    try {
        const response = await axios.get(`https://opentdb.com/api.php?amount=10&category=${categoryId}`);
        res.json(response.data.results);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post('/categories', async (req, res) => {
    try {
        const response = await axios.get("https://opentdb.com/api_category.php");
        res.json(response.data.trivia_categories);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports=router;