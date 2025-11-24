'use client';

import { Mic, X, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ControlsProps {
  onUpload?: () => void;
  onRecord?: () => void;
  onSave?: () => void;
  isRecording?: boolean;
}

export default function Controls({ onUpload, onRecord, isRecording = false }: ControlsProps) {
  return (
    <div className="fixed bottom-10 left-0 right-0 z-50 flex flex-col items-center justify-end pointer-events-none">
      
      {/* Mic Button (Central) */}
      <div className="pointer-events-auto mb-8">
        <button 
          onClick={onRecord}
          className={`relative flex items-center justify-center w-16 h-16 rounded-full border border-white/20 backdrop-blur-sm transition-all duration-500 ${isRecording ? 'bg-red-500/20 border-red-500/50' : 'bg-black/40 hover:bg-white/10'}`}
        >
          <Mic size={20} className={isRecording ? 'text-red-400' : 'text-white/80'} strokeWidth={1.5} />
          
          {/* Ripple effect when recording */}
          {isRecording && (
             <span className="absolute inset-0 rounded-full border border-red-500/30 animate-ping" />
          )}
        </button>
      </div>

      {/* Action Bar */}
      <div className="pointer-events-auto flex items-center space-x-4 mb-4">
        <div className="glass-panel rounded-full px-6 py-3 flex items-center space-x-6">
           <button onClick={onUpload} className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
              <ImageIcon size={16} />
              <span className="text-xs uppercase tracking-wider">Upload Memory</span>
           </button>
        </div>
      </div>

      <p className="text-white/40 text-[10px] uppercase tracking-widest">
        Upload an image to convert to memory
      </p>
    </div>
  );
}

