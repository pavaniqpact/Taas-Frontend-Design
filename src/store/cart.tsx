import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Candidate } from '@/types';
import { useAuth } from '@/store/auth';

interface Ctx {
  items: Candidate[];
  ids: Set<string>;
  count: number;
  has(id: string): boolean;
  add(c: Candidate): void;
  remove(id: string): void;
  clear(): void;
}
const CartContext = createContext<Ctx | null>(null);

const ANON = '__anon__';

export function CartProvider({ children }: { children: ReactNode }) {
  // AuthProvider sits ABOVE CartProvider in main.tsx, so this is safe.
  const { user } = useAuth();
  const uid = user?.id ?? ANON;

  // Each client keeps their OWN shortlist, keyed by user id.
  // Client A's shortlist never leaks into Client B's cart.
  const [byUser, setByUser] = useState<Record<string, Candidate[]>>({});

  const value = useMemo<Ctx>(() => {
    const items = byUser[uid] ?? [];
    const ids   = new Set(items.map(i => i.id));
    return {
      items,
      ids,
      count: items.length,
      has: id => ids.has(id),
      add: c => setByUser(prev => {
        const cur = prev[uid] ?? [];
        if (cur.some(i => i.id === c.id)) return prev;     // no duplicates
        return { ...prev, [uid]: [...cur, c] };
      }),
      remove: id => setByUser(prev => ({
        ...prev,
        [uid]: (prev[uid] ?? []).filter(i => i.id !== id),
      })),
      clear: () => setByUser(prev => ({ ...prev, [uid]: [] })),
    };
  }, [byUser, uid]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart outside provider');
  return ctx;
}