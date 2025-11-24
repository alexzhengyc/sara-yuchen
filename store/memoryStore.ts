import { create } from 'zustand';
import { fetchMemories, insertMemory, deleteMemory, DbMemory } from '@/lib/memoryDb';

export interface Memory {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  date: string;
}

interface MemoryState {
  memories: Memory[];
  activeMemoryId: string | null;
  isLoading: boolean;
  loadMemories: () => Promise<void>;
  addMemory: (memory: Omit<Memory, 'id' | 'date'>) => Promise<Memory | null>;
  setActiveMemory: (id: string) => void;
  removeMemory: (id: string) => Promise<void>;
}

// Helper to convert database memory to app memory format
function dbMemoryToMemory(dbMemory: DbMemory): Memory {
  return {
    id: dbMemory.id,
    imageUrl: dbMemory.image_url,
    title: dbMemory.title,
    description: dbMemory.description,
    date: dbMemory.created_at,
  };
}

export const useMemoryStore = create<MemoryState>()((set, get) => ({
  memories: [],
  activeMemoryId: null,
  isLoading: false,

  loadMemories: async () => {
    set({ isLoading: true });
    try {
      const dbMemories = await fetchMemories();
      const memories = dbMemories.map(dbMemoryToMemory);
      set({ memories, isLoading: false });
    } catch (error) {
      console.error('Failed to load memories:', error);
      set({ isLoading: false });
    }
  },

  addMemory: async (memory) => {
    try {
      const dbMemory = await insertMemory({
        title: memory.title,
        description: memory.description,
        image_url: memory.imageUrl,
      });
      const newMemory = dbMemoryToMemory(dbMemory);
      set((state) => ({
        memories: [newMemory, ...state.memories],
        activeMemoryId: newMemory.id,
      }));
      return newMemory;
    } catch (error) {
      console.error('Failed to add memory:', error);
      return null;
    }
  },

  setActiveMemory: (id) => set({ activeMemoryId: id }),

  removeMemory: async (id) => {
    try {
      await deleteMemory(id);
      set((state) => ({
        memories: state.memories.filter((m) => m.id !== id),
        activeMemoryId:
          state.activeMemoryId === id
            ? state.memories[1]?.id || null
            : state.activeMemoryId,
      }));
    } catch (error) {
      console.error('Failed to remove memory:', error);
    }
  },
}));

