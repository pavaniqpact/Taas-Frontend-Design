import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { OtpInput } from '@/shared/components/ui/OtpInput';
import { useAuth } from '@/store/auth';
import { useToast } from '@/store/toast';

interface Props { open: boolean; email: string; onVerified(): void; onClose(): void; }

export function OtpModal({ open, email, onVerified, onClose }: Props) {
  const { confirmOtp } = useAuth();
  const { push }       = useToast();
  const [code, setCode]     = useState('');
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);
  const [secs, setSecs]     = useState(30);

  useEffect(() => { if (open) { setCode(''); setError(null); setDone(false); setSecs(30); } }, [open]);
  useEffect(() => {
    if (!open || secs <= 0) return;
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [open, secs]);

  async function verify() {
    setError(null); setLoading(true);
    try {
      await confirmOtp(code);
      setDone(true);
      push({ type:'success', title:'Account created!', description:'Your email is verified. Please log in to continue.' });
      setTimeout(onVerified, 1100);
    } catch (e) {
      setError((e as Error).message);
      push({ type:'error', title:'Verification failed', description:(e as Error).message });
    } finally { setLoading(false); }
  }

  return (
    <Modal open={open} onClose={done ? () => {} : onClose}
      title={done ? undefined : 'Verify your email'}
      description={done ? undefined : `We sent a 6-digit code to ${email}`}>
      {done ? (
        <div className="flex flex-col items-center py-6 text-center">
          <motion.span initial={{ scale:0 }} animate={{ scale:1 }}
            transition={{ type:'spring', stiffness:280, damping:18 }}
            className="grid h-16 w-16 place-items-center rounded-full bg-success/10 text-success">
            <FiCheckCircle size={34} />
          </motion.span>
          <h3 className="mt-4 font-display text-lg font-bold text-secondary">You're all set!</h3>
          <p className="mt-1 text-sm text-slate-500">Taking you to login…</p>
        </div>
      ) : (
        <div>
          <div className="mb-5 flex justify-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary">
              <FiShield size={22}/>
            </span>
          </div>
          <OtpInput value={code} onChange={setCode} error={!!error} disabled={loading} />
          {error && <p className="mt-3 text-center text-sm text-danger">{error}</p>}
          <p className="mt-3 text-center text-xs text-slate-400">
            Demo: any 6 digits work. <span className="font-mono">000000</span> simulates failure.
          </p>
          <Button className="mt-5" fullWidth size="lg" onClick={verify} loading={loading} disabled={code.length !== 6}>
            {loading ? 'Verifying…' : 'Verify & continue'}
          </Button>
          <div className="mt-4 text-center text-sm text-slate-500">
            {secs > 0
              ? <span>Resend in 0:{secs.toString().padStart(2,'0')}</span>
              : <button onClick={() => { setSecs(30); setCode(''); push({ type:'info', title:'Code sent', description:`New code sent to ${email}.` }); }}
                  className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
                  <FiRefreshCw size={13}/> Resend code
                </button>
            }
          </div>
        </div>
      )}
    </Modal>
  );
}
