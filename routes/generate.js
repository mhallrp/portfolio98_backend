const express = require("express");
const app = express();
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/generate-quiz", async (req, res) => {
  try {
    const { topic } = req.body;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Given the input "${topic}", generate a trivia question where the correct answer is "${topic}". Include three plausible but incorrect answers. Format the output as a question followed by a "|" delimited list of answers, with the correct answer (the input) being last. If there is any uncertainty about the accuracy of the information related to "${topic}", or if "${topic}" is not suitable for a trivia question, respond with "Error". "${topic} must be the correct answer to the question with confidence`,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    console.log(completion);

    res.json(completion);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = app;
