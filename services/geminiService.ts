import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

export const initGemini = (apiKey: string) => {
  genAI = new GoogleGenAI({ apiKey });
};

export const generateBotResponse = async (
  botName: string, 
  userMessage: string, 
  nearbyContext: string[]
): Promise<string> => {
  if (!genAI) return "...";

  try {
    const prompt = `
      Du bist ${botName}, ein Bewohner von Intitopia, einer 2D-Welt aus einfachen Formen.
      Ein anderer Bewohner hat gerade gesagt: "${userMessage}".
      
      Kontext (was andere gerade gesagt haben): ${nearbyContext.join(" | ")}.

      Antworte kurz (maximal 10 Wörter), witzig und passend zu deiner Rolle als geometrische Form oder KI-Wesen.
      Bleibe in der Rolle. Antworte auf Deutsch.
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        maxOutputTokens: 30,
        temperature: 0.8,
      }
    });

    return response.text || "?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "...";
  }
};
