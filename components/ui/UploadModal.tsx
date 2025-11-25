'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; date: string; description: string }) => void;
  onDelete?: () => void;
  imagePreview?: string;
  mode?: 'create' | 'edit';
  initialData?: {
    title: string;
    date: string;
    description: string;
  };
}

export default function UploadModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  imagePreview,
  mode = 'create',
  initialData,
}: UploadModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setTitle(initialData.title);
      setDate(initialData.date);
      setDescription(initialData.description);
    }
  }, [mode, initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !date) {
      alert('Please fill in both title and date fields');
      return;
    }

    onSubmit({ title, date, description });
    
    // Reset form
    setTitle('');
    setDate('');
    setDescription('');
  };

  const handleCancel = () => {
    setTitle('');
    setDate('');
    setDescription('');
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete();
    }
    setShowDeleteConfirm(false);
    setTitle('');
    setDate('');
    setDescription('');
    onClose();
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={handleCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-black/90 border border-white/20 rounded-lg p-6 max-w-lg w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Modal Title */}
            <h3 className="text-xl font-light tracking-wider text-white mb-6">
              {mode === 'edit' ? 'Edit Memory Details' : 'Add Memory Details'}
            </h3>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-6">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title Input */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm text-white/70 mb-2 tracking-wider uppercase"
                >
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="Enter a title for this memory"
                  required
                />
              </div>

              {/* Date Input */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm text-white/70 mb-2 tracking-wider uppercase"
                >
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors [color-scheme:dark]"
                  required
                />
              </div>

              {/* Description Input */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm text-white/70 mb-2 tracking-wider uppercase"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors resize-none"
                  placeholder="Add a description to this memory"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                {mode === 'edit' && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-colors flex items-center gap-2"
                    title="Delete this memory"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded text-white/70 hover:text-white hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded text-white hover:bg-white/20 transition-colors"
                >
                  {mode === 'edit' ? 'Update Memory' : 'Save Memory'}
                </button>
              </div>
            </form>

            {/* Delete Confirmation Dialog */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-lg flex items-center justify-center p-6"
                  onClick={handleDeleteCancel}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-black/95 border border-red-500/30 rounded-lg p-6 max-w-sm w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <Trash2 className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-lg font-light text-white mb-2">
                          Delete Memory?
                        </h4>
                        <p className="text-sm text-white/70">
                          This action cannot be undone. The memory and its associated data will be permanently removed.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleDeleteCancel}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded text-white/70 hover:text-white hover:border-white/20 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteConfirm}
                        className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

