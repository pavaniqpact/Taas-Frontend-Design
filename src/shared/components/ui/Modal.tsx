import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

interface Props {
  open: boolean; onClose: () => void;
  title?: string; description?: string;
  children: ReactNode; size?: 'sm'|'md'|'lg'|'xl';
}

const sizes = { sm:'max-w-md', md:'max-w-lg', lg:'max-w-2xl', xl:'max-w-4xl' };

export function Modal({ open, onClose, title, description, children, size='md' }: Props) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <div className="absolute inset-0 bg-secondary/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div role="dialog" aria-modal="true"
            className={`relative w-full ${sizes[size]} overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100`}
            initial={{ opacity:0, y:20, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:10 }} transition={{ type:'spring', stiffness:320, damping:28 }}>
            {(title||description) && (
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
                <div>
                  {title && <h2 className="font-display text-lg font-bold text-secondary">{title}</h2>}
                  {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
                </div>
                <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close">
                  <FiX size={18} />
                </button>
              </div>
            )}
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
