'use client';

import { useState, useRef, useEffect } from 'react';
import Layout from '@/components/ui/Layout';
import Controls from '@/components/ui/Controls';
import Scene from '@/components/canvas/Scene';
import ParticleImage from '@/components/canvas/ParticleImage';
import { supabase } from '@/lib/supabaseClient';
import { useMemoryStore } from '@/store/memoryStore';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { memories, activeMemoryId, addMemory, setActiveMemory, loadMemories } = useMemoryStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load memories from database on mount
  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  // Get active memory object
  const activeMemory = memories.find(m => m.id === activeMemoryId) || memories[0] || null;

  // Determine current index for navigation
  const currentIndex = memories.findIndex(m => m.id === activeMemory?.id);

  const handleNext = () => {
    if (currentIndex < memories.length - 1) {
      setActiveMemory(memories[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveMemory(memories[currentIndex - 1].id);
    }
  };

  const handleUploadTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);

    try {
      // Handle HEIC/HEIF conversion via server-side API
      const isHEIC = 
        file.type === 'image/heic' || 
        file.type === 'image/heif' || 
        file.name.toLowerCase().endsWith('.heic') || 
        file.name.toLowerCase().endsWith('.heif');

      if (isHEIC) {
        try {
          console.log('Starting HEIC conversion via server...');
          
          const convertFormData = new FormData();
          convertFormData.append('file', file);
          
          const convertResponse = await fetch('/api/convert-heic', {
            method: 'POST',
            body: convertFormData,
          });

          if (!convertResponse.ok) {
            throw new Error('Server-side conversion failed');
          }

          const jpegBlob = await convertResponse.blob();
          
          // Create a new File object with .jpg extension
          file = new File(
            [jpegBlob], 
            file.name.replace(/\.(heic|heif)$/i, '.jpg'), 
            { type: 'image/jpeg' }
          );
          
          console.log('HEIC conversion successful');
        } catch (err: unknown) {
          console.error('HEIC conversion failed:', err);
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          alert(`HEIC conversion failed: ${errorMessage}. Please try a different image format.`);
          setIsAnalyzing(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append('file', file);

      // Upload to Supabase
      const filename = `uploads/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { error } = await supabase.storage
        .from('images')
        .upload(filename, file);

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filename);

      // Create Memory with simple defaults and save to database
      await addMemory({
        imageUrl: publicUrl,
        title: 'Eternal Moment',
        description: 'A beautiful memory captured in time, preserved forever in the digital garden.',
      });

      setIsAnalyzing(false);
    } catch (error) {
      console.error('Upload failed', error);
      setIsAnalyzing(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, memories.length]);

  return (
    <Layout>
      {/* Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* 3D Background */}
      <Scene>
        {activeMemory ? (
          <ParticleImage key={activeMemory.id} imageUrl={activeMemory.imageUrl} />
        ) : (
            // Placeholder or Empty State visual could go here
            null
        )}
      </Scene>

      {/* UI Overlays */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10 p-6 pb-32">
        
        {/* Center/Top Info */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {activeMemory ? (
              <motion.div
                key={activeMemory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center max-w-md"
              >
                <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 mb-6 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-green-400 font-medium">Memory</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-thin tracking-tight mb-4 text-white text-glow">
                  {activeMemory.title}
                </h2>
                <p className="text-sm md:text-base text-white/70 font-light leading-relaxed glass-panel p-4 rounded-xl inline-block">
                  {activeMemory.description}
                </p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                 <h2 className="text-2xl font-thin tracking-widest text-white/50 mb-4">
                   THE GARDEN IS EMPTY
                 </h2>
                 <p className="text-white/30 text-xs tracking-wider uppercase">
                   Upload a photo to plant a memory
                 </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        {memories.length > 1 && (
            <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 pointer-events-auto -translate-y-1/2">
                <button 
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-full bg-black/20 backdrop-blur hover:bg-white/10 disabled:opacity-20 transition-all"
                >
                    <ChevronLeft className="text-white" />
                </button>
                <button 
                    onClick={handleNext}
                    disabled={currentIndex === memories.length - 1}
                    className="p-2 rounded-full bg-black/20 backdrop-blur hover:bg-white/10 disabled:opacity-20 transition-all"
                >
                    <ChevronRight className="text-white" />
                </button>
            </div>
        )}

      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          >
             <div className="text-center">
                <Loader2 className="w-10 h-10 text-green-400 animate-spin mx-auto mb-4" />
                <p className="text-green-400 text-xs tracking-[0.2em] uppercase animate-pulse">
                  Processing...
                </p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Controls onUpload={handleUploadTrigger} />
    </Layout>
  );
}
