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
          content: `Given the following string *start of string*"${answer}"*end of string* 
          create a trivia question associated to the subject, base your response on the following context *start of context*"${topic}"*end of context*, return 3 relevant incorrect answers to go with the question. Return all 4 values as a comma delimited string, the format of the string should be:
          
          "[Question],[CorrectAnswer],[IncorrectAnswer1],[IncorrectAnswer2],[IncorrectAnswer3]" 
          
          Do not deviate from this format by adding any extra formating or information. The question should be relatively difficult. Do NOT add any carriage returns in the formatting simply follow the formatting outlined here explicitly.
          
          Ensure the the returned answer after faitly similar so that the correct answer does not stand out`
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
