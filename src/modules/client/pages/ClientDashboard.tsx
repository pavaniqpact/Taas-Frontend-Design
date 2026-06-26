import { useMemo, useState } from 'react';
import { FiFilter, FiX, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Topbar } from '@/shared/components/layout/Topbar';
import { useShell } from '@/shared/components/layout/AppShell';
import { PageTransition } from '@/shared/components/layout/PageTransition';
import { CandidateCard } from '@/shared/components/ui/CandidateCard';
import { Pagination } from '@/shared/components/ui/Pagination';
import { Button } from '@/shared/components/ui/Button';
import { useResources } from '@/store/resources';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';
import { useDemand } from '@/store/demand';
import { useAuth } from '@/store/auth';
import { TECHNOLOGIES, SKILLS_BY_TECH, PAGE_SIZE } from '@/constants';
import type { Candidate } from '@/types';
import { cn } from '@/lib/utils';

const ALL_SKILLS = [...new Set(Object.values(SKILLS_BY_TECH).flat())].sort();

export function ClientDashboard() {
  const { openMenu }              = useShell();
  const { candidates }            = useResources();
  const { add, has, ids }         = useCart();   // ids = Set<string> of shortlisted IDs
  const { user }                  = useAuth();
  const { addDemand, isInDemand } = useDemand();
  const { push }                  = useToast();

  const [search, setSearch]   = useState('');
  const [tech, setTech]       = useState('All');
  const [skill, setSkill]     = useState('All');
  const [minExp, setMinExp]   = useState(0);
  const [maxRate, setMaxRate] = useState(150);
  const [page, setPage]       = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const resetFilters = () => {
    setSearch(''); setTech('All'); setSkill('All');
    setMinExp(0); setMaxRate(150); setPage(1);
  };
  const activeFilters =
    (tech !== 'All' ? 1 : 0) + (skill !== 'All' ? 1 : 0) +
    (minExp > 0 ? 1 : 0) + (maxRate < 150 ? 1 : 0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return candidates.filter(c => {
      // ── KEY: hide candidates this client has already shortlisted ──
      if (ids.has(c.id)) return false;

      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.technology.toLowerCase().includes(q) ||
        c.skills.some(s => s.toLowerCase().includes(q));

      return (
        matchQ &&
        (tech === 'All' || c.technology === tech) &&
        (skill === 'All' || c.skills.includes(skill)) &&
        c.experience >= minExp &&
        c.ratePerHour <= maxRate
      );
    });
  }, [candidates, search, tech, skill, minExp, maxRate, ids]);
  // `ids` is a new Set reference whenever the cart changes → correctly triggers re-filter

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safe       = Math.min(page, totalPages);
  const pageItems  = filtered.slice((safe - 1) * PAGE_SIZE, safe * PAGE_SIZE);

  function handleAdd(c: Candidate) {
    if (!user) return;
    add(c);
    addDemand(c.id, user.id);
    push({ type: 'success', title: 'Added to shortlist', description: `${c.name} added.` });
    // Candidate immediately disappears from this client's pool (filtered by ids)
  }

  return (
    <>
      {/* Same as super admin: no search prop -> cart + bell + profile on the right */}
      <Topbar onMenu={openMenu} />
      <main className="page">
        <PageTransition>
          {/* Header */}
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-secondary">Talent pool</h1>
              <p className="mt-1 text-sm text-slate-500">
                {filtered.length} profiles available · {ids.size} in your shortlist
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setFilterOpen(v => !v)}>
              <FiFilter size={14} /> Filters
              {activeFilters > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">
                  {activeFilters}
                </span>
              )}
            </Button>
          </div>

          {/* Search moved into the page body (super-admin style) */}
          <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
            <div className="relative max-w-md">
              <FiSearch size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, skill or technology…" className="field pl-9 pr-8"/>
              {search && <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"><FiX size={13}/></button>}
            </div>
          </div>

          {/* Filter panel (collapsible) */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="label">Technology</label>
                      <select className="field" value={tech}
                        onChange={e => { setTech(e.target.value); setPage(1); }}>
                        <option value="All">All technologies</option>
                        {TECHNOLOGIES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Skill</label>
                      <select className="field" value={skill}
                        onChange={e => { setSkill(e.target.value); setPage(1); }}>
                        <option value="All">All skills</option>
                        {ALL_SKILLS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">
                        Min experience: <span className="font-bold text-primary">{minExp} yrs</span>
                      </label>
                      <input type="range" min={0} max={14} value={minExp}
                        onChange={e => { setMinExp(+e.target.value); setPage(1); }}
                        className="w-full mt-2" style={{ accentColor: '#2563EB' }} />
                    </div>
                    <div>
                      <label className="label">
                        Max rate: <span className="font-bold text-primary">${maxRate}/hr</span>
                      </label>
                      <input type="range" min={25} max={150} value={maxRate}
                        onChange={e => { setMaxRate(+e.target.value); setPage(1); }}
                        className="w-full mt-2" style={{ accentColor: '#2563EB' }} />
                    </div>
                  </div>
                  {activeFilters > 0 && (
                    <div className="mt-4 flex justify-end">
                      <Button variant="ghost" size="sm" onClick={resetFilters}>
                        <FiX size={13} /> Clear filters
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <p className="mb-4 text-sm text-slate-500">
            <span className="font-semibold text-secondary">{filtered.length}</span> profiles available
          </p>

          {pageItems.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 py-20 text-center">
              <p className="font-display text-lg font-bold text-secondary">No profiles match</p>
              <p className="mt-1 text-sm text-slate-500">
                {ids.size > 0
                  ? 'You may have shortlisted all matching candidates.'
                  : 'Try adjusting your filters.'}
              </p>
              {activeFilters > 0 && (
                <Button variant="outline" className="mt-4" onClick={resetFilters}>Clear filters</Button>
              )}
            </div>
          ) : (
            <div className={cn('grid gap-4', 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4')}>
              {pageItems.map((c, i) => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  inCart={has(c.id)}
                  onAdd={handleAdd}
                  index={i}
                  inDemand={isInDemand(c.id)}
                  docMode="client"
                />
              ))}
            </div>
          )}

          <Pagination
            page={safe}
            totalPages={totalPages}
            onPrev={() => setPage(p => p - 1)}
            onNext={() => setPage(p => p + 1)}
            onPage={p => setPage(p)}
          />
        </PageTransition>
      </main>
    </>
  );
}