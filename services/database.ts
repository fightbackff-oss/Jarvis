import { get, set } from 'idb-keyval';
import { Gem, Message } from '../types';
import { INITIAL_GEMS } from '../constants';

const GEMS_KEY = 'gemini_gems_v1';
const CHATS_KEY = 'gemini_chats_v1';

export const db = {
  /**
   * Initialize the database. 
   * If no gems exist, seed with INITIAL_GEMS.
   */
  async init(): Promise<{ gems: Gem[]; sessions: Record<string, Message[]> }> {
    try {
      let gems = await get<Gem[]>(GEMS_KEY);
      let sessions = await get<Record<string, Message[]>>(CHATS_KEY);

      if (!gems || gems.length === 0) {
        gems = INITIAL_GEMS;
        await set(GEMS_KEY, gems);
      }

      if (!sessions) {
        sessions = {};
        await set(CHATS_KEY, sessions);
      }

      return { gems, sessions };
    } catch (error) {
      console.error('Database initialization failed:', error);
      return { gems: INITIAL_GEMS, sessions: {} };
    }
  },

  /**
   * Save a new Gem or update existing gems list
   */
  async saveGems(gems: Gem[]): Promise<void> {
    try {
      await set(GEMS_KEY, gems);
    } catch (error) {
      console.error('Failed to save gems:', error);
    }
  },

  /**
   * Save a chat session
   */
  async saveSession(gemId: string, messages: Message[]): Promise<void> {
    try {
      const sessions = (await get<Record<string, Message[]>>(CHATS_KEY)) || {};
      sessions[gemId] = messages;
      await set(CHATS_KEY, sessions);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  },

  /**
   * Clear all data (Debugging/Reset)
   */
  async clearAll(): Promise<void> {
    await set(GEMS_KEY, INITIAL_GEMS);
    await set(CHATS_KEY, {});
  }
};