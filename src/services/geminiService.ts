import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface WasteClassification {
  name: string;
  category: string;
  instruction: string;
  collectionPointType: string | null;
}

export const generateSpeech = async (text: string): Promise<string> => {
  try {
    // 1. Try Google Cloud TTS API (Wavenet/Neural2)
    const apiKey = process.env.GEMINI_API_KEY;
    const cloudTtsResponse = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: text },
        voice: { languageCode: 'pl-PL', name: 'pl-PL-Wavenet-A' }, // Wavenet female voice
        audioConfig: { audioEncoding: 'MP3' }
      })
    });

    if (cloudTtsResponse.ok) {
      const data = await cloudTtsResponse.json();
      if (data.audioContent) {
        const blob = new Blob([Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
        return URL.createObjectURL(blob);
      }
    }
    
    console.warn("Google Cloud TTS failed or unauthorized, falling back to Gemini TTS...");
  } catch (e) {
    console.warn("Google Cloud TTS fetch error, falling back to Gemini TTS...", e);
  }

  // 2. Fallback to Gemini TTS if Cloud TTS fails (which is likely due to API key restrictions)
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Przeczytaj ten tekst po polsku: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Aoede' }, // Aoede is a good female voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("Brak danych audio w odpowiedzi.");
    }
    
    // Convert raw PCM to WAV
    const binaryString = atob(base64Audio);
    const pcmData = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      pcmData[i] = binaryString.charCodeAt(i);
    }

    const sampleRate = 24000;
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, pcmData.length, true);

    const wavBytes = new Uint8Array(44 + pcmData.length);
    wavBytes.set(new Uint8Array(wavHeader), 0);
    wavBytes.set(pcmData, 44);

    const blob = new Blob([wavBytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Błąd podczas generowania mowy (Gemini TTS):", error);
    throw error;
  }
};

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
