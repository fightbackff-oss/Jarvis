import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { MODEL_NAME } from '../constants';
import { Message } from '../types';

class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;
  private currentGemId: string | null = null;

  constructor() {
    // Safely retrieve API Key from process.env if available, otherwise default to empty string
    // to prevent runtime crash during initialization.
    // NOTE: The actual API call will fail if the key is missing, which is expected.
    let apiKey = '';
    try {
      if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        apiKey = process.env.API_KEY;
      }
    } catch (e) {
      console.warn("Could not read process.env.API_KEY");
    }

    if (!apiKey) {
      console.warn("API_KEY is missing. AI features will not function.");
    }
    
    this.ai = new GoogleGenAI({ apiKey });
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