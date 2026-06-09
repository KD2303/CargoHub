import { GoogleGenAI } from '@google/genai';

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

export const aiService = {
  /**
   * Analyzes cargo descriptions and recommends vehicle, weight and helpers
   */
  async estimateCargoNeeds(description: string) {
    if (!ai) {
      console.warn('Gemini AI not configured, returning mock data.');
      return {
        vehicle: 'MINI_TRUCK',
        helpers: 1,
        estimatedWeight: '300kg'
      };
    }

    try {
      const prompt = `
        You are a logistics AI. Analyze the following cargo description and output ONLY a JSON object containing:
        - "vehicle": The recommended vehicle type (choose from TATA_ACE, TEMPO_407, PICKUP_TRUCK, LARGE_TRUCK)
        - "helpers": Number of helpers required (integer between 0 and 4)
        - "estimatedWeight": Estimated total weight in kg (string, e.g. "450kg")
        
        Cargo Description: "${description}"
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      
      const responseText = response.text || "{}";
      return JSON.parse(responseText);
    } catch (error) {
      console.error('AI Estimation Error:', error);
      throw new Error('Failed to estimate cargo needs');
    }
  }
};
