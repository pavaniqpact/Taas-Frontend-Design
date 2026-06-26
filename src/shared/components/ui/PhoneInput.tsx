import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface Country { code: string; name: string; dial: string; flag: string; }

// Common countries — extend freely.
export const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States',  dial: '+1',   flag: '🇺🇸' },
  { code: 'CA', name: 'Canada',         dial: '+1',   flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', dial: '+44',  flag: '🇬🇧' },
  { code: 'IN', name: 'India',          dial: '+91',  flag: '🇮🇳' },
  { code: 'AU', name: 'Australia',      dial: '+61',  flag: '🇦🇺' },
  { code: 'DE', name: 'Germany',        dial: '+49',  flag: '🇩🇪' },
  { code: 'FR', name: 'France',         dial: '+33',  flag: '🇫🇷' },
  { code: 'ES', name: 'Spain',          dial: '+34',  flag: '🇪🇸' },
  { code: 'IT', name: 'Italy',          dial: '+39',  flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands',    dial: '+31',  flag: '🇳🇱' },
  { code: 'AE', name: 'UAE',            dial: '+971', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore',      dial: '+65',  flag: '🇸🇬' },
  { code: 'JP', name: 'Japan',          dial: '+81',  flag: '🇯🇵' },
  { code: 'CN', name: 'China',          dial: '+86',  flag: '🇨🇳' },
  { code: 'BR', name: 'Brazil',         dial: '+55',  flag: '🇧🇷' },
  { code: 'ZA', name: 'South Africa',   dial: '+27',  flag: '🇿🇦' },
];

interface Props {
  label?: string;
  error?: string;
  hint?: ReactNode;
  id?: string;
  value?: string;                 // combined string, e.g. "+1 4155550142"
  onChange(value: string): void;
  onBlur?(): void;
  placeholder?: string;
  defaultCountry?: string;        // ISO code, default "US"
}

// Split a stored "+44 7700..." back into a country + national number.
function parse(value: string | undefined, fallback: Country) {
  if (value) {
    // Longest dial code first so "+1" doesn't shadow "+1..." style longer codes.
    const match = [...COUNTRIES]
      .sort((a, b) => b.dial.length - a.dial.length)
      .find(c => value.startsWith(c.dial));
    if (match) return { country: match, number: value.slice(match.dial.length).trim() };
  }
  return { country: fallback, number: '' };
}

export function PhoneInput({
  label, error, hint, id, value, onChange, onBlur,
  placeholder = '415 555 0142', defaultCountry = 'US',
}: Props) {
  const fallback = useMemo(
    () => COUNTRIES.find(c => c.code === defaultCountry) ?? COUNTRIES[0],
    [defaultCountry],
  );
  const initial = useMemo(() => parse(value, fallback), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [country, setCountry] = useState<Country>(initial.country);
  const [number, setNumber]   = useState(initial.number);

  const inputId = id || 'phone';

  function emit(c: Country, n: string) {
    onChange(n.trim() ? `${c.dial} ${n.trim()}` : '');
  }

  return (
    <div>
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <div className={cn('flex gap-2')}>
        <select
          aria-label="Country code"
          value={country.code}
          onChange={e => {
            const next = COUNTRIES.find(c => c.code === e.target.value) ?? fallback;
            setCountry(next);
            emit(next, number);
          }}
          onBlur={onBlur}
          className={cn('field w-28 shrink-0 cursor-pointer pr-2', error && 'field-error')}
        >
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.dial}
            </option>
          ))}
        </select>

        <input
          id={inputId}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={placeholder}
          value={number}
          onChange={e => {
            // allow digits, spaces, dashes, parens
            const cleaned = e.target.value.replace(/[^\d\s\-()]/g, '');
            setNumber(cleaned);
            emit(country, cleaned);
          }}
          onBlur={onBlur}
          aria-invalid={!!error}
          className={cn('field flex-1', error && 'field-error')}
        />
      </div>
      {hint  && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}