
import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getBiblicalAdvice = async (question: string, lang: Language) => {
  if (!process.env.API_KEY) return "API Key missing. Please check your environment.";

  const systemInstruction = `
    You are a wise Christian mentor. 
    Answer questions with Biblical wisdom and empathy.
    Always provide:
    1. A short empathetic response.
    2. A relevant Bible verse.
    3. Practical advice.
    4. A short prayer.
    Language to use: ${lang === 'rw' ? 'Kinyarwanda' : lang === 'sw' ? 'Swahili' : lang === 'fr' ? 'French' : 'English'}.
    Keep the tone calm, warm, and wise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I couldn't generate wisdom at this moment. Please try again.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Something went wrong. Please try again later.";
  }
};

export const getDailyReflection = async (lang: Language) => {
  const prompt = `Generate a daily Christian reflection for today in ${lang}. 
  Format it like this:
  Title: [Catchy title]
  Verse: [Relevant Bible Verse]
  Reflection: [Short 2-3 sentence reflection]
  Action: [One small thing to do today]
  Prayer: [Short 1 sentence prayer]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { temperature: 0.9 },
    });
    return response.text;
  } catch (error) {
    return null;
  }
};
