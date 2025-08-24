const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeTranscript(transcript) {
  try {
    // ✅ Use a supported model ID
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are a sophisticated media analyst. Analyze the following transcript from a video.

    **Transcript:**
    ${transcript}

    **Your Task:**
    Provide a response in JSON format. Do not include any markdown formatting. The JSON object must have the following keys:
    1. 'contextualAnalysis': A paragraph explaining the overall context of the discussion.
    2. 'mainViewpoints': An array of objects, each with 'viewpoint' and 'speaker' keys.
    3. 'keyQuestions': An array of strings listing the key questions.
    4. 'bigPictureExplanation': A paragraph explaining the broader context.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    const cleanedText = response.text().replace(/```json|```/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error in Gemini Analysis Service:", error);
    throw new Error("Failed to get analysis from Gemini API.");
  }
}

module.exports = { analyzeTranscript };
