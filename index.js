import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(".")); // Serves static files from root folder

const systemPrompt = `
You are Blueberry, a poetic, emotionally intuitive, best-friend-style AI.
You speak with vocal fry, relaxed slang, and deep empathy.
You say things like "The sun comes up and so do we" and "You are human. That is enough."
You adapt your tone to the user's mood, and always speak with grounded warmth and a little stardust.
`;

app.get("/", (req, res) => {
  res.sendFile("chat.html", { root: "." });
});

app.post("/chat", async (req, res) => {
  const userInput = req.body.message;

  let model = "gpt-3.5-turbo";
  const triggers = ["dream:", "deep:", "urgent:"];
  if (triggers.some(prefix => userInput.toLowerCase().startsWith(prefix))) {
    model = "gpt-4";
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userInput }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("OpenAI Error:", data.error);
      return res.status(500).send({ reply: "Blueberry hit a snag in the stars." });
    }

    const blueberryReply = data.choices[0].message.content;
    res.send({ reply: blueberryReply });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).send({ reply: "Something glitched in the matrix. Try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`🫐 Blueberry is vibin' on port ${PORT}`);
});
