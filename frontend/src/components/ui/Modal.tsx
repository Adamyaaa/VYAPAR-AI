import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, eyebrow, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="bg-surface rounded-lg border border-border-soft shadow-lg max-w-lg w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              {eyebrow && (
                <span className="inline-block text-[10.5px] font-bold uppercase tracking-wider text-indigo-ink bg-indigo-soft px-2 py-0.5 rounded-full mb-2">
                  {eyebrow}
                </span>
              )}
              <h3 className="text-lg font-semibold text-ink">{title}</h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1 rounded-md text-ink-faint hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo/40"
            >
              <X size={18} />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
