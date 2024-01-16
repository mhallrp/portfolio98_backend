const express = require("express");
const app = express();

const { OpenAIApi, Configuration } = require('openai');
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

app.post("/generate-quiz", async (req, res) => {
  try {
    const { topic, question } = req.body;

    let prompt = question
      ? `Create three incorrect answers for the following question: "${question}"`
      : `Create a quiz question and three incorrect answers about: ${topic}`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 150,
    });

    const responseText = response.data.choices[0].text.trim();
    const parsedResponse = parseResponse(responseText, question);

    res.json(parsedResponse);
  } catch (error) {
    res.status(500).send(error);
  }
});

function parseResponse(responseText, question) {
  const lines = responseText.split("\n").filter((line) => line.trim() !== "");
  if (!question) {
    // Assume the first line is the question if it wasn't provided
    question = lines.shift();
  }
  const answers = lines;
  return { question, answers };
}

module.exports = app;
