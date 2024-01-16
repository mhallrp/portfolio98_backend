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
          
          content: `Respond with a string that is delimited with the pipe character ensuring there are no spaces either side of the pipe character. The string should be made up of a 3 incorrect answer and one correct answer. The question and answers should be based on the term "${topic}" (the question and all four of the answers should be delimited with the pipe character). Ensure that the answers are consistent with each i.e. similar wording so that the correct answer does not stand out among the incorrect answers. Ensure that the correct answer is always the last answer in the string. If the input term isn't giving a strong enough question and answer or the input doesn't make sense then just respond with the string "error". Ensure the question and the supplied answers to the question have a strong prbability of being correct or return the string "error"`,
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
