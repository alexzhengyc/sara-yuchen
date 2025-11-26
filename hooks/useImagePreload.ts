import { useEffect, useRef, useState } from 'react';
import { Memory } from '@/store/memoryStore';

interface UseImagePreloadResult {
  isImageLoaded: (url: string) => boolean;
  preloadImage: (url: string) => Promise<void>;
  loadedCount: number;
}

/**
 * Hook for progressive image preloading
 * Prioritizes adjacent images first, then gradually loads others in background
 */
export function useImagePreload(
  memories: Memory[],
  activeMemoryId: string | null
): UseImagePreloadResult {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const loadingRef = useRef<Set<string>>(new Set());
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Function to preload a single image
  const preloadImage = async (url: string): Promise<void> => {
    if (loadedImages.has(url) || loadingRef.current.has(url)) {
      return Promise.resolve();
    }

    loadingRef.current.add(url);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        imageCache.current.set(url, img);
        setLoadedImages((prev) => new Set([...prev, url]));
        loadingRef.current.delete(url);
        resolve();
      };
      img.onerror = () => {
        loadingRef.current.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });
  };

  // Check if an image is loaded
  const isImageLoaded = (url: string): boolean => {
    return loadedImages.has(url);
  };

  // Progressive preloading effect
  useEffect(() => {
    if (memories.length === 0) return;

    const activeIndex = memories.findIndex((m) => m.id === activeMemoryId);
    if (activeIndex === -1) return;

    const preloadQueue: string[] = [];

    // Priority 1: Active image
    preloadQueue.push(memories[activeIndex].imageUrl);

    // Priority 2: Adjacent images (prev and next)
    if (activeIndex > 0) {
      preloadQueue.push(memories[activeIndex - 1].imageUrl);
    }
    if (activeIndex < memories.length - 1) {
      preloadQueue.push(memories[activeIndex + 1].imageUrl);
    }

    // Priority 3: Images 2 steps away
    if (activeIndex > 1) {
      preloadQueue.push(memories[activeIndex - 2].imageUrl);
    }
    if (activeIndex < memories.length - 2) {
      preloadQueue.push(memories[activeIndex + 2].imageUrl);
    }

    // Priority 4: All remaining images
    memories.forEach((memory) => {
      if (!preloadQueue.includes(memory.imageUrl)) {
        preloadQueue.push(memory.imageUrl);
      }
    });

    // Start preloading in sequence with slight delays for background loading
    const loadSequentially = async () => {
      // Load first 3 (active + adjacent) immediately
      const immediateLoads = preloadQueue.slice(0, 3).map((url) => preloadImage(url));
      await Promise.allSettled(immediateLoads);

      // Load next 2 (2 steps away) with slight delay
      if (preloadQueue.length > 3) {
        setTimeout(async () => {
          const nearLoads = preloadQueue.slice(3, 5).map((url) => preloadImage(url));
          await Promise.allSettled(nearLoads);
        }, 100);
      }

      // Load remaining images gradually in background
      if (preloadQueue.length > 5) {
        setTimeout(async () => {
          for (let i = 5; i < preloadQueue.length; i++) {
            await preloadImage(preloadQueue[i]);
            // Small delay between background loads to avoid blocking
            if (i < preloadQueue.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 50));
            }
          }
        }, 300);
      }
    };

    loadSequentially();
  }, [memories, activeMemoryId]);

  return {
    isImageLoaded,
    preloadImage,
    loadedCount: loadedImages.size,
  };
}

