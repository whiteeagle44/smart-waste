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
      systemInstruction: "Jesteś asystentem ds. recyklingu i segregacji odpadów w Polsce. Twoim zadaniem jest sklasyfikowanie podanego odpadu (na podstawie opisu lub zdjęcia) i podanie instrukcji, jak go wyrzucić. Zwróć wynik w formacie JSON. Kategoria musi być jedną z 13 ściśle określonych frakcji. Dodatkowa wiedza: Jeśli butelka plastikowa posiada etykietę zwrotną należy oddać ją do sklepu w którym jest punkt odbioru butelek, a za każdą z nich można odzyskać 50 gr. Butelki takie muszą być opróżnione i niezgniecione oraz musi być na nich widoczna etykieta zwrotna.",
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
            description: "Kategoria odpadu.",
            enum: [
              "Metale i tworzywa sztuczne",
              "Papier",
              "Szkło",
              "Bioodpady",
              "Odpady zmieszane",
              "Elektrośmieci",
              "Baterie i akumulatory",
              "Gabaryty",
              "Odpady niebezpieczne",
              "Leki i odpady medyczne",
              "Odpady budowlane i poremontowe",
              "Tekstylia i odzież",
              "Opony"
            ]
          },
          instruction: {
            type: Type.STRING,
            description: "Krótka, jasna instrukcja do jakiego pojemnika wrzucić lub co z tym zrobić."
          },
          collectionPointType: {
            type: Type.STRING,
            description: "Sugerowany typ punktu zbiórki (np. PSZOK, Apteka, Pojemnik na elektrośmieci, Kontener PCK), jeśli to śmieć nietypowy. Zwróć null jeśli to zwykły śmieć domowy wrzucany do przydomowych pojemników."
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
