import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Demand tracking.
 *
 * Internally we keep  Map<candidateId, Set<userId>>  so we can correctly
 * add/remove per-user without losing demand from other users.
 *
 * isInDemand(id) → true when at least one user has the candidate shortlisted.
 */

interface DemandCtx {
  isInDemand(candidateId: string): boolean;
  addDemand(candidateId: string, userId: string): void;
  removeDemand(candidateId: string, userId: string): void;
  clearUserDemand(userId: string): void;
}

const DemandContext = createContext<DemandCtx | null>(null);

export function DemandProvider({ children }: { children: ReactNode }) {
  // candidateId → Set<userId>
  const [map, setMap] = useState<Map<string, Set<string>>>(new Map());

  const value = useMemo<DemandCtx>(
    () => ({
      isInDemand(candidateId) {
        const users = map.get(candidateId);
        return !!users && users.size > 0;
      },

      addDemand(candidateId, userId) {
        setMap(prev => {
          const next  = new Map(prev);
          const users = new Set(next.get(candidateId) ?? []);
          users.add(userId);
          next.set(candidateId, users);
          return next;
        });
      },

      removeDemand(candidateId, userId) {
        setMap(prev => {
          const next  = new Map(prev);
          const users = new Set(next.get(candidateId) ?? []);
          users.delete(userId);
          if (users.size === 0) next.delete(candidateId);
          else next.set(candidateId, users);
          return next;
        });
      },

      clearUserDemand(userId) {
        setMap(prev => {
          const next = new Map(prev);
          for (const [cid, users] of next) {
            const updated = new Set(users);
            updated.delete(userId);
            if (updated.size === 0) next.delete(cid);
            else next.set(cid, updated);
          }
          return next;
        });
      },
    }),
    [map],
  );

  return <DemandContext.Provider value={value}>{children}</DemandContext.Provider>;
}

export function useDemand() {
  const ctx = useContext(DemandContext);
  if (!ctx) throw new Error('useDemand must be used within DemandProvider');
  return ctx;
}
