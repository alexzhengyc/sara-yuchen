import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addMemory: (memory: Memory) => void;
  setActiveMemory: (id: string) => void;
  removeMemory: (id: string) => void;
}

export const useMemoryStore = create<MemoryState>()(
  persist(
    (set) => ({
      memories: [],
      activeMemoryId: null,
      addMemory: (memory) => set((state) => ({ 
        memories: [memory, ...state.memories],
        activeMemoryId: memory.id 
      })),
      setActiveMemory: (id) => set({ activeMemoryId: id }),
      removeMemory: (id) => set((state) => ({
        memories: state.memories.filter((m) => m.id !== id),
        activeMemoryId: state.activeMemoryId === id ? (state.memories[1]?.id || null) : state.activeMemoryId
      })),
    }),
    {
      name: 'memory-garden-storage',
    }
  )
);

