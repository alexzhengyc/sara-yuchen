'use client';

import { useState, useRef, useEffect } from 'react';
import Layout from '@/components/ui/Layout';
import UploadModal from '@/components/ui/UploadModal';
import HeartPopup from '@/components/ui/HeartPopup';
import { supabase } from '@/lib/supabaseClient';
import { useMemoryStore } from '@/store/memoryStore';
import { ChevronLeft, ChevronRight, Loader2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { memories, activeMemoryId, addMemory, updateMemory, setActiveMemory, loadMemories, removeMemory } = useMemoryStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isHeartPopupOpen, setIsHeartPopupOpen] = useState(true);

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
      setDirection(1);
      setActiveMemory(memories[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setActiveMemory(memories[currentIndex - 1].id);
    }
  };

  // Handle drag/swipe gestures
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    const threshold = 100; // minimum drag distance to trigger navigation
    
    if (info.offset.x > threshold) {
      // Dragged right -> go to previous
      handlePrev();
    } else if (info.offset.x < -threshold) {
      // Dragged left -> go to next
      handleNext();
    }
  };

  const handleUploadTrigger = () => {
    setModalMode('create');
    fileInputRef.current?.click();
  };

  const handleEditTrigger = () => {
    if (!activeMemory) return;
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!activeMemory) return;
    
    setIsModalOpen(false);
    setIsAnalyzing(true);

    try {
      // Delete from storage if needed
      // Note: You may want to delete the image from Supabase storage here
      // For now, we'll just remove from database
      await removeMemory(activeMemory.id);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Delete failed', error);
      setIsAnalyzing(false);
    }
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

      // Store the file and show modal
      setSelectedFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      setIsAnalyzing(false);
      setIsModalOpen(true);
    } catch (error) {
      console.error('File processing failed', error);
      setIsAnalyzing(false);
    }
  };

  const handleModalSubmit = async (data: { title: string; date: string; description: string }) => {
    setIsModalOpen(false);

    if (modalMode === 'edit') {
      // Edit mode - update existing memory
      if (!activeMemory) return;
      
      setIsAnalyzing(true);
      try {
        await updateMemory(activeMemory.id, {
          title: data.title,
          date: data.date,
          description: data.description,
        });
        setIsAnalyzing(false);
      } catch (error) {
        console.error('Update failed', error);
        setIsAnalyzing(false);
      }
    } else {
      // Create mode - upload new memory
      if (!selectedFile) return;

      setIsAnalyzing(true);
      try {
        // Upload to Supabase
        const filename = `uploads/${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const { error } = await supabase.storage
          .from('images')
          .upload(filename, selectedFile);

        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filename);

        // Create Memory with user-provided data and save to database
        await addMemory({
          imageUrl: publicUrl,
          title: data.title,
          description: data.description,
          date: data.date,
        });

        setIsAnalyzing(false);
        
        // Clean up
        setSelectedFile(null);
        URL.revokeObjectURL(imagePreview);
        setImagePreview('');
      } catch (error) {
        console.error('Upload failed', error);
        setIsAnalyzing(false);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview('');
    }
  };

  // Auto-scroll timeline to center active thumbnail
  useEffect(() => {
    if (timelineRef.current && memories.length > 1) {
      const timeline = timelineRef.current;
      const activeIndex = currentIndex;
      // Each thumbnail is approximately 64px (16 * 4) + 16px gap = 80px
      const thumbnailWidth = 80;
      const scrollPosition = activeIndex * thumbnailWidth - (timeline.clientWidth / 2) + (thumbnailWidth / 2);
      
      timeline.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [activeMemoryId, currentIndex, memories.length]);

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
    <Layout onUpload={handleUploadTrigger}>
      {/* Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Heart Popup */}
      <HeartPopup 
        isOpen={isHeartPopupOpen}
        onClose={() => setIsHeartPopupOpen(false)}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        onDelete={modalMode === 'edit' ? handleDelete : undefined}
        imagePreview={modalMode === 'create' ? imagePreview : activeMemory?.imageUrl}
        mode={modalMode}
        initialData={modalMode === 'edit' && activeMemory ? {
          title: activeMemory.title,
          date: activeMemory.date,
          description: activeMemory.description,
        } : undefined}
      />

      {/* Main Content Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait" custom={direction}>
          {activeMemory ? (
            <motion.div
              key={activeMemory.id}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 300 : -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -300 : 300 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="flex flex-col items-center justify-center max-w-7xl w-full"
            >
              {/* Date and Title above image */}
              <div className="text-center mb-6 relative group">
                <p className="text-xs text-white/50 mb-2 tracking-wider">
                  {new Date(activeMemory.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <h2 className="text-3xl md:text-4xl font-thin tracking-tight text-white">
                    {activeMemory.title}
                  </h2>
                  <button
                    onClick={handleEditTrigger}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-white/10 rounded-full"
                    aria-label="Edit memory"
                  >
                    <Edit2 className="w-5 h-5 text-white/70 hover:text-white" />
                  </button>
                </div>
              </div>

              {/* Main Image with Drag Support */}
              <motion.div 
                className="w-full flex justify-center mb-6 cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
              >
                <motion.img
                  src={activeMemory.imageUrl}
                  alt={activeMemory.title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="h-[60vh] w-auto object-contain pointer-events-none"
                />
              </motion.div>

              {/* Description below image */}
              <div className="text-center max-w-2xl mb-8">
                <p className="text-sm md:text-base text-white/70 font-light leading-relaxed">
                  {activeMemory.description}
                </p>
              </div>

              {/* Timeline Thumbnails */}
              {memories.length > 1 && (
                <div className="w-full max-w-6xl">
                  <div 
                    ref={timelineRef}
                    className="flex justify-center gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}
                  >
                    {memories.map((memory, index) => (
                      <motion.div
                        key={memory.id}
                        className={`shrink-0 cursor-pointer transition-all duration-300 ${
                          memory.id === activeMemory.id ? 'scale-110' : 'scale-100 opacity-60 hover:opacity-100'
                        }`}
                        onClick={() => {
                          setDirection(index > currentIndex ? 1 : -1);
                          setActiveMemory(memory.id);
                        }}
                        whileHover={{ scale: memory.id === activeMemory.id ? 1.1 : 1.05 }}
                      >
                        <div className="relative">
                          <img
                            src={memory.imageUrl}
                            alt={memory.title}
                            className={`h-16 w-16 object-cover rounded-lg ${
                              memory.id === activeMemory.id 
                                ? 'ring-2 ring-white shadow-lg shadow-white/20' 
                                : 'ring-1 ring-white/20'
                            }`}
                          />
                          <div className="mt-1 text-center">
                            <p className="text-xs text-white/50 truncate w-16">
                              {new Date(memory.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
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

      {/* UI Overlays */}
      <div className="absolute inset-0 pointer-events-none z-10">

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
    </Layout>
  );
}
