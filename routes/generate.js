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
          content: `Given the following string *start of string*"${answer}"*end of string* create a question whereby the string is the answer, base your response on the following context *start of context*"${topic}"*end of context*, Additionally return 3 relevant incorrect answers to the question as a comma delimited string. The format of the string should be "[Question],[IncorrectAnswer1],[IncorrectAnswer2],[IncorrectAnswer3]". The question should be moderately difficult`
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
