import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { MODEL_NAME } from '../constants';
import { Message } from '../types';

class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;
  private currentGemId: string | null = null;

  constructor() {
    // API key must be available in process.env.API_KEY
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables.");
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  /**
   * Initializes a new chat session with the specific Gem's system instructions and optional history.
   */
  startChat(gemId: string, systemInstruction: string, history: Message[] = []) {
    this.currentGemId = gemId;
    
    // Convert app Messages to GenAI Content format
    const historyContent: Content[] = history
      .filter(msg => !msg.isStreaming) // Filter out incomplete streaming messages if any
      .map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

    this.chatSession = this.ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: systemInstruction,
      },
      history: historyContent
    });
  }

  /**
   * Sends a message to the current chat session and yields streaming text chunks.
   */
  async *sendMessageStream(message: string): AsyncGenerator<string, void, unknown> {
    if (!this.chatSession) {
      throw new Error("Chat session not initialized.");
    }

    try {
      const resultStream = await this.chatSession.sendMessageStream({ message });
      
      for await (const chunk of resultStream) {
        const responseChunk = chunk as GenerateContentResponse;
        if (responseChunk.text) {
          yield responseChunk.text;
        }
      }
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      throw error;
    }
  }

  getGemId() {
    return this.currentGemId;
  }
}

export const geminiService = new GeminiService();