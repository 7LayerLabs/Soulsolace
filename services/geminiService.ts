import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PrayerResponse, Religion, GroundingSource, LoadingPhase } from '../types';
import { getCachedPrayer, cachePrayer } from './prayerCache';
import { retryWithBackoff, isAbortError } from './retry';
import { Season } from './religiousCalendar';

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
      description: "The full text of the prayer in English. Priority MUST be given to verbatim text from scripture or liturgy.",
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
    },
    originalLanguage: {
      type: Type.STRING,
      description: "The traditional original language of the prayer if not English. One of: Hebrew, Arabic, Sanskrit, Pali, Latin, Greek. Only include if the prayer has a traditional non-English original.",
    },
    originalText: {
      type: Type.STRING,
      description: "The prayer text in its original language script (Hebrew, Arabic, Devanagari, etc.). Only include if originalLanguage is specified.",
    },
    transliteration: {
      type: Type.STRING,
      description: "Romanized/phonetic transliteration of the original text for pronunciation. Only include if originalText is provided.",
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
      minItems: "3",
      maxItems: "3"
    }
  },
  required: ["prayers"],
};

export interface GeneratePrayerOptions {
  signal?: AbortSignal;
  onPhaseChange?: (phase: LoadingPhase) => void;
  season?: Season;
}

export const generatePrayer = async (
  religion: Religion,
  situation: string,
  options: GeneratePrayerOptions = {}
): Promise<{ prayers: PrayerResponse[]; sources: GroundingSource[]; fromCache: boolean }> => {
  const { signal, onPhaseChange, season } = options;

  // Check cache first
  const cached = getCachedPrayer(religion, situation);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  // Signal searching phase
  onPhaseChange?.('searching');

  try {
    const result = await retryWithBackoff(
      async () => {
        // Check if aborted
        if (signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }

        // Using gemini-2.0-flash for cost efficiency (~17x cheaper than Pro)
        const modelId = 'gemini-2.0-flash';

        // Build season context if applicable
        const seasonContext = season
          ? `\n          SEASONAL CONTEXT: The user is currently observing ${season.name} - ${season.description}. Consider prayers and themes appropriate for this sacred time, such as: ${season.suggestedIntentions.join(', ')}.`
          : '';

        const prompt = `
          The user is seeking 3 distinct, REAL, AUTHENTIC prayers from their tradition.

          Religion: ${religion}
          Situation: "${situation}"${seasonContext}

          INSTRUCTIONS:
          1. Use Google Search to find EXISTING, VERBATIM prayers, mantras, or scriptures from the ${religion} tradition that address the situation of "${situation}".
          2. Provide 3 DIFFERENT options. They should vary in length, specific focus, or source (e.g., one from scripture, one from a famous saint/thinker, one traditional liturgical piece).
          3. If well-known scriptural or liturgical prayers exist, you MUST provide that exact text.
          4. If no specific verbatim prayer exists for this exact nuance, construct ones that strictly adhere to the authentic theological structure, language, and historical conventions of ${religion}.
          5. Clearly distinguish between "Canonical" (Existing/Scriptural) and "Tradition-Aligned" (Newly composed in that style).
          6. IMPORTANT - Original Language: If the prayer has a traditional original language (Hebrew for Jewish prayers, Arabic for Islamic prayers, Sanskrit/Pali for Hindu/Buddhist texts, Latin/Greek for early Christian prayers), you MUST include:
             - originalLanguage: The language name (Hebrew, Arabic, Sanskrit, Pali, Latin, or Greek)
             - originalText: The prayer in its original script (e.g., Hebrew characters, Arabic script, Devanagari)
             - transliteration: A romanized phonetic version for pronunciation

          Ensure the language is reverent and authentic. Generate exactly 3 prayers.
        `;

        // Signal generating phase
        onPhaseChange?.('generating');

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

        // Check if aborted after API call
        if (signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }

        // Signal finalizing phase
        onPhaseChange?.('finalizing');

        const text = response.text;
        if (!text) {
          throw new Error("No response generated.");
        }

        const parsedResult = JSON.parse(text) as { prayers: PrayerResponse[] };

        // Extract grounding sources
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: GroundingSource[] = groundingChunks
          .filter(chunk => chunk.web)
          .map(chunk => ({
            title: chunk.web?.title || 'Religious Source',
            uri: chunk.web?.uri || ''
          }));

        return { prayers: parsedResult.prayers, sources };
      },
      {
        maxAttempts: 3,
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        signal
      }
    );

    // Cache the result
    cachePrayer(religion, situation, result.prayers, result.sources);

    return { ...result, fromCache: false };
  } catch (error) {
    // Re-throw abort errors without wrapping
    if (isAbortError(error)) {
      throw error;
    }

    console.error("Gemini API Error:", error);
    throw new Error("Unable to retrieve authentic prayers at this time.");
  }
};
