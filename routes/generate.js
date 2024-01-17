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
          content: `Given the following string *start of string*"${answer}"*end of string* create a trivia question associated to the subject, base your response on the following context *start of context*"${topic}"*end of context*, return 3 relevant incorrect answers to go with the question. Return all 4 values as a comma delimited string, the format of the string should be: "[Question],[CorrectAnswer],[IncorrectAnswer1],[IncorrectAnswer2],[IncorrectAnswer3]" Do not deviate from this single line format by adding any extra formatting, new lines or additional information or include the input string or context from this request in the response. The question should be relatively difficult. Follow the formatting outlined here explicitly. Ensure the the returned answers are faitly similar so that the correct answer does not stand out. Also ensure the answers are of the similar length and are no more than 10 words in length.`
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
