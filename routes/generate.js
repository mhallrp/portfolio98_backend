const express = require("express");
const app = express();
const OpenAI = require("openai")

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});

app.post("/generate-quiz", async (req, res) => {
  try {
    const { topic, question } = req.body;

    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "Respond in JSON form a question associated with the string Javascript and 3 incorrect answers to that question. The question should have the key value question and the three options should be a, b, and c" }],
        model: "gpt-3.5",
      });

      console.log(completion)

    res.json(completion);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = app;
