import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { MODEL_NAME } from '../constants';
import { Message } from '../types';

/**
 * Service for interacting with the Gemini API.
 * Follows the guideline: "Create a new GoogleGenAI instance right before making an API call"
 */
export const geminiService = {
  /**
   * Sends a message to the model and streams the response.
   * Instantiates the client on every call to pick up the latest environment/session key.
   */
  async *sendMessageStream(
    message: string, 
    systemInstruction: string, 
    history: Message[]
  ): AsyncGenerator<string, void, unknown> {
    
    // Check for API key availability
    const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
    
    // Instantiate exactly when needed
    const ai = new GoogleGenAI({ apiKey });

    // Convert app Messages to GenAI Content format for chat history
    const historyContent: Content[] = history
      .filter(msg => !msg.isStreaming)
      .map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

    // Initialize chat session
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: systemInstruction,
      },
      history: historyContent
    });

    try {
      const resultStream = await chat.sendMessageStream({ message });
      
      for await (const chunk of resultStream) {
        const responseChunk = chunk as GenerateContentResponse;
        if (responseChunk.text) {
          yield responseChunk.text;
        }
      }
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      // Pass through specific errors that UI might want to handle specially
      if (error.message?.includes("Requested entity was not found") || error.message?.includes("API key")) {
        throw new Error("AUTH_ERROR");
      }
      
      throw error;
    }
  }
};