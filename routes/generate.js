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
          
          content: `Generate 10 trivia questions about ${topic}. For each question, provide one correct answer and three incorrect answers. Format the response as follows:
          [Question text]|[Correct answer]|[Incorrect answer 1],[Incorrect answer 2],[Incorrect answer 3]|[Question text]|[Correct answer]|[Incorrect answer 1],[Incorrect answer 2],[Incorrect answer 3]`
          ,
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
