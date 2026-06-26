import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

// ── Global state (survives React re-renders and user switches) ───────────────
const _demandMap = new Map<string, Set<string>>();
let _listeners: (() => void)[] = [];
function _notify() { _listeners.forEach(fn => fn()); }

function _addDemand(candidateId: string, userId: string) {
  const users = _demandMap.get(candidateId) ?? new Set<string>();
  users.add(userId);
  _demandMap.set(candidateId, users);
  _notify();
}
function _removeDemand(candidateId: string, userId: string) {
  const users = _demandMap.get(candidateId);
  if (!users) return;
  users.delete(userId);
  if (users.size === 0) _demandMap.delete(candidateId);
  _notify();
}
function _clearUserDemand(userId: string) {
  for (const [cid, users] of _demandMap) {
    users.delete(userId);
    if (users.size === 0) _demandMap.delete(cid);
  }
  _notify();
}

// ─────────────────────────────────────────────────────────────────────────────

interface DemandCtx {
  /** True when at least one OTHER user (not currentUserId) has shortlisted this candidate */
  isInDemandByOther(candidateId: string, currentUserId: string): boolean;
  /** True when ANY user has shortlisted this candidate */
  isInDemand(candidateId: string): boolean;
  demandedByOthers(candidateId: string, userId: string): boolean;
  addDemand(candidateId: string, userId: string): void;
  removeDemand(candidateId: string, userId: string): void;
  clearUserDemand(userId: string): void;
  /** tick increments on every change — lets consumers re-render */
  tick: number;
}

const DemandContext = createContext<DemandCtx | null>(null);

export function DemandProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0);

  // Subscribe to global mutations
  useMemo(() => {
    const fn = () => setTick(t => t + 1);
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(l => l !== fn); };
  }, []);

  const value = useMemo<DemandCtx>(
    () => ({
      tick,

      isInDemand(candidateId) {
        return (_demandMap.get(candidateId)?.size ?? 0) > 0;
      },

      isInDemandByOther(candidateId, currentUserId) {
        const users = _demandMap.get(candidateId);
        if (!users) return false;
        for (const u of users) if (u !== currentUserId) return true;
        return false;
      },

      demandedByOthers(candidateId, userId) {
        const users = _demandMap.get(candidateId);
        if (!users) return false;
        for (const u of users) if (u !== userId) return true;
        return false;
      },

      addDemand(candidateId, userId) {
        _addDemand(candidateId, userId);
      },

      removeDemand(candidateId, userId) {
        _removeDemand(candidateId, userId);
      },

      clearUserDemand(userId) {
        _clearUserDemand(userId);
      },
    }),
    [tick],
  );

  return <DemandContext.Provider value={value}>{children}</DemandContext.Provider>;
}

export function useDemand() {
  const ctx = useContext(DemandContext);
  if (!ctx) throw new Error('useDemand must be used within DemandProvider');
  return ctx;
}