import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Candidate } from '@/types';
import { seedCandidates } from '@/lib/mockData';
import { delay } from '@/lib/utils';

export type NewCandidateInput = Omit<Candidate,'id'|'recruiterId'|'createdAt'|'status'> & { photo?: string };

interface Ctx {
  candidates: Candidate[];
  byRecruiter(id: string): Candidate[];
  getById(id: string): Candidate | undefined;
  add(recruiterId: string, data: NewCandidateInput): Promise<Candidate>;
  update(id: string, data: Partial<Candidate>): Promise<void>;
  remove(id: string): Promise<void>;
}
const ResourceContext = createContext<Ctx | null>(null);

export function ResourceProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates] = useState<Candidate[]>(seedCandidates);

  const value = useMemo<Ctx>(() => ({
    candidates,
    byRecruiter: id => candidates.filter(c => c.recruiterId === id),
    getById:     id => candidates.find(c => c.id === id),
    async add(recruiterId, data) {
      await delay(800);
      const { photo: dataPhoto, ...rest } = data;
      const c: Candidate = {
        id: `cand-${Math.random().toString(36).slice(2,8)}`,
        recruiterId,
        createdAt: new Date().toISOString(),
        status: 'Pending',
        photo: dataPhoto || `https://i.pravatar.cc/320?u=${Math.random()}`,
        ...rest,
      };
      setCandidates(p => [c, ...p]);
      return c;
    },
    async update(id, data) {
      await delay(700);
      setCandidates(p => p.map(c => c.id === id ? { ...c, ...data } : c));
    },
    async remove(id) {
      await delay(600);
      setCandidates(p => p.filter(c => c.id !== id));
    },
  }), [candidates]);

  return <ResourceContext.Provider value={value}>{children}</ResourceContext.Provider>;
}

export function useResources() {
  const ctx = useContext(ResourceContext);
  if (!ctx) throw new Error('useResources outside provider');
  return ctx;
}
