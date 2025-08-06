    const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: "AeQrf3-O7FdogVtj_D4Ck7NlNdBY4YwdlLt2nxbrmi3d958m7STHEYe8uLnr8RH11YF9V8OEvVT3BlbkFJ9Z97lENxCRGN5rkniJeqWd0HvOpgDliIYpyK8zz-Kg8Ld9xevwBHqrBMIQLl_c0qkNFSOeI-gA", // OpenAI hesabından aldığın key buraya
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: userMessage }],
      model: "gpt-3.5-turbo",
    });

    res.json({ reply: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error("HATA:", error.message);
    res.status(500).json({ reply: "Sunucu hatası. Lütfen tekrar deneyin." });
  }
});

app.listen(port, () => {
  console.log(`🟢 Sunucu çalışıyor: http://localhost:${port}`);
});
