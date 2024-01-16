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
          
          content: `Respond with a string that is delimited with the pipe character ensuring there are no spaces either side of the pipe character. The string should be made up of a 3 incorrect answer and one correct answer from the following input: "${topic}". Ensure that the answers are consistent with eachother i.e. similar wording so that the correct answer does not stand out among the incorrect answers. Ensure that the correct answer is always the last answer in the string. If the input isn't strong enough to prduce answers for then just respond with the string "error".`,
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
