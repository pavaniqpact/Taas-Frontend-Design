import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertCircle, FiX } from 'react-icons/fi';
import { useToast, type ToastType } from '@/store/toast';

const icons: Record<ToastType, JSX.Element> = {
  success: <FiCheckCircle size={18} className="text-success shrink-0" />,
  error:   <FiXCircle     size={18} className="text-danger shrink-0" />,
  info:    <FiInfo        size={18} className="text-primary shrink-0" />,
  warning: <FiAlertCircle size={18} className="text-warning shrink-0" />,
};
const bars: Record<ToastType,string> = { success:'border-l-success', error:'border-l-danger', info:'border-l-primary', warning:'border-l-warning' };

export function ToastViewport() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[min(92vw,380px)] flex-col gap-2.5">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id} layout
            initial={{ opacity:0, x:50 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:50 }}
            transition={{ type:'spring', stiffness:340, damping:28 }}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border border-l-4 bg-white px-4 py-3 shadow-card-hover ${bars[t.type]}`}>
            {icons[t.type]}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-secondary">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs text-slate-500">{t.description}</p>}
            </div>
            <button onClick={() => dismiss(t.id)} className="mt-0.5 text-slate-300 hover:text-slate-500"><FiX size={15}/></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
