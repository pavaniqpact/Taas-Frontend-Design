export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
export const formatRate = (r: number) => `$${r}/hr`;
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export const initials = (name: string) =>
  name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
export const delay = (ms = 800) => new Promise<void>(r => setTimeout(r, ms));
export const pick = (arr: unknown[], i: number) => arr[i % arr.length];
