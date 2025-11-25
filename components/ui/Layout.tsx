'use client';

import { Image as ImageIcon } from 'lucide-react';

export default function Layout({ 
  children, 
  onUpload 
}: { 
  children: React.ReactNode;
  onUpload?: () => void;
}) {

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white selection:bg-white/20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-lg font-light tracking-widest uppercase opacity-90">
            Sara & Yuchen's Secret Space
          </h1>
        </div>

        <div className="flex items-center space-x-6 pointer-events-auto">
          <button 
            onClick={onUpload}
            className="glass-panel rounded-full px-4 py-2 flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            aria-label="Upload picture"
          >
            <ImageIcon size={16} />
            <span className="text-xs uppercase tracking-wider">Upload Memory</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full h-full">
        {children}
      </main>

      {/* Global Gradient Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/60 z-40" />
    </div>
  );
}
