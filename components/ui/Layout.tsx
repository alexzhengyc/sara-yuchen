'use client';

import Link from 'next/link';
import { Menu, Volume2 } from 'lucide-react';
import { useState } from 'react';
import ConfigPanel from './ConfigPanel';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white selection:bg-white/20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-lg font-light tracking-widest uppercase opacity-90">
            Sara & Yuchen's AI Garden
          </h1>
        </div>

        <nav className="hidden md:flex items-center space-x-8 pointer-events-auto">
          {['THE GARDEN', 'MEMORY', 'MUSIC', 'INFO'].map((item) => (
            <button
              key={item}
              className="text-xs tracking-[0.2em] uppercase opacity-60 hover:opacity-100 transition-opacity"
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="flex items-center space-x-6 pointer-events-auto">
          <button className="opacity-70 hover:opacity-100 transition-opacity">
            <Volume2 size={20} strokeWidth={1.5} />
          </button>
          <button 
            className={`opacity-70 hover:opacity-100 transition-opacity ${isConfigOpen ? 'text-green-400 opacity-100' : ''}`}
            onClick={() => setIsConfigOpen(!isConfigOpen)}
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full h-full">
        {children}
      </main>
      
      {/* Configuration Panel */}
      <ConfigPanel isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />

      {/* Global Gradient Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/60 z-40" />
    </div>
  );
}
