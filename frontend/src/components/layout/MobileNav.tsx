import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Avatar } from '../ui';
import { MOBILE_NAV_ITEMS } from './Sidebar';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  businessName: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({ open, onClose, businessName }) => {
  const location = useLocation();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="md:hidden fixed inset-0 bg-ink/40 backdrop-blur-sm z-40"
          onClick={onClose}
        >
          <motion.nav
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-64 h-full bg-surface flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-5 border-b border-border-soft">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-[linear-gradient(155deg,var(--color-indigo),var(--color-indigo-ink))] flex items-center justify-center font-bold text-white text-sm">
                  V
                </div>
                <span className="font-semibold text-[14px] text-ink">Hisaab AI</span>
              </div>
              <button onClick={onClose} className="p-1 text-ink-faint hover:text-ink" aria-label="Close navigation">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {MOBILE_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium ${
                      isActive ? 'bg-indigo-soft text-indigo-ink' : 'text-ink-muted hover:bg-surface-2'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-border-soft flex items-center gap-3">
              <Avatar name={businessName} size={36} />
              <div>
                <p className="text-[13px] font-semibold text-ink m-0">{businessName}</p>
                <p className="text-[11px] text-ink-faint m-0">Owner account</p>
              </div>
            </div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
