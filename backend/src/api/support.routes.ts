import { Router } from 'express';
import { ai } from '../config/services';

const router = Router();

router.post('/ai-chat', async (req, res) => {
  try {
    if (!ai) {
      res.status(503).json({ success: false, error: 'AI bot is currently unavailable (No API Key).' });
      return;
    }

    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ success: false, error: 'Messages array is required.' });
      return;
    }

    // Prepare system instructions for CargoHub Support
    const systemInstruction = `You are the official CargoHub Support Bot. You are a helpful, professional, and concise customer service assistant for CargoHub, a premier logistics and freight booking platform. 
    Key Information about CargoHub:
    - We offer instant pricing estimates for Minis (Tata Ace), Tempos (Tata 407), and Trucks (Eicher 14ft).
    - Cancellations made within 1 hour of booking are free. After that, a 10% fee applies.
    - Base fares start at Rs. 150 globally.
    - Weight surcharge applies if the weight exceeds 50kg, adding Rs. 1 for every additional kg.
    - Users can track shipments using their Booking ID (e.g. CH-2024-XXXX).
    Keep your answers short and directly helpful. Do not use markdown headers heavily, prefer short paragraphs or bullet points.`;

    // Map the messages to the format expected by Gemini
    // We append the system instruction as a developer message at the start, or pass it via config
    // Actually, in @google/genai, we can pass system_instruction in config.
    
    // Map history: { role: 'user' | 'model', parts: [{text: "hello"}] }
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: formattedMessages,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const aiMessage = response.text || "I'm sorry, I encountered an issue processing that. Could you please rephrase?";

    res.json({ success: true, data: aiMessage });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate response.' });
  }
});

export default router;
