const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
You are an expert career assistant helping a student write a professional, truthful, job-specific cover letter.

Candidate Information:
Name: Test User
College/University: Test College
Branch/Major: CS
Graduation Year: 2026
Skills: JS, Node
LinkedIn: Not specified
GitHub: Not specified

Job Information:
Company: Google
Role: SWE
Job Description: Not specified
Additional Notes: Not specified

The letter should:
1. Start professionally.
10. Return ONLY the cover letter text, without markdown, headings such as 'Cover Letter', or explanations.
    `.trim();

    console.log("Calling Gemini API...");
    const interaction = await ai.interactions.create({
      model: 'gemini-3.5-flash',
      input: prompt,
    });
    console.log("Response:", interaction.output_text);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
