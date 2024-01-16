const express = require("express");
const app = express();

const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/generate-quiz", async (req, res) => {
  try {
    const { topic, question } = req.body;

    let prompt = question
      ? `Create three incorrect answers for the following question: "${question}"`
      : `Create a quiz question and three incorrect answers about: ${topic}`;


        const response = await openai.chat.completions.create({
          messages: [{ role: "system", content: `"${prompt}"` }],
          model: "gpt-3.5-turbo",
        });x

    res.json(response);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = app;
