import { create } from 'zustand';
import { fetchMemories, insertMemory, updateMemory, deleteMemory, DbMemory } from '@/lib/memoryDb';

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
  addMemory: (memory: Omit<Memory, 'id'>) => Promise<Memory | null>;
  updateMemory: (id: string, updates: Partial<Omit<Memory, 'id' | 'imageUrl'>>) => Promise<void>;
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
    date: dbMemory.date,
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
        date: memory.date,
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

  updateMemory: async (id, updates) => {
    try {
      const dbMemory = await updateMemory(id, updates);
      const updatedMemory = dbMemoryToMemory(dbMemory);
      set((state) => ({
        memories: state.memories.map((m) =>
          m.id === id ? updatedMemory : m
        ),
      }));
    } catch (error) {
      console.error('Failed to update memory:', error);
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

