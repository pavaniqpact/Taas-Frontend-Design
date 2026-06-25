import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Candidate } from '@/types';

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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Candidate[]>([]);
  const value = useMemo<Ctx>(() => {
    const ids = new Set(items.map(i => i.id));
    return {
      items, ids, count: items.length,
      has: id => ids.has(id),
      add: c  => setItems(p => ids.has(c.id) ? p : [...p, c]),
      remove: id => setItems(p => p.filter(i => i.id !== id)),
      clear: () => setItems([]),
    };
  }, [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart outside provider');
  return ctx;
}
