import type { Availability, ResourceStatus } from '@/types';
import { cn } from '@/lib/utils';

export function AvailabilityBadge({ value }: { value: Availability }) {
  const map: Record<Availability, string> = {
    Available:     'bg-success/10 text-success',
    Engaged:       'bg-warning/10 text-amber-700',
    'Notice Period': 'bg-accent/10 text-accent',
  };
  const dot: Record<Availability, string> = {
    Available: 'bg-success', Engaged: 'bg-amber-500', 'Notice Period': 'bg-accent',
  };
  return <span className={cn('chip', map[value])}>
    <span className={cn('h-1.5 w-1.5 rounded-full', dot[value])} />{value}
  </span>;
}

export function StatusBadge({ value }: { value: ResourceStatus }) {
  return value === 'Active'
    ? <span className="chip bg-success/10 text-success">Active</span>
    : <span className="chip bg-warning/10 text-amber-700">Pending</span>;
}

export function SkillTag({ children }: { children: string }) {
  return <span className="chip bg-primary-50 text-primary-600">{children}</span>;
}

export function TechBadge({ children }: { children: string }) {
  return <span className="chip bg-slate-100 text-secondary-700 font-mono text-[11px]">{children}</span>;
}
