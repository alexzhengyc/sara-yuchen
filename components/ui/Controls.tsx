'use client';

import { Image as ImageIcon } from 'lucide-react';

interface ControlsProps {
  onUpload?: () => void;
}

export default function Controls({ onUpload }: ControlsProps) {
  return (
    <div className="fixed bottom-10 left-0 right-0 z-50 flex flex-col items-center justify-end pointer-events-none">
      {/* Action Bar */}
      <div className="pointer-events-auto flex items-center space-x-4 mb-4">
        <div className="glass-panel rounded-full px-6 py-3 flex items-center space-x-6">
           <button onClick={onUpload} className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
              <ImageIcon size={16} />
              <span className="text-xs uppercase tracking-wider">Upload Memory</span>
           </button>
        </div>
      </div>
    </div>
  );
}

