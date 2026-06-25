import { cn } from '@/lib/utils';

export function Logo({ light, size = 'md', showText = true, className }:
  { light?: boolean; size?: 'sm'|'md'|'lg'; showText?: boolean; className?: string }) {
  const dims = { sm:'h-7 w-7 rounded-lg', md:'h-9 w-9 rounded-xl', lg:'h-12 w-12 rounded-2xl' };
  const text  = { sm:'text-base', md:'text-xl', lg:'text-2xl' };
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className={cn('relative grid place-items-center bg-gradient-to-br from-primary to-accent shrink-0', dims[size])}>
        <svg width="56%" height="56%" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" opacity="0.5" />
          <path d="M8.5 12.2l2.4 2.4 4.6-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {showText && (
        <span className={cn('font-display font-extrabold tracking-tight', text[size], light ? 'text-white' : 'text-secondary')}>
          Qpact
        </span>
      )}
    </div>
  );
}
