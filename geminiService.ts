import { GoogleGenAI, Type } from "@google/genai";
import { StockMetadata } from "../types";

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Generates a list of detailed image prompts based on a topic.
 */
export const generateStockPrompts = async (topic: string, count: number, mood: string): Promise<string[]> => {
  const ai = getAiClient();
  const systemInstruction = `You are an expert prompt engineer for stock photography AI generators (like Midjourney, Firefly).
  Create ${count} distinct, highly detailed, photorealistic image prompts about "${topic}".
  Mood: ${mood}.
  Ensure prompts include lighting, camera angle, and style details optimized for stock sales.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate the prompts now.`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '{"prompts": []}');
    return json.prompts || [];
  } catch (error) {
    console.error("Error generating prompts:", error);
    throw error;
  }
};

/**
 * Generates an image from a prompt using Gemini.
 */
export const generateStockImage = async (prompt: string, aspectRatio: string = "4:3"): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: "1K"
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * Generates Adobe Stock metadata (Title, Keywords) from an image or description.
 */
export const generateAdobeMetadata = async (imageDataBase64: string | null, description: string): Promise<StockMetadata> => {
  const ai = getAiClient();
  try {
    const parts: any[] = [];
    
    if (imageDataBase64) {
      parts.push({
        inlineData: {
          data: imageDataBase64,
          mimeType: 'image/png' // Assuming png for simplicity of this demo flow
        }
      });
      parts.push({ text: "Analyze this image for Adobe Stock metadata." });
    } else {
      parts.push({ text: `Generate Adobe Stock metadata for an image described as: ${description}` });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // 2.5 Flash is multimodal
      contents: { parts },
      config: {
        systemInstruction: `You are an Adobe Stock SEO expert. 
        Generate a catchy Title (5-7 words) and exactly 30 relevant Keywords sorted by relevance. 
        Select a Category (e.g., Business, Lifestyle, Technology).`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            category: { type: Type.STRING }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return {
      title: json.title || "Untitled",
      keywords: json.keywords || [],
      category: json.category || "Uncategorized"
    };

  } catch (error) {
    console.error("Error generating metadata:", error);
    throw error;
  }
};
