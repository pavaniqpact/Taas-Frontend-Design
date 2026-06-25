import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMail, FiCheckCircle } from 'react-icons/fi';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Logo } from '@/shared/components/ui/Logo';
import { useToast } from '@/store/toast';
import { delay } from '@/lib/utils';

export function ForgotPasswordPage() {
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [sent,  setSent]  = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      push({ type:'error', title:'Enter a valid email' }); return;
    }
    setLoading(true);
    await delay(900);
    setLoading(false); setSent(true);
    push({ type:'success', title:'Reset link sent', description:`Check ${email}.` });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-surface px-4">
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        className="card w-full max-w-md p-8">
        <Logo />
        {sent
          ? <div className="mt-8 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success"><FiCheckCircle size={28}/></span>
              <h1 className="mt-4 font-display text-xl font-bold text-secondary">Check your inbox</h1>
              <p className="mt-1 text-sm text-slate-500">Reset instructions sent to {email}.</p>
              <Link to="/login"><Button variant="outline" className="mt-6">Back to login</Button></Link>
            </div>
          : <>
              <h1 className="mt-6 font-display text-xl font-bold text-secondary">Reset your password</h1>
              <p className="mt-1 text-sm text-slate-500">We'll send a reset link to your email.</p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <Input label="Email" type="email" icon={<FiMail/>} placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
                <Button type="submit" fullWidth size="lg" loading={loading}>{loading ? 'Sending…' : 'Send reset link'}</Button>
              </form>
              <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-secondary">
                <FiArrowLeft size={14}/> Back to login
              </Link>
            </>
        }
      </motion.div>
    </div>
  );
}
