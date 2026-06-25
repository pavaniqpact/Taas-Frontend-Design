import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; icon?: ReactNode; hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, hint, className, id, ...props }, ref) => {
    const inputId = id || (props.name as string);
    return (
      <div>
        {label && <label htmlFor={inputId} className="label">{label}</label>}
        <div className="relative">
          {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">{icon}</span>}
          <input ref={ref} id={inputId}
            className={cn('field', icon ? 'pl-10' : '', error && 'field-error', className)}
            aria-invalid={!!error} {...props} />
        </div>
        {hint  && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        {error && <p className="mt-1 text-xs font-medium text-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps,'type'>>(
  ({ label, error, className, id, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const inputId = id || (props.name as string);
    return (
      <div>
        {label && <label htmlFor={inputId} className="label">{label}</label>}
        <div className="relative">
          <input ref={ref} id={inputId} type={show ? 'text' : 'password'}
            className={cn('field pr-11', error && 'field-error', className)}
            aria-invalid={!!error} {...props} />
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary"
            aria-label={show ? 'Hide' : 'Show'}>
            {show ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        {error && <p className="mt-1 text-xs font-medium text-danger">{error}</p>}
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';
