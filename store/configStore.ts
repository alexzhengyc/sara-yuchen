import { create } from 'zustand';

interface ConfigState {
  // Effect values
  dispersion: number;
  particleSize: number;
  contrast: number;
  flowSpeed: number;
  flowAmplitude: number;
  depthStrength: number;
  colorShiftSpeed: number;
  
  // Actions
  setConfig: (key: keyof Omit<ConfigState, 'setConfig' | 'resetConfig'>, value: number) => void;
  resetConfig: () => void;
}

export const defaultConfig = {
  dispersion: 1.5,
  particleSize: 2.0,
  contrast: 1.1,
  flowSpeed: 0.5,
  flowAmplitude: 0.5,
  depthStrength: 0.2, // Shader expects small float, UI might show 0-100
  colorShiftSpeed: 0.0,
};

export const useConfigStore = create<ConfigState>((set) => ({
  ...defaultConfig,
  setConfig: (key, value) => set({ [key]: value }),
  resetConfig: () => set(defaultConfig),
}));

