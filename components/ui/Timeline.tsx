'use client';

import { useRef, useEffect } from 'react';
import { Memory } from '@/store/memoryStore';

interface TimelineProps {
  memories: Memory[];
  activeMemoryId: string | null;
  onChange: (id: string) => void;
  onMemoryHover?: (imageUrl: string) => void;
}

export default function Timeline({ memories, activeMemoryId, onChange, onMemoryHover }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to active item
  useEffect(() => {
    if (!containerRef.current || !activeMemoryId || memories.length === 0) return;
    
    const index = memories.findIndex(m => m.id === activeMemoryId);
    if (index === -1) return;

    const itemWidth = 140; // Increased width for better spacing
    const scrollLeft = index * itemWidth;
    
    containerRef.current.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
  }, [activeMemoryId, memories]);

  return (
    <div className="relative w-full h-20 mt-auto">
      {/* Gradient masks for edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      {/* Scroll Container */}
      <div 
        ref={containerRef}
        className="absolute inset-0 overflow-x-auto flex items-end scrollbar-hide snap-x snap-mandatory px-[calc(50%-70px)]" // 70px is half of itemWidth
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none' 
        }}
      >
        <div className="flex items-end h-full">
          {memories.map((memory) => {
            const isActive = memory.id === activeMemoryId;
            const date = new Date(memory.date);
            const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            return (
              <div
                key={memory.id}
                onClick={() => onChange(memory.id)}
                onMouseEnter={() => onMemoryHover?.(memory.imageUrl)}
                className="group relative flex flex-col items-center justify-end snap-center cursor-pointer transition-all duration-500"
                style={{ 
                  width: '140px',
                  height: '100%',
                  paddingBottom: '8px'
                }}
              >
                {/* Month Day Label */}
                <div className={`mb-auto mt-1 transition-all duration-500 ${
                  isActive ? 'opacity-100 transform scale-110 text-white font-medium' : 'opacity-30 scale-90 text-white/70 group-hover:opacity-70'
                }`}>
                  <span className="text-xs tracking-widest">
                    {monthDay}
                  </span>
                </div>

                {/* Icon/Indicator */}
                <div className={`mb-1 transition-all duration-500 flex items-center justify-center ${
                  isActive ? 'scale-110 opacity-100' : 'scale-75 opacity-40'
                }`}>
                  <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    isActive ? 'bg-white shadow-lg shadow-white/50' : 'border border-white/50 bg-black'
                  }`} />
                </div>

                {/* Title Container - Fixed height to prevent layout shift */}
                <div className="h-5 flex items-center justify-center w-full px-2">
                  <p className={`text-white text-xs font-light tracking-wide truncate transition-all duration-500 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}>
                    {memory.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
