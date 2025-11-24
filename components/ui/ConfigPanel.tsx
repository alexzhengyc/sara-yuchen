'use client';

import { motion } from 'framer-motion';
import { useConfigStore, defaultConfig } from '@/store/configStore';
import { RotateCcw, X } from 'lucide-react';

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigPanel({ isOpen, onClose }: ConfigPanelProps) {
  const config = useConfigStore();
  
  const controls = [
    { label: 'Dispersion', key: 'dispersion', min: 0, max: 10, step: 0.1 },
    { label: 'Particle Size', key: 'particleSize', min: 0.1, max: 5, step: 0.1 },
    { label: 'Contrast', key: 'contrast', min: 0.5, max: 2, step: 0.1 },
    { label: 'Flow Speed', key: 'flowSpeed', min: 0, max: 5, step: 0.1 },
    { label: 'Flow Amplitude', key: 'flowAmplitude', min: 0, max: 2, step: 0.1 },
    { label: 'Depth Strength', key: 'depthStrength', min: 0, max: 2, step: 0.05 },
    // { label: 'Color Shift', key: 'colorShiftSpeed', min: 0, max: 5, step: 0.1 },
  ] as const;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? 0 : '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-80 bg-black/80 backdrop-blur-md border-l border-white/10 z-50 p-6 pt-24 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-sm font-light tracking-[0.2em] uppercase text-white/90">
          Configuration
        </h2>
        <div className="flex items-center space-x-4">
            <button 
                onClick={config.resetConfig}
                className="text-white/40 hover:text-white transition-colors"
                title="Reset"
            >
                <RotateCcw size={16} />
            </button>
            <button 
                onClick={onClose}
                className="text-white/40 hover:text-white transition-colors"
            >
                <X size={20} />
            </button>
        </div>
      </div>

      <div className="space-y-8">
        {controls.map((control) => (
          <div key={control.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest text-white/60">
                {control.label}
              </label>
              <span className="text-xs font-mono text-green-400/80">
                {config[control.key].toFixed(1)}
              </span>
            </div>
            
            <input
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={config[control.key]}
              onChange={(e) => config.setConfig(control.key, parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400 transition-all"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

