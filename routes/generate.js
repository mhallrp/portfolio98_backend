const express = require("express");
const app = express();
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/generate-quiz", async (req, res) => {
  try {
    const { topic, answer } = req.body;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Instruction: Given a string "${answer}", create a trivia question related to it. Use the context "${topic}" to refine the question. Format your response as a comma-delimited string with the question, one correct answer, and three incorrect answers. The format should be: "[Question],[CorrectAnswer],[IncorrectAnswer1],[IncorrectAnswer2],[IncorrectAnswer3]". Ensure the answers are similar in length, not exceeding 10 words, and are difficult to distinguish in terms of correctness.`
          ,
        },
      ],
      model: "gpt-3.5-turbo-1106",
    });

    console.log(completion);

    res.json(completion);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = app;
