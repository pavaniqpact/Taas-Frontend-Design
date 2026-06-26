import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowRight, FiCheckCircle, FiShield, FiZap } from 'react-icons/fi';
import { loginSchema, type LoginValues } from '@/lib/validation';
import { useAuth } from '@/store/auth';
import { useToast } from '@/store/toast';
import { Input, PasswordInput } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Logo } from '@/shared/components/ui/Logo';
import { DEMO_CREDENTIALS } from '@/constants';
import type { Role } from '@/types';
import { cn } from '@/lib/utils';

const ROLES: { role: Role; label: string }[] = [
  { role: 'client',    label: 'Client'    },
  { role: 'recruiter', label: 'Recruiter' },
  { role: 'admin',     label: 'Admin'     },
];

export function LoginPage() {
  const { login, user } = useAuth();
  const { push }        = useToast();
  const navigate        = useNavigate();
  const [role, setRole] = useState<Role>('client');
  const [formErr, setFormErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const dest =
      user.role === 'client'    ? '/client'            :
      user.role === 'recruiter' ? '/recruiter'         : '/admin/recruiters';
    navigate(dest, { replace: true });
  }, [user, navigate]);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm<LoginValues>({ resolver: zodResolver(loginSchema), mode: 'onChange' });

  async function onSubmit(v: LoginValues) {
    setFormErr(null);
    try {
      const u = await login(v.email, v.password, role);
      push({ type: 'success', title: 'Login successful', description: `Welcome back, ${u.firstName}!` });
    } catch (e) {
      setFormErr((e as Error).message);
      push({ type: 'error', title: 'Login failed', description: (e as Error).message });
    }
  }

  function fillDemo() {
    const c = DEMO_CREDENTIALS[role as keyof typeof DEMO_CREDENTIALS];
    if (!c) return;
    setValue('email', c.email, { shouldValidate: true });
    setValue('password', c.password, { shouldValidate: true });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Left brand panel ── */}
      <div className="relative hidden overflow-hidden bg-secondary lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(600px 300px at 20% 10%,rgba(37,99,235,0.6),transparent),radial-gradient(500px 300px at 90% 90%,rgba(6,182,212,0.5),transparent)' }} />
        <div className="relative z-10 flex h-full flex-col p-12 text-white">
          <Logo light />
          <div className="my-auto max-w-md">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />Talent as a Service
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-tight">
              Hire pre-vetted AI engineers from India — ready to start.
            </h1>
            <p className="mt-4 text-white/70 leading-relaxed">
              Browse a live pool of evaluated, background-verified specialists. Shortlist in minutes,
              talk to sales, and onboard without the screening overhead.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                [FiCheckCircle, 'Every profile clears a technical evaluation'],
                [FiShield,      'Background-verified before you see them'],
                [FiZap,         'Resume, evaluation & BG reports on demand'],
              ].map(([I, t]: any) => (
                <li key={t} className="flex items-center gap-3 text-white/80">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-accent shrink-0"><I size={15} /></span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <p className="relative text-xs text-white/40">© {new Date().getFullYear()} Qpact. Pre-vetted talent, ready to deploy.</p>
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-surface">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }} className="w-full max-w-md">

          <div className="mb-8 lg:hidden"><Logo /></div>
          <h2 className="font-display text-2xl font-bold text-secondary">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Log in to access your dashboard.</p>

          {/* Role pills */}
          <div className="mt-6 grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1">
            {ROLES.map(r => (
              <button key={r.role} type="button" onClick={() => setRole(r.role)}
                className={cn('relative rounded-xl py-2 text-sm font-semibold capitalize transition',
                  role === r.role ? 'text-primary' : 'text-slate-500 hover:text-secondary')}>
                {role === r.role && (
                  <motion.span layoutId="role-pill"
                    className="absolute inset-0 rounded-xl bg-white shadow-card"
                    transition={{ type: 'spring', stiffness: 360, damping: 30 }} />
                )}
                <span className="relative">{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <Input label="Email" type="email" placeholder="you@company.com" icon={<FiMail />}
              error={errors.email?.message} {...register('email')} />
            <PasswordInput label="Password" placeholder="••••••••"
              error={errors.password?.message} {...register('password')} />

            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={fillDemo}
                className="font-medium text-primary hover:underline">
                Use demo {role}
              </button>
              <Link to="/forgot-password" className="font-medium text-slate-500 hover:text-secondary">
                Forgot password?
              </Link>
            </div>

            {formErr && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
                {formErr}
              </motion.div>
            )}

            <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Log in'} {!isSubmitting && <FiArrowRight />}
            </Button>
          </form>

          {/* ── Only clients can self-register ── */}
          {role === 'client' && (
            <p className="mt-6 text-center text-sm text-slate-500">
              New to Qpact?{' '}
              <Link to="/create-account" className="font-semibold text-primary hover:underline">
                Create an account
              </Link>
            </p>
          )}

        </motion.div>
      </div>
    </div>
  );
}