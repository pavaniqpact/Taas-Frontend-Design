import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Demand tracking — module-level map so it persists across login/logout
 * within the same browser tab. This simulates a real backend.
 *
 * Map<candidateId, Map<userId, true>>
 * isInDemand(id, currentUserId) → true when ANY OTHER user has shortlisted it
 */

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

  const value = useMemo<DemandCtx>(() => ({
    tick,
    isInDemand(candidateId) {
      const users = _demandMap.get(candidateId);
      return !!users && users.size > 0;
    },
    isInDemandByOther(candidateId, currentUserId) {
      const users = _demandMap.get(candidateId);
      if (!users || users.size === 0) return false;
      // True only if someone OTHER than this user has it
      for (const uid of users) {
        if (uid !== currentUserId) return true;
      }
      return false;
    },
    addDemand: _addDemand,
    removeDemand: _removeDemand,
    clearUserDemand: _clearUserDemand,
  }), [tick]);

  return <DemandContext.Provider value={value}>{children}</DemandContext.Provider>;
}

export function useDemand() {
  const ctx = useContext(DemandContext);
  if (!ctx) throw new Error('useDemand must be used within DemandProvider');
  return ctx;
}
