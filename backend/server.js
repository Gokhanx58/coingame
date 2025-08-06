const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: "OPENAI_API_KEYİNİ_BURAYA_YAZ", // ← BU KISMI KENDİ API KEY'İNLE DEĞİŞTİR
});

const openai = new OpenAIApi(configuration);

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userMessage }],
    });

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error("API Hatası:", error.message);
    res.status(500).json({ reply: "Sunucu hatası. Lütfen tekrar deneyin." });
  }
});

app.listen(port, () => {
  console.log(`🟢 Sunucu çalışıyor: http://localhost:${port}`);
});
