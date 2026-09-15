const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log("Calling Gemini API...");
    const interaction = await ai.interactions.create({
      model: 'gemini-3.7-flash',
      system_instruction: "You are a polite assistant.",
      input: "Say hello",
    });
    console.log("Response:", interaction.output_text);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
