import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface Props {
  page: number; totalPages: number;
  onPrev(): void; onNext(): void; onPage(p: number): void;
}

export function Pagination({ page, totalPages, onPrev, onNext, onPage }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <button onClick={onPrev} disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-secondary-700 hover:border-primary hover:text-primary disabled:opacity-40 transition">
        <FiChevronLeft size={16} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPage(p)}
          className={cn('h-9 w-9 rounded-xl text-sm font-semibold transition',
            p === page ? 'bg-primary text-white' : 'text-secondary-700 hover:bg-slate-100')}>
          {p}
        </button>
      ))}
      <button onClick={onNext} disabled={page === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-secondary-700 hover:border-primary hover:text-primary disabled:opacity-40 transition">
        <FiChevronRight size={16} />
      </button>
    </div>
  );
}
