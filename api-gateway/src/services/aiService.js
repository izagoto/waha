const OpenAI = require("openai").default;
const { GoogleGenerativeAI } = require("@google/generative-ai");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const AI_PROVIDER = process.env.AI_PROVIDER || "openai";

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

async function getReply(incomingText, context = "") {
  const systemPrompt =
    "You are a helpful WhatsApp assistant. Reply briefly and naturally. " +
    (context ? `Context: ${context}` : "");

  if (AI_PROVIDER === "gemini" && genAI) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`${systemPrompt}\n\nUser: ${incomingText}`);
    const response = result.response;
    return (response && response.text && response.text()) ? response.text().trim() : "Maaf, coba lagi.";
  }

  if (openai) {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: incomingText },
      ],
      max_tokens: 150,
    });
    return completion.choices[0]?.message?.content?.trim() || "Maaf, coba lagi.";
  }

  return "AI not configured. Set OPENAI_API_KEY or GEMINI_API_KEY and AI_PROVIDER.";
}

module.exports = { getReply };
