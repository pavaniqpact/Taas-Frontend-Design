import { AnimatePresence, motion } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';
import { Button } from './Button';

interface Props {
  open: boolean; title: string; message: string;
  confirmLabel?: string; tone?: 'danger'|'primary';
  loading?: boolean; onConfirm(): void; onCancel(): void;
}

export function ConfirmDialog({ open, title, message, confirmLabel='Confirm', tone='danger', loading, onConfirm, onCancel }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <div className="absolute inset-0 bg-secondary/40 backdrop-blur-sm" onClick={loading ? undefined : onCancel} />
          <motion.div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            initial={{ opacity:0, scale:0.94 }} animate={{ opacity:1, scale:1 }}
            exit={{ opacity:0 }} transition={{ type:'spring', stiffness:340, damping:26 }}>
            <div className={`mb-4 h-12 w-12 grid place-items-center rounded-xl ${tone==='danger'?'bg-danger/10 text-danger':'bg-primary/10 text-primary'}`}>
              <FiAlertTriangle size={22}/>
            </div>
            <h3 className="font-display text-lg font-bold text-secondary">{title}</h3>
            <p className="mt-1.5 text-sm text-slate-500">{message}</p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" fullWidth onClick={onCancel} disabled={loading}>Cancel</Button>
              <Button variant={tone==='danger'?'danger':'primary'} fullWidth onClick={onConfirm} loading={loading}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
