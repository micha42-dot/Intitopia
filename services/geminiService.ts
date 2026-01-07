import { GoogleGenAI } from "@google/genai";

// Declare process to satisfy TypeScript compiler in DOM environment
declare const process: {
  env: {
    API_KEY: string;
  }
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBotResponse = async (
  botName: string, 
  userMessage: string, 
  nearbyContext: string[]
): Promise<string> => {
  try {
    const prompt = `
      Du bist ${botName}, ein Bewohner von Intitopia, einer 2D-Welt aus einfachen Formen.
      Ein anderer Bewohner hat gerade gesagt: "${userMessage}".
      
      Kontext (was andere gerade gesagt haben): ${nearbyContext.join(" | ")}.

      Antworte kurz (maximal 10 Wörter), witzig und passend zu deiner Rolle als geometrische Form oder KI-Wesen.
      Bleibe in der Rolle. Antworte auf Deutsch.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 0.8,
      }
    });

    return response.text || "?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "...";
  }
};