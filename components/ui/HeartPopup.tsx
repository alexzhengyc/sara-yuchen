'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeartPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HeartPopup({ isOpen, onClose }: HeartPopupProps) {
  const [daysCount, setDaysCount] = useState(0);

  useEffect(() => {
    // Calculate days from June 1, 2025
    const startDate = new Date('2025-06-01');
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysCount(diffDays);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Popup Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative pointer-events-auto glass-panel rounded-2xl px-8 py-12 md:px-16 md:py-16 max-w-md w-full text-center shadow-2xl">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white/70 hover:text-white" />
              </button>

              {/* Heart Icon with Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.2, 
                  duration: 0.6,
                  type: 'spring',
                  stiffness: 200
                }}
                className="mb-6"
              >
                <Heart 
                  className="w-20 h-20 md:w-24 md:h-24 mx-auto text-red-400 fill-red-400"
                  strokeWidth={1.5}
                />
              </motion.div>

              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <h2 className="text-2xl md:text-3xl font-light text-white mb-2 tracking-wide">
                  Together for
                </h2>
                <p className="text-5xl md:text-6xl font-thin text-white mb-2">
                  {daysCount}
                </p>
                <p className="text-xl md:text-2xl font-light text-white/80 tracking-wider">
                  {daysCount === 1 ? 'day' : 'days'}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

