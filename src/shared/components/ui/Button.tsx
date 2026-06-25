import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';
import { cn } from '@/lib/utils';

type Variant = 'primary'|'secondary'|'ghost'|'danger'|'outline'|'success';
type Size    = 'xs'|'sm'|'md'|'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: Size; loading?: boolean; fullWidth?: boolean;
}

const V: Record<Variant,string> = {
  primary:   'bg-primary text-white hover:bg-primary-700 disabled:opacity-50',
  secondary: 'bg-secondary text-white hover:bg-secondary-800 disabled:opacity-50',
  ghost:     'bg-transparent text-secondary-700 hover:bg-slate-100 disabled:opacity-40',
  outline:   'bg-white border border-slate-200 text-secondary-700 hover:border-primary hover:text-primary disabled:opacity-50',
  danger:    'bg-danger text-white hover:bg-red-700 disabled:opacity-50',
  success:   'bg-success text-white hover:bg-emerald-700 disabled:opacity-50',
};
const S: Record<Size,string> = {
  xs: 'h-7 px-2.5 text-xs rounded-lg gap-1',
  sm: 'h-9 px-3 text-sm rounded-xl gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant='primary', size='md', loading, fullWidth, disabled, className, children, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileTap={{ scale: disabled||loading ? 1 : 0.97 }}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-colors duration-150 disabled:cursor-not-allowed select-none',
        V[variant], S[size], fullWidth && 'w-full', className,
      )}
      {...(props as any)}
    >
      {loading && <FiLoader className="animate-spin" />}
      {children}
    </motion.button>
  ),
);
Button.displayName = 'Button';
