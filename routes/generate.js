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
          content: `Given the following question *start of question*"${topic}"*end of Question* and the following answer to this question *start of answer*"${answer}"*end of answer* return 3 relevant incorrect answers to this question as a comma delimited string.`
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
