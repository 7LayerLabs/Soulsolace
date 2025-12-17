import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PrayerResponse, Religion, GroundingSource } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const prayerSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "The traditional name of the prayer or a descriptive title.",
    },
    prayerBody: {
      type: Type.STRING,
      description: "The full text of the prayer. Priority MUST be given to verbatim text from scripture or liturgy.",
    },
    explanation: {
      type: Type.STRING,
      description: "A detailed explanation of the source (e.g., 'Verse 5 of Psalm 23' or 'Authentic Dua from Hadith').",
    },
    isCanonical: {
      type: Type.BOOLEAN,
      description: "True if this is a verbatim historical or scriptural prayer, false if it is a new composition based on traditional laws.",
    },
    origin: {
      type: Type.STRING,
      description: "The specific religious text or historical source this prayer comes from.",
    }
  },
  required: ["title", "prayerBody", "explanation", "isCanonical", "origin"],
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    prayers: {
      type: Type.ARRAY,
      items: prayerSchema,
      description: "A set of 3 distinct prayers or scriptures addressing the situation.",
      minItems: 3,
      maxItems: 3
    }
  },
  required: ["prayers"],
};

export const generatePrayer = async (
  religion: Religion,
  situation: string
): Promise<{ prayers: PrayerResponse[]; sources: GroundingSource[] }> => {
  try {
    // Using gemini-3-pro-preview for high-quality reasoning and search capabilities
    const modelId = 'gemini-3-pro-preview';
    
    const prompt = `
      The user is seeking 3 distinct, REAL, AUTHENTIC prayers from their tradition.
      
      Religion: ${religion}
      Situation: "${situation}"
      
      INSTRUCTIONS:
      1. Use Google Search to find EXISTING, VERBATIM prayers, mantras, or scriptures from the ${religion} tradition that address the situation of "${situation}".
      2. Provide 3 DIFFERENT options. They should vary in length, specific focus, or source (e.g., one from scripture, one from a famous saint/thinker, one traditional liturgical piece).
      3. If well-known scriptural or liturgical prayers exist, you MUST provide that exact text.
      4. If no specific verbatim prayer exists for this exact nuance, construct ones that strictly adhere to the authentic theological structure, language, and historical conventions of ${religion}. 
      5. Clearly distinguish between "Canonical" (Existing/Scriptural) and "Tradition-Aligned" (Newly composed in that style).
      
      Ensure the language is reverent and authentic. Generate exactly 3 prayers.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a master of world religions and liturgy. Your goal is to provide authentic, real prayers from established traditions.",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated.");
    }

    const result = JSON.parse(text) as { prayers: PrayerResponse[] };
    
    // Extract grounding sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || 'Religious Source',
        uri: chunk.web?.uri || ''
      }));

    return { prayers: result.prayers, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Unable to retrieve authentic prayers at this time.");
  }
};
