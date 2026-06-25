import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface Props { value: string; onChange(v: string): void; length?: number; error?: boolean; disabled?: boolean; }

export function OtpInput({ value, onChange, length = 6, error, disabled }: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  function setAt(i: number, d: string) {
    const n = digits.slice(); n[i] = d; onChange(n.join('').slice(0, length));
  }
  function handleChange(i: number, raw: string) {
    const d = raw.replace(/\D/g, '').slice(-1);
    if (!d) return;
    setAt(i, d);
    if (i < length - 1) refs.current[i + 1]?.focus();
  }
  function handleKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') { if (digits[i]) setAt(i, ''); else if (i > 0) { refs.current[i - 1]?.focus(); setAt(i - 1, ''); } }
    if (e.key === 'ArrowLeft'  && i > 0)          refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  }
  function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) { onChange(pasted); refs.current[Math.min(pasted.length, length - 1)]?.focus(); }
  }

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input key={i} ref={el => (refs.current[i] = el)} inputMode="numeric" maxLength={1}
          disabled={disabled} value={digits[i]}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onFocus={e => e.target.select()}
          className={cn(
            'h-14 w-full rounded-xl border text-center font-display text-2xl font-bold text-secondary outline-none transition focus:shadow-glow',
            error ? 'border-danger' : 'border-slate-200 focus:border-primary',
            disabled && 'opacity-60',
          )}
        />
      ))}
    </div>
  );
}
