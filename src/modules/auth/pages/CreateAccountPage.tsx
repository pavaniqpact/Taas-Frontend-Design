import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { registerSchema, type RegisterValues, passwordStrength } from '@/lib/validation';
import { useAuth } from '@/store/auth';
import { useToast } from '@/store/toast';
import { Input, PasswordInput } from '@/shared/components/ui/Input';
import { PhoneInput } from '@/shared/components/ui/PhoneInput';
import { Button } from '@/shared/components/ui/Button';
import { Logo } from '@/shared/components/ui/Logo';
import { OtpModal } from '@/modules/auth/components/OtpModal';
import { cn } from '@/lib/utils';

const STRENGTH_COLORS = ['#E2E8F0','#EF4444','#F59E0B','#2563EB','#10B981'];

export function CreateAccountPage() {
  const { register: reg } = useAuth();
  const { push }          = useToast();
  const navigate          = useNavigate();
  const [otpOpen, setOtpOpen] = useState(false);
  const [email, setEmail]     = useState('');

  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } =
    useForm<RegisterValues>({ resolver: zodResolver(registerSchema), mode: 'onChange' });

  const pw = watch('password') || '';
  const strength = passwordStrength(pw);

  async function onSubmit(v: RegisterValues) {
    try {
      await reg({ companyName:v.companyName, firstName:v.firstName, lastName:v.lastName,
        designation:v.designation, email:v.email, phone:v.phone, password:v.password });
      setEmail(v.email);
      setOtpOpen(true);
    } catch (e) {
      push({ type:'error', title:'Registration failed', description:(e as Error).message });
    }
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-secondary">
            <FiArrowLeft size={15}/> Back to login
          </Link>
        </div>

        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.4 }}
          className="card p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-secondary">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Set up a client account to browse and shortlist pre-vetted talent.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 sm:grid-cols-2" noValidate>
            <div className="sm:col-span-2">
              <Input label="Company name" placeholder="Acme Corp" error={errors.companyName?.message} {...register('companyName')} />
            </div>
            <Input label="First name"  placeholder="Jordan"     error={errors.firstName?.message}  {...register('firstName')} />
            <Input label="Last name"   placeholder="Hale"       error={errors.lastName?.message}   {...register('lastName')} />
            <Input label="Designation" placeholder="VP Engineering" error={errors.designation?.message} {...register('designation')} />

            {/* Phone with country-code dropdown */}
            <Controller
              name="phone"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <PhoneInput
                  label="Phone"
                  id="phone"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.phone?.message}
                  defaultCountry="US"
                />
              )}
            />

            {/* ── Changed from "Work email" to "Official Email" ── */}
            <Input label="Official Email" type="email" placeholder="you@company.com" error={errors.email?.message} {...register('email')} />

            <div>
              <PasswordInput label="Password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
              {pw && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0,1,2,3].map(i => (
                      <span key={i} className="h-1.5 flex-1 rounded-full transition-colors"
                        style={{ backgroundColor: i < strength.score ? STRENGTH_COLORS[strength.score] : '#E2E8F0' }} />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Strength: <span className="font-medium text-secondary">{strength.label}</span>
                  </p>
                </div>
              )}
            </div>
            <PasswordInput label="Confirm password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

            <div className={cn('mt-2 flex gap-3 sm:col-span-2')}>
              <Link to="/login" className="flex-1">
                <Button type="button" variant="outline" fullWidth size="lg">Back to login</Button>
              </Link>
              <Button type="submit" size="lg" loading={isSubmitting} className="flex-1">
                {isSubmitting ? 'Creating…' : 'Create account'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>

      <OtpModal open={otpOpen} email={email} onClose={() => setOtpOpen(false)} onVerified={() => navigate('/login')} />
    </div>
  );
}