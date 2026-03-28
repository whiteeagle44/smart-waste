import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface WasteClassification {
  name: string;
  category: string;
  instruction: string;
  collectionPointType: string | null;
}

export const classifyWaste = async (text: string, imageBase64?: string, mimeType?: string): Promise<WasteClassification> => {
  const parts: any[] = [];
  
  if (text) {
    parts.push({ text });
  }
  
  if (imageBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: imageBase64.split(',')[1] || imageBase64, // Remove data URI prefix if present
        mimeType: mimeType,
      }
    });
  }

  if (parts.length === 0) {
    throw new Error("Nie podano żadnych danych do analizy.");
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      systemInstruction: "Jesteś asystentem ds. recyklingu i segregacji odpadów w Polsce. Twoim zadaniem jest sklasyfikowanie podanego odpadu (na podstawie opisu lub zdjęcia) i podanie instrukcji, jak go wyrzucić. Zwróć wynik w formacie JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "Nazwa rozpoznanego śmiecia/odpadu."
          },
          category: {
            type: Type.STRING,
            description: "Kategoria odpadu (np. Metale i tworzywa sztuczne, Papier, Szkło, Zmieszane, Bio, Elektrośmieci, Gabaryty, Leki, Odpady niebezpieczne)."
          },
          instruction: {
            type: Type.STRING,
            description: "Krótka, jasna instrukcja do jakiego pojemnika wrzucić lub co z tym zrobić."
          },
          collectionPointType: {
            type: Type.STRING,
            description: "Sugerowany typ punktu zbiórki (np. PSZOK, Apteka, Pojemnik na elektrośmieci), jeśli to śmieć nietypowy. Zwróć null jeśli to zwykły śmieć domowy."
          }
        },
        required: ["name", "category", "instruction"]
      }
    }
  });

  const textResponse = response.text;
  if (!textResponse) {
    throw new Error("Pusta odpowiedź od modelu Gemini.");
  }

  return JSON.parse(textResponse) as WasteClassification;
};
